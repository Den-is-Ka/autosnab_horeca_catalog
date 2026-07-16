import type { Application } from "@/types/application";

export const initialApplications: Application[] = [
  {
    id: 1001,
    customerName: "Анька Облигация",
    companyName: 'ООО "Тех и Этих"',
    email: "anna@example.com",
    phone: "+7 900 123-45-67",
    status: "new",
    priority: "high",
    amount: 1_250_000,
    createdAt: "2026-07-10",
    description:
      "Запрос на поставку пельменного теста.",
  },
  {
    id: 1002,
    customerName: "Иван Дурак",
    companyName: 'АО "9 регион 3/10 район"',
    email: "ivan.pedro@example.com",
    phone: "+7 901 234-56-78",
    status: "in_review",
    priority: "medium",
    amount: 780_000,
    createdAt: "2026-07-11",
    description:
      "Необходимо проверить то чего нет.",
  },
  {
    id: 1003,
    customerName: "Мария Серо-Волкова",
    companyName: 'ООО "ЛесЛогистика"',
    email: "maria.volk@example.com",
    phone: "+7 902 345-67-89",
    status: "approved",
    priority: "low",
    amount: 430_000,
    createdAt: "2026-07-12",
    description:
      "Заявка согласована. Прогулки по лесу.",
  },
  {
    id: 1004,
    customerName: "Алексей Ясный Сокол",
    companyName: 'ООО "УкралКомплект"',
    email: "alexey.sokol@example.com",
    phone: "+7 903 456-78-90",
    status: "new",
    priority: "high",
    amount: 2_100_000,
    createdAt: "2026-07-13",
    description:
      "Срочный запрос на подбор и поставку оборудования для поиска царевны.",
  },
  {
    id: 1005,
    customerName: "Елена Прекраснова",
    companyName: 'АО "ЭтихИнвест"',
    email: "elena@example.com",
    phone: "+7 904 567-89-01",
    status: "rejected",
    priority: "medium",
    amount: 615_000,
    createdAt: "2026-07-14",
    description:
      "Заявка отклонена из-за отсутствия наличия позиции на складе.",
  },
];
