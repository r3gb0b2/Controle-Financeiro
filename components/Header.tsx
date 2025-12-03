import React from 'react';
import { User } from '../types';
import { LogoutIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-20">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6.6a2 2 0 012 1.732l1.4 7.068A2 2 0 0118 21H6a2 2 0 01-2-2.268l1.4-7.068A2 2 0 017.4 10H12" />
            </svg>
            <h1 className="text-xl font-bold text-white">Painel de Pagamentos</h1>
          </div>
          <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">
                Olá, <span className="font-bold text-white">{currentUser.name}</span>
              </span>
              <button
                onClick={onLogout}
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