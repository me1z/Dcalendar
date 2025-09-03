import React, { useState } from 'react'
import { Users, Copy, Check, X, Link, UserPlus } from 'lucide-react'
import { usePairSync } from '../hooks/usePairSync'

function PairSetup({ onClose }) {
  const [mode, setMode] = useState('menu') // menu, create, join
  const [joinCode, setJoinCode] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const {
    pairCode,
    isPaired,
    partnerInfo,
    syncStatus,
    generatePairCode,
    connectToPair,
    disconnectFromPair
  } = usePairSync()

  const handleCreatePair = () => {
    const code = generatePairCode()
    setMode('create')
  }

  const handleJoinPair = () => {
    setMode('join')
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
    if (confirm('Вы уверены, что хотите отключиться от пары?')) {
      disconnectFromPair()
      setMode('menu')
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
              setMode('menu')
              onClose()
            }}
            className="btn-primary w-full"
          >
            Продолжить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Вы подключены к паре
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Партнер: {partnerInfo?.name || 'Неизвестно'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisconnect}
                      className="btn-secondary flex-1"
                    >
                      Отключиться
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-primary flex-1"
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
