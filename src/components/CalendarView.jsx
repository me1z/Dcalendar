import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Users, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isTomorrow, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

function CalendarView({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // month, week, day
  
  const calendarDays = useMemo(() => {
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
  }, [currentDate])

  const monthEvents = useMemo(() => {
    return events.filter(event => isSameMonth(new Date(event.date), currentDate))
  }, [events, currentDate])

  const getEventsForDay = (day) => {
    return monthEvents.filter(event => isSameDay(new Date(event.date), day))
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
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

  return (
    <div className="p-4 pb-20">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mobile-tap"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mobile-title">
            {format(currentDate, 'MMMM yyyy', { locale: ru })}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-primary-600 hover:text-primary-700 mobile-tap"
          >
            Сегодня
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
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

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          const dateLabel = getDateLabel(day)
          
          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-gray-100 transition-all duration-200 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isTodayDate ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isTodayDate ? 'text-primary-600 font-bold' : ''}`}>
                {dateLabel}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const eventInfo = getEventDisplayInfo(event)
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1.5 rounded cursor-pointer transition-all duration-200 mobile-tap ${
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
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded">
                    +{dayEvents.length - 3} ещё
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">Обозначения</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span className="text-gray-600">События</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 rounded"></div>
              <span className="text-gray-600">Задачи</span>
            </div>
          </div>
          <div className="space-y-2">
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

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">
            {monthEvents.filter(e => e.type === 'event').length}
          </div>
          <div className="text-sm text-gray-600">Событий в месяце</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">
            {monthEvents.filter(e => e.type === 'task' && !e.completed).length}
          </div>
          <div className="text-sm text-gray-600">Активных задач</div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
