# Роли агентов

Каждый исполнитель работает на уровне **middle+**: сам принимает решения внутри контракта, предвидит пограничные состояния и сдаёт код, который проходит ревью без правок по стилю и архитектуре.
Общие правила — [rules.md](rules.md); критерии приёмки — [plan.md](../plan.md) §6.

**Каждый агент перед работой загружает свои скиллы** (Skill tool или чтение `~/.claude/skills/<skill>/…`) и работает по ним. Противоречие скилла и rules.md решается в пользу rules.md, отклонение указывается в отчёте.

| Роль | Тип агента | Изоляция | Порт |
|---|---|---|---|
| T0 Фундамент | `general-purpose` | worktree от `main` | 3000 |
| T2 Auth и shell | `general-purpose` | worktree от `main` после T0 | 3002 |
| T3 Лента | `general-purpose` | worktree от `main` после T0 | 3003 |
| T4 Профиль | `general-purpose` | worktree от `main` после T0 | 3004 |
| T5 E2E | `e2e-runner` | worktree от `main` после T0 | 3005 |
| Ревьюер | `vue-reviewer` (только чтение) | — | — |
| Главный агент | интеграция: мерж, полный прогон, живая проверка, README | `main` | 3000 |

T2–T5 стартуют одновременно после мержа T0. T5 пишет тесты по UI-контракту параллельно с реализацией, а прогоняет их после мержа T2–T4.

---

## T0 — Фундамент

**Профиль.** Middle+ Nuxt / TypeScript-инженер платформы. Знает структуру Nuxt 4 (`app/`, `server/`, `shared/`), Nitro и h3 (`defineEventHandler`, `readBody`, `getRouterParam`, `createError`), Pinia setup-stores, `useCookie`, `$fetch.create`, discriminated unions в TS, Vitest.

**Скиллы:** `stack-frontend` → `references/nuxt4-patterns`; `vue-patterns` (§4 State, §9 Nuxt); `tdd-workflow`.

**Владеет:**
- `package.json`, lock, `nuxt.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`;
- `shared/**`, `server/**`, `app/assets/styles/**`, `app/shared/**`;
- `app/entities/*/{api,model,lib}/**` и стартовые `app/entities/*/index.ts`;
- `app/app.vue` (`<NuxtLayout><NuxtPage /></NuxtLayout>`), заглушка `app/pages/index.vue`;
- `tests/unit/**`.

**Делает:**
1. Scaffold: `nuxt@^4.6`, `vue`, `pinia@^4.1`, `@pinia/nuxt@^1.0`, `typescript@5.9.3`, `vue-tsc`, `@nuxt/eslint` + `eslint`, `vitest`.
   Скрипты: `dev`, `build`, `preview`, `typecheck` (`nuxi typecheck`), `lint`, `test` (`vitest run`). Playwright не ставит — это T5.
2. `nuxt.config.ts`: `compatibilityDate`, `modules: ['@pinia/nuxt', '@nuxt/eslint']`, `components: { dirs: [] }`, `css` с токенами, `app.head` (`lang="en"`, Google Fonts Lato + Urbanist с `preconnect`, `display=swap`), `typescript.strict`.
3. Контракты в `shared/types` и `shared/utils/validation.ts` по plan.md §4 и rules §6 (тексты ошибок — дословно из оригинала).
4. `app/shared`:
   - `api/http.ts` — `$fetch.create` + `ApiError` с `statusCode` и `message`;
   - `ui`: `AppIcon` (inline SVG по имени, union имён), `AppAvatar` (фолбэк на инициалы, в том числе до гидрации), `AppButton`, `AppSpinner`, `SoundByteCard` (только примитивные пропсы);
   - `lib`: `safeRedirect`, `formatCompactNumber`;
   - `config/routes.ts`.
5. Сущности:
   - `session` — сервис и стор (две cookie);
   - `post` — сервис, `feed.store` (`ensureLoaded`, `reload`, `toggleLike`, `toggleBookmark`, `reset`), `lib/post.ts`;
   - `user` — сервис.
6. Mock API (`server/api/*`, `server/utils/mock-db.ts`) по фактам из rules §6. Сервер валидирует тело теми же функциями из `#shared`.
7. Токены `tokens.css`:
   - `--color-brand`, `--color-brand-strong`, `--color-on-brand`, `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-border`, `--color-danger`;
   - `--radius-*`, `--shadow-*`, `--space-*`, `--font-sans`, `--font-display`, `--tap-size`.
   Плюс `base.css`: reset, `:focus-visible`, `.visually-hidden`, `prefers-reduced-motion`.
8. Unit-тесты по plan.md §6 (T0).

**Ловушки:**
- Модули с unit-тестами вне Nuxt-рантайма (`lib/*`, `feed.store.ts`, `validation.ts`) импортируют `ref` / `computed` / `defineStore` явно из `vue` / `pinia`. В `vitest.config.ts` настроены алиасы `~` и `#shared`.
- `session.store` использует `useCookie` и покрывается e2e, а не unit-тестами.
- `typescript` строго 5.9.3: TS 7 ломает `vue-tsc`.

---

## T2 — Auth и shell

**Профиль.** Middle+ Vue-разработчик: формы, аутентификация, роутинг. Делает доступные формы (label, `aria-describedby`, `aria-invalid`, фокус на первое невалидное поле), пишет route middleware без циклов редиректов, работает с layouts и активными ссылками.

**Скиллы:**
- `vue-patterns`, `stack-frontend` → `references/nuxt4-patterns`;
- `frontend-a11y` → `references/form-labels`, `button-name`, `aria-toggle-field-name`, `focus-management`, `touch-targets`, `landmark-regions`, `color-contrast`.

**Владеет:** `app/features/auth-by-email/**`, `app/widgets/app-header/**`, `app/widgets/bottom-nav/**`, `app/layouts/**`, `app/middleware/**`, `app/pages/login.vue`.

**Делает:**
- `LoginForm` + `useLoginForm` (поля, touched, ошибки, submit, pending, submitError) — по UI-контракту;
- `pages/login.vue` (`definePageMeta({ layout: 'auth' })`, после успеха `navigateTo(safeRedirect(route.query.redirect), { replace: true })`);
- `layouts/default.vue` (шапка, `main`, bottom-nav) и `layouts/auth.vue`;
- `AppHeader`, `BottomNav` (`nav aria-label="Main"`, Profile → `routes.user(session.user.id)`);
- `middleware/auth.global.ts`.

**Ловушки:**
- Гейт не должен зацикливаться: `/login` пропускается для гостя; авторизованный с `/login` уходит на `/`.
- Redirect берётся из `to.fullPath`, но только через `safeRedirect`.
- Пароль не хранится нигде, кроме локального `ref`.
- Двойной submit блокируется.
- Ошибки полей показываются после blur или submit, а не на каждый ввод до первого blur.
- У bottom bar учитывается `env(safe-area-inset-bottom)`.
- `main` один на страницу, контент не перекрывается фиксированным bottom bar (padding снизу).

---

## T3 — Лента

**Профиль.** Middle+ Vue-разработчик: компоненты данных и состояния списков. Рендерит discriminated unions через исчерпывающий switch с проверкой `never`, композицию через слоты, доступные toggle-кнопки (`aria-pressed`), скелетоны без CLS, адаптивные медиа (`aspect-ratio`, `object-fit`, CSS grid для галереи).

**Скиллы:**
- `vue-patterns`, `stack-frontend` → `references/nuxt4-patterns`, `references/ui-to-vue`;
- `frontend-a11y` → `references/button-name`, `aria-toggle-field-name`, `touch-targets`, `color-contrast`.

**Владеет:** `app/entities/post/ui/**`, дописывание UI-экспортов в `app/entities/post/index.ts`, `app/features/toggle-like/**`, `app/features/toggle-bookmark/**`, `app/widgets/post-feed/**`, `app/pages/index.vue` (замена заглушки T0).

**Делает:**
- `PostCard` (презентационный; автор и упомянутый пользователь — `NuxtLink`; слот `#actions`), `PostCardSkeleton`, `PostAttachment` + `AttachmentImage` / `AttachmentGallery` / `AttachmentVideo` (sound-byte → `SoundByteCard`);
- `LikeButton` (`postId`, `isLiked`, `count` → `feed.toggleLike`), `BookmarkButton` (`postId`, `isBookmarked`);
- `PostFeed` (состояния loading / error + Retry / empty / список);
- `pages/index.vue` по схеме загрузки из rules §5.

**Ловушки:**
- `entities/post/ui` не импортирует features и сторы: действия приходят через слот.
- Счётчик like — только число в `like-count`; доступное имя кнопки всегда «Like», состояние — `aria-pressed`.
- Медиа с фиксированным `aspect-ratio` и фоном-плейсхолдером.
- Время — `NuxtTime` с `locale="en-US"`.
- При возврате из профиля лента не перезапрашивается.

---

## T4 — Профиль

**Профиль.** Middle+ Vue-разработчик: страницы с загрузкой данных и обработкой ошибок. Работает с `useAsyncData` и реактивным ключом от параметра маршрута, с `createError` / `error.vue`, со смысловой разметкой (`dl` / `dt` / `dd`, иерархия заголовков).

**Скиллы:**
- `vue-patterns`, `stack-frontend` → `references/nuxt4-patterns`;
- `frontend-a11y` → `references/heading-hierarchy`, `link-text`, `list-structure`, `button-name`;
- `frontend-code-quality` → `references/404-page`.

**Владеет:** `app/entities/user/ui/**`, дописывание UI-экспортов в `app/entities/user/index.ts`, `app/features/logout/**`, `app/widgets/user-profile/**`, `app/pages/users/[id].vue`, `app/error.vue`.

**Делает:**
- `UserLink`;
- `UserProfile` с внутренними `ProfileHeader`, `ProfileStats` (`formatCompactNumber`), `ProfileConnections`, sound bytes через `SoundByteCard`;
- `LogoutButton` (`session.logout()` + `feed.reset()` + `navigateTo('/login')`);
- `pages/users/[id].vue`: `useAsyncData(() => \`user:${id}\`, …)`, 404 → `createError({ fatal: true })`;
- `error.vue`.

**Ловушки:**
- Переход профиль → профиль переиспользует компонент страницы: ключ данных реактивный, старый профиль не мелькает.
- `route.params.id` типизируется как `string` (guard на массив).
- 404 при клиентской навигации показывает `error.vue` (нужен `fatal`).
- «Log out» — только если `session.user?.id === id`.
- Приватные поля (телефон, адрес) не выводим.

---

## T5 — E2E

**Профиль.** Middle+ QA automation-инженер (Playwright). Пишет детерминированные тесты: web-first assertions, локаторы по ролям, без `waitForTimeout`. Настраивает фикстуры и `webServer`, управляет сетью (`route`), задаёт куки контекста.

**Скиллы:** `e2e-testing`.

**Владеет:** `playwright.config.ts`, `tests/e2e/**`, добавление `@playwright/test@1.62.0` и скрипта `test:e2e` в `package.json` + lock (единственное разрешённое изменение зависимостей вне T0).

**Делает:**
- Конфиг:
  - `webServer`: `npm run build && node .output/server/index.mjs` с `PORT=3005`;
  - проекты `desktop` (1280×800) и `mobile` (390×844, `isMobile`, `hasTouch`) — только `browserName: 'chromium'`, без `devices['iPhone …']` (это WebKit, его нет в кеше);
  - `retries: 0` локально, `trace: 'retain-on-failure'`.
- Фикстуры:
  - сбор `pageerror` и `console.error` → падение теста (ловит hydration mismatch);
  - блокировка внешних запросов (всё не-localhost → `abort`);
  - `authedPage` через `context.addCookies` (`socio_session`).
- 11 сценариев plan.md §6 (T5); сценарии 2, 3, 9, 11 — только `desktop`.

**Ловушки:**
- Скрытая навигация (`display: none`) исключается из `getByRole` — используй это, не дублируй локаторы.
- Loading-состояния ловятся через искусственную задержку `page.route`, а не через тайминги.
- Cookie ставится на `localhost` с `path: '/'`.
- Тесты пишутся по UI-контракту до появления реализации. Если после мержа реализация расходится с контрактом — это баг реализации, тест не подгоняется (кроме ошибки в самом тесте).

---

## Ревьюер

**Профиль.** Senior Vue / Nuxt ревьюер, только чтение. Проверяет дифф ветки по rules §10. Обращает особое внимание на импорт-правила FSD, SSR-безопасность, соответствие UI-контракту, обработку ошибок и состояний, доступность.
Отчёт — по формату rules §10, вердикт `merge` / `rework`.

## Главный агент

1. Запускает агентов с брифом: роль + ссылки на rules.md, roles.md и plan.md + ветка + порт.
2. Принимает отчёты, отдаёт ветку ревьюеру, гоняет круги доработки (до 3).
3. Мержит ветки в `main` (rebase + fast-forward, история линейная).
4. После каждого мержа запускает полный прогон: `typecheck`, `lint`, `test`, `build`, `test:e2e`.
5. Делает живую проверку в браузере (390×844 и 1280×800), решает по `CONTRACT GAP`, пишет README.
