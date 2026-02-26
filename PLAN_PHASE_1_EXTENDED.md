# AXENTRAIT MiniApp — Расширенный план Фазы 1: Глобальные изменения

**Дата:** 2026-02-26  
**Фаза:** 1 — Глобальные изменения  
**Этапы:** 1.1, 1.2, 1.3  
**Статус:** ⬜ Не начат  
**Зависимость:** Фаза 0 (аудит) должна быть завершена  

---

## Цель фазы

Внести три глобальных изменения, которые затрагивают ВСЕ экраны и являются фундаментом для поэкранных правок Фазы 2. Без этих изменений каждый экран пришлось бы править изолированно, дублируя одни и те же стили.

**Принцип:** определяем токены и компоненты, но НЕ применяем к конкретным экранам — это задача Фазы 2.

---

## Этап 1.1 — Подключение шрифта Montserrat (1 сессия)

### Предпосылки
Из отчёта Screen 0 (Splash):
> Прототип использует **Montserrat** (Google Fonts) с весами 300, 400, 500, 600, 700. Live-бот использует системные шрифты. Это глобальное расхождение, влияющее на все экраны.

### Шаг 1.1.1 — Определить способ подключения шрифта

**Два варианта:**

| Вариант | Способ | Плюсы | Минусы |
|---------|--------|-------|--------|
| A | Google Fonts `<link>` в `index.html` | Простой, CDN кеширование | Зависимость от внешнего CDN |
| B | Скачать woff2 файлы, self-host | Нет внешних зависимостей | Больше работы, увеличивает размер бандла |

**Решение:** Вариант A (Google Fonts CDN) — проще, быстрее, Telegram MiniApp всегда онлайн.

### Шаг 1.1.2 — Изменить index.html

**Файл:** `apps/miniapp-frontend/index.html` (путь уточнён в Фазе 0)

**Добавить в `<head>` ПЕРЕД закрывающим `</head>`:**
```html
<!-- Montserrat font (prototype standard) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Важно:**
- `rel="preconnect"` — для ускорения загрузки
- `display=swap` — шрифт не блокирует рендеринг, сначала показывает системный, потом подменяет
- Веса 300-700 — все пять, используемые в прототипе

### Шаг 1.1.3 — Обновить CSS-переменную шрифта

**Файл:** `shared/theme/tokens.css` (или `global.css` — определяется в Фазе 0)

**Найти:**
```css
--ax-font-sans: system-ui, -apple-system, "SF Pro Text", Inter, Roboto, Arial, sans-serif;
```

**Заменить на:**
```css
--ax-font-sans: 'Montserrat', system-ui, -apple-system, "SF Pro Text", Inter, Roboto, Arial, sans-serif;
```

**Важно:** Оставляем fallback цепочку — если Montserrat не загрузится, отобразится системный шрифт.

### Шаг 1.1.4 — Проверить применение

**Действия:**
```bash
# 1. Собрать проект
cd apps/miniapp-frontend && npm run build

# 2. Проверить что build прошёл без ошибок
echo $?

# 3. Поиск упоминаний font-family в CSS (убедиться нет переопределений)
grep -rn "font-family" apps/miniapp-frontend/src/ --include="*.css" --include="*.tsx"
```

**Что проверить:**
- Нет ли других мест, где `font-family` жёстко переопределяется (не через переменную)
- Если есть — зафиксировать, но НЕ менять сейчас (это задача конкретных экранов в Фазе 2)
- Исключение: `SF Mono` на Splash — это намеренно другой шрифт для логотипа "AX"

### Шаг 1.1.5 — Git commit

```bash
git add apps/miniapp-frontend/index.html apps/miniapp-frontend/src/shared/theme/tokens.css
git commit -m "feat: add Montserrat font (prototype alignment phase 1.1)"
```

### Артефакт этапа 1.1
Diff изменённых файлов (`index.html`, `tokens.css`), результат сборки.

---

## Этап 1.2 — CSS-токены заголовков и glass-morphism (1 сессия)

### Предпосылки
Из сводного отчёта (MASTER_SUMMARY):
> **Сквозной паттерн:** 6 из 7 экранов используют weight 300, color #7EE8F2, text-shadow для заголовков. Единственное исключение — Service (weight 700, white).

### Шаг 1.2.1 — Определить файл для токенов

**Варианты (определяется в Фазе 0):**
- `shared/theme/tokens.css` — если уже содержит CSS-переменные
- `shared/theme/global.css` — если tokens.css только для переменных, а классы в global
- Создать новый `shared/theme/prototype.css` — если хотим изолировать прототипные стили

**Решение:** Добавлять в существующий файл стилей (tokens.css или global.css).

### Шаг 1.2.2 — Добавить CSS-переменные прототипа

**Добавить в `:root` блок:**
```css
/* ============================================
   PROTOTYPE ALIGNMENT TOKENS
   Из эталонного HTML-прототипа (прототип.html)
   ============================================ */

/* --- Heading tokens (6 из 7 экранов) --- */
--proto-heading-weight: 300;
--proto-heading-color: #7EE8F2;
--proto-heading-spacing: 0.5px;
--proto-heading-shadow: 0 0 30px rgba(34, 211, 238, 0.2);

/* --- Glass-morphism tokens --- */
--proto-glass-bg: rgba(0, 0, 0, 0.3);
--proto-glass-blur: blur(10px);
--proto-glass-border: 1px solid rgba(126, 232, 242, 0.15);

/* --- Teal palette (chat, labels, muted) --- */
--proto-teal-70: rgba(126, 232, 242, 0.7);
--proto-teal-60: rgba(126, 232, 242, 0.6);
--proto-teal-55: rgba(126, 232, 242, 0.55);
--proto-teal-50: rgba(126, 232, 242, 0.5);
--proto-teal-40: rgba(126, 232, 242, 0.4);
--proto-teal-30: rgba(126, 232, 242, 0.3);
--proto-teal-15: rgba(126, 232, 242, 0.15);

/* --- Button glass tokens (навигационные CTA) --- */
--proto-btn-glass-bg: rgba(34, 211, 238, 0.15);
--proto-btn-glass-color: #22D3EE;

/* --- Button solid tokens (конверсионные CTA) --- */
--proto-btn-solid-bg: linear-gradient(135deg, #22D3EE, #06B6D4);
--proto-btn-solid-color: #050A0F;
--proto-btn-solid-shadow: 0 4px 20px rgba(34, 211, 238, 0.25);

/* --- Card tokens --- */
--proto-card-radius: 18px;
--proto-card-border: 1px solid rgba(255, 255, 255, 0.06);

/* --- Bottom Nav tokens --- */
--proto-nav-bg: rgba(5, 10, 15, 0.7);
--proto-nav-blur: blur(20px);
--proto-nav-border: 1px solid rgba(255, 255, 255, 0.06);
--proto-nav-inactive: rgba(240, 246, 252, 0.35);
--proto-nav-active: #22D3EE;
--proto-nav-label-size: 10px;
```

### Шаг 1.2.3 — Добавить утилитарный CSS-класс для заголовков

**Добавить после переменных (в global.css):**
```css
/* Prototype heading — применяется к H1/H2 на экранах 0-6 (кроме Service) */
.proto-heading {
  font-weight: var(--proto-heading-weight);
  color: var(--proto-heading-color);
  letter-spacing: var(--proto-heading-spacing);
  text-shadow: var(--proto-heading-shadow);
}
```

**Важно:** Класс определён, но ещё НИГДЕ не применяется — применение будет в Фазе 2.

### Шаг 1.2.4 — Проверить отсутствие конфликтов

**Действия:**
```bash
# 1. Поиск конфликтов с новыми переменными
grep -rn "proto-" apps/miniapp-frontend/src/ --include="*.css" --include="*.tsx"
# Должно быть пусто (новые имена)

# 2. Сборка
cd apps/miniapp-frontend && npm run build

# 3. Проверить что визуально НИЧЕГО не изменилось
# (мы только определили переменные, не применили)
```

### Шаг 1.2.5 — Git commit

```bash
git add apps/miniapp-frontend/src/shared/theme/
git commit -m "feat: add prototype alignment CSS tokens and variables (phase 1.2)"
```

### Артефакт этапа 1.2
Diff CSS-файла с полным списком новых переменных и классов.

---

## Этап 1.3 — Система кнопок: glass vs solid (1 сессия)

### Предпосылки
Из сводного отчёта:
> Прототип использует **два стиля** primary-кнопки:
> - **Glass** — навигационные CTA (Welcome, Survey, Result)
> - **Solid gradient** — конверсионные CTA (Service "Оставить заявку")
> Live-бот использует solid gradient **везде**, размывая это различие.

### Шаг 1.3.1 — Изучить текущий Button.tsx

**Действия через Claude Code:**
```bash
cat apps/miniapp-frontend/src/components/ui/Button.tsx
```

**Что нужно понять:**
- Как определены variants (object? switch? className?)
- Props: `variant`, `size`, `fullWidth`, `style`, `disabled`, `onClick`
- Как применяются стили: inline CSSProperties? className?
- Есть ли уже variant `ghost` / `secondary`?

**Ожидаемая структура (примерная):**
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #22D3EE, #06B6D4, #0891B2)',
    color: '#050A0F',
    // ...
  },
  secondary: { ... },
  ghost: { ... },
};
```

### Шаг 1.3.2 — Добавить variant `glassPrimary`

**Новый variant в объект стилей:**
```tsx
glassPrimary: {
  background: 'rgba(34, 211, 238, 0.15)',
  color: '#22D3EE',
  border: 'none',
  boxShadow: 'none',
  // Остальные стили (padding, borderRadius, fontSize, fontWeight)
  // наследуются от общего primary или size
},
```

**Обновить тип:**
```tsx
type ButtonVariant = 'primary' | 'glassPrimary' | 'secondary' | 'ghost';
```

### Шаг 1.3.3 — Добавить variant `glassPrimaryMuted` (для Result)

На экране Result кнопка AI имеет **намеренно приглушённый** текст:
```tsx
glassPrimaryMuted: {
  background: 'rgba(34, 211, 238, 0.15)',
  color: 'rgba(34, 211, 238, 0.5)',  // приглушённый!
  border: 'none',
  boxShadow: 'none',
},
```

**Таблица применения (справочно, применение в Фазе 2):**

| Экран | Кнопка | Текущий variant | Нужный variant |
|-------|--------|-----------------|----------------|
| Welcome | "Подобрать решение" | `primary` | → `glassPrimary` |
| Survey (1-4) | "Далее" | `primary` | → `glassPrimary` |
| Survey (5) | "Получить план" | `primary` | → `glassPrimary` |
| Result | "Задайте вопрос ИИ" | `secondary` | → `glassPrimaryMuted` |
| **Service** | **"Оставить заявку"** | **`primary`** | **→ `primary`** (без изменений!) |

### Шаг 1.3.4 — Проверить совместимость с size и fullWidth

**Убедиться что:**
- `glassPrimary` + `size="lg"` + `fullWidth` корректно работает
- `glassPrimary` + `disabled` корректно выглядит (opacity)
- Стили variant не конфликтуют со стилями size
- Inline `style` prop переопределяет variant (для мелких подстроек)

**Тест (мысленный):**
```tsx
// Должно работать:
<Button variant="glassPrimary" size="lg" fullWidth disabled={!canContinue}>
  Далее
</Button>

// С inline override:
<Button variant="glassPrimaryMuted" fullWidth style={{ fontSize: 14 }}>
  Задайте вопрос ИИ
</Button>
```

### Шаг 1.3.5 — Не трогать существующий `primary`

**Критически важно:** Variant `primary` (solid gradient) остаётся БЕЗ ИЗМЕНЕНИЙ.

Текущий `primary`:
```tsx
primary: {
  background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 50%, #0891B2 100%)',
  color: '#050A0F',
  boxShadow: '0 4px 16px rgba(34,211,238,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
  // ...
}
```

Он используется на Service ("Оставить заявку") и там **совпадает с прототипом** ✅.

### Шаг 1.3.6 — Рассмотреть обновление secondary

Проверить текущий `secondary` variant:
```bash
grep -A 10 "secondary" apps/miniapp-frontend/src/components/ui/Button.tsx
```

В прототипе secondary-кнопка на разных экранах имеет **разные** стили:
- Welcome: компактная, auto-width, `fontSize: 13`, `fontWeight: 500`, `color: rgba(34,211,238,0.6)`
- Service: `fontSize: 13`, `fontWeight: 500`, `border: rgba(34,211,238,0.3)`

**Решение:** НЕ менять базовый `secondary` сейчас. Различия будут решаться через inline `style` на конкретных экранах в Фазе 2. Это проще и безопаснее, чем плодить множество вариантов.

### Шаг 1.3.7 — Сборка и проверка

**Действия:**
```bash
# 1. Сборка (TypeScript должен принять новый тип)
cd apps/miniapp-frontend && npm run build

# 2. Поиск использований Button (убедиться что ничего не сломано)
grep -rn 'variant="primary"' apps/miniapp-frontend/src/ --include="*.tsx"
grep -rn 'variant="secondary"' apps/miniapp-frontend/src/ --include="*.tsx"
grep -rn 'variant="ghost"' apps/miniapp-frontend/src/ --include="*.tsx"

# 3. Убедиться что glassPrimary/glassPrimaryMuted пока НИГДЕ не используются
grep -rn 'glassPrimary' apps/miniapp-frontend/src/ --include="*.tsx"
# Должно быть только в Button.tsx (определение)
```

### Шаг 1.3.8 — Git commit

```bash
git add apps/miniapp-frontend/src/components/ui/Button.tsx
git commit -m "feat: add glassPrimary and glassPrimaryMuted button variants (phase 1.3)"
```

### Артефакт этапа 1.3
Diff Button.tsx с новыми variants.

---

## Сводная таблица Фазы 1

| Этап | Файлы | Изменения | Визуальный эффект |
|------|-------|-----------|-------------------|
| 1.1 | `index.html`, `tokens.css` | Montserrat подключен | Весь текст меняет шрифт |
| 1.2 | `tokens.css`, `global.css` | CSS-переменные определены | Никакого (только определения) |
| 1.3 | `Button.tsx` | Новые variants добавлены | Никакого (пока не применены) |

**После Фазы 1:**
- ✅ Шрифт Montserrat работает на всех экранах
- ✅ CSS-переменные прототипа доступны через `var(--proto-...)`
- ✅ Класс `.proto-heading` готов к применению
- ✅ Button variants `glassPrimary` и `glassPrimaryMuted` готовы
- ✅ Ни один экран не сломан (кроме смены шрифта)
- ✅ 3 коммита на ветке `feature/prototype-alignment`

---

## Риски и митигации

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Montserrat не загружается (CDN block) | Низкая | Fallback на system-ui в переменной |
| Montserrat меняет размер текста / layout shifts | Средняя | `display=swap`, проверить на каждом экране |
| Button.tsx имеет нестандартную структуру | Средняя | Изучить в Фазе 0, адаптировать подход |
| Конфликт CSS-переменных | Низкая | Префикс `--proto-` уникален |
| TypeScript ошибки при добавлении variant | Низкая | Обновить тип `ButtonVariant` |

---

## Зависимости от Фазы 0

| Данные из Фазы 0 | Нужны для |
|-------------------|-----------|
| Точный путь к `index.html` | Шаг 1.1.2 |
| Точный путь и содержимое `tokens.css` / `global.css` | Шаг 1.2.2 |
| Структура `Button.tsx` (variants, props, типы) | Шаг 1.3.1–1.3.5 |
| Команда сборки | Все шаги проверки |

---

## Оценка времени

| Этап | Шаги | Оценка |
|------|------|--------|
| 1.1 — Montserrat | 5 шагов | ~15 мин |
| 1.2 — CSS-токены | 5 шагов | ~20 мин |
| 1.3 — Button variants | 8 шагов | ~30 мин |
| **Итого Фаза 1** | **18 шагов** | **~65 мин (3 сессии)** |
