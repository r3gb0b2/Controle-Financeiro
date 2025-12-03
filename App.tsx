import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreateRequestModal } from './components/CreateRequestModal';
import { ProcessPaymentModal } from './components/ProcessPaymentModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserRole, PaymentRequest, PaymentRequestStatus } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.REQUESTER);
  const [paymentRequests, setPaymentRequests] = useLocalStorage<PaymentRequest[]>('paymentRequests', []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [filter, setFilter] = useState<PaymentRequestStatus | 'ALL'>('ALL');

  useEffect(() => {
    // Adiciona dados iniciais se a lista estiver vazia
    if (paymentRequests.length === 0) {
      const initialData: PaymentRequest[] = [
        { id: '1', amount: 150.75, currency: 'USD', recipient: 'Amazon Web Services', description: 'Hospedagem mensal do servidor', status: PaymentRequestStatus.PAID, createdAt: new Date(2023, 10, 15).toISOString(), proofOfPayment: 'comprovante-aws.pdf', paidAt: new Date(2023, 10, 16).toISOString(), bankName: 'Bank of America', bankAgency: '123', bankAccount: '98765-4' },
        { id: '2', amount: 49.00, currency: 'USD', recipient: 'Figma', description: 'Assinatura da ferramenta de design', status: PaymentRequestStatus.PENDING, createdAt: new Date(2023, 11, 1).toISOString(), pixKey: 'billing@figma.com' },
        { id: '3', amount: 2500.00, currency: 'BRL', recipient: 'Desenvolvedor Freelancer', description: 'Desenvolvimento de componente', status: PaymentRequestStatus.PENDING, createdAt: new Date(2023, 11, 5).toISOString(), bankName: 'Banco Digital X', bankAgency: '0001', bankAccount: '123456-7', pixKey: 'devfreelancer@email.com' },
        { id: '4', amount: 99.99, currency: 'EUR', recipient: 'Agência de Marketing', description: 'Campanha de publicidade', status: PaymentRequestStatus.REJECTED, createdAt: new Date(2023, 10, 20).toISOString(), reasonForRejection: 'A fatura não corresponde ao pedido de compra.' },
      ];
      setPaymentRequests(initialData);
    }
  }, [setPaymentRequests, paymentRequests.length]);

  const handleCreateRequest = (newRequestData: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: PaymentRequest = {
      ...newRequestData,
      id: new Date().getTime().toString(),
      status: PaymentRequestStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    setPaymentRequests([...paymentRequests, newRequest]);
    setIsCreateModalOpen(false);
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
    if (filter === 'ALL') return paymentRequests;
    return paymentRequests.filter(req => req.status === filter);
  }, [filter, paymentRequests]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredRequests]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header userRole={userRole} setUserRole={setUserRole} onCreateRequest={() => setIsCreateModalOpen(true)} />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard
          requests={sortedRequests}
          userRole={userRole}
          onProcessPayment={openProcessModal}
          activeFilter={filter}
          setFilter={setFilter}
        />
      </main>
      {isCreateModalOpen && (
        <CreateRequestModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRequest}
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
        />
      )}
    </div>
  );
};

export default App;