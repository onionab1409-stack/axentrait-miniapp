# AXENTRAIT MiniApp — ПЛАН ВНЕДРЕНИЯ ИЗМЕНЕНИЙ

**Дата создания:** 2026-02-26
**Цель:** Привести live Telegram MiniApp к эталонному HTML-прототипу
**Инструмент:** Claude Code на VPS
**Репозиторий:** `https://github.com/onionab1409-stack/axentrait-miniapp`
**Путь на VPS:** `/home/claude/axentrait-miniapp/` (или будет уточнён)

---

## СТРУКТУРА ПЛАНА

Работа разбита на **4 фазы**, **15 этапов**, **~45 подзадач**.
Каждый этап — **отдельная сессия** в Claude Code.
После каждого этапа — коммит + проверка на VPS.

---

## ФАЗА 0: ПОДГОТОВКА (2 этапа)

### Этап 0.1 — Ревизия репозитория и окружения
**Цель:** Убедиться что всё готово к работе
**Задачи:**
- [ ] Клонировать/обновить репозиторий на VPS (`git pull`)
- [ ] Проверить структуру `apps/miniapp-frontend/src/`
- [ ] Найти все файлы, упомянутые в отчётах:
  - `features/onboarding/SplashPage.tsx`
  - `features/onboarding/WelcomePage.tsx`
  - `features/onboarding/SurveyPage.tsx`
  - `features/onboarding/OnboardingResultPage.tsx`
  - `features/cases/CasesGalleryPage.tsx`
  - `features/ai/AiHubPage.tsx`, `AiChatPage.tsx`
  - `features/services/ServiceDetailPage.tsx`
  - `components/ui/Button.tsx`
  - `components/ui/Chip.tsx`
  - `components/ui/MjImage.tsx`
  - `components/domain/CaseCard.tsx`
  - `components/domain/ServiceCard.tsx`
  - `components/domain/ChatMessageBubble.tsx`
  - `components/domain/ChatComposer.tsx`
  - `components/layout/AppShell.tsx`
  - `components/layout/BottomNav.tsx`
  - `shared/theme/global.css` (или tokens.css)
- [ ] Проверить `package.json` — dev-зависимости, скрипты сборки
- [ ] Проверить как запускается dev-сервер
- [ ] Сделать `git branch prototype-alignment` — рабочая ветка
- [ ] Создать артефакт: `ETAP-0.1-REVISION.md` — карта файлов

**Артефакт:** Полная карта файлов с путями, размерами, зависимостями

---

### Этап 0.2 — Бэкап и тестовая сборка
**Цель:** Убедиться что проект собирается, создать точку отката
**Задачи:**
- [ ] `git stash` / `git commit` всех локальных изменений
- [ ] `npm install` (или `yarn`)
- [ ] `npm run build` — проверить что сборка проходит
- [ ] `npm run dev` — проверить что dev-сервер стартует
- [ ] Зафиксировать текущее состояние: `git tag pre-prototype-alignment`
- [ ] Создать артефакт: `ETAP-0.2-BUILD.md` — результаты сборки

**Артефакт:** Статус сборки, версии зависимостей, команды запуска

---

## ФАЗА 1: ГЛОБАЛЬНЫЕ ИЗМЕНЕНИЯ (4 этапа)

> Эти изменения влияют на ВСЕ экраны сразу.
> Порядок важен: сначала шрифт, потом CSS-токены, потом кнопки.

### Этап 1.1 — Подключение шрифта Montserrat
**Цель:** Заменить `system-ui` на `Montserrat` глобально
**Файлы:**
- `index.html` (добавить Google Fonts link)
- `shared/theme/tokens.css` или `global.css` (изменить `--ax-font-sans`)
**Задачи:**
- [ ] Найти `index.html` — добавить:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```
- [ ] Найти CSS-переменную `--ax-font-sans` — заменить:
  ```css
  --ax-font-sans: 'Montserrat', system-ui, -apple-system, sans-serif;
  ```
- [ ] Проверить что шрифт применяется на `body`
- [ ] Собрать, проверить визуально
- [ ] Коммит: `feat: connect Montserrat font globally`

**Артефакт:** `ETAP-1.1-FONT.md` — какие файлы изменены, скриншот до/после

---

### Этап 1.2 — CSS-токены заголовков (weight 300, cyan, text-shadow)
**Цель:** Создать глобальные стили для заголовков в стиле прототипа
**Файлы:**
- `shared/theme/global.css` или `tokens.css`
**Задачи:**
- [ ] Добавить CSS-класс или переменные:
  ```css
  /* Prototype heading style */
  --heading-color: #7EE8F2;
  --heading-weight: 300;
  --heading-spacing: 0.5px;
  --heading-shadow: 0 0 30px rgba(34,211,238,0.2);
  ```
- [ ] НЕ менять существующие h1/h2 классы глобально (это сломает Service)
- [ ] Создать утилитарный класс `.proto-heading` для использования на экранах
- [ ] Коммит: `feat: add prototype heading CSS tokens`

**Важно:** На этом этапе только добавляем токены, НЕ применяем к экранам. Применение — в фазе 2.

**Артефакт:** `ETAP-1.2-TOKENS.md` — список добавленных переменных и классов

---

### Этап 1.3 — Два варианта кнопки: glass + solid
**Цель:** Добавить variant `glassPrimary` в `Button.tsx`
**Файлы:**
- `components/ui/Button.tsx`
**Задачи:**
- [ ] Изучить текущую структуру `Button.tsx` — какие variants есть
- [ ] Добавить новый variant `glassPrimary`:
  ```tsx
  glassPrimary: {
    background: 'rgba(34,211,238,0.15)',
    color: '#22D3EE',
    border: 'none',
    boxShadow: 'none',
  }
  ```
- [ ] Проверить что существующий `primary` (solid gradient) не сломан
- [ ] Коммит: `feat: add glassPrimary button variant`

**Артефакт:** `ETAP-1.3-BUTTON.md` — код Button.tsx до/после, описание вариантов

---

### Этап 1.4 — Chip-компонент: прототипные стили
**Цель:** Привести `Chip.tsx` к стилю прототипа
**Файлы:**
- `components/ui/Chip.tsx`
**Задачи:**
- [ ] Изучить текущий `Chip.tsx`
- [ ] Изменить размеры:
  - `fontSize: 11px` (было 12)
  - `padding: 4px 10px` (было 6px 12px)
  - Убрать `minHeight: 36px`
- [ ] Добавить `backdropFilter: 'blur(4px)'`
- [ ] Изменить inactive цвета:
  - `color: rgba(126,232,242,0.5)` (teal вместо gray)
  - `border: 1px solid rgba(126,232,242,0.15)` (teal border)
  - `background: transparent` (вместо rgba(255,255,255,0.04))
- [ ] Active оставить как есть (уже совпадает)
- [ ] Коммит: `fix: chip component — prototype style alignment`

**Артефакт:** `ETAP-1.4-CHIP.md` — код Chip.tsx до/после

---

## ФАЗА 2: ПОЭКРАННЫЕ ПРАВКИ (8 этапов)

> Каждый экран — отдельный этап.
> Порядок: от простого к сложному, от максимального совпадения к минимальному.

### Этап 2.1 — Экран 0: Splash
**Соответствие:** ~55% → цель ~95%
**Файлы:** `features/onboarding/SplashPage.tsx`, `SplashRive.tsx`, `global.css`
**Задачи:**
- [ ] Удалить кнопку "Пропустить"
- [ ] Удалить текст "Загрузка Mini App shell..."
- [ ] Исправить подпись "Automation · AI · Optimization":
  - `fontSize: 12px`
  - `color: rgba(240,246,252,0.35)`
  - `letterSpacing: 3px`
  - `fontFamily: "'SF Mono', Consolas, monospace"`
- [ ] Исправить font-size логотипа: 38px → 34px в `.splash-logo-fallback::after`
- [ ] Упростить layout — убрать верхнюю/нижнюю секции, оставить только центр
- [ ] Коммит: `fix(splash): align with prototype — remove skip, fix tagline`

**Артефакт:** `ETAP-2.1-SPLASH.md`

---

### Этап 2.2 — Экран 7: Service Detail
**Соответствие:** ~65% → цель ~85%
**Файлы:** `features/services/ServiceDetailPage.tsx`
**Задачи:**
- [ ] H1: fontSize 24→22px
- [ ] Subtitle: fontSize 14→13px, color opacity 0.6→0.5
- [ ] Description: fontSize 15→14px, color opacity 0.72→0.65
- [ ] btn-secondary: fontSize 16→13, fontWeight 600→500, borderRadius 14→12, border opacity 0.15→0.3, padding
- [ ] Chip: color brightness (через обновлённый Chip компонент из этапа 1.4)
- [ ] **НЕ менять:** btn-primary (уже совпадает!), H1 weight 700 (корректен!)
- [ ] Коммит: `fix(service): fine-tune typography and buttons to prototype`

**Артефакт:** `ETAP-2.2-SERVICE.md`

---

### Этап 2.3 — Экран 5: Cases Gallery
**Соответствие:** ~60% → цель ~85%
**Файлы:** `features/cases/CasesGalleryPage.tsx`, `components/domain/CaseCard.tsx`
**Задачи:**
- [ ] Добавить H2 "Кейсы" в тело страницы (cyan, weight 300, 26px)
- [ ] CaseCard — убрать лишние элементы:
  - Убрать industry label
  - Убрать metrics.headline
  - Убрать tag chips
- [ ] CaseCard title: fontWeight 700→300, color #fff→#7EE8F2, letterSpacing 0.5px
- [ ] Card: height 180→200px, borderRadius 16→18px
- [ ] Chips уже обновлены (этап 1.4)
- [ ] Коммит: `fix(cases): simplify cards, add H2, prototype colors`

**Артефакт:** `ETAP-2.3-CASES.md`

---

### Этап 2.4 — Экран 1: Welcome
**Соответствие:** ~35% → цель ~80%
**Файлы:** `features/onboarding/WelcomePage.tsx`
**Задачи:**
- [ ] H1: fontWeight 700→300, color #fff→#7EE8F2, lineHeight 1.25→1.15
- [ ] H1: добавить letterSpacing 0.5px, textShadow
- [ ] Primary кнопка: заменить variant на `glassPrimary` (из этапа 1.3)
  - Или inline style: background rgba(34,211,238,0.15), color #22D3EE, boxShadow none
- [ ] Secondary кнопка: убрать fullWidth, сделать auto-width по центру
  - fontSize 16→13, fontWeight 600→500, color→rgba(34,211,238,0.6)
  - borderRadius 14→12, padding→11px 22px
- [ ] Рассмотреть ослабление overlay (opacity)
- [ ] Коммит: `fix(welcome): prototype heading, glass button, compact secondary`

**Артефакт:** `ETAP-2.4-WELCOME.md`

---

### Этап 2.5 — Экран 4: Result
**Соответствие:** ~20% → цель ~60% (Вариант 2: стиль прототипа + контент live)
**Файлы:** `features/onboarding/OnboardingResultPage.tsx`, `components/domain/ServiceCard.tsx`

> **ВОПРОС К ЗАКАЗЧИКУ перед началом:** Убирать лишние секции или стилизовать?
> Рекомендация из отчёта: Вариант 2 — оставить секции, стилизовать.

**Задачи:**
- [ ] Добавить `showBottomNav` в AppShell
- [ ] H2: fontWeight 700→300, color→#7EE8F2, fontSize 24→26, letterSpacing, textShadow
- [ ] ServiceCard: title fontWeight 700→300, color→#7EE8F2, fontSize 17→15
- [ ] ServiceCard: убрать category label, description, badges (или обсудить)
- [ ] Кнопка AI: сделать glass (приглушённый) `rgba(34,211,238,0.5)` цвет текста
- [ ] Коммит: `fix(result): prototype heading, simplified cards, glass AI button`

**Артефакт:** `ETAP-2.5-RESULT.md`

---

### Этап 2.6 — Экран 2: Survey (часть 1 — layout)
**Соответствие:** ~25% → цель ~75%
**Файлы:** `features/onboarding/SurveyPage.tsx`

> Самый сложный экран — разбит на 2 части.

**Задачи (layout-рефакторинг):**
- [ ] Заменить AppShell+Card на fullscreen layout
- [ ] Добавить fullscreen background (MjImage или gradient fallback)
- [ ] Убрать TopBar "Подбор решения"
- [ ] Убрать Card-обёртку
- [ ] Настроить padding: 64px 20px 20px
- [ ] Проверить что прогресс-точки и контент отображаются корректно
- [ ] Коммит: `refactor(survey): fullscreen layout with background`

**Артефакт:** `ETAP-2.6-SURVEY-LAYOUT.md`

---

### Этап 2.7 — Экран 2: Survey (часть 2 — стили)
**Файлы:** `features/onboarding/SurveyPage.tsx`
**Задачи (стилевые правки):**
- [ ] H2: fontWeight→300, color→#7EE8F2, fontSize→26, letterSpacing, textShadow
- [ ] Убрать subtitle
- [ ] Опции: fullWidth → inline-flex (по контенту)
- [ ] Опции: background→rgba(0,0,0,0.18), backdropFilter→blur(10px)
- [ ] Опции: label color→rgba(126,232,242,0.55), border→none
- [ ] Опции: убрать description (option-hint)
- [ ] Опции: emoji size 18→22px, gap 12→10px
- [ ] Контейнер опций: justify-content→space-between, alignItems→flex-start
- [ ] Кнопка "Далее": solid→glassPrimary, цвет→#22D3EE
- [ ] Dots: gap 8→6px, counter color→rgba(126,232,242,0.4)
- [ ] Коммит: `fix(survey): prototype options, heading, glass button`

**Артефакт:** `ETAP-2.7-SURVEY-STYLES.md`

---

### Этап 2.8 — Экран 6: AI Hub
**Соответствие:** ~15% → цель зависит от решения

> **КРИТИЧЕСКИЙ ВОПРОС К ЗАКАЗЧИКУ:** 
> Прототип = чат сразу. Live = каталог → чат.
> Варианты:
> 1. Убрать каталог, чат сразу
> 2. Оставить каталог + стилизовать чат
> 3. Единый экран: чат + quick prompts (рекомендация)

**Задачи (Вариант 2 — минимально, стилизовать только чат):**
- [ ] `AiChatPage.tsx` + `ChatMessageBubble.tsx` + `ChatComposer.tsx` + `global.css`
- [ ] Avatar: size 32→28, color #fff→#050A0F, gradient end→#06B6D4
- [ ] AI bubble: bg→rgba(0,0,0,0.3), добавить backdropFilter blur(10px)
  - border→none, borderRadius→14px (top-left 4px)
  - text color→rgba(126,232,242,0.7), fontWeight→300
- [ ] User bubble: bg→rgba(34,211,238,0.1), border→none
  - borderRadius→14px (top-right 4px)
  - text color→rgba(126,232,242,0.6), fontWeight→300
- [ ] Chat gap: 8→12px
- [ ] Input: bg→rgba(0,0,0,0.3), backdropFilter→blur(10px)
  - border→rgba(126,232,242,0.15), borderRadius→14
  - placeholder color→rgba(126,232,242,0.3)
- [ ] Send button: solid→glass rgba(34,211,238,0.15), icon→rgba(34,211,238,0.5)
- [ ] Composer container: убрать bg, borderTop
- [ ] Коммит: `fix(ai-chat): prototype bubble colors, glass input, teal palette`

**Артефакт:** `ETAP-2.8-AIHUB.md`

---

## ФАЗА 3: BOTTOM NAVIGATION И LAYOUT (2 этапа)

### Этап 3.1 — Bottom Navigation
**Цель:** Унифицировать BottomNav по прототипу
**Файлы:** `components/layout/BottomNav.tsx`
**Задачи:**
- [ ] **ВОПРОС К ЗАКАЗЧИКУ:** 4 vs 5 элементов (убирать "Профиль"?)
- [ ] Label fontSize: 11→10px
- [ ] Inactive color: уточнить rgba(240,246,252,0.35)
- [ ] Background: проверить соответствие `rgba(5,10,15,0.7)` + blur(20px)
- [ ] Добавить BottomNav на Result (showBottomNav)
- [ ] Коммит: `fix(nav): prototype bottom navigation sizing`

**Артефакт:** `ETAP-3.1-BOTTOMNAV.md`

---

### Этап 3.2 — Fullscreen backgrounds (Service + AI Hub)
**Цель:** Добавить fullscreen фоны где требуется
**Файлы:** `ServiceDetailPage.tsx`, `AiChatPage.tsx` (или AiHubPage)
**Задачи:**
- [ ] Service: рассмотреть fullscreen hero bg (если принято решение)
- [ ] AI Hub/Chat: добавить fullscreen bg (heroAiHub)
- [ ] Проверить что изображения доступны в `/images/heroes/`
- [ ] Если изображений нет — создать gradient fallback
- [ ] Коммит: `feat: fullscreen backgrounds for service and AI hub`

**Артефакт:** `ETAP-3.2-BACKGROUNDS.md`

---

## ФАЗА 4: ФИНАЛИЗАЦИЯ (2 этапа)

### Этап 4.1 — Сквозная проверка и мелкие правки
**Цель:** Проверить все экраны, исправить то что пропустили
**Задачи:**
- [ ] Пройти по каждому экрану:
  - Screen 0: Splash ✓
  - Screen 1: Welcome ✓
  - Screen 2: Survey ✓
  - Screen 4: Result ✓
  - Screen 5: Cases ✓
  - Screen 6: AI Hub ✓
  - Screen 7: Service ✓
- [ ] Проверить что Montserrat загружается (нет FOUT)
- [ ] Проверить glass-кнопки на всех экранах
- [ ] Проверить Chip-стили на Cases и Service
- [ ] Проверить BottomNav на нужных экранах
- [ ] Исправить найденные несоответствия
- [ ] Коммит: `fix: cross-screen polish pass`

**Артефакт:** `ETAP-4.1-REVIEW.md` — чек-лист со статусами

---

### Этап 4.2 — Финальная сборка и деплой
**Цель:** Собрать production-версию, задеплоить
**Задачи:**
- [ ] `npm run build` — убедиться в чистой сборке (0 errors, 0 warnings)
- [ ] Проверить размер бандла (Montserrat добавляет ~100KB)
- [ ] Тест на мобильном (Telegram MiniApp)
- [ ] `git merge prototype-alignment → main`
- [ ] Deploy на VPS
- [ ] Финальная проверка на продакшене
- [ ] Коммит + тег: `v2.0.0-prototype-aligned`

**Артефакт:** `ETAP-4.2-DEPLOY.md` — финальный отчёт

---

## СВОДНАЯ ТАБЛИЦА ЭТАПОВ

| # | Этап | Файлы | Сложность | Вопросы к заказчику |
|---|------|-------|-----------|---------------------|
| 0.1 | Ревизия | всё | Низкая | — |
| 0.2 | Бэкап + сборка | — | Низкая | — |
| 1.1 | Montserrat | index.html, css | Низкая | — |
| 1.2 | CSS-токены заголовков | css | Низкая | — |
| 1.3 | Button glassPrimary | Button.tsx | Средняя | — |
| 1.4 | Chip стили | Chip.tsx | Средняя | — |
| 2.1 | Splash | SplashPage.tsx | Низкая | — |
| 2.2 | Service | ServiceDetailPage.tsx | Средняя | — |
| 2.3 | Cases | CasesGalleryPage.tsx, CaseCard.tsx | Средняя | — |
| 2.4 | Welcome | WelcomePage.tsx | Средняя | — |
| 2.5 | Result | OnboardingResultPage.tsx | Высокая | Убирать секции? |
| 2.6 | Survey layout | SurveyPage.tsx | Высокая | — |
| 2.7 | Survey стили | SurveyPage.tsx | Средняя | — |
| 2.8 | AI Hub | AiChatPage.tsx + 3 файла | Высокая | Концепция экрана? |
| 3.1 | BottomNav | BottomNav.tsx | Средняя | 4 vs 5 элементов? |
| 3.2 | Fullscreen фоны | 2 файла | Средняя | — |
| 4.1 | Сквозная проверка | все | Средняя | — |
| 4.2 | Финальный деплой | — | Низкая | — |

---

## ВОПРОСЫ К ЗАКАЗЧИКУ (ТРЕБУЮТ РЕШЕНИЯ)

### Вопрос 1: Экран Result — лишние секции
> Live-бот значительно богаче прототипа (deliverables, prerequisites, packages, cases).
> **Варианты:**
> 1. Строго по прототипу — убрать 4+ секции
> 2. Стиль прототипа + контент live ← **рекомендация**
> 3. Обновить прототип

### Вопрос 2: Экран AI Hub — концепция
> Прототип = чат сразу. Live = каталог + чат.
> **Варианты:**
> 1. Убрать каталог → чат сразу
> 2. Оставить каталог + стилизовать чат ← **минимально**
> 3. Единый экран: чат с quick prompts ← **рекомендация**

### Вопрос 3: Bottom Nav — 4 vs 5 элементов
> Прототип: 4 (Услуги, Кейсы, AI-демо, Заявка)
> Live: 5 (+Профиль)
> Убирать "Профиль"?

### Вопрос 4: Service Detail — убирать секции?
> Live богаче прототипа: deliverables, prerequisites, packages, cases.
> Аналогичен вопросу 1 — стилизовать или убрать?

---

## ЗАВИСИМОСТИ МЕЖДУ ЭТАПАМИ

```
0.1 → 0.2 → 1.1 → 1.2 (строго последовательно)
         ↘ 1.3 (можно параллельно с 1.2)
         ↘ 1.4 (можно параллельно с 1.2)

1.1 + 1.2 → 2.1 (Splash)
1.1 + 1.2 + 1.4 → 2.2 (Service)
1.1 + 1.2 + 1.4 → 2.3 (Cases)
1.1 + 1.2 + 1.3 → 2.4 (Welcome)
1.1 + 1.2 + 1.3 → 2.5 (Result) — нужен ответ на Вопрос 1
1.1 + 1.2 + 1.3 → 2.6, 2.7 (Survey)
1.1 + 1.2 → 2.8 (AI Hub) — нужен ответ на Вопрос 2

2.* → 3.1 (BottomNav) — нужен ответ на Вопрос 3
2.* → 3.2 (Fullscreen)

3.* → 4.1 (Проверка)
4.1 → 4.2 (Деплой)
```

---

## ОЦЕНКА ВРЕМЕНИ

| Фаза | Этапов | Примерное время (сессий) |
|-------|--------|--------------------------|
| Фаза 0: Подготовка | 2 | 2 сессии |
| Фаза 1: Глобальные | 4 | 4 сессии |
| Фаза 2: Экраны | 8 | 8 сессий |
| Фаза 3: Nav + Фоны | 2 | 2 сессии |
| Фаза 4: Финализация | 2 | 2 сессии |
| **ИТОГО** | **18** | **~18 сессий** |

---

## ПРАВИЛА РАБОТЫ

1. **Один этап = одна сессия** — не перескакивать
2. **Коммит после каждого этапа** — возможность отката
3. **Не добавлять новое** — только приводить к прототипу
4. **Обсуждать вопросы** — перед началом этапов 2.5, 2.8, 3.1
5. **Артефакт после каждого этапа** — для контекста следующей сессии
6. **Проверка на VPS** — после каждого коммита
7. **Переход в новый чат** — если контекст приближается к 180K токенов
