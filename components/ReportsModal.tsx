import React, { useState, useMemo } from 'react';
import { PaymentRequest, User, Event, PaymentRequestStatus } from '../types';
import { CalendarExportIcon } from './icons';

interface ReportsModalProps {
    onClose: () => void;
    requests: PaymentRequest[];
    users: User[];
    events: Event[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ onClose, requests, users, events }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (req.status !== PaymentRequestStatus.PAID) return false;
            const createdAt = new Date(req.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && createdAt < start) return false;
            if (end) {
                end.setHours(23, 59, 59, 999); // Include the whole day
                if (createdAt > end) return false;
            }
            return true;
        });
    }, [requests, startDate, endDate]);

    const downloadCSV = () => {
        const headers = [
            'ID', 'Data de Criação', 'Data de Pagamento', 'Solicitante', 'Evento', 'Categoria', 'Valor', 'Beneficiário', 'Descrição'
        ];
        
        const rows = filteredRequests.map(req => [
            req.id,
            new Date(req.createdAt).toLocaleDateString('pt-BR'),
            req.paidAt ? new Date(req.paidAt).toLocaleDateString('pt-BR') : 'N/A',
            users.find(u => u.id === req.requesterId)?.name || 'N/A',
            events.find(e => e.id === req.eventId)?.name || 'N/A',
            req.category || 'N/A',
            req.amount.toFixed(2).replace('.', ','),
            req.recipientFullName,
            `"${req.description.replace(/"/g, '""')}"` // Handle quotes in description
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(';') + '\n' 
            + rows.map(r => r.join(';')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_pagamentos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadICS = () => {
        const paidRequests = filteredRequests.filter(req => req.status === PaymentRequestStatus.PAID && req.paidAt);
        if (paidRequests.length === 0) {
            alert("Não há pagamentos efetuados no período selecionado para exportar para o calendário.");
            return;
        }

        const formatDate = (dateString: string) => {
            return new Date(dateString).toISOString().split('T')[0].replace(/-/g, '');
        }
        
        const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SistemaDePagamentos//PT',
        ];

        paidRequests.forEach(req => {
            const description = [
                `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.amount)}`,
                `Descrição: ${req.description}`,
                `Evento: ${events.find(e => e.id === req.eventId)?.name || 'N/A'}`,
                `Solicitante: ${users.find(u => u.id === req.requesterId)?.name || 'N/A'}`
            ].join('\\n');

            const eventData = [
                'BEGIN:VEVENT',
                `UID:${req.id}@sistemadepagamentos.com`,
                `DTSTAMP:${now}`,
                `DTSTART;VALUE=DATE:${formatDate(req.paidAt!)}`,
                `DTEND;VALUE=DATE:${formatDate(req.paidAt!)}`,
                `SUMMARY:Pagamento: ${req.recipientFullName}`,
                `DESCRIPTION:${description}`,
                'END:VEVENT'
            ];
            icsContent.push(...eventData);
        });

        icsContent.push('END:VCALENDAR');

        const icsFile = icsContent.join('\r\n');
        const blob = new Blob([icsFile], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pagamentos_calendario.ics");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputClasses = "mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white";
    const paidInPeriod = filteredRequests.filter(r => r.paidAt);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">Gerar Relatório de Pagamentos</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="startDate" className="text-sm font-medium text-gray-300">Data de Início</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="text-sm font-medium text-gray-300">Data de Fim</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">O relatório incluirá <strong>{filteredRequests.length}</strong> pagamentos efetuados no período selecionado.</p>
                </div>
                <div className="p-4 bg-gray-900/50 flex justify-between items-center rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-gray-200 hover:bg-gray-500">
                        Fechar
                    </button>
                    <div className="flex items-center gap-2">
                         <button
                            type="button"
                            onClick={downloadICS}
                            disabled={paidInPeriod.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                            title="Exportar pagamentos como um evento de calendário"
                        >
                            <CalendarExportIcon className="h-5 w-5" />
                            <span>Exportar para Calendário (.ics)</span>
                        </button>
                        <button
                            type="button"
                            onClick={downloadCSV}
                            disabled={filteredRequests.length === 0}
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            title="Exportar dados como um relatório em planilha"
                        >
                            Exportar Relatório (CSV)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
