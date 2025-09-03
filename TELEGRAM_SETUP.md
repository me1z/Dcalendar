# �� Настройка Telegram для DCalendar

## 📋 Обзор

DCalendar поддерживает интеграцию с Telegram через Telegram Web App API, что позволяет:
- Запускать приложение прямо в Telegram
- Получать уведомления о событиях
- Использовать нативные Telegram функции
- Автоматически адаптироваться к теме Telegram

## 🚀 Создание Telegram Bot

### 1. Создание бота через @BotFather

1. **Найдите @BotFather в Telegram**
   - Откройте Telegram
   - Найдите @BotFather
   - Нажмите "Start"

2. **Создайте нового бота**
   ```
   /newbot
   ```

3. **Следуйте инструкциям**
   - Введите название бота (например, "DCalendar Bot")
   - Введите username (например, "dcalendar_bot")
   - Получите токен бота

4. **Сохраните токен**
   ```
   Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### 2. Настройка Web App

1. **Отправьте команду**
   ```
   /newapp
   ```

2. **Выберите вашего бота**
   - Выберите бота из списка

3. **Заполните информацию**
   - **Title**: DCalendar
   - **Short description**: Календарь для пар
   - **Photo**: Загрузите иконку 512x512px
   - **URL**: URL вашего развернутого приложения

4. **Получите Web App**
   - BotFather создаст Web App
   - Сохраните информацию о Web App

## ⚙️ Настройка приложения

### 1. Переменные окружения

Создайте файл `.env.local`:

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_WEBAPP_URL=https://t.me/your_bot_username
```

### 2. Настройка Vercel

Добавьте переменные в настройках проекта:
- `VITE_TELEGRAM_BOT_TOKEN`
- `VITE_TELEGRAM_WEBAPP_URL`

### 3. Проверка интеграции

1. **Запустите приложение**
   ```bash
   npm run dev
   ```

2. **Откройте в Telegram**
   - Найдите вашего бота
   - Нажмите "Start"
   - Нажмите "Open App"

## 🔧 Техническая реализация

### 1. Telegram Web App API

Приложение автоматически определяет, запущено ли оно в Telegram:

```javascript
// src/hooks/useTelegramApp.js
useEffect(() => {
  if (window.Telegram && window.Telegram.WebApp) {
    const telegramApp = window.Telegram.WebApp
    setTg(telegramApp)
    
    // Инициализация
    telegramApp.ready()
    telegramApp.expand()
    
    // Получение информации о пользователе
    if (telegramApp.initDataUnsafe?.user) {
      setUser(telegramApp.initDataUnsafe.user)
    }
    
    // Установка темы
    setTheme(telegramApp.colorScheme || 'light')
  }
}, [])
```

### 2. Адаптация к теме Telegram

```javascript
// Автоматическое переключение темы
telegramApp.onEvent('themeChanged', () => {
  setTheme(telegramApp.colorScheme || 'light')
})
```

### 3. Нативные функции Telegram

```javascript
// Показать уведомление
const showAlert = (message) => {
  if (tg) {
    tg.showAlert(message)
  } else {
    alert(message) // Fallback для браузера
  }
}

// Показать подтверждение
const showConfirm = (message, callback) => {
  if (tg) {
    tg.showConfirm(message, callback)
  } else {
    const result = confirm(message)
    callback(result)
  }
}
```

## 📱 Тестирование

### 1. Локальное тестирование

1. **Запустите приложение**
   ```bash
   npm run dev
   ```

2. **Откройте в браузере**
   - Приложение работает в обычном режиме
   - Telegram функции недоступны

### 2. Тестирование в Telegram

1. **Разверните приложение**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Настройте Web App**
   - Обновите URL в BotFather
   - Убедитесь, что HTTPS работает

3. **Протестируйте в Telegram**
   - Откройте бота
   - Нажмите "Open App"
   - Проверьте все функции

## 🚨 Устранение проблем

### Проблема: Web App не открывается

**Решение:**
- Проверьте URL в настройках бота
- Убедитесь, что сайт доступен по HTTPS
- Проверьте, что бот активен

### Проблема: Telegram API не работает

**Решение:**
- Проверьте, что приложение запущено в Telegram
- Убедитесь, что `window.Telegram.WebApp` доступен
- Проверьте консоль на ошибки

### Проблема: Тема не переключается

**Решение:**
- Проверьте обработчик `themeChanged`
- Убедитесь, что CSS переменные настроены
- Проверьте, что `colorScheme` доступен

## 🔒 Безопасность

### 1. Валидация данных

```javascript
// Проверка источника данных
const validateInitData = (initData) => {
  // Проверьте, что данные пришли от Telegram
  // Используйте HMAC для проверки подписи
}
```

### 2. HTTPS обязателен

- Telegram требует HTTPS для Web Apps
- Используйте Vercel или аналогичные платформы
- Проверьте SSL сертификаты

### 3. Ограничения доступа

```javascript
// Проверка прав доступа
const requestWriteAccess = async () => {
  if (tg) {
    return await tg.requestWriteAccess()
  }
  return false
}
```

## 📚 Документация

### Полезные ссылки

- [Telegram Web App API](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web App Examples](https://github.com/Ajaxy/telegram-tt)
- [Telegram Web App Guide](https://core.telegram.org/bots/webapps#initializing-web-apps)

### Примеры использования

```javascript
// Получение информации о пользователе
const user = telegramApp.initDataUnsafe?.user
if (user) {
  console.log('User ID:', user.id)
  console.log('First Name:', user.first_name)
  console.log('Username:', user.username)
}

// Настройка темы
const theme = telegramApp.colorScheme
document.documentElement.setAttribute('data-theme', theme)

// Обработка событий
telegramApp.onEvent('viewportChanged', () => {
  telegramApp.expand()
})
```

## 🔮 Расширенные возможности

### 1. Push уведомления

```javascript
// Регистрация для push уведомлений
const registerForPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your_vapid_public_key'
    })
    return subscription
  }
}
```

### 2. Интеграция с Telegram Bot API

```javascript
// Отправка сообщений через бота
const sendTelegramMessage = async (chatId, message) => {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  })
  return response.json()
}
```

### 3. Кастомные команды

```javascript
// Обработка команд бота
const handleBotCommand = (command) => {
  switch (command) {
    case '/start':
      return 'Добро пожаловать в DCalendar!'
    case '/help':
      return 'Используйте /start для открытия приложения'
    case '/events':
      return 'Ваши события: ...'
    default:
      return 'Неизвестная команда'
  }
}
```

---

**Успешной интеграции с Telegram! 🤖✨**
