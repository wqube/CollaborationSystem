# Система совместной работы

Учебный проект в рамках проектного практикума **Т-Банка**.

---

## Стек технологий

**Frontend:** React, TypeScript, Vite

---

## Структура репозитория

```
CollaborationSystem/
├── frontend/        # React + TypeScript приложение
└── README.md
```

---

## Начало работы

### 1. Клонировать репозиторий

```bash
git clone https://github.com/wqube/CollaborationSystem/tree/develop
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
| `main` | Продакшн. Только через Pull Request |
| `develop` | Основная ветка разработки. Все фичи сливаются сюда |

### Перед началом каждой задачи

```bash
# Убедиться, что develop актуальна
git checkout develop
git pull origin develop

# Создать свою ветку от develop
git checkout -b feature/fe-название-задачи   # для фронтенда
git checkout -b feature/be-название-задачи   # для бэкенда
git checkout -b fix/описание-бага            # для исправления багов
```

### Примеры названий веток

```
feature/fe-login-page
feature/fe-dashboard
feature/be-auth-api
feature/be-user-service
fix/be-token-expiration
```

### Завершение задачи

```bash
git add .
git commit -m "feat: описание изменений"
git push origin feature/fe-название-задачи
```

Затем открыть **Pull Request** в `develop` на GitHub и назначить ревьюера.

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
| QA (x1) | Тестирование, ревью PR в `main` |