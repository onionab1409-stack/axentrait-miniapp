# AXENTRAIT MiniApp — Расширенный план Фазы 0: Подготовка и аудит

**Дата:** 2026-02-26  
**Фаза:** 0 — Подготовка  
**Этап:** 0.1 — Аудит текущего кода на VPS  
**Статус:** ⬜ Не начат  

---

## Цель фазы

Полностью понять текущее состояние проекта на VPS: структура, зависимости, сборка, конфигурация, состояние git. Создать рабочую ветку и составить полную карту файлов, которые будут затронуты в ходе всех последующих фаз. Без этого этапа невозможно безопасно вносить изменения.

---

## Шаг 0.1.1 — Подключение и ориентация на VPS

**Действия через Claude Code:**
```bash
# 1. Определить расположение проекта
find / -name "axentrait-miniapp" -type d 2>/dev/null
# или
ls /home/ /var/www/ /opt/ /root/ 2>/dev/null

# 2. Перейти в директорию проекта
cd /path/to/axentrait-miniapp

# 3. Общая структура проекта (2 уровня)
tree -L 2 --dirsfirst

# 4. Структура фронтенда (3 уровня)
tree apps/miniapp-frontend/src -L 3 --dirsfirst
```

**Что фиксируем:**
- Полный путь к проекту на VPS
- Общая структура: monorepo? turborepo? nx?
- Расположение фронтенда: `apps/miniapp-frontend/src/`
- Наличие бэкенда, shared-пакетов, конфигов

---

## Шаг 0.1.2 — Состояние Git

**Действия:**
```bash
# 1. Текущая ветка и последний коммит
git branch --show-current
git log --oneline -5

# 2. Есть ли незакоммиченные изменения
git status

# 3. Список веток (локальных и удалённых)
git branch -a

# 4. Проверить remote
git remote -v

# 5. Есть ли stash
git stash list
```

**Что фиксируем:**
- Текущая ветка (main? develop? feature/?)
- Есть ли "грязные" файлы (uncommitted changes)
- Remote URL (совпадает с `https://github.com/onionab1409-stack/axentrait-miniapp`?)
- Наличие существующих feature-веток

**Решения:**
- Если есть uncommitted changes → обсудить с заказчиком: commit, stash или discard
- Создать рабочую ветку: `git checkout -b feature/prototype-alignment`

---

## Шаг 0.1.3 — Зависимости и окружение

**Действия:**
```bash
# 1. Версия Node.js
node -v

# 2. Пакетный менеджер
which npm && npm -v
which yarn && yarn -v
which pnpm && pnpm -v

# 3. Проверить package.json корневой
cat package.json | head -30

# 4. Проверить package.json фронтенда
cat apps/miniapp-frontend/package.json | head -50

# 5. Зависимости фронтенда
cat apps/miniapp-frontend/package.json | grep -A 5 '"dependencies"'
cat apps/miniapp-frontend/package.json | grep -A 5 '"devDependencies"'

# 6. Наличие lock-файла
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null

# 7. Наличие node_modules
ls -d node_modules apps/miniapp-frontend/node_modules 2>/dev/null
```

**Что фиксируем:**
- Node.js version (>=18?)
- Package manager (npm/yarn/pnpm)
- Framework: React + что ещё? (Vite? CRA? Next?)
- Ключевые зависимости: react, react-router, lucide-react, telegram-sdk
- Наличие установленных node_modules

---

## Шаг 0.1.4 — Конфигурация сборки

**Действия:**
```bash
# 1. Bundler config
ls apps/miniapp-frontend/vite.config.* apps/miniapp-frontend/webpack.config.* 2>/dev/null

# 2. TypeScript config
cat apps/miniapp-frontend/tsconfig.json | head -30

# 3. Посмотреть scripts в package.json
cat apps/miniapp-frontend/package.json | grep -A 15 '"scripts"'

# 4. Проверить index.html
cat apps/miniapp-frontend/index.html

# 5. Точка входа
cat apps/miniapp-frontend/src/main.tsx 2>/dev/null || cat apps/miniapp-frontend/src/index.tsx 2>/dev/null
```

**Что фиксируем:**
- Bundler: Vite / Webpack / другой
- TypeScript: strict mode? paths?
- Build command: `npm run build` / `vite build`
- Dev command: `npm run dev`
- Entry point: `main.tsx` / `index.tsx`
- Содержимое `index.html` (сюда будем добавлять Montserrat)

---

## Шаг 0.1.5 — Тестовая сборка

**Действия:**
```bash
# 1. Установить зависимости (если нет node_modules)
npm install  # или yarn / pnpm install

# 2. Запустить build
cd apps/miniapp-frontend
npm run build

# 3. Проверить результат
ls -la dist/ 2>/dev/null || ls -la build/ 2>/dev/null

# 4. Зафиксировать ошибки сборки (если есть)
```

**Что фиксируем:**
- Сборка проходит успешно? ✅/❌
- Если ошибки — какие именно (их нужно исправить ДО начала правок)
- Папка вывода: `dist/` или `build/`
- Размер итоговых файлов

---

## Шаг 0.1.6 — Полная карта файлов для правок

**Действия:**
```bash
# 1. Все TSX-файлы фронтенда
find apps/miniapp-frontend/src -name "*.tsx" | sort

# 2. Все CSS-файлы
find apps/miniapp-frontend/src -name "*.css" | sort

# 3. Конкретные файлы из отчётов — проверить существование
for f in \
  "features/onboarding/SplashPage.tsx" \
  "features/onboarding/WelcomePage.tsx" \
  "features/onboarding/SurveyPage.tsx" \
  "features/onboarding/OnboardingResultPage.tsx" \
  "features/cases/CasesGalleryPage.tsx" \
  "features/ai/AiHubPage.tsx" \
  "features/ai/AiChatPage.tsx" \
  "features/services/ServiceDetailPage.tsx" \
  "features/services/ServicesCatalogPage.tsx" \
  "components/ui/Button.tsx" \
  "components/ui/Chip.tsx" \
  "components/ui/MjImage.tsx" \
  "components/ui/SplineScene.tsx" \
  "components/layout/AppShell.tsx" \
  "components/layout/BottomNav.tsx" \
  "components/domain/CaseCard.tsx" \
  "components/domain/ServiceCard.tsx" \
  "components/domain/ChatMessageBubble.tsx" \
  "components/domain/ChatComposer.tsx" \
  "shared/theme/global.css" \
  "shared/theme/tokens.css"; do
  if [ -f "apps/miniapp-frontend/src/$f" ]; then
    echo "✅ $f"
  else
    echo "❌ $f — НЕ НАЙДЕН"
  fi
done

# 4. Роутер
find apps/miniapp-frontend/src -name "*router*" -o -name "*routes*" -o -name "App.tsx" | sort

# 5. Image map
find apps/miniapp-frontend/src -name "*image*" -o -name "*imageMap*" | sort
```

**Что фиксируем:**
- Какие файлы из отчётов реально существуют
- Какие файлы отсутствуют или называются иначе
- Полные пути ко всем файлам, которые будем менять
- Файл роутера (для перенаправления AI Hub)
- Файл imageMap (для добавления survey-bg)

---

## Шаг 0.1.7 — Анализ ключевых компонентов (быстрый просмотр)

**Действия — просмотреть первые 30-50 строк каждого файла:**
```bash
# Компоненты UI
head -50 apps/miniapp-frontend/src/components/ui/Button.tsx
head -50 apps/miniapp-frontend/src/components/ui/Chip.tsx
head -30 apps/miniapp-frontend/src/components/layout/BottomNav.tsx
head -30 apps/miniapp-frontend/src/components/layout/AppShell.tsx

# CSS
head -80 apps/miniapp-frontend/src/shared/theme/global.css
head -80 apps/miniapp-frontend/src/shared/theme/tokens.css
```

**Что фиксируем:**
- Как устроен Button.tsx: variants, props, стили inline vs className
- Как устроен Chip.tsx: props, варианты active/inactive
- Как устроен BottomNav.tsx: элементы, активный таб
- Как устроен AppShell.tsx: TopBar, props, layout
- Текущие CSS-переменные в tokens.css
- Текущие глобальные стили в global.css

---

## Шаг 0.1.8 — Процесс деплоя (предварительный анализ)

**Действия:**
```bash
# 1. Есть ли Docker
ls Dockerfile docker-compose.yml .dockerignore 2>/dev/null

# 2. Есть ли CI/CD
ls .github/workflows/*.yml .gitlab-ci.yml Jenkinsfile 2>/dev/null

# 3. Есть ли PM2 / nginx конфиг
ls ecosystem.config.* 2>/dev/null
ls /etc/nginx/sites-available/*axen* /etc/nginx/conf.d/*axen* 2>/dev/null

# 4. Текущий процесс (работает ли приложение)
pm2 list 2>/dev/null || systemctl list-units --type=service | grep axen 2>/dev/null

# 5. Где лежат статические файлы (если SPA)
ls /var/www/*axen* 2>/dev/null
```

**Что фиксируем:**
- Способ деплоя: Docker / PM2 / nginx static / systemd
- CI/CD pipeline (GitHub Actions?)
- Как фронтенд раздаётся: nginx static? Node SSR?
- URL приложения (app.axentrait.com)

---

## Шаг 0.1.9 — Создание рабочей ветки и бэкапа

**Действия:**
```bash
# 1. Убедиться что всё чисто
git status

# 2. Создать ветку
git checkout -b feature/prototype-alignment

# 3. Подтвердить
git branch --show-current

# 4. Пометить текущее состояние тегом (для отката)
git tag pre-prototype-alignment
```

**Что фиксируем:**
- Ветка создана: `feature/prototype-alignment`
- Тег создан: `pre-prototype-alignment`
- Точка отката определена

---

## Шаг 0.1.10 — Составление артефакта AUDIT_CURRENT_STATE.md

**Действия:** Собрать все данные из шагов 0.1.1–0.1.9 в единый документ.

**Структура артефакта:**
```markdown
# AUDIT_CURRENT_STATE.md

## 1. Окружение VPS
- Путь к проекту: ...
- Node.js: ...
- Package manager: ...
- Bundler: ...

## 2. Git
- Ветка: ...
- Последний коммит: ...
- Remote: ...
- Рабочая ветка: feature/prototype-alignment

## 3. Структура проекта
(tree output)

## 4. Карта файлов для правок
| Файл | Существует | Фаза правки |
|------|-----------|-------------|
| ... | ✅/❌ | 1.1 / 2.3 / ... |

## 5. Ключевые компоненты (структура)
- Button.tsx: variants = [primary, secondary, ghost, ...]
- Chip.tsx: ...
- BottomNav.tsx: items = [...]
- AppShell.tsx: props = [...]

## 6. CSS-переменные (текущие)
(вывод tokens.css)

## 7. Сборка
- Команда: npm run build
- Статус: ✅/❌
- Папка: dist/

## 8. Деплой (предварительно)
- Способ: ...
- URL: https://app.axentrait.com

## 9. Риски и замечания
- ...
```

---

## Ожидаемый результат фазы 0

| Результат | Описание |
|-----------|----------|
| Рабочая ветка | `feature/prototype-alignment` создана |
| Тег отката | `pre-prototype-alignment` создан |
| Сборка | Проверена, работает |
| Карта файлов | Все файлы для правок идентифицированы и подтверждены |
| Артефакт | `AUDIT_CURRENT_STATE.md` — полный отчёт |
| Готовность | К началу Фазы 1 (глобальные изменения) |

---

## Зависимости для следующих фаз

Данные из Фазы 0, критичные для дальнейшей работы:

| Данные | Нужны для |
|--------|-----------|
| Путь к `index.html` | Этап 1.1 (Montserrat) |
| Путь к `tokens.css` / `global.css` | Этап 1.2 (CSS-токены) |
| Структура `Button.tsx` (variants) | Этап 1.3 (glass/solid) |
| Файл роутера | Этап 2.9 (AI Hub архитектура) |
| Файл `imageMap` | Этап 2.3 (Survey bg) |
| Способ деплоя | Фаза 4 (Деплой) |
| Текущие CSS-переменные | Все этапы Фазы 2 |

---

## Оценка времени

| Шаг | Действие | Оценка |
|-----|----------|--------|
| 0.1.1 | Подключение и ориентация | 2 мин |
| 0.1.2 | Git | 2 мин |
| 0.1.3 | Зависимости | 3 мин |
| 0.1.4 | Конфигурация сборки | 3 мин |
| 0.1.5 | Тестовая сборка | 5 мин |
| 0.1.6 | Карта файлов | 5 мин |
| 0.1.7 | Анализ компонентов | 10 мин |
| 0.1.8 | Процесс деплоя | 3 мин |
| 0.1.9 | Создание ветки | 1 мин |
| 0.1.10 | Артефакт | 5 мин |
| **Итого** | | **~40 мин** |
