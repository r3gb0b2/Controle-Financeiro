import React from 'react';
import { PaymentRequest, User, Event } from '../types';
import { RequestListItem } from './RequestListItem';
import { InboxIcon } from './icons';

interface RequestListProps {
  requests: PaymentRequest[];
  currentUser: User;
  users: User[];
  events: Event[];
  onProcessPayment: (request: PaymentRequest) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onViewProof: (url: string) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, currentUser, users, events, onProcessPayment, onApproveRequest, onRejectRequest, onViewProof }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
        <InboxIcon className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-300">Nenhuma solicitação de pagamento</h3>
        <p className="mt-1 text-sm text-gray-500">Não há solicitações que correspondam aos filtros ou busca atual.</p>
        {currentUser.role === 'Solicitante' && (
             <p className="mt-1 text-sm text-gray-500">Tente criar uma nova solicitação.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-lg overflow-hidden rounded-md border border-gray-700">
      <ul role="list" className="divide-y divide-gray-700">
        {requests.map(request => (
          <RequestListItem
            key={request.id}
            request={request}
            currentUser={currentUser}
            requesterName={users.find(u => u.id === request.requesterId)?.name || 'Desconhecido'}
            eventName={events.find(e => e.id === request.eventId)?.name || 'N/A'}
            onProcessPayment={onProcessPayment}
            onApproveRequest={onApproveRequest}
            onRejectRequest={onRejectRequest}
            onViewProof={onViewProof}
          />
        ))}
      </ul>
    </div>
  );
};
