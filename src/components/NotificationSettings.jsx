import React, { useState, useEffect } from 'react'
import { Bell, X, Clock, Calendar, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

function NotificationSettings({ onClose }) {
  const [settings, setSettings] = useState({
    browser: true,
    telegram: true,
    events: true,
    tasks: true,
    reminders: true,
    sound: true,
    vibration: true,
    reminderTime: 15,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const {
    isSupported,
    permission,
    telegramSupported,
    requestPermission,
    updateSettings: updateNotificationSettings
  } = useNotifications()

  useEffect(() => {
    // Загружаем настройки
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Ошибка загрузки настроек уведомлений:', error)
      }
    }
  }, [])

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings }
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      newSettings[parent] = { ...newSettings[parent], [child]: value }
    } else {
      newSettings[key] = value
    }
    
    setSettings(newSettings)
    updateNotificationSettings(newSettings)
  }

  const handleRequestPermission = async () => {
    await requestPermission()
  }

  const getStatusIcon = () => {
    if (permission === 'granted') return <CheckCircle className="text-green-500" size={16} />
    if (permission === 'denied') return <AlertCircle className="text-red-500" size={16} />
    return <AlertCircle className="text-yellow-500" size={16} />
  }

  const getStatusText = () => {
    if (permission === 'granted') return 'Разрешено'
    if (permission === 'denied') return 'Заблокировано'
    return 'Не запрошено'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={20} />
            Настройки уведомлений
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Browser Notifications Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Браузерные уведомления</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>
            
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="btn-secondary w-full text-sm"
              >
                Запросить разрешение
              </button>
            )}
          </div>

          {/* Telegram Notifications Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone size={16} />
                Telegram уведомления
              </h3>
              <span className={`text-sm font-medium ${telegramSupported ? 'text-green-600' : 'text-gray-400'}`}>
                {telegramSupported ? 'Доступно' : 'Недоступно'}
              </span>
            </div>
            
            {telegramSupported ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Уведомления будут показываться прямо в Telegram
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Приложение должно быть запущено в Telegram
              </p>
            )}
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Типы уведомлений</h3>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">События</span>
              <input
                type="checkbox"
                checked={settings.events}
                onChange={(e) => handleSettingChange('events', e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Задачи</span>
              <input
                type="checkbox"
                checked={settings.tasks}
                onChange={(e) => handleSettingChange('tasks', e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Напоминания</span>
              <input
                type="checkbox"
                checked={settings.reminders}
                onChange={(e) => handleSettingChange('reminders', e.target.checked)}
                className="toggle"
              />
            </label>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Каналы уведомлений</h3>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Браузер</span>
              <input
                type="checkbox"
                checked={settings.browser}
                onChange={(e) => handleSettingChange('browser', e.target.checked)}
                className="toggle"
                disabled={permission !== 'granted'}
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Telegram</span>
              <input
                type="checkbox"
                checked={settings.telegram}
                onChange={(e) => handleSettingChange('telegram', e.target.checked)}
                className="toggle"
                disabled={!telegramSupported}
              />
            </label>
          </div>

          {/* Reminder Time */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Время напоминания</h3>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-500" />
              <select
                value={settings.reminderTime}
                onChange={(e) => handleSettingChange('reminderTime', Number(e.target.value))}
                className="select flex-1"
              >
                <option value={5}>За 5 минут</option>
                <option value={15}>За 15 минут</option>
                <option value={30}>За 30 минут</option>
                <option value={60}>За 1 час</option>
                <option value={1440}>За 1 день</option>
              </select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Тихие часы</span>
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => handleSettingChange('quietHours.enabled', e.target.checked)}
                className="toggle"
              />
            </label>
            
            {settings.quietHours.enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleSettingChange('quietHours.start', e.target.value)}
                  className="select"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleSettingChange('quietHours.end', e.target.value)}
                  className="select"
                />
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Дополнительно</h3>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Звук</span>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Вибрация</span>
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                className="toggle"
              />
            </label>
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

export default NotificationSettings
