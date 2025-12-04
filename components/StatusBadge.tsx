import React from 'react';
import { PaymentRequestStatus } from '../types';

interface StatusBadgeProps {
  status: PaymentRequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    [PaymentRequestStatus.AWAITING_APPROVAL]: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
    [PaymentRequestStatus.PENDING]: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
    [PaymentRequestStatus.PAID]: 'bg-green-900/50 text-green-300 border border-green-700/50',
    [PaymentRequestStatus.REJECTED]: 'bg-red-900/50 text-red-300 border border-red-700/50',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
