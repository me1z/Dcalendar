import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Tag, Bell, MapPin, User, Star } from 'lucide-react'

function EventForm({ onSubmit, onClose, event, selectedDate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'task',
    priority: 'medium',
    location: '',
    reminder: { enabled: false, time: 15 }
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        type: event.type || 'task',
        priority: event.priority || 'medium',
        location: event.location || '',
        reminder: event.reminder || { enabled: false, time: 15 }
      })
    } else {
      // Устанавливаем выбранную дату или сегодняшнюю по умолчанию
      let defaultDate
      if (selectedDate) {
        // Если есть выбранная дата из календаря, используем её
        defaultDate = selectedDate.toISOString().split('T')[0]
      } else {
        // Иначе используем сегодняшнюю дату
        defaultDate = new Date().toISOString().split('T')[0]
      }
      setFormData(prev => ({ ...prev, date: defaultDate, type: 'task' }))
    }
  }, [event, selectedDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.date) return

    const eventData = {
      ...formData,
      date: formData.date + (formData.time ? `T${formData.time}` : 'T00:00')
    }

    onSubmit(eventData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleReminderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      reminder: {
        ...prev.reminder,
        [field]: value
      }
    }))
  }

     return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 safe-area-all">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event ? 'Редактировать' : 'Новая задача'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="input w-full text-lg"
              placeholder="Название задачи"
              required
              autoFocus
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Дата
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input w-full text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Время
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="input w-full text-sm"
              />
            </div>
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Тип
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="input w-full text-sm"
              >
                <option value="task">Задача</option>
                <option value="event">Событие</option>
                <option value="reminder">Напоминание</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="input w-full text-sm"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input w-full h-16 resize-none text-sm"
              placeholder="Описание (необязательно)"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Место
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="input w-full text-sm"
              placeholder="Место проведения"
            />
          </div>

          {/* Quick Reminder Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Напоминание</span>
            </div>
            <input
              type="checkbox"
              checked={formData.reminder.enabled}
              onChange={(e) => handleReminderChange('enabled', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* Reminder Time (if enabled) */}
          {formData.reminder.enabled && (
            <div>
              <select
                value={formData.reminder.time}
                onChange={(e) => handleReminderChange('time', parseInt(e.target.value))}
                className="input w-full text-sm"
              >
                <option value={5}>За 5 минут</option>
                <option value={15}>За 15 минут</option>
                <option value={30}>За 30 минут</option>
                <option value={60}>За 1 час</option>
                <option value={1440}>За 1 день</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg font-medium"
          >
            {event ? 'Обновить' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EventForm
