import { useState, useEffect } from 'react'

export function useTelegramApp() {
  const [tg, setTg] = useState(null)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramApp = window.Telegram.WebApp
      setTg(telegramApp)
      
      // Инициализируем приложение
      telegramApp.ready()
      telegramApp.expand()
      
      // Получаем информацию о пользователе
      if (telegramApp.initDataUnsafe?.user) {
        setUser(telegramApp.initDataUnsafe.user)
      }
      
      // Устанавливаем тему
      setTheme(telegramApp.colorScheme || 'light')
      
      // Слушаем изменения темы
      telegramApp.onEvent('themeChanged', () => {
        setTheme(telegramApp.colorScheme || 'light')
      })
      
      // Слушаем изменения размера окна
      telegramApp.onEvent('viewportChanged', () => {
        telegramApp.expand()
      })
      
    } else {
      console.log('Запущено вне Telegram - режим разработки')
      // Устанавливаем флаг, что мы не в Telegram
      setUser(null)
    }
  }, [])

  const showAlert = (message) => {
    if (tg) {
      tg.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message, callback) => {
    if (tg) {
      tg.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      callback(result)
    }
  }

  const showPopup = (params) => {
    if (tg) {
      tg.showPopup(params)
    } else {
      // Fallback для разработки
      console.log('Popup params:', params)
    }
  }

  const closeApp = () => {
    if (tg) {
      tg.close()
    }
  }

  const requestWriteAccess = () => {
    if (tg) {
      return tg.requestWriteAccess()
    }
    return Promise.resolve(false)
  }

  return { 
    tg, 
    user, 
    theme,
    showAlert,
    showConfirm,
    showPopup,
    closeApp,
    requestWriteAccess
  }
}
