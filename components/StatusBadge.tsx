
import React from 'react';
import { PaymentRequestStatus } from '../types';

interface StatusBadgeProps {
  status: PaymentRequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    [PaymentRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentRequestStatus.PAID]: 'bg-green-100 text-green-800',
    [PaymentRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
