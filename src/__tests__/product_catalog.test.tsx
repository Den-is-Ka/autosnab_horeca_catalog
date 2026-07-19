import {
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProductCatalog } from "@/components/catalog/product_catalog";
import {
  CartProvider,
  useCart,
} from "@/context/cart_context";

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    ...imageProps
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
  }) => <img {...imageProps} />,
}));

function CartSummary() {
  const { totalQuantity } = useCart();

  return (
    <p data-testid="cart-total">
      {totalQuantity}
    </p>
  );
}

function renderCatalog(
  props?: React.ComponentProps<typeof ProductCatalog>,
) {
  return render(
    <CartProvider>
      <CartSummary />
      <ProductCatalog {...props} />
    </CartProvider>,
  );
}

describe("ProductCatalog", () => {
  it("показывает восемь товаров из локального JSON", () => {
    renderCatalog();

    expect(
      screen.getByText("Найдено товаров: 8"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("article"),
    ).toHaveLength(8);

    expect(
      screen.getByRole("heading", {
        name: "Лапы куриные",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Филе куриное",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Голень куриная",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Крылья куриные",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Сливки 33%",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Сыр для пиццы",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Томаты",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Молоко",
      }),
    ).toBeInTheDocument();
  });

  it("показывает пустое состояние без товаров", () => {
    renderCatalog({
      products: [],
    });

    expect(
      screen.getByRole("heading", {
        name: "Товары не найдены",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "В каталоге пока нет доступных товаров.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryAllByRole("article"),
    ).toHaveLength(0);
  });

  it("добавляет выбранное количество в общую корзину", async () => {
    const user = userEvent.setup();
    const onProductAdded = vi.fn();

    renderCatalog({
      onProductAdded,
    });

    const productHeading = screen.getByRole("heading", {
      name: "Филе куриное",
    });

    const productCard = productHeading.closest("article");

    expect(productCard).not.toBeNull();

    const card = within(productCard!);

    const quantityInput = card.getByRole("spinbutton", {
      name: "Количество",
    });

    expect(quantityInput).toHaveValue(1);

    await user.click(
      card.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    await user.click(
      card.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    expect(quantityInput).toHaveValue(3);

    expect(
      card.getByText("1 050 ₽"),
    ).toBeInTheDocument();

    await user.click(
      card.getByRole("button", {
        name: "Добавить",
      }),
    );

    expect(
      screen.getByTestId("cart-total"),
    ).toHaveTextContent("3");

    expect(onProductAdded).toHaveBeenCalledTimes(1);

    expect(onProductAdded).toHaveBeenCalledWith({
      product: expect.objectContaining({
        id: 2,
        name: "Филе куриное",
        price: 350,
        unit: "кг",
      }),
      quantity: 3,
      totalPrice: 1050,
    });

    expect(quantityInput).toHaveValue(1);
  });

  it("суммирует добавления из разных карточек", async () => {
    const user = userEvent.setup();

    renderCatalog();

    const tomatoesCard = screen
      .getByRole("heading", {
        name: "Томаты",
      })
      .closest("article");

    const milkCard = screen
      .getByRole("heading", {
        name: "Молоко",
      })
      .closest("article");

    expect(tomatoesCard).not.toBeNull();
    expect(milkCard).not.toBeNull();

    const tomatoes = within(tomatoesCard!);
    const milk = within(milkCard!);

    await user.click(
      tomatoes.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    await user.click(
      tomatoes.getByRole("button", {
        name: "Добавить",
      }),
    );

    await user.click(
      milk.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    await user.click(
      milk.getByRole("button", {
        name: "Увеличить количество",
      }),
    );

    await user.click(
      milk.getByRole("button", {
        name: "Добавить",
      }),
    );

    expect(
      screen.getByTestId("cart-total"),
    ).toHaveTextContent("5");
  });
});