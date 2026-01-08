// ========================= src/pages/auth/Register.tsx =========================
import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser, registerUser, SeaSkyApiError } from "../../api/client";
import type { AppDispatch } from "../../store/store";
import { registerSuccess } from "../../store/slices/authSlice";

import AuthStepper from "../../components/auth/AuthStepper";
import RegisterCredentialsForm from "../../components/auth/RegisterCredentialsForm";
import RegisterPersonalInfoForm from "../../components/auth/RegisterPersonalInfoForm";
import RegisterIdentityVerificationForm from "../../components/auth/RegisterIdentityVerificationForm";
import RegisterAddressForm from "../../components/auth/RegisterAddressForm";
import RegisterBusinessDocuments from "../../components/auth/RegisterBusinessDocuments";
import RegisterDeliveryInfo from "../../components/auth/RegisterDeliveryInfo";
import RegisterBoutiqueInfoForm from "../../components/auth/RegisterBoutiqueInfoForm";
import TermsAndConditions from "../../components/auth/TermsAndConditions";
import AccountTypeSelection from "../../components/auth/AccountTypeSelection";
import AlertBanner from "../../components/ui/AlertBanner";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Footer from "../../components/sections/Footer";
import ContractModal from "../../components/modals/ContractModal";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import RegisterClientSummary from "../../components/auth/RegisterClientSummary";
import FormDebugger from "../../components/debug/FormDebugger";

import {
  FormValidationErrors,
  AccountType,
  ExtendedUserRegistrationData,
  SupplierType,
  MerchantType,
  DeliveryType,
  ClientType,
  CLIENT_TYPES,
  SUPPLIER_TYPES,
  DELIVERY_TYPES,
  BOUTIQUE_TYPES,
  prepareBackendPayload,
} from "../types/auth.types";

import { validateCurrentStep } from "../utils/formValidators";

// ========================= LOCAL TYPES =========================
// ✅ Le projet peut encore contenir "partenaire" dans AccountType,
// mais le REGISTER ne doit PAS l'accepter.
type RegisterAccountType = Exclude<AccountType, "partenaire">;

// Types frontend pour la sélection (UI)
type FrontendMerchantType = "boutique" | "restaurant" | "supermarche";
type FrontendSupplierType = "individuel" | "entreprise";
type FrontendDeliveryType = "individuel" | "entreprise" | "boutique";

// ========================= CONSTANTS =========================
const REGISTRATION_STEPS = {
  client: [
    "Type de compte",
    "Catégorie de compte",
    "Identifiants",
    "Informations personnelles",
    "Vérification d'identité (KYC)",
    "Adresse de livraison",
    "Conditions générales",
    "Récapitulatif & Validation",
  ],
  fournisseur: [
    "Type de compte",
    "Catégorie de compte",
    "Identifiants",
    "Informations personnelles",
    "Vérification d'identité",
    "Adresse",
    "Documents professionnels",
    "Conditions générales",
  ],
  livreur: [
    "Type de compte",
    "Catégorie de compte",
    "Identifiants",
    "Informations personnelles",
    "Vérification d'identité",
    "Adresse",
    "Informations livraison",
    "Conditions générales",
  ],
  commercant: [
    "Type de compte",
    "Catégorie de compte",
    "Identifiants",
    "Informations du responsable",
    "Informations de la boutique",
    "Adresse",
    "Documents professionnels",
    "Conditions générales",
  ],
  entreprise: [
    "Type de compte",
    "Catégorie de compte",
    "Identifiants",
    "Informations du représentant",
    "Vérification d'identité",
    "Adresse",
    "Documents professionnels",
    "Conditions générales",
  ],
} satisfies Record<RegisterAccountType, string[]>;

// ========================= TYPES =========================
type DraftRegistrationData = Omit<
  ExtendedUserRegistrationData,
  | "account_type"
  | "supplier_type"
  | "merchant_type"
  | "delivery_type"
  | "client_type"
  | "emergency_contact_name"
  | "emergency_contact_phone"
  | "emergency_contact_relationship"
  | "confirm_password"
> & {
  // NOTE: on garde AccountType ici car tes types globaux peuvent encore inclure "partenaire"
  account_type: AccountType | "";
  supplier_type: SupplierType | "";
  merchant_type: MerchantType | "";
  delivery_type: DeliveryType | "";
  client_type: ClientType | "";
  password2: string;
};

// ========================= HELPERS =========================
const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();

// ✅ Guard Register: partenaire EXCLU
const isRegisterAccountType = (v: unknown): v is RegisterAccountType => {
  const s = String(v ?? "");
  return s === "client" || s === "fournisseur" || s === "livreur" || s === "commercant" || s === "entreprise";
};

// ✅ sanitize: si "partenaire" arrive quand même (cache/ancien state), on force entreprise
const sanitizeRegisterAccountType = (v: unknown): RegisterAccountType => {
  if (String(v ?? "") === "partenaire") return "entreprise";
  return isRegisterAccountType(v) ? v : "client";
};

type MinimalForSkip = Pick<ExtendedUserRegistrationData, "account_type" | "delivery_type" | "supplier_type">;

// Règle: pour "entreprise" (livreur entreprise / fournisseur entreprise), genre & date de naissance non requis
const canSkipGenderDob = (data: MinimalForSkip): boolean => {
  const at = normalize(data.account_type);
  const dt = normalize(data.delivery_type);
  const st = normalize(data.supplier_type);
  return (at === "livreur" && dt === "entreprise") || (at === "fournisseur" && st === "entreprise");
};

const toUndefIfEmpty = <T,>(v: T | "" | null | undefined): T | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  return v;
};

const convertToExtendedRegistrationData = (draftData: DraftRegistrationData): ExtendedUserRegistrationData => {
  const safeAccountType = sanitizeRegisterAccountType(draftData.account_type);

  return {
    // Base
    account_type: safeAccountType as AccountType,
    supplier_type: toUndefIfEmpty(draftData.supplier_type),
    merchant_type: toUndefIfEmpty(draftData.merchant_type),
    delivery_type: toUndefIfEmpty(draftData.delivery_type),
    client_type: toUndefIfEmpty(draftData.client_type),

    // Identifiants
    username: draftData.username || "",
    email: draftData.email || "",
    password: draftData.password || "",
    password2: draftData.password2 || "",
    confirm_password: draftData.password2 || "",

    // Perso
    full_name: draftData.full_name || "",
    phone: draftData.phone || "",
    role: draftData.role || "",
    gender: (draftData.gender as any) || "",
    date_of_birth: draftData.date_of_birth || "",
    nationality: draftData.nationality || "",
    secondary_phone: (draftData as any).secondary_phone || "",
    job_title: draftData.job_title || "",

    // KYC
    id_type: (draftData.id_type as any) || "",
    id_number: draftData.id_number || "",
    id_issue_date: draftData.id_issue_date || "",
    id_expiry_date: draftData.id_expiry_date || "",
    id_no_expiry: !!draftData.id_no_expiry,
    id_document_name: draftData.id_document_name || "",

    // Adresse
    address_line: draftData.address_line || "",
    province: draftData.province || "",
    commune: draftData.commune || "",
    colline_or_quartier: draftData.colline_or_quartier || "",

    // Contact urgence (désactivé)
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",

    // Entreprise
    business_name: draftData.business_name || "",
    business_entity_type: (draftData.business_entity_type as any) || "",
    business_registration_number: draftData.business_registration_number || "",
    business_tax_id: draftData.business_tax_id || "",
    business_doc_expiry_date: draftData.business_doc_expiry_date || "",

    // Boutique
    boutique_type: (draftData.boutique_type as any) || "",
    boutique_services: Array.isArray(draftData.boutique_services) ? draftData.boutique_services : [],

    // Livraison
    delivery_vehicle: (draftData.delivery_vehicle as any) || "",
    vehicle_registration: draftData.vehicle_registration || "",

    // Client spécifique
    preferred_delivery_time: draftData.preferred_delivery_time || "",
    delivery_instructions: draftData.delivery_instructions || "",

    // Paiement
    lumicash_msisdn: draftData.lumicash_msisdn || "",

    // ✅ Acceptations (source unique)
    accepted_terms: !!draftData.accepted_terms,
    accepted_contract: !!draftData.accepted_contract,

    // Fichiers
    id_front_image: draftData.id_front_image || null,
    id_back_image: draftData.id_back_image || null,
    passport_photo: draftData.passport_photo || null,
    other_doc_image: draftData.other_doc_image || null,
    proof_of_address: draftData.proof_of_address || null,
    business_document: draftData.business_document || null,
    boutique_document: draftData.boutique_document || null,
    photo: draftData.photo || null,
    signature: draftData.signature || null,
  };
};

// ========================= INITIAL STATE =========================
const INITIAL_FORM_DATA: DraftRegistrationData = {
  account_type: "",
  supplier_type: "",
  merchant_type: "",
  delivery_type: "",
  client_type: "",

  username: "",
  email: "",
  password: "",
  password2: "",

  full_name: "",
  phone: "",
  role: "",
  gender: "",
  date_of_birth: "",
  nationality: "",
  secondary_phone: "" as any,
  job_title: "",

  id_type: "",
  id_number: "",
  id_issue_date: "",
  id_expiry_date: "",
  id_no_expiry: false,
  id_document_name: "",

  address_line: "",
  province: "",
  commune: "",
  colline_or_quartier: "",

  business_name: "",
  business_entity_type: "",
  business_registration_number: "",
  business_tax_id: "",
  business_doc_expiry_date: "",

  boutique_type: "",
  boutique_services: [],

  delivery_vehicle: "",
  vehicle_registration: "",

  preferred_delivery_time: "",
  delivery_instructions: "",

  lumicash_msisdn: "",

  accepted_terms: false,
  accepted_contract: false,

  id_front_image: null,
  id_back_image: null,
  passport_photo: null,
  other_doc_image: null,
  proof_of_address: null,
  business_document: null,
  boutique_document: null,
  photo: null,
  signature: null,
};

// ========================= COMPONENT =========================
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showTermsConfirmation, setShowTermsConfirmation] = useState<boolean>(false);
  const [showContractConfirmation, setShowContractConfirmation] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [accountTypeSelected, setAccountTypeSelected] = useState<boolean>(false);
  const [accountCategorySelected, setAccountCategorySelected] = useState<boolean>(false);
  const [formData, setFormData] = useState<DraftRegistrationData>(INITIAL_FORM_DATA);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ========================= UTILITIES =========================
  const safeTypeForRegister = useMemo<RegisterAccountType>(() => {
    return sanitizeRegisterAccountType(formData.account_type || "client");
  }, [formData.account_type]);

  const visibleSteps = useMemo(() => REGISTRATION_STEPS[safeTypeForRegister], [safeTypeForRegister]);

  const shouldShowProgressBar = accountTypeSelected && accountCategorySelected;

  const extendedFormData = useMemo(() => convertToExtendedRegistrationData(formData), [formData]);

  const acceptedTerms = !!formData.accepted_terms;
  const acceptedContract = !!formData.accepted_contract;

  // ✅ contrat requis seulement pour "entreprise" et "fournisseur entreprise"
  const needsContract = useMemo(() => {
    const t = sanitizeRegisterAccountType(formData.account_type);
    if (t === "entreprise") return true;
    if (t === "fournisseur" && formData.supplier_type === "entreprise") return true;
    return false;
  }, [formData.account_type, formData.supplier_type]);

  const logStepData = (step: number) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`=== ÉTAPE ${step} - DONNÉES ===`);

      const stepFields: Record<number, string[]> = {
        0: ["account_type"],
        1: ["client_type", "supplier_type", "merchant_type", "delivery_type", "boutique_type"],
        2: ["username", "email", "password", "password2"],
        3: ["full_name", "phone", "gender", "date_of_birth", "nationality"],
        4: ["id_type", "id_number", "id_issue_date", "id_expiry_date", "id_no_expiry"],
        5: ["address_line", "province", "commune", "colline_or_quartier"],
        6: ["business_name", "business_entity_type", "business_registration_number", "accepted_contract", "accepted_terms"],
        7: ["accepted_terms", "accepted_contract"],
      };

      const fields = stepFields[step] || [];
      fields.forEach((field) => {
        // eslint-disable-next-line no-console
        console.log(`${field}:`, (formData as any)[field]);
      });

      // eslint-disable-next-line no-console
      console.log("Erreurs:", formErrors);
      // eslint-disable-next-line no-console
      console.log("====================");
    }
  };

  // ========================= HANDLERS =========================
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if ((formErrors as any)[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
      if (error) setError(null);
      if (submissionError) setSubmissionError(null);
    },
    [formErrors, error, submissionError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target;
      if (files && files[0]) {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
        if ((formErrors as any)[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [formErrors]
  );

  const handleArrayChange = useCallback(
    (name: string, value: string[]) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if ((formErrors as any)[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [formErrors]
  );

  const handleCheckboxChange = useCallback(
    (name: string, checked: boolean) => {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if ((formErrors as any)[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [formErrors]
  );

  // ✅ Si "partenaire" arrive, on le remplace par "entreprise"
  const handleAccountTypeSelect = useCallback((type: AccountType) => {
    const safe = sanitizeRegisterAccountType(type);

    setFormData((prev) => ({
      ...prev,
      account_type: safe,
      role:
        safe === "client"
          ? "client"
          : safe === "fournisseur"
          ? "fournisseur"
          : safe === "livreur"
          ? "livreur"
          : safe === "commercant"
          ? "commercant"
          : "partenaire", // backend: entreprise -> role partenaire (comme ton serializer)
      client_type: "",
      supplier_type: "",
      merchant_type: "",
      delivery_type: "",
      boutique_type: "",
      boutique_services: [],
      accepted_terms: false,
      accepted_contract: false,
    }));

    setAccountTypeSelected(true);
    setError(null);
    setFormErrors({});
  }, []);

  const handleModifyAccountType = useCallback(() => {
    setCurrentStep(0);
    setAccountTypeSelected(false);
    setAccountCategorySelected(false);
    setError(null);
    setFormErrors({});
    setSubmissionError(null);

    setFormData((prev) => ({
      ...prev,
      client_type: "",
      supplier_type: "",
      merchant_type: "",
      delivery_type: "",
      boutique_type: "",
      boutique_services: [],
      accepted_terms: false,
      accepted_contract: false,
    }));
  }, []);

  const handleCategorySelect = useCallback(() => {
    setError(null);
    setFormErrors({});

    const errors: FormValidationErrors = {};
    const safe = sanitizeRegisterAccountType(formData.account_type);

    if (safe === "client" && !formData.client_type) errors.client_type = "Veuillez sélectionner une catégorie de compte client";
    if (safe === "fournisseur" && !formData.supplier_type) errors.supplier_type = "Veuillez sélectionner un type de fournisseur";
    if (safe === "commercant" && !formData.merchant_type) errors.merchant_type = "Veuillez sélectionner un type de commerce";
    if (safe === "livreur" && !formData.delivery_type) errors.delivery_type = "Veuillez sélectionner un type de livraison";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError("Veuillez sélectionner une catégorie avant de continuer");
      return;
    }

    setAccountCategorySelected(true);
    setCurrentStep(2);
  }, [formData]);

  const validateCurrentStepFields = useCallback((): boolean => {
    logStepData(currentStep);

    try {
      const rawErrors = validateCurrentStep(currentStep, extendedFormData);
      const errors: FormValidationErrors = { ...(rawErrors as any) };

      // skip DOB/gender for some "entreprise" combinations
      if (currentStep === 3 && canSkipGenderDob(extendedFormData)) {
        delete (errors as any).gender;
        delete (errors as any).date_of_birth;
      }

      const safe = sanitizeRegisterAccountType(formData.account_type);

      // Contrat requis: étape 6 (docs) pour non-client
      if (safe !== "client" && currentStep === 6 && needsContract && !acceptedContract) {
        (errors as any).accepted_contract = "Veuillez accepter le contrat (obligatoire pour entreprises)";
      }

      // Terms: client step 6, others step 7
      if (safe === "client" && currentStep === 6 && !acceptedTerms) {
        (errors as any).accepted_terms = "Veuillez accepter les conditions générales d'utilisation";
      }
      if (safe !== "client" && currentStep === 7 && !acceptedTerms) {
        (errors as any).accepted_terms = "Veuillez accepter les conditions générales d'utilisation";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        const firstError = Object.values(errors)[0];
        setError(firstError ? `Veuillez corriger: ${firstError}` : "Veuillez corriger les erreurs dans le formulaire");
        return false;
      }

      return true;
    } catch (validationError) {
      // eslint-disable-next-line no-console
      console.error("Erreur de validation:", validationError);
      setError("Erreur lors de la validation du formulaire");
      return false;
    }
  }, [currentStep, extendedFormData, acceptedTerms, acceptedContract, formData.account_type, needsContract]);

  // ✅✅ handleSubmit déclaré AVANT handleNextStep (fix ts(2448)/ts(2454))
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSubmissionError(null);
    setFormErrors({});
    setAutoLoginAttempted(false);

    try {
      const safeExtended: ExtendedUserRegistrationData = canSkipGenderDob(extendedFormData)
        ? ({
            ...extendedFormData,
            // backend accepte blank/optional selon ton serializer (required=False / allow_null)
            gender: extendedFormData.gender ?? "",
            date_of_birth: extendedFormData.date_of_birth ?? "",
          } as ExtendedUserRegistrationData)
        : extendedFormData;

      const backendPayload = prepareBackendPayload(safeExtended);
      const formDataToSend = new FormData();

      // data
      Object.entries(backendPayload.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            // ✅ send arrays in a robust way (backend can parse either multiple same keys or indexed keys)
            value.forEach((item) => formDataToSend.append(key, String(item)));
          } else if (typeof value === "boolean") {
            formDataToSend.append(key, value ? "true" : "false");
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      // files
      Object.entries(backendPayload.files).forEach(([key, file]) => {
        if (file instanceof File) formDataToSend.append(key, file);
      });

      const response = await registerUser(formDataToSend);

      if (response.success || response.user) {
        setSuccess(response.message || "✅ Inscription réussie !");

        // backend: retourne souvent user + tokens
        const access = (response.tokens?.access || response.access || "") as string;
        const refresh = (response.tokens?.refresh || response.refresh || "") as string;

        if (response.user && access) {
          dispatch(
            registerSuccess({
              accessToken: access,
              refreshToken: refresh,
              user: response.user,
            })
          );
        }

        setAutoLoginAttempted(true);

        // Auto-login (optionnel) pour garantir tokens si backend ne renvoie pas correctement
        try {
          if (formData.username && formData.password) {
            const loginResponse = await loginUser(formData.username, formData.password);

            const loginAccess = (loginResponse as any).access ?? (loginResponse as any).tokens?.access ?? "";
            const loginRefresh = (loginResponse as any).refresh ?? (loginResponse as any).tokens?.refresh ?? "";

            if (loginAccess) {
              dispatch(
                registerSuccess({
                  accessToken: loginAccess,
                  refreshToken: loginRefresh,
                  user: (loginResponse as any).user ?? response.user ?? null,
                })
              );
            }

            setSuccess("✅ Inscription réussie ! Connexion automatique...");
            setTimeout(() => navigate("/", { replace: true }), 1500);
          } else {
            setTimeout(() => navigate("/login", { replace: true }), 2000);
          }
        } catch (loginError) {
          // eslint-disable-next-line no-console
          console.warn("Connexion automatique échouée, redirection vers login:", loginError);
          setSuccess("✅ Inscription réussie ! Redirection vers la connexion...");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        }

        return;
      }

      const errorMsg = response.message || "Erreur lors de l'inscription";
      setSubmissionError(errorMsg);
      setError(`❌ ${errorMsg}`);

      if ((response as any).errors) {
        const backendErrors: FormValidationErrors = {};
        Object.entries((response as any).errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) (backendErrors as any)[field] = messages.join(", ");
          else if (messages) (backendErrors as any)[field] = String(messages);
        });
        setFormErrors(backendErrors);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Erreur complète:", err);

      let errorMessage = "Une erreur réseau s'est produite";

      if (err instanceof SeaSkyApiError) {
        errorMessage = err.message;

        if (err.payload) {
          // eslint-disable-next-line no-console
          console.error("Détails de l'erreur:", err.payload);

          if ((err.payload as any).detail) {
            errorMessage = (err.payload as any).detail;
          } else if (typeof err.payload === "object" && err.payload) {
            const errors = Object.entries(err.payload as any)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) return `${field}: ${messages.join(", ")}`;
                return `${field}: ${messages}`;
              })
              .join("; ");
            errorMessage = errors || errorMessage;
          }
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setSubmissionError(errorMessage);
      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate, formData.username, formData.password, extendedFormData]);

  const handleNextStep = useCallback(() => {
    setError(null);
    setSubmissionError(null);
    setFormErrors({});

    if (currentStep === 0) {
      if (!formData.account_type) {
        setError("Veuillez sélectionner un type de compte");
        return;
      }
      setAccountTypeSelected(true);
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      handleCategorySelect();
      return;
    }

    const isLastStep = currentStep === visibleSteps.length - 1;

    const ok = validateCurrentStepFields();
    if (!ok) return;

    if (isLastStep) {
      void handleSubmit();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, formData.account_type, visibleSteps.length, handleCategorySelect, validateCurrentStepFields, handleSubmit]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (currentStep === 1) setAccountCategorySelected(false);
    }
    setError(null);
    setSubmissionError(null);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const handleTermsAcceptance = useCallback((accepted: boolean) => {
    if (accepted) setShowTermsConfirmation(true);
    else setFormData((prev) => ({ ...prev, accepted_terms: false }));
  }, []);

  const handleContractAcceptance = useCallback((accepted: boolean) => {
    if (accepted) setShowContractConfirmation(true);
    else setFormData((prev) => ({ ...prev, accepted_contract: false }));
  }, []);

  const handleMerchantTypeSelect = useCallback((type: FrontendMerchantType) => {
    // backend: merchant_type = "boutique" (unique), boutique_type = boutique/restaurant/supermarche
    const backendMerchantType: MerchantType = "boutique";
    setFormData((prev) => ({ ...prev, merchant_type: backendMerchantType, boutique_type: type as any }));
    setError(null);
    setFormErrors({});
  }, []);

  const handleSupplierTypeSelect = useCallback((type: FrontendSupplierType) => {
    setFormData((prev) => ({ ...prev, supplier_type: type as SupplierType }));
    setError(null);
    setFormErrors({});
  }, []);

  const handleDeliveryTypeSelect = useCallback((type: FrontendDeliveryType) => {
    setFormData((prev) => ({ ...prev, delivery_type: type as DeliveryType }));
    setError(null);
    setFormErrors({});
  }, []);

  // ========================= RENDER CATEGORY OPTIONS =========================
  const renderCategoryOptions = () => {
    const safe = sanitizeRegisterAccountType(formData.account_type);

    switch (safe) {
      case "client":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLIENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, client_type: type }));
                  setError(null);
                  setFormErrors({});
                }}
                className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                  formData.client_type === type
                    ? "border border-[#0B568C] bg-blue-50 shadow-sm"
                    : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#0B568C]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 capitalize">{type}</span>
                <span className="text-sm text-gray-500 mt-1 text-center">
                  {type === "individuel" && "Pour une personne seule"}
                  {type === "famille" && "Pour toute la famille"}
                </span>
              </button>
            ))}
          </div>
        );

      case "fournisseur":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPLIER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSupplierTypeSelect(type as any)}
                className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                  formData.supplier_type === type
                    ? "border border-[#0B568C] bg-blue-50 shadow-sm"
                    : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#0B568C]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2a1 1 0 011 1v.586l-2.293-2.293a1 1 0 00-1.414 0L9 10.586 6.707 8.293a1 1 0 00-1.414 0L3 11.586V7a1 1 0 011-1h12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 capitalize">{type}</span>
                <span className="text-sm text-gray-500 mt-1 text-center">
                  {type === "individuel" && "Fournisseur individuel"}
                  {type === "entreprise" && "Fournisseur entreprise"}
                </span>
              </button>
            ))}
          </div>
        );

      case "livreur":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DELIVERY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleDeliveryTypeSelect(type as any)}
                className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                  formData.delivery_type === type
                    ? "border border-[#0B568C] bg-blue-50 shadow-sm"
                    : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#0B568C]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 capitalize">{type}</span>
              </button>
            ))}
          </div>
        );

      case "commercant":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOUTIQUE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleMerchantTypeSelect(type as any)}
                className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                  formData.boutique_type === type
                    ? "border border-[#0B568C] bg-blue-50 shadow-sm"
                    : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#0B568C]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 capitalize">{type}</span>
              </button>
            ))}
          </div>
        );

      case "entreprise":
        return (
          <div className="text-center py-8">
            <p className="text-gray-700">Compte Entreprise - Catégorie unique</p>
            <p className="text-sm text-gray-500 mt-2">
              Après inscription et vérifications, vous pourrez demander le statut "Partenaire" si vous êtes éligible.
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Veuillez d'abord sélectionner un type de compte</p>
          </div>
        );
    }
  };

  // ========================= RENDER STEP CONTENT =========================
  const renderStepContent = useCallback(() => {
    const commonProps = {
      formData: extendedFormData,
      formErrors,
      onInputChange: handleInputChange,
      onFileChange: handleFileChange,
      onArrayChange: handleArrayChange,
      onCheckboxChange: handleCheckboxChange,
    };

    const type = sanitizeRegisterAccountType(formData.account_type || "client");

    // Step 0: type
    if (currentStep === 0) {
      return (
        <AccountTypeSelection
          formData={extendedFormData}
          formErrors={formErrors}
          onAccountTypeSelect={handleAccountTypeSelect}
          onInputChange={handleInputChange}
        />
      );
    }

    // Step 1: catégorie
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vous avez sélectionné :</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#0B568C]">
                    {type === "client" && "Compte Client"}
                    {type === "fournisseur" && "Compte Fournisseur"}
                    {type === "livreur" && "Compte Livreur"}
                    {type === "commercant" && "Compte Commerçant"}
                    {type === "entreprise" && "Compte Entreprise"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleModifyAccountType}
                    className="text-sm text-[#0B568C] hover:text-[#1A4F75] underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modifier
                  </button>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                <span className="text-sm font-medium text-[#0B568C]">
                  Étape 2 sur {shouldShowProgressBar ? visibleSteps.length : 2}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">Sélectionnez votre catégorie</h3>
          <p className="text-gray-600 text-sm">Choisissez la catégorie qui correspond à votre situation</p>

          {renderCategoryOptions()}

          {formErrors.client_type || formErrors.supplier_type || formErrors.delivery_type || formErrors.merchant_type ? (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {formErrors.client_type || formErrors.supplier_type || formErrors.delivery_type || formErrors.merchant_type}
            </div>
          ) : null}
        </div>
      );
    }

    // Step 2: credentials
    if (currentStep === 2) return <RegisterCredentialsForm {...commonProps} />;

    // client: 3 personal, 4 kyc, 5 address, 6 terms, 7 summary
    if (type === "client") {
      if (currentStep === 3) return <RegisterPersonalInfoForm {...commonProps} />;
      if (currentStep === 4) return <RegisterIdentityVerificationForm {...commonProps} />;
      if (currentStep === 5) return <RegisterAddressForm {...commonProps} />;
      if (currentStep === 6)
        return (
          <TermsAndConditions accepted={acceptedTerms} onAcceptChange={handleTermsAcceptance} onShowTerms={() => setShowTermsModal(true)} />
        );
      if (currentStep === 7) return <RegisterClientSummary formData={extendedFormData} onEdit={() => {}} />;
    }

    // fournisseur: 3 personal, 4 kyc, 5 address, 6 docs(+contract if needed), 7 terms
    if (type === "fournisseur") {
      if (currentStep === 3) return <RegisterPersonalInfoForm {...commonProps} />;
      if (currentStep === 4) return <RegisterIdentityVerificationForm {...commonProps} />;
      if (currentStep === 5) return <RegisterAddressForm {...commonProps} />;
      if (currentStep === 6) {
        return (
          <div className="space-y-6">
            <RegisterBusinessDocuments {...commonProps} />

            {needsContract && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-4">
                <h3 className="font-semibold text-[#0B568C] mb-4">Contrat SeaSky (obligatoire)</h3>
                <div className="mt-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowContractModal(true)}
                    className="text-[#0B568C] hover:text-[#1A4F75] text-sm underline"
                  >
                    Lire le contrat complet
                  </button>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="accept-contract"
                    checked={acceptedContract}
                    onChange={(e) => handleContractAcceptance(e.target.checked)}
                    className="h-4 w-4 text-[#0B568C] focus:ring-[#0B568C] border-gray-300 rounded"
                  />
                  <label htmlFor="accept-contract" className="ml-2 text-sm text-gray-900">
                    J'accepte les termes du contrat SeaSky
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      }
      if (currentStep === 7)
        return (
          <TermsAndConditions accepted={acceptedTerms} onAcceptChange={handleTermsAcceptance} onShowTerms={() => setShowTermsModal(true)} />
        );
    }

    // livreur: 3 personal, 4 kyc, 5 address, 6 delivery, 7 terms
    if (type === "livreur") {
      if (currentStep === 3) return <RegisterPersonalInfoForm {...commonProps} />;
      if (currentStep === 4) return <RegisterIdentityVerificationForm {...commonProps} />;
      if (currentStep === 5) return <RegisterAddressForm {...commonProps} />;
      if (currentStep === 6) return <RegisterDeliveryInfo {...commonProps} />;
      if (currentStep === 7)
        return (
          <TermsAndConditions accepted={acceptedTerms} onAcceptChange={handleTermsAcceptance} onShowTerms={() => setShowTermsModal(true)} />
        );
    }

    // commercant: 3 personal, 4 boutique, 5 address, 6 docs, 7 terms
    if (type === "commercant") {
      if (currentStep === 3) return <RegisterPersonalInfoForm {...commonProps} />;
      if (currentStep === 4) return <RegisterBoutiqueInfoForm {...commonProps} />;
      if (currentStep === 5) return <RegisterAddressForm {...commonProps} />;
      if (currentStep === 6) return <RegisterBusinessDocuments {...commonProps} />;
      if (currentStep === 7)
        return (
          <TermsAndConditions accepted={acceptedTerms} onAcceptChange={handleTermsAcceptance} onShowTerms={() => setShowTermsModal(true)} />
        );
    }

    // entreprise: 3 personal, 4 kyc, 5 address, 6 docs+contract, 7 terms
    if (type === "entreprise") {
      if (currentStep === 3) return <RegisterPersonalInfoForm {...commonProps} />;
      if (currentStep === 4) return <RegisterIdentityVerificationForm {...commonProps} />;
      if (currentStep === 5) return <RegisterAddressForm {...commonProps} />;
      if (currentStep === 6) {
        return (
          <div className="space-y-6">
            <RegisterBusinessDocuments {...commonProps} />

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-4">
              <h3 className="font-semibold text-[#0B568C] mb-4">Contrat SeaSky (obligatoire)</h3>
              <div className="mt-4 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="text-[#0B568C] hover:text-[#1A4F75] text-sm underline"
                >
                  Lire le contrat complet
                </button>
              </div>
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="accept-contract"
                  checked={acceptedContract}
                  onChange={(e) => handleContractAcceptance(e.target.checked)}
                  className="h-4 w-4 text-[#0B568C] focus:ring-[#0B568C] border-gray-300 rounded"
                />
                <label htmlFor="accept-contract" className="ml-2 text-sm text-gray-900">
                  J'accepte les termes du contrat SeaSky
                </label>
              </div>
            </div>
          </div>
        );
      }
      if (currentStep === 7)
        return (
          <TermsAndConditions accepted={acceptedTerms} onAcceptChange={handleTermsAcceptance} onShowTerms={() => setShowTermsModal(true)} />
        );
    }

    return (
      <div className="text-center py-8 text-red-600">
        <h3 className="text-xl font-semibold mb-4">Erreur: Étape non définie</h3>
        <p>Veuillez revenir à l'étape précédente</p>
      </div>
    );
  }, [
    currentStep,
    extendedFormData,
    formErrors,
    acceptedTerms,
    acceptedContract,
    shouldShowProgressBar,
    visibleSteps.length,
    handleInputChange,
    handleFileChange,
    handleArrayChange,
    handleCheckboxChange,
    handleAccountTypeSelect,
    handleModifyAccountType,
    handleTermsAcceptance,
    handleContractAcceptance,
    formData.account_type,
    needsContract,
  ]);

  // ========================= RENDER =========================
  return (
    <>
      {/* ✅ Responsive-only: padding extérieur un peu réduit (mobile) pour élargir les champs */}
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 pt-20 pb-40 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-5 sm:p-6 md:p-8 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Inscrivez-vous</h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {shouldShowProgressBar
                    ? `Rejoignez notre plateforme en ${visibleSteps.length} courtes étapes`
                    : currentStep === 0
                    ? "Commencez par choisir votre type de compte"
                    : "Sélectionnez maintenant votre catégorie"}
                </p>

                {accountTypeSelected && !accountCategorySelected && currentStep === 1 && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Type sélectionné: {sanitizeRegisterAccountType(formData.account_type)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                  <span className="text-[#0B568C] text-sm font-medium">
                    {shouldShowProgressBar
                      ? `Étape ${currentStep + 1} sur ${visibleSteps.length}`
                      : currentStep === 0
                      ? "Étape 1 sur 2"
                      : "Étape 2 sur 2"}
                  </span>
                </div>

                {process.env.NODE_ENV === "development" && (
                  <button type="button" onClick={() => setShowDebug(!showDebug)} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                    {showDebug ? "Masquer Debug" : "Afficher Debug"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 md:p-8">
            {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} className="mb-6 animate-fadeIn" />}
            {success && <AlertBanner type="success" message={success} className="mb-6 animate-fadeIn" />}

            {submissionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                <p className="text-sm text-red-700">{submissionError}</p>
              </div>
            )}

            {shouldShowProgressBar && visibleSteps.length > 1 && (
              <div className="mb-8 animate-fadeIn">
                <AuthStepper steps={visibleSteps} currentStep={currentStep} showProgress showAnimation />
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* ✅ Responsive-only: on évite l'empilement de bordures (mobile => pas de border) */}
              {/* ✅ Mobile: padding réduit + bg transparent pour laisser respirer les inputs */}
              <div className="bg-transparent sm:bg-gray-50 p-0 sm:p-6 rounded-xl border-0 sm:border sm:border-gray-200 min-h-[400px] animate-scaleIn">
                {/* ✅ petit padding interne mobile pour conserver l'espacement sans “double cadre” */}
                <div className="px-0 sm:px-0 py-0">
                  {renderStepContent()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                  </button>
                ) : (
                  <div className="flex-1" />
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className={`flex-1 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] ${
                    currentStep === visibleSteps.length - 1
                      ? "bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
                      : "bg-linear-to-r from-[#0B568C] to-[#1A4F75] hover:from-[#1A4F75] hover:to-[#0B568C] text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      {autoLoginAttempted ? "Connexion..." : "Traitement..."}
                    </>
                  ) : currentStep === 0 ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Sélectionner
                    </>
                  ) : currentStep === 1 ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Valider
                    </>
                  ) : currentStep === visibleSteps.length - 1 ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Finaliser
                    </>
                  ) : (
                    <>
                      Suivant
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center animate-fadeIn">
              <p className="text-gray-600 text-sm md:text-base">
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#0B568C] hover:text-[#1A4F75] font-medium transition-colors duration-200 hover:underline"
                  disabled={isLoading}
                  type="button"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ContractModal isOpen={showContractModal} onClose={() => setShowContractModal(false)} title="Contrat SeaSky" type="contract" />

      <ContractModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Conditions Générales d'Utilisation"
        type="terms"
      />

      <ConfirmationModal
        isOpen={showTermsConfirmation}
        onClose={() => setShowTermsConfirmation(false)}
        onConfirm={() => {
          setFormData((prev) => ({ ...prev, accepted_terms: true }));
          setShowTermsConfirmation(false);
          setError(null);
        }}
        title="Confirmation d'acceptation"
        message="Confirmez-vous avoir lu et accepté les conditions générales d'utilisation de SeaSky ?"
      />

      <ConfirmationModal
        isOpen={showContractConfirmation}
        onClose={() => setShowContractConfirmation(false)}
        onConfirm={() => {
          setFormData((prev) => ({ ...prev, accepted_contract: true }));
          setShowContractConfirmation(false);
          setError(null);
        }}
        title="Confirmation d'acceptation"
        message="Confirmez-vous avoir lu et accepté le contrat SeaSky ?"
      />

      {process.env.NODE_ENV === "development" && showDebug && (
        <FormDebugger
          formData={formData}
          currentStep={currentStep}
          formErrors={formErrors}
          visibleSteps={visibleSteps}
          isVisible={showDebug}
        />
      )}
    </>
  );
}
