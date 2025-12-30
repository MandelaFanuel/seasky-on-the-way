// ========================= src/pages/utils/formValidators.ts =========================
import {
  ExtendedUserRegistrationData,
  FormValidationErrors,
  isAccountType,
  isClientType,
  isSupplierType,
  isDeliveryType,
  isMerchantType,
  isBoutiqueType,
  isDeliveryVehicle,
  isBusinessEntityType,
} from "../types/auth.types";

// ==================== PHONE RULES (align backend) ====================
const BD_PREFIXES = [
  "61",
  "62",
  "65",
  "66",
  "67",
  "68",
  "69",
  "71",
  "72",
  "76",
  "77",
  "78",
  "79",
];

const normalizePhone = (phone: string) =>
  phone.replace(/\s/g, "").replace(/-/g, "").replace(/\+/g, "");

const isValidBurundiPhone = (phone: string): boolean => {
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== 8) return false;
  return BD_PREFIXES.some((p) => cleaned.startsWith(p)) && /^\d{8}$/.test(cleaned);
};

// ==================== STEP LOGIC ====================
type LogicalStepType =
  | "account_selection"
  | "category_selection"
  | "credentials"
  | "personal_info"
  | "identity_verification"
  | "boutique_info"
  | "address"
  | "documents"
  | "delivery_info"
  | "terms"
  | "final_summary"
  | "unknown";

const isFuture = (isoDate?: string | null) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  return d.getTime() > new Date().getTime();
};

const isPast = (isoDate?: string | null) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  return d.getTime() < new Date().getTime();
};

const getNeedsContract = (formData: ExtendedUserRegistrationData): boolean => {
  const t = formData.account_type;
  if (t === "partenaire" || t === "entreprise") return true;
  if (t === "fournisseur" && formData.supplier_type === "entreprise") return true;
  return false;
};

/**
 * Mapping STRICT:
 * - client: step4 = KYC
 * - fournisseur: step4 = KYC
 * - livreur: step4 = KYC
 * - commercant: step4 = BOUTIQUE (PAS KYC)
 * - partenaire/entreprise: step4 = KYC
 */
export const getLogicalStepType = (
  currentStep: number,
  formData: ExtendedUserRegistrationData
): LogicalStepType => {
  const accountType = formData.account_type;

  if (currentStep === 0) return "account_selection";
  if (currentStep === 1) return "category_selection";

  if (!accountType) return "unknown";

  // CLIENT
  if (accountType === "client") {
    switch (currentStep) {
      case 2:
        return "credentials";
      case 3:
        return "personal_info";
      case 4:
        return "identity_verification";
      case 5:
        return "address";
      case 6:
        return "terms";
      case 7:
        return "final_summary";
      default:
        return "unknown";
    }
  }

  // FOURNISSEUR
  if (accountType === "fournisseur") {
    switch (currentStep) {
      case 2:
        return "credentials";
      case 3:
        return "personal_info";
      case 4:
        return "identity_verification";
      case 5:
        return "address";
      case 6:
        return "documents";
      case 7:
        return "terms";
      default:
        return "unknown";
    }
  }

  // LIVREUR
  if (accountType === "livreur") {
    switch (currentStep) {
      case 2:
        return "credentials";
      case 3:
        return "personal_info";
      case 4:
        return "identity_verification";
      case 5:
        return "address";
      case 6:
        return "delivery_info";
      case 7:
        return "terms";
      default:
        return "unknown";
    }
  }

  // COMMERCANT
  if (accountType === "commercant") {
    switch (currentStep) {
      case 2:
        return "credentials";
      case 3:
        return "personal_info";
      case 4:
        return "boutique_info";
      case 5:
        return "address";
      case 6:
        return "documents";
      case 7:
        return "terms";
      default:
        return "unknown";
    }
  }

  // PARTENAIRE / ENTREPRISE
  if (accountType === "partenaire" || accountType === "entreprise") {
    switch (currentStep) {
      case 2:
        return "credentials";
      case 3:
        return "personal_info";
      case 4:
        return "identity_verification";
      case 5:
        return "address";
      case 6:
        return "documents";
      case 7:
        return "terms";
      default:
        return "unknown";
    }
  }

  return "unknown";
};

// ==================== FIELD GROUP VALIDATORS ====================
const validateAccountCategory = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};
  const accountType = formData.account_type;

  if (accountType === "client") {
    if (!formData.client_type) errors.client_type = "Veuillez sélectionner votre profil client";
    else if (!isClientType(formData.client_type)) errors.client_type = "Type client invalide";
  }

  if (accountType === "fournisseur") {
    if (!formData.supplier_type) errors.supplier_type = "Veuillez choisir votre type de fournisseur";
    else if (!isSupplierType(formData.supplier_type)) errors.supplier_type = "Type fournisseur invalide";
  }

  if (accountType === "livreur") {
    if (!formData.delivery_type) errors.delivery_type = "Veuillez choisir votre type de livraison";
    else if (!isDeliveryType(formData.delivery_type)) errors.delivery_type = "Type livraison invalide";
  }

  if (accountType === "commercant") {
    if (!formData.merchant_type) errors.merchant_type = "Veuillez préciser le type de commerce";
    else if (!isMerchantType(formData.merchant_type)) errors.merchant_type = "Type commerce invalide";
  }

  return errors;
};

const validateCredentials = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.username?.trim()) errors.username = "Le nom d'utilisateur est requis";
  else if (formData.username.length < 3) errors.username = "Minimum 3 caractères";
  else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errors.username = "Caractères autorisés: lettres, chiffres et underscore (_)";
  }

  if (!formData.email?.trim()) errors.email = "L'adresse email est requise";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Format d'email invalide";

  if (!formData.password) errors.password = "Le mot de passe est requis";
  else if (formData.password.length < 8) errors.password = "Minimum 8 caractères";
  else {
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      errors.password = "Doit contenir au moins une majuscule, une minuscule et un chiffre";
    }
  }

  if (!formData.password2) errors.password2 = "La confirmation du mot de passe est requise";
  else if (formData.password !== formData.password2) errors.password2 = "Les mots de passe ne correspondent pas";

  return errors;
};

const validatePersonalInfo = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.full_name?.trim()) errors.full_name = "Le nom complet est requis";
  else if (formData.full_name.length < 2) errors.full_name = "Le nom est trop court";

  if (!formData.phone?.trim()) errors.phone = "Le numéro de téléphone est requis";
  else if (!isValidBurundiPhone(formData.phone)) {
    errors.phone = `Format invalide. Exemple: 61234567. Préfixes acceptés: ${BD_PREFIXES.join(", ")}`;
  }

  const accountType = formData.account_type;
  const isClient = accountType === "client";
  const isLivreur = accountType === "livreur";
  const isFournisseur = accountType === "fournisseur";

  const driverIsEnterprise = isLivreur && formData.delivery_type === "entreprise";
  const supplierIsIndividual = isFournisseur && formData.supplier_type === "individuel";

  // ✅ règle PRO:
  // Perso obligatoire pour:
  // - client
  // - livreur individuel (PAS entreprise)
  // - fournisseur individuel
  const needsPersonFields = isClient || (isLivreur && !driverIsEnterprise) || supplierIsIndividual;

  if (needsPersonFields && !formData.gender) errors.gender = "Le genre est requis";

  if (needsPersonFields) {
    if (!formData.date_of_birth) errors.date_of_birth = "La date de naissance est requise";
    else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) errors.date_of_birth = `Vous devez avoir au moins 18 ans (vous avez ${age} ans)`;
    }
  }

  if (!formData.nationality?.trim()) errors.nationality = "La nationalité est requise";

  return errors;
};

const validateKYC = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.id_type) errors.id_type = "Le type de pièce d'identité est requis";

  if (!formData.id_number?.trim()) errors.id_number = "Le numéro de la pièce d'identité est requis";
  else if (formData.id_number.length < 4) errors.id_number = "Le numéro est trop court";

  if (!formData.id_issue_date) errors.id_issue_date = "La date d'émission est requise";
  else if (isFuture(formData.id_issue_date)) errors.id_issue_date = "La date d'émission ne peut pas être dans le futur";

  if (!formData.id_no_expiry && !formData.id_expiry_date) {
    errors.id_expiry_date = "La date d'expiration est requise";
  } else if (formData.id_expiry_date && !formData.id_no_expiry) {
    if (isPast(formData.id_expiry_date)) errors.id_expiry_date = "La pièce d’identité est expirée";
  }

  return errors;
};

const validateAddress = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.address_line?.trim()) errors.address_line = "L'adresse est requise";
  else if (formData.address_line.length < 5) errors.address_line = "L'adresse est trop courte, soyez plus précis";

  if (!formData.province) errors.province = "La province est requise";
  if (!formData.commune?.trim()) errors.commune = "La commune est requise";

  if (formData.account_type === "client" && !formData.colline_or_quartier?.trim()) {
    errors.colline_or_quartier = "Le quartier ou la colline est requis pour les livraisons";
  }

  return errors;
};

const validateBoutiqueInfo = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.business_name?.trim()) errors.business_name = "Le nom commercial est requis";

  if (!formData.boutique_type) errors.boutique_type = "Le type de boutique est requis";
  else if (!isBoutiqueType(formData.boutique_type)) errors.boutique_type = "Type de boutique invalide";

  if (!formData.boutique_services || formData.boutique_services.length === 0) {
    errors.boutique_services = "Au moins un service doit être sélectionné";
  }

  if (!formData.boutique_document) {
    errors.boutique_document = "Le document d'agrément de la boutique est requis";
  }

  return errors;
};

const validateDocuments = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  const accountType = formData.account_type;
  const isFournisseur = accountType === "fournisseur";
  const isCommercant = accountType === "commercant";
  const isPartenaire = accountType === "partenaire" || accountType === "entreprise";

  if (isFournisseur && formData.supplier_type === "entreprise") {
    if (!formData.business_name?.trim()) errors.business_name = "Le nom de l'entreprise est requis";
    if (!formData.business_entity_type) errors.business_entity_type = "Le type d'entité commerciale est requis";
    else if (!isBusinessEntityType(formData.business_entity_type)) {
      errors.business_entity_type = "Type d'entité commerciale invalide";
    }
    if (!formData.business_registration_number?.trim()) {
      errors.business_registration_number = "Le numéro d'enregistrement est requis";
    }
    if (!formData.business_document) errors.business_document = "Le document d'entreprise est requis";
  }

  if (isCommercant) {
    // Ne rien forcer ici pour éviter double validation (boutique_info gère déjà).
  }

  if (isPartenaire) {
    if (!formData.business_name?.trim()) errors.business_name = "Le nom de l'organisation est requis";
    if (!formData.business_entity_type) errors.business_entity_type = "Le type d'entité est requis";
    else if (!isBusinessEntityType(formData.business_entity_type)) errors.business_entity_type = "Type d'entité invalide";
    if (!formData.business_registration_number?.trim()) {
      errors.business_registration_number = "Le numéro d'enregistrement est requis";
    }
    if (!formData.business_document) errors.business_document = "Le document d'entreprise est requis";
  }

  return errors;
};

const validateDeliveryInfo = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.delivery_vehicle) errors.delivery_vehicle = "Le type de véhicule est requis";
  else if (!isDeliveryVehicle(formData.delivery_vehicle)) errors.delivery_vehicle = "Type de véhicule invalide";

  if (
    formData.delivery_vehicle &&
    ["motorcycle", "car", "truck"].includes(formData.delivery_vehicle) &&
    !formData.vehicle_registration?.trim()
  ) {
    errors.vehicle_registration = "L'immatriculation du véhicule est requise";
  }

  return errors;
};

const validateTerms = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (formData.account_type !== "client") {
    if (!formData.accepted_terms) errors.accepted_terms = "Vous devez accepter les conditions générales d'utilisation";

    const needsContract = getNeedsContract(formData);
    if (needsContract && !formData.accepted_contract) {
      errors.accepted_contract = "Vous devez accepter le contrat de partenariat";
    }
  }

  return errors;
};

const validateClientFinalSummary = (formData: ExtendedUserRegistrationData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.accepted_terms) errors.accepted_terms = "Vous devez accepter les conditions générales d'utilisation";

  const requiredFields: Array<keyof ExtendedUserRegistrationData> = [
    "username",
    "email",
    "password",
    "full_name",
    "phone",
    "gender",
    "date_of_birth",
    "nationality",
    "id_type",
    "id_number",
    "id_issue_date",
    "address_line",
    "province",
    "commune",
    "colline_or_quartier",
  ];

  for (const field of requiredFields) {
    const value = formData[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      (errors as any)[field] = `Le champ ${String(field)} est requis`;
    }
  }

  return errors;
};

// ==================== MAIN VALIDATION FUNCTION ====================
export const validateCurrentStep = (
  step: number,
  formData: ExtendedUserRegistrationData
): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  const accountType = formData.account_type;
  const stepType = getLogicalStepType(step, formData);

  switch (stepType) {
    case "account_selection":
      if (!accountType) errors.account_type = "Veuillez sélectionner un type de compte";
      else if (!isAccountType(accountType)) errors.account_type = "Type de compte invalide";
      break;

    case "category_selection":
      Object.assign(errors, validateAccountCategory(formData));
      break;

    case "credentials":
      Object.assign(errors, validateCredentials(formData));
      break;

    case "personal_info":
      Object.assign(errors, validatePersonalInfo(formData));
      break;

    case "identity_verification":
      Object.assign(errors, validateKYC(formData));
      break;

    case "boutique_info":
      Object.assign(errors, validateBoutiqueInfo(formData));
      break;

    case "address":
      Object.assign(errors, validateAddress(formData));
      break;

    case "documents":
      Object.assign(errors, validateDocuments(formData));
      break;

    case "delivery_info":
      Object.assign(errors, validateDeliveryInfo(formData));
      break;

    case "terms":
      Object.assign(errors, validateTerms(formData));
      break;

    case "final_summary":
      if (accountType === "client") {
        Object.assign(errors, validateClientFinalSummary(formData));
      }
      break;

    default:
      break;
  }

  return errors;
};

// ==================== UTILITY VALIDATORS ====================
export const validatePhone = (
  phone: string
): { isValid: boolean; message?: string } => {
  if (!phone?.trim()) return { isValid: false, message: "Le numéro de téléphone est requis" };
  if (!isValidBurundiPhone(phone)) {
    return {
      isValid: false,
      message: `Format invalide. Exemple: 61234567. Préfixes acceptés: ${BD_PREFIXES.join(", ")}`,
    };
  }
  return { isValid: true };
};

export const validateEmail = (
  email: string
): { isValid: boolean; message?: string } => {
  if (!email?.trim()) return { isValid: false, message: "L'adresse email est requise" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { isValid: false, message: "Format d'email invalide" };
  return { isValid: true };
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!password) return { isValid: false, errors: ["Le mot de passe est requis"] };
  if (password.length < 8) errors.push("Minimum 8 caractères");
  if (!/[A-Z]/.test(password)) errors.push("Au moins une lettre majuscule");
  if (!/[a-z]/.test(password)) errors.push("Au moins une lettre minuscule");
  if (!/[0-9]/.test(password)) errors.push("Au moins un chiffre");
  return { isValid: errors.length === 0, errors };
};

export const validateAge = (
  dateOfBirth: string
): { isValid: boolean; age?: number; message?: string } => {
  if (!dateOfBirth) return { isValid: false, message: "Date de naissance requise" };
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  if (age < 18)
    return {
      isValid: false,
      age,
      message: `Âge insuffisant (${age} ans). Vous devez être majeur (18+)`,
    };
  return { isValid: true, age };
};

export const validateFile = (
  file: File | null,
  maxSizeMB: number = 10,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "image/webp",
  ]
): { isValid: boolean; message?: string } => {
  if (!file) return { isValid: false, message: "Fichier requis" };

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) return { isValid: false, message: `Fichier trop volumineux (max ${maxSizeMB}MB)` };

  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((t) => {
        if (t.startsWith("image/")) return t.split("/")[1].toUpperCase();
        if (t === "application/pdf") return "PDF";
        return t;
      })
      .join(", ");
    return { isValid: false, message: `Format non supporté. Formats autorisés: ${allowedExtensions}` };
  }

  return { isValid: true };
};
