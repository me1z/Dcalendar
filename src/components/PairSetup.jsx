import React, { useState } from 'react'
import { Users, Copy, Check, X, Link, UserPlus, Info, Trash2, AlertCircle } from 'lucide-react'
import { usePairSync } from '../hooks/usePairSync'

function PairSetup({ onClose, onPairCreated }) {
  const [mode, setMode] = useState('menu') // menu, create, join, info
  const [joinCode, setJoinCode] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const {
    pairCode,
    isPaired,
    partnerInfo,
    syncStatus,
    generatePairCode,
    connectToPair,
    disconnectFromPair,
    notifyPartnerConnected
  } = usePairSync()

  const handleCreatePair = () => {
    generatePairCode()
    setMode('create')
    
    // Запускаем проверку подключения партнера
    const checkPartnerConnection = setInterval(() => {
      if (isPaired && partnerInfo) {
        clearInterval(checkPartnerConnection)
        // Партнер подключился, закрываем модальное окно
        if (onPairCreated) {
          onPairCreated()
        } else {
          onClose()
        }
      }
    }, 1000)
    
    // Останавливаем проверку через 5 минут
    setTimeout(() => {
      clearInterval(checkPartnerConnection)
    }, 5 * 60 * 1000)
  }

  const handleJoinPair = () => {
    setMode('join')
  }

  const handleShowPairInfo = () => {
    setMode('info')
  }

  const handleConnect = async () => {
    if (!joinCode.trim()) return
    
    setIsConnecting(true)
    try {
      await connectToPair(joinCode.trim())
      setMode('success')
    } catch (error) {
      alert(error.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pairCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
    }
  }

  const handleDisconnect = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDisconnect = () => {
    disconnectFromPair()
    setShowDeleteConfirm(false)
    setMode('menu')
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'connecting': return 'text-yellow-600 bg-yellow-100'
      case 'syncing': return 'text-blue-600 bg-blue-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = () => {
    switch (syncStatus) {
      case 'connected': return 'Подключено'
      case 'connecting': return 'Подключение...'
      case 'syncing': return 'Синхронизация...'
      case 'error': return 'Ошибка'
      default: return 'Отключено'
    }
  }

  if (mode === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Подключение успешно!
          </h3>
          <p className="text-gray-600 mb-6">
            Теперь вы можете синхронизировать события с партнером
          </p>
          <button
            onClick={() => {
              if (onPairCreated) {
                onPairCreated()
              } else {
                setMode('menu')
                onClose()
              }
            }}
            className="btn-primary w-full"
          >
            Продолжить
          </button>
        </div>
      </div>
    )
  }

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Удалить пару?
          </h3>
          <p className="text-gray-600 mb-6">
            Это действие нельзя отменить. Все данные о паре будут удалены.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              onClick={confirmDisconnect}
              className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    )
  }

     return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 safe-area-all">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto iphone-no-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} />
            Настройка пары
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {mode === 'menu' && (
            <div className="space-y-4">
              {isPaired ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Вы подключены к паре
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Партнер: {partnerInfo?.name || 'Неизвестно'}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                      <span>{getStatusLabel()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleShowPairInfo}
                      className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                      <Info size={20} />
                      Информация о паре
                    </button>
                    
                    <button
                      onClick={handleDisconnect}
                      className="w-full btn-secondary flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                      Удалить пару
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="w-full btn-primary"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center py-4">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Создайте или присоединитесь к паре
                    </h3>
                    <p className="text-gray-600">
                      Синхронизируйте события с вашим партнером
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleCreatePair}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Link size={20} />
                      Создать пару
                    </button>
                    
                    <button
                      onClick={handleJoinPair}
                      className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                      <UserPlus size={20} />
                      Присоединиться к паре
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {mode === 'info' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Info className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Информация о паре
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Статус:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {getStatusLabel()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Партнер:</span>
                  <span className="text-sm text-gray-900">{partnerInfo?.name || 'Неизвестно'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">ID пары:</span>
                  <span className="text-sm font-mono text-gray-900">{pairCode}</span>
                </div>
                
                {partnerInfo?.lastSeen && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Последний раз:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(partnerInfo.lastSeen).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMode('menu')}
                  className="btn-secondary flex-1"
                >
                  Назад
                </button>
                <button
                  onClick={onClose}
                  className="btn-primary flex-1"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Link className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Создание пары
                </h3>
                <p className="text-gray-600">
                  Поделитесь этим кодом с партнером
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-mono font-bold text-gray-900 mb-2 tracking-wider">
                  {pairCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="btn-secondary flex items-center gap-2 mx-auto"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Скопировать
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Как подключиться:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Отправьте код партнеру</li>
                  <li>Партнер вводит код в своем приложении</li>
                  <li>Соединение установится автоматически</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMode('menu')}
                  className="btn-secondary flex-1"
                >
                  Назад
                </button>
                <button
                  onClick={onClose}
                  className="btn-primary flex-1"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <UserPlus className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Присоединение к паре
                </h3>
                <p className="text-gray-600">
                  Введите код, полученный от партнера
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код подключения
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="input text-center text-lg font-mono tracking-wider"
                  placeholder="ABCDEF"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMode('menu')}
                  className="btn-secondary flex-1"
                >
                  Назад
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!joinCode.trim() || isConnecting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Подключение...' : 'Подключиться'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PairSetup
