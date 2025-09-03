import { useState, useEffect } from 'react'

export function useTelegramApp() {
  const [tg, setTg] = useState(null)

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramApp = window.Telegram.WebApp
      setTg(telegramApp)
      telegramApp.ready()
    } else {
      console.log('Запущено вне Telegram - режим разработки')
    }
  }, [])

  return { tg }
}
