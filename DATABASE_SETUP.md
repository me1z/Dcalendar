# 🗄️ Настройка MongoDB для DCalendar

## 📋 Обзор

Этот документ содержит инструкции по настройке MongoDB базы данных для приложения DCalendar.

## 🚀 Создание MongoDB Atlas кластера

### 1. Регистрация на MongoDB Atlas

1. **Перейдите на [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Нажмите "Try Free"**
3. **Создайте аккаунт** или войдите в существующий

### 2. Создание кластера

1. **Выберите план "Free"** (M0)
2. **Выберите провайдера** (AWS, Google Cloud, Azure)
3. **Выберите регион** (ближайший к вам)
4. **Нажмите "Create Cluster"**

### 3. Настройка безопасности

#### Создание пользователя базы данных:
1. **Перейдите в "Database Access"**
2. **Нажмите "Add New Database User"**
3. **Выберите "Password"** как метод аутентификации
4. **Введите username и password**
5. **Выберите "Read and write to any database"**
6. **Нажмите "Add User"**

#### Настройка IP доступа:
1. **Перейдите в "Network Access"**
2. **Нажмите "Add IP Address"**
3. **Для разработки выберите "Allow Access from Anywhere"** (0.0.0.0/0)
4. **Для продакшена укажите IP вашего сервера**

### 4. Получение строки подключения

1. **Перейдите в "Database"**
2. **Нажмите "Connect"**
3. **Выберите "Connect your application"**
4. **Скопируйте строку подключения**

## 🔧 Настройка в проекте

### 1. Создание файла .env.local

Скопируйте `env.example` в `.env.local` и заполните:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dcalendar?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2. Генерация JWT Secret

Сгенерируйте случайный секретный ключ:

```bash
# В терминале
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Настройка Vercel

Добавьте переменные в настройках проекта Vercel:

1. **Перейдите в настройки проекта**
2. **Выберите "Environment Variables"**
3. **Добавьте:**
   - `MONGODB_URI` = ваша строка подключения
   - `JWT_SECRET` = ваш секретный ключ

## 📊 Структура базы данных

### Коллекция `users`

```javascript
{
  _id: ObjectId,
  telegramId: Number,
  name: String,
  createdAt: Date,
  updatedAt: Date,
  pairCode: String, // временный код для подключения
  partnerId: ObjectId // ID партнера
}
```

### Коллекция `events`

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ID создателя события
  title: String,
  description: String,
  date: String,
  time: String,
  type: String, // 'task', 'event', 'reminder'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  location: String,
  assignedTo: String, // 'me', 'partner', 'both'
  category: String,
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date,
  reminder: {
    enabled: Boolean,
    time: Number
  }
}
```

## 🔒 Безопасность

### 1. Ограничение доступа

- **Используйте сильные пароли** для пользователей базы данных
- **Ограничьте IP адреса** для продакшена
- **Регулярно обновляйте** пароли

### 2. JWT токены

- **Используйте длинные секретные ключи** (минимум 32 символа)
- **Установите разумное время жизни** токенов
- **Храните секреты** в переменных окружения

### 3. Валидация данных

- **Проверяйте все входные данные** на сервере
- **Используйте MongoDB схемы** для валидации
- **Ограничивайте размер** загружаемых данных

## 🧪 Тестирование подключения

### 1. Локальное тестирование

```bash
# Установите зависимости
npm install

# Создайте .env.local с вашими данными
cp env.example .env.local

# Запустите dev сервер
npm run dev
```

### 2. Проверка API

Откройте браузер и перейдите на:
- `http://localhost:5173/api/auth` - должен вернуть ошибку метода
- `http://localhost:5173/api/events` - должен вернуть ошибку авторизации

## 🚨 Устранение неполадок

### Проблема: "MongoDB connection failed"

**Возможные причины:**
- Неверная строка подключения
- Неправильные учетные данные
- Блокировка IP адреса

**Решение:**
1. Проверьте строку подключения
2. Убедитесь, что IP разрешен
3. Проверьте username/password

### Проблема: "JWT verification failed"

**Возможные причины:**
- Неверный JWT_SECRET
- Истекший токен
- Поврежденный токен

**Решение:**
1. Проверьте JWT_SECRET в .env.local
2. Убедитесь, что токен не истек
3. Попробуйте перелогиниться

### Проблема: "Collection not found"

**Возможные причины:**
- Коллекции создаются автоматически при первом использовании
- Проблемы с правами доступа

**Решение:**
1. Создайте первую запись через API
2. Проверьте права пользователя базы данных

## 📈 Мониторинг

### 1. MongoDB Atlas Dashboard

- **Отслеживайте использование** ресурсов
- **Мониторьте производительность** запросов
- **Проверяйте логи** подключений

### 2. Логи приложения

```javascript
// Добавьте логирование в API
console.log('Database operation:', operation, 'result:', result);
```

## 🔄 Резервное копирование

### 1. Автоматические бэкапы

MongoDB Atlas предоставляет автоматические бэкапы:
- **Ежедневные** бэкапы
- **Хранение** до 7 дней
- **Point-in-time** восстановление

### 2. Экспорт данных

```bash
# Экспорт коллекции
mongodump --uri="your-connection-string" --collection=users --db=dcalendar

# Импорт данных
mongorestore --uri="your-connection-string" dump/
```

## 📚 Полезные ссылки

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [JWT.io](https://jwt.io/) - для тестирования JWT токенов

---

**Успешной настройки базы данных! 🗄️✨**
