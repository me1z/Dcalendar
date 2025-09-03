import { getCollection } from './db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, telegramId, name, pairCode } = req.body;

    if (action === 'login') {
      // Логин через Telegram ID или тестовый режим
      const usersCollection = await getCollection('users');
      
      // Если нет telegramId, используем тестовый режим
      let actualTelegramId = telegramId;
      if (!actualTelegramId) {
        actualTelegramId = 'test_user_' + Math.random().toString(36).substring(2, 8);
      }
      
      let user = await usersCollection.findOne({ telegramId: actualTelegramId });
      
      if (!user) {
        // Создаем нового пользователя
        user = {
          telegramId: actualTelegramId,
          name: name || 'Тестовый пользователь',
          createdAt: new Date(),
          updatedAt: new Date(),
          pairCode: null,
          partnerId: null,
          isTestUser: !telegramId // Помечаем тестовых пользователей
        };
        
        const result = await usersCollection.insertOne(user);
        user._id = result.insertedId;
      }

      // Генерируем JWT токен
      const token = jwt.sign(
        { userId: user._id.toString(), telegramId: user.telegramId },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

              return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            telegramId: user.telegramId,
            name: user.name,
            pairCode: user.pairCode,
            partnerId: user.partnerId,
            isTestUser: user.isTestUser || false
          }
        });
    }

    if (action === 'create-pair') {
      // Создание пары
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token required' });
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const usersCollection = await getCollection('users');
        
        // Генерируем уникальный код пары
        const pairCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await usersCollection.updateOne(
          { _id: new ObjectId(decoded.userId) },
          { $set: { pairCode, updatedAt: new Date() } }
        );

        return res.status(200).json({
          success: true,
          pairCode
        });
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    if (action === 'join-pair') {
      // Присоединение к паре
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token required' });
      }

      const token = authHeader.substring(7);
      const { pairCode } = req.body;
      
      if (!pairCode) {
        return res.status(400).json({ error: 'Pair code required' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const usersCollection = await getCollection('users');
        
        // Ищем пользователя с таким кодом пары
        const partner = await usersCollection.findOne({ pairCode });
        
        if (!partner) {
          return res.status(404).json({ error: 'Invalid pair code' });
        }

        if (partner._id.toString() === decoded.userId) {
          return res.status(400).json({ error: 'Cannot pair with yourself' });
        }

        // Создаем пару
        await usersCollection.updateOne(
          { _id: new ObjectId(decoded.userId) },
          { 
            $set: { 
              pairCode: null, 
              partnerId: partner._id,
              updatedAt: new Date() 
            } 
          }
        );

        await usersCollection.updateOne(
          { _id: partner._id },
          { 
            $set: { 
              pairCode: null, 
              partnerId: new ObjectId(decoded.userId),
              updatedAt: new Date() 
            } 
          }
        );

        return res.status(200).json({
          success: true,
          partner: {
            id: partner._id,
            name: partner.name,
            telegramId: partner.telegramId
          }
        });
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
