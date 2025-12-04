import React, { useState } from 'react';
import { PaymentRequest, User, Event } from '../types';
import { analyzeRisk, isGeminiAvailable } from '../lib/gemini';
import { BrainCircuitIcon } from './icons';

interface ProcessPaymentModalProps {
  request: PaymentRequest;
  onClose: () => void;
  onProcess: (requestId: string, proof: string, proofDataUrl: string) => void;
  onReject: (requestId: string, reason: string) => void;
  users: User[];
  events: Event[];
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({ request, onClose, onProcess, onReject, users, events }) => {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const requesterName = users.find(u => u.id === request.requesterId)?.name || 'Desconhecido';
  const eventName = events.find(e => e.id === request.eventId)?.name || 'N/A';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const dataUrl = await fileToDataUrl(file);
      setProofDataUrl(dataUrl);
    }
  };

  const handleProcess = () => {
    if (!proofFile || !proofDataUrl) {
      alert('Por favor, carregue o comprovante de pagamento.');
      return;
    }
    onProcess(request.id, proofFile.name, proofDataUrl);
  };

  const handleReject = () => {
    if (!rejectionReason) {
        alert('Por favor, forneça um motivo para a rejeição.');
        return;
    }
    onReject(request.id, rejectionReason);
  };

  const handleAnalyzeRisk = async () => {
    if (!isGeminiAvailable) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        const result = await analyzeRisk(request);
        setAnalysisResult(result);
    } catch (error) {
        console.error(error);
        setAnalysisResult("Ocorreu um erro ao analisar o risco.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(request.amount);
  const hasBankDetails = request.bankName || request.bankAgency || request.bankAccount || request.pixKey;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">Processar Solicitação</h3>
              <p className="text-sm text-gray-400 mt-1">Solicitante: {requesterName}</p>
            </div>
             <button 
                onClick={handleAnalyzeRisk} 
                disabled={isAnalyzing || !isGeminiAvailable} 
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isGeminiAvailable ? "Funcionalidade de IA indisponível. Configure a API Key." : "Analisar risco de fraude com IA"}
              >
                <BrainCircuitIcon className={`h-4 w-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                <span>{isAnalyzing ? 'Analisando...' : 'Analisar Risco com IA'}</span>
            </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {analysisResult && (
            <div className='mb-4 p-3 rounded-md bg-purple-900/50 border border-purple-700'>
                <p className="text-sm text-purple-200 whitespace-pre-wrap">{analysisResult}</p>
            </div>
          )}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Valor</dt>
                <dd className="mt-1 text-lg font-semibold text-blue-400">{formattedAmount}</dd>
              </div>
               <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Evento</dt>
                <dd className="mt-1 text-sm text-gray-200">{eventName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-400">Descrição</dt>
                <dd className="mt-1 text-sm text-gray-200">{request.description}</dd>
              </div>
              
               <div className="sm:col-span-2 pt-4 mt-4 border-t border-gray-700">
                    <dt className="text-sm font-medium text-gray-400">Dados do Beneficiário</dt>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-400">Nome Completo</dt>
                <dd className="mt-1 text-sm text-gray-200">{request.recipientFullName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">CPF / CNPJ</dt>
                <dd className="mt-1 text-sm text-gray-200">{request.recipientCpf}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">RG</dt>
                <dd className="mt-1 text-sm text-gray-200">{request.recipientRg || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-200">{request.recipientEmail}</dd>
              </div>

              {hasBankDetails && (
                <div className="sm:col-span-2 pt-4 mt-4 border-t border-gray-700">
                    <dt className="text-sm font-medium text-gray-400">Dados para Pagamento</dt>
                </div>
              )}

              {request.bankName && <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-400">Banco</dt><dd className="mt-1 text-sm text-gray-200">{request.bankName}</dd></div>}
              {request.bankAgency && <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-400">Agência</dt><dd className="mt-1 text-sm text-gray-200">{request.bankAgency}</dd></div>}
              {request.bankAccount && <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-400">Conta</dt><dd className="mt-1 text-sm text-gray-200">{request.bankAccount}</dd></div>}
              {request.pixKey && <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-400">Chave PIX</dt><dd className="mt-1 text-sm text-gray-200">{request.pixKey}</dd></div>}
            </dl>
          </div>

          {isRejecting ? (
             <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-300">Motivo da Rejeição</label>
                <textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-gray-700 text-white" required />
            </div>
          ) : (
            <div>
                <label className="block text-sm font-medium text-gray-300">Comprovante de Pagamento</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {proofDataUrl ? <img src={proofDataUrl} alt="Preview" className="mx-auto h-24 w-auto rounded-md" /> : (
                          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
                                <span>Carregar um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" accept="image/*,.pdf" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF até 10MB</p>
                        {proofFile && <p className="text-sm text-green-400 pt-2">{proofFile.name}</p>}
                    </div>
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 flex justify-between rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Cancelar</button>
          {isRejecting ? (
            <div className="flex space-x-2">
                <button type="button" onClick={() => setIsRejecting(false)} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Voltar</button>
                <button type="button" onClick={handleReject} className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700">Confirmar Rejeição</button>
            </div>
          ) : (
            <div className="flex space-x-2">
                <button type="button" onClick={() => setIsRejecting(true)} className="px-4 py-2 bg-red-800 border border-transparent rounded-md text-sm font-medium text-red-200 hover:bg-red-700">Rejeitar</button>
                <button type="button" onClick={handleProcess} className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">Aprovar e Marcar como Pago</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};