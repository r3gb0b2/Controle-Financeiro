import React from 'react';
import { PaymentRequest, UserRole, PaymentRequestStatus, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { ChevronRightIcon, DownloadIcon, BanIcon, UserCircleIcon, CalendarIcon } from './icons';

interface RequestListItemProps {
  request: PaymentRequest;
  currentUser: User;
  requesterName: string;
  eventName: string;
  onProcessPayment: (request: PaymentRequest) => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({ request, currentUser, requesterName, eventName, onProcessPayment }) => {
  const { amount, recipientFullName, description, status, createdAt, proofOfPayment, reasonForRejection } = request;

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <p className="text-lg font-semibold text-blue-400 truncate">{formattedAmount}</p>
            <StatusBadge status={status} />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-400">
            <p className="truncate">Para: <span className="font-medium text-gray-300">{recipientFullName}</span> - {description}</p>
          </div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
              {currentUser.role === UserRole.FINANCE && (
                 <div className="flex items-center">
                    <UserCircleIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                    <span>{requesterName}</span>
                 </div>
              )}
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                <span className="truncate" title={eventName}>{eventName}</span>
              </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">Solicitado em {formattedDate}</p>
          {status === PaymentRequestStatus.REJECTED && reasonForRejection && (
            <div className="mt-2 flex items-start text-sm text-red-400 bg-red-900/50 p-3 rounded-md border border-red-800">
              <BanIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span><strong className="text-red-300">Motivo da Rejeição:</strong> {reasonForRejection}</span>
            </div>
          )}
           {status === PaymentRequestStatus.PAID && proofOfPayment && (
            <div className="mt-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300">
                <DownloadIcon className="h-4 w-4 mr-1"/>
                Ver Comprovante ({proofOfPayment})
              </a>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          {currentUser.role === UserRole.FINANCE && status === PaymentRequestStatus.PENDING && (
            <button
              onClick={() => onProcessPayment(request)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
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
