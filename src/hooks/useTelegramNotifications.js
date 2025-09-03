import { useState, useEffect, useCallback } from 'react'

export function useTelegramNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [webApp, setWebApp] = useState(null)

  useEffect(() => {
    // Проверяем, что приложение запущено в Telegram
    if (window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp)
      setIsSupported(true)
    }
  }, [])

  // Отправка уведомления через Telegram
  const sendNotification = useCallback(async (title, options = {}) => {
    if (!webApp || !isSupported) {
      console.warn('Telegram Web App не поддерживается')
      return false
    }

    try {
      // Используем Telegram Web App API для показа уведомлений
      if (webApp.showAlert) {
        webApp.showAlert(`${title}\n\n${options.body || ''}`)
        return true
      }

      // Альтернативный способ - через showPopup
      if (webApp.showPopup) {
        webApp.showPopup({
          title: title,
          message: options.body || '',
          buttons: [
            { id: 'ok', type: 'ok', text: 'OK' }
          ]
        })
        return true
      }

      return false
    } catch (error) {
      console.error('Ошибка отправки уведомления через Telegram:', error)
      return false
    }
  }, [webApp, isSupported])

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

    return await sendNotification(title, { body })
  }, [sendNotification])

  // Отправка уведомления о паре
  const sendPairNotification = useCallback(async (action, partnerName) => {
    const messages = {
      connected: `🔗 Подключение к паре\n\nВы успешно подключились к ${partnerName}!`,
      disconnected: `🔌 Отключение от пары\n\nВы отключились от ${partnerName}.`,
      synced: `🔄 Синхронизация\n\nДанные успешно синхронизированы с ${partnerName}.`
    }

    const message = messages[action] || 'Новое уведомление'
    return await sendNotification('Уведомление', { body: message })
  }, [sendNotification])

  // Планирование уведомлений
  const scheduleNotification = useCallback(async (title, options = {}, delay) => {
    if (delay <= 0) {
      return await sendNotification(title, options)
    }

    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await sendNotification(title, options)
        resolve(result)
      }, delay)
    })
  }, [sendNotification])

  return {
    isSupported,
    webApp,
    sendNotification,
    sendEventNotification,
    sendPairNotification,
    scheduleNotification
  }
}
