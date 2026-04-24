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
├── frontend/        # React + TypeScript приложение
├── backend/         # .NET 10 API, PostgreSQL
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
