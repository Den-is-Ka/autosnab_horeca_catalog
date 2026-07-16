"use client";

interface DashboardErrorStateProps {
  onRetry: () => void;
}

interface DashboardEmptyStateProps {
  onRestore: () => void;
}

export function DashboardLoadingState() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />

        <div>
          <h3 className="font-semibold text-white">Загружаем заявки</h3>
          <p className="mt-1 text-sm text-slate-500">
            Получаем актуальные данные и подготавливаем панель управления.
          </p>
        </div>
      </div>

      <div className="mt-6 grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 rounded-2xl border border-white/5 bg-white/5"
          />
        ))}
      </div>

      <div className="mt-6 grid animate-pulse gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="h-96 rounded-2xl border border-white/5 bg-white/5" />
        <div className="h-96 rounded-2xl border border-white/5 bg-white/5" />
      </div>
    </section>
  );
}

export function DashboardErrorState({
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <section
      role="alert"
      className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/5 px-5 py-14 text-center sm:px-8"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-400/10 text-2xl text-rose-200">
        !
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        Не удалось загрузить заявки
      </h3>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
        Сервис временно недоступен или соединение было прервано. Повтори
        загрузку данных.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
      >
        Повторить загрузку
      </button>
    </section>
  );
}

export function DashboardEmptyState({
  onRestore,
}: DashboardEmptyStateProps) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-2xl text-cyan-200">
        0
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        Заявок пока нет
      </h3>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
        Источник данных доступен, но в нём пока отсутствуют заявки для
        отображения.
      </p>

      <button
        type="button"
        onClick={onRestore}
        className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
      >
        Восстановить демонстрационные данные
      </button>
    </section>
  );
}
