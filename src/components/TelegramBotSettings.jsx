import React, { useState } from 'react'
import { Bot, X, TestTube, Key, MessageCircle, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useTelegramBot } from '../hooks/useTelegramBot'

function TelegramBotSettings({ onClose }) {
  const [token, setToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [showToken, setShowToken] = useState(false)
  
  const {
    botToken,
    chatId: currentChatId,
    isConnected,
    botInfo,
    isLoading,
    connectBot,
    disconnectBot,
    sendNotification
  } = useTelegramBot()

  const handleConnect = async () => {
    if (!token.trim() || !chatId.trim()) return
    
    try {
      const success = await connectBot(token.trim(), chatId.trim())
      if (success) {
        setToken('')
        setChatId('')
      }
    } catch (error) {
      alert('Ошибка подключения: ' + error.message)
    }
  }

  const handleDisconnect = () => {
    if (confirm('Вы уверены, что хотите отключить Telegram Bot?')) {
      disconnectBot()
    }
  }

  const handleTestMessage = async () => {
    if (!isConnected) return
    
    try {
      const success = await sendNotification('🧪 <b>Тестовое сообщение</b>\n\nЕсли вы видите это сообщение, значит Telegram Bot работает корректно!', { parseMode: 'HTML' })
      
      if (success) {
        alert('Тестовое сообщение отправлено! Проверьте Telegram.')
      } else {
        alert('Ошибка отправки тестового сообщения.')
      }
    } catch (error) {
      alert('Ошибка: ' + error.message)
    }
  }

  const getConnectionStatus = () => {
    if (isLoading) return { color: 'text-blue-600', text: 'Проверка...', icon: Loader2 }
    if (isConnected) return { color: 'text-green-600', text: 'Подключен', icon: Check }
    if (botToken && currentChatId) return { color: 'text-yellow-600', text: 'Ошибка подключения', icon: AlertCircle }
    return { color: 'text-gray-400', text: 'Не подключен', icon: X }
  }

  const status = getConnectionStatus()
  const StatusIcon = status.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot size={20} />
            Настройки Telegram Bot
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Статус подключения</h3>
              <span className={`text-sm font-medium ${status.color} flex items-center gap-2`}>
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <StatusIcon size={16} />
                )}
                {status.text}
              </span>
            </div>
            
            {isConnected && botInfo && (
              <div className="text-sm text-gray-600">
                <p>Бот: @{botInfo.username}</p>
                <p>Имя: {botInfo.first_name}</p>
                {botInfo.last_name && <p>Фамилия: {botInfo.last_name}</p>}
              </div>
            )}
          </div>

          {/* Connection Form */}
          {!isConnected && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Подключение к боту</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Токен бота
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="input pr-10"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    {showToken ? <X size={16} /> : <Key size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Получите токен у @BotFather в Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID чата
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="input"
                  placeholder="123456789"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID вашего чата с ботом (можно узнать у @userinfobot)
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={!token.trim() || !chatId.trim() || isLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Подключение...
                  </div>
                ) : (
                  'Подключиться'
                )}
              </button>
            </div>
          )}

          {/* Connected Actions */}
          {isConnected && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Действия</h3>
              
              <button
                onClick={handleTestMessage}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <TestTube size={16} />
                Отправить тестовое сообщение
              </button>
              
              <button
                onClick={handleDisconnect}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <X size={16} />
                Отключиться от бота
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Как настроить бота:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Напишите @BotFather в Telegram</li>
              <li>Отправьте команду /newbot</li>
              <li>Следуйте инструкциям для создания бота</li>
              <li>Скопируйте токен бота</li>
              <li>Начните чат с вашим ботом</li>
              <li>Получите ID чата у @userinfobot</li>
              <li>Введите данные выше и подключитесь</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelegramBotSettings
