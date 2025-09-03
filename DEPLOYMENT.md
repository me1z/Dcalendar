# 🚀 Развертывание DCalendar

Подробная инструкция по развертыванию приложения DCalendar как Telegram Web App.

## 📋 Предварительные требования

- Node.js 16+ и npm
- Git
- Аккаунт на хостинге (Vercel, Netlify, или собственный сервер)
- Telegram Bot (созданный через @BotFather)

## 🔧 Локальная разработка

### 1. Клонирование и установка

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/Dcalendar.git
cd Dcalendar

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev
```

### 2. Тестирование

- Откройте http://localhost:5173 в браузере
- Протестируйте все функции приложения
- Убедитесь, что мобильная версия работает корректно

## 🌐 Развертывание на хостинге

### Вариант 1: Vercel (Рекомендуется)

#### 1. Подготовка проекта

```bash
# Создайте файл vercel.json в корне проекта
echo '{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}' > vercel.json

# Соберите проект
npm run build
```

#### 2. Развертывание

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Разверните проект
vercel --prod
```

#### 3. Настройка домена

- Войдите в [Vercel Dashboard](https://vercel.com/dashboard)
- Выберите ваш проект
- В настройках найдите "Domains"
- Добавьте ваш домен или используйте предоставленный Vercel

### Вариант 2: Netlify

#### 1. Подготовка проекта

```bash
# Создайте файл _redirects в папке public
echo "/* /index.html 200" > public/_redirects

# Соберите проект
npm run build
```

#### 2. Развертывание

- Зарегистрируйтесь на [Netlify](https://netlify.com)
- Перетащите папку `dist` в область развертывания
- Или подключите GitHub репозиторий для автоматического развертывания

#### 3. Настройка домена

- В настройках сайта найдите "Domain management"
- Добавьте ваш домен или используйте предоставленный Netlify

### Вариант 3: Собственный сервер

#### 1. Сборка проекта

```bash
npm run build
```

#### 2. Загрузка файлов

- Загрузите содержимое папки `dist` на ваш веб-сервер
- Убедитесь, что сервер настроен для SPA (Single Page Application)

#### 3. Настройка сервера

**Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/dcalendar;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🤖 Настройка Telegram Bot

### 1. Создание бота

1. Напишите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота

### 2. Настройка Web App

1. Отправьте команду `/newapp` BotFather
2. Выберите вашего бота
3. Введите название приложения (например, "DCalendar")
4. Введите краткое описание
5. Загрузите фото для иконки (512x512px)
6. Введите URL вашего развернутого приложения

### 3. Тестирование

1. Найдите вашего бота в Telegram
2. Отправьте команду `/start`
3. Нажмите на кнопку "Open App" или "Открыть приложение"
4. Убедитесь, что приложение загружается корректно

## 🔒 Настройка безопасности

### 1. HTTPS

- Убедитесь, что ваш сайт работает по HTTPS
- Telegram требует HTTPS для Web Apps
- Vercel и Netlify предоставляют SSL сертификаты автоматически

### 2. CSP (Content Security Policy)

Добавьте в `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### 3. CORS (если необходимо)

Если вы используете API, настройте CORS:

```javascript
// Пример для Express.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://t.me']
}));
```

## 📱 Оптимизация для мобильных устройств

### 1. PWA (Progressive Web App)

Создайте `public/manifest.json`:

```json
{
  "name": "DCalendar",
  "short_name": "DCalendar",
  "description": "Календарь для пар",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

Создайте `public/sw.js` для кэширования:

```javascript
const CACHE_NAME = 'dcalendar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

## 🧪 Тестирование развертывания

### 1. Функциональное тестирование

- [ ] Приложение загружается без ошибок
- [ ] Все компоненты отображаются корректно
- [ ] Создание событий работает
- [ ] Календарь функционирует
- [ ] Уведомления работают (если разрешены)

### 2. Мобильное тестирование

- [ ] Адаптивность на разных экранах
- [ ] Touch-события работают корректно
- [ ] Навигация удобна на мобильных
- [ ] Скорость загрузки приемлема

### 3. Тестирование в Telegram

- [ ] Web App открывается в Telegram
- [ ] Все функции работают корректно
- [ ] Интеграция с Telegram API работает
- [ ] Уведомления приходят

## 🚨 Устранение неполадок

### Проблема: Приложение не загружается

**Решение:**
- Проверьте URL в настройках бота
- Убедитесь, что сайт доступен по HTTPS
- Проверьте консоль браузера на ошибки

### Проблема: Функции не работают

**Решение:**
- Проверьте, что все файлы загружены
- Убедитесь, что API ключи настроены
- Проверьте CORS настройки

### Проблема: Медленная загрузка

**Решение:**
- Оптимизируйте размер бандла
- Включите сжатие на сервере
- Используйте CDN для статических файлов

## 📊 Мониторинг

### 1. Аналитика

Добавьте Google Analytics или аналогичный сервис:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Логирование ошибок

Используйте Sentry или аналогичный сервис для отслеживания ошибок.

## 🔄 Обновления

### 1. Автоматическое развертывание

Настройте автоматическое развертывание при push в main ветку:

**GitHub Actions (Vercel):**
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Ручные обновления

```bash
# Обновите код
git pull origin main

# Установите зависимости
npm install

# Соберите проект
npm run build

# Разверните
vercel --prod
```

## 📚 Дополнительные ресурсы

- [Telegram Web App Documentation](https://core.telegram.org/bots/webapps)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Успешного развертывания! 🚀**
