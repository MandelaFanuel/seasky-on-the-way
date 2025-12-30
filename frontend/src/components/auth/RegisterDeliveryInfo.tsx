// ========================= src/components/auth/RegisterDeliveryInfo.tsx =========================
import React, { useMemo } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { RegistrationStepProps, SelectOption } from '../../pages/types/auth.types';
import { DELIVERY_VEHICLES } from '../../pages/constants/formOptions.constants';

type OptionLike = string | { value: string; label: string };

function toSelectOptions(items: readonly OptionLike[]): SelectOption[] {
  return (items || []).map((item: OptionLike) => {
    if (typeof item === 'string') return { value: item, label: item };
    return { value: item.value, label: item.label };
  });
}

export default function RegisterDeliveryInfo({ formData, formErrors, onInputChange }: RegistrationStepProps) {
  const deliveryVehicleOptions: SelectOption[] = useMemo(
    () => toSelectOptions(DELIVERY_VEHICLES as unknown as OptionLike[]),
    []
  );

  const requiresRegistration = useMemo(() => {
    const v = formData.delivery_vehicle;
    if (!v) return false;
    const noReg = ['bicycle', 'walking']; // adapte si tu as 'trottinette' etc.
    return !noReg.includes(v);
  }, [formData.delivery_vehicle]);

  const helperText = requiresRegistration
    ? "Ex: BDI-123-A (obligatoire pour ce type de véhicule)"
    : "Ex: BDI-123-A (optionnel pour les vélos et déplacement à pied)";

  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9"
            />
          </svg>
        </span>
        Informations de livraison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="delivery_vehicle"
          label="Moyen de livraison *"
          options={deliveryVehicleOptions}
          value={formData.delivery_vehicle || ''}
          onChange={onInputChange}
          error={formErrors.delivery_vehicle}
          required
          helperText="Sélectionnez votre principal moyen de transport"
        />

        <FormInput
          name="vehicle_registration"
          label={requiresRegistration ? "Immatriculation du véhicule *" : "Immatriculation du véhicule"}
          value={formData.vehicle_registration || ''}
          onChange={onInputChange}
          error={formErrors.vehicle_registration}
          required={requiresRegistration ? true : undefined}
          helperText={helperText}
          placeholder="Ex: BDI-123-A"
        />
      </div>

      {formData.delivery_vehicle === 'motorcycle' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-yellow-800 mb-1">Attention</h4>
              <p className="text-sm text-yellow-700">
                Pour les motos, assurez-vous d&apos;avoir un permis de conduire valide et tous les documents d&apos;assurance à jour.
                Des vérifications supplémentaires seront effectuées.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-blue-800 mb-1">QR Code d'identification</h4>
            <p className="text-sm text-blue-700">
              Un code QR unique sera généré pour vous identifier lors des livraisons. Ce code servira de signature électronique pour chaque transaction.
              Vous recevrez votre QR Code après validation de votre inscription.
            </p>
          </div>
        </div>
      </div>

      {requiresRegistration && !formData.vehicle_registration && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-4 w-4 text-orange-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-orange-800">L&apos;immatriculation est obligatoire pour ce type de véhicule.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
