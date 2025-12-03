import React, { useState } from 'react';
import { PaymentRequest, User, Event } from '../types';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => void;
  currentUser: User;
  events: Event[];
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit, currentUser, events }) => {
  const [eventId, setEventId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'BRL'>('BRL');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [pixKey, setPixKey] = useState('');

  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-300";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !amount || !recipient || !description) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    onSubmit({
      eventId,
      amount: parseFloat(amount),
      currency,
      recipient,
      description,
      bankName,
      bankAgency,
      bankAccount,
      pixKey,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Nova Solicitação de Pagamento</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="event" className={labelClasses}>Evento</label>
              <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClasses} required>
                <option value="" disabled>Selecione um evento</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
             <div>
              <label htmlFor="recipient" className={labelClasses}>Nome do Beneficiário</label>
              <input type="text" id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} className={inputClasses} required />
            </div>
            <div className="flex space-x-4">
                <div className="flex-grow">
                    <label htmlFor="amount" className={labelClasses}>Valor</label>
                    <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} step="0.01" required />
                </div>
                <div>
                    <label htmlFor="currency" className={labelClasses}>Moeda</label>
                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as any)} className={inputClasses}>
                        <option>BRL</option>
                        <option>USD</option>
                        <option>EUR</option>
                    </select>
                </div>
            </div>
            <div>
              <label htmlFor="description" className={labelClasses}>Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClasses} required></textarea>
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
                      <input type="text" id="pixKey" value={pixKey} placeholder="E-mail, CPF/CNPJ, celular, etc." className={inputClasses} />
                  </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900/50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Enviar Solicitação</button>
          </div>
        </form>
      </div>
    </div>
  );
};