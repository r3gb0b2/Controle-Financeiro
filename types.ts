export enum UserRole {
  REQUESTER = 'Solicitante',
  FINANCE = 'Financeiro',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Should be handled securely in a real app
}

export interface Event {
  id: string;
  name: string;
  allowedUserIds: string[];
}

export enum PaymentRequestStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  REJECTED = 'Rejeitado',
}

export interface PaymentRequest {
  id: string;
  requesterId: string;
  eventId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'BRL';
  recipient: string;
  description: string;
  status: PaymentRequestStatus;
  createdAt: string;
  paidAt?: string;
  proofOfPayment?: string;
  reasonForRejection?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  pixKey?: string;
}