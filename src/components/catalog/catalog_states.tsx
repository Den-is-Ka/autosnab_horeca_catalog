type CatalogErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function CatalogLoadingState() {
  return (
    <main
      className="
        mx-auto w-full max-w-7xl px-4 py-10
        sm:px-6
        lg:px-8
      "
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        Загружаем товары каталога
      </span>

      <div className="mb-8 space-y-3">
        <div
          className="
            h-4 w-24 animate-pulse rounded
            bg-slate-200
          "
        />

        <div
          className="
            h-9 w-72 max-w-full animate-pulse
            rounded-lg bg-slate-200
          "
        />

        <div
          className="
            h-5 w-[32rem] max-w-full animate-pulse
            rounded bg-slate-200
          "
        />
      </div>

      <div
        className="
          grid grid-cols-1 gap-6
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {Array.from({ length: 8 }, (_, index) => (
          <article
            key={index}
            aria-hidden="true"
            className="
              overflow-hidden rounded-2xl border
              border-slate-200 bg-white shadow-sm
            "
          >
            <div
              className="
                aspect-[4/3] animate-pulse
                bg-slate-200
              "
            />

            <div className="space-y-4 p-5">
              <div
                className="
                  h-4 w-3/4 animate-pulse
                  rounded bg-slate-200
                "
              />

              <div
                className="
                  h-7 w-4/5 animate-pulse
                  rounded bg-slate-200
                "
              />

              <div
                className="
                  h-8 w-2/5 animate-pulse
                  rounded bg-slate-200
                "
              />

              <div
                className="
                  h-10 w-36 animate-pulse
                  rounded-lg bg-slate-200
                "
              />

              <div
                className="
                  h-16 animate-pulse
                  rounded-xl bg-slate-100
                "
              />

              <div
                className="
                  h-12 animate-pulse
                  rounded-xl bg-slate-200
                "
              />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export function CatalogErrorState({
  message = "Не удалось загрузить товары каталога.",
  onRetry,
}: CatalogErrorStateProps) {
  return (
    <main
      className="
        mx-auto w-full max-w-7xl px-4 py-16
        sm:px-6
        lg:px-8
      "
    >
      <section
        role="alert"
        aria-live="assertive"
        className="
          rounded-2xl border border-rose-200
          bg-rose-50 px-6 py-12 text-center
        "
      >
        <div
          aria-hidden="true"
          className="
            mx-auto flex h-12 w-12 items-center
            justify-center rounded-full bg-rose-100
            text-2xl text-rose-700
          "
        >
          !
        </div>

        <h2
          className="
            mt-5 text-2xl font-bold text-slate-950
          "
        >
          Ошибка загрузки
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-slate-700">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              mt-6 rounded-xl bg-rose-700
              px-5 py-3 font-semibold text-white
              transition hover:bg-rose-800
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-rose-600
              focus-visible:ring-offset-2
            "
          >
            Повторить загрузку
          </button>
        )}
      </section>
    </main>
  );
}