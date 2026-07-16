"use client";

import { useEffect } from "react";

export type ToastKind = "success" | "error" | "info";

interface ToastNotificationProps {
  message: string;
  kind: ToastKind;
  onClose: () => void;
}

const toastStyles: Record<ToastKind, string> = {
  success:
    "border-emerald-400/30 bg-emerald-950/95 text-emerald-100",
  error:
    "border-rose-400/30 bg-rose-950/95 text-rose-100",
  info:
    "border-cyan-400/30 bg-cyan-950/95 text-cyan-100",
};

export function ToastNotification({
  message,
  kind,
  onClose,
}: ToastNotificationProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`fixed top-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur sm:max-w-md ${toastStyles[kind]}`}
    >
      <span
        aria-hidden="true"
        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-current"
      />

      <p className="min-w-0 flex-1 text-sm leading-6">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть уведомление"
        className="rounded-lg px-2 py-1 text-lg leading-none opacity-70 transition hover:bg-white/10 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
