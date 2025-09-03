import React from 'react'
import { X, CheckCircle, Circle, Calendar, Clock, Tag, MapPin, Bell, Star } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function EventView({ event, onClose, onToggle, onEdit }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return <Star size={16} className="text-green-600" />
      case 'medium': return <Star size={16} className="text-yellow-600" />
      case 'high': return <Star size={16} className="text-orange-600" />
      default: return <Star size={16} className="text-gray-600" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return <CheckCircle size={20} className="text-blue-600" />
      case 'event': return <Calendar size={20} className="text-green-600" />
      case 'reminder': return <Bell size={20} className="text-orange-600" />
      default: return <Calendar size={20} className="text-gray-600" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'task': return 'Задача'
      case 'event': return 'Событие'
      case 'reminder': return 'Напоминание'
      default: return 'Событие'
    }
  }

     return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-all">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {getTypeIcon(event.type)}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTypeLabel(event.type)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar size={16} />
            <span className="text-sm">
              {format(new Date(event.date), 'EEEE, d MMMM yyyy', { locale: ru })}
            </span>
          </div>

          {event.time && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span className="text-sm">
                {format(new Date(event.date), 'HH:mm')}
              </span>
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center gap-2">
            {getPriorityIcon(event.priority)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
              {event.priority === 'low' && 'Низкий'}
              {event.priority === 'medium' && 'Средний'}
              {event.priority === 'high' && 'Высокий'}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin size={16} />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          {/* Reminder */}
          {event.reminder?.enabled && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Bell size={16} />
              <span className="text-sm">
                Напомнить за {event.reminder.time} минут
              </span>
            </div>
          )}

          {/* Completion Status */}
          {event.type === 'task' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Статус выполнения
                </span>
                <button
                  onClick={() => onToggle(event.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {event.completed ? (
                    <CheckCircle size={24} className="text-green-600" />
                  ) : (
                    <Circle size={24} className="text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {event.completed ? 'Задача выполнена' : 'Задача не выполнена'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {event.type === 'task' && (
              <button
                onClick={() => onToggle(event.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  event.completed
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {event.completed ? 'Отменить выполнение' : 'Отметить выполненной'}
              </button>
            )}
            <button
              onClick={() => onEdit(event)}
              className="btn-secondary flex-1"
            >
              Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventView
