import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreateRequestModal } from './components/CreateRequestModal';
import { ProcessPaymentModal } from './components/ProcessPaymentModal';
import { ManageEventsModal } from './components/ManageEventsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserRole, PaymentRequest, PaymentRequestStatus, User, Event } from './types';

const initialUsers: User[] = [
  { id: 'user1', name: 'Ana Silva', role: UserRole.REQUESTER },
  { id: 'user2', name: 'Bruno Costa', role: UserRole.REQUESTER },
  { id: 'user3', name: 'Carlos Dias', role: UserRole.FINANCE },
];

const App: React.FC = () => {
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User>('currentUser', users[0]);
  const [paymentRequests, setPaymentRequests] = useLocalStorage<PaymentRequest[]>('paymentRequests', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isManageEventsModalOpen, setIsManageEventsModalOpen] = useState(false);
  
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [filter, setFilter] = useState<PaymentRequestStatus | 'ALL'>('ALL');

  useEffect(() => {
    // Adiciona dados iniciais se a lista estiver vazia
    if (paymentRequests.length === 0 && events.length === 0) {
      const initialEvents: Event[] = [
        { id: 'event1', name: 'Viagem Conferência WebTech 2024', allowedUserIds: ['user1'] },
        { id: 'event2', name: 'Compras de Material de Escritório - Q4', allowedUserIds: ['user1', 'user2'] },
        { id: 'event3', name: 'Pagamento Fornecedores TI', allowedUserIds: ['user2'] },
      ];
      setEvents(initialEvents);

      const initialData: PaymentRequest[] = [
        { id: '1', requesterId: 'user1', eventId: 'event1', amount: 150.75, currency: 'USD', recipient: 'Amazon Web Services', description: 'Hospedagem mensal do servidor', status: PaymentRequestStatus.PAID, createdAt: new Date(2023, 10, 15).toISOString(), proofOfPayment: 'comprovante-aws.pdf', paidAt: new Date(2023, 10, 16).toISOString(), bankName: 'Bank of America', bankAgency: '123', bankAccount: '98765-4' },
        { id: '2', requesterId: 'user2', eventId: 'event3', amount: 49.00, currency: 'USD', recipient: 'Figma', description: 'Assinatura da ferramenta de design', status: PaymentRequestStatus.PENDING, createdAt: new Date(2023, 11, 1).toISOString(), pixKey: 'billing@figma.com' },
        { id: '3', requesterId: 'user2', eventId: 'event3', amount: 2500.00, currency: 'BRL', recipient: 'Desenvolvedor Freelancer', description: 'Desenvolvimento de componente', status: PaymentRequestStatus.PENDING, createdAt: new Date(2023, 11, 5).toISOString(), bankName: 'Banco Digital X', bankAgency: '0001', bankAccount: '123456-7', pixKey: 'devfreelancer@email.com' },
        { id: '4', requesterId: 'user1', eventId: 'event2', amount: 99.99, currency: 'BRL', recipient: 'Papelaria Central', description: 'Material de escritório', status: PaymentRequestStatus.REJECTED, createdAt: new Date(2023, 10, 20).toISOString(), reasonForRejection: 'A fatura não corresponde ao pedido de compra.' },
      ];
      setPaymentRequests(initialData);
    }
  }, [setPaymentRequests, setEvents, paymentRequests.length, events.length]);

  const handleCreateRequest = (newRequestData: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => {
    const newRequest: PaymentRequest = {
      ...newRequestData,
      id: new Date().getTime().toString(),
      status: PaymentRequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      requesterId: currentUser.id,
    };
    setPaymentRequests([...paymentRequests, newRequest]);
    setIsCreateModalOpen(false);
  };
  
  const handleAddEvent = (newEventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...newEventData,
      id: new Date().getTime().toString(),
    };
    setEvents([...events, newEvent]);
  };

  const handleProcessPayment = (requestId: string, proof: string) => {
    setPaymentRequests(paymentRequests.map(req => 
      req.id === requestId 
        ? { ...req, status: PaymentRequestStatus.PAID, proofOfPayment: proof, paidAt: new Date().toISOString() } 
        : req
    ));
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };
  
  const handleRejectPayment = (requestId: string, reason: string) => {
    setPaymentRequests(paymentRequests.map(req =>
      req.id === requestId
        ? { ...req, status: PaymentRequestStatus.REJECTED, reasonForRejection: reason }
        : req
    ));
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };
  
  const openProcessModal = (request: PaymentRequest) => {
    setActiveRequest(request);
    setIsProcessModalOpen(true);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header
        currentUser={currentUser}
        users={users}
        setCurrentUser={setCurrentUser}
        onCreateRequest={() => setIsCreateModalOpen(true)}
        onManageEvents={() => setIsManageEventsModalOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard
          requests={sortedRequests}
          currentUser={currentUser}
          users={users}
          events={events}
          onProcessPayment={openProcessModal}
          activeFilter={filter}
          setFilter={setFilter}
        />
      </main>
      {isCreateModalOpen && (
        <CreateRequestModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRequest}
          currentUser={currentUser}
          events={events.filter(e => e.allowedUserIds.includes(currentUser.id))}
        />
      )}
      {isProcessModalOpen && activeRequest && (
        <ProcessPaymentModal
          request={activeRequest}
          onClose={() => {
            setIsProcessModalOpen(false);
            setActiveRequest(null);
          }}
          onProcess={handleProcessPayment}
          onReject={handleRejectPayment}
          users={users}
          events={events}
        />
      )}
      {isManageEventsModalOpen && (
        <ManageEventsModal
          onClose={() => setIsManageEventsModalOpen(false)}
          onAddEvent={handleAddEvent}
          events={events}
          users={users.filter(u => u.role === UserRole.REQUESTER)}
        />
      )}
    </div>
  );
};

export default App;
