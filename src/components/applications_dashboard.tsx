"use client";

import { useMemo, useState } from "react";

import {
  useAgentContext,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
} from "@/components/dashboard_states";
import { StatusChangeModal } from "@/components/status_change_modal";
import {
  ToastNotification,
  type ToastKind,
} from "@/components/toast_notification";

import { initialApplications } from "@/data/applications";
import type {
  Application,
  ApplicationPriority,
  ApplicationStatus,
} from "@/types/application";

type StatusFilter = "all" | ApplicationStatus;

type DashboardViewState = "ready" | "loading" | "error" | "empty";

const statusLabels: Record<ApplicationStatus, string> = {
  new: "Новая",
  in_review: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена",
};

const statusStyles: Record<ApplicationStatus, string> = {
  new: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  in_review: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

const priorityLabels: Record<ApplicationPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const priorityStyles: Record<ApplicationPriority, string> = {
  low: "text-slate-300",
  medium: "text-amber-200",
  high: "text-rose-200",
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function toAgentApplication(application: Application) {
  return {
    id: application.id,
    customerName: application.customerName,
    companyName: application.companyName,
    email: application.email,
    phone: application.phone,
    status: application.status,
    priority: application.priority,
    amount: application.amount,
    createdAt: application.createdAt,
    description: application.description,
  };
}

export function ApplicationsDashboard() {
  const [applications, setApplications] = useState(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedApplicationId, setSelectedApplicationId] = useState(
    initialApplications[0].id,
  );

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus>(
    initialApplications[0].status,
  );

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    kind: ToastKind;
  } | null>(null);

  const [dashboardViewState, setDashboardViewState] =
    useState<DashboardViewState>("ready");

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        application.customerName.toLowerCase().includes(normalizedQuery) ||
        application.companyName.toLowerCase().includes(normalizedQuery) ||
        application.id.toString().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchQuery, statusFilter]);

  const selectedApplication =
  applications.find(
    (application) => application.id === selectedApplicationId,
  ) ?? applications[0];

const agentApplications = useMemo(
  () => applications.map(toAgentApplication),
  [applications],
);

const selectedApplicationForAgent = toAgentApplication(
  selectedApplication,
);

useAgentContext({
  description:
    "Текущее состояние панели заявок АвтоСнаб. Все данные являются синтетическими. Допустимые статусы: new, in_review, approved, rejected.",
  value: {
    applications: agentApplications,
    selectedApplication: selectedApplicationForAgent,
    visibleApplicationIds: filteredApplications.map(
      (application) => application.id,
    ),
    filters: {
      searchQuery,
      statusFilter,
    },
    dashboardViewState,
  },
});

useFrontendTool(
  {
    name: "filterApplications",
    description:
      "Фильтрует заявки АвтоСнаб по статусу и поисковой строке. Поиск работает по имени клиента, названию компании и номеру заявки.",
    parameters: z.object({
      status: z
        .enum(["all", "new", "in_review", "approved", "rejected"])
        .optional()
        .describe(
          "Статус: all, new, in_review, approved или rejected",
        ),

      query: z
        .string()
        .optional()
        .describe(
          "Поисковая строка. Пустая строка очищает текстовый поиск.",
        ),
    }),

    handler: async ({ status, query }) => {
      const nextStatus: StatusFilter = status ?? statusFilter;
      const nextQuery = query?.trim() ?? searchQuery;
      const normalizedQuery = nextQuery.toLowerCase();

      const matchingApplications = applications.filter((application) => {
        const matchesStatus =
          nextStatus === "all" || application.status === nextStatus;

        const matchesSearch =
          normalizedQuery.length === 0 ||
          application.customerName
            .toLowerCase()
            .includes(normalizedQuery) ||
          application.companyName
            .toLowerCase()
            .includes(normalizedQuery) ||
          application.id.toString().includes(normalizedQuery);

        return matchesStatus && matchesSearch;
      });

      setDashboardViewState("ready");
      setStatusFilter(nextStatus);
      setSearchQuery(nextQuery);

      if (matchingApplications.length > 0) {
        setSelectedApplicationId(matchingApplications[0].id);
      }

      setToast({
        kind: "info",
        message:
          matchingApplications.length > 0
            ? `Найдено заявок: ${matchingApplications.length}.`
            : "По заданным условиям заявки не найдены.",
      });

      return JSON.stringify({
        success: true,
        status: nextStatus,
        query: nextQuery,
        matchedCount: matchingApplications.length,
        matchedApplicationIds: matchingApplications.map(
          (application) => application.id,
        ),
      });
    },
  },
  [applications, searchQuery, statusFilter],
);

useFrontendTool(
  {
    name: "selectApplication",
    description:
      "Открывает конкретную заявку АвтоСнаб по её числовому идентификатору. Используй идентификаторы заявок из контекста applications.",

    parameters: z.object({
      applicationId: z
        .number()
        .int()
        .positive()
        .describe("Числовой идентификатор заявки"),
    }),

    handler: async ({ applicationId }) => {
      const application = applications.find(
        (item) => item.id === applicationId,
      );

      if (!application) {
        setToast({
          kind: "error",
          message: `Заявка #${applicationId} не найдена.`,
        });

        return JSON.stringify({
          success: false,
          applicationId,
          error: "Application not found",
        });
      }

      setDashboardViewState("ready");
      setStatusFilter("all");
      setSearchQuery("");
      setSelectedApplicationId(application.id);

      setToast({
        kind: "info",
        message: `Открыта заявка #${application.id}: ${application.customerName}.`,
      });

      return JSON.stringify({
        success: true,
        selectedApplication: toAgentApplication(application),
      });
    },
  },
  [applications],
);

useFrontendTool(
  {
    name: "selectApplication",
    description:
      "Открывает конкретную заявку АвтоСнаб по её числовому идентификатору. Используй идентификаторы заявок из контекста applications.",

    parameters: z.object({
      applicationId: z
        .number()
        .int()
        .positive()
        .describe("Числовой идентификатор заявки, например 1001"),
    }),

    handler: async ({ applicationId }) => {
      const application = applications.find(
        (item) => item.id === applicationId,
      );

      if (!application) {
        setToast({
          kind: "error",
          message: `Заявка #${applicationId} не найдена.`,
        });

        return JSON.stringify({
          success: false,
          applicationId,
          error: "Application not found",
        });
      }

      setDashboardViewState("ready");
      setStatusFilter("all");
      setSearchQuery("");
      setSelectedApplicationId(application.id);

      setToast({
        kind: "info",
        message: `Открыта заявка #${application.id}: ${application.customerName}.`,
      });

      return JSON.stringify({
        success: true,
        selectedApplication: toAgentApplication(application),
      });
    },
  },
  [applications],
);

useFrontendTool(
  {
    name: "requestStatusChange",
    description:
      "Подготавливает изменение статуса заявки и открывает пользователю окно подтверждения. Инструмент никогда не изменяет статус самостоятельно.",

    parameters: z.object({
      applicationId: z
        .number()
        .int()
        .positive()
        .describe("Числовой идентификатор заявки"),

      nextStatus: z
        .enum(["new", "in_review", "approved", "rejected"])
        .describe(
          "Предлагаемый новый статус: new, in_review, approved или rejected",
        ),
    }),

    handler: async ({ applicationId, nextStatus }) => {
      const application = applications.find(
        (item) => item.id === applicationId,
      );

      if (!application) {
        setToast({
          kind: "error",
          message: `Заявка #${applicationId} не найдена.`,
        });

        return JSON.stringify({
          success: false,
          applicationId,
          error: "Application not found",
        });
      }

      if (application.status === nextStatus) {
        setDashboardViewState("ready");
        setStatusFilter("all");
        setSearchQuery("");
        setSelectedApplicationId(application.id);

        setToast({
          kind: "info",
          message: `Заявка #${application.id} уже имеет статус «${statusLabels[nextStatus]}».`,
        });

        return JSON.stringify({
          success: false,
          applicationId: application.id,
          currentStatus: application.status,
          requestedStatus: nextStatus,
          error: "Application already has requested status",
        });
      }

      setDashboardViewState("ready");
      setStatusFilter("all");
      setSearchQuery("");
      setSelectedApplicationId(application.id);

      setPendingStatus(nextStatus);
      setIsStatusModalOpen(true);

      setToast({
        kind: "info",
        message: `AI предлагает изменить статус заявки #${application.id}. Требуется подтверждение пользователя.`,
      });

      return JSON.stringify({
        success: true,
        confirmationRequired: true,
        applicationId: application.id,
        customerName: application.customerName,
        currentStatus: application.status,
        requestedStatus: nextStatus,
      });
    },
  },
  [applications],
);

const newApplicationsCount = applications.filter(
  (application) => application.status === "new",
).length;

  const reviewApplicationsCount = applications.filter(
    (application) => application.status === "in_review",
  ).length;

const approvedAmount = applications
  .filter((application) => application.status === "approved")
  .reduce((total, application) => total + application.amount, 0);

function handleOpenStatusModal() {
  setPendingStatus(selectedApplication.status);
  setIsStatusModalOpen(true);
}

function handleCancelStatusChange() {
  if (!isUpdatingStatus) {
    setIsStatusModalOpen(false);
  }
}

async function handleConfirmStatusChange() {
  if (pendingStatus === selectedApplication.status) {
    return;
  }

  const applicationId = selectedApplication.id;
  const previousStatus = selectedApplication.status;

  setIsUpdatingStatus(true);

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 700);
  });

  setApplications((currentApplications) =>
    currentApplications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status: pendingStatus,
          }
        : application,
    ),
  );

  setIsUpdatingStatus(false);
  setIsStatusModalOpen(false);

  setToast({
    kind: "success",
    message: `Статус заявки #${applicationId} изменён: «${statusLabels[previousStatus]}» → «${statusLabels[pendingStatus]}».`,
  });
}
async function handleSimulateLoading() {
  setDashboardViewState("loading");

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1200);
  });

  setDashboardViewState("ready");

  setToast({
    kind: "info",
    message: "Данные заявок успешно загружены.",
  });
}

function handleSimulateError() {
  setDashboardViewState("error");
}

function handleSimulateEmptyState() {
  setDashboardViewState("empty");
}

async function handleRetryDashboard() {
  setDashboardViewState("loading");

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1200);
  });

  setDashboardViewState("ready");

  setToast({
    kind: "success",
    message: "Соединение восстановлено. Заявки снова доступны.",
  });
}

function handleRestoreDashboard() {
  setDashboardViewState("ready");

  setToast({
    kind: "success",
    message: "Демонстрационные заявки восстановлены.",
  });
}
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-900/80 px-5 py-6 backdrop-blur lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-cyan-300 uppercase">
                АвтоСнаб
              </p>

              <h1 className="mt-2 text-xl font-bold text-white">
                AI Workspace
              </h1>
            </div>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200 lg:mt-4 lg:inline-flex">
              Система доступна
            </span>
          </div>

          <nav className="mt-6 grid grid-cols-2 gap-2 lg:mt-10 lg:grid-cols-1">
            <button
              type="button"
              className="rounded-xl bg-cyan-400/10 px-4 py-3 text-left text-sm font-medium text-cyan-200"
            >
              Заявки
            </button>

            <button
              type="button"
              className="rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Аналитика
            </button>

            <button
              type="button"
              className="rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              AI-ассистент
            </button>

            <button
              type="button"
              className="rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Настройки
            </button>
          </nav>

          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
            <p className="text-xs font-semibold text-slate-300">
              Демонстрационный режим
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              В приложении используются только синтетические данные.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Панель управления</p>

              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Заявки клиентов
              </h2>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-medium text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-300" />
              Синтетические данные
            </div>
          </header>

                    <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Демонстрация состояний
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Проверка загрузки, ошибки и отсутствия данных.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSimulateLoading}
                disabled={dashboardViewState === "loading"}
                className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/10 disabled:cursor-wait disabled:opacity-50"
              >
                Загрузка
              </button>

              <button
                type="button"
                onClick={handleSimulateError}
                disabled={dashboardViewState === "loading"}
                className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-50"
              >
                Ошибка
              </button>

              <button
                type="button"
                onClick={handleSimulateEmptyState}
                disabled={dashboardViewState === "loading"}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Пустой список
              </button>
            </div>
          </section>

                    {dashboardViewState === "loading" ? (
            <DashboardLoadingState />
          ) : null}

          {dashboardViewState === "error" ? (
            <DashboardErrorState onRetry={handleRetryDashboard} />
          ) : null}

          {dashboardViewState === "empty" ? (
            <DashboardEmptyState onRestore={handleRestoreDashboard} />
          ) : null}

          <section
             className={`mt-6 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
               dashboardViewState === "ready" ? "grid" : "hidden"
             }`}
          >
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Всего заявок</p>
              <p className="mt-3 text-3xl font-bold text-white">
                {applications.length}
              </p>
            </article>

            <article className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5">
              <p className="text-sm text-blue-200">Новые / на рассмотрении</p>
              <p className="mt-3 text-3xl font-bold text-white">
                {newApplicationsCount} / {reviewApplicationsCount}
              </p>
            </article>

            <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-emerald-200">
                Сумма одобренных заявок
              </p>
              <p className="mt-3 text-3xl font-bold text-white">
                {currencyFormatter.format(approvedAmount)}
              </p>
            </article>
          </section>

          <section
             className={`mt-6 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] ${
                dashboardViewState === "ready" ? "grid" : "hidden"
             }`}
          >
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5">
              <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
                <label>
                  <span className="sr-only">Поиск заявок</span>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Поиск по клиенту, компании или номеру"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                  />
                </label>

                <label>
                  <span className="sr-only">Фильтр по статусу</span>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="all">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="in_review">На рассмотрении</option>
                    <option value="approved">Одобренные</option>
                    <option value="rejected">Отклонённые</option>
                  </select>
                </label>
              </div>

              <div className="p-3">
                {filteredApplications.length > 0 ? (
                  <div className="space-y-2">
                    {filteredApplications.map((application) => {
                      const isSelected =
                        selectedApplicationId === application.id;

                      return (
                        <button
                          key={application.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            setSelectedApplicationId(application.id)
                          }
                          className={`grid w-full gap-4 rounded-xl border p-4 text-left transition sm:grid-cols-[minmax(0,1fr)_auto] ${
                            isSelected
                              ? "border-cyan-400/50 bg-cyan-400/10"
                              : "border-transparent bg-slate-950/30 hover:border-white/10 hover:bg-white/5"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-slate-500">
                                #{application.id}
                              </span>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                              >
                                {statusLabels[application.status]}
                              </span>
                            </div>

                            <p className="mt-3 truncate font-semibold text-white">
                              {application.customerName}
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-400">
                              {application.companyName}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="font-semibold text-white">
                              {currencyFormatter.format(application.amount)}
                            </p>

                            <p
                              className={`mt-2 text-xs ${priorityStyles[application.priority]}`}
                            >
                              Приоритет:{" "}
                              {priorityLabels[application.priority]}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-white">
                      Заявки не найдены
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Измени поисковый запрос или выбранный статус.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 xl:sticky xl:top-6 xl:self-start">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Заявка #{selectedApplication.id}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    {selectedApplication.customerName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedApplication.companyName}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[selectedApplication.status]}`}
                >
                  {statusLabels[selectedApplication.status]}
                </span>
              </div>

              <dl className="mt-6 space-y-4 border-y border-white/10 py-5">
                <div>
                  <dt className="text-xs text-slate-500">Сумма</dt>
                  <dd className="mt-1 font-semibold text-white">
                    {currencyFormatter.format(selectedApplication.amount)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Дата создания</dt>
                  <dd className="mt-1 text-sm text-slate-200">
                    {formatDate(selectedApplication.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Приоритет</dt>
                  <dd
                    className={`mt-1 text-sm font-medium ${priorityStyles[selectedApplication.priority]}`}
                  >
                    {priorityLabels[selectedApplication.priority]}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Контакты</dt>
                  <dd className="mt-1 break-all text-sm text-slate-200">
                    {selectedApplication.email}
                  </dd>
                  <dd className="mt-1 text-sm text-slate-200">
                    {selectedApplication.phone}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <p className="text-xs text-slate-500">Описание</p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selectedApplication.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenStatusModal}
                className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
              Изменить статус
            </button>
            </aside>
          </section>
        </main>
      </div>

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        applicationId={selectedApplication.id}
        customerName={selectedApplication.customerName}
        currentStatus={selectedApplication.status}
        nextStatus={pendingStatus}
        isSubmitting={isUpdatingStatus}
        onNextStatusChange={setPendingStatus}
        onCancel={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
      />

      {toast ? (
        <ToastNotification
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
