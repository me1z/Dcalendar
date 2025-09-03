# 🤖 Настройка Telegram Bot для DCalendar

Подробная инструкция по созданию и настройке Telegram Bot для работы с приложением DCalendar.

## 📋 Предварительные требования

- Аккаунт в Telegram
- Доступ к @BotFather
- Развернутое приложение DCalendar на хостинге

## 🚀 Создание бота

### 1. Создание нового бота

1. **Найдите @BotFather** в Telegram
2. **Отправьте команду** `/newbot`
3. **Введите название бота** (например, "DCalendar - Календарь для пар")
4. **Введите username бота** (например, `@DCalendarBot`)
5. **Сохраните токен бота** - он понадобится для дальнейшей настройки

### 2. Настройка команд бота

Отправьте @BotFather команду `/setcommands` и выберите вашего бота, затем отправьте:

```
start - Запустить приложение
help - Помощь по использованию
settings - Настройки бота
```

## 🌐 Настройка Web App

### 1. Создание Web App

1. **Отправьте команду** `/newapp` @BotFather
2. **Выберите вашего бота** из списка
3. **Введите название приложения** (например, "DCalendar")
4. **Введите краткое описание** (например, "Календарь для планирования событий в паре")
5. **Загрузите фото для иконки** (512x512px, PNG/JPG)
6. **Введите URL вашего приложения** (например, `https://yourdomain.com`)

### 2. Настройка кнопки меню

Отправьте @BotFather команду `/setmenubutton` и выберите вашего бота, затем:

1. **Введите текст кнопки** (например, "Открыть календарь")
2. **Введите URL** вашего приложения
3. **Выберите тип кнопки** (Web App)

## 🔧 Настройка приложения

### 1. Обновление конфигурации

В вашем приложении DCalendar обновите настройки Telegram:

```javascript
// В src/hooks/useTelegramApp.js
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const WEB_APP_URL = 'https://yourdomain.com';
```

### 2. Настройка webhook (опционально)

Если вы хотите получать обновления от Telegram:

```javascript
// Пример настройки webhook
const webhookUrl = `${WEB_APP_URL}/api/telegram/webhook`;
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: webhookUrl })
});
```

## 📱 Тестирование

### 1. Базовое тестирование

1. **Найдите вашего бота** в Telegram
2. **Отправьте команду** `/start`
3. **Нажмите на кнопку** "Открыть календарь" или "Open App"
4. **Убедитесь, что приложение загружается**

### 2. Тестирование функций

- [ ] Приложение открывается в Telegram
- [ ] Календарь отображается корректно
- [ ] Создание событий работает
- [ ] Настройка пары функционирует
- [ ] Уведомления приходят

## 🔒 Безопасность

### 1. Валидация данных

Telegram отправляет данные с подписью. Добавьте валидацию:

```javascript
// Пример валидации данных от Telegram
import crypto from 'crypto';

function validateTelegramData(data, hash) {
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const checkString = Object.keys(data)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${data[key]}`)
    .sort()
    .join('\n');
  
  const checkHash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return checkHash === hash;
}
```

### 2. Ограничение доступа

Настройте доступ только для определенных пользователей:

```javascript
// Проверка авторизованных пользователей
const authorizedUsers = ['user_id_1', 'user_id_2'];

function isAuthorizedUser(userId) {
  return authorizedUsers.includes(userId.toString());
}
```

## 🎨 Кастомизация

### 1. Настройка темы

Используйте Telegram Web App API для настройки темы:

```javascript
// В src/hooks/useTelegramApp.js
useEffect(() => {
  if (tg) {
    // Установка основной кнопки
    tg.MainButton.setText('СОЗДАТЬ СОБЫТИЕ');
    tg.MainButton.onClick(() => {
      // Действие при нажатии
    });
    
    // Настройка темы
    tg.setHeaderColor('#3b82f6');
    tg.setBackgroundColor('#ffffff');
  }
}, [tg]);
```

### 2. Настройка кнопок

```javascript
// Настройка кнопки "Назад"
tg.BackButton.onClick(() => {
  // Действие при нажатии "Назад"
});

// Показать/скрыть кнопки
tg.MainButton.show();
tg.BackButton.show();
```

## 📊 Аналитика и мониторинг

### 1. Отслеживание событий

```javascript
// Отправка событий в Telegram
tg.sendData(JSON.stringify({
  action: 'event_created',
  eventId: event.id,
  timestamp: Date.now()
}));
```

### 2. Логирование

```javascript
// Логирование действий пользователей
function logUserAction(userId, action, details) {
  console.log(`User ${userId} performed ${action}:`, details);
  
  // Отправка в ваш сервер аналитики
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, action, details, timestamp: Date.now() })
  });
}
```

## 🚨 Устранение неполадок

### Проблема: Приложение не открывается

**Возможные причины:**
- Неверный URL в настройках бота
- Сайт недоступен по HTTPS
- Ошибки в коде приложения

**Решение:**
1. Проверьте URL в настройках @BotFather
2. Убедитесь, что сайт доступен
3. Проверьте консоль браузера на ошибки

### Проблема: Функции не работают

**Возможные причины:**
- Ошибки в JavaScript коде
- Проблемы с API
- Блокировка браузером

**Решение:**
1. Проверьте консоль на ошибки
2. Убедитесь, что все API работают
3. Проверьте настройки безопасности браузера

### Проблема: Уведомления не приходят

**Возможные причины:**
- Не разрешены уведомления в браузере
- Ошибки в Service Worker
- Проблемы с Telegram API

**Решение:**
1. Проверьте разрешения браузера
2. Убедитесь, что Service Worker зарегистрирован
3. Проверьте настройки Telegram Bot

## 🔄 Обновления и поддержка

### 1. Обновление бота

При обновлении приложения:

1. **Обновите код** приложения
2. **Пересоберите** проект
3. **Разверните** на хостинг
4. **Протестируйте** в Telegram

### 2. Мониторинг

Регулярно проверяйте:

- [ ] Работоспособность бота
- [ ] Статистику использования
- [ ] Ошибки в логах
- [ ] Отзывы пользователей

## 📚 Полезные ссылки

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Web App Documentation](https://core.telegram.org/bots/webapps)
- [@BotFather Commands](https://t.me/botfather)
- [Telegram Web App Examples](https://github.com/Ajaxy/telegram-tt)

## 🎯 Лучшие практики

1. **Всегда используйте HTTPS** - Telegram требует это для Web Apps
2. **Тестируйте на разных устройствах** - iOS, Android, Desktop
3. **Обрабатывайте ошибки** - предоставляйте понятные сообщения пользователям
4. **Оптимизируйте производительность** - быстрая загрузка важна для мобильных
5. **Следите за обновлениями** - Telegram API может меняться

---

**Успешной настройки Telegram Bot! 🤖✨**
