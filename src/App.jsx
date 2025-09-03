import React, { useState, useEffect } from 'react'
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react'
import CalendarView from './components/CalendarView'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import { useTelegramApp } from './hooks/useTelegramApp'

function App() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [showEventForm, setShowEventForm] = useState(false)
  const [events, setEvents] = useState([])
  const { tg } = useTelegramApp()

  useEffect(() => {
    if (tg) {
      tg.ready()
      tg.expand()
    }
  }, [tg])

  const addEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString(),
      completed: false
    }
    setEvents(prev => [...prev, newEvent])
    setShowEventForm(false)
  }

  const toggleEvent = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ))
  }

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
  }

  const tabs = [
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'events', label: 'События', icon: CheckCircle },
    { id: 'tasks', label: 'Задачи', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-gray-50 telegram-app">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">DCalendar</h1>
              <p className="text-sm text-gray-600">Календарь для пар</p>
            </div>
            <button
              onClick={() => setShowEventForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Добавить
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'calendar' && (
          <CalendarView 
            events={events}
            onEventClick={() => {}}
          />
        )}
        
        {activeTab === 'events' && (
          <EventList 
            events={events.filter(e => e.type === 'event')}
            onToggle={toggleEvent}
            onDelete={deleteEvent}
          />
        )}
        
        {activeTab === 'tasks' && (
          <EventList 
            events={events.filter(e => e.type === 'task')}
            onToggle={toggleEvent}
            onDelete={deleteEvent}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onSubmit={addEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}
    </div>
  )
}

export default App
