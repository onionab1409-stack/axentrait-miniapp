# Отчёт: Экран 6 — AI Hub (SCR-AI-001)

**Дата:** 2026-02-25  
**Статус:** ✅ → ✅ Полный отчёт (повторный, расширенный)  
**Файлы прототипа:** `прототип.html` → `#screen-6`  
**Файлы live-бота:** `features/ai/AiHubPage.tsx`, `features/ai/AiChatPage.tsx`, `components/domain/ChatMessageBubble.tsx`, `components/domain/ChatComposer.tsx`, `shared/theme/global.css`

---

## 1. Общая концепция — ГЛАВНОЕ РАСХОЖДЕНИЕ

### Прототип
**AI Hub = чат-интерфейс.** Fullscreen экран с фоновым изображением. Структура:
1. **H1** — "Задайте вопрос искусственному интеллекту" (26px, weight 300, cyan)
2. **Чат-область** — 3 сообщения (2 AI + 1 user), прижаты к низу (`justify-content: flex-end`)
3. **Input поле** — glass-morphism, с placeholder "Напишите сообщение..."
4. **Send-кнопка** — 44×44px, rgba(34,211,238,0.15), иконка "➤"
5. **Bottom Nav** — 4 элемента, "AI-демо" active

Чат **сразу виден** при входе. Нет каталога сценариев, нет "Свободный чат", нет предупреждений. Минимализм.

### Live-бот
**AI Hub = каталог сценариев** (AiHubPage) + **отдельная страница чата** (AiChatPage).

**AiHubPage (каталог):**
1. AppShell "AI-демо" + showBottomNav
2. Hero section (Spline 3D / MjImage fallback, 220px)
3. H1 "Задайте вопрос искусственному интеллекту" + subtitle
4. 4 карточки сценариев: Аудит процесса, Поиск AI-кейсов, Расчёт ROI, Вопросы по услугам
5. Card glass "Свободный чат" + кнопка "Открыть чат"

**AiChatPage (чат):**
1. AppShell "Задайте вопрос..." + showBack + showBottomNav
2. Warning banner ("Не передавайте ПДн...") + счётчик сообщений
3. Chat list (bubble-bot + bubble-user)
4. Quick prompt chips
5. "Показать результат" button
6. ChatComposer (textarea + send button)

### Вердикт
**КОНЦЕПТУАЛЬНОЕ РАСХОЖДЕНИЕ.** Это единственный экран, где live-бот и прототип имеют **разные UX-концепции**:
- Прототип: **1 экран** — чат сразу доступен
- Live-бот: **2 экрана** — каталог → чат

---

## 2. Поэлементное сравнение

### 2.1 Лейаут

| Параметр | Прототип | Live-бот (Hub) | Live-бот (Chat) | Статус |
|----------|----------|----------------|-----------------|--------|
| Тип | **Fullscreen + чат** | Каталог сценариев | Chat interface | ❌ Концептуальное |
| Фон | Fullscreen image (heroAiHub) | Hero section 220px | Нет фона | ❌ |
| TopBar | Нет | "AI-демо" | "Задайте вопрос..." | ❌ |
| Bottom Nav | Есть (4) | Есть (5) | Есть (5) | ⚠️ |
| Padding | `64px 20px 80px` | Shell + card | Shell + composer | ⚠️ |

---

### 2.2 Заголовок

| Параметр | Прототип | Live (Hub) | Live (Chat) | Статус |
|----------|----------|-----------|-------------|--------|
| Текст | "Задайте вопрос искусственному интеллекту" | То же | То же (в TopBar) | ✅ |
| font-size | **`26px`** | `24px` (h2 class) | TopBar ~17px | ❌ |
| font-weight | **`300`** | **`700`** | **`700`** | ❌ |
| color | **`#7EE8F2`** | `#fff` | — | ❌ |
| text-shadow | `0 0 30px rgba(34,211,238,0.2)` | `none` | — | ❌ |
| letter-spacing | `0.5px` | `normal` | — | ⚠️ |
| margin-bottom | `20px` | `gap: 8px` | — | ⚠️ |
| Subtitle | **Нет** | "Выберите сценарий и протестируйте AI на своей задаче." | — | ❌ Лишний |

---

### 2.3 Avatar (AX)

| Параметр | Прототип | Live-бот | Статус |
|----------|----------|----------|--------|
| width / height | **`28px`** | **`32px`** | ⚠️ |
| border-radius | `50%` | `50%` | ✅ |
| background | `linear-gradient(135deg, #22D3EE, #06B6D4)` | `linear-gradient(135deg, #22D3EE, #0891B2)` | ⚠️ Близко |
| font-size | `10px` | `11px` | ⚠️ |
| font-weight | `700` | `700` | ✅ |
| color | **`#050A0F`** (тёмный) | **`#fff`** (белый!) | ❌ |
| text | "AX" | "AX" | ✅ |

---

### 2.4 AI Message Bubble

| Параметр | Прототип | Live-бот (bubble-bot) | Статус |
|----------|----------|-----------------------|--------|
| background | **`rgba(0,0,0,0.3)`** | **`rgba(15,30,45,0.7)`** | ❌ |
| backdrop-filter | **`blur(10px)`** | **Нет** | ❌ |
| border-radius | **`14px` (top-left `4px`)** | **`18px 18px 18px 6px`** | ⚠️ Похоже, но другой формат |
| border | **`none`** | **`1px solid rgba(255,255,255,0.06)`** | ⚠️ Лишний border |
| padding | `12px 16px` | `14px 16px` | ⚠️ |
| max-width | `80%` | `85%` | ⚠️ |
| text: font-size | `14px` | `14px` | ✅ |
| text: font-weight | **`300`** | **`normal (400)`** | ⚠️ |
| text: color | **`rgba(126,232,242,0.7)`** (teal muted) | **`rgba(240,246,252,0.85)`** (white) | ❌ |
| text: line-height | `1.5` | `1.5` | ✅ |
| gap (avatar-bubble) | `10px` | `8px` | ⚠️ |

---

### 2.5 User Message Bubble

| Параметр | Прототип | Live-бот (bubble-user) | Статус |
|----------|----------|------------------------|--------|
| background | **`rgba(34,211,238,0.1)`** | **`linear-gradient(135deg, rgba(34,211,238,0.12), rgba(34,211,238,0.06))`** | ⚠️ Близко |
| border-radius | **`14px` (top-right `4px`)** | **`18px 18px 6px 18px`** | ⚠️ Похоже |
| border | **`none`** | **`1px solid rgba(34,211,238,0.15)`** | ⚠️ Лишний border |
| padding | `12px 16px` | `14px 16px` | ⚠️ |
| max-width | `80%` | `85%` | ⚠️ |
| text: font-size | `14px` | `14px` | ✅ |
| text: font-weight | **`300`** | **`normal (400)`** | ⚠️ |
| text: color | **`rgba(126,232,242,0.6)`** (teal muted) | **`#f0f6fc`** (white) | ❌ |
| alignment | `justify-content: flex-end` | `margin-left: auto` | ✅ Аналогично |

---

### 2.6 Chat Input

| Параметр | Прототип | Live-бот (ChatComposer) | Статус |
|----------|----------|-------------------------|--------|
| Container layout | `display:flex; gap:10px` | `display:flex; gap:8px; padding:10px 12px` | ⚠️ |
| Container bg | **Нет** (transparent) | **`rgba(12,22,32,0.9)`** + border-top | ❌ Лишний |
| Container position | Static (внизу контента) | `position: sticky; bottom: calc(64px + ...)` | ⚠️ Технически |
| **Input bg** | **`rgba(0,0,0,0.3)`** | **`rgba(255,255,255,0.04)`** | ❌ |
| **Input backdrop-filter** | **`blur(10px)`** | **`blur(8px)`** (на контейнере) | ⚠️ Близко |
| Input border | `1px solid rgba(126,232,242,0.15)` | `1px solid rgba(255,255,255,0.08)` | ⚠️ |
| Input border-radius | `14px` | `12px` | ⚠️ |
| Input padding | `14px 16px` | `12px 14px` | ⚠️ |
| **Placeholder color** | **`rgba(126,232,242,0.3)`** (teal) | Браузерный default (серый) | ❌ |
| Placeholder font-size | `14px` | `15px` | ⚠️ |
| Placeholder font-weight | `300` | `normal` | ⚠️ |
| Input type | **`<span>` (fake input)** | **`<textarea>`** | ⚠️ Функциональное |

---

### 2.7 Send Button

| Параметр | Прототип | Live-бот | Статус |
|----------|----------|----------|--------|
| Size | **`44×44px`** | `minWidth:44px; padding:12px 14px` | ⚠️ Близко |
| border-radius | **`12px`** | `12px` | ✅ |
| **background** | **`rgba(34,211,238,0.15)`** (glass) | **`linear-gradient`** (solid primary!) | ❌ |
| **icon color** | **`rgba(34,211,238,0.5)`** (приглушённый) | **`#050A0F`** (тёмный) | ❌ |
| Icon | `➤` (Unicode arrow) | `<ArrowRight>` (Lucide) + "→" text | ⚠️ |

---

### 2.8 Chat Area Layout

| Параметр | Прототип | Live-бот | Статус |
|----------|----------|----------|--------|
| Layout | `flex:1; flex-direction:column; justify-content:flex-end` | `max-height: min(55dvh, 520px); overflow:auto` | ⚠️ |
| gap | `12px` | `var(--ax-space-2)` = 8px | ⚠️ |
| margin-bottom | `16px` | `auto` (managed by flex) | ⚠️ |

---

### 2.9 Элементы, ОТСУТСТВУЮЩИЕ в прототипе

| Элемент | Live-бот | Прототип | Статус |
|---------|----------|----------|--------|
| **Каталог сценариев** (AiHubPage) | ✅ 4 scenario cards | ❌ | Полностью лишний экран |
| **"Свободный чат"** card | ✅ | ❌ | Лишний |
| **Hero section** (3D/image) | ✅ 220px | ❌ | Лишний |
| **Subtitle** | ✅ | ❌ | Лишний |
| **Warning banner** (ПДн) | ✅ | ❌ | Лишний (но полезный) |
| **Message counter** (usedTurns/maxTurns) | ✅ | ❌ | Лишний |
| **Quick prompt chips** | ✅ | ❌ | Лишний |
| **"Показать результат"** button | ✅ | ❌ | Лишний |
| **AiResultPage** | ✅ (отдельная страница) | ❌ | Лишний |

---

## 3. Сводка расхождений

### Концептуальное (🔴)
1. **AI Hub = каталог сценариев** в live vs **AI Hub = чат-интерфейс** в прототипе — это не стилевое расхождение, а **разные UX-концепции**

### Критические (❌) — Стилевые (при сравнении AiChatPage vs прототип)
2. **H1 font-weight: 700 → 300**
3. **H1 color: #fff → #7EE8F2**
4. **Avatar text color: #fff → #050A0F** (тёмный)
5. **AI bubble: no glass-morphism** — нет backdrop-filter:blur(10px), другой bg
6. **AI bubble text color: white → teal** `rgba(126,232,242,0.7)`
7. **User bubble text color: white → teal** `rgba(126,232,242,0.6)`
8. **Input bg: rgba(255,255,255,0.04) → rgba(0,0,0,0.3)** (glass)
9. **Send button: solid gradient → glass** `rgba(34,211,238,0.15)`
10. **Placeholder color: gray → teal** `rgba(126,232,242,0.3)`

### Средние (⚠️)
11. Avatar size: 32 → 28px
12. Bubble border-radius: 18px → 14px (с corner override)
13. Bubble border: есть → нет
14. Bubble max-width: 85% → 80%
15. Text font-weight: 400 → 300
16. Chat gap: 8 → 12px
17. Input container: solid bg → transparent
18. Input border-radius: 12 → 14px

### Информационные (ℹ️)
19. Warning banner и message counter — отсутствуют в прототипе, но полезны
20. Quick prompts — UX-улучшение в live
21. "Показать результат" — отдельный функционал
22. AiResultPage — отсутствует в прототипе

---

## 4. План правок

### Вопрос к заказчику
> **КРИТИЧЕСКИЙ ВОПРОС:** Убирать каталог сценариев (AiHubPage) и делать чат сразу? Или оставить каталог, но стилизовать чат по прототипу?
>
> **Варианты:**
> 1. **Строго по прототипу** — убрать каталог, при нажатии "AI-демо" сразу открывать чат (потеря функционала сценариев)
> 2. **Каталог + стилизованный чат** — оставить AiHubPage, но стилизовать AiChatPage по прототипу
> 3. **Единый экран** — каталог сценариев как chips/кнопки на чат-странице
>
> **Рекомендация: Вариант 3** — объединить: чат-интерфейс как в прототипе, но с quick prompt chips для сценариев.

### Шаг 1 (Вариант 2/3): Стилизовать AiChatPage

#### H1 (если показывается в чате)
```tsx
<h1 style={{
  fontSize: 26,
  fontWeight: 300,
  marginBottom: 20,
  letterSpacing: '0.5px',
  color: '#7EE8F2',
  textShadow: '0 0 30px rgba(34,211,238,0.2)',
}}>
  Задайте вопрос<br/>искусственному интеллекту
</h1>
```

#### Avatar
```tsx
const avatarStyle: CSSProperties = {
  width: 28,        // было 32
  height: 28,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #22D3EE, #06B6D4)',
  color: '#050A0F',  // было #fff — тёмный текст!
  fontSize: 10,      // было 11
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
```

#### Bubble CSS (global.css)
```css
.bubble-bot {
  background: rgba(0, 0, 0, 0.3);                    /* было rgba(15,30,45,0.7) */
  backdrop-filter: blur(10px);                        /* ДОБАВИТЬ */
  -webkit-backdrop-filter: blur(10px);
  border: none;                                       /* было 1px solid */
  border-radius: 14px;
  border-top-left-radius: 4px;                        /* было 18px 18px 18px 6px */
  padding: 12px 16px;                                 /* было 14px */
  max-width: 80%;                                     /* было 85% */
  color: rgba(126, 232, 242, 0.7);                   /* было rgba(240,246,252,0.85) */
  font-size: 14px;
  font-weight: 300;                                   /* ДОБАВИТЬ */
  line-height: 1.5;
}

.bubble-user {
  background: rgba(34, 211, 238, 0.1);               /* было gradient */
  border: none;                                       /* было 1px solid */
  border-radius: 14px;
  border-top-right-radius: 4px;                       /* было 18px 18px 6px 18px */
  padding: 12px 16px;
  max-width: 80%;
  color: rgba(126, 232, 242, 0.6);                   /* было #f0f6fc */
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
  margin-left: auto;
}

.ax-chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;                                          /* было var(--ax-space-2) = 8px */
}
```

#### ChatComposer — glass стиль
```tsx
// Input field
style={{
  flex: 1,
  background: 'rgba(0, 0, 0, 0.3)',           // было rgba(255,255,255,0.04)
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(126, 232, 242, 0.15)', // teal border
  borderRadius: 14,                              // было 12
  padding: '14px 16px',
  color: '#F0F6FC',
  fontSize: 14,                                  // было 15
  fontWeight: 300,
}}
// placeholder: rgba(126,232,242,0.3)

// Send button
style={{
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'rgba(34, 211, 238, 0.15)',        // glass!
  border: 'none',
  boxShadow: 'none',
  // icon color: rgba(34,211,238,0.5)
}}
```

#### Composer container — убрать bg
```tsx
style={{
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  // УБРАТЬ: background, borderTop, backdropFilter, padding, position:sticky
}}
```

### Шаг 2: Fullscreen background
```tsx
// Добавить fullscreen bg на чат-экран
<div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
  <MjImage id="hero-ai-hub" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</div>
```

---

## 5. CSS-токены экрана (из прототипа)

```css
/* AI Hub / Chat Tokens */
--aihub-bg: fullscreen image (heroAiHub);
--aihub-padding: 64px 20px 80px;

--aihub-h1-size: 26px;
--aihub-h1-weight: 300;
--aihub-h1-color: #7EE8F2;
--aihub-h1-spacing: 0.5px;
--aihub-h1-shadow: 0 0 30px rgba(34,211,238,0.2);
--aihub-h1-margin-bottom: 20px;

/* Avatar */
--avatar-size: 28px;
--avatar-bg: linear-gradient(135deg, #22D3EE, #06B6D4);
--avatar-color: #050A0F;
--avatar-font-size: 10px;
--avatar-weight: 700;

/* AI bubble */
--ai-bubble-bg: rgba(0,0,0,0.3);
--ai-bubble-blur: blur(10px);
--ai-bubble-radius: 14px;
--ai-bubble-radius-corner: 4px; /* top-left */
--ai-bubble-padding: 12px 16px;
--ai-bubble-max-width: 80%;
--ai-bubble-border: none;
--ai-text-size: 14px;
--ai-text-weight: 300;
--ai-text-color: rgba(126,232,242,0.7);
--ai-text-line-height: 1.5;

/* User bubble */
--user-bubble-bg: rgba(34,211,238,0.1);
--user-bubble-radius: 14px;
--user-bubble-radius-corner: 4px; /* top-right */
--user-bubble-padding: 12px 16px;
--user-bubble-max-width: 80%;
--user-bubble-border: none;
--user-text-size: 14px;
--user-text-weight: 300;
--user-text-color: rgba(126,232,242,0.6);

/* Chat area */
--chat-gap: 12px;
--chat-margin-bottom: 16px;
--chat-align: flex-end; /* messages from bottom */

/* Input */
--input-bg: rgba(0,0,0,0.3);
--input-blur: blur(10px);
--input-border: 1px solid rgba(126,232,242,0.15);
--input-radius: 14px;
--input-padding: 14px 16px;
--input-placeholder-color: rgba(126,232,242,0.3);
--input-placeholder-size: 14px;
--input-placeholder-weight: 300;

/* Send button */
--send-size: 44px;
--send-radius: 12px;
--send-bg: rgba(34,211,238,0.15);
--send-icon-color: rgba(34,211,238,0.5);
--send-icon-size: 18px;

/* Chat layout gap */
--composer-gap: 10px;
```

---

## 6. Палитра bubble-цветов (сводка)

```
Прототип:
  AI text:   rgba(126,232,242, 0.7)  ← teal, приглушённый
  User text: rgba(126,232,242, 0.6)  ← teal, ещё приглушённее
  AI bg:     rgba(0,0,0, 0.3)        ← чёрный, стекло
  User bg:   rgba(34,211,238, 0.1)   ← cyan, лёгкий
  Placeholder: rgba(126,232,242, 0.3) ← teal, очень бледный

Live:
  AI text:   rgba(240,246,252, 0.85) ← белый
  User text: #f0f6fc                  ← белый
  AI bg:     rgba(15,30,45, 0.7)     ← тёмно-синий, плотный
  User bg:   gradient                 ← cyan gradient
  Placeholder: browser default        ← серый
```

**Ключевой вывод:** Прототип строит **монохромную teal палитру** в чате — все тексты от rgba(126,232,242, 0.3) до 0.7. Live-бот — стандартный белый текст на тёмном фоне. Это **сознательное дизайнерское решение** прототипа, придающее чату "неземной", AI-подобный вид.
