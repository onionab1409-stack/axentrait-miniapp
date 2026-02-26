# AXENTRAIT MiniApp — Расширенный план Фазы 3: Общая шлифовка и QA

**Дата:** 2026-02-26  
**Фаза:** 3 — Общая шлифовка  
**Этапы:** 3.1, 3.2, 3.3  
**Статус:** ⬜ Не начат  
**Зависимость:** Фазы 0, 1, 2 должны быть завершены  

---

## Цель фазы

Завершить все оставшиеся правки, которые не привязаны к конкретному экрану (BottomNav, ServicesCatalog), и провести полную финальную проверку всего приложения. После этой фазы приложение готово к деплою.

---

## Этап 3.1 — Bottom Navigation (1 сессия)

**Цель:** Привести BottomNav к прототипу на всех экранах.  
**Файлы:** `components/layout/BottomNav.tsx`, все страницы с `showBottomNav`  
**Решение Q3:** 4 элемента, убрать "Профиль"

### Шаг 3.1.1 — Прочитать текущий BottomNav.tsx
```bash
cat apps/miniapp-frontend/src/components/layout/BottomNav.tsx
```

**Что зафиксировать:**
- Как определены элементы навигации (массив? config? hardcoded?)
- Как определяется active tab (по route? по prop?)
- Иконки: Lucide? Unicode? SVG?
- Стили: inline? className? CSS module?

### Шаг 3.1.2 — Убрать 5-й элемент "Профиль"

**Прототип имеет 4 элемента:**
| # | Label | Иконка (прототип) | Route |
|---|-------|-------------------|-------|
| 1 | Услуги | ◇ (Diamond) | `/services` |
| 2 | Кейсы | ⊞ (Grid) | `/cases` |
| 3 | AI-демо | ◈ (DiamondFilled) | `/ai` |
| 4 | Заявка | ▷ (Play) | `/lead` или `/request` |

**Найти и удалить** 5-й элемент:
```tsx
// УДАЛИТЬ:
{ label: 'Профиль', icon: <User />, route: '/profile' },
// или аналогичный элемент
```

**Проверить:** Нет ли ссылок на `/profile` в других местах, которые сломаются.
```bash
grep -rn "profile\|/profile\|Профиль" apps/miniapp-frontend/src/ --include="*.tsx" --include="*.ts" | grep -v node_modules
```

### Шаг 3.1.3 — Стили BottomNav

**Изменения стилей:**

| Свойство | Было (live) | Стало (прототип) |
|----------|-------------|------------------|
| Label font-size | `11px` | `10px` |
| Inactive color | `rgba(240,246,252,0.38)` | `rgba(240,246,252,0.35)` |
| Active color | `#22D3EE` | `#22D3EE` ✅ без изменений |
| Height | `64px` | `64px` ✅ без изменений |
| Background | `linear-gradient(...)` | `rgba(5,10,15,0.7)` |
| Backdrop-filter | `blur(20px)` | `blur(20px)` ✅ без изменений |
| Border-top | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` ✅ без изменений |

```tsx
// Label
style={{ fontSize: 10, color: isActive ? '#22D3EE' : 'rgba(240,246,252,0.35)' }}

// Container
style={{
  height: 64,
  background: 'rgba(5,10,15,0.7)',   // было linear-gradient
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255,255,255,0.06)',
}}
```

### Шаг 3.1.4 — Active dot и glow (оставить)

В live-боте есть дополнительные элементы:
- Active dot (4px cyan точка под иконкой)
- Active glow (`drop-shadow(0 0 8px rgba(34,211,238,0.4))`)

**Решение:** Оставить как есть — это улучшение, не противоречит прототипу (в прототипе просто нет, но и не запрещено).

### Шаг 3.1.5 — Проверить showBottomNav на каждом экране

**Карта показа BottomNav:**

| Экран | showBottomNav | Текущее | Нужное | Действие |
|-------|---------------|---------|--------|----------|
| Splash | ❌ | ❌ | ❌ | — |
| Welcome | ❌ | ❌ | ❌ | — |
| Survey (все шаги) | ❌ | ❌ | ❌ | — |
| Result | ✅ | ❌ (нет!) | ✅ | Добавить (сделано в 2.6) |
| Cases | ✅ | ✅ | ✅ | — |
| AI Hub (чат) | ✅ | ✅ | ✅ | Проверить после 2.9 |
| Service Detail | ✅ | ✅ | ✅ | — |
| ServicesCatalog | ✅ | ✅ | ✅ | — |

**Действия:**
```bash
# Проверить все использования showBottomNav
grep -rn "showBottomNav" apps/miniapp-frontend/src/ --include="*.tsx"
```

### Шаг 3.1.6 — Проверить active state на каждом экране

| Экран | Active tab | Проверить |
|-------|-----------|-----------|
| Result | Нет (ни один) | Прототип не выделяет ни один tab |
| Cases | "Кейсы" | ✅ |
| AI Hub | "AI-демо" | ✅ |
| Service Detail | "Услуги" | ✅ |
| ServicesCatalog | "Услуги" | ✅ |

```bash
# Как определяется active tab
grep -rn "activeTab\|currentTab\|isActive\|pathname" apps/miniapp-frontend/src/components/layout/BottomNav.tsx
```

### Шаг 3.1.7 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 3.1.8 — Git commit
```bash
git add -A
git commit -m "fix(bottomnav): remove Profile tab, 4 items, adjust label size and colors (phase 3.1)"
```

### Артефакт: diff BottomNav.tsx + список showBottomNav по экранам

---

## Этап 3.2 — ServicesCatalog (экран без эталона) (1 сессия)

**Цель:** Стилизовать каталог услуг по общему стилю прототипа.  
**Файлы:** `features/services/ServicesCatalogPage.tsx`  
**Решение Q4:** Стилизуем  
**Эталон:** Нет прямого экрана в прототипе — используем общие паттерны

### Шаг 3.2.1 — Прочитать текущий файл
```bash
cat apps/miniapp-frontend/src/features/services/ServicesCatalogPage.tsx
```

**Что зафиксировать:**
- Текущая структура: AppShell? Card обёртки? Search bar?
- Карточки услуг: как рендерятся? ServiceCard? MjImage?
- Заголовок: есть ли H2?
- Фильтры/поиск: есть ли?

### Шаг 3.2.2 — Определить целевой стиль

Поскольку экрана нет в прототипе, ориентируемся на **ближайший аналог — Screen 5 (Cases)**:

| Элемент | Стиль (по аналогии с Cases) |
|---------|---------------------------|
| Фон | `#050A0F` (solid dark) |
| H2 | `26px, weight 300, #7EE8F2, text-shadow` |
| Карточки | mj-card: изображение на фон, только название (weight 300, #7EE8F2) |
| Карточки height | `200px` |
| Карточки border-radius | `18px` |
| Карточки border | `1px solid rgba(255,255,255,0.06)` |
| Карточки содержимое | Только title — убрать category, shortPitch, badges |
| BottomNav | 4 элемента, "Услуги" active |

### Шаг 3.2.3 — Добавить / исправить H2
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
  Услуги
</h2>
```

### Шаг 3.2.4 — Карточки услуг: стиль mj-card

**Для каждой карточки услуги:**
```tsx
<button
  onClick={() => navigate(`/services/${service.id}`)}
  style={{
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 16,
    border: '1px solid rgba(255,255,255,0.06)',
    height: 200,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    cursor: 'pointer',
    textAlign: 'left',
    // Убрать: background-color карточки
  }}
>
  {/* ТОЛЬКО название */}
  <span style={{
    fontSize: 16,
    fontWeight: 300,
    lineHeight: 1.25,
    letterSpacing: '0.5px',
    color: '#7EE8F2',
    position: 'relative',
    zIndex: 1,
  }}>
    {service.title}
  </span>

  {/* НЕТ: category label */}
  {/* НЕТ: shortPitch / description */}
  {/* НЕТ: timeline/price badges */}
</button>
```

### Шаг 3.2.5 — Scrim/overlay на карточках

Для читаемости текста поверх изображения может понадобиться градиент-scrim:
```tsx
// Внутри карточки, перед текстом:
<div style={{
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, transparent 40%, rgba(5,10,15,0.8) 100%)',
  borderRadius: 18,
}} />
```

**Решение:** Добавить scrim если текст не читается. Если MjImage уже имеет scrim — проверить и адаптировать.

### Шаг 3.2.6 — Search bar (если есть)

Проверить есть ли search/filter на каталоге:
```bash
grep -n "search\|Search\|filter\|Filter" apps/miniapp-frontend/src/features/services/ServicesCatalogPage.tsx
```

**Если есть:** Стилизовать в glass-стиле:
```tsx
style={{
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(126,232,242,0.15)',
  borderRadius: 14,
  padding: '12px 16px',
  color: '#F0F6FC',
  fontSize: 14,
  fontWeight: 300,
}}
// Placeholder: color rgba(126,232,242,0.3)
```

**Если нет:** Пропустить этот шаг.

### Шаг 3.2.7 — Убрать Card обёртки (если есть)

Если карточки обёрнуты в `<Card variant="...">`, убрать обёртки — контент прямо на фоне.

### Шаг 3.2.8 — Gap и spacing
```tsx
// Контейнер карточек
style={{
  display: 'flex',
  flexDirection: 'column',
  gap: 14,  // аналог margin-bottom: 14px из Cases прототипа
}}
```

### Шаг 3.2.9 — Проверить количество карточек

Из SESSION_CONTEXT: 7 карточек услуг в live.  
Прототип Cases: 5 кейсов.

**Решение:** Оставить все 7 карточек — это каталог, полнота данных важна.

### Шаг 3.2.10 — Сборка и проверка
```bash
cd apps/miniapp-frontend && npm run build
```

### Шаг 3.2.11 — Git commit
```bash
git add -A
git commit -m "fix(services-catalog): prototype style - mj-card, weight 300, cyan titles (phase 3.2)"
```

### Артефакт: diff ServicesCatalogPage.tsx

---

## Этап 3.3 — Финальная проверка и QA (1 сессия)

**Цель:** Полный проход по всем экранам, сравнение с прототипом, составление итогового QA-отчёта.

### Шаг 3.3.1 — Собрать финальный build
```bash
cd apps/miniapp-frontend && npm run build
echo "Build status: $?"
ls -la dist/
```

### Шаг 3.3.2 — Проверить git log
```bash
git log --oneline feature/prototype-alignment
```

**Ожидаемые коммиты (примерно):**
```
abc1234 fix(services-catalog): prototype style (phase 3.2)
def5678 fix(bottomnav): remove Profile tab (phase 3.1)
ghi9012 fix(ai-chat): teal monochrome palette (phase 2.10)
jkl3456 refactor(ai-hub): replace catalog with direct chat (phase 2.9)
mno7890 fix(service): fullscreen bg, remove extra sections (phase 2.8)
pqr1234 fix(cases): add H2, minimal CaseCard (phase 2.7)
stu5678 fix(result): strict prototype (phase 2.6)
vwx9012 fix(survey): verify all 5 steps (phase 2.5)
yza3456 fix(survey): prototype heading, glass options (phase 2.4)
bcd7890 refactor(survey): fullscreen layout (phase 2.3)
efg1234 fix(welcome): h1 weight 300 cyan (phase 2.2)
hij5678 fix(splash): remove skip button (phase 2.1)
klm9012 feat: add glassPrimary button variants (phase 1.3)
nop3456 feat: add prototype CSS tokens (phase 1.2)
qrs7890 feat: add Montserrat font (phase 1.1)
```

### Шаг 3.3.3 — Чеклист экранов: глобальные проверки

**На КАЖДОМ экране проверить:**

| Проверка | Описание |
|----------|----------|
| Шрифт | Montserrat отображается (не системный) |
| Weight | Заголовки weight 300 (кроме Service = 700) |
| Color | Заголовки #7EE8F2 (кроме Service = white) |
| Text-shadow | Есть на заголовках (кроме Service) |
| Letter-spacing | 0.5px на заголовках |

### Шаг 3.3.4 — Чеклист: Screen 0 (Splash)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Кнопка "Пропустить" | Отсутствует | |
| 2 | Текст "Загрузка..." | Отсутствует | |
| 3 | Логотип "AX" font-size | 34px | |
| 4 | Подпись letter-spacing | 3px | |
| 5 | Подпись font-family | SF Mono, monospace | |
| 6 | Подпись font-size | 12px | |
| 7 | Подпись color | rgba(240,246,252,0.35) | |
| 8 | Layout | Только центр (лого + подпись) | |
| 9 | Автопереход | На /welcome через ~2сек | |

### Шаг 3.3.5 — Чеклист: Screen 1 (Welcome)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | H1 fontWeight | 300 | |
| 2 | H1 color | #7EE8F2 | |
| 3 | H1 text-shadow | 0 0 30px rgba(34,211,238,0.2) | |
| 4 | H1 lineHeight | 1.15 | |
| 5 | H1 letterSpacing | 0.5px | |
| 6 | Primary btn background | rgba(34,211,238,0.15) glass | |
| 7 | Primary btn color | #22D3EE | |
| 8 | Primary btn boxShadow | none | |
| 9 | Secondary btn width | auto (не fullWidth) | |
| 10 | Secondary btn центрирована | justify-content: center | |
| 11 | Secondary btn fontSize | 13px | |
| 12 | Secondary btn color | rgba(34,211,238,0.6) | |
| 13 | BottomNav | Отсутствует | |

### Шаг 3.3.6 — Чеклист: Screen 2 (Survey)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Layout | Fullscreen с фоном (не card-based) | |
| 2 | TopBar | Отсутствует | |
| 3 | Card обёртка | Отсутствует | |
| 4 | H2 fontWeight | 300 | |
| 5 | H2 color | #7EE8F2 | |
| 6 | Subtitle | Отсутствует | |
| 7 | Опции display | inline-flex (по контенту) | |
| 8 | Опции background | rgba(0,0,0,0.18) | |
| 9 | Опции backdropFilter | blur(10px) | |
| 10 | Опции border | none | |
| 11 | Label color | rgba(126,232,242,0.55) teal | |
| 12 | Description | Отсутствует | |
| 13 | Emoji fontSize | 22px | |
| 14 | Кнопка "Далее" | glassPrimary стиль | |
| 15 | Dots gap | 6px | |
| 16 | Counter color | rgba(126,232,242,0.4) teal | |
| 17 | Шаг 5: кнопка текст | "Получить план" | |
| 18 | Все 5 шагов работают | Переходы корректны | |
| 19 | BottomNav | Отсутствует | |

### Шаг 3.3.7 — Чеклист: Screen 4 (Result)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | H2 fontWeight | 300 | |
| 2 | H2 color | #7EE8F2 | |
| 3 | Description | Отсутствует | |
| 4 | Карточек услуг | 3 штуки | |
| 5 | Карточки стиль | mj-card (только title) | |
| 6 | Title fontWeight | 300 | |
| 7 | Title color | #7EE8F2 | |
| 8 | Нет category | Отсутствует | |
| 9 | Нет description | Отсутствует | |
| 10 | Нет badges | Отсутствуют | |
| 11 | Секция "Похожий кейс" | Отсутствует (удалена) | |
| 12 | Секция "AI-демо" | Отсутствует (удалена) | |
| 13 | Секция "Обсудить внедрение" | Отсутствует (удалена) | |
| 14 | Кнопка "Смотреть всё..." | Отсутствует (удалена) | |
| 15 | Кнопка AI: color | rgba(34,211,238,0.5) приглушённый | |
| 16 | Кнопка AI: background | rgba(34,211,238,0.15) glass | |
| 17 | BottomNav | Присутствует, 4 элемента | |

### Шаг 3.3.8 — Чеклист: Screen 5 (Cases)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | H2 "Кейсы" в body | Присутствует | |
| 2 | H2 fontWeight | 300 | |
| 3 | H2 color | #7EE8F2 | |
| 4 | CaseCard: industry label | Отсутствует | |
| 5 | CaseCard: metrics.headline | Отсутствует | |
| 6 | CaseCard: tag chips | Отсутствуют | |
| 7 | CaseCard: title fontWeight | 300 | |
| 8 | CaseCard: title color | #7EE8F2 | |
| 9 | Card height | 200px | |
| 10 | Card borderRadius | 18px | |
| 11 | Chip fontSize | 11px | |
| 12 | Chip inactive color | rgba(126,232,242,0.5) teal | |
| 13 | Chip backdropFilter | blur(4px) | |
| 14 | BottomNav | Присутствует, "Кейсы" active | |

### Шаг 3.3.9 — Чеклист: Screen 6 (AI Hub / Chat)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Каталог сценариев | Отсутствует (удалён) | |
| 2 | /ai → сразу чат | Работает | |
| 3 | Layout | Fullscreen с фоном | |
| 4 | H1 fontWeight | 300 | |
| 5 | H1 color | #7EE8F2 | |
| 6 | Warning banner | Отсутствует | |
| 7 | Message counter | Отсутствует | |
| 8 | Quick prompts | Отсутствуют | |
| 9 | "Показать результат" | Отсутствует | |
| 10 | Avatar size | 28px | |
| 11 | Avatar text color | #050A0F (тёмный) | |
| 12 | AI bubble bg | rgba(0,0,0,0.3) | |
| 13 | AI bubble backdropFilter | blur(10px) | |
| 14 | AI bubble border | none | |
| 15 | AI bubble text color | rgba(126,232,242,0.7) teal | |
| 16 | AI bubble fontWeight | 300 | |
| 17 | User bubble bg | rgba(34,211,238,0.1) | |
| 18 | User bubble text color | rgba(126,232,242,0.6) teal | |
| 19 | Input bg | rgba(0,0,0,0.3) glass | |
| 20 | Input border | rgba(126,232,242,0.15) teal | |
| 21 | Placeholder color | rgba(126,232,242,0.3) teal | |
| 22 | Send button bg | rgba(34,211,238,0.15) glass | |
| 23 | Send button icon color | rgba(34,211,238,0.5) | |
| 24 | Chat gap | 12px | |
| 25 | Отправка сообщения | Работает | |
| 26 | BottomNav | Присутствует, "AI-демо" active | |

### Шаг 3.3.10 — Чеклист: Screen 7 (Service Detail)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Layout | Fullscreen bg, контент снизу | |
| 2 | TopBar "← Услуга" | Отсутствует | |
| 3 | H1 fontSize | 22px | |
| 4 | H1 fontWeight | 700 (исключение!) | |
| 5 | Subtitle fontSize | 13px | |
| 6 | Subtitle color | rgba(240,246,252,0.5) | |
| 7 | Chips bg | rgba(255,255,255,0.1) | |
| 8 | Chips backdropFilter | blur(4px) | |
| 9 | Description fontSize | 14px | |
| 10 | Секция "Что вы получите" | Отсутствует (удалена) | |
| 11 | Секция "Предпосылки" | Отсутствует (удалена) | |
| 12 | Секция "Пакеты" | Отсутствует (удалена) | |
| 13 | Секция "Кейсы" | Отсутствует (удалена) | |
| 14 | btn-primary | Solid gradient (конверсия) | |
| 15 | btn-secondary fontSize | 13px | |
| 16 | btn-secondary fontWeight | 500 | |
| 17 | btn-secondary borderRadius | 12px | |
| 18 | BottomNav | Присутствует, "Услуги" active | |

### Шаг 3.3.11 — Чеклист: ServicesCatalog

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | H2 стиль | prototype-heading (weight 300, #7EE8F2) | |
| 2 | Карточки стиль | mj-card (изображение + title) | |
| 3 | Title fontWeight | 300 | |
| 4 | Title color | #7EE8F2 | |
| 5 | Нет category/pitch/badges | Отсутствуют | |
| 6 | Card borderRadius | 18px | |
| 7 | Card height | 200px | |
| 8 | BottomNav | Присутствует, "Услуги" active | |

### Шаг 3.3.12 — Чеклист: BottomNav (глобально)

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Количество элементов | 4 (без "Профиль") | |
| 2 | Label fontSize | 10px | |
| 3 | Inactive color | rgba(240,246,252,0.35) | |
| 4 | Active color | #22D3EE | |
| 5 | Не показывается на Splash | ✅ | |
| 6 | Не показывается на Welcome | ✅ | |
| 7 | Не показывается на Survey | ✅ | |
| 8 | Показывается на Result | ✅ | |
| 9 | Показывается на Cases | ✅ | |
| 10 | Показывается на AI Hub | ✅ | |
| 11 | Показывается на Service | ✅ | |
| 12 | Показывается на ServicesCatalog | ✅ | |

### Шаг 3.3.13 — Чеклист: переходы между экранами

| # | Переход | Проверка |
|---|---------|----------|
| 1 | Splash → Welcome | Автоматический (2.2 сек) |
| 2 | Welcome → Survey Q1 | Кнопка "Подобрать решение" |
| 3 | Survey Q1 → Q2 → ... → Q5 | Кнопки "Далее" |
| 4 | Survey Q5 → Result | Кнопка "Получить план" |
| 5 | Result → Service Detail | Клик по карточке услуги |
| 6 | Result → AI Chat | Кнопка "Задайте вопрос ИИ" |
| 7 | BottomNav → Cases | Таб "Кейсы" |
| 8 | BottomNav → AI Chat | Таб "AI-демо" |
| 9 | BottomNav → ServicesCatalog | Таб "Услуги" |
| 10 | BottomNav → Lead/Request | Таб "Заявка" |
| 11 | ServicesCatalog → Service Detail | Клик по карточке |
| 12 | Service Detail → ServicesCatalog | Кнопка "Все услуги" |
| 13 | Cases → Case Detail (если есть) | Клик по карточке |

### Шаг 3.3.14 — Чеклист: шрифт Montserrat

```bash
# Проверить что Montserrat реально загружается
# В браузере: DevTools → Network → Filter: font
# Или через код:
grep -rn "Montserrat" apps/miniapp-frontend/src/ --include="*.css" --include="*.html"
```

### Шаг 3.3.15 — Чеклист: TypeScript / Build errors

```bash
cd apps/miniapp-frontend
npm run build 2>&1 | tail -20
# Ноль ошибок = ✅
```

### Шаг 3.3.16 — Составить QA_FINAL_REPORT.md

**Собрать все результаты чеклистов в единый артефакт:**

```markdown
# QA_FINAL_REPORT.md

## Дата: ...
## Ветка: feature/prototype-alignment
## Build: ✅/❌

## Результаты по экранам
| Экран | Проверок | Пройдено | Провалено | % |
|-------|----------|----------|-----------|---|
| Splash | 9 | ?/9 | ?/9 | ?% |
| Welcome | 13 | ?/13 | ?/13 | ?% |
| Survey | 19 | ?/19 | ?/19 | ?% |
| Result | 17 | ?/17 | ?/17 | ?% |
| Cases | 14 | ?/14 | ?/14 | ?% |
| AI Hub | 26 | ?/26 | ?/26 | ?% |
| Service | 18 | ?/18 | ?/18 | ?% |
| ServicesCatalog | 8 | ?/8 | ?/8 | ?% |
| BottomNav | 12 | ?/12 | ?/12 | ?% |
| Переходы | 13 | ?/13 | ?/13 | ?% |

## Оставшиеся проблемы
1. ...
2. ...

## Решение
- Готово к деплою: ✅/❌
- Требуется дополнительная работа: (список)
```

### Шаг 3.3.17 — Git commit (если были мелкие фиксы)
```bash
git add -A
git commit -m "fix: final QA fixes (phase 3.3)"
```

### Артефакт: `QA_FINAL_REPORT.md`

---

## Сводная таблица Фазы 3

| Этап | Описание | Файлы | Подшагов | Сложность |
|------|----------|-------|----------|-----------|
| 3.1 | BottomNav | BottomNav.tsx | 8 | Низкая |
| 3.2 | ServicesCatalog | ServicesCatalogPage.tsx | 11 | Средняя |
| 3.3 | Финальная проверка QA | Все | 17 | Средняя |
| **Итого** | | | **36** | |

---

## Ожидаемый результат Фазы 3

| Результат | Описание |
|-----------|----------|
| BottomNav | 4 элемента, правильные стили, правильный active на каждом экране |
| ServicesCatalog | Стилизован по паттернам прототипа (mj-card, weight 300, cyan) |
| QA отчёт | Полный чеклист (149 проверок) со статусами |
| Build | Чистая сборка без ошибок |
| Git | Все коммиты на ветке `feature/prototype-alignment` |
| Готовность | К составлению плана Фазы 4 (Деплой) |

---

## Общий счёт проверок QA (этап 3.3)

| Экран | Проверок |
|-------|----------|
| Splash | 9 |
| Welcome | 13 |
| Survey | 19 |
| Result | 17 |
| Cases | 14 |
| AI Hub | 26 |
| Service | 18 |
| ServicesCatalog | 8 |
| BottomNav | 12 |
| Переходы | 13 |
| **Итого** | **149** |

---

## Риски Фазы 3

| Риск | Этап | Митигация |
|------|------|-----------|
| Chip.tsx правки (2.7) ломают ServicesCatalog | 3.2 | Проверить Chip после правок Cases |
| Удаление "Профиль" ломает ссылки | 3.1 | grep по всем файлам на /profile |
| QA выявляет регрессии | 3.3 | Исправлять сразу, мелкий commit |
| ServicesCatalog имеет уникальную структуру | 3.2 | Изучить в шаге 3.2.1, адаптировать |
