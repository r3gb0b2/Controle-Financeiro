import React, { useState } from 'react';
import { Event, User } from '../types';

interface ManageEventsModalProps {
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  events: Event[];
  users: User[];
}

export const ManageEventsModal: React.FC<ManageEventsModalProps> = ({ onClose, onAddEvent, events, users }) => {
  const [eventName, setEventName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || selectedUserIds.length === 0) {
      alert('Por favor, preencha o nome do evento e selecione ao menos um solicitante.');
      return;
    }
    onAddEvent({
      name: eventName,
      allowedUserIds: selectedUserIds,
    });
    setEventName('');
    setSelectedUserIds([]);
  };
  
  const getUserNamesForEvent = (userIds: string[]) => {
    return userIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Gerenciar Eventos</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Coluna de Criar Evento */}
          <div className="border-r-0 md:border-r md:pr-8 border-gray-700">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Criar Novo Evento</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventName" className={labelClasses}>Nome do Evento</label>
                <input
                  type="text"
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Designar para Solicitantes</label>
                <div className="mt-2 space-y-2 border border-gray-700 rounded-md p-2 max-h-48 overflow-y-auto bg-gray-900/50">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center p-1 rounded hover:bg-gray-700">
                      <input
                        id={`user-${user.id}`}
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                        className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 bg-gray-700"
                      />
                      <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm text-gray-300">{user.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  Adicionar Evento
                </button>
              </div>
            </form>
          </div>
          
          {/* Coluna de Eventos Existentes */}
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-4">Eventos Existentes</h4>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="bg-gray-700/50 p-3 rounded-md border border-gray-600">
                    <p className="font-semibold text-gray-200">{event.name}</p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Acessível para:</span> {getUserNamesForEvent(event.allowedUserIds) || 'Ninguém'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum evento criado ainda.</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-900/50 flex justify-end space-x-2 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Fechar</button>
        </div>
      </div>
    </div>
  );
};