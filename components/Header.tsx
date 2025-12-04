import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User, Notification } from '../types';
import { LogoutIcon, BellIcon } from './icons';
import { NotificationsPanel } from './NotificationsPanel';

interface HeaderProps {
  currentUser: User;
  notifications: Notification[];
  setNotificationsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, notifications, setNotificationsRead }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen) {
      // Mark all as read when opening
      setNotificationsRead();
    }
  };

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-20">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* O título agora está na sidebar, mas mantemos um espaço para alinhamento */}
          </div>
          <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">
                Olá, <span className="font-bold text-white">{currentUser.name}</span>
              </span>

              <div className="relative">
                <button
                    onClick={handleToggleNotifications}
                    className="relative bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                    aria-label="Notificações"
                    title="Notificações"
                >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-800" />
                    )}
                </button>
                {isNotificationsOpen && (
                    <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} />
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-gray-700 hover:bg-red-600 text-white font-bold p-2 rounded-full transition-colors shadow-sm"
                aria-label="Sair"
                title="Sair"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};