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
  paymentRequests: PaymentRequest[];
  users: User[];
  events: Event[];
  onProcessPayment: (request: PaymentRequest) => void;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { currentUser, onLogout, onCreateRequest, onManageEvents, paymentRequests, users, events, onProcessPayment } = props;
  const [filter, setFilter] = useState<PaymentRequestStatus | 'ALL'>('ALL');

  const filteredRequests = useMemo(() => {
    const baseRequests = currentUser.role === UserRole.FINANCE
      ? paymentRequests
      : paymentRequests.filter(req => req.requesterId === currentUser.id);

    if (filter === 'ALL') return baseRequests;
    return baseRequests.filter(req => req.status === filter);
  }, [filter, paymentRequests, currentUser]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredRequests]);
  
  const pageTitle = currentUser.role === UserRole.FINANCE ? "Dashboard Financeiro" : "Minhas Solicitações";

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-200">
      <Sidebar currentUser={currentUser} onManageEvents={onManageEvents}/>
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
                requests={sortedRequests}
                currentUser={currentUser}
                users={users}
                events={events}
                onProcessPayment={onProcessPayment}
                activeFilter={filter}
                setFilter={setFilter}
              />
            </div>
        </main>
      </div>
    </div>
  );
};