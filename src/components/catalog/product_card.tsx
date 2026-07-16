"use client";

import Image from "next/image";
import { useState } from "react";

import { type Product } from "@/types/product";

import { QuantitySelector } from "./quantity_selector";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
};

const priceFormatter = new Intl.NumberFormat("ru-RU");

export function ProductCard({
  product,
  onAdd,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const totalPrice = product.price * quantity;

  const handleAdd = () => {
    onAdd(product, quantity);
    setQuantity(1);
  };

  return (
    <article
      className="
        flex h-full flex-col overflow-hidden rounded-2xl
        border border-slate-200 bg-white shadow-sm
        transition duration-200 hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            25vw
          "
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-sm text-slate-500">
          Поставщик: {product.supplier}
        </p>

        <h2 className="text-xl font-bold text-slate-900">
          {product.name}
        </h2>

        <div className="mt-4">
          <span className="text-2xl font-bold text-emerald-700">
            {priceFormatter.format(product.price)} ₽
          </span>

          <span className="ml-1 text-sm text-slate-500">
            /{product.unit}
          </span>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-700">
            Количество, {product.unit}
          </p>

          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">
            Итоговая стоимость
          </span>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {priceFormatter.format(totalPrice)} ₽
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="
            mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3
            font-semibold text-white transition
            hover:bg-emerald-700
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
          "
        >
          Добавить
        </button>
      </div>
    </article>
  );
}
