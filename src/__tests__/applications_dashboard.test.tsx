import {
  act,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationsDashboard } from "@/components/applications_dashboard";
import { initialApplications } from "@/data/applications";

type FrontendToolDefinition = {
  name: string;
  handler: (args: Record<string, unknown>) => Promise<string>;
};

const { frontendTools } = vi.hoisted(() => ({
  frontendTools: new Map<string, FrontendToolDefinition>(),
}));

vi.mock("@copilotkit/react-core/v2", () => ({
  useAgentContext: vi.fn(),

  useFrontendTool: vi.fn((tool: FrontendToolDefinition) => {
    frontendTools.set(tool.name, tool);
  }),
}));

describe("ApplicationsDashboard", () => {
  beforeEach(() => {
    frontendTools.clear();
    vi.clearAllMocks();
  });

  it("регистрирует AI-инструменты управления заявками", () => {
    render(<ApplicationsDashboard />);

    expect(Array.from(frontendTools.keys())).toEqual([
      "filterApplications",
      "selectApplication",
      "requestStatusChange",
    ]);
  });

  it("AI-инструмент filterApplications фильтрует заявки", async () => {
    const approvedApplications = initialApplications.filter(
      (application) => application.status === "approved",
    );

    expect(approvedApplications.length).toBeGreaterThan(0);

    render(<ApplicationsDashboard />);

    const filterTool = frontendTools.get("filterApplications");

    expect(filterTool).toBeDefined();

    let toolResult = "";

    await act(async () => {
      toolResult = await filterTool!.handler({
        status: "approved",
        query: "",
      });
    });

    const parsedResult = JSON.parse(toolResult) as {
      success: boolean;
      status: string;
      query: string;
      matchedCount: number;
      matchedApplicationIds: number[];
    };

    expect(parsedResult).toEqual({
      success: true,
      status: "approved",
      query: "",
      matchedCount: approvedApplications.length,
      matchedApplicationIds: approvedApplications.map(
        (application) => application.id,
      ),
    });

    const statusSelect = screen.getByRole("combobox", {
      name: "Фильтр по статусу",
    });

    expect(statusSelect).toHaveValue("approved");

    for (const application of initialApplications) {
      const applicationButton = screen.queryByRole("button", {
        name: new RegExp(`#${application.id}\\b`),
      });

      if (application.status === "approved") {
        expect(applicationButton).toBeInTheDocument();
      } else {
        expect(applicationButton).not.toBeInTheDocument();
      }
    }

    const firstApprovedApplication = approvedApplications[0];

    const firstApprovedButton = screen.getByRole("button", {
      name: new RegExp(`#${firstApprovedApplication.id}\\b`),
    });

    expect(firstApprovedButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("AI-инструмент selectApplication открывает указанную заявку", async () => {
    const user = userEvent.setup();
    const targetApplication = initialApplications[1];

    render(<ApplicationsDashboard />);

    const searchInput = screen.getByPlaceholderText(
      "Поиск по клиенту, компании или номеру",
    );

    const statusSelect = screen.getByRole("combobox", {
      name: "Фильтр по статусу",
    });

    await user.type(searchInput, "несуществующая заявка");
    await user.selectOptions(statusSelect, "rejected");

    expect(searchInput).toHaveValue("несуществующая заявка");
    expect(statusSelect).toHaveValue("rejected");

    const selectTool = frontendTools.get("selectApplication");

    expect(selectTool).toBeDefined();

    let toolResult = "";

    await act(async () => {
      toolResult = await selectTool!.handler({
        applicationId: targetApplication.id,
      });
    });

    const parsedResult = JSON.parse(toolResult) as {
      success: boolean;
      selectedApplication: {
        id: number;
        customerName: string;
        email: string;
        phone: string;
      };
    };

    expect(parsedResult.success).toBe(true);

    expect(parsedResult.selectedApplication).toMatchObject({
      id: targetApplication.id,
      customerName: targetApplication.customerName,
      email: targetApplication.email,
      phone: targetApplication.phone,
    });

    expect(searchInput).toHaveValue("");
    expect(statusSelect).toHaveValue("all");

    const applicationButton = screen.getByRole("button", {
      name: new RegExp(`#${targetApplication.id}\\b`),
    });

    expect(applicationButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(
      screen.getByText(`Заявка #${targetApplication.id}`),
    ).toBeInTheDocument();

    expect(
      screen.getByText(targetApplication.email),
    ).toBeInTheDocument();

    expect(
      screen.getByText(targetApplication.phone),
    ).toBeInTheDocument();
  });

  it("AI-инструмент requestStatusChange требует подтверждение пользователя", async () => {
  const targetApplication = initialApplications[1];

  const nextStatus =
    targetApplication.status === "approved"
      ? "rejected"
      : "approved";

  const currentStatusLabel =
    targetApplication.status === "new"
      ? "Новая"
      : targetApplication.status === "in_review"
        ? "На рассмотрении"
        : targetApplication.status === "approved"
          ? "Одобрена"
          : "Отклонена";

  const nextStatusLabel =
    nextStatus === "approved" ? "Одобрена" : "Отклонена";

  render(<ApplicationsDashboard />);

  const requestTool = frontendTools.get(
    "requestStatusChange",
  );

  expect(requestTool).toBeDefined();

  let toolResult = "";

  await act(async () => {
    toolResult = await requestTool!.handler({
      applicationId: targetApplication.id,
      nextStatus,
    });
  });

  const parsedResult = JSON.parse(toolResult) as {
    success: boolean;
    confirmationRequired: boolean;
    applicationId: number;
    customerName: string;
    currentStatus: string;
    requestedStatus: string;
  };

  expect(parsedResult).toEqual({
    success: true,
    confirmationRequired: true,
    applicationId: targetApplication.id,
    customerName: targetApplication.customerName,
    currentStatus: targetApplication.status,
    requestedStatus: nextStatus,
  });

  const dialog = screen.getByRole("dialog", {
    name: "Изменить статус заявки",
  });

  expect(dialog).toBeInTheDocument();

  expect(
    within(dialog).getByText(
      `Заявка #${targetApplication.id}`,
    ),
  ).toBeInTheDocument();

  expect(
    within(dialog).getByText(targetApplication.customerName),
  ).toBeInTheDocument();

  const modalStatusSelect = within(dialog).getByRole(
    "combobox",
    {
      name: "Новый статус",
    },
  );

  expect(modalStatusSelect).toHaveValue(nextStatus);

  const confirmButton = within(dialog).getByRole("button", {
    name: "Подтвердить изменение",
  });

  expect(confirmButton).toBeEnabled();

  const applicationButton = screen.getByRole("button", {
    name: new RegExp(`#${targetApplication.id}\\b`),
  });

  expect(applicationButton).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  expect(
    within(applicationButton).getByText(currentStatusLabel),
  ).toBeInTheDocument();

  expect(
    within(applicationButton).queryByText(nextStatusLabel),
  ).not.toBeInTheDocument();
});

  it("показывает заголовок и основные элементы панели заявок", () => {
    render(<ApplicationsDashboard />);

    expect(
      screen.getByRole("heading", {
        name: "Заявки клиентов",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Поиск по клиенту, компании или номеру",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Фильтр по статусу",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Изменить статус",
      }),
    ).toBeInTheDocument();
  });

  it("фильтрует заявки по выбранному статусу", async () => {
    const user = userEvent.setup();

    render(<ApplicationsDashboard />);

    const statusSelect = screen.getByRole("combobox", {
      name: "Фильтр по статусу",
    });

    await user.selectOptions(statusSelect, "approved");

    expect(statusSelect).toHaveValue("approved");

    for (const application of initialApplications) {
      const applicationButton = screen.queryByRole("button", {
        name: new RegExp(`#${application.id}\\b`),
      });

      if (application.status === "approved") {
        expect(applicationButton).toBeInTheDocument();
      } else {
        expect(applicationButton).not.toBeInTheDocument();
      }
    }
  });

  it("открывает выбранную заявку и показывает её данные", async () => {
    const user = userEvent.setup();
    const targetApplication = initialApplications[1];

    render(<ApplicationsDashboard />);

    const applicationButton = screen.getByRole("button", {
      name: new RegExp(`#${targetApplication.id}\\b`),
    });

    expect(applicationButton).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await user.click(applicationButton);

    expect(applicationButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(
      screen.getByText(`Заявка #${targetApplication.id}`),
    ).toBeInTheDocument();

    expect(
      screen.getByText(targetApplication.email),
    ).toBeInTheDocument();

    expect(
      screen.getByText(targetApplication.phone),
    ).toBeInTheDocument();
  });

  it("меняет статус только после подтверждения пользователя", async () => {
    const user = userEvent.setup();
    const targetApplication = initialApplications[0];

    const nextStatus =
      targetApplication.status === "approved"
        ? "rejected"
        : "approved";

    const currentStatusLabel =
      targetApplication.status === "new"
        ? "Новая"
        : targetApplication.status === "in_review"
          ? "На рассмотрении"
          : targetApplication.status === "approved"
            ? "Одобрена"
            : "Отклонена";

    const nextStatusLabel =
      nextStatus === "approved" ? "Одобрена" : "Отклонена";

    render(<ApplicationsDashboard />);

    const applicationButton = screen.getByRole("button", {
      name: new RegExp(`#${targetApplication.id}\\b`),
    });

    expect(
      within(applicationButton).getByText(currentStatusLabel),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Изменить статус",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Изменить статус заявки",
    });

    expect(dialog).toBeInTheDocument();

    const statusSelect = within(dialog).getByRole("combobox", {
      name: "Новый статус",
    });

    const confirmButton = within(dialog).getByRole("button", {
      name: "Подтвердить изменение",
    });

    expect(statusSelect).toHaveValue(targetApplication.status);
    expect(confirmButton).toBeDisabled();

    await user.selectOptions(statusSelect, nextStatus);

    expect(statusSelect).toHaveValue(nextStatus);
    expect(confirmButton).toBeEnabled();

    expect(
      within(applicationButton).getByText(currentStatusLabel),
    ).toBeInTheDocument();

    expect(
      within(applicationButton).queryByText(nextStatusLabel),
    ).not.toBeInTheDocument();

    await user.click(confirmButton);

    expect(
      within(dialog).getByRole("button", {
        name: "Сохраняем...",
      }),
    ).toBeDisabled();

    await waitFor(
      () => {
        expect(
          screen.queryByRole("dialog", {
            name: "Изменить статус заявки",
          }),
        ).not.toBeInTheDocument();
      },
      {
        timeout: 2000,
      },
    );

    expect(
      within(applicationButton).getByText(nextStatusLabel),
    ).toBeInTheDocument();

    expect(
      within(applicationButton).queryByText(
        currentStatusLabel,
      ),
    ).not.toBeInTheDocument();
  });
});
