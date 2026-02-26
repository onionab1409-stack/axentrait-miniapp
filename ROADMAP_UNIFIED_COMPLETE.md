# AXENTRAIT MiniApp — Единая карта хода работ

**Дата:** 2026-02-26  
**Версия:** 1.0  
**Исполнитель:** Claude Opus (код, правки, артефакты) + Claude Code (только деплой на VPS)  
**Репозиторий:** `https://github.com/onionab1409-stack/axentrait-miniapp`  
**Фронтенд:** `apps/miniapp-frontend/src/`

---

## Принятые решения

| # | Вопрос | Решение |
|---|--------|---------|
| Q1 | Лишние секции Result/Service | **Строго по прототипу** — убрать |
| Q2 | AI Hub | **Один чат-интерфейс** — убрать каталог |
| Q3 | Bottom Nav | **4 элемента** — убрать "Профиль" |
| Q4 | ServicesCatalog | **Стилизовать** по стилю прототипа |

---

## Инструмент исполнения

| Фаза | Инструмент | Пояснение |
|------|-----------|-----------|
| 0 — Аудит | **Claude Opus** | Чтение файлов из GitHub, анализ |
| 1 — Глобальные | **Claude Opus** | Правка файлов, создание артефактов |
| 2 — Экраны | **Claude Opus** | Правка файлов, создание артефактов |
| 3 — Шлифовка + QA | **Claude Opus** | Правка файлов, чеклисты |
| 4 — Деплой | **Claude Code** | Подключение к VPS, build, deploy |

---

# ═══════════════════════════════════════════
# ФАЗА 0 — ПОДГОТОВКА И АУДИТ
# ═══════════════════════════════════════════

## Этап 0.1 — Аудит текущего кода (1 сессия)

### Цель
Полностью понять текущее состояние проекта: структура, файлы, компоненты.

### Действия

**0.1.1** Клонировать / открыть репозиторий  
- URL: `https://github.com/onionab1409-stack/axentrait-miniapp`
- Изучить общую структуру `tree -L 2`

**0.1.2** Изучить структуру фронтенда  
```
apps/miniapp-frontend/src/
├── features/
│   ├── onboarding/    (Splash, Welcome, Survey, Result)
│   ├── cases/         (CasesGallery)
│   ├── ai/            (AiHub, AiChat)
│   └── services/      (ServiceDetail, ServicesCatalog)
├── components/
│   ├── ui/            (Button, Chip, MjImage, SplineScene)
│   ├── layout/        (AppShell, BottomNav)
│   └── domain/        (CaseCard, ServiceCard, ChatMessageBubble, ChatComposer)
├── shared/
│   └── theme/         (global.css, tokens.css)
└── main.tsx / App.tsx (точка входа, роутер)
```

**0.1.3** Проверить существование всех целевых файлов  

| Файл | Фаза правки |
|------|-------------|
| `index.html` | 1.1 |
| `shared/theme/tokens.css` | 1.1, 1.2 |
| `shared/theme/global.css` | 1.2, 2.1, 2.10 |
| `components/ui/Button.tsx` | 1.3 |
| `components/ui/Chip.tsx` | 2.7 |
| `components/layout/BottomNav.tsx` | 3.1 |
| `components/layout/AppShell.tsx` | Справочно |
| `components/domain/CaseCard.tsx` | 2.7 |
| `components/domain/ServiceCard.tsx` | 2.6 |
| `components/domain/ChatMessageBubble.tsx` | 2.10 |
| `components/domain/ChatComposer.tsx` | 2.10 |
| `features/onboarding/SplashPage.tsx` | 2.1 |
| `features/onboarding/WelcomePage.tsx` | 2.2 |
| `features/onboarding/SurveyPage.tsx` | 2.3, 2.4, 2.5 |
| `features/onboarding/OnboardingResultPage.tsx` | 2.6 |
| `features/cases/CasesGalleryPage.tsx` | 2.7 |
| `features/ai/AiHubPage.tsx` | 2.9 |
| `features/ai/AiChatPage.tsx` | 2.9, 2.10 |
| `features/services/ServiceDetailPage.tsx` | 2.8 |
| `features/services/ServicesCatalogPage.tsx` | 3.2 |
| Роутер (App.tsx / router.tsx) | 2.9 |
| imageMap.ts (или аналог) | 2.3 |

**0.1.4** Прочитать и зафиксировать содержимое ключевых компонентов:
- `Button.tsx` — variants, props, типы, стили
- `Chip.tsx` — props, active/inactive стили
- `BottomNav.tsx` — элементы навигации, active logic
- `AppShell.tsx` — props, layout, TopBar
- `tokens.css` — текущие CSS-переменные
- `global.css` — глобальные стили, классы `.bubble-bot`, `.bubble-user`, `.splash-logo-fallback`
- Роутер — маршруты, какие компоненты на каких путях
- imageMap — маппинг id → URL/gradient

**0.1.5** Зафиксировать:
- Bundler (Vite / Webpack)
- Build command
- Точку входа (main.tsx)
- Содержимое index.html (для шага 1.1)

### Артефакт: `AUDIT_CURRENT_STATE.md`
Полная карта: структура, содержимое компонентов, CSS-переменные, роуты, imageMap.

### ⛔ СТОП — ожидание подтверждения

---

# ═══════════════════════════════════════════
# ФАЗА 1 — ГЛОБАЛЬНЫЕ ИЗМЕНЕНИЯ
# ═══════════════════════════════════════════

## Этап 1.1 — Подключение шрифта Montserrat (1 сессия)

### Цель
Заменить системный шрифт на Montserrat.

### Файлы для правки

**Файл 1: `index.html`**  
Добавить в `<head>` ПЕРЕД `</head>`:
```html
<!-- Montserrat font (prototype standard) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Файл 2: `shared/theme/tokens.css`**  
Найти:
```css
--ax-font-sans: system-ui, -apple-system, "SF Pro Text", Inter, Roboto, Arial, sans-serif;
```
Заменить на:
```css
--ax-font-sans: 'Montserrat', system-ui, -apple-system, "SF Pro Text", Inter, Roboto, Arial, sans-serif;
```

### Проверка
- Нет ли других мест с жёстким `font-family` (grep по `.css` и `.tsx`)
- Исключение: `SF Mono` на Splash — это намеренно другой шрифт

### Артефакт: изменённые `index.html` + `tokens.css`

### ⛔ СТОП

---

## Этап 1.2 — CSS-токены заголовков и glass-morphism (1 сессия)

### Цель
Определить общие стилевые переменные прототипа. Пока НЕ применять — только определить.

### Файл: `shared/theme/tokens.css` (в `:root` блок)

**Добавить:**
```css
/* ============================================
   PROTOTYPE ALIGNMENT TOKENS
   ============================================ */

/* Heading tokens (6 из 7 экранов, кроме Service) */
--proto-heading-weight: 300;
--proto-heading-color: #7EE8F2;
--proto-heading-spacing: 0.5px;
--proto-heading-shadow: 0 0 30px rgba(34, 211, 238, 0.2);

/* Glass-morphism */
--proto-glass-bg: rgba(0, 0, 0, 0.3);
--proto-glass-blur: blur(10px);
--proto-glass-border: 1px solid rgba(126, 232, 242, 0.15);

/* Teal palette */
--proto-teal-70: rgba(126, 232, 242, 0.7);
--proto-teal-60: rgba(126, 232, 242, 0.6);
--proto-teal-55: rgba(126, 232, 242, 0.55);
--proto-teal-50: rgba(126, 232, 242, 0.5);
--proto-teal-40: rgba(126, 232, 242, 0.4);
--proto-teal-30: rgba(126, 232, 242, 0.3);
--proto-teal-15: rgba(126, 232, 242, 0.15);

/* Button glass (навигация) */
--proto-btn-glass-bg: rgba(34, 211, 238, 0.15);
--proto-btn-glass-color: #22D3EE;

/* Button solid (конверсия) */
--proto-btn-solid-bg: linear-gradient(135deg, #22D3EE, #06B6D4);
--proto-btn-solid-color: #050A0F;
--proto-btn-solid-shadow: 0 4px 20px rgba(34, 211, 238, 0.25);

/* Card tokens */
--proto-card-radius: 18px;
--proto-card-border: 1px solid rgba(255, 255, 255, 0.06);

/* Bottom Nav */
--proto-nav-bg: rgba(5, 10, 15, 0.7);
--proto-nav-blur: blur(20px);
--proto-nav-border: 1px solid rgba(255, 255, 255, 0.06);
--proto-nav-inactive: rgba(240, 246, 252, 0.35);
--proto-nav-active: #22D3EE;
--proto-nav-label-size: 10px;
```

### Файл: `shared/theme/global.css`

**Добавить утилитарный класс:**
```css
/* Prototype heading — для H1/H2 на экранах 0–6 (кроме Service) */
.proto-heading {
  font-weight: var(--proto-heading-weight);
  color: var(--proto-heading-color);
  letter-spacing: var(--proto-heading-spacing);
  text-shadow: var(--proto-heading-shadow);
}
```

### Проверка
- Визуально НИЧЕГО не изменилось (только определения, не применения)
- Нет конфликтов имён (префикс `--proto-` уникален)

### Артефакт: изменённые `tokens.css` + `global.css`

### ⛔ СТОП

---

## Этап 1.3 — Система кнопок: glass vs solid (1 сессия)

### Цель
Добавить два новых variant в Button.tsx. Существующие variants НЕ менять.

### Файл: `components/ui/Button.tsx`

**Шаг 1:** Изучить текущую структуру (из аудита 0.1)

**Шаг 2:** Обновить тип:
```tsx
type ButtonVariant = 'primary' | 'glassPrimary' | 'glassPrimaryMuted' | 'secondary' | 'ghost';
```

**Шаг 3:** Добавить стили новых variants:
```tsx
glassPrimary: {
  background: 'rgba(34, 211, 238, 0.15)',
  color: '#22D3EE',
  border: 'none',
  boxShadow: 'none',
},

glassPrimaryMuted: {
  background: 'rgba(34, 211, 238, 0.15)',
  color: 'rgba(34, 211, 238, 0.5)',   // намеренно приглушённый
  border: 'none',
  boxShadow: 'none',
},
```

**Шаг 4:** НЕ трогать существующий `primary` (solid gradient) — он верный для Service.

### Таблица применения (справочно, само применение — в Фазе 2):

| Экран | Кнопка | Текущий | Нужный |
|-------|--------|---------|--------|
| Welcome | "Подобрать решение" | `primary` | `glassPrimary` |
| Survey 1–4 | "Далее" | `primary` | `glassPrimary` |
| Survey 5 | "Получить план" | `primary` | `glassPrimary` |
| Result | "Задайте вопрос ИИ" | `secondary` | `glassPrimaryMuted` |
| Service | "Оставить заявку" | `primary` | `primary` ← без изменений |

### Проверка
- TypeScript принимает новые типы
- `glassPrimary` / `glassPrimaryMuted` пока НИГДЕ не используются (только определены)

### Артефакт: изменённый `Button.tsx`

### ⛔ СТОП
# ═══════════════════════════════════════════
# ФАЗА 2 — ЭКРАНЫ (от простого к сложному)
# ═══════════════════════════════════════════

## Этап 2.1 — Screen 0: Splash (1 сессия)

**Соответствие:** ~55% → 95%  
**Файлы:** `features/onboarding/SplashPage.tsx`, `shared/theme/global.css`

### Изменение 1: Удалить кнопку "Пропустить"
Найти и удалить блок с `<Button variant="ghost">Пропустить</Button>` в верхней секции.

### Изменение 2: Удалить текст "Загрузка Mini App shell..."
Найти и удалить нижнюю секцию с `<span className="ax-muted">Загрузка Mini App shell...</span>`.

### Изменение 3: Исправить подпись "Automation · AI · Optimization"
```tsx
// БЫЛО:
<p className="p muted">Automation · AI · Optimization</p>

// СТАЛО:
<p style={{
  fontSize: 12,
  color: 'rgba(240,246,252,0.35)',
  letterSpacing: '3px',
  fontFamily: "'SF Mono', Consolas, monospace",
  margin: 0,
  marginTop: 16,
}}>
  Automation · AI · Optimization
</p>
```

### Изменение 4: font-size логотипа (global.css)
```css
/* Найти в .splash-logo-fallback::after */
font-size: 38px;  →  font-size: 34px;
```

### Изменение 5: Упростить layout
Оставить только центральную секцию (логотип + подпись). Убрать трёхчастную структуру верх/центр/низ.

### Артефакт: изменённые `SplashPage.tsx` + `global.css`
### ⛔ СТОП

---

## Этап 2.2 — Screen 1: Welcome (1 сессия)

**Соответствие:** ~35% → 90%  
**Файлы:** `features/onboarding/WelcomePage.tsx`

### Изменение 1: H1 — prototype-heading стиль
```tsx
// БЫЛО:
style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, color: '#fff', textAlign: 'center', margin: 0, maxWidth: 340 }}

// СТАЛО:
style={{
  fontSize: 28,
  fontWeight: 300,                                    // было 700
  lineHeight: 1.15,                                   // было 1.25
  color: '#7EE8F2',                                   // было '#fff'
  textAlign: 'center',
  margin: 0,
  maxWidth: 340,
  letterSpacing: '0.5px',                             // добавлено
  textShadow: '0 0 30px rgba(34,211,238,0.2)',       // добавлено
}}
```

### Изменение 2: Primary кнопка → glassPrimary
```tsx
// БЫЛО:
<Button variant="primary" size="lg" fullWidth onClick={startOnboarding}>

// СТАЛО:
<Button variant="glassPrimary" size="lg" fullWidth onClick={startOnboarding}
  style={{ padding: '15px 0', fontSize: 15 }}>
```

### Изменение 3: Secondary кнопка — компактная, центрированная
```tsx
// БЫЛО:
<Button variant="secondary" size="lg" fullWidth onClick={openCases}>
  Смотреть кейсы
</Button>

// СТАЛО:
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <Button variant="secondary" onClick={openCases} style={{
    padding: '11px 22px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(34,211,238,0.6)',
    borderColor: 'rgba(34,211,238,0.15)',
    background: 'transparent',
    minHeight: 'auto',
  }}>
    Смотреть кейсы
  </Button>
</div>
```

### Артефакт: изменённый `WelcomePage.tsx`
### ⛔ СТОП

---

## Этап 2.3 — Screen 2: Survey — архитектура layout (1 сессия)

**Соответствие:** ~25% → 50% (после layout)  
**Файлы:** `features/onboarding/SurveyPage.tsx`, `imageMap.ts`

### ⚠️ Самый сложный архитектурный этап

### Изменение 1: Добавить survey-bg в imageMap
```tsx
// В imageMap:
'survey-bg': '/images/heroes/survey-bg.webp',

// В FALLBACK_GRADIENTS:
'survey-bg': 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.12), rgba(5,10,15,0.95) 70%)',
```

### Изменение 2: Заменить AppShell+Card на fullscreen

**БЫЛО (структура):**
```tsx
<AppShell title="Подбор решения" showBack>
  <Card variant="default">
    {/* dots, title, subtitle, options, button */}
  </Card>
</AppShell>
```

**СТАЛО:**
```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
  {/* Fullscreen background */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id="survey-bg" height="100%" borderRadius={0} scrim={false} alt="Survey bg" />
  </div>

  {/* Content overlay */}
  <div style={{
    position: 'relative', zIndex: 1,
    height: '100%', display: 'flex', flexDirection: 'column',
    padding: '64px 20px 20px',
    overflowY: 'auto',
  }}>
    {/* Всё содержимое Survey (dots, title, options, button) */}
  </div>
</div>
```

### КРИТИЧЕСКИ ВАЖНО — НЕ трогать:
- `fetchOnboardingConfig` / API calls
- `useOnboardingState` / state management
- `currentQuestion`, `selectedOptions`, `canContinue`
- Navigation logic
- Telegram Haptic feedback
- Анимация переходов

### Артефакт: изменённые `SurveyPage.tsx` + `imageMap.ts`
### ⛔ СТОП

---

## Этап 2.4 — Screen 2: Survey — стили элементов (1 сессия)

**Соответствие:** 50% → 85%  
**Файлы:** `features/onboarding/SurveyPage.tsx`

### Изменение 1: H2 — prototype-heading
```tsx
<h2 style={{
  fontSize: 26,          // было 24
  fontWeight: 300,       // было 700
  color: '#7EE8F2',      // было var(--app-text) = #f0f6fc
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 8,
}}>
  {currentQuestion.title}
</h2>
```

### Изменение 2: Удалить subtitle
```tsx
// УДАЛИТЬ строку:
<p className="p muted">{currentQuestion.subtitle}</p>
```

### Изменение 3: Контейнер опций
```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flex: 1,
  padding: '10px 0',
}}>
```

### Изменение 4: Каждая опция — inline-flex + glass
```tsx
<button style={{
  display: 'inline-flex',          // было block/fullWidth
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 14,
  background: isSelected ? 'rgba(34,211,238,0.06)' : 'rgba(0,0,0,0.18)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: 'none',                  // было 1px solid
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  textAlign: 'left',
}}>
  <span style={{ fontSize: 22, lineHeight: 1 }}>{option.icon}</span>
  <span style={{
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(126,232,242,0.55)',   // teal, было white
  }}>
    {option.label}
  </span>
  {/* НЕ рендерить option.description */}
</button>
```

### Изменение 5: Кнопка "Далее" → glassPrimary
```tsx
<Button variant="glassPrimary" size="lg" fullWidth
  disabled={!canContinue} onClick={() => void next()}
  style={{ marginTop: 16, padding: '15px 0', fontSize: 15 }}>
  {actionLabel}
</Button>
```

### Изменение 6: Dots — gap и counter
```tsx
// Dots gap: 6px (было 8)
// Counter color: 'rgba(126,232,242,0.4)' (teal, было gray)
```

### Артефакт: изменённый `SurveyPage.tsx`
### ⛔ СТОП

---

## Этап 2.5 — Screen 2: Survey — проверка всех шагов (1 сессия)

**Файлы:** `features/onboarding/SurveyPage.tsx`

### Чеклист проверки

| # | Проверка | Ожидание |
|---|----------|----------|
| 1 | Шаги 1–4: кнопка текст | "Далее" |
| 2 | Шаг 5: кнопка текст | "Получить план" |
| 3 | Все шаги: glassPrimary стиль | ✅ |
| 4 | Фоновое изображение | survey-bg на всех шагах |
| 5 | Анимация переходов | ax-step-slide-left работает |
| 6 | Disabled кнопка | opacity при !canContinue |
| 7 | Haptic feedback | При выборе опции |
| 8 | Survey Q5 → Result | Переход работает |

### Если найдены проблемы — исправить.

### Артефакт: результат тестирования, diff если были правки
### ⛔ СТОП

---

## Этап 2.6 — Screen 4: Result (1 сессия)

**Соответствие:** ~20% → 85%  
**Файлы:** `features/onboarding/OnboardingResultPage.tsx`, `components/domain/ServiceCard.tsx`

### Изменение 1: Добавить showBottomNav
```tsx
<AppShell title="Результат" showBack showBottomNav>
```

### Изменение 2: H2 — prototype-heading
```tsx
<h2 style={{
  fontSize: 26, fontWeight: 300, color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 6,
}}>
  {resultConfig.headline}
</h2>
```

### Изменение 3: Удалить description
```tsx
// УДАЛИТЬ: <p className="p muted">{resultConfig.description}</p>
```

### Изменение 4: Удалить лишние секции (ПОЛНОСТЬЮ)
1. ❌ Card glass "Похожий кейс" + CaseCard
2. ❌ Card interactive "Попробовать AI-демо" + кнопка
3. ❌ Card interactive "Обсудить внедрение" + "Оставить заявку"
4. ❌ Button ghost "Смотреть всё без фильтра"
5. ❌ Card elevated обёртка "Подходящие услуги" (обёртку убрать, карточки оставить)

### Изменение 5: Количество карточек 2 → 3
```tsx
{recommendedServices.slice(0, 3).map(...)}
```

### Изменение 6: Карточки — layout flex:1 space-evenly
```tsx
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  gap: 10,
}}>
  {recommendedServices.slice(0, 3).map(svc => ...)}
</div>
```

### Изменение 7: ServiceCard → стиль mj-card (минималистичный)

В `ServiceCard.tsx` — добавить режим `variant="minimal"` или создать inline:
```tsx
<div style={{
  borderRadius: 18,
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: 16,
  border: '1px solid rgba(255,255,255,0.06)',
  flex: 1,
  minHeight: 0,
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}}>
  <div style={{
    fontSize: 15, fontWeight: 300, lineHeight: 1.25,
    letterSpacing: '0.5px', color: '#7EE8F2', marginBottom: 4,
  }}>
    {service.title}
  </div>
  {/* НЕТ: category, description, badges */}
</div>
```

### Изменение 8: Кнопка AI → glassPrimaryMuted
```tsx
<Button variant="glassPrimaryMuted" fullWidth onClick={() => navigate('/ai')}
  style={{ padding: '15px 0', fontSize: 14 }}>
  Задайте вопрос искусственному интеллекту
</Button>
```

### Артефакт: изменённые `OnboardingResultPage.tsx` + `ServiceCard.tsx`
### ⛔ СТОП

---

## Этап 2.7 — Screen 5: Cases (1 сессия)

**Соответствие:** ~60% → 90%  
**Файлы:** `features/cases/CasesGalleryPage.tsx`, `components/domain/CaseCard.tsx`, `components/ui/Chip.tsx`

### Изменение 1: Добавить H2 в тело страницы (после AppShell, перед chips)
```tsx
<h2 style={{
  fontSize: 26, fontWeight: 300, color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 16, marginTop: 0,
}}>
  Кейсы
</h2>
```

### Изменение 2: CaseCard — убрать лишние элементы
В `CaseCard.tsx`:
- ❌ Удалить industry label
- ❌ Удалить metrics.headline (цветной cyan)
- ❌ Удалить tag chips внутри карточки

### Изменение 3: CaseCard — стиль title
```tsx
style={{
  fontSize: 16, fontWeight: 300, lineHeight: 1.25,
  letterSpacing: '0.5px', color: '#7EE8F2',
}}
```

### Изменение 4: CaseCard — контейнер
```tsx
style={{ borderRadius: 18, height: 200, overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.06)' }}
```

### Изменение 5: Chip.tsx — размеры
```tsx
style={{
  fontSize: 11,              // было 12
  padding: '4px 10px',       // было 6px 12px
  borderRadius: 8,
  minHeight: 'auto',         // убрать 36px
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
}}
```

### Изменение 6: Chip.tsx — цвета inactive
```tsx
// Active (без изменений):
background: 'rgba(34,211,238,0.12)', color: '#22D3EE',
border: '1px solid rgba(34,211,238,0.2)',

// Inactive:
background: 'transparent',                        // было rgba(255,255,255,0.04)
color: 'rgba(126,232,242,0.5)',                   // было rgba(240,246,252,0.65)
border: '1px solid rgba(126,232,242,0.15)',       // было rgba(255,255,255,0.06)
```

### Изменение 7: Chip row margin
```tsx
style={{ gap: 8, overflowX: 'auto', marginBottom: 20 }}
```

### Артефакт: изменённые `CasesGalleryPage.tsx` + `CaseCard.tsx` + `Chip.tsx`
### ⛔ СТОП

---

## Этап 2.8 — Screen 7: Service Detail (1 сессия)

**Соответствие:** ~65% → 90%  
**Файлы:** `features/services/ServiceDetailPage.tsx`

### Изменение 1: Layout → fullscreen bg, контент снизу
```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
  {/* Fullscreen background */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id={service.imageId} height="100%" borderRadius={0} scrim={false} />
  </div>
  {/* Content — прижат к низу */}
  <div style={{
    position: 'relative', zIndex: 1, height: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '64px 20px 80px', overflowY: 'auto',
  }}>
    {/* H1 + subtitle + chips + description + buttons */}
  </div>
</div>
```

### Изменение 2: Убрать TopBar "← Услуга"

### Изменение 3: Стили элементов
```tsx
// H1: fontSize 22 (было 24), остальное OK (weight 700, white — исключение!)
// Subtitle: fontSize 13 (было 14), color rgba(240,246,252,0.5) (было 0.6)
// Description: fontSize 14 (было 15), color rgba(240,246,252,0.65) (было 0.72)
```

### Изменение 4: Chips
```tsx
style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8,
  color: '#F0F6FC', background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(4px)' }}
```

### Изменение 5: Удалить лишние секции
1. ❌ Card glass "Что вы получите" (deliverables)
2. ❌ Card default "Предпосылки к старту" (prerequisites)
3. ❌ Card glass "Пакеты" + кнопки
4. ❌ Секция "Кейсы" + CaseCard

### Изменение 6: btn-secondary — компактнее
```tsx
<Button variant="secondary" fullWidth onClick={() => navigate('/services')}
  style={{ fontSize: 13, fontWeight: 500, borderRadius: 12,
    borderColor: 'rgba(34,211,238,0.3)', padding: '12px 0' }}>
  Все услуги
</Button>
```

### Артефакт: изменённый `ServiceDetailPage.tsx`
### ⛔ СТОП

---

## Этап 2.9 — Screen 6: AI Hub — архитектурная переделка (1 сессия)

**Соответствие:** ~15% → 60%  
**Файлы:** `features/ai/AiHubPage.tsx`, `features/ai/AiChatPage.tsx`, роутер

### Изменение 1: Роутер — перенаправить /ai сразу на чат
```tsx
// БЫЛО:
{ path: '/ai', element: <AiHubPage /> },
{ path: '/ai/chat', element: <AiChatPage /> },

// СТАЛО:
{ path: '/ai', element: <AiChatPage /> },
```

### Изменение 2: AiChatPage — fullscreen layout
```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
  {/* Fullscreen bg */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id="hero-ai-hub" height="100%" borderRadius={0} scrim={false} />
  </div>
  {/* Content */}
  <div style={{
    position: 'relative', zIndex: 1, height: '100%',
    display: 'flex', flexDirection: 'column',
    padding: '64px 20px 80px',
  }}>
    {/* H1 + Chat area + Composer */}
  </div>
</div>
```

### Изменение 3: Убрать лишние элементы из чата
- ❌ AppShell "Задайте вопрос..."
- ❌ Warning banner ("Не передавайте ПДн...")
- ❌ Message counter (usedTurns/maxTurns)
- ❌ Quick prompt chips
- ❌ "Показать результат" button

### Изменение 4: Добавить H1 в чат
```tsx
<h1 style={{
  fontSize: 26, fontWeight: 300, color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 20,
}}>
  Задайте вопрос<br/>искусственному интеллекту
</h1>
```

### Изменение 5: Chat area — layout
```tsx
<div style={{
  flex: 1, display: 'flex', flexDirection: 'column',
  justifyContent: 'flex-end', gap: 12, marginBottom: 16,
  overflowY: 'auto',
}}>
  {messages.map(msg => <ChatMessageBubble key={msg.id} {...msg} />)}
</div>
```

### НЕ ТРОГАТЬ: API calls, message state, send logic, typing indicator

### Артефакт: изменённые роутер + `AiChatPage.tsx`
### ⛔ СТОП

---

## Этап 2.10 — Screen 6: AI Hub — стили чат-элементов (1 сессия)

**Соответствие:** 60% → 90%  
**Файлы:** `components/domain/ChatMessageBubble.tsx`, `components/domain/ChatComposer.tsx`, `shared/theme/global.css`

### Изменение 1: Avatar (AX) в ChatMessageBubble.tsx
```tsx
const avatarStyle = {
  width: 28, height: 28,                                    // было 32
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #22D3EE, #06B6D4)', // было #0891B2
  color: '#050A0F',                                          // ТЁМНЫЙ! было #fff
  fontSize: 10,                                              // было 11
  fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};
```

### Изменение 2: AI bubble (global.css)
```css
.bubble-bot {
  background: rgba(0, 0, 0, 0.3);              /* было rgba(15,30,45,0.7) */
  backdrop-filter: blur(10px);                  /* ДОБАВИТЬ */
  -webkit-backdrop-filter: blur(10px);
  border: none;                                 /* было 1px solid */
  border-radius: 14px;
  border-top-left-radius: 4px;                  /* было 18px 18px 18px 6px */
  padding: 12px 16px;                           /* было 14px 16px */
  max-width: 80%;                               /* было 85% */
  color: rgba(126, 232, 242, 0.7);             /* TEAL! было rgba(240,246,252,0.85) */
  font-size: 14px;
  font-weight: 300;                             /* было 400 */
  line-height: 1.5;
}
```

### Изменение 3: User bubble (global.css)
```css
.bubble-user {
  background: rgba(34, 211, 238, 0.1);         /* было gradient */
  border: none;                                 /* было 1px solid */
  border-radius: 14px;
  border-top-right-radius: 4px;                 /* было 18px 18px 6px 18px */
  padding: 12px 16px;
  max-width: 80%;
  color: rgba(126, 232, 242, 0.6);             /* TEAL! было #f0f6fc */
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
  margin-left: auto;
}
```

### Изменение 4: Chat list gap (global.css)
```css
.ax-chat-list { gap: 12px; }  /* было 8px */
```

### Изменение 5: ChatComposer — input field
```tsx
style={{
  flex: 1,
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(126,232,242,0.15)',
  borderRadius: 14,                              // было 12
  padding: '14px 16px',
  color: '#F0F6FC',
  fontSize: 14, fontWeight: 300,                 // было 15, 400
}}
```

### Изменение 6: Placeholder (global.css)
```css
.chat-input::placeholder {
  color: rgba(126, 232, 242, 0.3);
  font-weight: 300;
  font-size: 14px;
}
```

### Изменение 7: ChatComposer — send button
```tsx
style={{
  width: 44, height: 44, borderRadius: 12,
  background: 'rgba(34,211,238,0.15)',           // glass! было solid gradient
  border: 'none', boxShadow: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
}}
// Icon: color rgba(34,211,238,0.5) — приглушённый
```

### Изменение 8: Composer container — убрать bg
Убрать: `background`, `borderTop`, `backdropFilter` на контейнере composer.
Оставить: `display: flex, gap: 10, alignItems: center`.

### Артефакт: изменённые `ChatMessageBubble.tsx` + `ChatComposer.tsx` + `global.css`
### ⛔ СТОП
# ═══════════════════════════════════════════
# ФАЗА 3 — ОБЩАЯ ШЛИФОВКА И QA
# ═══════════════════════════════════════════

## Этап 3.1 — Bottom Navigation (1 сессия)

**Файлы:** `components/layout/BottomNav.tsx`

### Изменение 1: Убрать 5-й элемент "Профиль"

Оставить 4 элемента:
| # | Label | Route |
|---|-------|-------|
| 1 | Услуги | `/services` |
| 2 | Кейсы | `/cases` |
| 3 | AI-демо | `/ai` |
| 4 | Заявка | `/lead` или `/request` |

### Изменение 2: Стили
```tsx
// Label fontSize: 10px (было 11)
// Inactive color: rgba(240,246,252,0.35) (было 0.38)
// Container background: rgba(5,10,15,0.7) (было linear-gradient)
// Active color: #22D3EE ← без изменений
// Height: 64px ← без изменений
// Backdrop-filter: blur(20px) ← без изменений
```

### Изменение 3: Проверить showBottomNav на экранах

| Экран | Нужно | Действие |
|-------|-------|----------|
| Splash | ❌ | — |
| Welcome | ❌ | — |
| Survey | ❌ | — |
| Result | ✅ | Добавлено в 2.6 |
| Cases | ✅ | — |
| AI Hub | ✅ | Проверить после 2.9 |
| Service | ✅ | — |
| ServicesCatalog | ✅ | — |

### Артефакт: изменённый `BottomNav.tsx`
### ⛔ СТОП

---

## Этап 3.2 — ServicesCatalog (1 сессия)

**Файлы:** `features/services/ServicesCatalogPage.tsx`  
**Эталон:** нет в прототипе, стилизуем по аналогии с Cases

### Изменение 1: H2 — prototype-heading
```tsx
<h2 style={{
  fontSize: 26, fontWeight: 300, color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 16,
}}>
  Услуги
</h2>
```

### Изменение 2: Карточки услуг → стиль mj-card
```tsx
<button onClick={() => navigate(`/services/${service.id}`)} style={{
  width: '100%', borderRadius: 18, overflow: 'hidden',
  position: 'relative', display: 'flex', flexDirection: 'column',
  justifyContent: 'flex-end', padding: 16,
  border: '1px solid rgba(255,255,255,0.06)',
  height: 200,
  backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
  cursor: 'pointer', textAlign: 'left',
}}>
  {/* Scrim для читаемости */}
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, transparent 40%, rgba(5,10,15,0.8) 100%)',
    borderRadius: 18,
  }} />
  {/* Только название */}
  <span style={{
    fontSize: 16, fontWeight: 300, lineHeight: 1.25,
    letterSpacing: '0.5px', color: '#7EE8F2',
    position: 'relative', zIndex: 1,
  }}>
    {service.title}
  </span>
  {/* НЕТ: category, shortPitch, badges */}
</button>
```

### Изменение 3: Контейнер карточек
```tsx
style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
```

### Изменение 4: Если есть search bar — glass стиль
```tsx
style={{
  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(126,232,242,0.15)', borderRadius: 14,
  padding: '12px 16px', color: '#F0F6FC', fontSize: 14, fontWeight: 300,
}}
```

### Артефакт: изменённый `ServicesCatalogPage.tsx`
### ⛔ СТОП

---

## Этап 3.3 — Финальная проверка QA (1 сессия)

### Полный чеклист (149 проверок)

#### Глобальные (на каждом экране)
- [ ] Шрифт Montserrat отображается
- [ ] Заголовки weight 300 (кроме Service = 700)
- [ ] Заголовки #7EE8F2 (кроме Service = white)
- [ ] Text-shadow на заголовках
- [ ] Letter-spacing 0.5px

#### Screen 0: Splash (9)
- [ ] Нет "Пропустить"
- [ ] Нет "Загрузка..."
- [ ] Логотип 34px
- [ ] Подпись: letter-spacing 3px, SF Mono, 12px, rgba(240,246,252,0.35)
- [ ] Layout: только центр
- [ ] Автопереход ~2сек

#### Screen 1: Welcome (8)
- [ ] H1: weight 300, #7EE8F2, text-shadow, lineHeight 1.15, letterSpacing 0.5px
- [ ] Primary: glass (rgba(34,211,238,0.15)), cyan text, no shadow
- [ ] Secondary: auto-width, центрирована, 13px, weight 500, rgba(34,211,238,0.6)
- [ ] Нет BottomNav

#### Screen 2: Survey (14)
- [ ] Fullscreen layout (не card-based)
- [ ] Нет TopBar, нет Card
- [ ] H2: 26px, weight 300, #7EE8F2, text-shadow
- [ ] Нет subtitle
- [ ] Опции: inline-flex, glass bg, blur(10px), border none
- [ ] Labels: rgba(126,232,242,0.55) teal
- [ ] Нет descriptions
- [ ] Emoji 22px
- [ ] Кнопка: glassPrimary
- [ ] Dots gap 6px, counter teal
- [ ] Все 5 шагов работают
- [ ] Шаг 5: "Получить план"
- [ ] Нет BottomNav

#### Screen 4: Result (12)
- [ ] H2: prototype-heading
- [ ] Нет description
- [ ] 3 карточки mj-card (только title)
- [ ] Title: weight 300, #7EE8F2
- [ ] Нет category/description/badges
- [ ] Нет секций: кейс, AI-демо, внедрение, "смотреть всё"
- [ ] Кнопка AI: glassPrimaryMuted (приглушённый цвет)
- [ ] BottomNav: 4 элемента

#### Screen 5: Cases (10)
- [ ] H2 "Кейсы" в body
- [ ] CaseCard: только title (нет label, metrics, tags)
- [ ] Title: weight 300, #7EE8F2
- [ ] Card: height 200, radius 18
- [ ] Chip: 11px, padding 4px 10px, blur(4px)
- [ ] Chip inactive: teal color/border, transparent bg
- [ ] BottomNav: "Кейсы" active

#### Screen 6: AI Hub (21)
- [ ] Нет каталога сценариев, /ai → сразу чат
- [ ] Fullscreen bg
- [ ] H1: 26px, weight 300, #7EE8F2
- [ ] Нет: warning, counter, quick prompts, "показать результат"
- [ ] Avatar: 28px, color #050A0F (тёмный)
- [ ] AI bubble: bg rgba(0,0,0,0.3), blur(10px), no border, radius 14/4
- [ ] AI bubble text: rgba(126,232,242,0.7), weight 300
- [ ] User bubble: bg rgba(34,211,238,0.1), no border, radius 14/4
- [ ] User bubble text: rgba(126,232,242,0.6), weight 300
- [ ] Max-width: 80%
- [ ] Chat gap: 12px
- [ ] Input: glass bg, teal border, radius 14
- [ ] Placeholder: rgba(126,232,242,0.3)
- [ ] Send: 44px, glass bg, приглушённая иконка
- [ ] Composer: нет bg/borderTop
- [ ] Отправка работает
- [ ] BottomNav: "AI-демо" active

#### Screen 7: Service (12)
- [ ] Fullscreen bg, контент снизу
- [ ] Нет TopBar
- [ ] H1: 22px, weight 700 (исключение!), white
- [ ] Subtitle: 13px, rgba(240,246,252,0.5)
- [ ] Chips: rgba(255,255,255,0.1), blur(4px)
- [ ] Description: 14px, rgba(240,246,252,0.65)
- [ ] Нет секций: deliverables, prerequisites, packages, cases
- [ ] btn-primary: solid gradient (конверсия) — без изменений
- [ ] btn-secondary: 13px, weight 500, radius 12
- [ ] BottomNav: "Услуги" active

#### ServicesCatalog (6)
- [ ] H2: prototype-heading
- [ ] Карточки: mj-card (изображение + title)
- [ ] Title: weight 300, #7EE8F2
- [ ] Нет category/pitch/badges
- [ ] Card: radius 18, height 200
- [ ] BottomNav: "Услуги" active

#### BottomNav глобально (8)
- [ ] 4 элемента (нет "Профиль")
- [ ] Label 10px
- [ ] Inactive rgba(240,246,252,0.35)
- [ ] Не показан на: Splash, Welcome, Survey
- [ ] Показан на: Result, Cases, AI Hub, Service, ServicesCatalog
- [ ] Correct active state на каждом экране

#### Переходы (13)
- [ ] Splash → Welcome (авто)
- [ ] Welcome → Survey Q1
- [ ] Survey Q1→Q2→...→Q5
- [ ] Survey Q5 → Result
- [ ] Result → Service Detail (карточка)
- [ ] Result → AI Chat (кнопка)
- [ ] BottomNav → Cases
- [ ] BottomNav → AI Chat
- [ ] BottomNav → ServicesCatalog
- [ ] BottomNav → Lead/Request
- [ ] ServicesCatalog → Service Detail
- [ ] Service Detail → ServicesCatalog ("Все услуги")
- [ ] Cases → Case Detail (если есть)

### Если найдены проблемы — исправить.

### Артефакт: `QA_FINAL_REPORT.md` со всеми результатами
### ⛔ СТОП

---

# ═══════════════════════════════════════════
# ФАЗА 4 — ДЕПЛОЙ (через Claude Code)
# ═══════════════════════════════════════════

## Этап 4.1 — Анализ процесса деплоя (1 сессия, Claude Code)

### Действия
1. Подключиться к VPS
2. Найти проект: `find / -name "axentrait-miniapp" -type d`
3. Проверить git: `git branch`, `git status`, `git remote -v`
4. Проверить деплой: Docker? PM2? Nginx static? CI/CD?
5. Найти production dist: nginx root, конфиг
6. Проверить текущее состояние: `curl -sI https://app.axentrait.com`

### Артефакт: `DEPLOY_PLAN.md`
### ⛔ СТОП

---

## Этап 4.2 — Подготовка к деплою (1 сессия, Claude Code)

### Действия
1. **Бэкап текущего production dist:**
   ```bash
   cp -r /path/to/dist /path/to/backups/dist-$(date +%Y%m%d-%H%M%S)
   ```
2. **Перейти на ветку с правками:**
   ```bash
   git checkout feature/prototype-alignment
   git pull
   ```
3. **Установить зависимости и собрать:**
   ```bash
   cd apps/miniapp-frontend
   npm install
   npm run build
   ```
4. **Проверить build:**
   ```bash
   ls -la dist/
   grep "Montserrat" dist/index.html
   ```
5. **Merge в main:**
   ```bash
   git checkout main
   git merge feature/prototype-alignment --no-ff -m "merge: prototype alignment"
   git push origin main
   ```
6. **Пересобрать на main:**
   ```bash
   cd apps/miniapp-frontend && npm run build
   ```

### Артефакт: результат сборки, git log
### ⛔ СТОП

---

## Этап 4.3 — Деплой на production (1 сессия, Claude Code)

### Действия (зависят от способа из 4.1)

**Сценарий: Nginx static**
```bash
mv /path/to/production/dist /path/to/production/dist.old
cp -r apps/miniapp-frontend/dist /path/to/production/dist
sudo nginx -t && sudo systemctl reload nginx
```

**Сценарий: Docker**
```bash
docker compose build miniapp-frontend
docker compose up -d miniapp-frontend
```

**Сценарий: PM2**
```bash
pm2 restart axentrait-frontend
```

### Проверка
```bash
curl -sI https://app.axentrait.com | head -5     # HTTP 200
curl -s https://app.axentrait.com | grep "Montserrat"  # Шрифт
```

### Артефакт: лог деплоя
### ⛔ СТОП

---

## Этап 4.4 — Пост-деплой проверка (1 сессия)

### Проверка в Telegram (16 пунктов)
| # | Проверка |
|---|----------|
| 1 | Приложение открывается |
| 2 | Шрифт Montserrat |
| 3 | Splash → Welcome |
| 4 | Welcome: H1 тонкий cyan |
| 5 | Welcome: glass кнопка |
| 6 | Survey: fullscreen, glass опции |
| 7 | Survey: все 5 шагов |
| 8 | Result: 3 mj-card |
| 9 | BottomNav: 4 элемента |
| 10 | Cases: минималистичные карточки |
| 11 | AI Chat: сразу чат, teal palette |
| 12 | Service: fullscreen bg |
| 13 | ServicesCatalog: mj-card |
| 14 | iOS Safari: backdrop-filter |
| 15 | Android Chrome: backdrop-filter |
| 16 | Ошибки в логах: 0 |

### Процедура отката (если проблемы)
```bash
rm -rf /path/to/production/dist
cp -r /path/to/backups/dist-BACKUP /path/to/production/dist
sudo nginx -t && sudo systemctl reload nginx
```

### Артефакт: `DEPLOY_REPORT.md`
### ⛔ СТОП

---

# ═══════════════════════════════════════════
# СВОДНАЯ ТАБЛИЦА ВСЕХ ЭТАПОВ
# ═══════════════════════════════════════════

| Этап | Описание | Инструмент | Файлы | Сложность |
|------|----------|-----------|-------|-----------|
| **0.1** | Аудит кода | Claude Opus | Все | 🟢 |
| **1.1** | Montserrat | Claude Opus | index.html, tokens.css | 🟢 |
| **1.2** | CSS-токены | Claude Opus | tokens.css, global.css | 🟢 |
| **1.3** | Button glass/solid | Claude Opus | Button.tsx | 🟡 |
| **2.1** | Splash | Claude Opus | SplashPage.tsx, global.css | 🟢 |
| **2.2** | Welcome | Claude Opus | WelcomePage.tsx | 🟡 |
| **2.3** | Survey layout | Claude Opus | SurveyPage.tsx, imageMap | 🔴 |
| **2.4** | Survey стили | Claude Opus | SurveyPage.tsx | 🟡 |
| **2.5** | Survey тест | Claude Opus | SurveyPage.tsx | 🟢 |
| **2.6** | Result | Claude Opus | ResultPage, ServiceCard | 🔴 |
| **2.7** | Cases | Claude Opus | CasesGallery, CaseCard, Chip | 🟡 |
| **2.8** | Service | Claude Opus | ServiceDetailPage.tsx | 🔴 |
| **2.9** | AI Hub архитектура | Claude Opus | AiChatPage, роутер | 🔴 |
| **2.10** | AI Hub стили | Claude Opus | ChatBubble, Composer, CSS | 🟡 |
| **3.1** | BottomNav | Claude Opus | BottomNav.tsx | 🟢 |
| **3.2** | ServicesCatalog | Claude Opus | ServicesCatalogPage.tsx | 🟡 |
| **3.3** | QA | Claude Opus | Все | 🟡 |
| **4.1** | Анализ деплоя | Claude Code | VPS | 🟡 |
| **4.2** | Подготовка деплоя | Claude Code | VPS | 🟡 |
| **4.3** | Деплой | Claude Code | VPS | 🔴 |
| **4.4** | Пост-деплой | Claude Code | VPS + Telegram | 🟡 |

**Итого: 21 этап = 21 сессия**  
**Claude Opus: 17 сессий | Claude Code: 4 сессии**

---

# ═══════════════════════════════════════════
# ПРАВИЛА РАБОТЫ
# ═══════════════════════════════════════════

1. **Один этап = одна сессия** — после каждого СТОП
2. **Артефакт обязателен** — изменённые файлы после каждого этапа
3. **Никаких самовольных изменений** — только по этой карте
4. **Вопросы и предложения** — обсуждаются до внесения
5. **Git commit** после каждого этапа (при деплое через Claude Code)
6. **Контекст ~180k** — переход в новый чат с SESSION_CONTEXT
7. **Claude Code** — только для Фазы 4 (деплой на VPS)
