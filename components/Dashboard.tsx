import React from 'react';
import { PaymentRequest, User, Event, PaymentRequestStatus } from '../types';
import { RequestList } from './RequestList';
import { DashboardSummary } from './DashboardSummary';

interface DashboardProps {
  summaryRequests: PaymentRequest[];
  listRequests: PaymentRequest[];
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

export const Dashboard: React.FC<DashboardProps> = ({ summaryRequests, listRequests, currentUser, users, events, onProcessPayment, activeFilter, setFilter }) => {
  return (
    <div className="w-full mx-auto">
      <DashboardSummary requests={summaryRequests} />
      
      <div className="mt-8">
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
      
      <div className="mt-6">
        <RequestList
          requests={listRequests}
          currentUser={currentUser}
          users={users}
          events={events}
          onProcessPayment={onProcessPayment}
        />
      </div>
    </div>
  );
};