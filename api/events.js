import { getCollection } from './db';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  try {
    // Проверяем JWT токен
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const eventsCollection = await getCollection('events');
    const usersCollection = await getCollection('users');

    if (req.method === 'GET') {
      // Получение событий пользователя и его пары
      const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
      
      if (!user || !user.partnerId) {
        // Если нет пары, возвращаем только события пользователя
        const events = await eventsCollection
          .find({ userId: decoded.userId })
          .sort({ date: 1, time: 1 })
          .toArray();
        
        return res.status(200).json({ events });
      }

      // Получаем события пользователя и его пары
      const events = await eventsCollection
        .find({ 
          $or: [
            { userId: decoded.userId },
            { userId: user.partnerId.toString() }
          ]
        })
        .sort({ date: 1, time: 1 })
        .toArray();

      return res.status(200).json({ events });
    }

    if (req.method === 'POST') {
      // Создание нового события
      const eventData = req.body;
      
      const newEvent = {
        ...eventData,
        userId: decoded.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await eventsCollection.insertOne(newEvent);
      newEvent._id = result.insertedId;

      return res.status(201).json({ 
        success: true, 
        event: newEvent 
      });
    }

    if (req.method === 'PUT') {
      // Обновление события
      const { eventId, ...updateData } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' });
      }

      // Проверяем, что событие принадлежит пользователю или его паре
      const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
      const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.userId !== decoded.userId && 
          (!user.partnerId || event.userId !== user.partnerId.toString())) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedEvent = {
        ...event,
        ...updateData,
        updatedAt: new Date()
      };

      await eventsCollection.updateOne(
        { _id: new ObjectId(eventId) },
        { $set: updatedEvent }
      );

      return res.status(200).json({ 
        success: true, 
        event: updatedEvent 
      });
    }

    if (req.method === 'DELETE') {
      // Удаление события
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' });
      }

      // Проверяем, что событие принадлежит пользователю
      const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.userId !== decoded.userId) {
        return res.status(403).json({ error: 'Can only delete your own events' });
      }

      await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
