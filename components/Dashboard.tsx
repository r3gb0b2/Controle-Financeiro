import React from 'react';
import { PaymentRequest, User, Event, PaymentRequestStatus } from '../types';
import { RequestList } from './RequestList';

interface DashboardProps {
  requests: PaymentRequest[];
  currentUser: User;
  users: User[];
  events: Event[];
  onProcessPayment: (request: PaymentRequest) => void;
  activeFilter: PaymentRequestStatus | 'ALL';
  setFilter: (filter: PaymentRequestStatus | 'ALL') => void;
}

const filters: (PaymentRequestStatus | 'ALL')[] = ['ALL', PaymentRequestStatus.PENDING, PaymentRequestStatus.PAID, PaymentRequestStatus.REJECTED];
const filterTranslations: Record<PaymentRequestStatus | 'ALL', string> = {
  ALL: 'Todas',
  [PaymentRequestStatus.PENDING]: 'Pendentes',
  [PaymentRequestStatus.PAID]: 'Pagas',
  [PaymentRequestStatus.REJECTED]: 'Rejeitadas',
}

export const Dashboard: React.FC<DashboardProps> = ({ requests, currentUser, users, events, onProcessPayment, activeFilter, setFilter }) => {
  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setFilter(filter)}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-t-md ${
                activeFilter === filter
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {filterTranslations[filter]}
            </button>
          ))}
        </div>
      </div>
      
      <RequestList
        requests={requests}
        currentUser={currentUser}
        users={users}
        events={events}
        onProcessPayment={onProcessPayment}
      />
    </div>
  );
};