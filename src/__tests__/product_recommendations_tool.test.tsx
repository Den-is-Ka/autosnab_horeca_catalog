import {
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ProductRecommendationsTool } from "@/components/copilot/product_recommendations_tool";
import {
  CartProvider,
  useCart,
} from "@/context/cart_context";

type Recommendation = {
  productId: number;
  quantity: number;
};

type ToolRenderArguments = {
  args: {
    recommendations?: Recommendation[];
  };
  status: string;
};

type FrontendToolDefinition = {
  name: string;
  handler: (args: {
    recommendations: Recommendation[];
  }) => Promise<string>;
  render: (argumentsValue: ToolRenderArguments) => ReactNode;
};

const { frontendTools, toolCallStatus } = vi.hoisted(() => ({
  frontendTools: new Map<
    string,
    FrontendToolDefinition
  >(),

  toolCallStatus: {
    InProgress: "in-progress",
    Complete: "complete",
  },
}));

vi.mock("@copilotkit/react-core/v2", () => ({
  ToolCallStatus: toolCallStatus,

  useFrontendTool: vi.fn(
    (tool: FrontendToolDefinition) => {
      frontendTools.set(tool.name, tool);
    },
  ),
}));

const recommendations: Recommendation[] = [
  {
    productId: 2,
    quantity: 4,
  },
  {
    productId: 6,
    quantity: 3,
  },
  {
    productId: 7,
    quantity: 5,
  },
  {
    productId: 5,
    quantity: 2,
  },
];

function CartSummary() {
  const { totalQuantity } = useCart();

  return (
    <p data-testid="cart-total">
      {totalQuantity}
    </p>
  );
}

function registerTool() {
  render(
    <CartProvider>
      <ProductRecommendationsTool />
    </CartProvider>,
  );

  const tool = frontendTools.get(
    "show_product_recommendations",
  );

  expect(tool).toBeDefined();

  return tool!;
}

function renderToolResult(
  tool: FrontendToolDefinition,
  status = toolCallStatus.Complete,
) {
  return render(
    <CartProvider>
      <CartSummary />

      {tool.render({
        args: {
          recommendations,
        },
        status,
      })}
    </CartProvider>,
  );
}

describe("ProductRecommendationsTool", () => {
  beforeEach(() => {
    frontendTools.clear();
    vi.clearAllMocks();
  });

  it("регистрирует инструмент рекомендаций", () => {
    registerTool();

    expect(
      Array.from(frontendTools.keys()),
    ).toEqual([
      "show_product_recommendations",
    ]);
  });

  it("рассчитывает результат вызова инструмента", async () => {
    const tool = registerTool();

    const result = await tool.handler({
      recommendations,
    });

    expect(JSON.parse(result)).toEqual({
      displayedProducts: 4,
      totalPrice: 4960,
    });
  });

  it("показывает состояние формирования подборки", () => {
    const tool = registerTool();

    renderToolResult(
      tool,
      toolCallStatus.InProgress,
    );

    expect(
      screen.getByText(
        "Формирую подборку товаров…",
      ),
    ).toBeInTheDocument();
  });

  it("показывает интерактивные карточки рекомендаций", () => {
    const tool = registerTool();

    renderToolResult(tool);

    const totalPriceText = screen.getByText(
      /Общая стоимость:/,
    );

    expect(totalPriceText).toHaveTextContent(
      /Общая стоимость:\s*4\s*960\s*Р/,
    );

    expect(
      screen.getByRole("heading", {
        name: "Филе куриное",
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
        name: "Сливки 33%",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Добавить в корзину",
      }),
    ).toHaveLength(4);
  });

  it("добавляет рекомендацию в общую корзину", async () => {
    const user = userEvent.setup();
    const tool = registerTool();

    renderToolResult(tool);

    const tomatoesHeading = screen.getByRole(
      "heading",
      {
        name: "Томаты",
      },
    );

    const tomatoesCard =
      tomatoesHeading.closest("article");

    expect(tomatoesCard).not.toBeNull();

    await user.click(
      within(tomatoesCard!).getByRole("button", {
        name: "Добавить в корзину",
      }),
    );

    expect(
      screen.getByTestId("cart-total"),
    ).toHaveTextContent("5");

    expect(
      screen.getByText(
        "«Томаты» добавлено из AI-чата: " +
          "5 кг. Сумма: 1 050 Р.",
      ),
    ).toBeInTheDocument();
  });
});