// src/components/auth/RegisterClientSummary.tsx
import React from 'react';
import { ClientSummaryProps } from '../../pages/types/auth.types';

export default function RegisterClientSummary({ formData, onEdit }: ClientSummaryProps) {
  // Fonction pour formater les données
  const formatValue = (key: string, value: any): string => {
    if (!value && value !== false && value !== 0) return 'Non renseigné';
    
    if (value instanceof File) return value.name;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'string' && value.trim() === '') return 'Non renseigné';
    
    // Formatage des dates
    if (key.includes('date')) {
      try {
        return new Date(value).toLocaleDateString('fr-FR');
      } catch {
        return value;
      }
    }
    
    return value.toString();
  };

  // Groupes d'information
  const sections = [
    {
      title: 'Informations personnelles',
      icon: '👤',
      fields: [
        { label: 'Nom complet', key: 'full_name' },
        { label: 'Téléphone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Genre', key: 'gender' },
        { label: 'Date de naissance', key: 'date_of_birth' },
        { label: 'Nationalité', key: 'nationality' }
      ],
      editStep: 2
    },
    {
      title: 'Vérification d\'identité (KYC)',
      icon: '🆔',
      fields: [
        { label: 'Type de pièce', key: 'id_type' },
        { label: 'Numéro', key: 'id_number' },
        { label: 'Date d\'émission', key: 'id_issue_date' },
        { label: 'Date d\'expiration', key: 'id_expiry_date' },
        { label: 'Sans expiration', key: 'id_no_expiry' },
        { label: 'Documents uploadés', key: 'documents', 
          value: [
            formData.id_front_image ? 'Recto pièce' : null,
            formData.id_back_image ? 'Verso pièce' : null,
            formData.passport_photo ? 'Passeport' : null,
            formData.proof_of_address ? 'Justificatif domicile' : null
          ].filter(Boolean).join(', ') || 'Aucun document'
        }
      ],
      editStep: 3
    },
    {
      title: 'Adresse de livraison',
      icon: '🏠',
      fields: [
        { label: 'Adresse complète', key: 'address_line' },
        { label: 'Province', key: 'province' },
        { label: 'Commune', key: 'commune' },
        { label: 'Quartier/Colline', key: 'colline_or_quartier' }
      ],
      editStep: 4
    },
    {
      title: 'Préférences',
      icon: '⚙️',
      fields: [
        { label: 'Type de client', key: 'client_type' },
        { label: 'Préférence de livraison', key: 'preferred_delivery_time' },
        { label: 'Instructions spéciales', key: 'delivery_instructions' }
      ],
      editStep: 0
    },
    {
      title: 'Compte et sécurité',
      icon: '🔐',
      fields: [
        { label: 'Nom d\'utilisateur', key: 'username' },
        { label: 'Conditions acceptées', key: 'accepted_terms', value: formData.accepted_terms ? 'Oui' : 'Non' }
      ],
      editStep: 5
    }
  ];

  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-3">📋</span>
            Récapitulatif de votre inscription
          </h3>
          <p className="text-gray-600 text-sm">
            Vérifiez attentivement toutes les informations avant de finaliser
          </p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          Étape finale
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-lg mr-3">{section.icon}</span>
                <h4 className="font-medium text-gray-800">{section.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => onEdit && onEdit(section.editStep)}
                className="text-sm text-[#0B568C] hover:text-[#1A4F75] font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
            </div>
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-1">
                    <span className="text-sm font-medium text-gray-500">{field.label}</span>
                    <p className="text-gray-900">
                      {field.value || formatValue(field.key, formData[field.key as keyof typeof formData])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Avertissements et validations */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Validation requise</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  En cliquant sur "Finaliser mon inscription", vous confirmez que toutes les informations 
                  ci-dessus sont exactes et complètes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Processus KYC</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Votre pièce d'identité sera vérifiée dans les 24 à 48 heures. 
                  Vous recevrez une notification par SMS une fois la vérification terminée.
                </p>
              </div>
            </div>
          </div>
        </div>

        {formData.id_no_expiry && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">Pièce sans expiration</h3>
                <div className="mt-2 text-sm text-purple-700">
                  <p>
                    Vous avez indiqué que votre pièce d'identité n'a pas de date d'expiration. 
                    Cette information sera vérifiée lors du processus KYC.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation finale */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              En finalisant, vous acceptez les{' '}
              <button
                type="button"
                onClick={() => onEdit && onEdit(5)}
                className="text-[#0B568C] hover:text-[#1A4F75] font-medium underline"
              >
                conditions générales
              </button>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              Statut: <span className="text-green-600">Prêt à soumettre</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}