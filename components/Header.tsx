
import React from 'react';
import { UserRole } from '../types';
import { PlusIcon, UserGroupIcon, UserIcon } from './icons';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onCreateRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userRole, setUserRole, onCreateRequest }) => {
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
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setUserRole(UserRole.REQUESTER)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${userRole === UserRole.REQUESTER ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{UserRole.REQUESTER}</span>
                </button>
                <button
                    onClick={() => setUserRole(UserRole.FINANCE)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${userRole === UserRole.FINANCE ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>{UserRole.FINANCE}</span>
                </button>
            </div>
            {userRole === UserRole.REQUESTER && (
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