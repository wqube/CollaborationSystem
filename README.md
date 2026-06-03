# Система совместной работы
Учебный проект в рамках проектного практикума **Т-Банка**.

---

## Стек технологий

**Frontend:** React, TypeScript, Vite

**Backend:** .NET 10, PostgreSQL, EF Core

---

## Структура репозитория

```
CollaborationSystem/
├── frontend/              # React + TypeScript приложение
├── backend/               # .NET 10 API, PostgreSQL, EF Core миграции
├── docker-compose.dev.yml # локальный dev-стенд: frontend + backend + PostgreSQL
├── dotnet-tools.json      # локальные .NET tools, включая dotnet-ef
└── README.md
```

Документация по запуску каждой части находится в соответствующей папке:
- `frontend/README.md` — установка зависимостей, запуск фронтенда
- `backend/README.md` — настройка БД, запуск API

---

## Работа с ветками

Мы используем упрощённый **Git Flow**. Основные ветки:

| Ветка | Назначение |
|-------|-----------|
| `main` | Продакшн. Только через Pull Request из `develop` после проверки QA |
| `develop` | Основная ветка разработки. Все фичи сливаются сюда |

### Жизненный цикл изменения

```
feature/* или fix/* или chore/*
        │
        │  Pull Request + code review команды
        ▼
     develop
        │
        │  QA тестирует develop
        │  мерж в main после approve QA
        ▼
      main
```

### Типы веток

| Префикс | Когда использовать | Примеры |
|---------|-------------------|---------|
| `feature/` | Новый функционал из задачи | `feature/fe-login-page` |
| `fix/` | Исправление бага, найденного в ходе разработки или QA | `fix/be-token-expiration` |
| `chore/` | Технические задачи без изменения функционала: настройка линтера, обновление зависимостей, правки README, конфиги | `chore/eslint-config` |

### Перед началом каждой задачи

```bash
# Убедиться, что develop актуальна
git checkout develop
git pull origin develop

# Создать свою ветку от develop
git checkout -b feature/fe-название-задачи   # для фронтенда
git checkout -b feature/be-название-задачи   # для бэкенда
git checkout -b fix/be-описание-бага         # для исправления багов
git checkout -b chore/описание               # для технических задач
```

### Примеры названий веток

```
feature/fe-login-page
feature/fe-dashboard
feature/be-auth-api
feature/be-suggestions-crud
fix/be-token-expiration
fix/fe-vote-button-state
chore/update-dependencies
chore/fix-readme
```

### Коммиты

Используем префиксы в сообщениях коммитов, соответствующие типу изменения:

| Префикс | Когда использовать |
|---------|-------------------|
| `feat:` | Новый функционал |
| `fix:` | Исправление бага |
| `chore:` | Технические изменения без влияния на функционал |
| `refactor:` | Рефакторинг без изменения поведения |
| `docs:` | Изменения в документации |

```bash
git commit -m "feat: добавить страницу логина"
git commit -m "fix: исправить истечение токена при рефреше"
git commit -m "chore: обновить зависимости фронтенда"
git commit -m "docs: обновить README"
```

### Завершение задачи

```bash
git add .
git commit -m "feat: описание изменений"
git push origin feature/fe-название-задачи
```

Затем открыть **Pull Request** в `develop` на GitHub и назначить ревьюера из команды.

## НАЗВАНИЕ КОММИТОВ ПИШЕМ НА АНГЛИЙСКОМ

---

## Команда

| Роль | Имя, GitHub - никнейм | Зона ответственности |
|----------|----------------------------------|-----------------------------------|
| Frontend | Баранов Михаил - @wqube (Тимлид) | React-приложение, UI/UX           |
| Frontend | Тарасов Александр - @qwatr1x     | React-приложение, UI/UX           |
| Backend  | Малышонков Никита - @Kr1st10     | API, бизнес-логика, база данных   |
| Backend  | Нурулин Эльмир - @MUZHIKI        | API, бизнес-логика, база данных   |
| QA       | Заварзин Всеволод - @dlapy       | Тестирование, проверка `develop` перед мержем в `main` |

---

## Локальный dev-стенд

Из корня репозитория:

```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

## Production Docker-стенд

Из корня репозитория:

```bash
cp .env.example .env
# Обязательно поменять POSTGRES_PASSWORD, JWT_KEY и PUBLIC_ORIGIN под сервер.
docker compose up -d --build
```

Production-стенд запускается в отдельных контейнерах:
- `frontend` — nginx раздает React build и проксирует `/api` и `/health` в backend.
- `backend` — ASP.NET API слушает `8080` внутри Docker-сети.
- `postgres` — PostgreSQL 16 с постоянным volume `postgres-data`.
- Наружу публикуется только frontend-порт `APP_PORT`, по умолчанию `8082`.

Проверка после запуска:

```bash
curl http://localhost:8082/health
docker compose ps
```

Для сервера достаточно открыть наружу только `APP_PORT`. Backend и PostgreSQL
остаются доступными только внутри Docker-сети и не публикуются отдельными host-портами.

Если приложение доступно через HTTPS-домен, в `.env` нужно указать:

```env
PUBLIC_ORIGIN=https://example.com
APP_PORT=8082
REFRESH_TOKEN_COOKIE_SECURE=true
```

Dev-сервисы:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5227`
- Swagger: `http://localhost:5227/swagger`
- PostgreSQL: `localhost:5432`

Что происходит при запуске:
- API применяет EF Core migrations на старте (`Database.Migrate()`).
- Backend ждёт готовности PostgreSQL через Docker healthcheck.
- Refresh-token cookie работает в локальном HTTP-режиме.

Переменные окружения backend, локальный запуск API и ручное применение миграций
описаны в `backend/README.md`.

Тестовые пользователи для локального dev-стенда и защиты:

| Пользователь | Email | Пароль |
|---|---|---|
| Test User | `test@test.local` | `password` |
| Admin User | `admin@test.local` | `password` |
| Михаил Баранчик | `mikhail.baranchik@test.local` | `password` |
| Анна Иванова | `anna.ivanova@test.local` | `password` |
| Дмитрий Петров | `dmitry.petrov@test.local` | `password` |
| Екатерина Смирнова | `ekaterina.smirnova@test.local` | `password` |
| Иван Кузнецов | `ivan.kuznetsov@test.local` | `password` |
| София Попова | `sofia.popova@test.local` | `password` |
| Алексей Волков | `alexey.volkov@test.local` | `password` |
| Мария Соколова | `maria.sokolova@test.local` | `password` |

Если авторизация не проходит:
1. Открыть DevTools -> Application -> Cookies и проверить `refreshToken` для `http://localhost:5227`.
2. Проверить API: `GET http://localhost:5227/health` должен вернуть `{"status":"ok"}`.
3. Проверить, что frontend отправляет запросы на `http://localhost:5227/api/v1`.
4. Пересоздать контейнеры после изменений:
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up --build
   ```
