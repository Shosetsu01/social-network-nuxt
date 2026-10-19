# Анализ исходного Flutter-проекта

Источник: [stevie1mat/Social-Network-UI-Made-In-Flutter](https://github.com/stevie1mat/Social-Network-UI-Made-In-Flutter) (MIT, © 2020 Steven Mathew).
Flutter, Dart null-safety, ~6.7k строк в `lib/` (23 файла). Flutter SDK локально не установлен: анализ сделан по коду и скриншотам из репозитория.

## 1. Стек и данные

| Пакет | Назначение | Нужен ядру |
|---|---|---|
| `provider` | состояние (ChangeNotifier) | да → Pinia |
| `google_fonts` | Lato (приложение), Urbanist (логин) | да → Google Fonts |
| `http` | только загрузка Stories с GitHub raw | нет |
| `flutter_map`, `latlong2` | Meetup и карта в check-in карточке | нет |
| `timeline_tile` | таймлайн «My activity» в профиле | нет |

Все данные моковые: захардкожены в виджетах и провайдерах, бэкенда нет. Тестов фактически нет: `test/widget_test.dart` — шаблонный counter-тест, к приложению не относится.

## 2. Архитектура и поток

```
main() → MyApp
  MultiProvider [AuthProvider, PostProvider, NotificationProvider]
    MaterialApp(home: AuthWrapper)
      AuthWrapper = Consumer<AuthProvider>: isAuthenticated ? MyNavigationBar : LoginPage
        MyNavigationBar (StatefulWidget, _selectedIndex) — BottomNavigationBar, 5 вкладок:
          0 MainPage (лента) | 1 Profile | 2 Connections | 3 Meetup | 4 NotificationPage
```

- **Слои:** `models/` (User, Post с `fromJson`/`toJson`/`copyWith`), `providers/` (ChangeNotifier-сторы, «API» имитируется `Future.delayed`), экраны — монолитные виджеты в корне `lib/`, `feedui/` — 6 карточек ленты.
- **Навигация:** императивная (`Navigator.push(MaterialPageRoute)`), без именованных маршрутов и диплинков. Вкладка — локальный индекс, её состояние теряется при переключении.

## 3. Сценарий ядра: как он работает сейчас

### 3.1 Вход — `login.dart`, `providers/auth_provider.dart`

- Поля и валидация (тексты сообщений переносим дословно):
  - email: обязателен → `Please enter your email`; regex `^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$` → `Please enter a valid email`;
  - пароль: обязателен → `Please enter your password`; ≥ 6 символов → `Password must be at least 6 characters`.
- Переключатель видимости пароля. Чекбокс «Remember me» — только локальный state, никуда не передаётся.
- `_handleLogin`: validate → `_isLoading = true` (кнопка disabled, спиннер вместо текста) → `AuthProvider.signIn()` (задержка 2 с; принимает любые непустые данные; ставит mock-пользователя *Allan Paterson*) → `Navigator.pushReplacement(MyNavigationBar)`. Ошибка → красный snackbar `Login failed: …`, finally → `_isLoading = false`.
- Заглушки без логики (snackbar «… coming soon!»): Forgot Password, Sign Up, Facebook / Google / Apple. Кнопка «назад» — пустой обработчик. Анимация появления fade + slide (1200 мс).

### 3.2 Лента — `mainpage.dart`, `feedui/*`

Шапка: логотип + «Socio Network», иконка link ведёт в Connections. Ниже Stories (`status.dart`), затем 6 захардкоженных карточек через `Divider`. Все от автора «Sound Byte» с разными аватарами.

| Виджет | Шапка | Тело | Футер |
|---|---|---|---|
| First | «is now connected to **Dina** and **8 others.**» | фото + наложенная карточка контакта (Dina Foster, должность, телефон, email) + бейдж ♥ | like, comment 45 |
| Second | то же | коллаж из 3 фото | like, comment 45 |
| Third | «has checked in with Dina and 8 others.» | аватары «5 Joining, Including Alan Mathew» + карта OSM + кнопка «Meet Up» | — |
| Fourth | «has checked in…» | текст + вложение «sound byte» (заголовок, тег *Advice*, дата, play) | like, comment 45 |
| Fivth | автор + «1 hr» | текст + фото | like, comment 45 |
| Sixth | автор + «1 hr» | текст + превью видео с кнопкой play | like, comment 45 |

Общие элементы: аватар с тенью, жирное имя автора, текст активности, иконка «…», футер (thumb-up слева, комментарии + счётчик справа).
**Ни одна карточка не интерактивна:** like — статичная картинка, счётчик «45» — константа, обработчиков нет, перехода к автору нет.

### 3.3 Профиль — `profile.dart`, `profiledetails.dart`

- Есть только **собственный** профиль (вкладка). Заголовок: `currentUser?.name ?? 'Allan Paterson'`, кнопка logout.
- Секции: Bio (хардкод, `user.bio` не используется), Connections («12 mutual», 4 аватара, View All), Sound Bytes (2 карточки), My activity (таймлайн из 3 аватаров), кнопка «My Profile Details».
- `ProfileDetails`: Name / Role / Company / Location + Private Information (email, телефон, адрес). Всё захардкожено на имя «Scott Hamilton», которое не совпадает с Allan Paterson. Кнопка Edit без действия.
- Поля `followers` / `following` / `posts` модели `User` нигде не отображаются.

## 4. Скрытая продуктовая логика: есть в коде, но не подключена к UI

- `PostProvider`: `loadPosts()` (имитация API, 1 с), `toggleLike` (инверсия `isLiked`, `likes ± 1`), `toggleBookmark`, `addComment` (`comments + 1`), `sharePost` (`shares + 1`), `createPost`, выборки liked/bookmarked. Обновления иммутабельные через `copyWith`. **Нигде не вызывается.**
- Модели `Post` / `User` с `fromJson` / `toJson` — заготовка под REST API.
- README оригинала обещает «Like, comment, share, and bookmark posts».

**Вывод:** провайдер описывает задуманное поведение, а `feedui/` — визуальный дизайн. При переносе их нужно свести: данные и действия берём из модели и провайдера, внешний вид — из `feedui`.

## 5. Паттерны и их перенос

| Flutter | Где | Vue 3 / Nuxt 4 |
|---|---|---|
| Provider + ChangeNotifier, `MultiProvider` в корне | `main.dart`, `providers/` | Pinia setup-stores (`@pinia/nuxt`) |
| `Consumer` / `Provider.of` | AuthWrapper, Profile, Login | `useXStore()` + `storeToRefs` |
| AuthWrapper — реактивный гейт | `main.dart` | глобальный route middleware |
| `Navigator.push` / `pushReplacement` | везде | file-based routing, `<NuxtLink>`, `navigateTo` |
| BottomNavigationBar с локальным индексом | `main.dart` | навигация по маршрутам (URL — источник состояния) |
| Имитация API внутри провайдера | `providers/` | отдельный слой: Nitro server routes `server/api/*` с моками |
| Модели с `fromJson` / `toJson` / `copyWith` | `models/` | TS-типы в `shared/types`, иммутабельные обновления через spread |
| Валидаторы внутри `TextFormField` | `login.dart` | чистые функции в `shared/utils` (общие для клиента и сервера) |
| Локальное состояние StatefulWidget (loading, видимость пароля) | `login.dart` | `ref` в `<script setup>` |
| 6 копий виджета карточки с дублированной шапкой и футером | `feedui/*` | одна `PostCard` + discriminated union вложений |
| Snackbar для ошибок и заглушек | `login.dart` | inline-alert (`role="alert"`) для ошибок; заглушки не переносим |
| Пиксельные размеры (`MediaQuery.width / 1.1`, `Positioned(left: 150)`) | везде | адаптивная вёрстка: CSS-токены, flex/grid, колонка с max-width |

## 6. Дефекты оригинала: не переносим, а исправляем

1. **Logout не работает.** После входа `pushReplacement` заменяет маршрут с `AuthWrapper`, поэтому при `signOut` гейт уже не в дереве: пользователь остаётся в приложении, а заголовок профиля откатывается на fallback-имя.
2. Двойная навигация после входа: AuthWrapper и `pushReplacement` делают одно и то же.
3. Ветка ошибки входа недостижима: `signIn` сам ловит исключения и не бросает их, а `error` провайдера нигде не показывается. Хуже того, неуспешный `signIn` всё равно доходит до `pushReplacement`, и пользователь попадает в приложение без сессии.
4. `PostProvider` не подключён — действия карточки не работают.
5. Мок-данные профиля несогласованы (Allan Paterson / Scott Hamilton), `user.bio` игнорируется.
6. «Remember me» ничего не делает, сессия не переживает перезапуск.
7. Пиксельное позиционирование ломается на других ширинах.
8. Белый текст на оранжевом `orange[400]` (~2:1) не проходит WCAG AA по контрасту.
