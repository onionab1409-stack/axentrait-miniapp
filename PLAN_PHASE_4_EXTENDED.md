# AXENTRAIT MiniApp — Расширенный план Фазы 4: Деплой

**Дата:** 2026-02-26  
**Фаза:** 4 — Деплой на VPS  
**Этапы:** 4.1, 4.2, 4.3, 4.4  
**Статус:** ⬜ Не начат  
**Зависимость:** Фазы 0, 1, 2, 3 должны быть завершены, QA пройден  

---

## Цель фазы

Безопасно задеплоить изменения с ветки `feature/prototype-alignment` на production VPS. Обеспечить возможность быстрого отката при обнаружении проблем.

**Принцип:** Максимальная осторожность. Каждый шаг — с проверкой. Бэкап перед каждым критическим действием.

---

## Этап 4.1 — Анализ текущего процесса деплоя (1 сессия)

**Цель:** Полностью понять как приложение деплоится и раздаётся на VPS. Без этого деплоить опасно.

### Шаг 4.1.1 — Определить способ деплоя

**Действия через Claude Code:**
```bash
# 1. Docker?
ls /path/to/axentrait-miniapp/Dockerfile 2>/dev/null
ls /path/to/axentrait-miniapp/docker-compose.yml 2>/dev/null
docker ps 2>/dev/null | grep -i axen

# 2. PM2?
pm2 list 2>/dev/null
pm2 describe axentrait 2>/dev/null

# 3. Systemd?
systemctl list-units --type=service | grep -i axen 2>/dev/null
systemctl status axentrait* 2>/dev/null

# 4. Nginx (static SPA)?
ls /etc/nginx/sites-enabled/ 2>/dev/null
ls /etc/nginx/conf.d/ 2>/dev/null
grep -rl "axen\|miniapp\|app.axentrait" /etc/nginx/ 2>/dev/null

# 5. Apache?
ls /etc/apache2/sites-enabled/ 2>/dev/null
ls /etc/httpd/conf.d/ 2>/dev/null

# 6. Caddy?
ls /etc/caddy/ 2>/dev/null
```

**Что фиксируем:**
- Тип деплоя: Docker / PM2 / Nginx static / systemd
- Если Docker: какой image, docker-compose конфиг
- Если PM2: ecosystem config, какие процессы
- Если Nginx static: где лежат файлы, конфиг server block

### Шаг 4.1.2 — Определить где раздаётся фронтенд

```bash
# Найти где лежат статические файлы фронтенда
find /var/www -name "index.html" -path "*axen*" 2>/dev/null
find /var/www -name "index.html" -path "*miniapp*" 2>/dev/null
find /opt -name "index.html" -path "*axen*" 2>/dev/null
find /home -name "index.html" -path "*dist*" -path "*axen*" 2>/dev/null

# Прочитать nginx конфиг
cat /etc/nginx/sites-enabled/*axen* 2>/dev/null
cat /etc/nginx/conf.d/*axen* 2>/dev/null

# Найти root директорию
grep -r "root\s" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | grep -i "axen\|miniapp"
```

**Что фиксируем:**
- Путь к директории со статикой (напр. `/var/www/axentrait/dist/`)
- Nginx server block: порт, server_name, root, try_files
- SSL: есть ли HTTPS (Let's Encrypt? Cloudflare?)

### Шаг 4.1.3 — Определить CI/CD pipeline (если есть)

```bash
# GitHub Actions
ls /path/to/axentrait-miniapp/.github/workflows/ 2>/dev/null
cat /path/to/axentrait-miniapp/.github/workflows/*.yml 2>/dev/null

# GitLab CI
ls /path/to/axentrait-miniapp/.gitlab-ci.yml 2>/dev/null

# Скрипты деплоя
ls /path/to/axentrait-miniapp/deploy* /path/to/axentrait-miniapp/scripts/deploy* 2>/dev/null
cat /path/to/axentrait-miniapp/Makefile 2>/dev/null | head -30
```

**Варианты:**
| Сценарий | Действие |
|----------|----------|
| Есть CI/CD (GitHub Actions) | Пушим ветку → merge в main → CI делает деплой |
| Есть deploy-скрипт | Запускаем скрипт |
| Ручной деплой (build + copy) | Собираем → копируем dist → перезапуск nginx |
| Docker | Пересборка image → restart container |

### Шаг 4.1.4 — Проверить текущее состояние production

```bash
# Текущий URL приложения
curl -sI https://app.axentrait.com | head -10

# Проверить что приложение работает
curl -s https://app.axentrait.com | head -20

# Размер текущего dist
du -sh /path/to/production/dist/ 2>/dev/null

# Текущие файлы
ls -la /path/to/production/dist/ 2>/dev/null
```

### Шаг 4.1.5 — Определить стратегию отката

**Варианты отката:**

| Стратегия | Как |
|-----------|-----|
| Git revert | `git revert` коммитов на ветке |
| Git tag | Переключиться на `pre-prototype-alignment` tag |
| Backup dist | Скопировать текущий dist перед деплоем |
| Docker | Откатить на предыдущий image tag |

**Рекомендация:** Backup dist (самый быстрый откат — просто заменить папку).

### Шаг 4.1.6 — Составить DEPLOY_PLAN.md

**Артефакт:**
```markdown
# DEPLOY_PLAN.md

## Окружение
- VPS: ...
- Способ деплоя: ...
- Production URL: https://app.axentrait.com
- Dist path: ...
- Nginx config: ...

## Стратегия
1. Backup текущего dist
2. Merge feature/prototype-alignment → main
3. Build
4. Copy dist → production
5. Проверка
6. Rollback plan

## Команды (пошагово)
...
```

### Артефакт: `DEPLOY_PLAN.md`

---

## Этап 4.2 — Предварительная подготовка к деплою (1 сессия)

**Цель:** Всё подготовить ДО фактического деплоя. Бэкап, финальная сборка, тесты.

### Шаг 4.2.1 — Бэкап текущего production dist

```bash
# Определить путь к production dist (из 4.1)
PROD_DIST="/path/to/production/dist"

# Создать бэкап с датой
BACKUP_DIR="/path/to/backups/dist-$(date +%Y%m%d-%H%M%S)"
cp -r "$PROD_DIST" "$BACKUP_DIR"

# Проверить бэкап
ls -la "$BACKUP_DIR"
du -sh "$BACKUP_DIR"
echo "Backup created: $BACKUP_DIR"
```

### Шаг 4.2.2 — Финальная сборка на ветке feature/prototype-alignment

```bash
cd /path/to/axentrait-miniapp

# Убедиться что на правильной ветке
git branch --show-current
# Должно быть: feature/prototype-alignment

# Убедиться что нет uncommitted changes
git status

# Чистая сборка
cd apps/miniapp-frontend
rm -rf dist node_modules/.vite
npm run build

# Проверить результат
ls -la dist/
du -sh dist/
```

### Шаг 4.2.3 — Сравнить размеры старого и нового dist

```bash
echo "Old dist:"
du -sh "$BACKUP_DIR"

echo "New dist:"
du -sh /path/to/axentrait-miniapp/apps/miniapp-frontend/dist/

# Сравнить файлы
diff <(ls -la "$BACKUP_DIR") <(ls -la /path/to/axentrait-miniapp/apps/miniapp-frontend/dist/)
```

**Зачем:** Если новый dist значительно больше/меньше — возможна проблема.

### Шаг 4.2.4 — Проверить что index.html содержит Montserrat

```bash
grep "Montserrat" /path/to/axentrait-miniapp/apps/miniapp-frontend/dist/index.html
# Должна быть строка с Google Fonts
```

### Шаг 4.2.5 — Merge в main (или production ветку)

**Вариант A: Merge локально**
```bash
cd /path/to/axentrait-miniapp

# Переключиться на main
git checkout main

# Подтянуть последние изменения
git pull origin main

# Merge
git merge feature/prototype-alignment --no-ff -m "merge: prototype alignment (phases 0-3)"

# Push
git push origin main
```

**Вариант B: Pull Request на GitHub**
- Создать PR: `feature/prototype-alignment` → `main`
- Описание: все этапы, что изменено
- Merge через GitHub UI

**Решение:** Определяется в шаге 4.1.3 (есть ли CI/CD).

### Шаг 4.2.6 — Пересобрать на main (если merge локально)

```bash
git checkout main
cd apps/miniapp-frontend
rm -rf dist
npm run build
ls -la dist/
```

### Артефакт: результат сборки, размер dist, git log

---

## Этап 4.3 — Деплой на production (1 сессия)

**Цель:** Фактическое обновление production. Минимальный downtime.

### Шаг 4.3.1 — Предупредить о деплое (если есть команда)

**Действие:** Сообщить заказчику что начинается деплой. Ожидаемый downtime: < 30 секунд.

### Шаг 4.3.2 — Деплой (зависит от способа из 4.1)

**Сценарий A: Nginx static (ручной деплой)**
```bash
PROD_DIST="/path/to/production/dist"
NEW_DIST="/path/to/axentrait-miniapp/apps/miniapp-frontend/dist"

# Атомарная замена: rename, не copy
mv "$PROD_DIST" "${PROD_DIST}.old"
cp -r "$NEW_DIST" "$PROD_DIST"

# Перезапуск nginx (для очистки кеша)
sudo nginx -t && sudo systemctl reload nginx

echo "Deploy done at $(date)"
```

**Сценарий B: Docker**
```bash
cd /path/to/axentrait-miniapp

# Пересобрать image
docker compose build miniapp-frontend

# Перезапустить контейнер
docker compose up -d miniapp-frontend

# Проверить что запустился
docker compose ps
docker compose logs miniapp-frontend --tail 20
```

**Сценарий C: PM2**
```bash
cd /path/to/axentrait-miniapp

# Rebuild
cd apps/miniapp-frontend && npm run build

# Restart PM2 process
pm2 restart axentrait-frontend

# Проверить
pm2 status
pm2 logs axentrait-frontend --lines 20
```

**Сценарий D: CI/CD (GitHub Actions)**
```bash
# Push в main уже сделан в 4.2.5
# CI/CD pipeline запустится автоматически
# Проверить статус на GitHub: Actions tab
```

### Шаг 4.3.3 — Проверка доступности (быстрая)

```bash
# 1. HTTP status
curl -sI https://app.axentrait.com | head -5
# Ожидание: HTTP/2 200

# 2. Проверить что index.html обновился
curl -s https://app.axentrait.com | grep "Montserrat"
# Ожидание: строка с Google Fonts

# 3. Проверить что CSS загружается
curl -s https://app.axentrait.com | grep -o 'href="[^"]*\.css"'
# Ожидание: ссылки на CSS-файлы
```

### Шаг 4.3.4 — Очистка кеша CDN (если используется)

```bash
# Cloudflare (если используется)
# Через Dashboard: Caching → Purge Everything
# Или через API:
# curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
#   -H "Authorization: Bearer {token}" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'

# Проверить заголовки кеша
curl -sI https://app.axentrait.com | grep -i "cache\|cf-"
```

### Шаг 4.3.5 — Удалить старый dist (после успешной проверки)

```bash
# Только после подтверждения что всё работает!
rm -rf "${PROD_DIST}.old"
echo "Old dist removed"
```

### Артефакт: лог деплоя (команды + результаты)

---

## Этап 4.4 — Пост-деплой проверка и мониторинг (1 сессия)

**Цель:** Полная проверка production после деплоя. Мониторинг ошибок.

### Шаг 4.4.1 — Проверка в Telegram

**Открыть MiniApp в Telegram (на реальном устройстве):**

| # | Проверка | Ожидание | ✅/❌ |
|---|----------|----------|------|
| 1 | Приложение открывается | Splash экран | |
| 2 | Шрифт Montserrat | Визуально отличается от системного | |
| 3 | Splash → Welcome | Автопереход ~2сек | |
| 4 | Welcome: H1 | Тонкий, cyan, с glow | |
| 5 | Welcome: Primary btn | Glass (полупрозрачная) | |
| 6 | Welcome → Survey | Переход работает | |
| 7 | Survey: fullscreen layout | Фон виден, нет TopBar/Card | |
| 8 | Survey: опции | Inline-flex, glass, teal labels | |
| 9 | Survey → Result | Все 5 шагов проходятся | |
| 10 | Result: 3 карточки | Минималистичные mj-card | |
| 11 | BottomNav | 4 элемента, работают переходы | |
| 12 | Cases: карточки | Только title, cyan, weight 300 | |
| 13 | AI Chat: сразу чат | Нет каталога | |
| 14 | AI Chat: bubbles | Teal palette, glass | |
| 15 | Service Detail | Fullscreen bg, контент снизу | |
| 16 | ServicesCatalog | mj-card стиль | |

### Шаг 4.4.2 — Проверка на разных устройствах

| Устройство | OS | Проверить |
|-----------|-----|----------|
| iPhone (Safari) | iOS | Glass-morphism (backdrop-filter) |
| Android (Chrome) | Android | Glass-morphism (-webkit-backdrop-filter) |
| Desktop (Chrome) | — | Общий вид через DevTools mobile |

**Критичные проверки:**
- `backdrop-filter: blur()` работает на iOS и Android
- Montserrat загружается (не показывает системный шрифт)
- Telegram SDK не конфликтует с fullscreen layouts

### Шаг 4.4.3 — Проверка ошибок в консоли

```bash
# Если есть доступ к error logging (Sentry, LogRocket и т.д.)
# Проверить за последние 30 минут после деплоя

# Проверить nginx error log
sudo tail -50 /var/log/nginx/error.log | grep -i "axen\|miniapp"

# Проверить nginx access log (404 ошибки)
sudo tail -100 /var/log/nginx/access.log | grep -i "axen\|miniapp" | grep " 404 "
```

### Шаг 4.4.4 — Проверка загрузки ресурсов

```bash
# Проверить что все assets доступны
curl -sI https://app.axentrait.com/assets/ | head -5

# Проверить Google Fonts
curl -sI "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" | head -5
# Ожидание: HTTP/2 200

# Проверить изображения (hero images)
curl -sI https://app.axentrait.com/images/heroes/hero-main.webp | head -5
```

### Шаг 4.4.5 — Мониторинг в течение 24 часов

**После деплоя мониторить:**
- Error logs (nginx, приложение)
- Отзывы пользователей
- Метрики (если есть analytics)

**Если проблемы:**
- Мелкие → hotfix на ветке, новый деплой
- Критические → откат (см. шаг 4.4.6)

### Шаг 4.4.6 — Процедура отката (на случай проблем)

**Быстрый откат (< 1 минуты):**
```bash
PROD_DIST="/path/to/production/dist"
BACKUP_DIR="/path/to/backups/dist-YYYYMMDD-HHMMSS"  # из шага 4.2.1

# Замена dist
rm -rf "$PROD_DIST"
cp -r "$BACKUP_DIR" "$PROD_DIST"

# Перезапуск
sudo nginx -t && sudo systemctl reload nginx

echo "Rollback done at $(date)"
```

**Git откат:**
```bash
cd /path/to/axentrait-miniapp
git checkout main

# Вернуться к состоянию до merge
git revert HEAD --no-edit  # revert merge commit

# Или жёстко
git reset --hard pre-prototype-alignment
git push origin main --force  # ОПАСНО, только при критических проблемах
```

### Шаг 4.4.7 — Финальный отчёт

**Составить DEPLOY_REPORT.md:**
```markdown
# DEPLOY_REPORT.md

## Дата деплоя: ...
## Время: ...

## Результат
- Деплой: ✅ Успешен / ❌ Откат
- Downtime: ~... секунд
- Ошибки после деплоя: 0 / (список)

## Проверки
| Проверка | Результат |
|----------|----------|
| HTTP 200 | ✅ |
| Montserrat загружается | ✅ |
| Telegram MiniApp | ✅ |
| iOS Safari | ✅ |
| Android Chrome | ✅ |
| Ошибки в логах | 0 |

## Откат
- Бэкап: /path/to/backup
- Git tag: pre-prototype-alignment
```

### Артефакт: `DEPLOY_REPORT.md`

---

## Сводная таблица Фазы 4

| Этап | Описание | Подшагов | Сложность |
|------|----------|----------|-----------|
| 4.1 | Анализ процесса деплоя | 6 | Средняя |
| 4.2 | Подготовка (бэкап, build, merge) | 6 | Средняя |
| 4.3 | Фактический деплой | 5 | Высокая |
| 4.4 | Пост-деплой проверка | 7 | Средняя |
| **Итого** | | **24** | |

---

## Риски Фазы 4

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Build fails на production | Низкая | Уже проверено в Фазе 3 |
| Nginx конфиг ошибка | Низкая | `nginx -t` перед reload |
| Google Fonts не загружается в Telegram | Низкая | Fallback на system-ui |
| backdrop-filter не работает | Средняя | -webkit- prefix, тест на устройствах |
| Telegram SDK конфликт с fullscreen | Средняя | Тест в Telegram до деплоя на prod |
| Ошибки в CI/CD pipeline | Средняя | Ручной деплой как fallback |
| Пользователи видят кеш старой версии | Средняя | Purge CDN + cache-busting (hash в именах) |
| Критическая ошибка в production | Низкая | Бэкап dist + процедура отката |

---

## Общая сводка всех фаз проекта

| Фаза | Описание | Этапов | Подшагов | Сессий |
|------|----------|--------|----------|--------|
| 0 | Подготовка и аудит | 1 | 10 | 1 |
| 1 | Глобальные изменения | 3 | 18 | 3 |
| 2 | Экраны (поэкранные правки) | 10 | 85 | 10 |
| 3 | Шлифовка и QA | 3 | 36 | 3 |
| 4 | Деплой | 4 | 24 | 4 |
| **ИТОГО** | | **21** | **173** | **21** |

**QA проверок:** 149 (этап 3.3) + 16 (пост-деплой 4.4.1) = **165 проверок**

---

## Чеклист готовности к деплою (gate перед Фазой 4)

Перед началом Фазы 4 должны быть выполнены ВСЕ пункты:

| # | Условие | Статус |
|---|---------|--------|
| 1 | Фаза 0 завершена (аудит) | ⬜ |
| 2 | Фаза 1 завершена (глобальные) | ⬜ |
| 3 | Фаза 2 завершена (все 10 экранов) | ⬜ |
| 4 | Фаза 3.1 завершена (BottomNav) | ⬜ |
| 5 | Фаза 3.2 завершена (ServicesCatalog) | ⬜ |
| 6 | Фаза 3.3 завершена (QA report) | ⬜ |
| 7 | QA_FINAL_REPORT: ≥95% проверок пройдено | ⬜ |
| 8 | Build проходит без ошибок | ⬜ |
| 9 | Все коммиты на ветке feature/prototype-alignment | ⬜ |
| 10 | Заказчик одобрил результат | ⬜ |
