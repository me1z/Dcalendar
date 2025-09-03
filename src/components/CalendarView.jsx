import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ru } from 'date-fns/locale'

function CalendarView({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
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

  return (
    <div className="p-4 pb-20">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: ru })}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Сегодня
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
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
          const isToday = isSameDay(day, new Date())
          
          return (
            <div
              key={index}
              className={`min-h-[80px] p-1 border border-gray-100 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday ? 'text-primary-600' : ''}`}>
                {format(day, 'd')}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${
                      event.type === 'event' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    } ${event.completed ? 'opacity-50 line-through' : ''}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 2}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-gray-600">События</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 rounded"></div>
          <span className="text-gray-600">Задачи</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
