import React, { useState } from 'react';
import { User } from '../types';
import { UserIcon } from './icons';

interface ManageUsersModalProps {
  onClose: () => void;
  onAddUser: (user: Pick<User, 'name' | 'email'>) => void;
  users: User[];
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ onClose, onAddUser, users }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      alert('Por favor, preencha o nome e o e-mail do usuário.');
      return;
    }
    
    if (users.some(user => user.email.toLowerCase() === userEmail.toLowerCase())) {
        alert('Este e-mail já está em uso.');
        return;
    }
    
    onAddUser({ name: userName, email: userEmail });
    setUserName('');
    setUserEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Gerenciar Usuários</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Coluna de Criar Usuário */}
          <div className="border-r-0 md:border-r md:pr-8 border-gray-700">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Adicionar Novo Solicitante</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userName" className={labelClasses}>Nome Completo</label>
                <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="userEmail" className={labelClasses}>E-mail</label>
                <input type="email" id="userEmail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className={inputClasses} required />
              </div>
              <p className="text-xs text-gray-400">O novo usuário será criado com a senha padrão "123".</p>
              <div className="text-right pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  Adicionar Usuário
                </button>
              </div>
            </form>
          </div>
          
          {/* Coluna de Usuários Existentes */}
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-4">Usuários Cadastrados</h4>
            <div className="space-y-3">
              {users.length > 0 ? (
                [...users].sort((a,b) => a.name.localeCompare(b.name)).map(user => (
                  <div key={user.id} className="bg-gray-700/50 p-3 rounded-md border border-gray-600 flex items-center space-x-3">
                    <UserIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-200">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Financeiro' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum usuário cadastrado.</p>
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