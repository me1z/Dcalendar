import { useState, useEffect, useCallback } from 'react'
import { useTelegramNotifications } from './useTelegramNotifications'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)
  const [settings, setSettings] = useState({
    browser: true,
    telegram: true,
    events: true,
    tasks: true,
    reminders: true,
    sound: true,
    vibration: true,
    reminderTime: 15,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const { 
    isSupported: telegramSupported,
    sendNotification: sendTelegramNotification,
    sendEventNotification: sendTelegramEventNotification,
    scheduleNotification: scheduleTelegramNotification
  } = useTelegramNotifications()

  useEffect(() => {
    setIsSupported('Notification' in window || telegramSupported)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    
    // Загружаем настройки
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Ошибка загрузки настроек уведомлений:', error)
      }
    }
  }, [telegramSupported])

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Ошибка запроса разрешения:', error)
      return false
    }
  }, [])

  // Отправка уведомления в браузере
  const sendBrowserNotification = useCallback(async (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      })

      // Автоматически закрываем через 5 секунд
      setTimeout(() => {
        notification.close()
      }, 5000)

      return true
    } catch (error) {
      console.error('Ошибка отправки браузерного уведомления:', error)
      return false
    }
  }, [])

  // Отправка уведомления о событии
  const sendEventNotification = useCallback(async (event, type = 'reminder') => {
    const emoji = {
      reminder: '⏰',
      created: '✨',
      updated: '✏️',
      completed: '✅',
      overdue: '🚨'
    }

    const typeText = {
      reminder: 'Напоминание',
      created: 'Создано',
      updated: 'Обновлено',
      completed: 'Завершено',
      overdue: 'Просрочено'
    }

    const title = `${emoji[type]} ${typeText[type]}`
    const body = `
📅 ${event.title}
${event.description ? `📝 ${event.description}\n` : ''}
🕐 ${new Date(event.date).toLocaleString('ru-RU')}
${event.location ? `📍 ${event.location}\n` : ''}
${event.type === 'task' ? `👤 ${event.assignedTo || 'Не назначено'}` : ''}
    `.trim()

    let success = false

    // Отправляем в Telegram если включено и поддерживается
    if (settings.telegram && telegramSupported) {
      success = await sendTelegramEventNotification(event, type)
    }

    // Отправляем в браузер если включено
    if (settings.browser) {
      const browserSuccess = await sendBrowserNotification(title, { body })
      success = success || browserSuccess
    }

    return success
  }, [settings, telegramSupported, sendTelegramEventNotification, sendBrowserNotification])

  // Отправка уведомления о паре
  const sendPairNotification = useCallback(async (action, partnerName) => {
    const messages = {
      created: `🔗 Подключение к паре\n\nВы успешно подключились к ${partnerName}!`,
      connected: `🔗 Подключение к паре\n\nВы успешно подключились к ${partnerName}!`,
      disconnected: `🔌 Отключение от пары\n\nВы отключились от ${partnerName}.`,
      synced: `🔄 Синхронизация\n\nДанные успешно синхронизированы с ${partnerName}.`
    }

    const message = messages[action] || 'Новое уведомление'
    let success = false

    // Отправляем в Telegram если включено и поддерживается
    if (settings.telegram && telegramSupported) {
      success = await sendTelegramNotification('Уведомление', { body: message })
    }

    // Отправляем в браузер если включено
    if (settings.browser) {
      const browserSuccess = await sendBrowserNotification('Уведомление', { body: message })
      success = success || browserSuccess
    }

    return success
  }, [settings, telegramSupported, sendTelegramNotification, sendBrowserNotification])

  // Умная отправка уведомлений (выбирает лучший способ)
  const sendSmartNotification = useCallback(async (title, options = {}, type = 'notification') => {
    let success = false

    // Отправляем в Telegram если включено и поддерживается
    if (settings.telegram && telegramSupported) {
      success = await sendTelegramNotification(title, options)
    }

    // Отправляем в браузер если включено
    if (settings.browser) {
      const browserSuccess = await sendBrowserNotification(title, options)
      success = success || browserSuccess
    }

    return success
  }, [settings, telegramSupported, sendTelegramNotification, sendBrowserNotification])

  // Планирование уведомлений
  const scheduleNotification = useCallback(async (title, options = {}, delay) => {
    if (delay <= 0) {
      return await sendSmartNotification(title, options)
    }

    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await sendSmartNotification(title, options)
        resolve(result)
      }, delay)
    })
  }, [sendSmartNotification])

  // Обновление настроек
  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings))
  }, [settings])

  // Проверка тихих часов
  const isInQuietHours = useCallback(() => {
    if (!settings.quietHours.enabled) return false
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Переход через полночь
      return currentTime >= startTime || currentTime <= endTime
    }
  }, [settings.quietHours])

  return {
    isSupported,
    permission,
    settings,
    telegramSupported,
    requestPermission,
    sendNotification: sendSmartNotification,
    sendEventNotification,
    sendPairNotification,
    scheduleNotification,
    updateSettings,
    isInQuietHours
  }
}
