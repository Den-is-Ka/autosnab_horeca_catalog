"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotPopup,
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useCallback, useEffect, useState } from "react";

import { CatalogHeader } from "@/components/catalog/catalog_header";
import { ProductCatalog } from "@/components/catalog/product_catalog";
import { ProductRecommendationsTool } from "@/components/copilot/product_recommendations_tool";
import {
  ToastNotification,
  type ToastKind,
} from "@/components/toast_notification";
import { CartProvider } from "@/context/cart_context";

type ToastState = {
  message: string;
  kind: ToastKind;
};

type AssistantMode = "sidebar" | "popup";

const priceFormatter = new Intl.NumberFormat("ru-RU");

function useResponsiveAssistantMode(): AssistantMode | null {
  const [mode, setMode] = useState<AssistantMode | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateMode = () => {
      setMode(mediaQuery.matches ? "sidebar" : "popup");
    };

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => {
      mediaQuery.removeEventListener("change", updateMode);
    };
  }, []);

  return mode;
}

function ResponsiveAssistant() {
  const mode = useResponsiveAssistantMode();

  if (mode === "sidebar") {
    return <CopilotSidebar />;
  }

  if (mode === "popup") {
    return <CopilotPopup toggleButton="hidden" />;
  }

  return null;
}

function CatalogPageContent() {
  const chatConfiguration = useCopilotChatConfiguration();
  const [toast, setToast] = useState<ToastState | null>(null);

  const openAssistant = useCallback(() => {
    chatConfiguration?.setModalOpen?.(true);
  }, [chatConfiguration]);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <>
      <ProductRecommendationsTool />

      <div className="min-h-screen bg-slate-100">
        <CatalogHeader onOpenAssistant={openAssistant} />

        <ProductCatalog
          onProductAdded={({ product, quantity, totalPrice }) => {
            setToast({
              kind: "success",
              message:
                `«${product.name}» добавлено: ` +
                `${quantity} ${product.unit}. ` +
                `Сумма: ${priceFormatter.format(totalPrice)} Р.`,
            });
          }}
        />
      </div>

      {toast && (
        <ToastNotification
          message={toast.message}
          kind={toast.kind}
          onClose={closeToast}
        />
      )}

      <ResponsiveAssistant />
    </>
  );
}

export default function Home() {
  return (
    <CopilotChatConfigurationProvider
      agentId="default"
      isModalDefaultOpen={false}
      labels={{
        modalHeaderTitle: "AI-помощник по каталогу",
        welcomeMessageText: "Помогу подобрать товары под ваш бюджет.",
        chatInputPlaceholder:
          "Например: Подбери товары на сумму до 5 000 Р",
        chatDisclaimerText:
          "Рекомендации формируются на основе товаров каталога.",

        chatToggleOpenLabel: "Открыть AI-помощника",
        chatToggleCloseLabel: "Закрыть AI-помощника",

        chatInputToolbarStartTranscribeButtonLabel:
          "Начать диктовку",
        chatInputToolbarCancelTranscribeButtonLabel:
          "Отменить диктовку",
        chatInputToolbarFinishTranscribeButtonLabel:
          "Завершить диктовку",
        chatInputToolbarAddButtonLabel: "Добавить вложения",
        chatInputToolbarToolsButtonLabel: "Инструменты",

        assistantMessageToolbarCopyCodeLabel: "Копировать код",
        assistantMessageToolbarCopyCodeCopiedLabel:
          "Код скопирован",
        assistantMessageToolbarCopyMessageLabel:
          "Копировать ответ",
        assistantMessageToolbarThumbsUpLabel: "Хороший ответ",
        assistantMessageToolbarThumbsDownLabel: "Плохой ответ",
        assistantMessageToolbarReadAloudLabel:
          "Прочитать вслух",
        assistantMessageToolbarRegenerateLabel:
          "Сгенерировать заново",

        userMessageToolbarCopyMessageLabel:
          "Копировать сообщение",
        userMessageToolbarEditMessageLabel:
          "Редактировать сообщение",
      }}
    >
      <CartProvider>
        <CatalogPageContent />
      </CartProvider>
    </CopilotChatConfigurationProvider>
  );
}


