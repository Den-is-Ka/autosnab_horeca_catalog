"use client";

import type { ApplicationStatus } from "@/types/application";

interface StatusChangeModalProps {
  isOpen: boolean;
  applicationId: number;
  customerName: string;
  currentStatus: ApplicationStatus;
  nextStatus: ApplicationStatus;
  isSubmitting: boolean;
  onNextStatusChange: (status: ApplicationStatus) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const statusLabels: Record<ApplicationStatus, string> = {
  new: "Новая",
  in_review: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена",
};

export function StatusChangeModal({
  isOpen,
  applicationId,
  customerName,
  currentStatus,
  nextStatus,
  isSubmitting,
  onNextStatusChange,
  onCancel,
  onConfirm,
}: StatusChangeModalProps) {
  if (!isOpen) {
    return null;
  }

  const statusWasChanged = currentStatus !== nextStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-change-title"
        aria-describedby="status-change-description"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">
              Требуется подтверждение
            </p>

            <h2
              id="status-change-title"
              className="mt-2 text-xl font-bold text-white"
            >
              Изменить статус заявки
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Закрыть окно"
            className="rounded-xl px-3 py-2 text-xl leading-none text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500">
            Заявка #{applicationId}
          </p>

          <p className="mt-1 font-semibold text-white">{customerName}</p>

          <p
            id="status-change-description"
            className="mt-3 text-sm leading-6 text-slate-400"
          >
            Изменение будет применено только после явного подтверждения
            пользователя.
          </p>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-200">
            Новый статус
          </span>

          <select
            value={nextStatus}
            disabled={isSubmitting}
            onChange={(event) =>
              onNextStatusChange(event.target.value as ApplicationStatus)
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="new">Новая</option>
            <option value="in_review">На рассмотрении</option>
            <option value="approved">Одобрена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </label>

        <div className="mt-5 grid gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <p className="text-xs text-slate-500">Текущий статус</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {statusLabels[currentStatus]}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="hidden text-amber-300 sm:block"
          >
            →
          </span>

          <div className="sm:text-right">
            <p className="text-xs text-slate-500">Новый статус</p>
            <p className="mt-1 text-sm font-semibold text-amber-200">
              {statusLabels[nextStatus]}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отменить
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!statusWasChanged || isSubmitting}
            className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSubmitting ? "Сохраняем..." : "Подтвердить изменение"}
          </button>
        </div>
      </section>
    </div>
  );
}
