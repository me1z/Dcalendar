import React, { useState, useEffect } from 'react'
import { Calendar, Plus, List, Settings, Users, Bell, Menu, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Analytics } from '@vercel/analytics/react'
import { useNotifications } from './hooks/useNotifications'
import { useTelegramApp } from './hooks/useTelegramApp'
import { useAuth, useEvents } from './hooks/useApi'
import EventForm from './components/EventForm'
import CalendarView from './components/CalendarView'
import EventList from './components/EventList'
import EventView from './components/EventView'
import PairSetup from './components/PairSetup'
import PairRequired from './components/PairRequired'
import NotificationSettings from './components/NotificationSettings'
import ProfileSettings from './components/ProfileSettings'

function App() {
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('calendar')
  const [showEventForm, setShowEventForm] = useState(false)
  const [showEventView, setShowEventView] = useState(false)
  const [showPairSetup, setShowPairSetup] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const { sendNotification, sendPairNotification } = useNotifications()
  const { user: telegramUser, theme, showAlert } = useTelegramApp()
  const { user, login, createPair, joinPair, logout } = useAuth()
  const { fetchEvents, createEvent: apiCreateEvent, updateEvent: apiUpdateEvent, deleteEvent: apiDeleteEvent, loading } = useEvents()

  // Авторизация через Telegram при загрузке
  useEffect(() => {
    if (telegramUser && !user) {
      login(telegramUser.id, telegramUser.first_name)
    }
  }, [telegramUser, user, login])

  // Загрузка событий при авторизации
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      const eventsData = await fetchEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  // Обработка добавления события
  const addEvent = async (eventData) => {
    try {
      const newEvent = await apiCreateEvent({
        ...eventData,
        completed: false,
        assignedTo: eventData.assignedTo || 'both'
      })

      setEvents(prev => [...prev, newEvent])
      setShowEventForm(false)
      setEditingEvent(null)

      // Отправляем уведомления
      await sendNotification(
        `✨ Новое событие: ${newEvent.title}`,
        { body: `Создано: ${newEvent.description || 'Без описания'}` }
      )

      // Уведомляем партнера
      if (user?.partnerId) {
        await sendPairNotification('created', user?.name || 'Партнер')
      }

      // Планируем напоминание
      if (newEvent.reminder?.enabled && newEvent.reminder?.time) {
        const reminderDelay = newEvent.reminder.time * 60 * 1000
        const eventTime = new Date(newEvent.date).getTime()
        const reminderTime = eventTime - reminderDelay
        
        if (reminderTime > Date.now()) {
          setTimeout(async () => {
            await sendNotification(
              `⏰ Напоминание: ${newEvent.title}`,
              { body: `Начинается через ${newEvent.reminder.time} минут` }
            )
          }, reminderTime - Date.now())
        }
      }

      showAlert('Событие создано!')
    } catch (error) {
      showAlert('Ошибка при создании события')
      console.error('Create event error:', error)
    }
  }

  // Обработка переключения события
  const toggleEvent = async (eventId) => {
    try {
      const event = events.find(e => e._id === eventId || e.id === eventId)
      if (!event) return

      const updatedEvent = { ...event, completed: !event.completed }
      
      // Обновляем в API
      await apiUpdateEvent(event._id || event.id, updatedEvent)
      
      // Обновляем локальное состояние
      setEvents(prev => prev.map(e => 
        (e._id === eventId || e.id === eventId) ? updatedEvent : e
      ))
      
      // Отправляем уведомление
      sendNotification(
        `${updatedEvent.completed ? '✅' : '🔄'} ${updatedEvent.completed ? 'Завершено' : 'Возобновлено'}: ${updatedEvent.title}`,
        { body: updatedEvent.description || 'Без описания' }
      )
    } catch (error) {
      console.error('Toggle event error:', error)
      showAlert('Ошибка при обновлении события')
    }
  }

  // Слушаем обновления событий от партнера
  useEffect(() => {
    const handleEventsUpdated = (e) => {
      if (e.detail && e.detail.events) {
        setEvents(e.detail.events)
      }
    }

    window.addEventListener('eventsUpdated', handleEventsUpdated)
    
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdated)
    }
  }, []) // Убираем setEvents из зависимостей



  // Обработка удаления события
  const deleteEvent = async (eventId) => {
    try {
      const eventToDelete = events.find(e => e._id === eventId || e.id === eventId)
      if (!eventToDelete) return
      
      if (confirm(`Удалить событие "${eventToDelete.title}"?`)) {
        // Удаляем из API
        await apiDeleteEvent(eventToDelete._id || eventToDelete.id)
        
        // Удаляем из локального состояния
        setEvents(prev => prev.filter(event => (event._id !== eventId && event.id !== eventId)))
        
        // Отправляем уведомление
        await sendNotification(
          `🗑️ Удалено: ${eventToDelete.title}`,
          { body: 'Событие было удалено' }
        )
      }
    } catch (error) {
      console.error('Delete event error:', error)
      showAlert('Ошибка при удалении события')
    }
  }

  // Обработка редактирования события
  const editEvent = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  // Обработка просмотра события
  const viewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventView(true)
  }

  // Обработка создания события на определенную дату
  const createEventOnDate = (date) => {
    setSelectedDate(date)
    setShowEventForm(true)
  }

  // Обработка обновления события
  const updateEvent = async (eventData) => {
    try {
      const updatedEvent = { ...editingEvent, ...eventData, updatedAt: new Date().toISOString() }
      
      // Обновляем в API
      await apiUpdateEvent(editingEvent._id || editingEvent.id, updatedEvent)
      
      // Обновляем локальное состояние
      setEvents(prev => prev.map(event => 
        (event._id === editingEvent._id || event.id === editingEvent.id) ? updatedEvent : event
      ))
      
      // Отправляем уведомление
      sendNotification(
        `✏️ Обновлено: ${updatedEvent.title}`,
        { body: updatedEvent.description || 'Без описания' }
      )

      setShowEventForm(false)
      setEditingEvent(null)
      showAlert('Событие обновлено!')
    } catch (error) {
      console.error('Update event error:', error)
      showAlert('Ошибка при обновлении события')
    }
  }

  // Проверяем просроченные задачи
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date()
      const overdueTasks = events.filter(event => 
        event.type === 'task' && 
        !event.completed && 
        new Date(event.date) < now
      )

      overdueTasks.forEach(task => {
        sendNotification(
          `🚨 Просрочено: ${task.title}`,
          { body: `Задача должна была быть выполнена ${format(new Date(task.date), 'dd.MM.yyyy')}` }
        )
      })
    }

    // Проверяем каждый час
    const interval = setInterval(checkOverdueTasks, 60 * 60 * 1000)
    checkOverdueTasks() // Проверяем сразу при загрузке

    return () => clearInterval(interval)
  }, [events, sendNotification])

  // Если нет пары, показываем экран создания пары
  if (!user?.partnerId) {
    return (
      <div className={`min-h-screen iphone-no-scroll ${theme === 'dark' ? 'dark' : ''}`}>
        <Analytics />
        <PairRequired onCreatePair={() => setShowPairSetup(true)} />
        
        {/* Pair Setup Modal */}
        {showPairSetup && (
          <PairSetup 
            onClose={() => setShowPairSetup(false)} 
            onPairCreated={() => {
              setShowPairSetup(false)
              // Принудительно обновляем состояние
              window.location.reload()
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen iphone-no-scroll ${theme === 'dark' ? 'dark' : ''}`}>
      <Analytics />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 header-safe-super">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  DCalendar
                </h1>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Pair Status */}
              {user?.partnerId && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                  <Users size={16} />
                  <span>В паре</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              )}

              {/* Pair Setup Button */}
              <button
                onClick={() => setShowPairSetup(true)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Настройка пары"
              >
                <Users size={20} />
              </button>

              {/* Notification Settings */}
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Настройки уведомлений"
              >
                <Bell size={20} />
              </button>

              {/* Profile Settings */}
              <button
                onClick={() => setShowProfileSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Настройки профиля"
              >
                <Settings size={20} />
              </button>

              {/* Add Event Button */}
              <button
                onClick={() => setShowEventForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 main-safe-extra">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Календарь
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List size={16} className="inline mr-2" />
            Список
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            onEventClick={viewEvent}
            onCreateEvent={createEventOnDate}
          />
        )}

        {activeTab === 'list' && (
          <EventList
            events={events}
            onToggle={toggleEvent}
            onDelete={deleteEvent}
            onEdit={editEvent}
          />
        )}
      </main>

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileSidebar(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Меню</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setShowPairSetup(true)
                  setShowMobileSidebar(false)
                }}
                className="w-full btn-secondary flex items-center gap-2"
              >
                <Users size={20} />
                Настройка пары
              </button>
              
              <button
                onClick={() => {
                  setShowNotificationSettings(true)
                  setShowMobileSidebar(false)
                }}
                className="w-full btn-secondary flex items-center gap-2"
              >
                <Bell size={20} />
                Уведомления
              </button>

              <button
                onClick={() => {
                  setShowProfileSettings(true)
                  setShowMobileSidebar(false)
                }}
                className="w-full btn-secondary flex items-center gap-2"
              >
                <Settings size={20} />
                Профиль
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEventForm && (
        <EventForm
          onSubmit={editingEvent ? updateEvent : addEvent}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
            setSelectedDate(null)
          }}
          event={editingEvent}
          selectedDate={selectedDate}
        />
      )}

      {showEventView && selectedEvent && (
        <EventView
          event={selectedEvent}
          onClose={() => {
            setShowEventView(false)
            setSelectedEvent(null)
          }}
          onToggle={toggleEvent}
          onEdit={(event) => {
            setShowEventView(false)
            setSelectedEvent(null)
            editEvent(event)
          }}
        />
      )}

      {showPairSetup && (
        <PairSetup onClose={() => setShowPairSetup(false)} />
      )}

      {showNotificationSettings && (
        <NotificationSettings 
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {showProfileSettings && (
        <ProfileSettings 
          onClose={() => setShowProfileSettings(false)}
        />
      )}

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setShowEventForm(true)}
        className="fixed lg:hidden w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40 float-safe"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

export default App
