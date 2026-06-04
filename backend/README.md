# Backend

Backend-часть проекта "Система совместной работы": ASP.NET Core API, PostgreSQL,
Entity Framework Core, JWT-аутентификация и Swagger.

## Стек

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core 9
- PostgreSQL 16
- Docker Compose
- Swagger / OpenAPI

## Структура

```text
backend/
├── src/
│   ├── CollaborationSystem.Api              # HTTP API, Swagger, DI, CORS, healthcheck
│   ├── CollaborationSystem.Application      # DTO, валидаторы, контракты сервисов
│   ├── CollaborationSystem.Domain           # доменные сущности и enum
│   └── CollaborationSystem.Infrastructure   # EF Core, авторизация, сервисы, миграции
├── tests/                                   # xUnit-тесты
├── Dockerfile.dev
├── docker-compose.yml                       # PostgreSQL для локального запуска backend
├── API.md                                   # актуальный REST API v1
└── CollaborationSystem.sln
```

Миграции находятся в:

```text
src/CollaborationSystem.Infrastructure/Persistence/Migrations
```

## Переменные окружения

Значения по умолчанию лежат в
`src/CollaborationSystem.Api/appsettings.json`. В Docker Compose они
переопределяются через переменные окружения.

Пароли БД и секретные ключи в README не дублируются. Локальные значения для
разработки находятся в конфигурационных файлах проекта, а для общих окружений
задаются через переменные окружения или хранилище секретов.

| Переменная                             | Назначение                               | Где задано для локального запуска                         |
| -------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `ASPNETCORE_ENVIRONMENT`               | окружение ASP.NET Core                   | root `docker-compose.dev.yml`                             |
| `ASPNETCORE_URLS`                      | адреса, которые слушает API в контейнере | root `docker-compose.dev.yml`                             |
| `ConnectionStrings__DefaultConnection` | строка подключения к PostgreSQL          | `appsettings.json`, root `docker-compose.dev.yml`         |
| `Jwt__Issuer`                          | issuer для access-токена                 | `appsettings.json`                                        |
| `Jwt__Audience`                        | audience для access-токена               | `appsettings.json`                                        |
| `Jwt__Key`                             | ключ подписи JWT                         | `appsettings.json`, для общих окружений задаётся секретом |
| `Jwt__AccessTokenLifetimeMinutes`      | время жизни access-токена в минутах      | `appsettings.json`                                        |
| `Auth__RefreshTokenCookieName`         | имя cookie с refresh-токеном             | `appsettings.json`                                        |
| `Auth__RefreshTokenCookiePath`         | path для refresh-token cookie            | `appsettings.json`                                        |
| `Auth__RefreshTokenCookieSecure`       | требовать HTTPS для refresh-token cookie | `appsettings.json`, root `docker-compose.dev.yml`         |
| `Auth__RefreshTokenLifetimeDays`       | время жизни refresh-токена в днях        | `appsettings.json`                                        |
| `Cors__AllowedOrigins__0`              | разрешённый origin фронтенда             | `appsettings.json`, root `docker-compose.dev.yml`         |

Переменные PostgreSQL в compose-файлах:

| Переменная          | Назначение             | Где задано                                                  |
| ------------------- | ---------------------- | ----------------------------------------------------------- |
| `POSTGRES_DB`       | имя базы данных        | root `docker-compose.dev.yml`, `backend/docker-compose.yml` |
| `POSTGRES_USER`     | пользователь БД        | root `docker-compose.dev.yml`, `backend/docker-compose.yml` |
| `POSTGRES_PASSWORD` | пароль пользователя БД | root `docker-compose.dev.yml`, `backend/docker-compose.yml` |

## Запуск через Docker Compose

Рекомендуемый способ для чистого запуска всего проекта находится в корне
репозитория. Он поднимает PostgreSQL, backend и frontend:

```bash
docker compose -f docker-compose.dev.yml up --build
```

После запуска:

- Backend API: `http://localhost:5227`
- Swagger: `http://localhost:5227/swagger`
- Healthcheck: `http://localhost:5227/health`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

Для полного пересоздания базы и контейнеров:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

## Локальный запуск backend с PostgreSQL в Docker

Если нужно запустить только PostgreSQL в контейнере, а API стартовать из IDE или
через `dotnet run`, используйте compose-файл из папки backend:

```bash
cd backend
docker compose up -d
dotnet run --project src/CollaborationSystem.Api
```

В этом режиме API использует строку подключения из `appsettings.json`. Имя базы
в `backend/docker-compose.yml` должно совпадать с базой из строки подключения.

Формат строки подключения:

```text
Host=<host>;Port=<port>;Database=<database>;Username=<user>;Password=<password>
```

API по умолчанию доступен на адресах из
`src/CollaborationSystem.Api/Properties/launchSettings.json`.

## Миграции

Миграции применяются автоматически при старте API:

```csharp
dbContext.Database.Migrate();
```

Это работает и в Docker Compose, и при локальном запуске через `dotnet run`.

Для ручного применения из корня репозитория:

```bash
dotnet tool restore
dotnet ef database update \
  --project backend/src/CollaborationSystem.Infrastructure \
  --startup-project backend/src/CollaborationSystem.Api
```

Если PostgreSQL поднят через `backend/docker-compose.yml`, ту же команду можно
запустить из папки `backend`:

```bash
dotnet ef database update \
  --project src/CollaborationSystem.Infrastructure \
  --startup-project src/CollaborationSystem.Api
```

Создание новой миграции:

```bash
dotnet ef migrations add MigrationName \
  --project backend/src/CollaborationSystem.Infrastructure \
  --startup-project backend/src/CollaborationSystem.Api \
  --output-dir Persistence/Migrations
```

## Проверка запуска

```bash
git clone <repo-url>
cd CollaborationSystem
docker compose -f docker-compose.dev.yml up --build
```

После запуска:

1. `GET http://localhost:5227/health` возвращает `{"status":"ok"}`.
2. `http://localhost:5227/swagger` открывает Swagger UI.
3. `http://localhost:5173` открывает frontend.
4. В логах backend нет ошибок применения EF Core migrations.

Тестовые пользователи для локального dev-стенда и защиты:

| Пользователь | Email | Пароль |
| ------------- | ------------------ | ---------- |
| Test User | `test@test.local` | `password` |
| Admin User | `admin@test.local` | `password` |
| Михаил Баранов | `mikhail.baranov@test.local` | `password` |
| Анна Иванова | `anna.ivanova@test.local` | `password` |
| Дмитрий Петров | `dmitry.petrov@test.local` | `password` |
| Екатерина Смирнова | `ekaterina.smirnova@test.local` | `password` |
| Иван Кузнецов | `ivan.kuznetsov@test.local` | `password` |
| София Попова | `sofia.popova@test.local` | `password` |
| Алексей Волков | `alexey.volkov@test.local` | `password` |
| Мария Соколова | `maria.sokolova@test.local` | `password` |
| Эльмир Нуруллин | `elmir.nurullin@test.local` | `password` |
| Никита Малышонков | `nikita.malyshonkov@test.local` | `password` |
| Заварзин Всеволод | `vsevolod.zavarzin@test.local` | `password` |
| Тарасов Александр | `alexander.tarasov@test.local` | `password` |

## Тесты

Из корня репозитория:

```bash
dotnet test backend/CollaborationSystem.sln
```

Из папки `backend`:

```bash
dotnet test CollaborationSystem.sln
```

## Полезные команды

```bash
# посмотреть логи backend
docker compose -f docker-compose.dev.yml logs -f backend

# остановить стенд без удаления базы
docker compose -f docker-compose.dev.yml down

# остановить стенд и удалить volume PostgreSQL
docker compose -f docker-compose.dev.yml down -v
```

## Рекомендуемая среда

- Docker Desktop
- .NET 10 SDK для локального запуска без контейнера
- Visual Studio 2022, JetBrains Rider или VS Code + C# Dev Kit
