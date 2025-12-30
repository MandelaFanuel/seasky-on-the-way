// ========================= src/pages/types/auth.types.ts =========================
// Types alignés PROFESSIONNELLEMENT avec le backend Django

import {
  ACCOUNT_TYPE_VALUES,
  CLIENT_TYPE_VALUES,
  SUPPLIER_TYPE_VALUES,
  DELIVERY_TYPE_VALUES,
  MERCHANT_TYPE_VALUES,
  BOUTIQUE_TYPE_VALUES,
  DELIVERY_VEHICLE_VALUES,
  BUSINESS_ENTITY_TYPE_VALUES,
} from '../../pages/constants/formOptions.constants';

// ==================== TYPES DE BASE ====================
export interface SelectOption {
  value: string;
  label: string;
}

// ==================== TYPES DE COMPTE (BACKEND) ====================
export type AccountType = (typeof ACCOUNT_TYPE_VALUES)[number];

// ==================== SOUS-TYPES BACKEND ====================
export type ClientType = (typeof CLIENT_TYPE_VALUES)[number];
export type SupplierType = (typeof SUPPLIER_TYPE_VALUES)[number];
export type DeliveryType = (typeof DELIVERY_TYPE_VALUES)[number];
export type MerchantType = (typeof MERCHANT_TYPE_VALUES)[number];

// ==================== TYPES DE BOUTIQUE (BACKEND) ====================
export type BoutiqueType = (typeof BOUTIQUE_TYPE_VALUES)[number];

// ==================== TYPES DE VÉHICULE (BACKEND) ====================
export type DeliveryVehicle = (typeof DELIVERY_VEHICLE_VALUES)[number];

// ==================== TYPES D'ENTITÉ COMMERCIALE (BACKEND) ====================
export type BusinessEntityType = (typeof BUSINESS_ENTITY_TYPE_VALUES)[number];

// ==================== TYPES FRONTEND POUR LA SÉLECTION ====================
export type FrontendMerchantType = 'boutique' | 'restaurant' | 'supermarche';
export type FrontendSupplierType = 'individuel' | 'entreprise';
export type FrontendDeliveryType = 'individuel' | 'entreprise' | 'boutique';
export type FrontendClientType = 'individuel' | 'famille';

// ==================== CONSTANTES ====================
// ✅ source unique: dérivé de formOptions.constants.ts
export const CLIENT_TYPES: ClientType[] = [...CLIENT_TYPE_VALUES] as ClientType[];
export const SUPPLIER_TYPES: SupplierType[] = [...SUPPLIER_TYPE_VALUES] as SupplierType[];
export const DELIVERY_TYPES: DeliveryType[] = [...DELIVERY_TYPE_VALUES] as DeliveryType[];
export const MERCHANT_TYPES: MerchantType[] = [...MERCHANT_TYPE_VALUES] as MerchantType[];
export const BOUTIQUE_TYPES: BoutiqueType[] = [...BOUTIQUE_TYPE_VALUES] as BoutiqueType[];
export const DELIVERY_VEHICLES: DeliveryVehicle[] = [...DELIVERY_VEHICLE_VALUES] as DeliveryVehicle[];
export const BUSINESS_ENTITY_TYPES: BusinessEntityType[] = [...BUSINESS_ENTITY_TYPE_VALUES] as BusinessEntityType[];

// Constantes frontend
export const FRONTEND_MERCHANT_TYPES: FrontendMerchantType[] = ['boutique', 'restaurant', 'supermarche'];
export const FRONTEND_SUPPLIER_TYPES: FrontendSupplierType[] = ['individuel', 'entreprise'];
export const FRONTEND_DELIVERY_TYPES: FrontendDeliveryType[] = ['individuel', 'entreprise', 'boutique'];
export const FRONTEND_CLIENT_TYPES: FrontendClientType[] = ['individuel', 'famille'];

// ==================== TYPE GUARDS ====================
export function isAccountType(value: string): value is AccountType {
  return (ACCOUNT_TYPE_VALUES as readonly string[]).includes(value);
}
export function isClientType(value: string): value is ClientType {
  return (CLIENT_TYPE_VALUES as readonly string[]).includes(value);
}
export function isSupplierType(value: string): value is SupplierType {
  return (SUPPLIER_TYPE_VALUES as readonly string[]).includes(value);
}
export function isDeliveryType(value: string): value is DeliveryType {
  return (DELIVERY_TYPE_VALUES as readonly string[]).includes(value);
}
export function isMerchantType(value: string): value is MerchantType {
  return (MERCHANT_TYPE_VALUES as readonly string[]).includes(value);
}
export function isBoutiqueType(value: string): value is BoutiqueType {
  return (BOUTIQUE_TYPE_VALUES as readonly string[]).includes(value);
}
export function isDeliveryVehicle(value: string): value is DeliveryVehicle {
  return (DELIVERY_VEHICLE_VALUES as readonly string[]).includes(value);
}
export function isBusinessEntityType(value: string): value is BusinessEntityType {
  return (BUSINESS_ENTITY_TYPE_VALUES as readonly string[]).includes(value);
}

// ==================== INTERFACE POUR LES FICHIERS ====================
export interface FileUpload {
  file: File | null;
  fileName?: string;
  previewUrl?: string;
}

// ==================== INTERFACE PRINCIPALE ====================
export interface UserRegistrationData {
  // =========== 1. TYPE DE COMPTE ===========
  account_type: AccountType;
  client_type?: ClientType;
  supplier_type?: SupplierType;
  merchant_type?: MerchantType;
  delivery_type?: DeliveryType;
  role: string;

  // =========== 2. IDENTIFIANTS ===========
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  password2?: string; // Frontend seulement

  // =========== 3. INFORMATIONS PERSONNELLES ===========
  full_name: string;
  phone: string;
  secondary_phone?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  nationality: string;
  job_title?: string;

  // =========== 4. PIÈCE D'IDENTITÉ ===========
  id_type?: 'cni' | 'passport' | 'driving_license' | 'residence_card' | 'other';
  id_number?: string;
  id_issue_date?: string;
  id_expiry_date?: string;
  id_no_expiry?: boolean;
  id_document_name?: string;

  // =========== 5. ADRESSE ===========
  address_line?: string;
  province?: string;
  commune?: string;
  colline_or_quartier?: string;

  // =========== 6. CONTACT D'URGENCE ===========
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;

  // =========== 7. ENTREPRISE ===========
  business_name?: string;
  business_entity_type?: BusinessEntityType;
  business_registration_number?: string;
  business_tax_id?: string;
  business_doc_expiry_date?: string;

  // =========== 8. BOUTIQUE ===========
  boutique_type?: BoutiqueType;
  boutique_services?: string[];

  // =========== 9. LIVRAISON ===========
  delivery_vehicle?: DeliveryVehicle;
  vehicle_registration?: string;

  // =========== 10. CLIENT SPÉCIFIQUE ===========
  preferred_delivery_time?: string;
  delivery_instructions?: string;

  // =========== 11. PAIEMENT ===========
  lumicash_msisdn?: string;

  // =========== 12. ACCEPTATIONS ===========
  accepted_terms: boolean;
  accepted_contract?: boolean;

  // =========== 13. FICHIERS ===========
  id_front_image?: File | null;
  id_back_image?: File | null;
  passport_photo?: File | null;
  other_doc_image?: File | null;
  proof_of_address?: File | null;
  business_document?: File | null;
  boutique_document?: File | null;
  photo?: File | null;
  signature?: File | null;

  // =========== 14. AUTRES ===========
  qr_code?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected' | 'exempted';
  account_status?: 'active' | 'pending_kyc' | 'suspended' | 'deactivated';
}

export interface ExtendedUserRegistrationData extends UserRegistrationData {
  [key: string]: any;
}

export interface FormValidationErrors {
  [fieldName: string]: string;
}

// ==================== INTERFACE POUR LA CONVERSION ====================
export interface RegistrationPayload {
  data: Record<string, any>;
  files: Record<string, File>;
}

/**
 * Mappages pour la conversion frontend -> backend
 */
export const TYPE_MAPPINGS = {
  merchant: {
    boutique: 'boutique' as MerchantType,
    restaurant: 'boutique' as MerchantType,
    supermarche: 'boutique' as MerchantType,
  },
  supplier: {
    individuel: 'individuel' as SupplierType,
    entreprise: 'entreprise' as SupplierType,
  },
  delivery: {
    individuel: 'individuel' as DeliveryType,
    entreprise: 'entreprise' as DeliveryType,
    boutique: 'boutique' as DeliveryType,
  },
  client: {
    individuel: 'individuel' as ClientType,
    famille: 'famille' as ClientType,
  },
} as const;

/**
 * Convertit un type frontend en type backend
 */
export function convertFrontendToBackendType<T extends string>(
  frontendType: T,
  mapping: Record<string, string>
): string {
  return mapping[frontendType] || frontendType;
}

/**
 * Convertit les données frontend au format backend
 */
export function prepareBackendPayload(frontendData: ExtendedUserRegistrationData): RegistrationPayload {
  const data: Record<string, any> = {};
  const files: Record<string, File> = {};

  const fileFields = [
    'id_front_image',
    'id_back_image',
    'passport_photo',
    'other_doc_image',
    'proof_of_address',
    'business_document',
    'boutique_document',
    'photo',
    'signature',
  ];

  Object.keys(frontendData).forEach((key) => {
    const value = (frontendData as any)[key];

    if (fileFields.includes(key) && value instanceof File) {
      files[key] = value;
    } else if (key === 'boutique_services' && Array.isArray(value)) {
      data[key] = JSON.stringify(value);
    } else if (key === 'id_no_expiry' || key === 'accepted_terms' || key === 'accepted_contract') {
      if (value !== undefined) data[key] = Boolean(value);
    } else if (value !== null && value !== undefined && value !== '') {
      data[key] = value;
    }
  });

  // confirm_password
  if (data.password2 && !data.confirm_password) data.confirm_password = data.password2;
  if (data.password && !data.confirm_password) data.confirm_password = data.password;
  delete data.password2;

  // role fallback (safe)
  if (!data.role && data.account_type) {
    const roleMap: Record<AccountType, string> = {
      client: 'client',
      fournisseur: 'fournisseur',
      livreur: 'livreur',
      commercant: 'commercant',
      partenaire: 'partenaire',
      entreprise: 'partenaire',
    };

    const accountTypeStr = String(data.account_type);
    if (isAccountType(accountTypeStr)) data.role = roleMap[accountTypeStr];
    else data.role = 'client';
  }

  return { data, files };
}

/**
 * Fonction utilitaire pour préparer les données avant envoi
 */
export function prepareRegistrationFormData(frontendData: ExtendedUserRegistrationData): FormData {
  const payload = prepareBackendPayload(frontendData);
  const formData = new FormData();

  Object.entries(payload.data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'boolean') formData.append(key, value ? 'true' : 'false');
      else if (Array.isArray(value)) value.forEach((item, index) => formData.append(`${key}[${index}]`, String(item)));
      else formData.append(key, String(value));
    }
  });

  Object.entries(payload.files).forEach(([key, file]) => {
    if (file instanceof File) formData.append(key, file);
  });

  return formData;
}

// ==================== TYPES POUR LES HANDLERS ====================
export type InputChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;
export type FileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type ArrayChangeHandler = (name: string, value: string[]) => void;
export type CheckboxChangeHandler = (name: string, checked: boolean) => void;

// ==================== INTERFACES POUR LES COMPOSANTS ====================
export interface RegistrationStepProps {
  formData: ExtendedUserRegistrationData;
  formErrors: FormValidationErrors;
  onInputChange: InputChangeHandler;
  onFileChange?: FileChangeHandler;
  onArrayChange?: ArrayChangeHandler;
  onCheckboxChange?: CheckboxChangeHandler;
  mode?: 'register' | 'profile';
}

export interface AccountTypeSelectionProps {
  formData: ExtendedUserRegistrationData;
  formErrors: FormValidationErrors;
  onAccountTypeSelect: (type: AccountType) => void;
  onInputChange: InputChangeHandler;
  currentStep?: number;
}

export interface ClientSummaryProps {
  formData: ExtendedUserRegistrationData;
  onEdit?: (step: number) => void;
  isReadOnly?: boolean;
}

// ==================== PROFIL UTILISATEUR ====================
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;

  account_type: AccountType;
  role: string;

  // ✅ nouveaux champs backend (optionnels => compat)
  account_type_label?: string;
  account_category?: string | null;
  account_category_label?: string | null;

  client_type?: ClientType;
  supplier_type?: SupplierType;
  merchant_type?: MerchantType;
  delivery_type?: DeliveryType;
  boutique_type?: BoutiqueType;

  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  nationality?: string;

  kyc_status: 'pending' | 'verified' | 'rejected' | 'exempted';
  account_status: 'active' | 'pending_kyc' | 'suspended' | 'deactivated';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// ==================== VALIDATIONS ====================
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
