import React, { useState, useEffect, useMemo } from 'react';
import { Event, User, EventStatus, PaymentRequest, PaymentRequestStatus, EntityType } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './icons';

interface ManageEventsModalProps {
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (event: Event) => void;
  events: Event[];
  paymentRequests: PaymentRequest[];
  users: User[];
}

export const ManageEventsModal: React.FC<ManageEventsModalProps> = ({ onClose, onAddEvent, onUpdateEvent, events, paymentRequests, users }) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<EntityType>(EntityType.EVENT);
  const [budget, setBudget] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [status, setStatus] = useState<EventStatus>(EventStatus.ACTIVE);
  
  // Subcategories State
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState('');

  const eventSpend = useMemo(() => {
    const spendMap = new Map<string, number>();
    paymentRequests.forEach(req => {
        if (req.status === PaymentRequestStatus.PAID) {
            const currentSpend = spendMap.get(req.eventId) || 0;
            spendMap.set(req.eventId, currentSpend + req.amount);
        }
    });
    return spendMap;
  }, [paymentRequests]);

  useEffect(() => {
    if (editingEvent) {
      setEventName(editingEvent.name || '');
      // Garante que allowedUserIds seja um array, mesmo se vier undefined do banco
      setSelectedUserIds(editingEvent.allowedUserIds || []);
      setStatus(editingEvent.status || EventStatus.ACTIVE);
      setBudget(editingEvent.budget ? String(editingEvent.budget) : '');
      setEventType(editingEvent.type || EntityType.EVENT);
      setSubcategories(editingEvent.subcategories || []);
    } else {
      resetForm();
    }
  }, [editingEvent]);
  
  const resetForm = () => {
    setEventName('');
    setSelectedUserIds([]);
    setStatus(EventStatus.ACTIVE);
    setBudget('');
    setEventType(EntityType.EVENT);
    setSubcategories([]);
    setNewSubcategory('');
    setEditingEvent(null);
  };

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddSubcategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newSubcategory.trim()) {
        setSubcategories([...subcategories, newSubcategory.trim()]);
        setNewSubcategory('');
    }
  };

  const handleRemoveSubcategory = (index: number) => {
    const newSubs = [...subcategories];
    newSubs.splice(index, 1);
    setSubcategories(newSubs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || selectedUserIds.length === 0) {
      alert('Por favor, preencha o nome e selecione ao menos um solicitante.');
      return;
    }
    
    const budgetValue = budget ? parseFloat(budget) : undefined;
    
    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        name: eventName,
        allowedUserIds: selectedUserIds,
        status,
        budget: budgetValue,
        type: eventType,
        subcategories: subcategories,
      });
    } else {
      onAddEvent({
        name: eventName,
        allowedUserIds: selectedUserIds,
        status,
        budget: budgetValue,
        type: eventType,
        subcategories: subcategories,
      });
    }
    resetForm();
  };
  
  // Função protegida contra falhas se userIds for undefined
  const getUserNamesForEvent = (userIds: string[] | undefined) => {
    if (!userIds || !Array.isArray(userIds)) return '';
    return userIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Gerenciar Centros de Custo</h3>
           {editingEvent && (
            <button onClick={resetForm} className="text-sm text-blue-400 hover:text-blue-300">
              + Criar Novo
            </button>
          )}
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Coluna de Criar/Editar */}
          <div className="border-r-0 md:border-r md:pr-8 border-gray-700">
            <h4 className="text-lg font-medium text-gray-200 mb-4">{editingEvent ? 'Editando' : 'Criar Novo'}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className={labelClasses}>Tipo</label>
                <div className="mt-2 flex space-x-4">
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio text-blue-600" name="eventType" value={EntityType.EVENT} checked={eventType === EntityType.EVENT} onChange={() => setEventType(EntityType.EVENT)} />
                        <span className="ml-2 text-gray-300">Evento</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio text-blue-600" name="eventType" value={EntityType.COMPANY} checked={eventType === EntityType.COMPANY} onChange={() => setEventType(EntityType.COMPANY)} />
                        <span className="ml-2 text-gray-300">Empresa</span>
                    </label>
                </div>
              </div>

              <div>
                <label htmlFor="eventName" className={labelClasses}>Nome ({eventType})</label>
                <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} className={inputClasses} required />
              </div>

               <div>
                <label htmlFor="budget" className={labelClasses}>Orçamento (R$) - Opcional</label>
                <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClasses} placeholder="Ex: 5000.00" />
              </div>

               <div>
                <label htmlFor="status" className={labelClasses}>Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputClasses}>
                    <option value={EventStatus.ACTIVE}>Ativo</option>
                    <option value={EventStatus.INACTIVE}>Inativo</option>
                </select>
              </div>

              {/* Gerenciamento de Subcategorias */}
              <div>
                  <label className={labelClasses}>Subcategorias</label>
                  <div className="flex mt-1">
                      <input 
                        type="text" 
                        value={newSubcategory} 
                        onChange={(e) => setNewSubcategory(e.target.value)} 
                        className={`${inputClasses} mt-0 rounded-r-none`} 
                        placeholder="Ex: Transporte, Alimentação..." 
                      />
                      <button onClick={handleAddSubcategory} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md border border-l-0 border-gray-600">
                          <PlusIcon className="h-5 w-5" />
                      </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                      {subcategories.map((sub, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-800">
                              {sub}
                              <button type="button" onClick={() => handleRemoveSubcategory(index)} className="ml-1.5 text-blue-400 hover:text-blue-100">
                                  &times;
                              </button>
                          </span>
                      ))}
                      {subcategories.length === 0 && <span className="text-xs text-gray-500">Nenhuma subcategoria adicionada.</span>}
                  </div>
              </div>

              <div>
                <label className={labelClasses}>Designar para Solicitantes</label>
                <div className="mt-2 space-y-2 border border-gray-700 rounded-md p-2 max-h-48 overflow-y-auto bg-gray-900/50">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center p-1 rounded hover:bg-gray-700">
                      <input id={`user-${user.id}`} type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleUserSelection(user.id)} className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 bg-gray-700" />
                      <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm text-gray-300">{user.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  {editingEvent ? 'Salvar Alterações' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Coluna de Existentes */}
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-4">Centros de Custo Existentes</h4>
            <div className="space-y-3">
              {events.length > 0 ? (
                // Ordenação protegida
                [...events].sort((a,b) => (a.name || '').localeCompare(b.name || '')).map(event => {
                  const spent = eventSpend.get(event.id) || 0;
                  const budget = event.budget || 0;
                  const progress = budget > 0 ? (spent / budget) * 100 : 0;
                  const typeLabel = event.type === EntityType.COMPANY ? 'Empresa' : 'Evento';

                  return (
                    <div key={event.id} className="bg-gray-700/50 p-3 rounded-md border border-gray-600">
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${event.type === EntityType.COMPANY ? 'bg-indigo-900/50 border-indigo-700 text-indigo-300' : 'bg-orange-900/50 border-orange-700 text-orange-300'}`}>
                                    {typeLabel}
                                </span>
                                <p className="font-semibold text-gray-200">{event.name || 'Sem Nome'}</p>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                  <span className={`mr-2 inline-block h-2 w-2 rounded-full ${event.status === EventStatus.ACTIVE ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                  {event.status || 'Indefinido'}
                              </p>
                          </div>
                          <button onClick={() => setEditingEvent(event)} className="p-1 text-gray-400 hover:text-white" title="Editar">
                              <PencilIcon className="h-4 w-4" />
                          </button>
                      </div>
                       {event.budget && (
                          <div className='mt-2'>
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget)}</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                              </div>
                          </div>
                       )}
                       {event.subcategories && event.subcategories.length > 0 && (
                           <div className="mt-2 text-xs text-gray-500 truncate">
                               Subs: {event.subcategories.join(', ')}
                           </div>
                       )}
                      <p className="text-xs text-gray-400 mt-2">
                        <span className="font-medium text-gray-300">Acessível para:</span> {getUserNamesForEvent(event.allowedUserIds) || 'Ninguém'}
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">Nenhum centro de custo criado ainda.</p>
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