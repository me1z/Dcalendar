# DCalendar - Telegram Mini App

Telegram Mini App для планирования общих событий и задач для пар.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 📱 Возможности

- **📅 Календарь** - Просмотр событий по дням и месяцам
- **🎯 События** - Создание и управление событиями
- **✅ Задачи** - Создание задач с приоритетами
- **👥 Назначения** - Назначение событий себе, партнеру или обоим
- **🏷️ Категории** - Организация по категориям
- **🔍 Поиск и фильтры** - Быстрый поиск и сортировка

## 🛠️ Технологии

- **React 18** + **Vite** - современный стек разработки
- **Tailwind CSS** - стилизация
- **Lucide React** - иконки
- **date-fns** - работа с датами
- **Telegram Web App SDK** - интеграция с Telegram

## 🔧 Настройка Telegram

Подробная инструкция по настройке: [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)

### Кратко:
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Настройте Mini App командой `/newapp`
3. Загрузите приложение на хостинг (Vercel/Netlify)
4. Укажите URL в настройках бота

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── CalendarView.jsx # Календарь
│   ├── EventForm.jsx   # Форма событий
│   └── EventList.jsx   # Список событий
├── hooks/              # React хуки
│   └── useTelegramApp.js # Telegram интеграция
├── App.jsx             # Главный компонент
├── main.jsx            # Точка входа
└── index.css           # Стили
```

## 🎨 Компоненты

### CalendarView
- Отображение календаря по месяцам
- Навигация между месяцами
- Показ событий на соответствующих днях

### EventForm
- Создание событий и задач
- Выбор типа, даты, времени
- Настройка приоритета и назначения

### EventList
- Список всех событий
- Фильтрация и сортировка
- Поиск по названию

## 🚀 Развертывание

### Vercel (рекомендуется)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Загрузите папку dist в Netlify
```

## 📱 Поддерживаемые устройства

- ✅ iOS (Safari в Telegram)
- ✅ Android (Chrome в Telegram)
- ✅ Desktop (браузер в Telegram Desktop)
- ✅ Web (для разработки)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

- 📧 Email: support@dcalendar.app
- 💬 Telegram: [@DCalendarSupport](https://t.me/DCalendarSupport)
- 🐛 Issues: [GitHub Issues](https://github.com/username/dcalendar/issues)

---

**DCalendar** - планируйте вашу жизнь вместе! 💕
