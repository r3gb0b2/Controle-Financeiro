import React, { useState } from 'react';
import { PaymentRequest } from '../types';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'BRL'>('BRL');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [pixKey, setPixKey] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipient || !description) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    onSubmit({
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Nova Solicitação de Pagamento</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Nome do Beneficiário</label>
              <input type="text" id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div className="flex space-x-4">
                <div className="flex-grow">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
                    <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.01" required />
                </div>
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Moeda</label>
                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option>BRL</option>
                        <option>USD</option>
                        <option>EUR</option>
                    </select>
                </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-800">Dados Bancários</h4>
              <p className="text-sm text-gray-500">Preencha ao menos um dos métodos de pagamento.</p>
              <div className="space-y-4 mt-2">
                  <div>
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Banco</label>
                      <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="bankAgency" className="block text-sm font-medium text-gray-700">Agência</label>
                          <input type="text" id="bankAgency" value={bankAgency} onChange={(e) => setBankAgency(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                      </div>
                      <div>
                          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">Conta com dígito</label>
                          <input type="text" id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700">Chave PIX</label>
                      <input type="text" id="pixKey" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="E-mail, CPF/CNPJ, celular, etc." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700">Enviar Solicitação</button>
          </div>
        </form>
      </div>
    </div>
  );
};