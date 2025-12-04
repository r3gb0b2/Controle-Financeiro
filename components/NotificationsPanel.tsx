import React from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
}

const timeSince = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return Math.floor(seconds) + " segundos";
}


export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose }) => {
    return (
        <div className="absolute top-14 right-0 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-white">Notificações</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map(notification => (
                            <li key={notification.id} className="p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                                <p className="text-sm text-gray-300">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{timeSince(notification.createdAt)} atrás</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <BellIcon className="h-8 w-8 mx-auto" />
                        <p className="mt-2 text-sm">Nenhuma notificação nova</p>
                    </div>
                )}
            </div>
        </div>
    )
}