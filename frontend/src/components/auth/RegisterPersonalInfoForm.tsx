// ========================= src/components/auth/RegisterPersonalInfoForm.tsx =========================
import React, { useMemo } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { GENDER_OPTIONS, NATIONALITIES, CLIENT_TYPES } from '../../pages/constants/formOptions.constants';

type OptionLike = string | { value: string; label: string };

function toSelectOptions(items: readonly OptionLike[]): SelectOption[] {
  return (items || []).map((item: OptionLike) => {
    if (typeof item === 'string') return { value: item, label: item };
    return { value: item.value, label: item.label };
  });
}

export default function RegisterPersonalInfoForm({ formData, formErrors, onInputChange }: RegistrationStepProps) {
  const isClient = formData.account_type === 'client';
  const isFournisseur = formData.account_type === 'fournisseur';
  const isLivreur = formData.account_type === 'livreur';
  const isCommercant = formData.account_type === 'commercant';
  const isPartenaire = formData.account_type === 'partenaire';
  const isEntreprise = formData.account_type === 'entreprise';

  const isEnterpriseProfile =
    isPartenaire ||
    isEntreprise ||
    (isFournisseur && formData.supplier_type === 'entreprise') ||
    (isLivreur && formData.delivery_type === 'entreprise');

  const title = isEnterpriseProfile ? 'Informations du représentant' : isCommercant ? 'Informations du responsable' : 'Informations personnelles';

  const genderOptions = useMemo(() => toSelectOptions(GENDER_OPTIONS as unknown as OptionLike[]), []);
  const nationalityOptions = useMemo(() => toSelectOptions(NATIONALITIES as unknown as OptionLike[]), []);
  const clientTypeOptions = useMemo(() => toSelectOptions(CLIENT_TYPES as unknown as OptionLike[]), []);

  return (
    <section className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        {title}
      </h3>

      {isClient && (
        <div className="mb-6">
          <FormSelect
            name="client_type"
            label="Type de client *"
            options={clientTypeOptions}
            value={formData.client_type || ''}
            onChange={onInputChange}
            error={formErrors.client_type}
            required
            helperText="Individuel pour vous seul, Famille si vous commandez pour plusieurs personnes"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="full_name"
          label={isEnterpriseProfile || isCommercant ? 'Nom complet du responsable *' : 'Nom complet *'}
          value={formData.full_name || ''}
          onChange={onInputChange}
          error={formErrors.full_name}
          required
          placeholder="Jean Ndikumana"
        />
        <FormInput
          name="phone"
          label="Téléphone *"
          type="tel"
          value={formData.phone || ''}
          onChange={onInputChange}
          error={formErrors.phone}
          helperText="Format: 61 123 456"
          required
          placeholder="61 123 456"
        />
      </div>

      {!(isEnterpriseProfile || isCommercant) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormSelect
            name="gender"
            label="Genre *"
            options={genderOptions}
            value={formData.gender || ''}
            onChange={onInputChange}
            error={formErrors.gender}
            required={isClient || isFournisseur || isLivreur}
          />
          <FormInput
            name="date_of_birth"
            label="Date de naissance *"
            type="date"
            value={formData.date_of_birth || ''}
            onChange={onInputChange}
            error={formErrors.date_of_birth}
            required={isClient || isFournisseur || isLivreur}
            max={new Date().toISOString().split('T')[0]}
            helperText="Doit être majeur (18+)"
          />
        </div>
      )}

      <div className="mt-6">
        <FormSelect
          name="nationality"
          label="Nationalité *"
          options={nationalityOptions}
          value={formData.nationality || ''}
          onChange={onInputChange}
          error={formErrors.nationality}
          required
          helperText="Pour les vérifications KYC"
        />
      </div>

      {isClient && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Note pour le test</h4>
              <p className="mt-1 text-sm text-blue-700">
                Pour tester l&apos;inscription, seuls les champs marqués * sont obligatoires.
                Les informations d&apos;urgence seront complétées plus tard dans le profil.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
