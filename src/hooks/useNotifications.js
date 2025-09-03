import { useState, useEffect, useCallback } from 'react'
import { useTelegramBot } from './useTelegramBot'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)
  const [settings, setSettings] = useState({
    browser: true,
    telegram: false,
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

  const { sendEventNotification } = useTelegramBot()

  useEffect(() => {
    setIsSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    
    // Загружаем настройки
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const showNotification = useCallback(async (title, options = {}, type = 'browser') => {
    let success = false

    // Браузерные уведомления
    if (type === 'browser' && settings.browser && isSupported && permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        })
        
        setTimeout(() => {
          notification.close()
        }, 5000)
        
        success = true
      } catch (error) {
        console.error('Error showing browser notification:', error)
      }
    }

    // Telegram уведомления
    if (type === 'telegram' && settings.telegram) {
      success = await sendEventNotification({
        title,
        description: options.body || '',
        date: new Date().toISOString(),
        type: 'notification'
      }, 'created')
    }

    return success
  }, [isSupported, permission, settings.browser, settings.telegram, sendEventNotification])

  const scheduleNotification = useCallback(async (title, options = {}, delay, type = 'browser') => {
    if (type === 'browser' && (!isSupported || permission !== 'granted')) return null
    
    return setTimeout(() => {
      showNotification(title, options, type)
    }, delay)
  }, [isSupported, permission, showNotification])

  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings))
  }, [settings])

  const isQuietHours = useCallback(() => {
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

  const sendSmartNotification = useCallback(async (title, options = {}, eventType = 'event') => {
    // Проверяем тихие часы
    if (isQuietHours()) {
      console.log('Тихие часы - уведомление отложено')
      return false
    }

    // Проверяем настройки для типа события
    if (eventType === 'event' && !settings.events) return false
    if (eventType === 'task' && !settings.tasks) return false
    if (eventType === 'reminder' && !settings.reminders) return false

    let success = false

    // Отправляем в браузер
    if (settings.browser) {
      success = await showNotification(title, options, 'browser')
    }

    // Отправляем в Telegram
    if (settings.telegram) {
      const telegramSuccess = await showNotification(title, options, 'telegram')
      success = success || telegramSuccess
    }

    return success
  }, [isQuietHours, settings, showNotification])

  return {
    isSupported,
    permission,
    settings,
    requestPermission,
    showNotification,
    scheduleNotification,
    updateSettings,
    sendSmartNotification,
    isQuietHours
  }
}
