import React, { useState } from 'react'
import { X, Calendar, Clock, User, Tag, FileText, Bell, Star } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function EventForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    priority: 'medium',
    assignedTo: 'both',
    category: 'general',
    reminder: true,
    reminderTime: 15,
    location: '',
    repeat: 'none'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Пожалуйста, введите название')
      return
    }

    const eventData = {
      ...formData,
      date: `${formData.date}T${formData.time}:00`,
      priority: formData.type === 'task' ? formData.priority : undefined,
      category: formData.category === 'general' ? undefined : formData.category
    }

    onSubmit(eventData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const categories = [
    { value: 'general', label: 'Общее', icon: '📅' },
    { value: 'work', label: 'Работа', icon: '💼' },
    { value: 'personal', label: 'Личное', icon: '👤' },
    { value: 'health', label: 'Здоровье', icon: '🏥' },
    { value: 'travel', label: 'Путешествия', icon: '✈️' },
    { value: 'shopping', label: 'Покупки', icon: '🛒' },
    { value: 'family', label: 'Семья', icon: '👨‍👩‍👧‍👦' },
    { value: 'entertainment', label: 'Развлечения', icon: '🎉' }
  ]

  const repeatOptions = [
    { value: 'none', label: 'Не повторять' },
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {formData.type === 'event' ? 'Новое событие' : 'Новая задача'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mobile-tap"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Type Selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleChange('type', 'event')}
              className={`flex-1 py-3 px-3 rounded-lg border transition-colors mobile-tap ${
                formData.type === 'event'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar size={20} />
                <span className="text-sm font-medium">Событие</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'task')}
              className={`flex-1 py-3 px-3 rounded-lg border transition-colors mobile-tap ${
                formData.type === 'task'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Clock size={20} />
                <span className="text-sm font-medium">Задача</span>
              </div>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="input mobile-text"
              placeholder="Введите название"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input resize-none mobile-text"
              rows={3}
              placeholder="Добавьте описание"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input mobile-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="input mobile-text"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Место
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="input mobile-text"
              placeholder="Укажите место проведения"
            />
          </div>

          {/* Priority (for tasks) */}
          {formData.type === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'Низкий', color: 'bg-green-100 text-green-800' },
                  { value: 'medium', label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'high', label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
                  { value: 'urgent', label: 'Срочно', color: 'bg-red-100 text-red-800' }
                ].map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => handleChange('priority', priority.value)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors mobile-tap ${
                      formData.priority === priority.value
                        ? priority.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Назначено
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'me', label: 'Мне', icon: '👤' },
                { value: 'partner', label: 'Партнеру', icon: '👥' },
                { value: 'both', label: 'Нам обоим', icon: '💑' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('assignedTo', option.value)}
                  className={`py-3 px-3 rounded-lg border transition-colors mobile-tap ${
                    formData.assignedTo === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleChange('category', category.value)}
                  className={`py-3 px-2 rounded-lg border transition-colors mobile-tap ${
                    formData.category === category.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs font-medium">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Повторение
            </label>
            <select
              value={formData.repeat}
              onChange={(e) => handleChange('repeat', e.target.value)}
              className="input mobile-text"
            >
              {repeatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder Settings */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Напоминание</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reminder}
                  onChange={(e) => handleChange('reminder', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            {formData.reminder && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Напомнить за:</label>
                <select
                  value={formData.reminderTime}
                  onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={5}>5 минут</option>
                  <option value={15}>15 минут</option>
                  <option value={30}>30 минут</option>
                  <option value={60}>1 час</option>
                  <option value={1440}>1 день</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 mobile-tap"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 mobile-tap"
            >
              {formData.type === 'event' ? 'Создать событие' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm
