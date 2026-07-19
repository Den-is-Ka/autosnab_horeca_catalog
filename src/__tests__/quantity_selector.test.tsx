import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { QuantitySelector } from "@/components/catalog/quantity_selector";

type QuantitySelectorHarnessProps = {
  initialQuantity?: number;
  disabled?: boolean;
  onQuantityChange?: (quantity: number) => void;
};

function QuantitySelectorHarness({
  initialQuantity = 1,
  disabled = false,
  onQuantityChange,
}: QuantitySelectorHarnessProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleChange = (nextQuantity: number) => {
    setQuantity(nextQuantity);
    onQuantityChange?.(nextQuantity);
  };

  return (
    <QuantitySelector
      quantity={quantity}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}

describe("QuantitySelector", () => {
  it("показывает начальное количество", () => {
    render(<QuantitySelectorHarness />);

    expect(
      screen.getByRole("spinbutton", {
        name: "Количество",
      }),
    ).toHaveValue(1);
  });

  it("увеличивает количество кнопкой плюс", async () => {
    const user = userEvent.setup();

    render(<QuantitySelectorHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    expect(
      screen.getByRole("spinbutton", {
        name: "Количество",
      }),
    ).toHaveValue(2);
  });

  it("уменьшает количество кнопкой минус", async () => {
    const user = userEvent.setup();

    render(
      <QuantitySelectorHarness initialQuantity={3} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Уменьшить количество",
      }),
    );

    expect(
      screen.getByRole("spinbutton", {
        name: "Количество",
      }),
    ).toHaveValue(2);
  });

  it("не позволяет уменьшить количество ниже единицы", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();

    render(
      <QuantitySelectorHarness
        initialQuantity={1}
        onQuantityChange={onQuantityChange}
      />,
    );

    const decreaseButton = screen.getByRole("button", {
      name: "Уменьшить количество",
    });

    expect(decreaseButton).toBeDisabled();

    await user.click(decreaseButton);

    expect(onQuantityChange).not.toHaveBeenCalled();

    expect(
      screen.getByRole("spinbutton", {
        name: "Количество",
      }),
    ).toHaveValue(1);
  });

  it("принимает количество, введённое вручную", () => {
    render(<QuantitySelectorHarness />);

    const input = screen.getByRole("spinbutton", {
      name: "Количество",
    });

    fireEvent.change(input, {
      target: {
        value: "5",
      },
    });

    expect(input).toHaveValue(5);
  });

  it("заменяет нулевое значение на единицу", () => {
    render(<QuantitySelectorHarness initialQuantity={3} />);

    const input = screen.getByRole("spinbutton", {
      name: "Количество",
    });

    fireEvent.change(input, {
      target: {
        value: "0",
      },
    });

    expect(input).toHaveValue(1);
  });

  it("блокирует все элементы управления", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();

    render(
      <QuantitySelectorHarness
        initialQuantity={2}
        disabled
        onQuantityChange={onQuantityChange}
      />,
    );

    const decreaseButton = screen.getByRole("button", {
      name: "Уменьшить количество",
    });

    const increaseButton = screen.getByRole("button", {
      name: "Увеличить количество",
    });

    const input = screen.getByRole("spinbutton", {
      name: "Количество",
    });

    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).toBeDisabled();
    expect(input).toBeDisabled();

    await user.click(increaseButton);

    expect(onQuantityChange).not.toHaveBeenCalled();
    expect(input).toHaveValue(2);
  });
});