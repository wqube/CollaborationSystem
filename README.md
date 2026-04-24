# Система совместной работы
Учебный проект в рамках проектного практикума **Т-Банка**.
---
## Стек технологий
**Frontend:** React, TypeScript, Vite
**Backend:** .NET
---
## Структура репозитория
```
CollaborationSystem/
├── backend/         # .NET приложение
├── frontend/        # React + TypeScript приложение
└── README.md
```
---
## Начало работы
### 1. Клонировать репозиторий
```bash
git clone https://github.com/wqube/CollaborationSystem/tree/develop
cd CollaborationSystem
```
### 2. Переключиться на ветку develop
```bash
git checkout develop
```
### 3. Установить зависимости (фронтенд)
```bash
cd frontend
npm install
```
### 4. Запустить проект локально
```bash
npm run dev
```
Приложение будет доступно по адресу `http://localhost:5173`
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
        │  Pull Request принимается после approve QA
        ▼
      main
```

### Типы веток

| Префикс | Когда использовать | Примеры |
|---------|-------------------|---------|
| `feature/` | Новый функционал из задачи | `feature/fe-login-page` |
| `fix/` | Исправление бага, найденного в ходе разработки или QA | `fix/be-token-expiration` |
| `chore/` | Технические задачи без изменения функционала: настройка линтера, обновление зависимостей, правки README, конфиги CI | `chore/eslint-config` |

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

Используем префиксы в сообщениях коммитов, соответствующие типу ветки:

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

### НАЗВАНИЯ КОММИТОВ ПИШЕМ НА АНГЛИЙСКОМ!!!

### Pull Request в main

PR из `develop` в `main` открывает **QA** после того, как протестировал ветку `develop`.
Команда смотрит изменения, QA даёт approve — PR принимается.

---
## Для бэкенд-разработчиков
После клонирования репозитория и переключения на `develop` — инициализируйте бэкенд в папке `backend/` в корне проекта:
```bash
# Находясь в корне репозитория
mkdir backend
cd backend
# Инициализируйте свой проект здесь
```
---
## Команда
| Роль | Зона ответственности |
|------|---------------------|
| Frontend (x2) | React-приложение, UI/UX |
| Backend (x2) | API, бизнес-логика, база данных |
| QA (x1) | Тестирование, открытие PR из `develop` в `main` |
