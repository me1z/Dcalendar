import React from 'react'
import { Users, Lock, Calendar, Heart } from 'lucide-react'

function PairRequired({ onCreatePair }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-lg safe-area-all">
        {/* Icon */}
        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Lock className="w-12 h-12 text-blue-600" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Добро пожаловать в DCalendar
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Это приложение для пар, которые хотят синхронизировать свои события и задачи. 
          Создайте пару, чтобы начать пользоваться календарем.
        </p>
        
        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Что вы получите:
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Синхронизированный календарь</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Общие события и задачи</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Уведомления для партнера</span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={onCreatePair}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Users className="w-6 h-6 inline mr-2" />
          Создать пару
        </button>
        
        {/* Footer */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Приложение работает только для пар
        </p>
      </div>
    </div>
  )
}

export default PairRequired
