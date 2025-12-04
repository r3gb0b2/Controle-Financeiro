import React, { useMemo } from 'react';
import { PaymentRequest, PaymentRequestStatus } from '../types';
import { CashIcon, ClockIcon } from './icons';

interface DashboardSummaryProps {
  requests: PaymentRequest[];
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ requests }) => {
  const summary = useMemo(() => {
    return requests.reduce(
      (acc, req) => {
        if (req.status === PaymentRequestStatus.PAID) {
          acc.totalPaid += req.amount;
        } else if (req.status === PaymentRequestStatus.PENDING || req.status === PaymentRequestStatus.AWAITING_APPROVAL) {
          acc.totalPending += req.amount;
          if(req.status === PaymentRequestStatus.PENDING) acc.pendingCount += 1;
        }
        return acc;
      },
      { totalPaid: 0, totalPending: 0, pendingCount: 0 }
    );
  }, [requests]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard
        title="Total Pago"
        value={formatCurrency(summary.totalPaid)}
        icon={CashIcon}
        colorClass="bg-green-600/50"
      />
      <SummaryCard
        title="Pendente de Pagamento"
        value={formatCurrency(summary.totalPending)}
        icon={ClockIcon}
        colorClass="bg-yellow-600/50"
      />
      <SummaryCard
        title="Solicitações Pendentes (Financeiro)"
        value={summary.pendingCount}
        icon={ClockIcon}
        colorClass="bg-blue-600/50"
      />
    </div>
  );
};