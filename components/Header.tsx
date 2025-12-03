import React from 'react';
import { User, UserRole } from '../types';
import { PlusIcon, CalendarIcon, UserIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  onCreateRequest: () => void;
  onManageEvents: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, users, setCurrentUser, onCreateRequest, onManageEvents }) => {
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find(u => u.id === event.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6.6a2 2 0 012 1.732l1.4 7.068A2 2 0 0118 21H6a2 2 0 01-2-2.268l1.4-7.068A2 2 0 017.4 10H12" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800">Sistema de Pagamentos</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={currentUser.id}
                onChange={handleUserChange}
                className="appearance-none bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            
            {currentUser.role === UserRole.FINANCE && (
              <button
                onClick={onManageEvents}
                className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                <CalendarIcon className="h-5 w-5 mr-2 -ml-1" />
                Gerenciar Eventos
              </button>
            )}

            {currentUser.role === UserRole.REQUESTER && (
              <button
                onClick={onCreateRequest}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Nova Solicitação
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
