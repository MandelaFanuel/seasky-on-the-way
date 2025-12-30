// ========================= src/components/auth/RegisterBoutiqueInfoForm.tsx =========================
import React, { useMemo } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormFileUpload from '../ui/FormFileUpload';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { BOUTIQUE_TYPES, BOUTIQUE_SERVICES } from '../../pages/constants/formOptions.constants';

export default function RegisterBoutiqueInfoForm({
  formData,
  formErrors,
  onInputChange,
  onFileChange,
  onArrayChange,
}: RegistrationStepProps) {
  const safeOnFileChange = useMemo(() => onFileChange ?? (() => {}), [onFileChange]);
  const safeOnArrayChange = useMemo(() => onArrayChange ?? (() => {}), [onArrayChange]);

  const boutiqueTypeOptions: SelectOption[] = useMemo(
    () => BOUTIQUE_TYPES.map((type) => ({ value: type.value, label: type.label })),
    []
  );

  const boutiqueServiceOptions: SelectOption[] = useMemo(
    () => BOUTIQUE_SERVICES.map((service) => ({ value: service.value, label: service.label })),
    []
  );

  const selectedServices: string[] = Array.isArray(formData.boutique_services) ? formData.boutique_services : [];

  const toggleService = (serviceValue: string) => {
    const next = selectedServices.includes(serviceValue)
      ? selectedServices.filter((s) => s !== serviceValue)
      : [...selectedServices, serviceValue];

    safeOnArrayChange('boutique_services', next);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </span>
        Informations de la boutique
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="boutique_type"
          label="Type de boutique *"
          options={boutiqueTypeOptions}
          value={formData.boutique_type || ''}
          onChange={onInputChange}
          error={formErrors.boutique_type}
          required
          helperText="Sélectionnez le type qui correspond le mieux à votre établissement"
        />

        <FormInput
          name="business_name"
          label="Nom commercial *"
          value={formData.business_name || ''}
          onChange={onInputChange}
          error={formErrors.business_name}
          required
          helperText="Nom officiel de votre boutique"
          placeholder="Ex: Épicerie du Marché, Supermarché Kinanira"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Services offerts *</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {boutiqueServiceOptions.map((service) => (
            <label key={service.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.value)}
                onChange={() => toggleService(service.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>

        {formErrors.boutique_services && (
          <div className="mt-2 flex items-start text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
            <svg className="h-4 w-4 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formErrors.boutique_services}</span>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">Sélectionnez au moins un service proposé par votre boutique</p>
      </div>

      <div className="mt-6">
        <FormFileUpload
          name="boutique_document"
          label="Document d'agrément de la boutique *"
          // ✅ aligné backend: images + PDF uniquement
          accept=".pdf,image/*"
          error={formErrors.boutique_document}
          onChange={safeOnFileChange}
          fileName={formData.boutique_document instanceof File ? formData.boutique_document.name : ''}
          required
          helperText="Licence commerciale/agrément ou document officiel. Formats: PDF, JPG, PNG, WEBP (max 10MB)"
          maxSize={10}
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-blue-800 mb-1">Information importante</h4>
            <p className="text-sm text-blue-700">
              Tous les documents doivent être valides et à jour. Les documents falsifiés entraîneront le rejet de votre
              demande. La vérification peut prendre 24 à 48 heures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
