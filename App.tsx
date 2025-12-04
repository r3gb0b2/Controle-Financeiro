import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { CreateRequestModal } from './components/CreateRequestModal';
import { ProcessPaymentModal } from './components/ProcessPaymentModal';
import { ManageEventsModal } from './components/ManageEventsModal';
import { ManageUsersModal } from './components/ManageUsersModal';
import { UserRole, PaymentRequest, PaymentRequestStatus, User, Event, EventStatus, Notification } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { ViewProofModal } from './components/ViewProofModal';
import { ReportsModal } from './components/ReportsModal';

// Dados iniciais para popular o Firestore na primeira execução (opcional)
const initialUsers: User[] = [
  { id: 'user1', name: 'Ana Silva', role: UserRole.REQUESTER, email: 'ana@email.com' },
  { id: 'user2', name: 'Bruno Costa', role: UserRole.REQUESTER, email: 'bruno@email.com' },
  { id: 'user4', name: 'Daniela Marques', role: UserRole.MANAGER, email: 'daniela@email.com' },
  { id: 'user3', name: 'Carlos Dias', role: UserRole.FINANCE, email: 'carlos@email.com' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isManageEventsModalOpen, setIsManageEventsModalOpen] = useState(false);
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false);
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userQuery = query(collection(db, "users"), where("email", "==", firebaseUser.email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as User;
          setCurrentUser({ ...userData, id: userSnapshot.docs[0].id });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPaymentRequests([]);
      setEvents([]);
      setUsers([]);
      setNotifications([]);
      return;
    }

    // Listener para usuários
    const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(fetchedUsers);
    });

    // Listener para eventos
    const eventsUnsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(fetchedEvents);
    });

    // Listener para solicitações de pagamento
    const requestsUnsub = onSnapshot(collection(db, "paymentRequests"), (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest));
      setPaymentRequests(fetchedRequests);
    });
    
    // Listener para notificações do usuário atual
    const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", currentUser.id));
    const notificationsUnsub = onSnapshot(notificationsQuery, (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
          .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(fetchedNotifications);
    });

    return () => {
      usersUnsub();
      eventsUnsub();
      requestsUnsub();
      notificationsUnsub();
    };
  }, [currentUser]);
  
  const createNotification = async (userId: string, message: string) => {
    const newNotification: Omit<Notification, 'id'> = {
      userId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, "notifications"), newNotification);
  };

  const handleCreateRequest = async (newRequestData: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => {
    if (!currentUser) return;
    const newRequest: Omit<PaymentRequest, 'id'> = {
      ...newRequestData,
      status: PaymentRequestStatus.AWAITING_APPROVAL,
      createdAt: new Date().toISOString(),
      requesterId: currentUser.id,
    };
    const docRef = await addDoc(collection(db, "paymentRequests"), newRequest);
    
    users.filter(u => u.role === UserRole.MANAGER).forEach(manager => {
      createNotification(manager.id, `Nova solicitação de ${currentUser.name} (R$ ${newRequest.amount.toFixed(2)}) aguardando sua aprovação.`);
    });
    setIsCreateModalOpen(false);
  };
  
  const handleAddEvent = async (newEventData: Omit<Event, 'id'>) => {
    await addDoc(collection(db, "events"), newEventData);
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const eventRef = doc(db, "events", updatedEvent.id);
    await updateDoc(eventRef, { ...updatedEvent });
  };
  
  const handleAddUser = async (newUserData: Pick<User, 'name' | 'email'>) => {
    // NOTE: In a production app, creating a Firebase Auth user should be done in a secure backend environment (e.g., Cloud Function).
    // This only adds the user profile to Firestore.
    const newUser: Omit<User, 'id'> = {
      ...newUserData,
      role: UserRole.REQUESTER,
    };
    await addDoc(collection(db, "users"), newUser);
  };

  const handleProcessPayment = async (requestId: string, proof: string, proofDataUrl: string) => {
    const requestRef = doc(db, "paymentRequests", requestId);
    const request = paymentRequests.find(r => r.id === requestId);
    await updateDoc(requestRef, {
      status: PaymentRequestStatus.PAID,
      proofOfPayment: proof,
      paidAt: new Date().toISOString(),
      proofOfPaymentDataUrl: proofDataUrl
    });
    if (request) {
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi paga.`);
    }
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };
  
  const handleRejectPayment = async (requestId: string, reason: string) => {
    const requestRef = doc(db, "paymentRequests", requestId);
    const request = paymentRequests.find(r => r.id === requestId);
    await updateDoc(requestRef, {
      status: PaymentRequestStatus.REJECTED,
      reasonForRejection: reason
    });
    if (request) {
      const actor = users.find(u => u.id === currentUser?.id)?.role;
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi rejeitada pelo ${actor}.`);
    }
    setIsProcessModalOpen(false);
    setActiveRequest(null);
  };

  const handleApproveRequest = async (requestId: string) => {
    if(!currentUser) return;
    const requestRef = doc(db, "paymentRequests", requestId);
    const request = paymentRequests.find(r => r.id === requestId);
    await updateDoc(requestRef, {
      status: PaymentRequestStatus.PENDING,
      approverId: currentUser.id,
      approvedAt: new Date().toISOString()
    });
    if (request) {
      createNotification(request.requesterId, `Sua solicitação para ${request.recipientFullName} foi aprovada e enviada ao financeiro.`);
      users.filter(u => u.role === UserRole.FINANCE).forEach(financeUser => {
        createNotification(financeUser.id, `Nova solicitação de ${users.find(u=>u.id===request.requesterId)?.name} aprovada e aguardando pagamento.`);
      });
    }
  };

  const handleSetNotificationsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read && n.userId === currentUser?.id);
    if(unreadNotifications.length === 0) return;
    
    const batch = writeBatch(db);
    unreadNotifications.forEach(n => {
        const notifRef = doc(db, "notifications", n.id);
        batch.update(notifRef, { read: true });
    });
    await batch.commit();
  }
  
  const openProcessModal = (request: PaymentRequest) => {
    setActiveRequest(request);
    setIsProcessModalOpen(true);
  };
  
  const openViewProofModal = (url: string) => {
    setViewingProofUrl(url);
    setIsViewProofModalOpen(true);
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <>
      <Layout 
        currentUser={currentUser} 
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
        notifications={notifications}
        setNotificationsRead={handleSetNotificationsRead}
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
