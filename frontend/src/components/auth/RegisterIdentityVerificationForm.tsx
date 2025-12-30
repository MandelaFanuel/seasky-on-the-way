// ========================= src/components/auth/RegisterIdentityVerificationForm.tsx =========================
import React, { useMemo } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormFileUpload from '../ui/FormFileUpload';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { IDENTIFICATION_TYPES } from '../../pages/constants/formOptions.constants';

// Fonction pour normaliser le type d'identité
const normalizeIdType = (idType: string): string => {
  if (!idType) return '';
  const type = idType.toUpperCase();

  if (type.includes('CARTE_NATIONALE') || type === 'CNI') return 'CARTE_NATIONALE';
  if (type.includes('PASSEPORT') || type === 'PASSPORT') return 'PASSEPORT';
  if (type.includes('PERMIS_CONDUIRE') || type.includes('PERMIS') || type.includes('DRIVING')) return 'PERMIS_CONDUIRE';
  if (type.includes('CARTE_SEJOUR') || type.includes('RESIDENCE')) return 'CARTE_SEJOUR';
  if (type.includes('CARTE_ETUDIANT') || type.includes('STUDENT')) return 'CARTE_ETUDIANT';
  if (type === 'AUTRE' || type === 'OTHER') return 'AUTRE';

  return type;
};

// Fonction pour la logique conditionnelle
const getIdTypeLogic = (idType: string): string => {
  const normalized = normalizeIdType(idType);

  if (normalized === 'CARTE_NATIONALE') return 'cni';
  if (normalized === 'PASSEPORT') return 'passport';
  if (normalized === 'PERMIS_CONDUIRE') return 'driving_license';
  if (normalized === 'CARTE_SEJOUR') return 'residence_card';
  if (normalized === 'CARTE_ETUDIANT' || normalized === 'AUTRE') return 'other';

  return 'other';
};

export default function RegisterIdentityVerificationForm({
  formData,
  formErrors,
  onInputChange,
  onFileChange,
}: RegistrationStepProps) {
  const safeOnFileChange = useMemo(() => onFileChange ?? (() => {}), [onFileChange]);

  const identificationTypeOptions: SelectOption[] = useMemo(
    () =>
      IDENTIFICATION_TYPES.map((type) => ({
        value: type.value,
        label: type.label,
      })),
    []
  );

  const idTypeLogic = getIdTypeLogic(formData.id_type || '');

  const handleNoExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onInputChange(e);

    if (isChecked) {
      const expiryEvent = {
        target: {
          name: 'id_expiry_date',
          value: '',
          type: 'text',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(expiryEvent);
    }
  };

  const renderDatesBlock = (opts: {
    issueRequired?: boolean;
    expiryRequired?: boolean;
    allowNoExpiry?: boolean;
    issueHelper?: string;
    expiryHelper?: string;
  }) => {
    const {
      issueRequired = true,
      expiryRequired = true,
      allowNoExpiry = true,
      issueHelper = 'Date d’émission du document',
      expiryHelper = 'Date d’expiration du document',
    } = opts;

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormInput
            name="id_issue_date"
            label={`Date d'émission${issueRequired ? ' *' : ''}`}
            type="date"
            value={formData.id_issue_date || ''}
            onChange={onInputChange}
            error={formErrors.id_issue_date}
            required={issueRequired}
            max={new Date().toISOString().split('T')[0]}
            helperText={issueHelper}
          />

          <FormInput
            name="id_expiry_date"
            label={`Date d'expiration${!formData.id_no_expiry && expiryRequired ? ' *' : ''}`}
            type="date"
            value={formData.id_expiry_date || ''}
            onChange={onInputChange}
            error={formErrors.id_expiry_date}
            required={!formData.id_no_expiry ? expiryRequired : false}
            disabled={!!formData.id_no_expiry}
            min={formData.id_issue_date || new Date().toISOString().split('T')[0]}
            helperText={expiryHelper}
          />
        </div>

        {allowNoExpiry && (
          <div className="mt-4 flex items-center">
            <input
              id="id_no_expiry"
              name="id_no_expiry"
              type="checkbox"
              checked={formData.id_no_expiry || false}
              onChange={handleNoExpiryChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="id_no_expiry" className="ml-2 block text-sm text-gray-900">
              Ce document n&apos;a pas de date d&apos;expiration
            </label>
          </div>
        )}
      </>
    );
  };

  const renderAdditionalFields = () => {
    switch (idTypeLogic) {
      case 'cni':
        return (
          <>
            {renderDatesBlock({
              issueRequired: true,
              expiryRequired: false,
              allowNoExpiry: true,
              issueHelper: "Date d'émission de votre CNI",
              expiryHelper: "Date d'expiration de votre CNI (si applicable)",
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormFileUpload
                name="id_front_image"
                label="Photo recto de la CNI"
                accept="image/*,.pdf"
                error={formErrors.id_front_image}
                onChange={safeOnFileChange}
                fileName={(formData as any).id_front_image_name || (formData.id_front_image instanceof File ? formData.id_front_image.name : '')}
                helperText="Photo claire du recto de votre carte d'identité"
                preview={true}
                maxSize={5}
              />
              <FormFileUpload
                name="id_back_image"
                label="Photo verso de la CNI"
                accept="image/*,.pdf"
                error={formErrors.id_back_image}
                onChange={safeOnFileChange}
                fileName={(formData as any).id_back_image_name || (formData.id_back_image instanceof File ? formData.id_back_image.name : '')}
                helperText="Photo claire du verso de votre carte d'identité"
                preview={true}
                maxSize={5}
              />
            </div>
          </>
        );

      case 'passport':
        return (
          <>
            {renderDatesBlock({
              issueRequired: true,
              expiryRequired: true,
              allowNoExpiry: false,
              issueHelper: "Date d'émission du passeport",
              expiryHelper: "Date d'expiration du passeport",
            })}

            <div className="mt-6">
              <FormFileUpload
                name="passport_photo"
                label="Photo du passeport (page photo)"
                accept="image/*,.pdf"
                error={formErrors.passport_photo}
                onChange={safeOnFileChange}
                fileName={(formData as any).passport_photo_name || (formData.passport_photo instanceof File ? formData.passport_photo.name : '')}
                helperText="Page principale avec photo"
                preview={true}
                maxSize={5}
              />
            </div>
          </>
        );

      case 'driving_license':
      case 'residence_card':
        return (
          <>
            {renderDatesBlock({
              issueRequired: true,
              expiryRequired: true,
              allowNoExpiry: false,
              issueHelper: idTypeLogic === 'driving_license' ? "Date d'émission du permis" : "Date d'émission de la carte",
              expiryHelper: idTypeLogic === 'driving_license' ? "Date d'expiration du permis" : "Date d'expiration de la carte",
            })}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormFileUpload
                name="id_front_image"
                label={idTypeLogic === 'driving_license' ? 'Photo recto du permis' : 'Photo recto de la carte'}
                accept="image/*,.pdf"
                error={formErrors.id_front_image}
                onChange={safeOnFileChange}
                fileName={(formData as any).id_front_image_name || (formData.id_front_image instanceof File ? formData.id_front_image.name : '')}
                helperText="Photo recto claire"
                preview={true}
                maxSize={5}
              />
              <FormFileUpload
                name="id_back_image"
                label={idTypeLogic === 'driving_license' ? 'Photo verso du permis' : 'Photo verso de la carte'}
                accept="image/*,.pdf"
                error={formErrors.id_back_image}
                onChange={safeOnFileChange}
                fileName={(formData as any).id_back_image_name || (formData.id_back_image instanceof File ? formData.id_back_image.name : '')}
                helperText="Photo verso claire"
                preview={true}
                maxSize={5}
              />
            </div>
          </>
        );

      case 'other':
      default:
        return (
          <>
            {renderDatesBlock({
              issueRequired: false,
              expiryRequired: false,
              allowNoExpiry: true,
              issueHelper: "Date d'émission (si connue)",
              expiryHelper: "Date d'expiration (si applicable)",
            })}

            <div className="mt-6">
              <FormFileUpload
                name="other_doc_image"
                label="Photo du document d'identité"
                accept="image/*,.pdf"
                error={formErrors.other_doc_image}
                onChange={safeOnFileChange}
                fileName={(formData as any).other_doc_image_name || (formData.other_doc_image instanceof File ? formData.other_doc_image.name : '')}
                helperText="Photo claire de votre document d'identité"
                preview={true}
                maxSize={5}
              />
            </div>

            <div className="mt-6">
              <FormInput
                name="id_document_name"
                label="Nom du document"
                value={formData.id_document_name || ''}
                onChange={onInputChange}
                error={formErrors.id_document_name}
                helperText="Précisez le type de document"
                placeholder="Ex: Carte d'étudiant, Carte professionnelle"
              />
            </div>
          </>
        );
    }
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>
        Vérification d&apos;identité (KYC)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="id_type"
          label="Type de pièce d'identité *"
          options={identificationTypeOptions}
          value={formData.id_type || ''}
          onChange={onInputChange}
          error={formErrors.id_type}
          required
          helperText="Sélectionnez le type de document d'identité"
        />

        <FormInput
          name="id_number"
          label="Numéro de pièce *"
          value={formData.id_number || ''}
          onChange={onInputChange}
          error={formErrors.id_number}
          required
          helperText="Le numéro exact figurant sur votre pièce d'identité"
          placeholder="Ex: 1234567890"
        />
      </div>

      {renderAdditionalFields()}

      {formData.account_type === 'client' && (
        <div className="mt-6">
          <FormFileUpload
            name="photo"
            label="Photo d'identité (optionnel)"
            accept="image/*"
            error={formErrors.photo}
            onChange={safeOnFileChange}
            fileName={(formData as any).photo_name || (formData.photo instanceof File ? formData.photo.name : '')}
            helperText="Photo récente de votre visage (optionnel pour le test)"
            preview={true}
            maxSize={5}
          />
        </div>
      )}

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
            <h4 className="font-medium text-blue-800 mb-2">Informations importantes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pour le test, les fichiers sont optionnels</span>
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-blue-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>En production, tous les champs marqués * seront obligatoires</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
