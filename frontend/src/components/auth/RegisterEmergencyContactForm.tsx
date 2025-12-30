import React from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { RegistrationStepProps } from '../../pages/types/auth.types';

type Props = RegistrationStepProps & {
  /**
   * register: ne rien afficher (inscription)
   * profile: afficher la section (compléter le profil)
   */
  mode?: 'register' | 'profile';
};

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Sélectionnez...' },
  { value: 'parent', label: 'Parent' },
  { value: 'conjoint', label: 'Conjoint(e)' },
  { value: 'frere_soeur', label: 'Frère / Sœur' },
  { value: 'ami', label: 'Ami(e)' },
  { value: 'tuteur', label: 'Tuteur' },
  { value: 'autre', label: 'Autre' },
];

export default function RegisterEmergencyContactForm({
  formData,
  formErrors,
  onInputChange,
  mode = 'register',
}: Props) {
  // ✅ Inscription: on masque complètement cette section
  if (mode === 'register') return null;

  // ✅ Profil: on affiche la section
  return (
    <section className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#93C5FD] mb-4 flex items-center">
        <span className="bg-blue-100 text-[#93C5FD] rounded-full p-2 mr-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </span>
        Contact d'urgence (optionnel)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          name="emergency_contact_name"
          label="Nom du contact"
          value={(formData as any).emergency_contact_name || ''}
          onChange={onInputChange}
          error={(formErrors as any).emergency_contact_name}
        />
        <FormInput
          name="emergency_contact_phone"
          label="Téléphone du contact"
          type="tel"
          value={(formData as any).emergency_contact_phone || ''}
          onChange={onInputChange}
          error={(formErrors as any).emergency_contact_phone}
          helperText="Format: 61 123 456"
        />
      </div>

      <div className="mt-4">
        <FormSelect
          name="emergency_contact_relationship"
          label="Lien avec le contact"
          value={(formData as any).emergency_contact_relationship || ''}
          onChange={onInputChange}
          options={RELATIONSHIP_OPTIONS}
          error={(formErrors as any).emergency_contact_relationship}
        />
        <p className="text-xs text-gray-400 mt-2">Pour les urgences de livraison</p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Information importante</h4>
        <p className="text-sm text-blue-700">
          Ces informations seront utilisées uniquement en cas d'urgence.
          Elles resteront confidentielles et sécurisées.
        </p>
      </div>
    </section>
  );
}
