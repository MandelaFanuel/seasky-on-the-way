// ========================= src/components/auth/AccountTypeSelection.tsx =========================
import React from 'react';
import { AccountType } from '../../pages/types/auth.types';

// ========================= TYPES =========================
interface AccountTypeCardProps {
  isActive: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}

interface AccountTypeSelectionProps {
  formData: any;
  formErrors: any;
  onAccountTypeSelect: (type: AccountType) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// ========================= ACCOUNT TYPE CARD COMPONENT =========================
const AccountTypeCard: React.FC<AccountTypeCardProps> = ({ isActive, onClick, title, icon, description, children }) => (
  <div
    role="button"
    tabIndex={0}
    className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
      isActive ? 'border-[#0B568C] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-[#0B568C] hover:shadow-sm'
    }`}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick();
    }}
  >
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">{icon}</div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 mb-3">{description}</p>
    {children}
  </div>
);

// ========================= MAIN COMPONENT =========================
export default function AccountTypeSelection({
  formData,
  formErrors,
  onAccountTypeSelect,
  onInputChange,
}: AccountTypeSelectionProps) {
  // ✅ Sécurité: si un ancien état contient "partenaire" (ou "entreprise"), on l’ignore côté UI
  const currentType: string = String(formData?.account_type ?? '');
  const safeType: string = currentType === 'partenaire' || currentType === 'entreprise' ? '' : currentType;

  const isType = (t: string) => safeType === t;

  // ========================= ACCOUNT TYPE CARDS (SANS PARTENAIRE, SANS ENTREPRISE) =========================
  const accountTypes = [
    {
      type: 'client' as AccountType,
      title: 'Client',
      icon: (
        <svg className="w-6 h-6 text-[#0B568C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      description: 'Pour les particuliers qui achètent des produits laitiers',
      hasSubType: true,
      subTypeField: 'client_type',
      subTypeOptions: [
        { value: 'individuel', label: 'Individuel' },
        { value: 'famille', label: 'Famille' },
      ],
    },
    {
      type: 'fournisseur' as AccountType,
      title: 'Fournisseur',
      icon: (
        <svg className="w-6 h-6 text-[#0B568C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      description: 'Pour les producteurs laitiers (individuel ou entreprise)',
      hasSubType: true,
      subTypeField: 'supplier_type',
      subTypeOptions: [
        { value: 'individuel', label: 'Individuel' },
        { value: 'entreprise', label: 'Entreprise' },
      ],
    },
    {
      type: 'commercant' as AccountType,
      title: 'Commerçant / Boutique',
      icon: (
        <svg className="w-6 h-6 text-[#0B568C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      description: 'Pour les points de vente (Boutique)',
      hasSubType: true,
      subTypeField: 'merchant_type',
      subTypeValue: 'boutique',
      subTypeReadOnly: true,
    },
    {
      type: 'livreur' as AccountType,
      title: 'Livreur',
      icon: (
        <svg className="w-6 h-6 text-[#0B568C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Pour les services de livraison (entreprise, individuel ou boutique)',
      hasSubType: true,
      subTypeField: 'delivery_type',
      subTypeOptions: [
        { value: 'entreprise', label: 'Entreprise' },
        { value: 'individuel', label: 'Individuel' },
        { value: 'boutique', label: 'Boutique' },
      ],
    },
  ];

  // ========================= RENDER SUBTYPE FIELD =========================
  const renderSubTypeField = (accountType: (typeof accountTypes)[number]) => {
    if (!accountType.hasSubType || !isType(accountType.type)) return null;

    // Read-only subtype
    if ((accountType as any).subTypeReadOnly) {
      return (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm text-gray-700 mb-1">Catégorie</label>
          <input
            type="text"
            name={(accountType as any).subTypeField}
            value={(accountType as any).subTypeValue}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-700"
          />
        </div>
      );
    }

    // Select subtype
    if ((accountType as any).subTypeOptions) {
      return (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm text-gray-700 mb-1">Catégorie</label>
          <select
            name={(accountType as any).subTypeField}
            value={formData?.[(accountType as any).subTypeField] || ''}
            onChange={(e) => onInputChange(e)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B568C] bg-white"
          >
            <option value="">— Choisir —</option>
            {(accountType as any).subTypeOptions.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {formErrors?.[(accountType as any).subTypeField] && (
            <p className="text-xs text-red-600 mt-1">{formErrors[(accountType as any).subTypeField]}</p>
          )}
        </div>
      );
    }

    return null;
  };

  // ========================= RENDER =========================
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Sélectionnez votre type de compte</h2>

      {formErrors?.account_type && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{formErrors.account_type}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountTypes.map((accountType) => (
          <AccountTypeCard
            key={accountType.type}
            isActive={isType(accountType.type)}
            onClick={() => onAccountTypeSelect(accountType.type)}
            title={accountType.title}
            icon={accountType.icon}
            description={accountType.description}
          >
            {renderSubTypeField(accountType)}
          </AccountTypeCard>
        ))}
      </div>

      {/* Information supplémentaire */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Important</h4>
        <p className="text-sm text-blue-700">
          Choisissez le type de compte correspondant à votre activité. Cette sélection déterminera les informations à fournir
          dans les étapes suivantes.
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <strong>Pour les clients :</strong> Une pièce d&apos;identité (CNI, passeport) sera requise pour la vérification KYC.
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <strong>Partenaire :</strong> Le statut partenaire ne s&apos;obtient pas lors de l&apos;inscription. Une entreprise pourra
          faire une demande après inscription, selon des critères d&apos;éligibilité.
        </p>
      </div>
    </div>
  );
}
