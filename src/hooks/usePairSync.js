import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function usePairSync() {
  const [pairCode, setPairCode] = useLocalStorage('pairCode', '')
  const [isPaired, setIsPaired] = useState(false)
  const [partnerInfo, setPartnerInfo] = useLocalStorage('partnerInfo', null)
  const [syncStatus, setSyncStatus] = useState('disconnected')

  // Генерируем уникальный код для пары
  const generatePairCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setPairCode(code)
    return code
  }, [setPairCode])

  // Подключение к паре по коду
  const connectToPair = useCallback(async (code) => {
    if (!code || code.length !== 6) {
      throw new Error('Неверный код подключения')
    }

    try {
      setSyncStatus('connecting')
      
      // Имитация API запроса для подключения
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // В реальном приложении здесь будет API запрос
      const mockPartnerInfo = {
        id: Date.now().toString(),
        name: 'Партнер',
        avatar: null,
        lastSeen: new Date().toISOString()
      }
      
      setPartnerInfo(mockPartnerInfo)
      setPairCode(code)
      setIsPaired(true)
      setSyncStatus('connected')
      
      // Уведомляем создателя пары о подключении
      try {
        localStorage.setItem('partnerConnected', 'true')
        // Отправляем событие в localStorage для синхронизации между вкладками
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'partnerConnected',
          newValue: 'true'
        }))
      } catch (error) {
        console.log('Ошибка уведомления о подключении:', error)
      }
      
      // НЕ перезагружаем страницу, а обновляем состояние
      // Страница автоматически перерендерится благодаря React
      
      return mockPartnerInfo
    } catch (error) {
      setSyncStatus('error')
      throw error
    }
  }, [setPairCode])

  // Функция для уведомления о подключении партнера (для создателя пары)
  const notifyPartnerConnected = useCallback(() => {
    // Устанавливаем флаг, что партнер подключился
    localStorage.setItem('partnerConnected', 'true')
    // Принудительно обновляем состояние
    setIsPaired(true)
    setSyncStatus('connected')
  }, [])

  // Отключение от пары
  const disconnectFromPair = useCallback(() => {
    setPairCode('')
    setIsPaired(false)
    setPartnerInfo(null)
    setSyncStatus('disconnected')
  }, [setPairCode])

  // Синхронизация данных с партнером
  const syncData = useCallback(async (data, type) => {
    if (!isPaired) return false
    
    try {
      setSyncStatus('syncing')
      
      // Имитация API запроса для синхронизации
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // В реальном приложении здесь будет API запрос
      console.log(`Синхронизация ${type}:`, data)
      
      // Сохраняем данные в localStorage для синхронизации с партнером
      if (type === 'event') {
        const existingEvents = JSON.parse(localStorage.getItem('events') || '[]')
        
        if (data.action === 'delete') {
          // Удаляем событие
          const updatedEvents = existingEvents.filter(event => event.id !== data.id)
          localStorage.setItem('events', JSON.stringify(updatedEvents))
        } else {
          // Добавляем или обновляем событие
          const eventIndex = existingEvents.findIndex(event => event.id === data.id)
          if (eventIndex !== -1) {
            // Обновляем существующее событие
            existingEvents[eventIndex] = { ...existingEvents[eventIndex], ...data }
          } else {
            // Добавляем новое событие
            existingEvents.push(data)
          }
          localStorage.setItem('events', JSON.stringify(existingEvents))
        }
        
        // Уведомляем партнера о новых данных
        localStorage.setItem('partnerDataUpdated', JSON.stringify({
          type: 'event',
          data: data,
          timestamp: Date.now()
        }))
        
        // Отправляем событие для синхронизации
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'partnerDataUpdated',
          newValue: localStorage.getItem('partnerDataUpdated')
        }))
      }
      
      setSyncStatus('connected')
      return true
    } catch (error) {
      setSyncStatus('error')
      console.error('Ошибка синхронизации:', error)
      return false
    }
  }, [isPaired])

  // Проверяем статус подключения при загрузке
  useEffect(() => {
    if (pairCode && partnerInfo) {
      setIsPaired(true)
      setSyncStatus('connected')
    }
    
    // Проверяем, не подключился ли партнер к создателю
    const partnerConnected = localStorage.getItem('partnerConnected')
    if (pairCode && !partnerInfo && partnerConnected === 'true') {
      // Партнер подключился к создателю
      const mockPartnerInfo = {
        id: Date.now().toString(),
        name: 'Партнер',
        avatar: null,
        lastSeen: new Date().toISOString()
      }
      setPartnerInfo(mockPartnerInfo)
      setIsPaired(true)
      setSyncStatus('connected')
      // Очищаем флаг
      localStorage.removeItem('partnerConnected')
    }
  }, [pairCode, partnerInfo])

  // Дополнительная проверка для создателя пары
  useEffect(() => {
    if (pairCode && !partnerInfo) {
      // Создатель пары - проверяем каждые 2 секунды, не подключился ли партнер
      const interval = setInterval(() => {
        const partnerConnected = localStorage.getItem('partnerConnected')
        if (partnerConnected === 'true') {
          const mockPartnerInfo = {
            id: Date.now().toString(),
            name: 'Партнер',
            avatar: null,
            lastSeen: new Date().toISOString()
          }
          setPartnerInfo(mockPartnerInfo)
          setIsPaired(true)
          setSyncStatus('connected')
          localStorage.removeItem('partnerConnected')
          clearInterval(interval)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [pairCode, partnerInfo])

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'partnerConnected' && e.newValue === 'true') {
        if (pairCode && !partnerInfo) {
          // Партнер подключился к создателю
          const mockPartnerInfo = {
            id: Date.now().toString(),
            name: 'Партнер',
            avatar: null,
            lastSeen: new Date().toISOString()
          }
          setPartnerInfo(mockPartnerInfo)
          setIsPaired(true)
          setSyncStatus('connected')
        }
      }
      
      // Слушаем обновления данных от партнера
      if (e.key === 'partnerDataUpdated' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue)
          if (updateData.type === 'event' && isPaired) {
            // Обновляем события в localStorage
            const existingEvents = JSON.parse(localStorage.getItem('events') || '[]')
            
            if (updateData.data.action === 'delete') {
              // Удаляем событие
              const updatedEvents = existingEvents.filter(event => event.id !== updateData.data.id)
              localStorage.setItem('events', JSON.stringify(updatedEvents))
            } else {
              // Добавляем или обновляем событие
              const eventIndex = existingEvents.findIndex(event => event.id === updateData.data.id)
              if (eventIndex !== -1) {
                // Обновляем существующее событие
                existingEvents[eventIndex] = { ...existingEvents[eventIndex], ...updateData.data }
              } else {
                // Добавляем новое событие
                existingEvents.push(updateData.data)
              }
              localStorage.setItem('events', JSON.stringify(updatedEvents))
            }
            
            // Уведомляем компоненты об обновлении
            window.dispatchEvent(new CustomEvent('eventsUpdated', {
              detail: { events: existingEvents }
            }))
          }
        } catch (error) {
          console.error('Ошибка обработки данных партнера:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [pairCode, partnerInfo, isPaired])

  return {
    pairCode,
    isPaired,
    partnerInfo,
    syncStatus,
    generatePairCode,
    connectToPair,
    disconnectFromPair,
    syncData,
    notifyPartnerConnected
  }
}
