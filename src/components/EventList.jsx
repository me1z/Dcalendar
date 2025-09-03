import React, { useState, useMemo } from 'react'
import { CheckCircle, Circle, Trash2, Calendar, Clock, User, Tag, Star, Filter, Search, MapPin, Bell } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

function EventList({ events, onToggle, onDelete }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filter === 'completed') {
      filtered = filtered.filter(event => event.completed)
    } else if (filter === 'pending') {
      filtered = filtered.filter(event => !event.completed)
    } else if (filter === 'overdue') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate < new Date() && !event.completed && event.type === 'task'
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date)
        case 'priority':
          if (a.type !== 'task' || b.type !== 'task') return 0
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'assigned':
          return a.assignedTo.localeCompare(b.assignedTo)
        default:
          return 0
      }
    })

    return filtered
  }, [events, filter, sortBy, searchQuery])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Срочно'
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return ''
    }
  }

  const getDateLabel = (date) => {
    const eventDate = parseISO(date)
    if (isToday(eventDate)) return 'Сегодня'
    if (isTomorrow(eventDate)) return 'Завтра'
    if (isYesterday(eventDate)) return 'Вчера'
    return format(eventDate, 'd MMMM', { locale: ru })
  }

  const getAssignedToLabel = (assignedTo) => {
    switch (assignedTo) {
      case 'me': return 'Мне'
      case 'partner': return 'Партнеру'
      case 'both': return 'Нам обоим'
      default: return assignedTo
    }
  }

  const getAssignedToIcon = (assignedTo) => {
    switch (assignedTo) {
      case 'me': return '👤'
      case 'partner': return '👥'
      case 'both': return '💑'
      default: return '👤'
    }
  }

  const getCategoryLabel = (category) => {
    const categories = {
      general: 'Общее',
      work: 'Работа',
      personal: 'Личное',
      health: 'Здоровье',
      travel: 'Путешествия',
      shopping: 'Покупки',
      family: 'Семья',
      entertainment: 'Развлечения'
    }
    return categories[category] || category
  }

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📅',
      work: '💼',
      personal: '👤',
      health: '🏥',
      travel: '✈️',
      shopping: '🛒',
      family: '👨‍👩‍👧‍👦',
      entertainment: '🎉'
    }
    return icons[category] || '📅'
  }

  const handleDelete = (eventId) => {
    if (confirm('Вы уверены, что хотите удалить это событие?')) {
      onDelete(eventId)
    }
  }

  const isOverdue = (event) => {
    const eventDate = new Date(event.date)
    return eventDate < new Date() && !event.completed && event.type === 'task'
  }

  return (
    <div className="p-4 pb-20">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mobile-title">
            {events.length === 0 ? 'Нет событий' : `${events.length} событий`}
          </h2>
          <div className="text-sm text-gray-600">
            {events.filter(e => e.completed).length} выполнено
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 mobile-text"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mobile-tap"
          >
            <Filter size={16} />
            Фильтры
          </button>
          
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-primary-600 hover:text-primary-700 mobile-tap"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Filters and Sort */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Все</option>
                <option value="pending">Ожидающие</option>
                <option value="completed">Выполненные</option>
                <option value="overdue">Просроченные</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="date">По дате</option>
                <option value="priority">По приоритету</option>
                <option value="title">По названию</option>
                <option value="created">По созданию</option>
                <option value="assigned">По назначению</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredAndSortedEvents.map(event => {
          const overdue = isOverdue(event)
          return (
            <div
              key={event.id}
              className={`card transition-all duration-200 ${
                event.completed ? 'opacity-75' : ''
              } ${overdue ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggle(event.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors mobile-tap"
                  >
                    {event.completed ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Circle size={20} className="text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.type === 'event' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {event.type === 'event' ? 'Событие' : 'Задача'}
                    </span>
                    
                    {event.type === 'task' && event.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(event.priority)}`}>
                        {getPriorityLabel(event.priority)}
                      </span>
                    )}

                    {overdue && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                        Просрочено
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors mobile-tap"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Event Content */}
              <div className="mb-3">
                <h3 className={`font-medium text-gray-900 mb-1 ${
                  event.completed ? 'line-through' : ''
                }`}>
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {event.description}
                  </p>
                )}

                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{getDateLabel(event.date)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{format(parseISO(event.date), 'HH:mm')}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span>{getAssignedToIcon(event.assignedTo)}</span>
                  <span>{getAssignedToLabel(event.assignedTo)}</span>
                </div>
                
                {event.category && event.category !== 'general' && (
                  <div className="flex items-center gap-1">
                    <span>{getCategoryIcon(event.category)}</span>
                    <span>{getCategoryLabel(event.category)}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {event.repeat && event.repeat !== 'none' && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>🔄</span>
                    <span>Повторяется: {event.repeat}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>События не найдены</p>
            <p className="text-sm">Попробуйте изменить фильтры или создать новое событие</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-24 left-4 z-10 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-12 h-12 bg-gray-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
          title="Фильтры"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  )
}

export default EventList
