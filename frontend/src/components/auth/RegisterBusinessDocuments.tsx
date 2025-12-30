// ========================= src/components/auth/RegisterBusinessDocuments.tsx =========================
import React, { useMemo } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormFileUpload from '../ui/FormFileUpload';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { BUSINESS_ENTITY_TYPES, BOUTIQUE_TYPES, BOUTIQUE_SERVICES } from '../../pages/constants/formOptions.constants';

export default function RegisterBusinessDocuments({
  formData,
  formErrors,
  onInputChange,
  onFileChange,
  onArrayChange,
}: RegistrationStepProps) {
  const safeOnFileChange = useMemo(() => onFileChange ?? (() => {}), [onFileChange]);
  const safeOnArrayChange = useMemo(() => onArrayChange ?? (() => {}), [onArrayChange]);

  const businessEntityOptions: SelectOption[] = useMemo(
    () => BUSINESS_ENTITY_TYPES.map((type) => ({ value: type.value, label: type.label })),
    []
  );

  const boutiqueTypeOptions: SelectOption[] = useMemo(
    () => BOUTIQUE_TYPES.map((type) => ({ value: type.value, label: type.label })),
    []
  );

  const boutiqueServiceOptions: SelectOption[] = useMemo(
    () => BOUTIQUE_SERVICES.map((service) => ({ value: service.value, label: service.label })),
    []
  );

  const selectedServices: string[] = Array.isArray(formData.boutique_services) ? formData.boutique_services : [];

  const toggleBoutiqueService = (serviceValue: string) => {
    const next = selectedServices.includes(serviceValue)
      ? selectedServices.filter((s) => s !== serviceValue)
      : [...selectedServices, serviceValue];

    safeOnArrayChange('boutique_services', next);
  };

  const renderBusinessFields = () => {
    const { account_type, supplier_type } = formData;

    if (account_type === 'fournisseur' && supplier_type === 'entreprise') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="business_name"
              label="Nom de l'entreprise *"
              value={formData.business_name || ''}
              onChange={onInputChange}
              error={formErrors.business_name}
              required
              placeholder="Ex: SARL Tech Solutions"
              helperText="Le nom légal de votre entreprise"
            />

            <FormSelect
              name="business_entity_type"
              label="Forme juridique *"
              options={businessEntityOptions}
              value={formData.business_entity_type || ''}
              onChange={onInputChange}
              error={formErrors.business_entity_type}
              required
              helperText="Type d'entreprise"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormInput
              name="business_registration_number"
              label="Numéro d'enregistrement *"
              value={formData.business_registration_number || ''}
              onChange={onInputChange}
              error={formErrors.business_registration_number}
              required
              placeholder="Ex: RCCM/2023/BUJ/001"
              helperText="Numéro d'immatriculation au registre du commerce"
            />

            <FormInput
              name="business_tax_id"
              label="Numéro fiscal"
              value={formData.business_tax_id || ''}
              onChange={onInputChange}
              error={formErrors.business_tax_id}
              placeholder="Ex: 123456789"
              helperText="Numéro d'identification fiscale"
            />
          </div>

          <div className="mt-6">
            <FormInput
              name="business_doc_expiry_date"
              label="Date d'expiration du document"
              type="date"
              value={formData.business_doc_expiry_date || ''}
              onChange={onInputChange}
              error={formErrors.business_doc_expiry_date}
              min={new Date().toISOString().split('T')[0]}
              helperText="Date d'expiration du document d'entreprise"
            />
          </div>
        </>
      );
    }

    if (account_type === 'commercant') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="business_name"
              label="Nom de la boutique *"
              value={formData.business_name || ''}
              onChange={onInputChange}
              error={formErrors.business_name}
              required
              placeholder="Ex: Épicerie du Quartier"
              helperText="Nom commercial de votre boutique"
            />

            <FormSelect
              name="boutique_type"
              label="Type de boutique *"
              options={boutiqueTypeOptions}
              value={formData.boutique_type || ''}
              onChange={onInputChange}
              error={formErrors.boutique_type}
              required
              helperText="Sélectionnez le type de votre établissement"
            />
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Services proposés *</h4>
            <p className="text-sm text-gray-500 mb-4">Sélectionnez les services que vous proposez</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {boutiqueServiceOptions.map((service) => (
                <label key={service.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.value)}
                    onChange={() => toggleBoutiqueService(service.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{service.label}</span>
                </label>
              ))}
            </div>

            {formErrors.boutique_services && <p className="mt-2 text-sm text-red-600">{formErrors.boutique_services}</p>}
          </div>
        </>
      );
    }

    if (account_type === 'partenaire' || account_type === 'entreprise') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="business_name"
              label="Nom de l'organisation *"
              value={formData.business_name || ''}
              onChange={onInputChange}
              error={formErrors.business_name}
              required
              placeholder="Ex: Organisation Internationale"
              helperText={account_type === 'partenaire' ? "Nom du partenaire" : "Nom de l'entreprise"}
            />

            <FormSelect
              name="business_entity_type"
              label="Type d'organisation *"
              options={businessEntityOptions}
              value={formData.business_entity_type || ''}
              onChange={onInputChange}
              error={formErrors.business_entity_type}
              required
              helperText="Forme juridique"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormInput
              name="business_registration_number"
              label="Numéro d'enregistrement *"
              value={formData.business_registration_number || ''}
              onChange={onInputChange}
              error={formErrors.business_registration_number}
              required
              placeholder="Ex: RCCM/2023/BUJ/001"
              helperText="Numéro d'immatriculation légal"
            />

            <FormInput
              name="business_tax_id"
              label="Numéro fiscal"
              value={formData.business_tax_id || ''}
              onChange={onInputChange}
              error={formErrors.business_tax_id}
              placeholder="Ex: 123456789"
              helperText="Numéro d'identification fiscale"
            />
          </div>

          <div className="mt-6">
            <FormInput
              name="business_doc_expiry_date"
              label="Date d'expiration du document"
              type="date"
              value={formData.business_doc_expiry_date || ''}
              onChange={onInputChange}
              error={formErrors.business_doc_expiry_date}
              min={new Date().toISOString().split('T')[0]}
              helperText="Date d'expiration du document d'entreprise"
            />
          </div>
        </>
      );
    }

    return null;
  };

  const renderDocumentUploads = () => {
    const { account_type, supplier_type } = formData;

    if (account_type === 'fournisseur' && supplier_type === 'entreprise') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FormFileUpload
            name="business_document"
            label="Document d'entreprise"
            accept="image/*,.pdf"
            error={formErrors.business_document}
            onChange={safeOnFileChange}
            fileName={formData.business_document instanceof File ? formData.business_document.name : ''}
            helperText="Statuts, extrait RCCM, certificat d'enregistrement"
            preview={true}
            maxSize={10}
          />

          <FormFileUpload
            name="proof_of_address"
            label="Justificatif de domicile entreprise"
            accept="image/*,.pdf"
            error={formErrors.proof_of_address}
            onChange={safeOnFileChange}
            fileName={formData.proof_of_address instanceof File ? formData.proof_of_address.name : ''}
            helperText="Facture récente, bail commercial"
            preview={true}
            maxSize={10}
          />
        </div>
      );
    }

    if (account_type === 'commercant') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FormFileUpload
            name="boutique_document"
            label="Document de boutique"
            accept="image/*,.pdf"
            error={formErrors.boutique_document}
            onChange={safeOnFileChange}
            fileName={formData.boutique_document instanceof File ? formData.boutique_document.name : ''}
            helperText="Autorisation d'exploitation, licence commerciale"
            preview={true}
            maxSize={10}
          />

          <FormFileUpload
            name="proof_of_address"
            label="Justificatif de localisation"
            accept="image/*,.pdf"
            error={formErrors.proof_of_address}
            onChange={safeOnFileChange}
            fileName={formData.proof_of_address instanceof File ? formData.proof_of_address.name : ''}
            helperText="Bail, contrat de location, facture"
            preview={true}
            maxSize={10}
          />
        </div>
      );
    }

    if (account_type === 'partenaire' || account_type === 'entreprise') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FormFileUpload
            name="business_document"
            label="Document d'organisation"
            accept="image/*,.pdf"
            error={formErrors.business_document}
            onChange={safeOnFileChange}
            fileName={formData.business_document instanceof File ? formData.business_document.name : ''}
            helperText="Statuts, extrait RCCM, convention de partenariat"
            preview={true}
            maxSize={10}
          />

          <FormFileUpload
            name="proof_of_address"
            label="Justificatif de siège social"
            accept="image/*,.pdf"
            error={formErrors.proof_of_address}
            onChange={safeOnFileChange}
            fileName={formData.proof_of_address instanceof File ? formData.proof_of_address.name : ''}
            helperText="Facture récente, bail commercial"
            preview={true}
            maxSize={10}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </span>
        Documents professionnels
      </h3>

      <p className="text-gray-600 text-sm mb-8">
        {formData.account_type === 'commercant'
          ? 'Complétez les informations de votre boutique'
          : formData.account_type === 'fournisseur'
          ? 'Informations professionnelles pour fournisseurs'
          : 'Documents requis pour votre organisation'}
      </p>

      <div className="space-y-6">{renderBusinessFields()}</div>

      {renderDocumentUploads()}

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-green-800 mb-2">Instructions importantes</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li className="flex items-start">
                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Formats acceptés: JPG, PNG, PDF (max 10MB)</span>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Les documents doivent être lisibles et à jour</span>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pour le test, les fichiers sont optionnels</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
