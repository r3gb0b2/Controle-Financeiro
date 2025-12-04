import React from 'react';

interface ViewProofModalProps {
    onClose: () => void;
    proofUrl: string;
}

export const ViewProofModal: React.FC<ViewProofModalProps> = ({ onClose, proofUrl }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl max-h-[90vh] border border-gray-700" onClick={e => e.stopPropagation()}>
                 <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Comprovante de Pagamento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-4">
                    <img src={proofUrl} alt="Comprovante de pagamento" className="max-w-full max-h-[75vh] object-contain" />
                </div>
            </div>
        </div>
    );
};