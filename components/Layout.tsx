import React, { useState, useMemo } from 'react';
import { User, PaymentRequest, Event, UserRole, PaymentRequestStatus } from '../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { PlusIcon } from './icons';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  onCreateRequest: () => void;
  onManageEvents: () => void;
  onManageUsers: () => void;
  paymentRequests: PaymentRequest[];
  users: User[];
  events: Event[];
  onProcessPayment: (request: PaymentRequest) => void;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { currentUser, onLogout, onCreateRequest, onManageEvents, onManageUsers, paymentRequests, users, events, onProcessPayment } = props;
  const [filter, setFilter] = useState<PaymentRequestStatus | 'ALL'>('ALL');
  const [selectedMonth, setMonth] = useState<string>('ALL');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    paymentRequests.forEach(req => {
      // Extrai 'AAAA-MM' da data ISO
      months.add(req.createdAt.substring(0, 7));
    });
    // Ordena do mais recente para o mais antigo
    return Array.from(months).sort().reverse();
  }, [paymentRequests]);
  
  const baseRequests = useMemo(() => {
    // 1. Filtra por usuário
    const userFilteredRequests = currentUser.role === UserRole.FINANCE
      ? paymentRequests
      : paymentRequests.filter(req => req.requesterId === currentUser.id);

    // 2. Filtra por mês selecionado
    if (selectedMonth === 'ALL') {
      return userFilteredRequests;
    }
    return userFilteredRequests.filter(req => req.createdAt.startsWith(selectedMonth));
  }, [paymentRequests, currentUser, selectedMonth]);


  // O resumo usa a base filtrada por usuário e mês
  const summaryRequests = baseRequests;

  // A lista detalhada aplica o filtro de status sobre a base
  const listRequests = useMemo(() => {
    const filtered = filter === 'ALL'
      ? baseRequests
      : baseRequests.filter(req => req.status === filter);
    
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, baseRequests]);
  
  const pageTitle = currentUser.role === UserRole.FINANCE ? "Dashboard Financeiro" : "Minhas Solicitações";

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-200">
      <Sidebar currentUser={currentUser} onManageEvents={onManageEvents} onManageUsers={onManageUsers} />
      <div className="flex-1 flex flex-col">
        <Header currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
                {currentUser.role === UserRole.REQUESTER && (
                  <button
                    onClick={onCreateRequest}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                    Nova Solicitação
                  </button>
                )}
              </div>
              
              <Dashboard
                summaryRequests={summaryRequests}
                listRequests={listRequests}
                currentUser={currentUser}
                users={users}
                events={events}
                onProcessPayment={onProcessPayment}
                activeFilter={filter}
                setFilter={setFilter}
                selectedMonth={selectedMonth}
                setMonth={setMonth}
                availableMonths={availableMonths}
              />
            </div>
        </main>
      </div>
    </div>
  );
};