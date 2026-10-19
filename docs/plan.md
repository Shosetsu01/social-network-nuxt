# План переноса на Vue 3 + Nuxt 4

Основан на [analysis.md](analysis.md) и требованиях ТЗ. Бюджет: 4 часа.
Правила и роли агентов — [agents/rules.md](agents/rules.md), [agents/roles.md](agents/roles.md).
Ревизия 2: учтены критика плана (субагент-ревьюер) и требование архитектуры FSD.

## 1. Цель и Definition of Done

Сквозной сценарий работает в браузере на мобильной (от 360 px) и десктопной ширине:
**вход → лента → действия карточки → профиль автора → назад в ленту (состояние сохранено) → выход.**

DoD:
- `npm run build`, `typecheck`, `lint`, `test` (unit), `test:e2e` — зелёные;
- в консоли нет ошибок и hydration mismatch (e2e-фикстура валит тест на `pageerror` и `console.error`);
- живая проверка в браузере на 390×844 и 1280×800;
- README по пунктам ТЗ.

## 2. Скоуп

### Переносим (ядро)

1. **Вход.** Те же правила и тексты валидации, переключатель видимости пароля, loading-состояние (кнопка disabled, спиннер), ошибка входа — inline-alert, успех → лента.
   Mock-аутентификация как в оригинале: любые валидные email и пароль дают пользователя Allan Paterson.
   «Remember me» работает: сессионная cookie или cookie на 30 дней (см. §4).
2. **Гейт авторизации.** Неавторизованный → `/login?redirect=<путь>`, где `safeRedirect` пропускает только внутренние пути. Авторизованный на `/login` → `/`.
   Сессия переживает reload и работает в SSR. **Logout работает** — чиним дефект оригинала.
3. **Лента `/`.** Карточки из `GET /api/feed`. Состояния: loading (скелетоны), error (сообщение и Retry), empty.
4. **Карточка публикации.**
   - Автор (аватар и имя) и упомянутый пользователь («Dina») — ссылки на профиль.
   - Активность: `is now connected to…` или `has checked in with… at <place>`. Время, текст.
   - Вложение: `image`, `gallery`, `video` (превью и play, без плеера) или `sound-byte`.
   - Действия: **like** (toggle, счётчик ±1, `aria-pressed`), **bookmark** (toggle), счётчик комментариев (только чтение).
5. **Профиль `/users/[id]`.** Аватар, имя, роль · компания, локация, bio, статистика followers / following / posts, connections (ссылки), sound bytes.
   Свой профиль — плюс кнопка «Log out». Неизвестный id → 404.
6. **App shell.** Шапка, навигация Home / Profile: bottom bar на мобильном, в шапке на десктопе. Переключение только через CSS, без JS-детекта ширины.

**Добавлено сверх оригинала** (в README отмечаем как «добавлено», а не «перенесено»): переход из карточки в профиль автора, профиль любого пользователя по id, рабочие like / bookmark, logout, сохранение сессии.

### Сознательно не переносим

| Что | Почему |
|---|---|
| Stories, Meetup и карта, Notifications, Connections | вне ядра по ТЗ |
| Карта, участники и «Meet Up» в check-in карточке | это функциональность Meetup; check-in показываем текстом с местом |
| Наложенная карточка контакта (телефон, email) в First | декор; связь «connected to Dina» остаётся ссылкой на профиль |
| Sign up, Forgot password, соц-логины | в оригинале заглушки «coming soon», логики нет |
| Добавление комментария, share, создание поста | в UI оригинала нет элементов управления; сценарию не нужны |
| Edit профиля, View All, My activity, Private Information | заглушки и декор; приватные данные не показываем |
| Анимации, пиксельная точность | не требуется |
| Реальный бэкенд, лайки между сессиями | моки как в оригинале; лайки живут в сторе текущей сессии |

## 3. Архитектура: Feature-Sliced Design поверх Nuxt 4

Правило импорта: слой видит только нижележащие слои, `pages → widgets → features → entities → shared`. Slice'ы одного слоя друг друга не импортируют. Снаружи slice доступен только через свой `index.ts`.
Автоимпорт компонентов Nuxt выключен (`components: { dirs: [] }` в `nuxt.config.ts`): в FSD нужны явные импорты через публичный API. Поэтому `pathPrefix` и авто-имена вида `<FeedPostCard>` не возникают. Автоимпорт Vue / Nuxt API (`ref`, `useFetch`, `defineStore`…) остаётся.

Имена компонентов фиксированы, чтобы параллельные субагенты не разошлись:

| Слой / slice | Компоненты |
|---|---|
| `shared/ui` | `AppIcon`, `AppAvatar`, `AppButton`, `AppSpinner`, `SoundByteCard` |
| `entities/post/ui` | `PostCard`, `PostCardSkeleton`, `PostAttachment`, `AttachmentImage`, `AttachmentGallery`, `AttachmentVideo` (sound-byte рендерит `SoundByteCard`) |
| `entities/user/ui` | `UserLink` |
| `features` | `LoginForm`, `LogoutButton`, `LikeButton`, `BookmarkButton` |
| `widgets` | `AppHeader`, `BottomNav`, `PostFeed`, `UserProfile` (внутренние: `ProfileHeader`, `ProfileStats`, `ProfileConnections`) |

```
shared/                              # корень (Nuxt 4): контракты клиент ↔ сервер, алиас #shared
  types/            user.ts, post.ts, api.ts      # интерфейсы домена и DTO запросов/ответов
  utils/validation.ts                             # правила email/пароля (форма + сервер)

server/                              # mock-бэкенд (Nitro)
  api/auth/login.post.ts · api/feed.get.ts · api/users/[id].get.ts
  utils/mock-db.ts                                # единственное место с мок-данными

app/                                 # Nuxt srcDir; в FSD это слой app
  app.vue · error.vue · layouts/{default,auth}.vue · middleware/auth.global.ts
  assets/styles/{tokens,base}.css
  pages/            login.vue · index.vue · users/[id].vue   # слой pages: тонкие маршруты
  widgets/
    app-header/     шапка (логотип, desktop-навигация)
    bottom-nav/     мобильная навигация
    post-feed/      лента: список + loading/error/empty, собирает PostCard и фичи
    user-profile/   профиль: шапка, статистика, connections, sound bytes, logout для своего
  features/
    auth-by-email/  ui/LoginForm.vue · model/useLoginForm.ts
    logout/         ui/LogoutButton.vue  (session.logout() + feed.reset())
    toggle-like/    ui/LikeButton.vue
    toggle-bookmark/ ui/BookmarkButton.vue
  entities/
    session/        api/session.service.ts · model/session.store.ts
    post/           api/post.service.ts · model/feed.store.ts · lib/post.ts (чистые toggle-функции)
                    ui/PostCard.vue (слот #actions) · PostAttachment.vue · attachments/* · PostCardSkeleton.vue
    user/           api/user.service.ts · ui/UserLink.vue
  shared/
    api/http.ts     $fetch.create() + нормализация ошибок в ApiError     # слой API
    ui/             AppIcon · AppAvatar · AppButton · AppSpinner · SoundByteCard
    lib/            safe-redirect.ts · format-number.ts
    config/routes.ts  routes.home, routes.login, routes.user(id)
tests/unit · tests/e2e
```

| Слой из запроса | Где |
|---|---|
| Интерфейсы и типы | `shared/types` (корень): общий контракт с сервером; entity реэкспортирует свои типы из `index.ts` |
| Работа с API | `app/shared/api/http.ts`: единственный HTTP-клиент, типизированный `ApiError` |
| Сервисы запросов | `entities/*/api/*.service.ts`: типизированные функции эндпоинтов. Компоненты и сторы не вызывают `$fetch` напрямую |
| Состояние | `entities/*/model/*.store.ts`: Pinia setup-stores, только общее изменяемое состояние (сессия, лента) |
| Компоненты | `shared/ui` (кит) → `entities/*/ui` (доменные) → `features/*/ui` (действия) → `widgets/*` (композиции) |
| Страницы | `app/pages`: маршрут, `definePageMeta`, загрузка данных, сборка виджетов |

**PostCard и фичи.** Entity не может импортировать feature, поэтому `PostCard` отдаёт слот `#actions`. Виджет `post-feed` кладёт в него `LikeButton` и `BookmarkButton`.

**Без оверкода:**
- нет репозиториев с одной реализацией, DI и мапперов DTO → модель (DTO = модель, пока бэкенд не разошёлся);
- профиль read-only, поэтому `useAsyncData` + `userService` без стора.

## 4. Контракты (фиксируются в фундаменте до параллельной работы)

```ts
// сервисы
sessionService.login(body: LoginRequest): Promise<LoginResponse>        // { user: SessionUser }
postService.getFeed(): Promise<Post[]>
userService.getProfile(id: string): Promise<UserProfileResponse>         // { user, connections, soundBytes }

// useSessionStore
user: ComputedRef<SessionUser | null>; isAuthenticated: ComputedRef<boolean>
login(input: LoginRequest & { remember: boolean }): Promise<void>        // бросает ApiError
logout(): void

// useFeedStore
posts: Ref<Post[]>; status: Ref<'idle' | 'pending' | 'success' | 'error'>; error: Ref<string | null>
ensureLoaded(): Promise<void>   // no-op, если status = pending | success
reload(): Promise<void>; toggleLike(id): void; toggleBookmark(id): void; reset(): void   // у setup-стора нет $reset
```

**Технические правила** (по итогам критики):

- **Сессия.** Две cookie объявлены синхронно в setup стора: `socio_session` (сессионная) и `socio_session_persist` (maxAge 30 дней). В actions — только присваивание `.value`; `useCookie` после `await` не создаём. `user = persist ?? session`. Logout чистит обе.
- **Лента.** `ensureLoaded()` в странице: `if (import.meta.server) await feed.ensureLoaded(); else feed.ensureLoaded()`. На сервере данные приходят в HTML и гидрируются Pinia. На клиенте видны скелетоны. При возврате из профиля повторного запроса нет, лайки сохраняются. Лайк — локальная операция (серверного лайка нет).
- **404.** `throw createError({ statusCode: 404, fatal: true })`; в `error.vue` — `clearError({ redirect: '/' })`.
- **SSR = клиент.** `useId()` для `aria-describedby`; `<NuxtTime relative locale="en-US">`; без `window` в рендере.
- **Картинки.** Удалённые (`picsum.photos/id/…`, `randomuser.me`). Деградация без поломки вёрстки:
  - `AppAvatar` падает на инициалы, в том числе если ошибка случилась до гидрации (`onMounted`: `img.complete && !img.naturalWidth`);
  - у медиа постов фиксированный `aspect-ratio` и нейтральный фон-плейсхолдер, поэтому битая картинка не ломает карточку.
  В e2e внешние запросы блокируются (`page.route`), тесты детерминированы и проверяют фолбэк. Локальные копии в `public/` не кладём: лишние бинарники в репозитории и неясная лицензия портретов.
- **Шрифты.** Lato (приложение) и Urbanist (логин) через Google Fonts `<link>` с `preconnect` и `display=swap` в `app.head`. Fallback — системный стек, поэтому без сети UI не ломается. В e2e шрифтовые запросы тоже блокируются.
- **Мок-данные.** Разные авторы (Allan Paterson — текущий пользователь, Sarah Johnson, Mike Chen, Dina Foster и др.), 6 постов покрывают варианты оригинала.

## 5. Требования к реализации

- Nuxt 4.6 · Vue 3.5 · TypeScript 5.9 strict · Pinia 4 · Node 24. Только Composition API и `<script setup lang="ts">`.
- Типизированные `defineProps<…>()` / `defineEmits<…>()`. Без `any` и `@ts-ignore`.
- Иммутабельность: посты заменяются новыми объектами.
- Компонент — до ~150 строк, одна ответственность.
- Доступность:
  - семантика: `main`, `nav`, `article`, `form`, `label`; кнопки — `<button>`;
  - `aria-pressed` у переключателей, `role="alert"` для ошибки отправки;
  - видимый `:focus-visible`, `alt` у изображений, тач-цели ≥ 44 px, `prefers-reduced-motion`;
  - контраст AA: тёмный текст на оранжевом, акцентные иконки `#E65100`.
- Адаптивность: mobile-first, брейкпоинты 640 / 1024 px, без горизонтального скролла на 360 px.
- UI-тексты на английском, как в оригинале. Без `console.log`. Ошибки показываются пользователю понятным текстом.

## 6. Части работы

| # | Часть | Исполнитель | Файлы |
|---|---|---|---|
| T0 | Фундамент: scaffold (Nuxt, TS, Pinia, ESLint, Vitest), `#shared` контракты и валидация, `shared/api`, `shared/ui`, `shared/lib`, `shared/config`, токены CSS, сервисы и сторы entities, mock API, unit-тесты | субагент + ревью главного | конфиги, `shared/`, `server/`, `app/shared`, `app/entities/*/{api,model,lib}`, `tests/unit` |
| T2 | Auth и shell: `auth-by-email`, `pages/login`, layouts, `app-header`, `bottom-nav`, middleware | субагент A | только перечисленное |
| T3 | Feed: `entities/post/ui`, `toggle-like`, `toggle-bookmark`, `widgets/post-feed`, `pages/index` | субагент B | только перечисленное |
| T4 | Profile: `entities/user/ui`, `features/logout`, `widgets/user-profile`, `pages/users/[id]`, `error.vue` | субагент C | только перечисленное |
| T5 | E2E: Playwright (chromium, `webServer` = build + `node .output/server/index.mjs`), фикстуры, сценарии по UI-контракту; живая проверка — главный | субагент D | `playwright.config.ts`, `tests/e2e`, devDep Playwright |
| T6 | README, финальная сверка | главный | `README.md` |

После мержа T0 параллельно стартуют T2–T5, каждый в своём git worktree и в непересекающихся файлах (владение — roles.md). Общие точки — только контракты из T0 и UI-контракт (rules.md §6), поэтому T5 пишет тесты одновременно с реализацией. Logout отдан в T4: кнопка живёт на профиле, и у параллельных треков нет зависимостей друг от друга. Агент коммитит в свою ветку; главный агент проверяет её, отдаёт ревьюеру и мержит в `main` (rebase + fast-forward).

### Критерии приёмки

**T0:** `build`, `typecheck`, `lint`, `test` зелёные. Unit-тесты: валидация (все ветки), `safeRedirect` (`/x` ок; `//evil`, `/\evil`, `http://…`, не-строка → `/`), toggle-функции (новый объект, исходный не изменён), feed-store (`ensureLoaded` не перезапрашивает; `toggleLike` ±1; `reset`), `formatCompactNumber`. API: `login` 400 / 200 с задержкой ~600 мс, `feed` → 6 постов, `users/:id` → данные или 404.

**T2:** валидация на blur и submit с текстами оригинала; toggle пароля; disabled + спиннер во время запроса; ошибка → `role="alert"`; успех → `safeRedirect(query.redirect)`; Remember me; гейт в обе стороны в SSR и на клиенте; logout — в T4; навигация Home / Profile (Profile → `/users/<id текущего>`).

**T3:** SSR-лента и скелетоны на клиенте; error + Retry; empty; 4 типа вложений и 3 вида шапки; like ±1 с `aria-pressed`; bookmark; ссылки на профили; лайк сохраняется после профиля.

**T4:** loading и error; 404 через `error.vue`; шапка, bio, статистика (1.2K), connections-ссылки, sound bytes; logout (`features/logout`: сессия + сброс ленты → `/login`) только на своём профиле.

**T5** (desktop 1280×800 и mobile 390×844 в chromium; сценарии 2, 3, 9, 11 — только desktop; сессию для части тестов подкладываем через `context.addCookies`):
1. Без сессии `/` → `/login`.
2. Тексты ошибок валидации.
3. Toggle пароля.
4. Вход → loading → 6 карточек.
5. Like ±1.
6. Автор → профиль → назад, лайк сохранён.
7. Reload профиля — сессия жива.
8. Logout → `/login`, `/` снова редиректит.
9. Ошибка входа (`page.route` → 500) → alert.
10. Диплинк `/users/2` → логин → возврат на `/users/2`.
11. Неизвестный пользователь → 404.

## 7. Процесс

- **План целиком:** план → критика (ревьюер с чистым контекстом) → правки. Сделано: это ревизия 2.
- **Каждая часть:** бриф (роль из roles.md) → реализация в worktree → самопроверка агента (rules.md §8) → ревью (субагент-ревьюер) → правки, максимум 3 круга → проверка и мерж главным агентом → полный прогон (typecheck, lint, unit, build, e2e) и живая проверка.
- Отдельную критику брифов T2–T4 опускаем ради времени: брифы выводятся из этого плана, уже прошедшего критику.

Коммиты (Conventional Commits): `docs` (анализ и план) → `chore` (scaffold) → `feat` (контракты и mock API) → `feat(shared)` (UI-кит и токены) → `feat(auth)` → `feat(feed)` → `feat(profile)` → `test(e2e)` → `docs` (README).

## 8. Разбор критики плана

Ревьюер — отдельный субагент с чистым контекстом. Вердикт: «ship after fixes».

| # | Замечание | Решение |
|---|---|---|
| 1 | BLOCKER: T2–T4 пересекаются через сторы и layout; разные имена компонентов из-за `pathPrefix` | Принято. API сторов зафиксирован в §4, `reset()` явный. Logout живёт в feature (session + feed). Layout отдан T2. Автоимпорт компонентов выключен, имена фиксированы в §3. |
| 2 | Remember me: `useCookie` после `await` ломается | Принято: две cookie, объявленные синхронно в setup стора (§4). |
| 3 | Не описана загрузка ленты; «оптимистичное» вводит в заблуждение | Принято: `ensureLoaded()` + схема server/client (§4), формулировка исправлена. |
| 4 | Перегружен критический путь | Принято частично. Layouts → T2, Playwright → T5, критика брифов T2–T4 убрана. `SoundByteCard` оставлен в фундаменте: он нужен и T3, и T4, принимает примитивные пропсы и от типов T1 не зависит. Фундамент делает субагент, а главный агент ревьюит — критический путь не упирается в главный контекст. |
| 5 | E2E: WebKit через `devices`, нет `webServer`, никто не ловит hydration mismatch | Принято: только chromium, build + node, фикстура на `pageerror` / `console.error`, `addCookies`, часть сценариев только на desktop (§6). |
| 6 | Внешние картинки и шрифты дают флейки; фолбэк до гидрации | Принято частично. Фолбэк до гидрации и блокировка внешних запросов в e2e — да. Медиа остаются удалёнными с плейсхолдером (обоснование в §4). Шрифты: Google Fonts + системный fallback. |
| 7 | `useFetch` не бросает на 404 | Принято: `createError({ fatal: true })` + `clearError` (§4). |
| 8 | Не описана защита от open redirect | Принято: `safeRedirect` + unit-тесты (T0). |
| 9 | Правила одинакового рендера на SSR и клиенте | Принято: `useId`, навигация только на CSS, `NuxtTime locale="en-US"` (§2, §4). |
| 10 | Пропущен дефект в анализе; мок-авторы одинаковые; что добавлено, а что перенесено | Принято: дефект дописан в analysis.md, авторы разные (§4), блок «Добавлено сверх оригинала» (§2). |

## 9. Тайминг (из 4 ч)

| Этап | Время |
|---|---|
| Анализ, план, критика, ревизия | 0:00–0:50 |
| T0 фундамент + ревью | 0:50–1:30 |
| T2 / T3 / T4 / T5 параллельно + ревью | 1:30–2:30 |
| Мерж, прогон e2e, живая проверка, фиксы | 2:30–3:10 |
| T6 README, сверка, буфер | 3:10–3:45 |
