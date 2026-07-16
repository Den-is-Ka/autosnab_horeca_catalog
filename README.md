# АвтоСнаб AI Workspace

Демонстрационная панель управления заявками с интеграцией CopilotKit.

Приложение разработано на Next.js и показывает, как AI-ассистент может получать контекст интерфейса, фильтровать заявки,
открывать нужную заявку и подготавливать изменение статуса с обязательным подтверждением пользователя.

Все заявки и персональные данные в проекте являются синтетическими.

> [!NOTE]
> Интерфейс AI-ассистента, CopilotKit Runtime, передача контекста и frontend tools реализованы и покрыты автоматическими
> тестами. Однако полноценное выполнение запросов AI-агентом в текущем окружении недоступно: OpenAI отклоняет обращения
> из региона запуска с ошибкой `unsupported_country_region_territory`. Способы обхода региональных ограничений в 
> проекте не используются.

## Возможности

В приложении реализованы:

- адаптивная панель управления заявками;
- список синтетических заявок;
- поиск по имени клиента, компании и номеру заявки;
- фильтрация по статусу;
- просмотр подробной информации о заявке;
- статистика по заявкам;
- состояния загрузки, ошибки и пустого списка;
- toast-уведомления;
- модальное окно изменения статуса;
- CopilotKit Sidebar с AI-ассистентом;
- передача состояния dashboard в контекст AI;
- frontend tools для управления интерфейсом;
- human-in-the-loop подтверждение изменения статуса;
- автоматические тесты;
- production-сборка;
- запуск через Docker и Docker Compose;
- Docker healthcheck;
- запуск контейнера от непривилегированного пользователя.

## AI-инструменты

Dashboard регистрирует три frontend tool.

### `filterApplications`

Фильтрует заявки по статусу и поисковой строке.

Пример параметров:

```json
{
  "status": "approved",
  "query": ""
}
```

Допустимые статусы:

```text
all
new
in_review
approved
rejected
```

### `selectApplication`

Открывает конкретную заявку по числовому идентификатору.

Пример параметров:

```json
{
  "applicationId": 1002
}
```

При выполнении инструмент:

- очищает поисковую строку;
- устанавливает фильтр `all`;
- выбирает указанную заявку;
- показывает подробности заявки;
- выводит toast-уведомление.

### `requestStatusChange`

Подготавливает изменение статуса заявки.

Пример параметров:

```json
{
  "applicationId": 1002,
  "nextStatus": "approved"
}
```

Инструмент не изменяет статус автоматически. Он только:

1. открывает нужную заявку;
2. выбирает предлагаемый статус;
3. открывает модальное окно;
4. ожидает явного подтверждения пользователя.

Статус изменяется только после нажатия кнопки:

```text
Подтвердить изменение
```

Это реализует human-in-the-loop подход и не позволяет AI самостоятельно одобрять или отклонять заявки.

## Технологии

- Next.js 16;
- React;
- TypeScript;
- Tailwind CSS;
- CopilotKit;
- Zod;
- Vitest;
- React Testing Library;
- user-event;
- jest-dom;
- jsdom;
- Docker;
- Docker Compose;
- Node.js 24.

## Требования

Для локального запуска необходимы:

- Node.js 24;
- npm 11 или совместимая версия;
- Git;
- Docker Desktop — для контейнерного запуска.

Проверить версии:

```powershell
node --version
npm --version
git --version
docker --version
docker compose version
```

## Получение проекта

Клонируйте репозиторий и перейдите в его каталог:

```powershell
git clone https://github.com/Den-is-Ka/autosnab-copilotkit-demo.git
cd autosnab-copilotkit-demo
```

Переключитесь на ветку интеграции CopilotKit:

```powershell
git switch feature/copilotkit_integration
```

Установите зависимости из `package-lock.json`:

```powershell
npm ci
```

## Переменные окружения

Создайте локальный файл на основе шаблона:

```powershell
Copy-Item .env.example .env.local
```

Пример `.env.local`:

```env
COPILOTKIT_MODEL=openai:gpt-5.4-mini
OPENAI_API_KEY=your_openai_api_key_here
COPILOTKIT_TELEMETRY_DISABLED=true
```

`COPILOTKIT_MODEL` задаётся в формате:

```text
provider:model
```

Для другого провайдера необходимо указать совместимую модель и соответствующий API-ключ.

Файл `.env.local`:

- не должен добавляться в Git;
- не должен публиковаться;
- не копируется внутрь Docker-образа;
- передаётся контейнеру только во время запуска.

Проверить, что файл игнорируется Git:

```powershell
git check-ignore -v .env.local
```

## Локальный запуск

Запустите development server:

```powershell
npm run dev
```

Откройте приложение:

```text
http://localhost:3000
```

CopilotKit runtime доступен по маршруту:

```text
/api/copilotkit
```

## Проверка качества

Запуск ESLint:

```powershell
npm run lint
```

Запуск всех тестов один раз:

```powershell
npm run test:run
```

Запуск Vitest в watch mode:

```powershell
npm test
```

Production-сборка:

```powershell
npm run build
```

Локальный production-запуск:

```powershell
npm start
```

## Автоматические тесты

Тесты находятся в каталоге:

```text
src/__tests__/
```

Текущий набор проверяет:

- работу Vitest, jsdom и jest-dom;
- отображение основных элементов dashboard;
- ручную фильтрацию заявок;
- выбор конкретной заявки;
- изменение статуса только после подтверждения;
- регистрацию AI-инструментов;
- выполнение `filterApplications`;
- выполнение `selectApplication`;
- выполнение `requestStatusChange`;
- отсутствие автоматического изменения статуса со стороны AI.

Текущий результат:

```text
Test Files  2 passed
Tests       9 passed
```

## Запуск через Docker Compose

Убедитесь, что Docker Desktop запущен:

```powershell
docker info
```

Соберите образ и запустите сервис:

```powershell
docker compose up --build --detach
```

Проверьте состояние:

```powershell
docker compose ps
```

Ожидаемый статус:

```text
Up ... (healthy)
```

Откройте приложение:

```text
http://localhost:3000
```

Проверить HTTP-ответ:

```powershell
(Invoke-WebRequest http://localhost:3000).StatusCode
```

Ожидаемый результат:

```text
200
```

Посмотреть логи:

```powershell
docker compose logs --tail 30 app
```

Следить за логами:

```powershell
docker compose logs --follow app
```

Проверить пользователя внутри контейнера:

```powershell
docker compose exec app id
```

Ожидаемый результат:

```text
uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)
```

Остановить и удалить контейнер:

```powershell
docker compose down
```

## Сборка Docker-образа без Compose

Собрать образ:

```powershell
docker build -t autosnab-copilotkit-demo:local .
```

Запустить контейнер:

```powershell
docker run --detach `
  --name autosnab-copilotkit-demo-local `
  --publish 3000:3000 `
  --env-file .env.local `
  autosnab-copilotkit-demo:local
```

Проверить логи:

```powershell
docker logs autosnab-copilotkit-demo-local
```

Удалить контейнер:

```powershell
docker rm -f autosnab-copilotkit-demo-local
```

## Структура проекта

```text
autosnab-copilotkit-demo/
├── public/
├── src/
│   ├── __tests__/
│   ├── app/
│   │   ├── api/
│   │   │   └── copilotkit/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── applications_dashboard.tsx
│   │   ├── dashboard_states.tsx
│   │   ├── status_change_modal.tsx
│   │   └── toast_notification.tsx
│   ├── data/
│   │   └── applications.ts
│   └── types/
│       └── application.ts
├── .dockerignore
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
├── package-lock.json
├── vitest.config.mts
└── vitest.setup.ts
```

## Безопасность

В проекте предусмотрены следующие меры:

- используются только синтетические данные;
- API-ключ хранится в `.env.local`;
- `.env.local` исключён из Git;
- секреты не копируются в Docker-образ;
- Docker-контейнер запускается не от пользователя `root`;
- изменение статуса требует подтверждения человека;
- контейнер имеет HTTP healthcheck.

## Ограничения AI-провайдера

Для работы AI требуется действующий API-ключ выбранного провайдера.

Доступность провайдера может зависеть от региона, тарифа и настроек аккаунта. Например, OpenAI может вернуть ошибку:

```text
unsupported_country_region_territory
```

Такая ошибка связана с доступностью провайдера в регионе выполнения запроса, а не с интерфейсом dashboard или регистрацией frontend tools.

Архитектура проекта не привязана к одному поставщику: модель задаётся через `COPILOTKIT_MODEL`, а ключ передаётся через переменную окружения соответствующего провайдера.

## Основные команды

```powershell
npm ci
npm run dev
npm run lint
npm run test:run
npm run build
docker compose up --build --detach
docker compose ps
docker compose logs --tail 30 app
docker compose down
```
