export enum UserRole {
  REQUESTER = 'Solicitante',
  MANAGER = 'Gestor',
  FINANCE = 'Financeiro',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Should be handled securely in a real app
}

export enum EntityType {
  EVENT = 'Evento',
  COMPANY = 'Empresa',
}

export enum EventStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
}

export interface Event {
  id: string;
  name: string;
  allowedUserIds: string[];
  status: EventStatus;
  budget?: number;
  type?: EntityType; // Novo campo
  subcategories?: string[]; // Novo campo
}

export enum PaymentRequestStatus {
  WAITING_SUPPLIER = 'Aguardando Fornecedor', // Novo
  WAITING_REQUESTER_APPROVAL = 'Conferência do Solicitante', // Novo
  AWAITING_APPROVAL = 'Aguardando Aprovação',
  PENDING = 'Pendente',
  PAID = 'Pago',
  REJECTED = 'Rejeitado',
}

export interface PaymentRequest {
  id: string;
  requesterId: string;
  eventId: string;
  amount: number;
  
  // Recipient details (can be filled later by supplier)
  recipientFullName: string;
  recipientCpf: string;
  recipientRg: string;
  recipientEmail: string;
  
  description: string;
  status: PaymentRequestStatus;
  createdAt: string;
  category?: string;
  
  // External Link Flow
  isExternal?: boolean; // Se foi criado via link
  invoiceUrl?: string; // URL/Base64 da Nota Fiscal enviada pelo fornecedor
  invoiceFileName?: string;

  // Approval flow
  approverId?: string;
  approvedAt?: string;
  
  // Payment flow
  paidAt?: string;
  proofOfPayment?: string;
  proofOfPaymentDataUrl?: string;

  // Rejection flow
  reasonForRejection?: string;
  
  // Bank details
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  pixKey?: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    createdAt: string;
    read: boolean;
}