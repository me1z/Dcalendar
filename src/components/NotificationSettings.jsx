import React, { useState } from 'react'
import { Bell, X, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

function NotificationSettings({ onClose }) {
  const [settings, setSettings] = useState({
    enabled: true,
    events: true,
    tasks: true,
    reminders: true,
    sound: true,
    vibration: true,
    reminderTime: 15, // минуты до события
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const {
    isSupported,
    permission,
    requestPermission
  } = useNotifications()

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleQuietHoursChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }))
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      alert('Разрешение на уведомления получено!')
    } else {
      alert('Разрешение на уведомления не получено. Проверьте настройки браузера.')
    }
  }

  const getPermissionStatus = () => {
    if (!isSupported) return 'not-supported'
    return permission
  }

  const getPermissionColor = (status) => {
    switch (status) {
      case 'granted': return 'text-green-600'
      case 'denied': return 'text-red-600'
      case 'default': return 'text-yellow-600'
      default: return 'text-gray-400'
    }
  }

  const getPermissionLabel = (status) => {
    switch (status) {
      case 'granted': return 'Разрешено'
      case 'denied': return 'Запрещено'
      case 'default': return 'Не запрошено'
      default: return 'Не поддерживается'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={20} />
            Настройки уведомлений
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Permission Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Статус разрешений</h3>
              <span className={`text-sm font-medium ${getPermissionColor(getPermissionStatus())}`}>
                {getPermissionLabel(getPermissionStatus())}
              </span>
            </div>
            
            {getPermissionStatus() === 'default' && (
              <button
                onClick={handleRequestPermission}
                className="btn-primary w-full"
              >
                Запросить разрешение
              </button>
            )}
            
            {getPermissionStatus() === 'denied' && (
              <p className="text-sm text-red-600">
                Разрешение запрещено. Измените настройки браузера, чтобы получать уведомления.
              </p>
            )}
          </div>

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Общие настройки</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Уведомления</div>
                  <div className="text-sm text-gray-600">Включить все уведомления</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">События</div>
                  <div className="text-sm text-gray-600">Уведомления о событиях</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.events}
                  disabled={!settings.enabled}
                  onChange={(e) => handleSettingChange('events', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                  settings.enabled ? 'bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300' : 'bg-gray-100'
                }`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Задачи</div>
                  <div className="text-sm text-gray-600">Уведомления о задачах</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tasks}
                  disabled={!settings.enabled}
                  onChange={(e) => handleSettingChange('tasks', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                  settings.enabled ? 'bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300' : 'bg-gray-100'
                }`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Напоминания</div>
                  <div className="text-sm text-gray-600">Напоминания о событиях</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminders}
                  disabled={!settings.enabled}
                  onChange={(e) => handleSettingChange('reminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                  settings.enabled ? 'bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300' : 'bg-gray-100'
                }`}></div>
              </label>
            </div>
          </div>

          {/* Reminder Time */}
          {settings.reminders && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Время напоминания</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Напомнить за:</label>
                <select
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange('reminderTime', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={5}>5 минут</option>
                  <option value={15}>15 минут</option>
                  <option value={30}>30 минут</option>
                  <option value={60}>1 час</option>
                  <option value={1440}>1 день</option>
                </select>
              </div>
            </div>
          )}

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Тихие часы</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Начало
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Конец
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Дополнительно</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Звук</div>
                  <div className="text-sm text-gray-600">Звуковые уведомления</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  disabled={!settings.enabled}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                  settings.enabled ? 'bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300' : 'bg-gray-100'
                }`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Вибрация</div>
                  <div className="text-sm text-gray-600">Вибрация при уведомлениях</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.vibration}
                  disabled={!settings.enabled}
                  onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${
                  settings.enabled ? 'bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300' : 'bg-gray-100'
                }`}></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                // Сохраняем настройки
                localStorage.setItem('notificationSettings', JSON.stringify(settings))
                onClose()
              }}
              className="btn-primary flex-1"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
