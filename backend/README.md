# Backend

Базовая структура backend-части проекта "Система совместной работы".

## Назначение

Backend предназначен для API и работы с базой данных PostgreSQL.

## Структура проекта

```text
backend/
├── src/
│   ├── CollaborationSystem.Api
│   ├── CollaborationSystem.Application
│   ├── CollaborationSystem.Domain
│   └── CollaborationSystem.Infrastructure
├── docker-compose.yml
└── CollaborationSystem.sln
```

## PostgreSQL

Подключение настроено в файле `src/CollaborationSystem.Api/appsettings.json`.

Строка подключения по умолчанию:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=collaboration_system;Username=postgres;Password=postgres"
```

Для локального запуска PostgreSQL подготовлен `docker-compose.yml`.

## Платформа

Проекты настроены на `.NET 10`.

## Запуск

1. Перейти в папку `backend`.
2. Поднять PostgreSQL:

```powershell
docker compose up -d
```

3. Восстановить пакеты и собрать проект:

```powershell
dotnet restore
dotnet build
```

4. Запустить API:

```powershell
dotnet run --project .\src\CollaborationSystem.Api
```

## Рекомендуемая среда

- Visual Studio 2022
- JetBrains Rider
- VS Code + C# Dev Kit
- Docker Desktop

## Примечание

Для локальной сборки нужен установленный `.NET 10 SDK`.
