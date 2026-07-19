import {
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  CartProvider,
  useCart,
} from "@/context/cart_context";

function CartHarness() {
  const {
    items,
    totalQuantity,
    addProduct,
    getProductQuantity,
    clearCart,
  } = useCart();

  return (
    <div>
      <p data-testid="total-quantity">
        {totalQuantity}
      </p>

      <p data-testid="product-1-quantity">
        {getProductQuantity(1)}
      </p>

      <p data-testid="product-2-quantity">
        {getProductQuantity(2)}
      </p>

      <pre data-testid="cart-items">
        {JSON.stringify(items)}
      </pre>

      <button
        type="button"
        onClick={() => addProduct(1, 2)}
      >
        Добавить товар 1 — 2 шт.
      </button>

      <button
        type="button"
        onClick={() => addProduct(1, 3)}
      >
        Добавить товар 1 — 3 шт.
      </button>

      <button
        type="button"
        onClick={() => addProduct(2, 4)}
      >
        Добавить товар 2 — 4 шт.
      </button>

      <button
        type="button"
        onClick={() => addProduct(1, 0)}
      >
        Добавить нулевое количество
      </button>

      <button
        type="button"
        onClick={() => addProduct(2, 2.9)}
      >
        Добавить дробное количество
      </button>

      <button
        type="button"
        onClick={clearCart}
      >
        Очистить корзину
      </button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartHarness />
    </CartProvider>,
  );
}

describe("CartContext", () => {
  it("создаёт пустую корзину", () => {
    renderCart();

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("0");

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("0");

    expect(
      screen.getByTestId("cart-items"),
    ).toHaveTextContent("[]");
  });

  it("добавляет новый товар", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 1 — 2 шт.",
      }),
    );

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("2");

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("2");

    expect(
      screen.getByTestId("cart-items"),
    ).toHaveTextContent(
      JSON.stringify([
        {
          productId: 1,
          quantity: 2,
        },
      ]),
    );
  });

  it("суммирует количество одинакового товара", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 1 — 2 шт.",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 1 — 3 шт.",
      }),
    );

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("5");

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("5");

    expect(
      screen.getByTestId("cart-items"),
    ).toHaveTextContent(
      JSON.stringify([
        {
          productId: 1,
          quantity: 5,
        },
      ]),
    );
  });

  it("хранит разные товары отдельными позициями", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 1 — 2 шт.",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 2 — 4 шт.",
      }),
    );

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("6");

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("2");

    expect(
      screen.getByTestId("product-2-quantity"),
    ).toHaveTextContent("4");

    expect(
      screen.getByTestId("cart-items"),
    ).toHaveTextContent(
      JSON.stringify([
        {
          productId: 1,
          quantity: 2,
        },
        {
          productId: 2,
          quantity: 4,
        },
      ]),
    );
  });

  it("заменяет неположительное количество на единицу", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить нулевое количество",
      }),
    );

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("1");

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("1");
  });

  it("округляет дробное количество вниз", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить дробное количество",
      }),
    );

    expect(
      screen.getByTestId("product-2-quantity"),
    ).toHaveTextContent("2");

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("2");
  });

  it("полностью очищает корзину", async () => {
    const user = userEvent.setup();

    renderCart();

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 1 — 2 шт.",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Добавить товар 2 — 4 шт.",
      }),
    );

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("6");

    await user.click(
      screen.getByRole("button", {
        name: "Очистить корзину",
      }),
    );

    expect(
      screen.getByTestId("total-quantity"),
    ).toHaveTextContent("0");

    expect(
      screen.getByTestId("product-1-quantity"),
    ).toHaveTextContent("0");

    expect(
      screen.getByTestId("product-2-quantity"),
    ).toHaveTextContent("0");

    expect(
      screen.getByTestId("cart-items"),
    ).toHaveTextContent("[]");
  });
});