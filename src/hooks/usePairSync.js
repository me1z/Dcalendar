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
      
      // Принудительно обновляем состояние
      setTimeout(() => {
        window.location.reload()
      }, 500)
      
      return mockPartnerInfo
    } catch (error) {
      setSyncStatus('error')
      throw error
    }
  }, [setPairCode])

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
  }, [pairCode, partnerInfo])

  return {
    pairCode,
    isPaired,
    partnerInfo,
    syncStatus,
    generatePairCode,
    connectToPair,
    disconnectFromPair,
    syncData
  }
}
