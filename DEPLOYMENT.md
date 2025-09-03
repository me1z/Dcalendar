# 🚀 Инструкции по деплою DCalendar

## 📋 Предварительные требования

- Node.js 16+ и npm
- Git
- Аккаунт на платформе деплоя (Vercel, Netlify, etc.)

## 🔧 Локальная сборка

1. **Установите зависимости**
   ```bash
   npm install
   ```

2. **Соберите проект**
   ```bash
   npm run build
   ```

3. **Проверьте сборку локально**
   ```bash
   npm run preview
   ```

## 🌐 Деплой на Vercel (Рекомендуется)

### Автоматический деплой

1. **Подключите GitHub репозиторий**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш репозиторий
   - Нажмите "Import"

2. **Настройте проект**
   - Framework Preset: Vercel
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки
   - Получите URL вашего приложения

### Ручной деплой

1. **Установите Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Войдите в аккаунт**
   ```bash
   vercel login
   ```

3. **Деплой**
   ```bash
   vercel --prod
   ```

## 🌐 Деплой на Netlify

1. **Подключите репозиторий**
   - Перейдите на [netlify.com](https://netlify.com)
   - Нажмите "New site from Git"
   - Выберите ваш репозиторий

2. **Настройте сборку**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `16`

3. **Деплой**
   - Нажмите "Deploy site"
   - Дождитесь завершения

## 🌐 Деплой на GitHub Pages

1. **Настройте GitHub Actions**
   Создайте файл `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
   
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '16'
   
         - name: Install dependencies
           run: npm ci
   
         - name: Build
           run: npm run build
   
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Настройте GitHub Pages**
   - Перейдите в Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

## 🔧 Настройка окружения

### Переменные окружения

Создайте файл `.env.local` для локальной разработки:

```env
VITE_APP_NAME=DCalendar
VITE_APP_VERSION=1.0.0
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
```

### Vercel

Добавьте переменные в настройках проекта:
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_TELEGRAM_BOT_TOKEN`
- `VITE_TELEGRAM_CHAT_ID`

## 📱 PWA настройка

### Иконки

Создайте иконки разных размеров:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

### Manifest

Проверьте файл `public/manifest.json`:
- Название приложения
- Цвета темы
- Иконки

### Service Worker

Проверьте файл `public/sw.js`:
- Кэширование ресурсов
- Офлайн функциональность
- Push уведомления

## 🔒 HTTPS и безопасность

### Vercel
- HTTPS включен автоматически
- SSL сертификаты обновляются автоматически

### Netlify
- HTTPS включен автоматически
- Настройте редиректы в `_redirects`

### GitHub Pages
- HTTPS включен автоматически
- Проверьте настройки безопасности

## 📊 Аналитика

### Vercel Analytics
- Автоматически включена
- Метрики производительности
- Анализ пользователей

### Google Analytics
Добавьте в `index.html`:

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

## 🧪 Тестирование деплоя

### Проверьте функциональность
- [ ] Создание событий
- [ ] Синхронизация пары
- [ ] Уведомления
- [ ] PWA установка
- [ ] Офлайн режим

### Проверьте производительность
- [ ] Lighthouse score
- [ ] Core Web Vitals
- [ ] Время загрузки
- [ ] Размер бандла

## 🚨 Устранение проблем

### Ошибка сборки
```bash
# Очистите кэш
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Проблемы с PWA
- Проверьте manifest.json
- Проверьте service worker
- Проверьте HTTPS

### Проблемы с деплоем
- Проверьте логи сборки
- Проверьте переменные окружения
- Проверьте права доступа

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite Documentation](https://vitejs.dev/guide/)

---

**Успешного деплоя! 🚀**
