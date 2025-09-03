import { useState, useEffect } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
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

  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return false
    
    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
      
      // Автоматически закрываем уведомление через 5 секунд
      setTimeout(() => {
        notification.close()
      }, 5000)
      
      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }

  const scheduleNotification = (title, options = {}, delay) => {
    if (!isSupported || permission !== 'granted') return null
    
    return setTimeout(() => {
      showNotification(title, options)
    }, delay)
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification
  }
}
