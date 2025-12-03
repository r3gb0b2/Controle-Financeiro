export enum UserRole {
  REQUESTER = 'Solicitante',
  FINANCE = 'Financeiro',
}

export enum PaymentRequestStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  REJECTED = 'Rejeitado',
}

export interface PaymentRequest {
  id: string;
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