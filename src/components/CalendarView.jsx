import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Users, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

function CalendarView({ events = [], onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // month, week, day
  
  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const days = eachDayOfInterval({ start, end })
      
      // Добавляем дни предыдущего месяца для заполнения первой недели
      const firstDayOfWeek = start.getDay()
      const prevMonthDays = []
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push(new Date(start.getTime() - (i + 1) * 24 * 60 * 60 * 1000))
      }
      
      // Добавляем дни следующего месяца для заполнения последней недели
      const lastDayOfWeek = end.getDay()
      const nextMonthDays = []
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        nextMonthDays.push(new Date(end.getTime() + i * 24 * 60 * 60 * 1000))
      }
      
      return [...prevMonthDays, ...days, ...nextMonthDays]
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    } else { // day view
      return [currentDate]
    }
  }, [currentDate, viewMode])

  const monthEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return []
    if (viewMode === 'month') {
      return events.filter(event => isSameMonth(new Date(event.date), currentDate))
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= start && eventDate <= end
      })
    } else { // day view
      return events.filter(event => isSameDay(new Date(event.date), currentDate))
    }
  }, [events, currentDate, viewMode])

  const getEventsForDay = (day) => {
    if (!monthEvents || !Array.isArray(monthEvents)) return []
    return monthEvents.filter(event => isSameDay(new Date(event.date), day))
  }

  const goToPreviousPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => subMonths(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(prev => subMonths(prev, 1))
    } else { // day view
      setCurrentDate(prev => addDays(prev, -1))
    }
  }

  const goToNextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => addMonths(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(prev => addMonths(prev, 1))
    } else { // day view
      setCurrentDate(prev => addDays(prev, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateLabel = (day) => {
    if (isToday(day)) return 'Сегодня'
    if (isTomorrow(day)) return 'Завтра'
    if (isYesterday(day)) return 'Вчера'
    return format(day, 'd', { locale: ru })
  }

  const getEventDisplayInfo = (event) => {
    const eventDate = new Date(event.date)
    const time = format(eventDate, 'HH:mm')
    const isOverdue = eventDate < new Date() && !event.completed && event.type === 'task'
    
    return {
      time,
      isOverdue,
      priority: event.priority,
      assignedTo: event.assignedTo,
      location: event.location
    }
  }

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ru })
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(start, 'dd.MM', { locale: ru })} - ${format(end, 'dd.MM.yyyy', { locale: ru })}`
    } else { // day view
      return format(currentDate, 'dd MMMM yyyy', { locale: ru })
    }
  }

  const getGridCols = () => {
    if (viewMode === 'month') return 'grid-cols-7'
    if (viewMode === 'week') return 'grid-cols-7'
    return 'grid-cols-1' // day view
  }

  const getDayHeight = () => {
    if (viewMode === 'month') return 'min-h-[80px]'
    if (viewMode === 'week') return 'min-h-[120px]'
    return 'min-h-[200px]' // day view
  }

  return (
    <div className="p-2 pb-20 max-w-full overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousPeriod}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mobile-tap"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center flex-1 mx-2">
          <h2 className="text-lg font-semibold text-gray-900 mobile-title truncate">
            {getViewTitle()}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-primary-600 hover:text-primary-700 mobile-tap"
          >
            Сегодня
          </button>
        </div>
        
        <button
          onClick={goToNextPeriod}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mobile-tap"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 rounded-lg p-1">
          {[
            { id: 'month', label: 'Месяц' },
            { id: 'week', label: 'Неделя' },
            { id: 'day', label: 'День' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors mobile-tap ${
                viewMode === mode.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Week Days Header - только для month и week view */}
      {(viewMode === 'month' || viewMode === 'week') && (
        <div className={`${getGridCols()} gap-1 mb-2 grid`}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div className={`${getGridCols()} gap-1 grid`}>
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true
          const isTodayDate = isToday(day)
          const dateLabel = getDateLabel(day)
          
          return (
            <div
              key={index}
              className={`${getDayHeight()} p-1 border border-gray-100 transition-all duration-200 ${
                viewMode === 'month' && !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } ${isTodayDate ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                viewMode === 'month' && !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } ${isTodayDate ? 'text-primary-600 font-bold' : ''}`}>
                {dateLabel}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, viewMode === 'day' ? 10 : 3).map(event => {
                  const eventInfo = getEventDisplayInfo(event)
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1 rounded cursor-pointer transition-all duration-200 mobile-tap ${
                        event.type === 'event' 
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      } ${event.completed ? 'opacity-50 line-through' : ''} ${
                        eventInfo.isOverdue ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium truncate">{event.title}</span>
                        {eventInfo.isOverdue && (
                          <span className="text-red-600">⚠️</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Clock size={10} />
                        <span>{eventInfo.time}</span>
                        
                        {event.location && (
                          <>
                            <MapPin size={10} />
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                        
                        {eventInfo.assignedTo !== 'both' && (
                          <>
                            <Users size={10} />
                            <span>{eventInfo.assignedTo === 'me' ? 'Я' : 'Партнер'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {dayEvents.length > (viewMode === 'day' ? 10 : 3) && (
                  <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded">
                    +{dayEvents.length - (viewMode === 'day' ? 10 : 3)} ещё
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend - только для month view */}
      {viewMode === 'month' && (
        <div className="mt-4 bg-white rounded-lg p-3 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Обозначения</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span className="text-gray-600">События</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 rounded"></div>
                <span className="text-gray-600">Задачи</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 rounded ring-2 ring-red-500"></div>
                <span className="text-gray-600">Просрочено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-100 rounded ring-2 ring-primary-500"></div>
                <span className="text-gray-600">Сегодня</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - только для month view */}
      {viewMode === 'month' && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <div className="text-xl font-bold text-blue-600">
              {monthEvents.filter(e => e.type === 'event').length}
            </div>
            <div className="text-xs text-gray-600">Событий</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <div className="text-xl font-bold text-orange-600">
              {monthEvents.filter(e => e.type === 'task' && !e.completed).length}
            </div>
            <div className="text-xs text-gray-600">Активных задач</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
