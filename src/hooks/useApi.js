import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint) => request(endpoint, { method: 'GET' }), [request]);
  const post = useCallback((endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }), [request]);
  const put = useCallback((endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }), [request]);
  const del = useCallback((endpoint, body) => request(endpoint, { method: 'DELETE', body: JSON.stringify(body) }), [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const { post, loading, error } = useApi();

  const login = useCallback(async (telegramId, name) => {
    try {
      const response = await post('/auth', {
        action: 'login',
        telegramId,
        name
      });

      if (response.success) {
        localStorage.setItem('authToken', response.token);
        setToken(response.token);
        setUser(response.user);
        return response.user;
      }
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  }, [post]);

  const createPair = useCallback(async () => {
    try {
      const response = await post('/auth', {
        action: 'create-pair'
      });

      if (response.success) {
        return response.pairCode;
      }
    } catch (err) {
      console.error('Create pair failed:', err);
      throw err;
    }
  }, [post]);

  const joinPair = useCallback(async (pairCode) => {
    try {
      const response = await post('/auth', {
        action: 'join-pair',
        pairCode
      });

      if (response.success) {
        // Обновляем информацию о пользователе
        setUser(prev => prev ? { ...prev, partnerId: response.partner.id } : null);
        return response.partner;
      }
    } catch (err) {
      console.error('Join pair failed:', err);
      throw err;
    }
  }, [post]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    loading,
    error,
    login,
    createPair,
    joinPair,
    logout,
  };
}

export function useEvents() {
  const { get, post, put, delete: del, loading, error } = useApi();

  const fetchEvents = useCallback(async () => {
    try {
      const response = await get('/events');
      return response.events || [];
    } catch (err) {
      console.error('Fetch events failed:', err);
      throw err;
    }
  }, [get]);

  const createEvent = useCallback(async (eventData) => {
    try {
      const response = await post('/events', eventData);
      return response.event;
    } catch (err) {
      console.error('Create event failed:', err);
      throw err;
    }
  }, [post]);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      const response = await put('/events', { eventId, ...eventData });
      return response.event;
    } catch (err) {
      console.error('Update event failed:', err);
      throw err;
    }
  }, [put]);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      await del('/events', { eventId });
      return true;
    } catch (err) {
      console.error('Delete event failed:', err);
      throw err;
    }
  }, [del]);

  return {
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
