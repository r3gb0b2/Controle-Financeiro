import React, { useState } from 'react';
import { PaymentRequest, UserRole, PaymentRequestStatus, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { ChevronRightIcon, EyeIcon, BanIcon, UserCircleIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, FileTextIcon } from './icons';

interface RequestListItemProps {
  request: PaymentRequest;
  currentUser: User;
  requesterName: string;
  eventName: string;
  onProcessPayment: (request: PaymentRequest) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onViewProof: (url: string) => void;
}

const RejectionInput: React.FC<{ onConfirm: (reason: string) => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="mt-2 flex flex-col items-end gap-2">
            <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo da rejeição..."
                className="w-full text-sm border border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white"
                rows={2}
            />
            <div className="flex gap-2">
                <button onClick={onCancel} className="text-xs px-2 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
                <button disabled={!reason} onClick={() => onConfirm(reason)} className="text-xs px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">Confirmar</button>
            </div>
        </div>
    );
};


export const RequestListItem: React.FC<RequestListItemProps> = (props) => {
  const { request, currentUser, requesterName, eventName, onProcessPayment, onApproveRequest, onRejectRequest, onViewProof } = props;
  const { amount, recipientFullName, description, status, createdAt, proofOfPaymentDataUrl, reasonForRejection, invoiceUrl } = request;
  const [isRejecting, setIsRejecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleReject = (reason: string) => {
    onRejectRequest(request.id, reason);
    setIsRejecting(false);
  }

  const copySupplierLink = () => {
      const link = `${window.location.origin}/?mode=supplier&id=${request.id}`;
      navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
  };

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
              {(currentUser.role === UserRole.FINANCE || currentUser.role === UserRole.MANAGER) && (
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

          {/* Link para Nota Fiscal (se existir) */}
          {invoiceUrl && (
               <div className="mt-2">
                 <button onClick={() => onViewProof(invoiceUrl)} className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300">
                    <FileTextIcon className="h-4 w-4 mr-1"/>
                    Ver Nota Fiscal
                 </button>
               </div>
          )}

          {status === PaymentRequestStatus.REJECTED && reasonForRejection && (
            <div className="mt-2 flex items-start text-sm text-red-400 bg-red-900/50 p-3 rounded-md border border-red-800">
              <BanIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span><strong className="text-red-300">Motivo da Rejeição:</strong> {reasonForRejection}</span>
            </div>
          )}
           {status === PaymentRequestStatus.PAID && proofOfPaymentDataUrl && (
            <div className="mt-2">
              <button onClick={() => onViewProof(proofOfPaymentDataUrl)} className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300">
                <EyeIcon className="h-4 w-4 mr-1"/>
                Ver Comprovante
              </button>
            </div>
          )}
          {isRejecting && <RejectionInput onConfirm={handleReject} onCancel={() => setIsRejecting(false)} />}
        </div>
        <div className="ml-4 flex-shrink-0">
          {/* Financeiro: Processar Pagamento */}
          {currentUser.role === UserRole.FINANCE && status === PaymentRequestStatus.PENDING && (
            <button
              onClick={() => onProcessPayment(request)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Processar
              <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </button>
          )}
          
          {/* Solicitante: Copiar Link (Aguardando Fornecedor) */}
          {currentUser.id === request.requesterId && status === PaymentRequestStatus.WAITING_SUPPLIER && (
               <button
                  onClick={copySupplierLink}
                  className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-blue-400 bg-gray-800 hover:bg-gray-700"
               >
                  {linkCopied ? 'Copiado!' : 'Copiar Link'}
               </button>
          )}

          {/* Solicitante: Aprovar dados do Fornecedor */}
          {currentUser.id === request.requesterId && status === PaymentRequestStatus.WAITING_REQUESTER_APPROVAL && !isRejecting && (
             <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => setIsRejecting(true)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-red-700 text-sm font-medium rounded-md shadow-sm text-red-300 bg-red-900/40 hover:bg-red-900/80"
                >
                    <XCircleIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onApproveRequest(request.id)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    Confirmar Dados
                </button>
             </div>
          )}

          {/* Gestor: Aprovar Solicitação */}
          {currentUser.role === UserRole.MANAGER && status === PaymentRequestStatus.AWAITING_APPROVAL && !isRejecting && (
             <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => setIsRejecting(true)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-red-700 text-sm font-medium rounded-md shadow-sm text-red-300 bg-red-900/40 hover:bg-red-900/80"
                >
                    <XCircleIcon className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Rejeitar</span>
                </button>
                <button
                    onClick={() => onApproveRequest(request.id)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Aprovar</span>
                </button>
             </div>
          )}
        </div>
      </div>
    </li>
  );
};