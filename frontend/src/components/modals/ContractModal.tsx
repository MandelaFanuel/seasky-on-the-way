// src/components/modals/ContractModal.tsx
import React from 'react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'contract' | 'terms';
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, title, type }) => {
  if (!isOpen) return null;

  const content = type === 'contract' ? (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-800">ENTRE LES SOUSSIGNÉS :</h4>
      <p>SeaSky, société immatriculée au registre du commerce...</p>
      <h4 className="font-bold text-gray-800">ARTICLE 1 - OBJET</h4>
      <p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Partenaire s'engage à fournir des produits laitiers à SeaSky...</p>
    </div>
  ) : (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-800">PRÉAMBULE</h4>
      <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme SeaSky...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {content}
        </div>
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-[#0B568C] text-white py-3 px-6 rounded-lg hover:bg-[#1A4F75]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;