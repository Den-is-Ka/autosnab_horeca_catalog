import { CopilotSidebar } from "@copilotkit/react-core/v2";

import { ApplicationsDashboard } from "@/components/applications_dashboard";

export default function Home() {
  return (
    <>
      <ApplicationsDashboard />

      <CopilotSidebar
        agentId="default"
        labels={{
          modalHeaderTitle: "AI-ассистент по заявкам",
          welcomeMessageText: "Чем я могу помочь?",
          chatInputPlaceholder: "Введите сообщение...",
          chatDisclaimerText:
            "AI может ошибаться. Проверяйте важную информацию.",

          chatToggleOpenLabel: "Открыть AI-ассистента",
          chatToggleCloseLabel: "Закрыть AI-ассистента",

          chatInputToolbarStartTranscribeButtonLabel: "Начать диктовку",
          chatInputToolbarCancelTranscribeButtonLabel: "Отменить диктовку",
          chatInputToolbarFinishTranscribeButtonLabel: "Завершить диктовку",
          chatInputToolbarAddButtonLabel: "Добавить вложения",
          chatInputToolbarToolsButtonLabel: "Инструменты",

          assistantMessageToolbarCopyCodeLabel: "Копировать код",
          assistantMessageToolbarCopyCodeCopiedLabel: "Код скопирован",
          assistantMessageToolbarCopyMessageLabel: "Копировать ответ",
          assistantMessageToolbarThumbsUpLabel: "Хороший ответ",
          assistantMessageToolbarThumbsDownLabel: "Плохой ответ",
          assistantMessageToolbarReadAloudLabel: "Прочитать вслух",
          assistantMessageToolbarRegenerateLabel: "Сгенерировать заново",

          userMessageToolbarCopyMessageLabel: "Копировать сообщение",
          userMessageToolbarEditMessageLabel: "Редактировать сообщение",
        }}
      />
    </>
  );
}
