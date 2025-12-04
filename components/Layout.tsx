import React, { useState, useMemo } from 'react';
import { User, PaymentRequest, Event, UserRole, PaymentRequestStatus, Notification } from '../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { PlusIcon, AlertTriangleIcon } from './icons';
import { isGeminiAvailable } from '../lib/gemini';

interface LayoutProps {
  currentUser: User;
  onCreateRequest: () => void;
  onManageEvents: () => void;
  onManageUsers: () => void;
  onOpenReports: () => void;
  paymentRequests: PaymentRequest[];
  users: User[];
  events: Event[];
  onProcessPayment: (request: PaymentRequest) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onViewProof: (url: string) => void;
  notifications: Notification[];
  setNotificationsRead: () => void;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { currentUser, onCreateRequest, onManageEvents, onManageUsers, onOpenReports, paymentRequests, users, events, onProcessPayment, onApproveRequest, onRejectRequest, onViewProof, notifications, setNotificationsRead } = props;
  const [filter, setFilter] = useState<PaymentRequestStatus | 'ALL' | PaymentRequestStatus.AWAITING_APPROVAL>('ALL');
  const [selectedMonth, setMonth] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    paymentRequests.forEach(req => {
      months.add(req.createdAt.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [paymentRequests]);
  
  const baseRequests = useMemo(() => {
    let userFilteredRequests: PaymentRequest[];
    // 1. Filtra por perfil
    switch (currentUser.role) {
      case UserRole.FINANCE:
        userFilteredRequests = paymentRequests.filter(r => r.status !== PaymentRequestStatus.AWAITING_APPROVAL);
        break;
      case UserRole.MANAGER:
        // Gestor vê as suas e as que precisam da sua aprovação
        userFilteredRequests = paymentRequests.filter(req => req.requesterId === currentUser.id || req.status === PaymentRequestStatus.AWAITING_APPROVAL);
        break;
      case UserRole.REQUESTER:
      default:
        userFilteredRequests = paymentRequests.filter(req => req.requesterId === currentUser.id);
        break;
    }
    
    // 2. Filtra por busca
    const searchFiltered = searchTerm
      ? userFilteredRequests.filter(req => 
          req.recipientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.amount.toString().includes(searchTerm)
        )
      : userFilteredRequests;

    // 3. Filtra por mês
    if (selectedMonth === 'ALL') {
      return searchFiltered;
    }
    return searchFiltered.filter(req => req.createdAt.startsWith(selectedMonth));
  }, [paymentRequests, currentUser, selectedMonth, searchTerm]);


  const summaryRequests = baseRequests;

  const listRequests = useMemo(() => {
    const getFilterLogic = () => {
        if (filter === 'ALL') return baseRequests;

        if (currentUser.role === UserRole.MANAGER && filter === PaymentRequestStatus.PENDING) {
             return baseRequests.filter(req => req.status === filter && req.requesterId === currentUser.id);
        }
        
        return baseRequests.filter(req => req.status === filter);
    }
    
    const filtered = getFilterLogic();
    
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, baseRequests, currentUser]);
  
  const pageTitle = {
    [UserRole.FINANCE]: "Dashboard Financeiro",
    [UserRole.MANAGER]: "Painel do Gestor",
    [UserRole.REQUESTER]: "Minhas Solicitações",
  }[currentUser.role];

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-200">
      <Sidebar currentUser={currentUser} onManageEvents={onManageEvents} onManageUsers={onManageUsers} onOpenReports={onOpenReports}/>
      <div className="flex-1 flex flex-col">
        <Header currentUser={currentUser} notifications={notifications} setNotificationsRead={setNotificationsRead} />
        
        {!isGeminiAvailable && (
            <div className="bg-yellow-900/50 text-yellow-200 text-center p-2 text-sm border-b border-t border-yellow-700/50 flex items-center justify-center gap-2">
              <AlertTriangleIcon className="h-4 w-4" />
              Funcionalidades de IA estão desativadas. Configure a chave de API do Gemini para habilitá-las.
            </div>
        )}

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
                onApproveRequest={onApproveRequest}
                onRejectRequest={onRejectRequest}
                onViewProof={onViewProof}
                activeFilter={filter}
                setFilter={setFilter}
                selectedMonth={selectedMonth}
                setMonth={setMonth}
                availableMonths={availableMonths}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
        </main>
      </div>
    </div>
  );
};