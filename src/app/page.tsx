"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useCallback, useState } from "react";

import { ProductRecommendationsTool } from "@/components/copilot/product_recommendations_tool";
import { CatalogHeader } from "@/components/catalog/catalog_header";
import { ProductCatalog } from "@/components/catalog/product_catalog";
import {
  ToastNotification,
  type ToastKind,
} from "@/components/toast_notification";
import { CartProvider } from "@/context/cart_context";

type ToastState = {
  message: string;
  kind: ToastKind;
};

const priceFormatter = new Intl.NumberFormat("ru-RU");

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
                `Сумма: ${priceFormatter.format(totalPrice)} ₽.`,
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

      <CopilotSidebar />
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
        welcomeMessageText:
          "Помогу подобрать товары под ваш бюджет.",
        chatInputPlaceholder:
          "Например: Подбери товары на сумму до 5 000 ₽",
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