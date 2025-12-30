import React from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { PROVINCES } from '../../pages/constants/formOptions.constants';

export default function RegisterAddressForm({ 
  formData, 
  formErrors, 
  onInputChange 
}: RegistrationStepProps) {
  
  // Conversion propre des constantes readonly vers le type attendu
  const provinceOptions: SelectOption[] = PROVINCES.map(province => ({
    value: province.value,
    label: province.label
  }));

  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        Adresse de résidence
      </h3>
      
      <div className="mb-6">
        <FormInput
          name="address_line"
          label="Adresse complète *"
          value={formData.address_line || ''}
          onChange={onInputChange}
          error={formErrors.address_line}
          required
          helperText="Rue, avenue, numéro, et autres détails nécessaires à la livraison"
          placeholder="Ex: Avenue de l'Indépendance, No 12"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormSelect
          name="province"
          label="Province *"
          options={provinceOptions}
          value={formData.province || ''}
          onChange={onInputChange}
          error={formErrors.province}
          required
          helperText="Sélectionnez votre province"
        />
        <FormInput
          name="commune"
          label="Commune *"
          value={formData.commune || ''}
          onChange={onInputChange}
          error={formErrors.commune}
          required
          helperText="Nom de votre commune"
          placeholder="Ex: Rohero, Ngagara"
        />
        <FormInput
          name="colline_or_quartier"
          label="Colline/Quartier"
          value={formData.colline_or_quartier || ''}
          onChange={onInputChange}
          error={formErrors.colline_or_quartier}
          helperText="Important pour les livraisons précises"
          placeholder="Ex: Kinanira, Kiyange"
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-blue-800 mb-1">Information importante</h4>
            <p className="text-sm text-blue-700">
              Cette adresse sera utilisée pour vos livraisons. Assurez-vous qu'elle soit complète et exacte.
              Les détails précis (quartier, repères) facilitent la localisation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}