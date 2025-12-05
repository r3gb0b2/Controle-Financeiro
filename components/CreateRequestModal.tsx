import React, { useState, useEffect } from 'react';
import { PaymentRequest, Event, EntityType } from '../types';
import { UserGroupIcon, UserIcon } from './icons';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt' | 'requesterId'>) => void;
  events: Event[];
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit, events }) => {
  const [selectedType, setSelectedType] = useState<EntityType>(EntityType.EVENT);
  const [isExternal, setIsExternal] = useState(false); // Toggle: Preenchimento Interno vs Externo
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

  // Reset event selection when type changes
  useEffect(() => {
      setEventId('');
      setCategory('');
  }, [selectedType]);

  const availableEntities = events.filter(e => {
      const type = e.type || EntityType.EVENT;
      return type === selectedType;
  });

  const selectedEntity = events.find(e => e.id === eventId);
  const availableSubcategories = selectedEntity?.subcategories || [];

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
    
    // Validação básica
    if (!eventId || !amount || !description) {
         alert('Preencha os campos obrigatórios (Evento, Valor, Descrição).');
         return;
    }

    // Se for preenchimento interno, exige dados do beneficiário
    if (!isExternal) {
        if (!recipientFullName || !recipientCpf || !recipientEmail) {
            alert('Por favor, preencha os dados do beneficiário.');
            return;
        }
    }

    const numericAmount = parseFloat(amount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

    onSubmit({
      eventId,
      amount: numericAmount,
      recipientFullName: isExternal ? 'Fornecedor Externo (Pendente)' : recipientFullName,
      recipientCpf: isExternal ? '' : recipientCpf,
      recipientRg: isExternal ? '' : recipientRg,
      recipientEmail: isExternal ? '' : recipientEmail,
      description,
      category,
      bankName: isExternal ? '' : bankName,
      bankAgency: isExternal ? '' : bankAgency,
      bankAccount: isExternal ? '' : bankAccount,
      pixKey: isExternal ? '' : pixKey,
      isExternal: isExternal, // Flag importante
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 relative">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Nova Solicitação</h3>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex border-b border-gray-700">
            <button 
                type="button" 
                onClick={() => setIsExternal(false)}
                className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none ${!isExternal ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <div className="flex items-center justify-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Preencher Tudo
                </div>
            </button>
            <button 
                type="button" 
                onClick={() => setIsExternal(true)}
                className={`flex-1 py-3 text-sm font-medium text-center focus:outline-none ${isExternal ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <div className="flex items-center justify-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    Enviar Link
                </div>
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            
            {/* Common Fields */}
            <div>
                <label className={labelClasses}>Tipo de Solicitação</label>
                <div className="mt-2 flex space-x-4">
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio text-blue-600" name="reqType" value={EntityType.EVENT} checked={selectedType === EntityType.EVENT} onChange={() => setSelectedType(EntityType.EVENT)} />
                        <span className="ml-2 text-gray-300">Evento</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio text-blue-600" name="reqType" value={EntityType.COMPANY} checked={selectedType === EntityType.COMPANY} onChange={() => setSelectedType(EntityType.COMPANY)} />
                        <span className="ml-2 text-gray-300">Empresa</span>
                    </label>
                </div>
            </div>

            <div>
              <label htmlFor="event" className={labelClasses}>Selecione {selectedType === EntityType.COMPANY ? 'a Empresa' : 'o Evento'}</label>
              <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClasses} required>
                <option value="" disabled>Selecione uma opção</option>
                {availableEntities.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>

            {selectedEntity && (
                <div>
                   <label htmlFor="category" className={labelClasses}>Categoria / Subcategoria</label>
                   {availableSubcategories.length > 0 ? (
                       <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                           <option value="">Selecione...</option>
                           {availableSubcategories.map((sub, idx) => (
                               <option key={idx} value={sub}>{sub}</option>
                           ))}
                       </select>
                   ) : (
                       <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses} placeholder="Digite a categoria" />
                   )}
                </div>
            )}

            <div>
                <label htmlFor="amount" className={labelClasses}>Valor (R$)</label>
                <input type="text" id="amount" value={amount} onChange={handleAmountChange} className={inputClasses} placeholder="R$ 0,00" required />
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClasses} required></textarea>
            </div>

            {isExternal ? (
                <div className="bg-blue-900/30 p-4 rounded-md border border-blue-800">
                    <p className="text-sm text-blue-200">
                        Ao criar esta solicitação, será gerado um <strong>Link Público</strong>.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Você deverá enviar esse link para o fornecedor preencher os dados bancários, pessoais e anexar a Nota Fiscal. Você conferirá os dados antes de ir para aprovação do gestor.
                    </p>
                </div>
            ) : (
                <>
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
                                <input type="text" id="pixKey" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="E-mail, CPF/CNPJ, celular, etc." className={inputClasses} />
                            </div>
                        </div>
                        </div>
                </>
            )}
            
          </div>
          <div className="p-4 bg-gray-900/50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                {isExternal ? 'Gerar Link' : 'Enviar para Aprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};