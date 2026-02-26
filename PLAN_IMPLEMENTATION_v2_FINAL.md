# AXENTRAIT MiniApp — Полный план внесения изменений v2 (ФИНАЛ)

**Дата:** 2026-02-26  
**Статус:** ✅ Согласован  

---

## Принятые решения

| # | Вопрос | Решение |
|---|--------|---------|
| Q1 | Лишние секции Result/Service | **Вариант 1: строго по прототипу** — убрать лишние секции |
| Q2 | AI Hub: каталог или чат? | **Вариант 1: один чат-интерфейс** — убрать каталог, сразу чат |
| Q3 | Bottom Nav: 4 или 5? | **4 элемента** — убрать "Профиль" |
| Q4 | ServicesCatalog | **Стилизовать** по общему стилю прототипа |

---

## Фаза 0: Подготовка (1 сессия)

### Этап 0.1 — Аудит текущего кода на VPS
**Цель:** Понять текущее состояние проекта, зависимости, структуру, создать рабочую ветку.

**Действия:**
1. Подключение к VPS через Claude Code
2. Проверка структуры проекта: `apps/miniapp-frontend/src/`
3. Проверка зависимостей (`package.json`, `node_modules`)
4. Проверка сборки (`npm run build` / `vite build`)
5. `git status`, текущая ветка, последний коммит
6. Создание рабочей ветки `feature/prototype-alignment`
7. Инвентаризация всех файлов, которые будут затронуты:
   - `index.html`
   - `shared/theme/tokens.css` или `global.css`
   - `components/ui/Button.tsx`
   - `components/layout/BottomNav.tsx`
   - `components/layout/AppShell.tsx`
   - `components/ui/Chip.tsx`
   - `components/domain/CaseCard.tsx`
   - `components/domain/ServiceCard.tsx`
   - `components/domain/ChatMessageBubble.tsx`
   - `components/domain/ChatComposer.tsx`
   - `features/onboarding/SplashPage.tsx`
   - `features/onboarding/WelcomePage.tsx`
   - `features/onboarding/SurveyPage.tsx`
   - `features/onboarding/OnboardingResultPage.tsx`
   - `features/cases/CasesGalleryPage.tsx`
   - `features/ai/AiHubPage.tsx`
   - `features/ai/AiChatPage.tsx`
   - `features/services/ServiceDetailPage.tsx`
   - `features/services/ServicesCatalogPage.tsx`
   - Роутер (для перенаправления AI Hub → чат)

**Артефакт:** `AUDIT_CURRENT_STATE.md` — полная карта файлов, зависимостей, состояния сборки

---

## Фаза 1: Глобальные изменения (3 сессии)

### Этап 1.1 — Подключение шрифта Montserrat
**Цель:** Заменить системный шрифт на Montserrat (Google Fonts).

**Файлы:**
- `index.html` — добавить `<link>` Google Fonts (Montserrat 300,400,500,600,700)
- `shared/theme/tokens.css` или `global.css` — обновить `--ax-font-sans`

**Изменения:**
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
```css
/* tokens.css */
--ax-font-sans: 'Montserrat', system-ui, -apple-system, sans-serif;
```

**Проверка:** Все экраны отображают текст шрифтом Montserrat.  
**Артефакт:** diff изменённых файлов

---

### Этап 1.2 — CSS-токены заголовков + глобальные переменные
**Цель:** Определить общие стилевые токены из прототипа как CSS-классы/переменные.

**Файлы:**
- `shared/theme/tokens.css` или `global.css`

**Изменения:**
```css
/* Prototype heading style (используется на 6 из 7 экранов) */
.prototype-heading {
  font-weight: 300;
  color: #7EE8F2;
  letter-spacing: 0.5px;
  text-shadow: 0 0 30px rgba(34,211,238,0.2);
}

/* Glass-morphism tokens */
--glass-bg: rgba(0, 0, 0, 0.3);
--glass-blur: blur(10px);
--glass-border: 1px solid rgba(126, 232, 242, 0.15);
```

**Проверка:** Классы определены, ничего визуально не поменялось (пока не применены).  
**Артефакт:** diff CSS-файла

---

### Этап 1.3 — Система кнопок: glass vs solid
**Цель:** Создать два варианта primary-кнопки в компоненте Button.

**Файлы:**
- `components/ui/Button.tsx`

**Изменения:**
- Добавить variant `glassPrimary`:
  ```tsx
  glassPrimary: {
    background: 'rgba(34,211,238,0.15)',
    color: '#22D3EE',
    border: 'none',
    boxShadow: 'none',
    fontSize: 15,
    fontWeight: 600,
  }
  ```
- Существующий `primary` (solid gradient) — оставить без изменений
- Таблица применения:
  | Экран | Кнопка | Variant |
  |-------|--------|---------|
  | Welcome | "Подобрать решение" | `glassPrimary` |
  | Survey | "Далее" / "Получить план" | `glassPrimary` |
  | Result | "Задайте вопрос ИИ" | `glassPrimary` (приглушённый) |
  | Service | "Оставить заявку" | `primary` (solid) ← уже верно |

**Проверка:** Компонент собирается, variant `glassPrimary` доступен.  
**Артефакт:** diff Button.tsx

---

## Фаза 2: Экраны — от простого к сложному (10 сессий)

### Этап 2.1 — Screen 0: Splash
**Текущее соответствие:** ~55% | **Критических:** 5  
**Цель:** Привести Splash к эталону прототипа.

**Файлы:**
- `features/onboarding/SplashPage.tsx`
- `shared/theme/global.css` (класс `.splash-logo-fallback`)

**Изменения:**
1. **Удалить** кнопку "Пропустить" (верхний правый угол)
2. **Удалить** текст "Загрузка Mini App shell..." (внизу)
3. **Исправить** font-size логотипа: `38px → 34px` в `.splash-logo-fallback::after`
4. **Добавить** на подпись "Automation · AI · Optimization":
   - `letter-spacing: 3px`
   - `font-family: 'SF Mono', Consolas, monospace`
   - `font-size: 12px`
   - `color: rgba(240,246,252,0.35)`
5. **Упростить layout** — убрать верхнюю/нижнюю секции, оставить только центр

**Проверка:** Splash = логотип + подпись по центру, ничего лишнего.  
**Артефакт:** diff + описание результата

---

### Этап 2.2 — Screen 1: Welcome
**Текущее соответствие:** ~35% | **Критических:** 7  
**Цель:** Трансформировать Welcome из "утилитарного" в "премиальный минимализм".

**Файлы:**
- `features/onboarding/WelcomePage.tsx`

**Изменения:**
1. **H1** — применить prototype-heading стиль:
   - `fontWeight: 300` (было 700)
   - `color: '#7EE8F2'` (было #fff)
   - `lineHeight: 1.15` (было 1.25)
   - `letterSpacing: '0.5px'`
   - `textShadow: '0 0 30px rgba(34,211,238,0.2)'`
2. **Primary кнопка "Подобрать решение"** — сменить на `glassPrimary`:
   - `background: rgba(34,211,238,0.15)`
   - `color: #22D3EE`
   - `boxShadow: none`
3. **Secondary кнопка "Смотреть кейсы"** — сделать компактной:
   - Убрать `fullWidth` → `auto` ширина
   - Обернуть в `div` с `justify-content: center`
   - `padding: '11px 22px'`
   - `borderRadius: 12`
   - `fontSize: 13, fontWeight: 500`
   - `color: 'rgba(34,211,238,0.6)'`
   - `borderColor: 'rgba(34,211,238,0.15)'`
   - `background: transparent`
4. **(Опционально)** Ослабить overlay на фоновом изображении

**Проверка:** H1 — тонкий cyan с glow, primary — полупрозрачная glass, secondary — компактная по центру.  
**Артефакт:** diff WelcomePage.tsx

---

### Этап 2.3 — Screen 2: Survey — архитектура layout
**Текущее соответствие:** ~25% | **Критических:** 11  
**Цель:** Перевести Survey из card-based в fullscreen immersive layout.

**Файлы:**
- `features/onboarding/SurveyPage.tsx`

**Изменения (только layout, без стилей элементов):**
1. **Убрать** AppShell обёртку (TopBar "← Подбор решения")
2. **Убрать** Card-обёртку контента
3. **Создать** fullscreen layout:
   ```tsx
   <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
     {/* Fullscreen background */}
     <MjImage id="survey-bg" ... />
     {/* Content overlay */}
     <div style={{ position: 'relative', zIndex: 1, padding: '64px 20px 20px', overflowY: 'auto' }}>
       ...
     </div>
   </div>
   ```
4. **Добавить** фоновое изображение (`survey-bg` в imageMap + fallback gradient)

**Проверка:** Survey отображается fullscreen с фоном, без TopBar и Card.  
**Артефакт:** diff SurveyPage.tsx

---

### Этап 2.4 — Screen 2: Survey — стили элементов
**Цель:** Привести все элементы Survey к стилю прототипа.

**Файлы:**
- `features/onboarding/SurveyPage.tsx`

**Изменения:**
1. **H2** — prototype-heading:
   - `fontSize: 26, fontWeight: 300, color: '#7EE8F2'`
   - `textShadow, letterSpacing: '0.5px'`
2. **Убрать** subtitle (`<p className="p muted">`)
3. **Опции** — inline-flex + glass:
   - `display: 'inline-flex'` (убрать width: 100%)
   - `background: rgba(0,0,0,0.18)`
   - `backdropFilter: blur(10px)`
   - `border: none`
   - Контейнер: `alignItems: 'flex-start', justifyContent: 'space-between', flex: 1`
4. **Label color** — `rgba(126,232,242,0.55)` (teal, было white)
5. **Убрать** descriptions из опций (не рендерить `option.description`)
6. **Emoji** — `fontSize: 22` (было 18)
7. **Кнопка "Далее"** — `glassPrimary` стиль
8. **Dots** — gap: 6px, counter color: `rgba(126,232,242,0.4)`

**Проверка:** Survey выглядит как прототип — воздушные glass-опции, teal текст, без описаний.  
**Артефакт:** diff SurveyPage.tsx

---

### Этап 2.5 — Screen 2: Survey — проверка всех шагов
**Цель:** Убедиться что стили корректно работают на всех 5 шагах опроса.

**Действия:**
1. Проверить шаги 1–5 (данные опций, тексты кнопок)
2. Survey 5/5: кнопка "Получить план" (стиль тот же glassPrimary)
3. Проверить анимацию переходов между шагами (`ax-step-slide-left`)
4. Проверить disabled-состояние кнопки
5. Фоновое изображение — одно на все шаги или разные (screen-3 использует heroAiHub)

**Проверка:** Все 5 шагов корректно отображаются и работают.  
**Артефакт:** результат тестирования

---

### Этап 2.6 — Screen 4: Result
**Текущее соответствие:** ~20% | **Критических:** 10  
**Цель:** Привести Result к минималистичному стилю прототипа. **Убрать лишние секции.**

**Файлы:**
- `features/onboarding/OnboardingResultPage.tsx`
- `components/domain/ServiceCard.tsx`

**Изменения:**
1. **Добавить** `showBottomNav` в AppShell
2. **Убрать** TopBar (или сделать прозрачный)
3. **H2** — prototype-heading (`26px, 300, #7EE8F2, text-shadow`)
4. **Убрать** description "Мы подобрали услуги..."
5. **Убрать** секцию "Похожий кейс" (Card glass + CaseCard)
6. **Убрать** секцию "Попробовать AI-демо" (Card interactive)
7. **Убрать** секцию "Обсудить внедрение" (Card interactive)
8. **Убрать** кнопку "Смотреть всё без фильтра" (Button ghost)
9. **ServiceCard** → стиль mj-card:
   - Только название услуги (убрать category, description, badges)
   - `fontSize: 15, fontWeight: 300, color: '#7EE8F2', letterSpacing: '0.5px'`
   - `borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)'`
   - Карточки flex:1 + `justifyContent: 'space-evenly'`
10. **Количество карточек** — 3 (было slice(0,2))
11. **Кнопка AI** — glassPrimary приглушённый:
    - `color: 'rgba(34,211,238,0.5)'` (сознательно приглушённый!)
    - `fontSize: 14`

**Проверка:** Result = H2 + 3 минималистичных карточки + 1 приглушённая кнопка + BottomNav.  
**Артефакт:** diff OnboardingResultPage.tsx + ServiceCard.tsx

---

### Этап 2.7 — Screen 5: Cases
**Текущее соответствие:** ~60% | **Критических:** 4  
**Цель:** Привести Cases к стилю прототипа.

**Файлы:**
- `features/cases/CasesGalleryPage.tsx`
- `components/domain/CaseCard.tsx`
- `components/ui/Chip.tsx`

**Изменения:**
1. **Добавить H2** "Кейсы" в тело страницы:
   - `fontSize: 26, fontWeight: 300, color: '#7EE8F2'`
   - `textShadow, letterSpacing, marginBottom: 16`
2. **CaseCard** — упрощение:
   - **Убрать** industry label
   - **Убрать** metrics.headline (цветной)
   - **Убрать** tag chips
   - Title: `fontWeight: 300` (было 700), `color: '#7EE8F2'` (было #fff)
   - `letterSpacing: '0.5px'`
3. **Card styling:**
   - `height: 200px` (было 180)
   - `borderRadius: 18` (было 16)
4. **Chip** — компактнее:
   - `fontSize: 11` (было 12), `padding: '4px 10px'` (было 6px 12px)
   - `minHeight: auto` (убрать 36px)
   - `backdropFilter: blur(4px)`
   - Inactive: `color: rgba(126,232,242,0.5)`, `border: rgba(126,232,242,0.15)`, `bg: transparent`
5. **Chip row** — `marginBottom: 20`

**Проверка:** Карточки минималистичны (только cyan заголовок на изображении), chips компактные.  
**Артефакт:** diff CasesGalleryPage.tsx + CaseCard.tsx + Chip.tsx

---

### Этап 2.8 — Screen 7: Service Detail
**Текущее соответствие:** ~65% | **Критических:** 2  
**Цель:** Привести Service к прототипу. **Убрать лишние секции.**

**Файлы:**
- `features/services/ServiceDetailPage.tsx`

**Изменения:**
1. **Архитектура** — fullscreen bg layout:
   - Hero section → fullscreen background-image
   - Контент прижат к низу (`justifyContent: 'flex-end'`)
2. **Убрать** TopBar "← Услуга"
3. **H1** — `fontSize: 22` (было 24), остальное уже OK (weight 700, white)
4. **Subtitle** — `fontSize: 13, color: rgba(240,246,252,0.5)`
5. **Chips** — `color: #F0F6FC, bg: rgba(255,255,255,0.1), backdropFilter: blur(4px)`
6. **Description** — `fontSize: 14, color: rgba(240,246,252,0.65)`
7. **Убрать** секцию "Что вы получите" (deliverables)
8. **Убрать** секцию "Предпосылки к старту" (prerequisites)
9. **Убрать** секцию "Пакеты" (packages + кнопки)
10. **Убрать** секцию "Кейсы" (CaseCard)
11. **btn-secondary** — компактнее:
    - `fontSize: 13, fontWeight: 500, borderRadius: 12`
    - `borderColor: rgba(34,211,238,0.3)`, `padding: '12px 0'`

**Проверка:** Service = fullscreen изображение + контент снизу (H1 + sub + chips + desc + 2 кнопки) + BottomNav.  
**Артефакт:** diff ServiceDetailPage.tsx

---

### Этап 2.9 — Screen 6: AI Hub — архитектурная переделка
**Текущее соответствие:** ~15% | **Тип:** Концептуальное расхождение  
**Цель:** Заменить каталог сценариев на единый чат-интерфейс.

**Файлы:**
- `features/ai/AiHubPage.tsx` (переделка или замена)
- `features/ai/AiChatPage.tsx` (стилизация)
- Роутер (перенаправление `/ai` → чат)

**Изменения:**
1. **Удалить** AiHubPage (каталог сценариев) или перенаправить `/ai` сразу на чат
2. **AiChatPage** — fullscreen layout:
   - Fullscreen background-image (heroAiHub)
   - Убрать AppShell "Задайте вопрос..."
   - Убрать Warning banner (ПДн)
   - Убрать Message counter (usedTurns/maxTurns)
   - Убрать Quick prompt chips
   - Убрать "Показать результат" button
3. **H1** в чате:
   - `fontSize: 26, fontWeight: 300, color: '#7EE8F2'`
   - `textShadow, letterSpacing: '0.5px'`
   - `marginBottom: 20`
4. **Chat area** — `justifyContent: 'flex-end'`, `gap: 12px`

**Проверка:** При нажатии "AI-демо" в BottomNav открывается чат с фоном и H1, без каталога.  
**Артефакт:** diff роутера + AiChatPage.tsx

---

### Этап 2.10 — Screen 6: AI Hub — стили чат-элементов
**Цель:** Привести все элементы чата к стилю прототипа (монохромная teal палитра).

**Файлы:**
- `components/domain/ChatMessageBubble.tsx`
- `components/domain/ChatComposer.tsx`
- `shared/theme/global.css`

**Изменения:**
1. **Avatar (AX):**
   - `width/height: 28px` (было 32)
   - `background: linear-gradient(135deg, #22D3EE, #06B6D4)`
   - `color: '#050A0F'` (тёмный! было #fff)
   - `fontSize: 10` (было 11)
2. **AI bubble (.bubble-bot):**
   - `background: rgba(0,0,0,0.3)` (было rgba(15,30,45,0.7))
   - `backdropFilter: blur(10px)` (ДОБАВИТЬ)
   - `border: none` (было 1px solid)
   - `borderRadius: 14px`, `borderTopLeftRadius: 4px`
   - `color: rgba(126,232,242,0.7)` (teal! было white)
   - `fontWeight: 300` (было 400)
   - `maxWidth: 80%` (было 85%)
3. **User bubble (.bubble-user):**
   - `background: rgba(34,211,238,0.1)` (было gradient)
   - `border: none`
   - `borderRadius: 14px`, `borderTopRightRadius: 4px`
   - `color: rgba(126,232,242,0.6)` (teal! было #f0f6fc)
   - `fontWeight: 300`
   - `maxWidth: 80%`
4. **ChatComposer — Input:**
   - `background: rgba(0,0,0,0.3)` (glass)
   - `backdropFilter: blur(10px)`
   - `border: 1px solid rgba(126,232,242,0.15)` (teal)
   - `borderRadius: 14` (было 12)
   - `padding: '14px 16px'`
   - `fontSize: 14, fontWeight: 300`
   - Placeholder: `color: rgba(126,232,242,0.3)` (teal бледный)
5. **ChatComposer — Send button:**
   - `width/height: 44px`, `borderRadius: 12`
   - `background: rgba(34,211,238,0.15)` (glass! было solid gradient)
   - Icon: `color: rgba(34,211,238,0.5)` (приглушённый)
6. **Composer container:**
   - Убрать background, borderTop
   - `display: flex, gap: 10px`

**Проверка:** Чат — монохромная teal палитра: приглушённые teal тексты, glass-bubbles, glass-input.  
**Артефакт:** diff ChatMessageBubble.tsx + ChatComposer.tsx + global.css

---

## Фаза 3: Общая шлифовка (3 сессии)

### Этап 3.1 — Bottom Navigation (глобально)
**Цель:** Привести BottomNav к прототипу на всех экранах.

**Файлы:**
- `components/layout/BottomNav.tsx`
- Все страницы, использующие AppShell с showBottomNav

**Изменения:**
1. **Убрать** 5-й элемент "Профиль" → оставить 4: Услуги, Кейсы, AI-демо, Заявка
2. **Label font-size:** `10px` (было 11)
3. **Inactive color:** `rgba(240,246,252,0.35)` (было 0.38)
4. **Показ BottomNav** на правильных экранах:
   - ✅ Показывать: Result, Cases, AI Hub, Service, ServicesCatalog
   - ❌ Не показывать: Splash, Welcome, Survey
5. **Active dot / glow** — допустимо оставить (улучшение)

**Проверка:** 4 элемента навигации, правильный active state на каждом экране.  
**Артефакт:** diff BottomNav.tsx

---

### Этап 3.2 — ServicesCatalog (экран без эталона)
**Цель:** Стилизовать каталог услуг по общему стилю прототипа.

**Файлы:**
- `features/services/ServicesCatalogPage.tsx`

**Изменения (стилизация по паттернам прототипа):**
1. **H2** — prototype-heading стиль (weight 300, #7EE8F2, text-shadow)
2. **Карточки услуг** — стиль mj-card:
   - Изображение на весь фон
   - Только название услуги (weight 300, #7EE8F2)
   - Убрать category, shortPitch, badges (если есть)
   - `borderRadius: 18, border: rgba(255,255,255,0.06)`
3. **Фон** — `#050A0F` (solid dark)
4. **Общий стиль** — минимализм, glass-morphism где уместно

**Проверка:** ServicesCatalog выглядит гармонично с остальными экранами прототипа.  
**Артефакт:** diff ServicesCatalogPage.tsx

---

### Этап 3.3 — Финальная проверка и QA
**Цель:** Полный проход по всем экранам, сравнение с прототипом.

**Действия:**
1. Пройти все экраны 0→7 + ServicesCatalog
2. Сверить каждый экран с соответствующим отчётом
3. Проверить переходы между экранами
4. Проверить BottomNav на каждом экране
5. Проверить glass vs solid кнопки на каждом экране
6. Проверить шрифт Montserrat на всех экранах
7. Проверить responsive (разные размеры экрана)
8. Составить список оставшихся расхождений (если есть)

**Артефакт:** `QA_FINAL_REPORT.md` — чеклист всех экранов + результат

---

## Фаза 4: Деплой (план составляется отдельно)

**Этап 4.1 — Составление плана деплоя**
- Анализ текущего процесса деплоя на VPS
- CI/CD pipeline (если есть)
- Стратегия: staging → production
- Rollback plan
- **Артефакт:** `DEPLOY_PLAN.md`

**Этап 4.2+ — Исполнение деплоя**
- По шагам из DEPLOY_PLAN.md
- Каждый шаг = отдельная сессия

---

## Сводная таблица этапов

| Этап | Описание | Файлы | Сложность |
|------|----------|-------|-----------|
| **0.1** | Аудит текущего кода на VPS | Все | Низкая |
| **1.1** | Подключение Montserrat | index.html, tokens.css | Низкая |
| **1.2** | CSS-токены заголовков | tokens.css / global.css | Низкая |
| **1.3** | Система кнопок glass/solid | Button.tsx | Средняя |
| **2.1** | Screen 0: Splash | SplashPage.tsx, global.css | Низкая |
| **2.2** | Screen 1: Welcome | WelcomePage.tsx | Средняя |
| **2.3** | Screen 2: Survey — layout | SurveyPage.tsx | Высокая |
| **2.4** | Screen 2: Survey — стили | SurveyPage.tsx | Средняя |
| **2.5** | Screen 2: Survey — все шаги | SurveyPage.tsx | Низкая |
| **2.6** | Screen 4: Result | OnboardingResultPage.tsx, ServiceCard.tsx | Высокая |
| **2.7** | Screen 5: Cases | CasesGalleryPage.tsx, CaseCard.tsx, Chip.tsx | Средняя |
| **2.8** | Screen 7: Service | ServiceDetailPage.tsx | Высокая |
| **2.9** | Screen 6: AI Hub — архитектура | AiHubPage.tsx, роутер | Высокая |
| **2.10** | Screen 6: AI Hub — стили чата | ChatMessageBubble.tsx, ChatComposer.tsx, global.css | Средняя |
| **3.1** | Bottom Navigation | BottomNav.tsx | Низкая |
| **3.2** | ServicesCatalog | ServicesCatalogPage.tsx | Средняя |
| **3.3** | Финальная проверка QA | Все | Средняя |
| **4.1** | План деплоя | — | Низкая |
| **4.2+** | Деплой | — | По плану |

**Всего: 19 этапов (17 разработка + 2 деплой)**

---

## Правила работы

1. **Один этап = одна сессия** — после каждого этапа СТОП
2. **Артефакт обязателен** после каждого этапа
3. **Все изменения через Claude Code** на VPS
4. **Никаких самовольных изменений** — только по плану
5. **Вопросы и предложения** обсуждаются до внесения
6. **Git commit** после каждого успешного этапа
7. **При переполнении контекста** (~180k токенов) — переход в новый чат с SESSION_CONTEXT
