import React, { useState, useEffect } from 'react'
import { Calendar, Plus, CheckCircle, Clock, Users, Bell, Settings, Menu, X } from 'lucide-react'
import CalendarView from './components/CalendarView'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import PairSetup from './components/PairSetup'
import NotificationSettings from './components/NotificationSettings'
import { useTelegramApp } from './hooks/useTelegramApp'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNotifications } from './hooks/useNotifications'
import { usePairSync } from './hooks/usePairSync'

function App() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [showEventForm, setShowEventForm] = useState(false)
  const [showPairSetup, setShowPairSetup] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [events, setEvents] = useLocalStorage('events', [])
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const { tg } = useTelegramApp()
  const { showNotification, scheduleNotification } = useNotifications()
  const { isPaired, partnerInfo, syncStatus, syncData } = usePairSync()

  useEffect(() => {
    if (tg) {
      tg.ready()
      tg.expand()
    }
  }, [tg])

  // Загружаем сохраненные настройки уведомлений
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.enabled && settings.reminders) {
        // Планируем уведомления для существующих событий
        events.forEach(event => {
          if (!event.notificationScheduled) {
            scheduleEventNotification(event, settings.reminderTime)
          }
        })
      }
    }
  }, [])

  const addEvent = async (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString(),
      completed: false,
      notificationScheduled: false
    }
    
    setEvents(prev => [...prev, newEvent])
    setShowEventForm(false)

    // Планируем уведомление
    scheduleEventNotification(newEvent, 15) // По умолчанию за 15 минут

    // Синхронизируем с партнером
    if (isPaired) {
      await syncData(newEvent, 'event')
    }

    // Показываем уведомление о создании
    showNotification('Событие создано', {
      body: `"${newEvent.title}" добавлено в календарь`,
      tag: `event-${newEvent.id}`
    })
  }

  const toggleEvent = async (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ))

    const updatedEvent = events.find(e => e.id === eventId)
    if (updatedEvent && isPaired) {
      await syncData({ ...updatedEvent, completed: !updatedEvent.completed }, 'event')
    }
  }

  const deleteEvent = async (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
    
    if (isPaired) {
      await syncData({ id: eventId, action: 'delete' }, 'event')
    }
  }

  const scheduleEventNotification = (event, minutesBefore) => {
    const eventTime = new Date(event.date)
    const notificationTime = new Date(eventTime.getTime() - minutesBefore * 60 * 1000)
    const now = new Date()
    
    if (notificationTime > now) {
      const delay = notificationTime.getTime() - now.getTime()
      
      scheduleNotification(
        `Напоминание: ${event.title}`,
        {
          body: event.description || `Событие через ${minutesBefore} минут`,
          tag: `reminder-${event.id}`,
          requireInteraction: true
        },
        delay
      )
      
      // Отмечаем, что уведомление запланировано
      setEvents(prev => prev.map(e => 
        e.id === event.id 
          ? { ...e, notificationScheduled: true }
          : e
      ))
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    // Здесь можно показать детальную информацию о событии
  }

  const tabs = [
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'events', label: 'События', icon: CheckCircle },
    { id: 'tasks', label: 'Задачи', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-gray-50 telegram-app">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DCalendar</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Календарь для пар</p>
                  {isPaired && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Users size={12} />
                      <span>Подключен</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell size={20} />
                {isPaired && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => setShowEventForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Меню</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setShowPairSetup(true)
                  setShowSidebar(false)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users size={20} className="text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Настройка пары</div>
                  <div className="text-sm text-gray-600">
                    {isPaired ? 'Подключен к партнеру' : 'Подключиться к партнеру'}
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setShowNotificationSettings(true)
                  setShowSidebar(false)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Bell size={20} className="text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Уведомления</div>
                  <div className="text-sm text-gray-600">Настройки уведомлений</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setShowSidebar(false)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Настройки</div>
                  <div className="text-sm text-gray-600">Общие настройки приложения</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {activeTab === 'calendar' && (
          <CalendarView 
            events={events}
            onEventClick={handleEventClick}
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

      {/* Modals */}
      {showEventForm && (
        <EventForm
          onSubmit={addEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}

      {showPairSetup && (
        <PairSetup
          onClose={() => setShowPairSetup(false)}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {/* Sync Status Indicator */}
      {isPaired && syncStatus === 'syncing' && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">Синхронизация...</span>
          </div>
        </div>
      )}

      {/* Quick Actions FAB */}
      <div className="fixed bottom-24 right-4 z-10 lg:hidden">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowPairSetup(true)}
            className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Настройка пары"
          >
            <Users size={20} />
          </button>
          
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            title="Уведомления"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
