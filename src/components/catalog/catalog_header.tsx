"use client";

import { useCart } from "@/context/cart_context";

type CatalogHeaderProps = {
  onOpenAssistant: () => void;
};

function getProductWord(quantity: number) {
  const lastTwoDigits = quantity % 100;
  const lastDigit = quantity % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "товаров";
  }

  if (lastDigit === 1) {
    return "товар";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара";
  }

  return "товаров";
}

export function CatalogHeader({
  onOpenAssistant,
}: CatalogHeaderProps) {
  const { totalQuantity } = useCart();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div
        className="
          mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6
          sm:px-6
          lg:flex-row lg:items-center lg:justify-between lg:px-8
        "
      >
        <div>
          <p
            className="
              text-sm font-semibold uppercase tracking-[0.18em]
              text-emerald-700
            "
          >
            АвтоСнаб HoReCa
          </p>

          <h1
            className="
              mt-2 text-3xl font-bold tracking-tight text-slate-950
              sm:text-4xl
            "
          >
            Каталог продуктов
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Товары для ресторанов, кафе, пиццерий и других предприятий
            общественного питания.
          </p>
        </div>

        <div
          className="
            flex flex-col gap-3
            sm:flex-row sm:items-center
          "
        >
          <div
            aria-live="polite"
            className="
              rounded-xl border border-slate-200 bg-slate-50
              px-5 py-3 text-center font-semibold text-slate-900
            "
          >
            В корзине: {totalQuantity}{" "}
            {getProductWord(totalQuantity)}
          </div>

          <button
            type="button"
            onClick={onOpenAssistant}
            className="
              rounded-xl bg-emerald-600 px-5 py-3
              font-semibold text-white transition
              hover:bg-emerald-700
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-emerald-500
              focus-visible:ring-offset-2
            "
          >
            Открыть AI-помощника
          </button>
        </div>
      </div>
    </header>
  );
}
