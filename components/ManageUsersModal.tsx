import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { UserIcon, PencilIcon, TrashIcon } from './icons';

interface ManageUsersModalProps {
  onClose: () => void;
  onAddUser: (user: Pick<User, 'name' | 'email' | 'role'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  users: User[];
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ onClose, onAddUser, onUpdateUser, onDeleteUser, users }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.REQUESTER);

  useEffect(() => {
    if (editingUser) {
        setUserName(editingUser.name || '');
        setUserEmail(editingUser.email || '');
        setUserRole(editingUser.role || UserRole.REQUESTER);
    } else {
        resetForm();
    }
  }, [editingUser]);

  const resetForm = () => {
    setUserName('');
    setUserEmail('');
    setUserRole(UserRole.REQUESTER);
    setEditingUser(null);
  };

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      alert('Por favor, preencha o nome e o e-mail do usuário.');
      return;
    }
    
    // Verificação simples de email duplicado (apenas ao criar novo)
    if (!editingUser && users.some(user => user.email && user.email.toLowerCase() === userEmail.toLowerCase())) {
        alert('Este e-mail já está em uso.');
        return;
    }
    
    if (editingUser) {
        onUpdateUser({
            ...editingUser,
            name: userName,
            email: userEmail,
            role: userRole
        });
    } else {
        onAddUser({ name: userName, email: userEmail, role: userRole });
    }
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Gerenciar Usuários</h3>
          {editingUser && (
            <button onClick={resetForm} className="text-sm text-blue-400 hover:text-blue-300">
              + Adicionar Novo Usuário
            </button>
          )}
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Coluna de Criar/Editar Usuário */}
          <div className="border-r-0 md:border-r md:pr-8 border-gray-700">
            <h4 className="text-lg font-medium text-gray-200 mb-4">{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userName" className={labelClasses}>Nome Completo</label>
                <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="userEmail" className={labelClasses}>E-mail</label>
                <input type="email" id="userEmail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="userRole" className={labelClasses}>Perfil / Cargo</label>
                <select id="userRole" value={userRole} onChange={(e) => setUserRole(e.target.value as UserRole)} className={inputClasses}>
                    <option value={UserRole.REQUESTER}>Solicitante</option>
                    <option value={UserRole.MANAGER}>Gestor</option>
                    <option value={UserRole.FINANCE}>Financeiro</option>
                </select>
              </div>

              <p className="text-xs text-gray-400">
                  {editingUser ? 'Atualiza os dados de perfil no sistema.' : 'Cria um perfil de usuário. A conta de login deve ser criada no Firebase.'}
              </p>
              
              <div className="text-right pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Coluna de Usuários Existentes */}
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-4">Usuários Cadastrados</h4>
            <div className="space-y-3">
              {users.length > 0 ? (
                [...users].sort((a,b) => (a.name || '').localeCompare(b.name || '')).map(user => (
                  <div key={user.id} className="bg-gray-700/50 p-3 rounded-md border border-gray-600 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <UserIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                        <p className="font-semibold text-gray-200 truncate">{user.name || 'Sem nome'}</p>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            user.role === 'Financeiro' ? 'bg-green-900/50 text-green-300' : 
                            user.role === 'Gestor' ? 'bg-purple-900/50 text-purple-300' : 
                            'bg-blue-900/50 text-blue-300'
                        }`}>
                            {user.role}
                        </span>
                        </div>
                    </div>
                    <div className="flex space-x-2 pl-2">
                         <button onClick={() => setEditingUser(user)} className="p-1 text-gray-400 hover:text-white" title="Editar">
                              <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDeleteUser(user.id)} className="p-1 text-gray-400 hover:text-red-400" title="Excluir">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                    </div>
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