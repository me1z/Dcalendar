import React, { useState } from 'react'
import { X, Calendar, Clock, User, Tag, FileText } from 'lucide-react'
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
    category: 'general'
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
    { value: 'general', label: 'Общее' },
    { value: 'work', label: 'Работа' },
    { value: 'personal', label: 'Личное' },
    { value: 'health', label: 'Здоровье' },
    { value: 'travel', label: 'Путешествия' },
    { value: 'shopping', label: 'Покупки' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {formData.type === 'event' ? 'Новое событие' : 'Новая задача'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
              className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                formData.type === 'event'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Событие
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'task')}
              className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                formData.type === 'task'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Задача
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
              className="input"
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
              className="input resize-none"
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
                className="input"
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
                className="input"
              />
            </div>
          </div>

          {/* Priority (for tasks) */}
          {formData.type === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="input"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочно</option>
              </select>
            </div>
          )}

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Назначено
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              className="input"
            >
              <option value="me">Мне</option>
              <option value="partner">Партнеру</option>
              <option value="both">Нам обоим</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
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
