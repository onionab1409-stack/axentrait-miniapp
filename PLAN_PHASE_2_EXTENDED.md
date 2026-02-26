# AXENTRAIT MiniApp — Расширенный план Фазы 2: Экраны (поэкранные правки)

**Дата:** 2026-02-26  
**Фаза:** 2 — Экраны от простого к сложному  
**Этапы:** 2.1–2.10 (10 сессий)  
**Статус:** ⬜ Не начат  
**Зависимость:** Фаза 0 + Фаза 1 должны быть завершены  

---

## Общий принцип Фазы 2

Каждый этап = один экран (или логическая часть экрана). Порядок — от простого к сложному, чтобы наработать паттерн правок и снизить риск ошибок на сложных экранах.

**Порядок:** Splash → Welcome → Survey (layout) → Survey (стили) → Survey (тест) → Result → Cases → Service → AI Hub (архитектура) → AI Hub (стили)

**Для каждого экрана одинаковая последовательность:**
1. Прочитать текущий файл через Claude Code
2. Сверить с отчётом (какие изменения нужны)
3. Внести изменения пошагово
4. Собрать проект (`npm run build`)
5. Git commit
6. Создать артефакт (diff)
7. СТОП

---

## Этап 2.1 — Screen 0: Splash (1 сессия)

**Текущее соответствие:** ~55% | **Критических:** 5  
**Файлы:** `features/onboarding/SplashPage.tsx`, `shared/theme/global.css`  
**Отчёт:** `REPORT_SCREEN_0_SPLASH.md`

### Шаг 2.1.1 — Прочитать текущий SplashPage.tsx
```bash
cat apps/miniapp-frontend/src/features/onboarding/SplashPage.tsx
```
**Цель:** Понять текущую структуру JSX, найти элементы для удаления/правки.

### Шаг 2.1.2 — Удалить кнопку "Пропустить"
**Найти и удалить** блок с кнопкой ghost "Пропустить" в верхнем правом углу.

Ожидаемый код для удаления:
```tsx
<div className="ax-row" style={{ justifyContent: 'flex-end', zIndex: 1 }}>
  <Button variant="ghost" onClick={() => navigate('/welcome')}>
    Пропустить
  </Button>
</div>
```

### Шаг 2.1.3 — Удалить текст "Загрузка Mini App shell..."
**Найти и удалить** нижнюю секцию с текстом загрузки.

Ожидаемый код для удаления:
```tsx
<div className="ax-col" style={{ gap: 6, textAlign: 'center', zIndex: 1 }}>
  <span className="ax-muted">Загрузка Mini App shell...</span>
</div>
```

### Шаг 2.1.4 — Исправить подпись "Automation · AI · Optimization"
**Найти** элемент `<p>` с текстом подписи и **заменить** стили:

```tsx
// БЫЛО (примерно):
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

### Шаг 2.1.5 — Исправить font-size логотипа в CSS
**Файл:** `shared/theme/global.css`

**Найти:**
```css
.splash-logo-fallback::after {
  /* ... */
  font-size: 38px;
```

**Заменить на:**
```css
  font-size: 34px;
```

### Шаг 2.1.6 — Упростить layout
Оставить только центральную секцию: логотип + подпись. Убрать трёхсекционную структуру (верх/центр/низ).

**Целевая структура JSX:**
```tsx
<main style={{ 
  minHeight: '100dvh', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  position: 'relative', 
  overflow: 'hidden' 
}}>
  {/* Фон */}
  <MjImage id="splash-bg" scrim={false} borderRadius={0} ... />
  
  {/* Единственная центральная секция */}
  <section style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: 16, 
    zIndex: 1 
  }}>
    <SplashRive />
    <p style={{ /* подпись */ }}>Automation · AI · Optimization</p>
  </section>
</main>
```

### Шаг 2.1.7 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.1.8 — Git commit
```bash
git add -A
git commit -m "fix(splash): remove skip button, loading text, fix logo size and tagline (phase 2.1)"
```

### Артефакт: diff SplashPage.tsx + global.css

---

## Этап 2.2 — Screen 1: Welcome (1 сессия)

**Текущее соответствие:** ~35% | **Критических:** 7  
**Файлы:** `features/onboarding/WelcomePage.tsx`  
**Отчёт:** `REPORT_SCREEN_1_WELCOME.md`

### Шаг 2.2.1 — Прочитать текущий WelcomePage.tsx
```bash
cat apps/miniapp-frontend/src/features/onboarding/WelcomePage.tsx
```

### Шаг 2.2.2 — Исправить H1
**Найти** элемент `<h1>` и **заменить** стилевые свойства:

| Свойство | Было | Стало |
|----------|------|-------|
| `fontWeight` | `700` | `300` |
| `color` | `'#fff'` | `'#7EE8F2'` |
| `lineHeight` | `1.25` | `1.15` |
| `letterSpacing` | не задано | `'0.5px'` |
| `textShadow` | не задано | `'0 0 30px rgba(34,211,238,0.2)'` |

**Код:**
```tsx
<h1 style={{
  fontSize: 28,
  fontWeight: 300,          // было 700
  lineHeight: 1.15,         // было 1.25
  color: '#7EE8F2',         // было '#fff'
  textAlign: 'center',
  margin: 0,
  maxWidth: 340,
  letterSpacing: '0.5px',   // добавлено
  textShadow: '0 0 30px rgba(34,211,238,0.2)',  // добавлено
}}>
```

### Шаг 2.2.3 — Исправить Primary кнопку "Подобрать решение"
**Заменить** variant `primary` на `glassPrimary`:

```tsx
// БЫЛО:
<Button variant="primary" size="lg" fullWidth onClick={startOnboarding}>

// СТАЛО:
<Button variant="glassPrimary" size="lg" fullWidth onClick={startOnboarding}>
```

**Если glassPrimary не включает все нужные стили** (padding, fontSize), добавить inline:
```tsx
<Button 
  variant="glassPrimary" size="lg" fullWidth 
  onClick={startOnboarding}
  style={{ padding: '15px 0', fontSize: 15 }}
>
```

### Шаг 2.2.4 — Исправить Secondary кнопку "Смотреть кейсы"
**Было:** fullWidth растянутая кнопка  
**Стало:** компактная, центрированная

```tsx
// БЫЛО:
<Button variant="secondary" size="lg" fullWidth onClick={openCases}>
  Смотреть кейсы
</Button>

// СТАЛО:
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <Button
    variant="secondary"
    onClick={openCases}
    style={{
      padding: '11px 22px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 500,
      color: 'rgba(34,211,238,0.6)',
      borderColor: 'rgba(34,211,238,0.15)',
      background: 'transparent',
      minHeight: 'auto',
    }}
  >
    Смотреть кейсы
  </Button>
</div>
```

### Шаг 2.2.5 — (Опционально) Ослабить overlay
**Обсудить с заказчиком:** если фоновое изображение слишком затемнено, можно уменьшить opacity overlay-градиента.

Текущий:
```
rgba(5,10,15,0.45) → 0.25 → 0.7 → 0.92
```
Предлагаемый:
```
rgba(5,10,15,0.3) → 0.1 → 0.5 → 0.8
```

**Решение:** внести только если заказчик подтвердит. По умолчанию НЕ менять.

### Шаг 2.2.6 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.2.7 — Git commit
```bash
git add -A
git commit -m "fix(welcome): h1 weight 300 cyan, glassPrimary button, compact secondary (phase 2.2)"
```

### Артефакт: diff WelcomePage.tsx

---

## Этап 2.3 — Screen 2: Survey — архитектура layout (1 сессия)

**Текущее соответствие:** ~25% | **Критических:** 11  
**Файлы:** `features/onboarding/SurveyPage.tsx`, возможно `imageMap.ts`  
**Отчёт:** `REPORT_SCREEN_2_SURVEY.md`

**⚠️ Это самый сложный архитектурный этап.** Survey переделывается из card-based в fullscreen.

### Шаг 2.3.1 — Прочитать текущий SurveyPage.tsx
```bash
cat apps/miniapp-frontend/src/features/onboarding/SurveyPage.tsx
```
**Зафиксировать:**
- Как используется AppShell (props, children)
- Как используется Card (variant, children)
- Где находятся: dots, title, subtitle, options, button
- Какая логика (fetchOnboardingConfig, state, navigation)

### Шаг 2.3.2 — Найти imageMap
```bash
find apps/miniapp-frontend/src -name "*imageMap*" -o -name "*image*map*" | head -5
cat apps/miniapp-frontend/src/<путь к imageMap>
```
**Цель:** Добавить `survey-bg` в маппинг изображений.

### Шаг 2.3.3 — Добавить survey-bg в imageMap
```tsx
// В imageMap:
'survey-bg': '/images/heroes/survey-bg.webp',

// В FALLBACK_GRADIENTS:
'survey-bg': 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.12), rgba(5,10,15,0.95) 70%)',
```

### Шаг 2.3.4 — Заменить AppShell+Card на fullscreen layout
**Это главное изменение.** Нужно:

1. **Убрать** обёртку `<AppShell title="Подбор решения" showBack>`
2. **Убрать** обёртку `<Card variant="default">`
3. **Добавить** fullscreen контейнер с фоном

**Структура ДО:**
```tsx
<AppShell title="Подбор решения" showBack>
  <Card variant="default">
    {/* dots, title, subtitle, options, button */}
  </Card>
</AppShell>
```

**Структура ПОСЛЕ:**
```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
  {/* Fullscreen background */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id="survey-bg" height="100%" borderRadius={0} scrim={false} alt="Survey background" />
  </div>

  {/* Content overlay */}
  <div style={{
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '64px 20px 20px',
    overflowY: 'auto',
  }}>
    {/* dots, title, options, button — без subtitle! */}
  </div>
</div>
```

### Шаг 2.3.5 — Сохранить всю бизнес-логику
**Критически важно:** НЕ трогать:
- `fetchOnboardingConfig` / API calls
- `useOnboardingState` / state management
- `currentQuestion`, `selectedOptions`, `canContinue`
- Navigation logic (`next()`, `navigate()`)
- Telegram Haptic feedback
- Анимация переходов (`ax-step-slide-left`)

Мы меняем ТОЛЬКО обёртку (layout), не логику.

### Шаг 2.3.6 — Проверить что анимация переходов не сломалась
Если анимация `ax-step-slide-left` привязана к AppShell или Card, нужно перенести класс на новый контейнер.

```bash
grep -rn "ax-step-slide" apps/miniapp-frontend/src/ --include="*.tsx" --include="*.css"
```

### Шаг 2.3.7 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.3.8 — Git commit
```bash
git add -A
git commit -m "refactor(survey): replace AppShell+Card with fullscreen layout (phase 2.3)"
```

### Артефакт: diff SurveyPage.tsx + imageMap

---

## Этап 2.4 — Screen 2: Survey — стили элементов (1 сессия)

**Файлы:** `features/onboarding/SurveyPage.tsx`  
**Зависимость:** Этап 2.3 (layout) завершён

### Шаг 2.4.1 — Прочитать обновлённый SurveyPage.tsx
```bash
cat apps/miniapp-frontend/src/features/onboarding/SurveyPage.tsx
```

### Шаг 2.4.2 — Исправить H2 (заголовок вопроса)
```tsx
<h2 style={{
  fontSize: 26,       // было 24
  fontWeight: 300,    // было 700
  color: '#7EE8F2',   // было var(--app-text)
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 8,
}}>
  {currentQuestion.title}
</h2>
```

### Шаг 2.4.3 — Убрать subtitle
**Найти и удалить/закомментировать:**
```tsx
// УДАЛИТЬ:
<p className="p muted">{currentQuestion.subtitle}</p>
```

### Шаг 2.4.4 — Переделать опции: inline-flex + glass
**Контейнер опций:**
```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',     // по левому краю
  justifyContent: 'space-between', // равномерное распределение
  flex: 1,
  padding: '10px 0',
}}>
  {currentQuestion.options.map(option => (
    <button
      key={option.id}
      onClick={() => selectOption(option.id)}
      style={{
        display: 'inline-flex',   // было block/fullWidth
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 14,
        background: isSelected(option.id)
          ? 'rgba(34,211,238,0.06)'
          : 'rgba(0,0,0,0.18)',   // было rgba(255,255,255,0.02)
        backdropFilter: 'blur(10px)',       // ДОБАВИТЬ
        WebkitBackdropFilter: 'blur(10px)', // Safari
        border: 'none',          // было 1px solid
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
    >
      {/* содержимое */}
    </button>
  ))}
</div>
```

### Шаг 2.4.5 — Исправить содержимое опции (emoji + label, без description)
```tsx
{/* Emoji */}
<span style={{ fontSize: 22, lineHeight: 1 }}>{option.icon}</span>

{/* Label — только label, без description! */}
<span style={{
  fontSize: 14,
  fontWeight: 600,
  color: 'rgba(126,232,242,0.55)',  // teal, было #f0f6fc
}}>
  {option.label}
</span>

{/* УДАЛИТЬ description:
<span className="option-hint">{option.description}</span>
*/}
```

### Шаг 2.4.6 — Кнопка "Далее" → glassPrimary
```tsx
<Button
  variant="glassPrimary"
  size="lg"
  fullWidth
  disabled={!canContinue}
  onClick={() => void next()}
  style={{ marginTop: 16, padding: '15px 0', fontSize: 15 }}
>
  {actionLabel}
</Button>
```

### Шаг 2.4.7 — Dots: gap и counter
**Dots контейнер:**
```tsx
style={{ gap: 6 }}  // было 8
```

**Counter (1/5):**
```tsx
style={{
  fontSize: 13,
  color: 'rgba(126,232,242,0.4)',  // teal, было gray
}}
```

### Шаг 2.4.8 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.4.9 — Git commit
```bash
git add -A
git commit -m "fix(survey): prototype heading, glass options, teal labels, remove descriptions (phase 2.4)"
```

### Артефакт: diff SurveyPage.tsx

---

## Этап 2.5 — Screen 2: Survey — проверка всех шагов (1 сессия)

**Файлы:** `features/onboarding/SurveyPage.tsx`  
**Зависимость:** Этапы 2.3 + 2.4 завершены

### Шаг 2.5.1 — Проверить данные всех 5 вопросов
```bash
# Найти где определены вопросы (API или локальные данные)
grep -rn "questions\|onboardingConfig\|surveyConfig" apps/miniapp-frontend/src/ --include="*.tsx" --include="*.ts" | head -20
```

### Шаг 2.5.2 — Проверить шаги 1–4 (кнопка "Далее")
- Все шаги должны использовать `glassPrimary`
- `actionLabel` для шагов 1–4 = "Далее"
- Переход к следующему шагу работает

### Шаг 2.5.3 — Проверить шаг 5 (кнопка "Получить план")
- `actionLabel` для шага 5 = "Получить план"
- Стиль тот же `glassPrimary`
- Переход на Result page работает

### Шаг 2.5.4 — Проверить фоновое изображение
- На шагах 1–4: `survey-bg`
- На шаге 5: возможно `heroAiHub` (проверить в прототипе screen-3)
- Если разные фоны — нужна логика смены по шагу

### Шаг 2.5.5 — Проверить анимацию переходов
- `ax-step-slide-left` при переходе между шагами
- Не должна сломаться после смены layout

### Шаг 2.5.6 — Проверить disabled-состояние кнопки
- Когда ни одна опция не выбрана → кнопка `disabled`
- `opacity: 0.45` или аналогичное

### Шаг 2.5.7 — Проверить Telegram Haptic feedback
```bash
grep -n "haptic\|HapticFeedback" apps/miniapp-frontend/src/features/onboarding/SurveyPage.tsx
```
- При выборе опции должен быть haptic feedback
- Не должен сломаться после правок

### Шаг 2.5.8 — Исправить найденные проблемы (если есть)

### Шаг 2.5.9 — Git commit (если были правки)
```bash
git add -A
git commit -m "fix(survey): verify all 5 steps, fix edge cases (phase 2.5)"
```

### Артефакт: результат тестирования (чеклист), diff если были правки

---

## Этап 2.6 — Screen 4: Result (1 сессия)

**Текущее соответствие:** ~20% | **Критических:** 10  
**Файлы:** `features/onboarding/OnboardingResultPage.tsx`, `components/domain/ServiceCard.tsx`  
**Отчёт:** `REPORT_SCREEN_4_RESULT.md`  
**Решение Q1:** Строго по прототипу — убрать лишние секции

### Шаг 2.6.1 — Прочитать текущие файлы
```bash
cat apps/miniapp-frontend/src/features/onboarding/OnboardingResultPage.tsx
cat apps/miniapp-frontend/src/components/domain/ServiceCard.tsx
```

### Шаг 2.6.2 — Добавить showBottomNav
```tsx
<AppShell title="Результат" showBack showBottomNav>
```

### Шаг 2.6.3 — Исправить H2
```tsx
<h2 style={{
  fontSize: 26,
  fontWeight: 300,
  color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 6,
}}>
  {resultConfig.headline}
</h2>
```

### Шаг 2.6.4 — Убрать description
```tsx
// УДАЛИТЬ:
<p className="p muted">{resultConfig.description}</p>
```

### Шаг 2.6.5 — Убрать лишние секции
**Удалить следующие блоки из JSX:**
1. Card elevated "Подходящие услуги" — обёртку убрать, карточки оставить
2. Card glass "Похожий кейс" + CaseCard — **полностью удалить**
3. Card interactive "Попробовать AI-демо" — **полностью удалить**
4. Card interactive "Обсудить внедрение" + "Оставить заявку" — **полностью удалить**
5. Button ghost "Смотреть всё без фильтра" — **полностью удалить**

**Оставить только:**
- H2 заголовок
- 3 карточки услуг (mj-card стиль)
- Кнопка "Задайте вопрос ИИ"
- BottomNav

### Шаг 2.6.6 — Изменить количество карточек: 2 → 3
```tsx
// БЫЛО:
{recommendedServices.slice(0, 2).map(...)}

// СТАЛО:
{recommendedServices.slice(0, 3).map(...)}
```

### Шаг 2.6.7 — Карточки: layout flex:1 space-evenly
```tsx
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  gap: 10,
}}>
  {recommendedServices.slice(0, 3).map(svc => (
    <ServiceCard key={svc.id} service={svc} variant="minimal" />
  ))}
</div>
```

### Шаг 2.6.8 — ServiceCard: стиль mj-card (минималистичный)
**В ServiceCard.tsx** — добавить режим `variant="minimal"` или переписать inline:

```tsx
// Минималистичная карточка: только изображение + название
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
  {/* ТОЛЬКО название, ничего больше */}
  <div style={{
    fontSize: 15,
    fontWeight: 300,
    lineHeight: 1.25,
    letterSpacing: '0.5px',
    color: '#7EE8F2',
    marginBottom: 4,
  }}>
    {service.title}
  </div>
  {/* НЕТ: category, description, badges */}
</div>
```

### Шаг 2.6.9 — Кнопка AI: glassPrimaryMuted
```tsx
<Button
  variant="glassPrimaryMuted"
  fullWidth
  onClick={() => navigate('/ai')}
  style={{ padding: '15px 0', fontSize: 14 }}
>
  Задайте вопрос искусственному интеллекту
</Button>
```

### Шаг 2.6.10 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.6.11 — Git commit
```bash
git add -A
git commit -m "fix(result): strict prototype - remove extra sections, mj-card style, glassPrimaryMuted (phase 2.6)"
```

### Артефакт: diff OnboardingResultPage.tsx + ServiceCard.tsx

---

## Этап 2.7 — Screen 5: Cases (1 сессия)

**Текущее соответствие:** ~60% | **Критических:** 4  
**Файлы:** `features/cases/CasesGalleryPage.tsx`, `components/domain/CaseCard.tsx`, `components/ui/Chip.tsx`  
**Отчёт:** `REPORT_SCREEN_5_CASES.md`

### Шаг 2.7.1 — Прочитать текущие файлы
```bash
cat apps/miniapp-frontend/src/features/cases/CasesGalleryPage.tsx
cat apps/miniapp-frontend/src/components/domain/CaseCard.tsx
cat apps/miniapp-frontend/src/components/ui/Chip.tsx
```

### Шаг 2.7.2 — Добавить H2 "Кейсы" в тело страницы
**После AppShell, перед chip-row:**
```tsx
<h2 style={{
  fontSize: 26,
  fontWeight: 300,
  color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 16,
  marginTop: 0,
}}>
  Кейсы
</h2>
```

### Шаг 2.7.3 — CaseCard: убрать лишние элементы
**В CaseCard.tsx убрать:**
1. Industry label (`11px, rgba(240,246,252,0.45)`)
2. metrics.headline (цветной cyan `14px, #22D3EE, fontWeight 600`)
3. Tag chips (3 штуки внизу)

**Оставить только title.**

### Шаг 2.7.4 — CaseCard: стиль title
```tsx
<div style={{
  fontSize: 16,
  fontWeight: 300,       // было 700
  lineHeight: 1.25,
  letterSpacing: '0.5px',
  color: '#7EE8F2',      // было #fff
}}>
  {caseStudy.title}
</div>
```

### Шаг 2.7.5 — CaseCard: styling контейнера
```tsx
// Внешний контейнер карточки
style={{
  borderRadius: 18,      // было 16
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.06)',
  height: 200,           // было 180
}}
```

### Шаг 2.7.6 — Chip.tsx: уменьшить размеры
```tsx
// Общие стили chip
style={{
  fontSize: 11,          // было 12
  padding: '4px 10px',   // было 6px 12px
  borderRadius: 8,
  minHeight: 'auto',     // убрать 36px
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
}}
```

### Шаг 2.7.7 — Chip.tsx: цвета inactive
```tsx
// Active:
background: 'rgba(34,211,238,0.12)',
color: '#22D3EE',
border: '1px solid rgba(34,211,238,0.2)',

// Inactive:
background: 'transparent',              // было rgba(255,255,255,0.04)
color: 'rgba(126,232,242,0.5)',         // teal, было rgba(240,246,252,0.65) gray
border: '1px solid rgba(126,232,242,0.15)', // teal, было rgba(255,255,255,0.06) gray
```

### Шаг 2.7.8 — Chip row: margin
```tsx
// Контейнер chips
style={{ gap: 8, overflowX: 'auto', marginBottom: 20 }}
```

### Шаг 2.7.9 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.7.10 — Git commit
```bash
git add -A
git commit -m "fix(cases): add H2, minimal CaseCard, compact teal Chips (phase 2.7)"
```

### Артефакт: diff CasesGalleryPage.tsx + CaseCard.tsx + Chip.tsx

---

## Этап 2.8 — Screen 7: Service Detail (1 сессия)

**Текущее соответствие:** ~65% | **Критических:** 2  
**Файлы:** `features/services/ServiceDetailPage.tsx`  
**Отчёт:** `REPORT_SCREEN_7_SERVICE.md`  
**Решение Q1:** Строго по прототипу — убрать лишние секции

### Шаг 2.8.1 — Прочитать текущий файл
```bash
cat apps/miniapp-frontend/src/features/services/ServiceDetailPage.tsx
```

### Шаг 2.8.2 — Переделать layout: fullscreen bg
**Заменить** AppShell+cards на fullscreen layout:

```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
  {/* Fullscreen background image */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id={service.imageId} height="100%" borderRadius={0} scrim={false} />
  </div>

  {/* Content overlay — прижат к низу */}
  <div style={{
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',    // контент снизу!
    padding: '64px 20px 80px',
    overflowY: 'auto',
  }}>
    {/* H1 + subtitle + chips + description + buttons */}
  </div>
  
  {/* BottomNav */}
</div>
```

### Шаг 2.8.3 — Убрать TopBar "← Услуга"

### Шаг 2.8.4 — Исправить стили элементов
```tsx
// H1: 22px (было 24), остальное OK
<h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: '#f0f6fc', marginBottom: 6 }}>

// Subtitle: 13px (было 14)
<p style={{ fontSize: 13, color: 'rgba(240,246,252,0.5)', marginBottom: 12 }}>

// Description: 14px (было 15)
<p style={{ fontSize: 14, color: 'rgba(240,246,252,0.65)', lineHeight: 1.6 }}>
```

### Шаг 2.8.5 — Chips: прототипные стили
```tsx
style={{
  fontSize: 12,
  padding: '5px 12px',
  borderRadius: 8,
  color: '#F0F6FC',
  background: 'rgba(255,255,255,0.1)',  // было 0.04
  backdropFilter: 'blur(4px)',
}}
```

### Шаг 2.8.6 — Убрать лишние секции
**Удалить:**
1. Card glass "Что вы получите" (deliverables)
2. Card default "Предпосылки к старту" (prerequisites)
3. Card glass "Пакеты" + кнопки "Сравнить пакеты" / "Рассчитать ROI"
4. Секция "Кейсы" + CaseCard

### Шаг 2.8.7 — btn-secondary: компактнее
```tsx
<Button
  variant="secondary"
  fullWidth
  onClick={() => navigate('/services')}
  style={{
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 12,
    borderColor: 'rgba(34,211,238,0.3)',
    padding: '12px 0',
  }}
>
  Все услуги
</Button>
```

### Шаг 2.8.8 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.8.9 — Git commit
```bash
git add -A
git commit -m "fix(service): fullscreen bg, remove extra sections, compact secondary (phase 2.8)"
```

### Артефакт: diff ServiceDetailPage.tsx

---

## Этап 2.9 — Screen 6: AI Hub — архитектурная переделка (1 сессия)

**Текущее соответствие:** ~15% | **Тип:** Концептуальное расхождение  
**Файлы:** `features/ai/AiHubPage.tsx`, `features/ai/AiChatPage.tsx`, роутер  
**Отчёт:** `REPORT_SCREEN_6_AIHUB.md`  
**Решение Q2:** Один чат-интерфейс, убрать каталог

### Шаг 2.9.1 — Прочитать текущие файлы
```bash
cat apps/miniapp-frontend/src/features/ai/AiHubPage.tsx
cat apps/miniapp-frontend/src/features/ai/AiChatPage.tsx

# Найти и прочитать роутер
find apps/miniapp-frontend/src -name "*router*" -o -name "*routes*" -o -name "App.tsx" | head -5
cat apps/miniapp-frontend/src/<путь к роутеру>
```

### Шаг 2.9.2 — Перенаправить /ai сразу на чат
**В роутере:**
```tsx
// БЫЛО (примерно):
{ path: '/ai', element: <AiHubPage /> },
{ path: '/ai/chat', element: <AiChatPage /> },
// или
{ path: '/ai/chat/:scenarioId', element: <AiChatPage /> },

// СТАЛО:
{ path: '/ai', element: <AiChatPage /> },
// AiHubPage больше не нужен
```

### Шаг 2.9.3 — AiChatPage: fullscreen layout
```tsx
<div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
  {/* Fullscreen background */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <MjImage id="hero-ai-hub" height="100%" borderRadius={0} scrim={false} />
  </div>

  {/* Content overlay */}
  <div style={{
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '64px 20px 80px',
  }}>
    {/* H1 */}
    {/* Chat area */}
    {/* Composer */}
  </div>

  {/* BottomNav */}
</div>
```

### Шаг 2.9.4 — Убрать лишние элементы из чата
**Удалить:**
1. AppShell "Задайте вопрос..."
2. Warning banner ("Не передавайте ПДн...")
3. Message counter (usedTurns/maxTurns)
4. Quick prompt chips
5. "Показать результат" button

### Шаг 2.9.5 — Добавить H1 в чат
```tsx
<h1 style={{
  fontSize: 26,
  fontWeight: 300,
  color: '#7EE8F2',
  letterSpacing: '0.5px',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
  marginBottom: 20,
  textAlign: 'left',
}}>
  Задайте вопрос<br/>искусственному интеллекту
</h1>
```

### Шаг 2.9.6 — Chat area: layout
```tsx
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',  // сообщения снизу
  gap: 12,
  marginBottom: 16,
  overflowY: 'auto',
}}>
  {messages.map(msg => <ChatMessageBubble key={msg.id} {...msg} />)}
</div>
```

### Шаг 2.9.7 — Сохранить бизнес-логику чата
**НЕ трогать:**
- API calls для AI
- Message state management
- Send message logic
- Typing indicator
- Scroll to bottom

### Шаг 2.9.8 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.9.9 — Git commit
```bash
git add -A
git commit -m "refactor(ai-hub): replace catalog with direct chat, fullscreen layout (phase 2.9)"
```

### Артефакт: diff роутера + AiChatPage.tsx

---

## Этап 2.10 — Screen 6: AI Hub — стили чат-элементов (1 сессия)

**Файлы:** `components/domain/ChatMessageBubble.tsx`, `components/domain/ChatComposer.tsx`, `shared/theme/global.css`  
**Зависимость:** Этап 2.9 (архитектура) завершён

### Шаг 2.10.1 — Прочитать текущие файлы
```bash
cat apps/miniapp-frontend/src/components/domain/ChatMessageBubble.tsx
cat apps/miniapp-frontend/src/components/domain/ChatComposer.tsx
grep -A 30 "bubble-bot\|bubble-user" apps/miniapp-frontend/src/shared/theme/global.css
```

### Шаг 2.10.2 — Avatar (AX)
**В ChatMessageBubble.tsx:**
```tsx
const avatarStyle: CSSProperties = {
  width: 28,                // было 32
  height: 28,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #22D3EE, #06B6D4)', // было #0891B2
  color: '#050A0F',         // ТЁМНЫЙ! было #fff
  fontSize: 10,             // было 11
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
```

### Шаг 2.10.3 — AI bubble (global.css или inline)
```css
.bubble-bot {
  background: rgba(0, 0, 0, 0.3);              /* было rgba(15,30,45,0.7) */
  backdrop-filter: blur(10px);                  /* ДОБАВИТЬ */
  -webkit-backdrop-filter: blur(10px);
  border: none;                                 /* было 1px solid */
  border-radius: 14px;
  border-top-left-radius: 4px;                  /* corner override */
  padding: 12px 16px;                           /* было 14px */
  max-width: 80%;                               /* было 85% */
  color: rgba(126, 232, 242, 0.7);             /* TEAL! было white */
  font-size: 14px;
  font-weight: 300;                             /* было 400 */
  line-height: 1.5;
}
```

### Шаг 2.10.4 — User bubble
```css
.bubble-user {
  background: rgba(34, 211, 238, 0.1);         /* было gradient */
  border: none;                                 /* было 1px solid */
  border-radius: 14px;
  border-top-right-radius: 4px;
  padding: 12px 16px;
  max-width: 80%;
  color: rgba(126, 232, 242, 0.6);             /* TEAL! было #f0f6fc */
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
  margin-left: auto;
}
```

### Шаг 2.10.5 — Chat list gap
```css
.ax-chat-list {
  gap: 12px;                                    /* было 8px */
}
```

### Шаг 2.10.6 — ChatComposer: input field
```tsx
// Input
style={{
  flex: 1,
  background: 'rgba(0, 0, 0, 0.3)',             // glass
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(126, 232, 242, 0.15)', // teal
  borderRadius: 14,                               // было 12
  padding: '14px 16px',
  color: '#F0F6FC',
  fontSize: 14,                                   // было 15
  fontWeight: 300,
}}
```

**Placeholder:**
```css
/* В global.css */
.chat-input::placeholder {
  color: rgba(126, 232, 242, 0.3);  /* teal бледный */
  font-weight: 300;
  font-size: 14px;
}
```

### Шаг 2.10.7 — ChatComposer: send button
```tsx
style={{
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'rgba(34, 211, 238, 0.15)',  // glass! было solid gradient
  border: 'none',
  boxShadow: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}}
// Icon color: rgba(34,211,238,0.5) — приглушённый
```

### Шаг 2.10.8 — Composer container: убрать bg
```tsx
// Контейнер composer
style={{
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  // УБРАНО: background, borderTop, backdropFilter, padding, position:sticky
}}
```

### Шаг 2.10.9 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 2.10.10 — Git commit
```bash
git add -A
git commit -m "fix(ai-chat): teal monochrome palette, glass bubbles/input/send, dark avatar (phase 2.10)"
```

### Артефакт: diff ChatMessageBubble.tsx + ChatComposer.tsx + global.css

---

## Сводная таблица Фазы 2

| Этап | Экран | Файлы | Тип правок | Сложность |
|------|-------|-------|------------|-----------|
| 2.1 | Splash | SplashPage, global.css | Удаление + мелкие стили | Низкая |
| 2.2 | Welcome | WelcomePage | Стили H1 + кнопки | Средняя |
| 2.3 | Survey layout | SurveyPage, imageMap | Архитектура: card→fullscreen | Высокая |
| 2.4 | Survey стили | SurveyPage | Стили элементов | Средняя |
| 2.5 | Survey тест | SurveyPage | Проверка 5 шагов | Низкая |
| 2.6 | Result | ResultPage, ServiceCard | Удаление секций + mj-card | Высокая |
| 2.7 | Cases | CasesGallery, CaseCard, Chip | Упрощение карточек + chips | Средняя |
| 2.8 | Service | ServiceDetailPage | Архитектура + удаление секций | Высокая |
| 2.9 | AI Hub архитектура | AiChatPage, роутер | Убрать каталог, fullscreen | Высокая |
| 2.10 | AI Hub стили | ChatBubble, Composer, CSS | Teal palette, glass elements | Средняя |

**Всего: 10 этапов, ~85 подшагов, ~10 сессий**

---

## Риски Фазы 2

| Риск | Этап | Митигация |
|------|------|-----------|
| Survey layout ломает бизнес-логику | 2.3 | Не трогать state/API, только JSX обёртку |
| Удаление секций Result ломает импорты | 2.6 | Проверить все import после удаления |
| AI Hub роутер ломает deep links | 2.9 | Проверить все ссылки на /ai и /ai/chat |
| CaseCard используется в нескольких местах | 2.7 | Добавить variant вместо жёсткой замены |
| ServiceCard используется в нескольких местах | 2.6 | Добавить variant="minimal" |
| Chip.tsx — глобальный компонент | 2.7 | Проверить все использования Chip после правок |
| Glass-morphism не работает на Android | 2.3,2.10 | WebkitBackdropFilter + тест на устройствах |
