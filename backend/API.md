# REST API v1

## 1. Общие договоренности

- Базовый префикс API: `/api/v1`
- Формат данных: `application/json`
- Идентификаторы сущностей: `UUID`
- Время: ISO 8601 UTC, например `2026-04-09T18:30:00Z`
- Имена полей в JSON: `camelCase`
- Защищенные endpoints требуют заголовок `Authorization: Bearer <accessToken>`

### Авторизация

Backend использует JWT access token и refresh token в HTTP-only cookie.

- `POST /api/v1/auth/login` возвращает `accessToken` и устанавливает refresh-token cookie.
- `POST /api/v1/auth/refresh` читает refresh token из cookie, ротирует refresh-сессию и возвращает новый `accessToken`.
- `POST /api/v1/auth/logout` отзывает текущую refresh-сессию и очищает cookie.
- Refresh token не передается в JSON-ответах.
- При новом login предыдущая активная refresh-сессия пользователя инвалидируется.
- Регистрация пользователей через API не предусмотрена.

Для локального dev-стенда используется `DevLogin`: тестовые пользователи создаются seed-данными в БД, backend проверяет email и пароль через `UsersProfile` и выдает JWT.

### Пагинация

Коллекционные endpoints возвращают общий формат:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 42
}
```

### Ошибки

Стандартные ошибки возвращаются в формате ASP.NET Core `ProblemDetails` или `ValidationProblemDetails`.

Пример:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "name": ["'Name' must not be empty."]
  }
}
```

Основные статусы:

- `400 Bad Request` — ошибка валидации или некорректный запрос
- `401 Unauthorized` — пользователь не аутентифицирован
- `403 Forbidden` — недостаточно прав
- `404 Not Found` — сущность не найдена
- `409 Conflict` — конфликт состояния

Для превышения лимита голосов используется `409 Conflict` с расширениями:

```json
{
  "title": "Vote limit exceeded.",
  "status": 409,
  "code": "VoteLimitExceeded",
  "nextResetAt": "2026-04-10T18:30:00Z",
  "voteQuota": {
    "votesLimit": 10,
    "votesRemaining": 0,
    "nextResetAt": "2026-04-10T18:30:00Z"
  }
}
```

## 2. Enum

```json
{
  "SuggestionStatus": ["New", "InProgress", "Accepted", "Rejected"],
  "VoteType": ["Up", "Down"],
  "DraftType": ["Suggestion", "Comment"],
  "ProjectRole": ["Member", "Admin"],
  "AuthMode": ["DevLogin", "SSO"]
}
```

## 3. Основные DTO

### Auth

`LoginRequest`

```json
{
  "email": "ivan.petrov@example.local",
  "password": "password"
}
```

`AuthResponse` / `RefreshResponse`

```json
{
  "accessToken": "jwt-access-token",
  "expiresIn": 900,
  "user": {
    "id": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
    "displayName": "Иван Петров",
    "email": "ivan.petrov@example.local"
  }
}
```

`CurrentUserResponse`

```json
{
  "id": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
  "displayName": "Иван Петров",
  "email": "ivan.petrov@example.local",
  "authMode": "DevLogin"
}
```

### Projects

`CreateProjectRequest`

```json
{
  "name": "Core Platform",
  "description": "Проект команды Core Platform"
}
```

`UpdateProjectRequest`

```json
{
  "name": "Core Platform",
  "description": "Обновленное описание проекта"
}
```

`ProjectSummaryResponse`

```json
{
  "id": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "name": "Core Platform",
  "description": "Проект команды Core Platform",
  "role": "Admin",
  "lastAccessedAt": "2026-04-09T18:30:00Z",
  "createdByUserId": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
  "createdAtUtc": "2026-04-01T10:00:00Z",
  "updatedAtUtc": "2026-04-09T18:30:00Z"
}
```

`ProjectDetailsResponse`

```json
{
  "id": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "name": "Core Platform",
  "description": "Проект команды Core Platform",
  "createdByUserId": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
  "createdAtUtc": "2026-04-01T10:00:00Z",
  "updatedAtUtc": "2026-04-09T18:30:00Z",
  "voteSettings": {
    "votesPerUser": 10,
    "voteResetPeriodDays": 7
  },
  "currentUserVoteQuota": {
    "votesLimit": 10,
    "votesRemaining": 8,
    "nextResetAt": "2026-04-16T10:00:00Z"
  },
  "members": []
}
```

`UpdateProjectSettingsRequest` / `ProjectVoteSettingsResponse`

```json
{
  "votesPerUser": 10,
  "voteResetPeriodDays": 7
}
```

`ProjectDashboardResponse`

```json
{
  "project": {
    "id": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
    "name": "Core Platform",
    "description": "Проект команды Core Platform",
    "role": "Admin",
    "lastAccessedAt": "2026-04-09T18:30:00Z"
  },
  "voteSettings": {
    "votesPerUser": 10,
    "voteResetPeriodDays": 7
  },
  "currentUserVoteQuota": {
    "votesLimit": 10,
    "votesRemaining": 8,
    "nextResetAt": "2026-04-16T10:00:00Z"
  },
  "membersPreview": [
    {
      "userId": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
      "displayName": "Иван Петров",
      "role": "Admin"
    }
  ],
  "suggestions": {
    "items": [],
    "page": 1,
    "pageSize": 10,
    "total": 0
  }
}
```

### Project Members

`AddProjectMemberRequest`

```json
{
  "userId": "37b64aa3-970a-4d27-9966-b0f17d89f10a",
  "role": "Member"
}
```

`UpdateProjectMemberRoleRequest`

```json
{
  "role": "Admin"
}
```

`ProjectMemberResponse`

```json
{
  "projectId": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "userId": "37b64aa3-970a-4d27-9966-b0f17d89f10a",
  "displayName": "Анна Соколова",
  "email": "anna.sokolova@example.local",
  "role": "Member",
  "joinedAt": "2026-04-09T19:10:00Z"
}
```

### Suggestions, Votes, Comments

`CreateSuggestionRequest` / `UpdateSuggestionRequest`

```json
{
  "text": "Добавить обязательный шаблон ретро перед встречей"
}
```

`UpdateSuggestionStatusRequest`

```json
{
  "status": "InProgress"
}
```

`SuggestionSummaryResponse`

```json
{
  "id": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
  "projectId": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "text": "Добавить обязательный шаблон ретро перед встречей",
  "status": "New",
  "author": {
    "id": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
    "displayName": "Иван Петров"
  },
  "score": 5,
  "currentUserVote": "Up",
  "createdAt": "2026-04-09T18:30:00Z",
  "updatedAt": "2026-04-09T18:40:00Z"
}
```

`SuggestionDetailsResponse`

```json
{
  "id": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
  "projectId": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "text": "Добавить обязательный шаблон ретро перед встречей",
  "status": "New",
  "author": {
    "id": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
    "displayName": "Иван Петров"
  },
  "score": 5,
  "currentUserVote": "Up",
  "createdAt": "2026-04-09T18:30:00Z",
  "updatedAt": "2026-04-09T18:40:00Z",
  "votes": [
    {
      "userId": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
      "displayName": "Иван Петров",
      "voteType": "Up",
      "createdAt": "2026-04-09T18:35:00Z"
    }
  ]
}
```

`VoteRequest`

```json
{
  "voteType": "Up"
}
```

`VoteResponse`

```json
{
  "suggestionId": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
  "currentUserVote": "Up",
  "score": 5,
  "voteQuota": {
    "votesLimit": 10,
    "votesRemaining": 8,
    "nextResetAt": "2026-04-16T10:00:00Z"
  }
}
```

`CreateCommentRequest`

```json
{
  "text": "Поддерживаю, это сократит время встречи.",
  "parentCommentId": null
}
```

`UpdateCommentRequest`

```json
{
  "text": "Поддерживаю, это сократит время встречи и повысит предсказуемость."
}
```

`CommentResponse`

```json
{
  "id": "4da7d53c-3389-4bf1-ac11-d4e2720fccd9",
  "projectId": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "suggestionId": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
  "parentCommentId": null,
  "text": "Поддерживаю, это сократит время встречи.",
  "author": {
    "id": "3f11a6dc-79a6-43f7-ac88-bb78dd70d712",
    "displayName": "Иван Петров"
  },
  "createdAt": "2026-04-09T18:45:00Z",
  "updatedAt": "2026-04-09T18:45:00Z"
}
```

### Drafts

`UpsertSuggestionDraftRequest`

```json
{
  "text": "Добавить шаблон ретро..."
}
```

`UpsertCommentDraftRequest`

```json
{
  "suggestionId": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
  "parentCommentId": null,
  "text": "Нужно уточнить формат шаблона."
}
```

`DraftResponse`

```json
{
  "id": "f14855cd-0bfd-49cf-b59e-b41f5e8ef2aa",
  "projectId": "7ca7d640-d843-45b2-9701-0b0efb8c4af1",
  "type": "Comment",
  "payload": {
    "suggestionId": "d68650b5-dfc5-45be-b525-8b0c64c4e54a",
    "parentCommentId": null,
    "text": "Нужно уточнить формат шаблона."
  },
  "updatedAt": "2026-04-09T19:15:00Z"
}
```

## 4. Endpoints

### 4.1 Health

| Method | Endpoint | Назначение | Auth |
|---|---|---|---|
| `GET` | `/health` | Проверка, что API поднят | Нет |

Ответ:

```json
{
  "status": "ok"
}
```

### 4.2 Auth

| Method | Endpoint | Тело запроса | Успешный ответ | Ошибки |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `LoginRequest` | `200 AuthResponse` + refresh-token cookie | `400`, `401` |
| `POST` | `/api/v1/auth/refresh` | нет | `200 RefreshResponse` + новая refresh-token cookie | `401` |
| `POST` | `/api/v1/auth/logout` | нет | `204 No Content` + очистка cookie | - |

### 4.3 Users

| Method | Endpoint | Назначение | Query params | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `GET` | `/api/v1/users` | Поиск пользователей | `search`, `page`, `pageSize` | `200 PagedResponse<UserListItemResponse>` | `400`, `401` |
| `GET` | `/api/v1/users/me` | Текущий пользователь | - | `200 CurrentUserResponse` | `401` |

### 4.4 Projects

| Method | Endpoint | Назначение | Тело/Query | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `GET` | `/api/v1/projects` | Список проектов текущего пользователя | query: `page`, `pageSize` | `200 PagedResponse<ProjectSummaryResponse>` | `400`, `401` |
| `POST` | `/api/v1/projects` | Создать проект | `CreateProjectRequest` | `201 ProjectSummaryResponse` | `400`, `401`, `409` |
| `GET` | `/api/v1/projects/{projectId}` | Детали проекта | - | `200 ProjectDetailsResponse` | `401`, `403`, `404` |
| `PATCH` | `/api/v1/projects/{projectId}` | Изменить название и описание проекта | `UpdateProjectRequest` | `200 ProjectSummaryResponse` | `400`, `401`, `403`, `404`, `409` |
| `GET` | `/api/v1/projects/{projectId}/dashboard` | Данные для dashboard проекта | query: `status`, `page`, `pageSize` | `200 ProjectDashboardResponse` | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/v1/projects/{projectId}/settings` | Изменить настройки голосования | `UpdateProjectSettingsRequest` | `200 ProjectVoteSettingsResponse` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/projects/{projectId}` | Мягко удалить проект | - | `204 No Content` | `401`, `403`, `404` |

Правила:

- Создатель проекта автоматически становится `Admin`.
- Название проекта уникально среди активных проектов.
- Редактировать проект, менять настройки и удалять проект может только `Admin`.
- Удаленный проект скрывается из списков, деталей, dashboard, suggestions, comments, votes и drafts.

### 4.5 Project members

| Method | Endpoint | Назначение | Тело | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `POST` | `/api/v1/projects/{projectId}/members` | Добавить участника | `AddProjectMemberRequest` | `201 ProjectMemberResponse` | `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/v1/projects/{projectId}/members/{userId}` | Изменить роль участника | `UpdateProjectMemberRoleRequest` | `200 ProjectMemberResponse` | `400`, `401`, `403`, `404`, `409` |
| `DELETE` | `/api/v1/projects/{projectId}/members/{userId}` | Удалить участника | - | `204 No Content` | `401`, `403`, `404`, `409` |
| `DELETE` | `/api/v1/projects/{projectId}/members/me` | Выйти из проекта текущим пользователем | - | `204 No Content` | `401`, `403`, `404`, `409` |

Правила:

- Управлять участниками может только `Admin`.
- В проекте всегда должен оставаться хотя бы один `Admin`.
- `Member` может выйти из проекта сам.
- `Admin` может выйти только если в проекте остается другой `Admin`.

### 4.6 Suggestions and votes

| Method | Endpoint | Назначение | Тело/Query | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `GET` | `/api/v1/projects/{projectId}/suggestions` | Список предложений проекта | query: `status`, `search`, `sort`, `order`, `page`, `pageSize` | `200 PagedResponse<SuggestionSummaryResponse>` | `400`, `401`, `403`, `404` |
| `POST` | `/api/v1/projects/{projectId}/suggestions` | Создать предложение | `CreateSuggestionRequest` | `201 SuggestionSummaryResponse` | `400`, `401`, `403`, `404`, `409` |
| `GET` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}` | Детали предложения | - | `200 SuggestionDetailsResponse` | `401`, `403`, `404` |
| `PATCH` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}` | Изменить текст предложения | `UpdateSuggestionRequest` | `200 SuggestionSummaryResponse` | `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}/status` | Изменить статус предложения | `UpdateSuggestionStatusRequest` | `200 SuggestionSummaryResponse` | `400`, `401`, `403`, `404`, `409` |
| `PUT` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}/vote` | Поставить или заменить голос | `VoteRequest` | `200 VoteResponse` | `400`, `401`, `403`, `404`, `409` |
| `DELETE` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}/vote` | Убрать свой голос | - | `200 VoteResponse` | `401`, `403`, `404` |

Query params для списка предложений:

- `status` — `New`, `InProgress`, `Accepted`, `Rejected`
- `search` — поиск по тексту предложения
- `sort` — `createdAt`, `updatedAt`, `score`
- `order` — `asc`, `desc`
- `page` — номер страницы, от `1`
- `pageSize` — размер страницы, от `1` до `100`

Правила:

- `score = Up - Down`.
- `currentUserVote` показывает голос текущего пользователя или `null`.
- Создавать и голосовать могут участники проекта.
- Редактировать текст может автор предложения.
- Менять статус может `Admin`.
- Текст предложения уникален в рамках активного проекта.
- Голоса ограничены настройками проекта `votesPerUser` и `voteResetPeriodDays`.

### 4.7 Comments

| Method | Endpoint | Назначение | Тело | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `GET` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}/comments` | Комментарии предложения плоским списком | - | `200 CommentResponse[]` | `401`, `403`, `404` |
| `POST` | `/api/v1/projects/{projectId}/suggestions/{suggestionId}/comments` | Создать комментарий или ответ | `CreateCommentRequest` | `201 CommentResponse` | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/v1/projects/{projectId}/comments/{commentId}` | Изменить комментарий | `UpdateCommentRequest` | `200 CommentResponse` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/projects/{projectId}/comments/{commentId}` | Удалить комментарий | - | `204 No Content` | `401`, `403`, `404` |

Комментарии возвращаются плоским списком. Дерево ответов собирается на клиенте по `parentCommentId`.

### 4.8 Drafts

| Method | Endpoint | Назначение | Тело/Query | Успешный ответ | Ошибки |
|---|---|---|---|---|---|
| `GET` | `/api/v1/projects/{projectId}/drafts` | Черновики текущего пользователя | query: `type`, `page`, `pageSize` | `200 PagedResponse<DraftResponse>` | `400`, `401`, `403`, `404` |
| `PUT` | `/api/v1/projects/{projectId}/drafts/suggestion/{draftId}` | Создать или обновить черновик предложения | `UpsertSuggestionDraftRequest` | `200 DraftResponse` | `400`, `401`, `403`, `404` |
| `PUT` | `/api/v1/projects/{projectId}/drafts/comment/{draftId}` | Создать или обновить черновик комментария | `UpsertCommentDraftRequest` | `200 DraftResponse` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/projects/{projectId}/drafts/{draftId}` | Удалить черновик | - | `204 No Content` | `401`, `403`, `404` |

Query params для списка черновиков:

- `type` — `Suggestion` или `Comment`
- `page` — номер страницы, от `1`
- `pageSize` — размер страницы, от `1` до `100`

## 5. Ограничения модели

- Роли проекта хранятся в membership-модели, отдельная таблица `project_admins` не нужна.
- `Creator` как отдельная роль не используется; создатель проекта становится `Admin`.
- Проект всегда должен иметь хотя бы одного `Admin`.
- Удаление проекта мягкое: запись помечается `DeletedAtUtc`.
- Агрегированный `score` предложения вычисляется из активных голосов.
- Лимит голосов настраивается на уровне проекта через `PATCH /api/v1/projects/{projectId}/settings`.
- Комментарии возвращаются плоским списком с `parentCommentId`; дерево строится на клиенте.
- Черновики моделируются отдельной сущностью с `type` и JSON `payload`.
- Refresh token связан с серверной refresh-сессией и хранится в HTTP-only cookie.
- Расписание встреч и внешние интеграции пока вне текущего API.
