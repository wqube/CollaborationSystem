# Collaboration System Current UI

Figma plugin для генерации актуального макета проекта `CollaborationSystem`.

Плагин сделан на базе старого рабочего `/Users/mikhail/tbank` plugin: сохранены
auto-layout примитивы, T-Bank стилистика, карточки, бейджи, тени и flow-стрелки.
Обновлена структура экранов под текущий frontend.

## Что изменено относительно старого plugin

- Убран экран `All Suggestions`, потому что отдельной `SuggestionListPage`
  больше нет.
- `Board` обновлён до текущей `ProjectPage`.
- `Projects` теперь повторяет текущий `ProjectListPage`: заголовок `Мои проекты`,
  кнопка `Новый проект`, divider и сетка карточек без хлебных крошек.
- Breadcrumbs оставлены только там, где они реально есть во frontend:
  `ProjectPage`, `Suggestion Detail`, `Profile`.
- Project selector в header показывается только на странице проекта и в
  modal-state экранах поверх неё; на детализации предложения он скрыт.
- Добавлены текущие элементы `ProjectPage`: вкладка `Черновики`, квота голосов,
  фильтры, сортировка и пагинация.
- Страницы `New Suggestion`, `Project Members`, `Settings`, `Create Project`
  переименованы и оформлены как настоящие modal/state screens с затемнённым
  overlay поверх базового экрана.
- Статусы и роли приведены к русским labels из frontend.
- На Login добавлено состояние ошибки `Неверный email или пароль`.

## Сгенерированные экраны

- `Login`
- `Projects`
- `ProjectPage`
- `Suggestion Detail`
- `ProjectPage - Drafts Tab`
- `Modal - New Suggestion`
- `Modal - Project Members`
- `Modal - Project Settings`
- `Modal - Create Project`
- `Profile`
- User Flow arrows

## Как запустить

1. Открой нужный файл в Figma.
2. Перейди в меню:

   ```text
   Plugins -> Development -> Import plugin from manifest...
   ```

3. Выбери manifest:

   ```text
   /Users/mikhail/СollaborationSystem/figma-plugin/collaboration-system-mockup/manifest.json
   ```

4. Запусти plugin:

   ```text
   Plugins -> Development -> Collaboration System Current UI
   ```

5. Плагин создаст макет на текущей странице Figma и выделит все новые фреймы.

## Проверка перед запуском

Из корня репозитория можно проверить синтаксис:

```bash
node --check figma-plugin/collaboration-system-mockup/code.js
```

## Важное

- Плагин не требует npm install или сборки.
- Логотип отрисован как lightweight T-Bank mark, чтобы plugin оставался
  автономным и не требовал доступа к файлам проекта из sandbox Figma.
- Если нужно перегенерировать макет, лучше запускать plugin на пустой странице
  или предварительно удалить старые сгенерированные фреймы.
