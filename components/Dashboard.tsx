
import React from 'react';
import { PaymentRequest, UserRole, PaymentRequestStatus } from '../types';
import { RequestList } from './RequestList';

interface DashboardProps {
  requests: PaymentRequest[];
  userRole: UserRole;
  onProcessPayment: (request: PaymentRequest) => void;
  activeFilter: PaymentRequestStatus | 'ALL';
  setFilter: (filter: PaymentRequestStatus | 'ALL') => void;
}

const filters: (PaymentRequestStatus | 'ALL')[] = ['ALL', PaymentRequestStatus.PENDING, PaymentRequestStatus.PAID, PaymentRequestStatus.REJECTED];

export const Dashboard: React.FC<DashboardProps> = ({ requests, userRole, onProcessPayment, activeFilter, setFilter }) => {
  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === PaymentRequestStatus.PENDING).length,
    paid: requests.filter(r => r.status === PaymentRequestStatus.PAID).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard de Solicitações</h2>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setFilter(filter)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter === 'ALL' ? 'Todas as Solicitações' : filter}
            </button>
          ))}
        </div>
      </div>
      
      <RequestList
        requests={requests}
        userRole={userRole}
        onProcessPayment={onProcessPayment}
      />
    </div>
  );
};