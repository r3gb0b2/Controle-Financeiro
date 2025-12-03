
import React from 'react';
import { PaymentRequest, UserRole } from '../types';
import { RequestListItem } from './RequestListItem';
import { InboxIcon } from './icons';

interface RequestListProps {
  requests: PaymentRequest[];
  userRole: UserRole;
  onProcessPayment: (request: PaymentRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, userRole, onProcessPayment }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação de pagamento</h3>
        <p className="mt-1 text-sm text-gray-500">Não há solicitações que correspondam ao filtro atual.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {requests.map(request => (
          <RequestListItem
            key={request.id}
            request={request}
            userRole={userRole}
            onProcessPayment={onProcessPayment}
          />
        ))}
      </ul>
    </div>
  );
};