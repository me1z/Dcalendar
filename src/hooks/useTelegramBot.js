import { useState, useEffect, useCallback } from 'react'

export function useTelegramBot() {
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [botInfo, setBotInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Инициализация при загрузке
  useEffect(() => {
    const savedToken = localStorage.getItem('telegramBotToken')
    const savedChatId = localStorage.getItem('telegramChatId')
    
    if (savedToken && savedChatId) {
      setBotToken(savedToken)
      setChatId(savedChatId)
      checkBotConnection(savedToken, savedChatId)
    }
  }, [])

  // Проверка подключения к боту
  const checkBotConnection = useCallback(async (token, chatId) => {
    if (!token || !chatId) return false
    
    setIsLoading(true)
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
      const data = await response.json()
      
      if (data.ok) {
        setBotInfo(data.result)
        setIsConnected(true)
        return true
      } else {
        setIsConnected(false)
        return false
      }
    } catch (error) {
      console.error('Ошибка проверки подключения к боту:', error)
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Отправка уведомления через Telegram
  const sendNotification = useCallback(async (message, options = {}) => {
    if (!isConnected || !botToken || !chatId) {
      console.warn('Telegram Bot не подключен')
      return false
    }

    try {
      const text = options.parseMode === 'HTML' 
        ? message 
        : message.replace(/[<>&]/g, (char) => {
            const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;' }
            return entities[char]
          })

      const params = new URLSearchParams({
        chat_id: chatId,
        text: text,
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: options.disableWebPagePreview || true
      })

      if (options.replyMarkup) {
        params.append('reply_markup', JSON.stringify(options.replyMarkup))
      }

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })

      const data = await response.json()
      
      if (data.ok) {
        console.log('Уведомление отправлено:', data.result)
        return true
      } else {
        console.error('Ошибка отправки уведомления:', data)
        return false
      }
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error)
      return false
    }
  }, [isConnected, botToken, chatId])

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

    const message = `
${emoji[type]} <b>${typeText[type]}</b>

📅 <b>${event.title}</b>
${event.description ? `📝 ${event.description}\n` : ''}
🕐 ${new Date(event.date).toLocaleString('ru-RU')}
${event.location ? `📍 ${event.location}\n` : ''}
${event.type === 'task' ? `👤 ${event.assignedTo || 'Не назначено'}` : ''}
    `.trim()

    return await sendNotification(message, { parseMode: 'HTML' })
  }, [sendNotification])

  // Отправка уведомления о паре
  const sendPairNotification = useCallback(async (action, partnerName) => {
    const messages = {
      connected: `🔗 <b>Подключение к паре</b>\n\nВы успешно подключились к ${partnerName}!`,
      disconnected: `🔌 <b>Отключение от пары</b>\n\nВы отключились от ${partnerName}.`,
      synced: `🔄 <b>Синхронизация</b>\n\nДанные успешно синхронизированы с ${partnerName}.`
    }

    const message = messages[action] || 'Новое уведомление'
    return await sendNotification(message, { parseMode: 'HTML' })
  }, [sendNotification])

  // Подключение к боту
  const connectBot = useCallback(async (token, chatId) => {
    setIsLoading(true)
    try {
      const success = await checkBotConnection(token, chatId)
      
      if (success) {
        setBotToken(token)
        setChatId(chatId)
        localStorage.setItem('telegramBotToken', token)
        localStorage.setItem('telegramChatId', chatId)
        
        // Отправляем тестовое сообщение
        await sendNotification('🤖 <b>DCalendar подключен!</b>\n\nТеперь вы будете получать уведомления о событиях и задачах.', { parseMode: 'HTML' })
      }
      
      return success
    } catch (error) {
      console.error('Ошибка подключения к боту:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [checkBotConnection, sendNotification])

  // Отключение от бота
  const disconnectBot = useCallback(() => {
    setBotToken('')
    setChatId('')
    setIsConnected(false)
    setBotInfo(null)
    localStorage.removeItem('telegramBotToken')
    localStorage.removeItem('telegramChatId')
  }, [])

  // Получение информации о боте
  const getBotInfo = useCallback(async () => {
    if (!botToken) return null
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      const data = await response.json()
      
      if (data.ok) {
        return data.result
      }
      return null
    } catch (error) {
      console.error('Ошибка получения информации о боте:', error)
      return null
    }
  }, [botToken])

  return {
    botToken,
    chatId,
    isConnected,
    botInfo,
    isLoading,
    sendNotification,
    sendEventNotification,
    sendPairNotification,
    connectBot,
    disconnectBot,
    getBotInfo,
    checkBotConnection
  }
}
