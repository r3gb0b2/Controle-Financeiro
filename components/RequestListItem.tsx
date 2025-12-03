
import React from 'react';
import { PaymentRequest, UserRole, PaymentRequestStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ChevronRightIcon, DownloadIcon, BanIcon } from './icons';

interface RequestListItemProps {
  request: PaymentRequest;
  userRole: UserRole;
  onProcessPayment: (request: PaymentRequest) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({ request, userRole, onProcessPayment }) => {
  const { id, amount, currency, recipient, description, status, createdAt, proofOfPayment, reasonForRejection } = request;

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <p className="text-lg font-semibold text-indigo-600 truncate">{formattedAmount}</p>
            <StatusBadge status={status} />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <p className="truncate">Para: <span className="font-medium text-gray-700">{recipient}</span> - {description}</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">Solicitado em {formattedDate}</p>
          {status === PaymentRequestStatus.REJECTED && reasonForRejection && (
            <div className="mt-2 flex items-start text-sm text-red-600 bg-red-50 p-2 rounded-md">
              <BanIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span><strong>Motivo da Rejeição:</strong> {reasonForRejection}</span>
            </div>
          )}
           {status === PaymentRequestStatus.PAID && proofOfPayment && (
            <div className="mt-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <DownloadIcon className="h-4 w-4 mr-1"/>
                Ver Comprovante ({proofOfPayment})
              </a>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          {userRole === UserRole.FINANCE && status === PaymentRequestStatus.PENDING && (
            <button
              onClick={() => onProcessPayment(request)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Processar
              <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};