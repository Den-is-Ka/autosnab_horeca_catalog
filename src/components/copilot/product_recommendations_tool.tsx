"use client";

import {
  ToolCallStatus,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { useMemo, useState } from "react";
import { z } from "zod";

import { useCart } from "@/context/cart_context";
import productsData from "@/data/products.json";
import { type Product } from "@/types/product";

const recommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(3)
    .describe("Не менее трёх рекомендованных товаров"),
});

type Recommendation = z.infer<
  typeof recommendationSchema
>["recommendations"][number];

type RecommendationCardsProps = {
  recommendations: Recommendation[];
};

const products = productsData as Product[];
const priceFormatter = new Intl.NumberFormat("ru-RU");

function normalizeRecommendations(
  value: unknown,
): Recommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const productId = record.productId;
    const quantity = record.quantity;

    if (
      typeof productId !== "number" ||
      !Number.isInteger(productId) ||
      productId <= 0 ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return [];
    }

    return [{ productId, quantity }];
  });
}

function RecommendationCards({
  recommendations,
}: RecommendationCardsProps) {
  const { addProduct } = useCart();
  const [confirmation, setConfirmation] =
    useState<string | null>(null);

  const availableRecommendations = useMemo(
    () =>
      recommendations.flatMap((recommendation) => {
        const product = products.find(
          (item) => item.id === recommendation.productId,
        );

        if (!product) {
          return [];
        }

        return [
          {
            product,
            quantity: recommendation.quantity,
            totalPrice: product.price * recommendation.quantity,
          },
        ];
      }),
    [recommendations],
  );

  const recommendationTotal = availableRecommendations.reduce(
    (total, recommendation) =>
      total + recommendation.totalPrice,
    0,
  );

  if (availableRecommendations.length === 0) {
    return (
      <div
        className="
          rounded-xl border border-rose-200 bg-rose-50
          p-4 text-sm text-rose-800
        "
      >
        Не удалось сопоставить рекомендации с товарами каталога.
      </div>
    );
  }

  return (
    <section
      className="
        space-y-3 rounded-2xl border border-emerald-200
        bg-emerald-50/60 p-3
      "
    >
      <div>
        <p className="text-sm font-bold text-emerald-950">
          Подборка AI-помощника
        </p>

        <p className="mt-1 text-xs text-emerald-800">
          Общая стоимость:{" "}
          {priceFormatter.format(recommendationTotal)} Р
        </p>
      </div>

      <div className="space-y-3">
        {availableRecommendations.map(
          ({ product, quantity, totalPrice }) => (
            <article
              key={product.id}
              className="
                rounded-xl border border-slate-200
                bg-white p-3 shadow-sm
              "
            >
              <div
                className="
                  flex items-start justify-between gap-3
                "
              >
                <div className="min-w-0">
                  <h3
                    className="
                      font-bold leading-5 text-slate-950
                    "
                  >
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {priceFormatter.format(product.price)} Р
                    /{product.unit}
                  </p>
                </div>

                <p
                  className="
                    shrink-0 text-sm font-bold text-emerald-700
                  "
                >
                  {priceFormatter.format(totalPrice)} Р
                </p>
              </div>

              <p className="mt-3 text-sm text-slate-700">
                Количество:{" "}
                <strong>
                  {quantity} {product.unit}
                </strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  addProduct(product.id, quantity);

                  setConfirmation(
                    `«${product.name}» добавлено из AI-чата: ` +
                      `${quantity} ${product.unit}. ` +
                      `Сумма: ` +
                      `${priceFormatter.format(totalPrice)} Р.`,
                  );
                }}
                className="
                  mt-3 w-full rounded-lg bg-emerald-600
                  px-3 py-2 text-sm font-semibold text-white
                  transition hover:bg-emerald-700
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                "
              >
                Добавить в корзину
              </button>
            </article>
          ),
        )}
      </div>

      {confirmation && (
        <div
          role="status"
          aria-live="polite"
          className="
            rounded-xl border border-emerald-300
            bg-white px-3 py-2 text-sm font-medium
            text-emerald-900
          "
        >
          {confirmation}
        </div>
      )}
    </section>
  );
}

export function ProductRecommendationsTool() {
  useFrontendTool(
    {
      name: "show_product_recommendations",
      description:
        "Показывает внутри чата интерактивные карточки " +
        "рекомендованных товаров HoReCa.",
      parameters: recommendationSchema,

      handler: async ({ recommendations }) => {
        const totalPrice = recommendations.reduce(
          (total, recommendation) => {
            const product = products.find(
              (item) =>
                item.id === recommendation.productId,
            );

            return (
              total +
              (product?.price ?? 0) *
                recommendation.quantity
            );
          },
          0,
        );

        return JSON.stringify({
          displayedProducts: recommendations.length,
          totalPrice,
        });
      },

      render: ({ args, status }) => {
        if (status === ToolCallStatus.InProgress) {
          return (
            <div
              className="
                animate-pulse rounded-xl border
                border-slate-200 bg-slate-50 p-4
                text-sm text-slate-600
              "
            >
              Формирую подборку товаров…
            </div>
          );
        }

        return (
          <RecommendationCards
            recommendations={normalizeRecommendations(
              args.recommendations,
            )}
          />
        );
      },
    },
    [],
  );

  return null;
}
