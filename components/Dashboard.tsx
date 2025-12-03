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
  selectedMonth: string;
  setMonth: (month: string) => void;
  availableMonths: string[];
}

const filters: (PaymentRequestStatus | 'ALL')[] = ['ALL', PaymentRequestStatus.PENDING, PaymentRequestStatus.PAID, PaymentRequestStatus.REJECTED];
const filterTranslations: Record<PaymentRequestStatus | 'ALL', string> = {
  ALL: 'Todas',
  [PaymentRequestStatus.PENDING]: 'Pendentes',
  [PaymentRequestStatus.PAID]: 'Pagas',
  [PaymentRequestStatus.REJECTED]: 'Rejeitadas',
}

const formatMonthForDisplay = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const formatted = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const Dashboard: React.FC<DashboardProps> = ({ summaryRequests, listRequests, currentUser, users, events, onProcessPayment, activeFilter, setFilter, selectedMonth, setMonth, availableMonths }) => {
  return (
    <div className="w-full mx-auto">
      <DashboardSummary requests={summaryRequests} />
      
      <div className="mt-8">
        <div className="flex justify-between items-center border-b border-gray-700">
          <div className="flex">
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
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
            >
              <option value="ALL">Todos os Meses</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthForDisplay(month)}
                </option>
              ))}
            </select>
          </div>
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