import React, { useState } from 'react'
import { User, Trash2, AlertCircle, Settings, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

function ProfileSettings({ onClose, user }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPairDeleteConfirm, setShowPairDeleteConfirm] = useState(false)
  
  // Получаем все ключи localStorage для очистки
  const clearAllData = () => {
    // Очищаем все данные приложения
    localStorage.clear()
    // Перезагружаем страницу для применения изменений
    window.location.reload()
  }

  const deleteProfile = () => {
    clearAllData()
  }

  const deletePairOnly = () => {
    // Удаляем только данные о паре
    localStorage.removeItem('pairCode')
    localStorage.removeItem('partnerInfo')
    // Перезагружаем страницу
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm max-h-[95vh] overflow-y-auto safe-area-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={20} />
            Настройки профиля
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} />
              Информация о профиле
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>• Все данные хранятся локально на вашем устройстве</p>
              <p>• При удалении профиля все данные будут потеряны</p>
              <p>• Действие нельзя отменить</p>
              {user?.isTestUser && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    🧪 Тестовый режим
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                    Вы используете приложение в тестовом режиме без Telegram
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900">
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-3">
              Опасная зона
            </h3>
            
            <div className="space-y-3">
              {/* Delete Pair Only */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Удалить пару</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">Удалить только данные о паре, сохранить события</p>
                </div>
                <button
                  onClick={() => setShowPairDeleteConfirm(true)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 rounded-md text-sm font-medium transition-colors"
                >
                  Удалить
                </button>
              </div>

              {/* Delete Profile */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Удалить профиль</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">Удалить все данные приложения</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Закрыть
          </button>
        </div>
      </div>

      {/* Delete Profile Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Удалить профиль?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Это действие удалит ВСЕ данные приложения: события, задачи, настройки пары. 
              Действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={deleteProfile}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Удалить профиль
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Pair Confirmation */}
      {showPairDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Удалить пару?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Это действие удалит только данные о паре. Ваши события и задачи останутся.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPairDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                onClick={deletePairOnly}
                className="btn-primary flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Удалить пару
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileSettings
