"use client";

type QuantitySelectorProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
};

export function QuantitySelector({
  quantity,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const decreaseQuantity = () => {
    onChange(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    onChange(quantity + 1);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const parsedQuantity = Number.parseInt(event.target.value, 10);

    if (Number.isNaN(parsedQuantity)) {
      onChange(1);
      return;
    }

    onChange(Math.max(1, parsedQuantity));
  };

  return (
    <div
      className="flex items-center gap-2"
      aria-label="Выбор количества товара"
    >
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={disabled || quantity <= 1}
        aria-label="Уменьшить количество"
        className="
          flex h-10 w-10 items-center justify-center rounded-lg
          border border-slate-300 bg-white text-xl font-semibold
          text-slate-700 transition
          hover:border-emerald-500 hover:text-emerald-700
          disabled:cursor-not-allowed disabled:opacity-40
        "
      >
        −
      </button>

      <input
        type="number"
        min={1}
        step={1}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Количество"
        className="
          h-10 w-16 rounded-lg border border-slate-300
          bg-white px-2 text-center font-semibold text-slate-900
          outline-none transition
          focus:border-emerald-500 focus:ring-2
          focus:ring-emerald-100
          disabled:cursor-not-allowed disabled:opacity-50
        "
      />

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={disabled}
        aria-label="Увеличить количество"
        className="
          flex h-10 w-10 items-center justify-center rounded-lg
          border border-slate-300 bg-white text-xl font-semibold
          text-slate-700 transition
          hover:border-emerald-500 hover:text-emerald-700
          disabled:cursor-not-allowed disabled:opacity-40
        "
      >
        +
      </button>
    </div>
  );
}
