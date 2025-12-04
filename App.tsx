import React, { useState, useEffect } from 'react';
import { CreateRequestModal } from './components/CreateRequestModal';
import { ProcessPaymentModal } from './components/ProcessPaymentModal';
import { ManageEventsModal } from './components/ManageEventsModal';
import { ManageUsersModal } from './components/ManageUsersModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserRole, PaymentRequest, PaymentRequestStatus, User, Event, EventStatus, Notification } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { ViewProofModal } from './components/ViewProofModal';
import { ReportsModal } from './components/ReportsModal';

const initialUsers: User[] = [
  { id: 'user1', name: 'Ana Silva', role: UserRole.REQUESTER, email: 'ana@email.com', password: '123' },
  { id: 'user2', name: 'Bruno Costa', role: UserRole.REQUESTER, email: 'bruno@email.com', password: '122' }, // Senha errada para teste
  { id: 'user4', name: 'Daniela Marques', role: UserRole.MANAGER, email: 'daniela@email.com', password: '123' },
  { id: 'user3', name: 'Carlos Dias', role: UserRole.FINANCE, email: 'carlos@email.com', password: '123' },
];

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [paymentRequests, setPaymentRequests] = useLocalStorage<PaymentRequest[]>('paymentRequests', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isManageEventsModalOpen, setIsManageEventsModalOpen] = useState(false);
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false);
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Adiciona dados iniciais se a lista estiver vazia
    if (users.length === 0) {
      setUsers(initialUsers);
    }
    if (paymentRequests.length === 0 && events.length === 0) {
      const initialEvents: Event[] = [
        { id: 'event1', name: 'Viagem Conferência WebTech 2024', allowedUserIds: ['user1'], status: EventStatus.ACTIVE, budget: 5000 },
        { id: 'event2', name: 'Compras de Material de Escritório - Q4', allowedUserIds: ['user1', 'user2'], status: EventStatus.ACTIVE, budget: 1000 },
        { id: 'event3', name: 'Pagamento Fornecedores TI', allowedUserIds: ['user2'], status: EventStatus.INACTIVE, budget: 10000 },
      ];
      setEvents(initialEvents);

      const initialData: PaymentRequest[] = [
        { id: '1', requesterId: 'user1', eventId: 'event1', amount: 150.75, recipientFullName: 'Amazon Web Services', recipientCpf: 'N/A', recipientRg: 'N/A', recipientEmail: 'billing@aws.com', description: 'Hospedagem mensal do servidor', status: PaymentRequestStatus.PAID, createdAt: new Date(2023, 10, 15).toISOString(), proofOfPayment: 'comprovante-aws.pdf', paidAt: new Date(2023, 10, 16).toISOString(), bankName: 'Bank of America', bankAgency: '123', bankAccount: '98765-4', approverId: 'user4', approvedAt: new Date(2023, 10, 15).toISOString(), category: 'Infraestrutura de TI' },
        { id: '2', requesterId: 'user2', eventId: 'event2', amount: 49.00, recipientFullName: 'Figma Inc.', recipientCpf: 'N/A', recipientRg: 'N/A', recipientEmail: 'billing@figma.com', description: 'Assinatura da ferramenta de design', status: PaymentRequestStatus.PENDING, createdAt: new Date(2023, 11, 1).toISOString(), pixKey: 'billing@figma.com', approverId: 'user4', approvedAt: new Date(2023, 11, 2).toISOString(), category: 'Software' },
        { id: '3', requesterId: 'user1', eventId: 'event2', amount: 2500.00, recipientFullName: 'João da Silva (Freelancer)', recipientCpf: '123.456.789-00', recipientRg: '12.345.678-9', recipientEmail: 'joao.freela@email.com', description: 'Desenvolvimento de componente', status: PaymentRequestStatus.AWAITING_APPROVAL, createdAt: new Date(2023, 11, 5).toISOString(), bankName: 'Banco Digital X', bankAgency: '0001', bankAccount: '123456-7', pixKey: '12345678900', category: 'Serviços de Terceiros' },
        { id: '4', requesterId: 'user1', eventId: 'event2', amount: 99.99, recipientFullName: 'Papelaria Central', recipientCpf: '11.222.333/0001-44', recipientRg: 'N/A', recipientEmail: 'contato@papelariacentral.com', description: 'Material de escritório', status: PaymentRequestStatus.REJECTED, createdAt: new Date(2023, 10, 20).toISOString(), reasonForRejection: 'A fatura não corresponde ao pedido de compra.', category: 'Material de Escritório' },
      ];
      setPaymentRequests(initialData);
    }
  }, [setPaymentRequests, setEvents, paymentRequests.length, events.length, users.length, setUsers]);
  
  const createNotification = (userId: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      userId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const handleLogin = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateRequest = (newRequestData: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => {
    if (!currentUser) return;
    const newRequest: PaymentRequest = {
      ...newRequestData,
      id: new Date().getTime().toString(),
      status: PaymentRequestStatus.AWAITING_APPROVAL,
      createdAt: new Date().toISOString(),
      requesterId: currentUser.id,
    };
    setPaymentRequests([...paymentRequests, newRequest]);
    users.filter(u => u.role === UserRole.MANAGER).forEach(manager => {
      createNotification(manager.id, `Nova solicitação de ${currentUser.name} (R$ ${newRequest.amount.toFixed(2)}) aguardando sua aprovação.`);
    });
    setIsCreateModalOpen(false);
  };
  
  const handleAddEvent = (newEventData: Omit<Event, 'id' | 'spent'>) => {
    const newEvent: Event = {
      ...newEventData,
      id: new Date().getTime().toString(),
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };
  
  const handleAddUser = (newUserData: Pick<User, 'name' | 'email'>) => {
    const newUser: User = {
      ...newUserData,
      id: new Date().getTime().toString(),
      role: UserRole.REQUESTER,
      password: '123', // Default password for new users
    };
    setUsers([...users, newUser]);
  };

  const handleProcessPayment = (requestId: string, proof: string, proofDataUrl: string) => {
    const request = paymentRequests.find(r => r.id === requestId);
    setPaymentRequests(paymentRequests.map(req => 
      req.id === requestId 
        ? { ...req, status: PaymentRequestStatus.PAID, proofOfPayment: proof, paidAt: new Date().toISOString(), proofOfPaymentDataUrl: proofDataUrl } 
        : req
    ));
    if (request) {
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi paga.`);
    }
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };
  
  const handleRejectPayment = (requestId: string, reason: string) => {
    const request = paymentRequests.find(r => r.id === requestId);
    setPaymentRequests(paymentRequests.map(req =>
      req.id === requestId
        ? { ...req, status: PaymentRequestStatus.REJECTED, reasonForRejection: reason }
        : req
    ));
    if (request) {
      const actor = users.find(u => u.id === currentUser?.id)?.role;
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi rejeitada pelo ${actor}.`);
    }
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };

  const handleApproveRequest = (requestId: string) => {
    if(!currentUser) return;
    const request = paymentRequests.find(r => r.id === requestId);
    setPaymentRequests(paymentRequests.map(req =>
      req.id === requestId
        ? { ...req, status: PaymentRequestStatus.PENDING, approverId: currentUser.id, approvedAt: new Date().toISOString() }
        : req
    ));
    if (request) {
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi aprovada e enviada ao financeiro.`);
      users.filter(u => u.role === UserRole.FINANCE).forEach(financeUser => {
        createNotification(financeUser.id, `Nova solicitação de ${users.find(u=>u.id===request.requesterId)?.name} aprovada e aguardando pagamento.`);
      });
    }
  };
  
  const openProcessModal = (request: PaymentRequest) => {
    setActiveRequest(request);
    setIsProcessModalOpen(true);
  };
  
  const openViewProofModal = (url: string) => {
    setViewingProofUrl(url);
    setIsViewProofModalOpen(true);
  };


  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onCreateRequest={() => setIsCreateModalOpen(true)}
        onManageEvents={() => setIsManageEventsModalOpen(true)}
        onManageUsers={() => setIsManageUsersModalOpen(true)}
        onOpenReports={() => setIsReportsModalOpen(true)}
        paymentRequests={paymentRequests}
        users={users}
        events={events}
        onProcessPayment={openProcessModal}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectPayment}
        onViewProof={openViewProofModal}
        notifications={notifications.filter(n => n.userId === currentUser.id)}
        setNotifications={setNotifications}
      />
      
      {isCreateModalOpen && (
        <CreateRequestModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRequest}
          events={events.filter(e => e.allowedUserIds.includes(currentUser.id) && e.status === EventStatus.ACTIVE)}
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
          onUpdateEvent={handleUpdateEvent}
          events={events}
          paymentRequests={paymentRequests}
          users={users.filter(u => u.role === UserRole.REQUESTER)}
        />
      )}
       {isManageUsersModalOpen && (
        <ManageUsersModal
          onClose={() => setIsManageUsersModalOpen(false)}
          onAddUser={handleAddUser}
          users={users}
        />
      )}
      {isViewProofModalOpen && viewingProofUrl && (
        <ViewProofModal
            onClose={() => setIsViewProofModalOpen(false)}
            proofUrl={viewingProofUrl}
        />
      )}
      {isReportsModalOpen && (
        <ReportsModal
            onClose={() => setIsReportsModalOpen(false)}
            requests={paymentRequests}
            users={users}
            events={events}
        />
      )}
    </>
  );
};

export default App;