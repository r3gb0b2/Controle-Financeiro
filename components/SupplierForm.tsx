import React, { useState, useEffect } from 'react';
import { PaymentRequest, Event } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UploadIcon, CheckCircleIcon } from './icons';

interface SupplierFormProps {
  requestId: string;
}

const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

export const SupplierForm: React.FC<SupplierFormProps> = ({ requestId }) => {
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [recipientFullName, setRecipientFullName] = useState('');
  const [recipientCpf, setRecipientCpf] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, "paymentRequests", requestId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as PaymentRequest;
          setRequest({ ...data, id: docSnap.id });
          
          if (data.eventId) {
              const eventRef = doc(db, "events", data.eventId);
              const eventSnap = await getDoc(eventRef);
              if (eventSnap.exists()) {
                  setEvent(eventSnap.data() as Event);
              }
          }

        } else {
          setError('Solicitação não encontrada.');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar solicitação.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    if (!recipientFullName || !recipientCpf || !recipientEmail) {
        alert("Preencha os dados pessoais obrigatórios.");
        return;
    }

    setLoading(true);
    try {
        let invoiceDataUrl = '';
        if (invoiceFile) {
            invoiceDataUrl = await fileToDataUrl(invoiceFile);
        }

        const updateData: any = {
            recipientFullName,
            recipientCpf,
            recipientEmail,
            bankName,
            bankAgency,
            bankAccount,
            pixKey,
            status: 'Conferência do Solicitante', // WAITING_REQUESTER_APPROVAL
        };

        if (invoiceDataUrl) {
            updateData.invoiceUrl = invoiceDataUrl;
            updateData.invoiceFileName = invoiceFile?.name;
        }

        const docRef = doc(db, "paymentRequests", request.id);
        await updateDoc(docRef, updateData);
        setSubmitted(true);
    } catch (err) {
        console.error(err);
        alert("Erro ao enviar dados. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && !submitted) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">{error}</div>;

  if (submitted) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full border border-green-700">
                  <div className="flex justify-center mb-4">
                      <CheckCircleIcon className="h-16 w-16 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Dados Enviados!</h2>
                  <p className="text-gray-300">O solicitante foi notificado e irá revisar suas informações para processar o pagamento.</p>
              </div>
          </div>
      );
  }

  const formattedAmount = request ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(request.amount) : '';
  const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="bg-blue-900/30 p-6 border-b border-blue-800">
            <h1 className="text-2xl font-bold text-white">Dados para Pagamento</h1>
            <p className="text-blue-200 mt-2">Você recebeu uma solicitação de pagamento.</p>
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between bg-gray-900/50 p-4 rounded-md">
                <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Valor a Receber</span>
                    <p className="text-xl font-bold text-green-400">{formattedAmount}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                     <span className="text-xs text-gray-400 uppercase font-bold">Referente a</span>
                     <p className="text-gray-200">{event?.name || 'N/A'}</p>
                </div>
            </div>
             {request?.description && (
                 <div className="mt-2 text-sm text-gray-400">
                     Obs: {request.description}
                 </div>
             )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div>
                <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Seus Dados / Empresa</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className={labelClasses}>Nome Completo / Razão Social *</label>
                        <input type="text" value={recipientFullName} onChange={e => setRecipientFullName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className={labelClasses}>CPF / CNPJ *</label>
                        <input type="text" value={recipientCpf} onChange={e => setRecipientCpf(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className={labelClasses}>E-mail para Contato *</label>
                        <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
            </div>

            <div>
                 <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Dados Bancários</h3>
                 <p className="text-sm text-gray-400 mb-4">Preencha Pix ou conta bancária.</p>
                 <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>Chave PIX</label>
                        <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className={inputClasses} placeholder="CPF, Email, Telefone..." />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                         <div>
                            <label className={labelClasses}>Banco</label>
                            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Agência</label>
                            <input type="text" value={bankAgency} onChange={e => setBankAgency(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Conta</label>
                            <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                 </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">Nota Fiscal (Opcional)</h3>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-gray-700/30">
                     <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
                                <span>Carregar arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setInvoiceFile(e.target.files?.[0] || null)} accept="image/*,.pdf" />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG até 10MB</p>
                        {invoiceFile && <p className="text-sm text-green-400 font-semibold">{invoiceFile.name}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Enviar Dados para Aprovação'}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};