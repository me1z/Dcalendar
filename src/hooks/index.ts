import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, Event, Task } from '../types';
import { eventUtils, dateUtils } from '../utils';

// Types for hooks
export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  type: 'task' | 'event' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  assignedTo: 'me' | 'partner' | 'both'
  category: string
  completed: boolean
  createdAt: string
  updatedAt?: string
  reminder?: {
    enabled: boolean
    time: number
  }
  repeat?: string
}

export interface PartnerInfo {
  id: string
  name: string
  avatar?: string
  lastSeen: string
}

export interface NotificationSettings {
  browser: boolean
  telegram: boolean
  events: boolean
  tasks: boolean
  reminders: boolean
  sound: boolean
  vibration: boolean
  reminderTime: number
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  showAlert: (message: string) => void
  showConfirm: (message: string, callback: (result: boolean) => void) => void
  showPopup: (params: any) => void
  requestWriteAccess: () => Promise<boolean>
  onEvent: (event: string, callback: () => void) => void
  colorScheme: string
  initDataUnsafe?: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
  }
}

// Хук для работы с локальным хранилищем
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, [key]);

  const loadFromStorage = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading from storage for key ${key}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting storage value for key ${key}:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, loading] as const;
};

// Хук для работы с событиями
export const useEvents = () => {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('events', []);
  const [loading, setLoading] = useState(false);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    return newEvent;
  }, [setEvents]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
  }, [setEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    Alert.alert(
      'Удалить событие',
      'Вы уверены, что хотите удалить это событие?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
          },
        },
      ]
    );
  }, [setEvents]);

  const toggleEventCompletion = useCallback(async (id: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id
          ? { ...event, completed: !event.completed, updatedAt: new Date().toISOString() }
          : event
      )
    );
  }, [setEvents]);

  const getEventsForDate = useCallback((date: string) => {
    return eventUtils.filterByDate(events, date);
  }, [events]);

  const getEventsByType = useCallback((type: 'event' | 'task') => {
    return eventUtils.filterByType(events, type);
  }, [events]);

  const getTasksByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    const tasks = eventUtils.filterByType(events, 'task') as Task[];
    return eventUtils.filterTasksByPriority(tasks, priority);
  }, [events]);

  const searchEvents = useCallback((query: string) => {
    return eventUtils.searchEvents(events, query);
  }, [events]);

  const getEventStats = useCallback(() => {
    return eventUtils.getEventStats(events);
  }, [events]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompletion,
    getEventsForDate,
    getEventsByType,
    getTasksByPriority,
    searchEvents,
    getEventStats,
  };
};

// Хук для работы с фильтрами
export const useEventFilters = (events: CalendarEvent[]) => {
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'event' | 'task',
    status: 'all' as 'all' | 'completed' | 'pending',
    assignedTo: 'all' as 'all' | 'me' | 'partner' | 'both',
    priority: 'all' as 'all' | 'low' | 'medium' | 'high',
    searchQuery: '',
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Фильтр по типу
    if (filters.type !== 'all') {
      filtered = eventUtils.filterByType(filtered, filters.type);
    }

    // Фильтр по статусу
    if (filters.status !== 'all') {
      const completed = filters.status === 'completed';
      filtered = eventUtils.filterByStatus(filtered, completed);
    }

    // Фильтр по назначению
    if (filters.assignedTo !== 'all') {
      filtered = eventUtils.filterByAssignment(filtered, filters.assignedTo);
    }

    // Фильтр по приоритету (только для задач)
    if (filters.priority !== 'all') {
      const tasks = eventUtils.filterByType(filtered, 'task') as Task[];
      const filteredTasks = eventUtils.filterTasksByPriority(tasks, filters.priority);
      const eventsOnly = eventUtils.filterByType(filtered, 'event');
      filtered = [...eventsOnly, ...filteredTasks];
    }

    // Поиск по тексту
    if (filters.searchQuery.trim()) {
      filtered = eventUtils.searchEvents(filtered, filters.searchQuery);
    }

    return filtered;
  }, [events, filters]);

  const updateFilter = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: 'all',
      status: 'all',
      assignedTo: 'all',
      priority: 'all',
      searchQuery: '',
    });
  }, []);

  return {
    filters,
    filteredEvents,
    updateFilter,
    resetFilters,
  };
};

// Хук для работы с сортировкой
export const useEventSorting = (events: CalendarEvent[]) => {
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title' | 'deadline'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedEvents = useMemo(() => {
    let sorted = [...events];

    switch (sortBy) {
      case 'date':
        sorted = eventUtils.sortByDate(sorted, sortOrder === 'asc');
        break;
      case 'priority':
        const tasks = eventUtils.filterByType(sorted, 'task') as Task[];
        const eventsOnly = eventUtils.filterByType(sorted, 'event');
        const sortedTasks = eventUtils.sortTasksByPriority(tasks);
        sorted = sortOrder === 'asc' ? [...eventsOnly, ...sortedTasks] : [...sortedTasks, ...eventsOnly];
        break;
      case 'title':
        sorted = eventUtils.sortByTitle(sorted, sortOrder === 'asc');
        break;
      case 'deadline':
        // Сортировка по дедлайну для задач
        const tasksWithDeadline = eventUtils.filterByType(sorted, 'task') as Task[];
        const tasksWithoutDeadline = tasksWithDeadline.filter(t => !t.hasDeadline || !t.deadline);
        const tasksWithDeadlineSorted = tasksWithDeadline
          .filter(t => t.hasDeadline && t.deadline)
          .sort((a, b) => {
            const dateA = new Date(a.deadline!).getTime();
            const dateB = new Date(b.deadline!).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          });
        
        const eventsOnly = eventUtils.filterByType(sorted, 'event');
        sorted = [...eventsOnly, ...tasksWithDeadlineSorted, ...tasksWithoutDeadline];
        break;
    }

    return sorted;
  }, [events, sortBy, sortOrder]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return {
    sortBy,
    sortOrder,
    sortedEvents,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
  };
};

// Хук для работы с поиском
export const useSearch = (events: CalendarEvent[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CalendarEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = eventUtils.searchEvents(events, query);
    setSearchResults(results);
    setIsSearching(false);
  }, [events]);

  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 300),
    [performSearch]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
  };
};

// Хук для работы с датами
export const useDateSelection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateString, setSelectedDateString] = useState(
    new Date().toISOString().split('T')[0]
  );

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedDateString(date.toISOString().split('T')[0]);
  }, []);

  const selectToday = useCallback(() => {
    const today = new Date();
    selectDate(today);
  }, [selectDate]);

  const goToNextDay = useCallback(() => {
    const nextDay = dateUtils.addDays(selectedDate, 1);
    selectDate(nextDay);
  }, [selectedDate, selectDate]);

  const goToPreviousDay = useCallback(() => {
    const prevDay = dateUtils.addDays(selectedDate, -1);
    selectDate(prevDay);
  }, [selectedDate, selectDate]);

  const isToday = useMemo(() => {
    return dateUtils.isToday(selectedDate);
  }, [selectedDate]);

  return {
    selectedDate,
    selectedDateString,
    selectDate,
    selectToday,
    goToNextDay,
    goToPreviousDay,
    isToday,
  };
};

// Хук для работы с настройками
export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage('settings', {
    notificationsEnabled: true,
    darkModeEnabled: false,
    autoSyncEnabled: true,
    language: 'ru' as 'ru' | 'en',
    reminderTime: 15,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const updateSetting = useCallback((key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const toggleSetting = useCallback((key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings({
      notificationsEnabled: true,
      darkModeEnabled: false,
      autoSyncEnabled: true,
      language: 'ru',
      reminderTime: 15,
      soundEnabled: true,
      vibrationEnabled: true,
    });
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    toggleSetting,
    resetSettings,
  };
};

// Хук для работы с уведомлениями
export const useNotifications = () => {
  const [notifications, setNotifications] = useLocalStorage('notifications', []);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');

  const requestPermission = useCallback(async () => {
    // В реальном приложении здесь был бы запрос разрешений на уведомления
    setPermission('granted');
  }, []);

  const scheduleNotification = useCallback(async (notification: {
    title: string;
    body: string;
    scheduledFor: Date;
    eventId?: string;
  }) => {
    if (permission !== 'granted') {
      await requestPermission();
    }

    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [...prev, newNotification]);
  }, [permission, requestPermission, setNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return {
    notifications,
    permission,
    requestPermission,
    scheduleNotification,
    markAsRead,
    clearNotifications,
  };
};

// Утилита для debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
