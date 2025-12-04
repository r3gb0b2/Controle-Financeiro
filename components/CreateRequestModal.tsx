import React, { useState } from 'react';
import { PaymentRequest, Event } from '../types';
import { UploadIcon, SparklesIcon, BrainCircuitIcon } from './icons';
import { extractInvoiceDetails, suggestCategory } from '../lib/gemini';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => void;
  events: Event[];
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit, events }) => {
  const [eventId, setEventId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [recipientFullName, setRecipientFullName] = useState('');
  const [recipientCpf, setRecipientCpf] = useState('');
  const [recipientRg, setRecipientRg] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setAmount('');
      return;
    }
    const numberValue = parseInt(value, 10) / 100;
    setAmount(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !amount || !recipientFullName || !description || !recipientCpf || !recipientEmail) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const numericAmount = parseFloat(amount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

    onSubmit({
      eventId,
      amount: numericAmount,
      recipientFullName,
      recipientCpf,
      recipientRg,
      recipientEmail,
      description,
      category,
      bankName,
      bankAgency,
      bankAccount,
      pixKey,
    });
  };

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessingAI(true);
      try {
        const base64Data = await fileToBase64(file);
        const result = await extractInvoiceDetails(base64Data, file.type);
        if (result) {
          setRecipientFullName(result.recipientName || recipientFullName);
          setAmount(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.amount || 0));
          setDescription(result.description || description);
        }
      } catch (error) {
        console.error("Error processing invoice:", error);
        alert("Não foi possível processar a fatura.");
      } finally {
        setIsProcessingAI(false);
      }
    }
  };

  const handleSuggestCategory = async () => {
    if (!description) {
        alert("Por favor, preencha a descrição primeiro.");
        return;
    }
    setIsProcessingAI(true);
    try {
        const suggested = await suggestCategory(description);
        if (suggested) {
            setCategory(suggested);
        }
    } catch (error) {
        console.error("Error suggesting category:", error);
        alert("Não foi possível sugerir uma categoria.");
    } finally {
        setIsProcessingAI(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 relative">
        {isProcessingAI && (
            <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center z-10 rounded-lg">
                <BrainCircuitIcon className="h-10 w-10 text-blue-400 animate-pulse" />
                <p className="text-white mt-2">Processando com IA...</p>
            </div>
        )}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Nova Solicitação</h3>
          <label className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <UploadIcon className="h-4 w-4" />
            <span>Extrair de Fatura</span>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleInvoiceUpload} />
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="event" className={labelClasses}>Evento (apenas eventos ativos são exibidos)</label>
              <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClasses} required>
                <option value="" disabled>Selecione um evento</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
               <h4 className="text-md font-medium text-gray-200">Dados do Beneficiário</h4>
            </div>
            
            <div>
              <label htmlFor="recipientFullName" className={labelClasses}>Nome Completo</label>
              <input type="text" id="recipientFullName" value={recipientFullName} onChange={(e) => setRecipientFullName(e.target.value)} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipientCpf" className={labelClasses}>CPF / CNPJ</label>
                  <input type="text" id="recipientCpf" value={recipientCpf} onChange={(e) => setRecipientCpf(e.target.value)} className={inputClasses} required />
                </div>
                 <div>
                  <label htmlFor="recipientRg" className={labelClasses}>RG (Opcional)</label>
                  <input type="text" id="recipientRg" value={recipientRg} onChange={(e) => setRecipientRg(e.target.value)} className={inputClasses} />
                </div>
            </div>
             <div>
                <label htmlFor="recipientEmail" className={labelClasses}>Email</label>
                <input type="email" id="recipientEmail" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={inputClasses} required />
             </div>


            <div className="pt-4 border-t border-gray-700">
               <h4 className="text-md font-medium text-gray-200">Detalhes do Pagamento</h4>
            </div>

            <div>
                <label htmlFor="amount" className={labelClasses}>Valor (R$)</label>
                <input type="text" id="amount" value={amount} onChange={handleAmountChange} className={inputClasses} placeholder="R$ 0,00" required />
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClasses} required></textarea>
            </div>

             <div className="relative">
                <label htmlFor="category" className={labelClasses}>Categoria</label>
                <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses} />
                <button type="button" onClick={handleSuggestCategory} className="absolute right-1 top-7 p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md">
                    <SparklesIcon className="h-4 w-4" />
                </button>
             </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-md font-medium text-gray-200">Dados Bancários</h4>
              <p className="text-sm text-gray-400">Preencha ao menos um dos métodos de pagamento.</p>
              <div className="space-y-4 mt-2">
                  <div>
                      <label htmlFor="bankName" className={labelClasses}>Banco</label>
                      <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClasses} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="bankAgency" className={labelClasses}>Agência</label>
                          <input type="text" id="bankAgency" value={bankAgency} onChange={(e) => setBankAgency(e.target.value)} className={inputClasses} />
                      </div>
                      <div>
                          <label htmlFor="bankAccount" className={labelClasses}>Conta com dígito</label>
                          <input type="text" id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className={inputClasses} />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="pixKey" className={labelClasses}>Chave PIX</label>
                      <input type="text" id="pixKey" placeholder="E-mail, CPF/CNPJ, celular, etc." className={inputClasses} />
                  </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900/50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Enviar para Aprovação</button>
          </div>
        </form>
      </div>
    </div>
  );
};