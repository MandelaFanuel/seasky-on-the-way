// ========================= src/pages/profile/UserProfile.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";

import { RootState, updateProfile } from "../../store/store";
import { getCurrentUser, updateUserProfile, type UserProfile as ApiUserProfile } from "../../api/client";

import AlertBanner from "../../components/ui/AlertBanner";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Navigation from "../../components/layout/Navigation";

// Forms
import RegisterPersonalInfoForm from "../../components/auth/RegisterPersonalInfoForm";
import RegisterAddressForm from "../../components/auth/RegisterAddressForm";
import RegisterIdentityVerificationForm from "../../components/auth/RegisterIdentityVerificationForm";
import RegisterBusinessDocuments from "../../components/auth/RegisterBusinessDocuments";
import RegisterDeliveryInfo from "../../components/auth/RegisterDeliveryInfo";
import RegisterBoutiqueInfoForm from "../../components/auth/RegisterBoutiqueInfoForm";

// Types
import {
  ExtendedUserRegistrationData,
  FormValidationErrors,
  InputChangeHandler,
  FileChangeHandler,
  ArrayChangeHandler,
  CheckboxChangeHandler,
  RegistrationStepProps,
} from "../../pages/types/auth.types";

// ✅ Importer depuis userProfileParts.tsx
import {
  PersonalInfoDisplay,
  AddressDisplay,
  IdentityDisplay,
  BoutiqueDisplay,
  DeliveryDisplay,
  BusinessDisplay,
  StatusBadge,
  VerifiedBadge,
  HeroPrimaryButton,
  HeroOutlineButton,
} from "./userProfileParts";

// ✅ Import des styles d'animation du Dashboard
import "../../styles/animations.css";

// Constantes KYC
const KYC_WINDOW_MS = 72 * 60 * 60 * 1000; // 72h

// ✅ Couleurs projet (palette de votre application)
const BRAND = {
  primary: "#0B568C",       // Bleu foncé principal
  primaryDark: "#1A4F75",   // Bleu foncé plus sombre
  accent: "#27B1E4",        // Bleu clair/accent
  accentLight: "#4FC3F7",   // Bleu plus clair
  secondary: "#335F7A",     // Bleu-gris
  text: "#1A202C",          // Texte foncé
  muted: "#718096",         // Texte secondaire
  light: "#F7FAFC",         // Fond clair
  panel: "rgba(255, 255, 255, 0.95)", // Panel semi-transparent
  border: "rgba(226, 232, 240, 0.8)", // Bordure légère
  success: "#38A169",       // Vert succès
  warning: "#D69E2E",       // Jaune avertissement
  error: "#E53E3E",         // Rouge erreur
  info: "#3182CE",          // Bleu info
  bgA: "rgba(11, 86, 140, 0.04)",   // Dégradé A
  bgB: "rgba(39, 177, 228, 0.04)",  // Dégradé B
  ring: "rgba(39, 177, 228, 0.35)", // Anneau focus
};

interface ProfileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed?: boolean;
}

interface UserDocumentItem {
  id: number;
  document_type: string;
  file: string;
  file_name?: string;
  description?: string;
  uploaded_at?: string;
  verified?: boolean;
  expiry_date?: string | null;
}

type UserData = ApiUserProfile & {
  documents?: UserDocumentItem[];
  account_type?: string;
  role?: string;
  kyc_status?: string;
  account_status?: string;
  account_type_label?: string;
  account_category?: string | null;
  account_category_label?: string | null;
  photo_url?: string;
  photo?: string;
  avatar_url?: string;
  created_at?: string;
  date_joined?: string;
  client_type?: string;
  supplier_type?: string;
  merchant_type?: string;
  delivery_type?: string;
  boutique_type?: string;
  
  // Statistiques (si disponibles)
  bookings_count?: number;
  orders_count?: number;
  invoices_count?: number;
  giftcards_count?: number;
  reviews_count?: number;
  rating?: number;
  
  [key: string]: any;
};

// ------------------------- Utils -------------------------
function toStr(v: any, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function toBool(v: any, fallback = false): boolean {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Boolean(v);
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(s)) return false;
  }
  return fallback;
}

function toArr(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [v];
    }
  }
  return [v];
}

function safeDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function pickPhotoUrl(u: any): string {
  return (
    toStr(u?.photo_url) ||
    toStr(u?.avatar_url) ||
    toStr(u?.photo) ||
    toStr(u?.profile_photo_url) ||
    toStr(u?.image_url) ||
    ""
  );
}

function pickAccountCreatedAt(u: any): Date | null {
  return safeDate(u?.created_at) || safeDate(u?.date_joined) || null;
}

function hasValue(v: any) {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (3600 * 24));
  const hours = Math.floor((total % (3600 * 24)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDateOnly(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString();
}

function formatNumber(v: any): string {
  const n = Number(v ?? 0);
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat().format(n);
}

// ------------------------- Crop helpers -------------------------
type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Crop failed"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

function blobToFile(blob: Blob, filename: string) {
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

// ========================= Composant principal =========================
export default function UserProfile({ isInDashboard = false }: { isInDashboard?: boolean }) {
  // ✅ Sections du profil (menu latéral)
  type ProfileSection = "personal" | "address" | "identity" | "boutique" | "delivery" | "business" | "documents" | "activity";
  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");
  
  // ✅ Onglets d'édition (pour les formulaires)
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [formData, setFormData] = useState<ExtendedUserRegistrationData>({
    account_type: "client",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    password2: "",
    full_name: "",
    phone: "",
    role: "",
    nationality: "",
    gender: undefined,
    date_of_birth: "",
    accepted_terms: true,
    // Adresse
    address_line: "",
    province: "",
    commune: "",
    colline_or_quartier: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    // Identité
    id_type: undefined,
    id_number: "",
    id_issue_date: "",
    id_expiry_date: "",
    id_no_expiry: false,
    // Boutique
    boutique_type: undefined,
    boutique_services: [],
    // Livraison
    delivery_vehicle: undefined,
    vehicle_registration: "",
    preferred_delivery_time: "",
    delivery_instructions: "",
    // Entreprise
    business_name: "",
    business_entity_type: undefined,
    business_registration_number: "",
    business_tax_id: "",
    business_doc_expiry_date: "",
    // Autres
    lumicash_msisdn: "",
    accepted_contract: false,
  } as ExtendedUserRegistrationData);

  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    personal: false,
    address: false,
    identity: false,
    boutique: false,
    delivery: false,
    business: false,
  });

  const [userDocuments, setUserDocuments] = useState<UserDocumentItem[]>([]);

  // ✅ Modals
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<"kyc" | "kyb">("kyc");
  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // ✅ Crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawPhotoName, setRawPhotoName] = useState<string>("profile.jpg");

  // ✅ Notes/Activité
  const [noteText, setNoteText] = useState<string>("");
  const [pinnedNote, setPinnedNote] = useState<string>(
    "Note importante : Veuillez compléter votre profil KYC dans les 72 heures suivant votre inscription pour débloquer toutes les fonctionnalités."
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Utilisateur affiché (fusion user + formData)
  const displayUser = useMemo(() => {
    return {
      ...(user || {}),
      ...(formData || {}),
      full_name: (formData as any)?.full_name || (user as any)?.full_name || "",
      email: (formData as any)?.email || (user as any)?.email || "",
      phone: (formData as any)?.phone || (user as any)?.phone || "",
      account_type: (formData as any)?.account_type || (user as any)?.account_type || "",
      account_type_label: (formData as any)?.account_type_label || (user as any)?.account_type_label || "",
      account_category_label: (formData as any)?.account_category_label || (user as any)?.account_category_label || "",
      kyc_status: (formData as any)?.kyc_status || (user as any)?.kyc_status || "",
      rating: (user as any)?.rating ?? (formData as any)?.rating ?? 4.8,
      reviews_count: (user as any)?.reviews_count ?? (formData as any)?.reviews_count ?? 12,
    } as any;
  }, [user, formData]);

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    return () => {
      if (cropImageSrc && cropImageSrc.startsWith("blob:")) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  // ------------------------- KYC / Locking -------------------------
  const kycStartDate = useMemo(() => {
    if (accountCreatedAt) return accountCreatedAt;
    return new Date(nowTs);
  }, [accountCreatedAt, nowTs]);

  const kycDeadline = useMemo(() => new Date(kycStartDate.getTime() + KYC_WINDOW_MS), [kycStartDate]);
  const kycRemainingMs = useMemo(() => Math.max(0, kycDeadline.getTime() - nowTs), [kycDeadline, nowTs]);
  const deadlinePassed = useMemo(() => kycRemainingMs <= 0, [kycRemainingMs]);

  const backendKycStatus = (displayUser?.kyc_status || "unverified") as string;
  const globalLocked = useMemo(() => backendKycStatus === "verified", [backendKycStatus]);

  // ------------------------- Documents grouping -------------------------
  const kycDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs.filter((d) =>
      ["id_card", "passport", "proof_of_address", "selfie"].includes(String(d.document_type || "").toLowerCase())
    );
  }, [userDocuments]);

  const kybDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs.filter(
      (d) => !["id_card", "passport", "proof_of_address", "selfie"].includes(String(d.document_type || "").toLowerCase())
    );
  }, [userDocuments]);

  const accountType = useMemo(() => toStr(displayUser?.account_type || ""), [displayUser?.account_type]);
  const kybRequired = useMemo(() => ["fournisseur", "partenaire", "entreprise"].includes(accountType), [accountType]);

  const kycSubmitted = useMemo(() => (kycDocs || []).length > 0, [kycDocs]);
  const kybSubmitted = useMemo(() => (kybDocs || []).length > 0, [kybDocs]);

  const computedAccountBlocked = useMemo(() => {
    if (!user?.id) return false;
    if (!deadlinePassed) return false;

    const kycOk = kycSubmitted;
    const kybOk = !kybRequired ? true : kybSubmitted;

    return !(kycOk && kybOk);
  }, [user?.id, deadlinePassed, kycSubmitted, kybRequired, kybSubmitted]);

  const accountBlocked = useMemo(() => {
    if (globalLocked) return false;
    return computedAccountBlocked;
  }, [globalLocked, computedAccountBlocked]);

  const docsLocked = useMemo(() => {
    if (globalLocked) return true;
    if (deadlinePassed) return true;
    return false;
  }, [globalLocked, deadlinePassed]);

  const showKycZone = useMemo(() => {
    if (!user?.id) return false;
    return !globalLocked;
  }, [user?.id, globalLocked]);

  const effectiveKycStatus = useMemo(() => {
    if (globalLocked) return "verified";
    if (!deadlinePassed) return backendKycStatus || "unverified";
    return kycSubmitted ? "verified" : "blocked";
  }, [globalLocked, deadlinePassed, backendKycStatus, kycSubmitted]);

  const effectiveKybStatus = useMemo(() => {
    if (!kybRequired) return "not_required";
    if (globalLocked) return "verified";
    if (!deadlinePassed) return "pending";
    return kybSubmitted ? "verified" : "blocked";
  }, [kybRequired, globalLocked, deadlinePassed, kybSubmitted]);

  const kycStatusLabel = useMemo(() => {
    if (effectiveKycStatus === "verified") return "KYC Vérifié";
    if (effectiveKycStatus === "pending") return "KYC En Attente";
    if (effectiveKycStatus === "rejected") return "KYC Rejeté";
    if (effectiveKycStatus === "blocked") return "KYC Incomplet (Compte bloqué)";
    return "KYC Incomplet";
  }, [effectiveKycStatus]);

  const kybStatusLabel = useMemo(() => {
    if (!kybRequired) return "KYB Non Requis";
    if (effectiveKybStatus === "verified") return "KYB Vérifié";
    if (effectiveKybStatus === "blocked") return "KYB Incomplet (Compte bloqué)";
    return docsLocked ? "KYB (lecture seule)" : "KYB En Attente";
  }, [kybRequired, effectiveKybStatus, docsLocked]);

  const kycDeadlineMessage = useMemo(() => {
    const uname =
      (displayUser?.username && String(displayUser.username)) ||
      (displayUser?.full_name && String(displayUser.full_name)) ||
      "utilisateur";
    return `Hello ${uname}, vous disposez de 72 heures après votre inscription pour mettre à jour vos documents KYC/KYB. Après ce délai, aucune modification ne sera possible.`;
  }, [displayUser?.username, displayUser?.full_name]);

  // ------------------------- API load -------------------------
  const loadUserProfile = async (): Promise<void> => {
    try {
      setIsLoadingProfile(true);

      const userData: UserData = await getCurrentUser();
      dispatch(updateProfile(userData as any));

      const createdAt = pickAccountCreatedAt(userData);
      if (createdAt) setAccountCreatedAt(createdAt);

      const docs = Array.isArray(userData.documents) ? userData.documents : [];
      setUserDocuments(docs);

      const pUrl = pickPhotoUrl(userData);
      setProfilePhotoPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return pUrl;
      });

      const profileData: ExtendedUserRegistrationData = {
        account_type: ((userData.account_type ?? "client") as any) ?? "client",
        username: toStr(userData.username),
        email: toStr(userData.email),
        role: toStr(userData.role),
        password: "",
        confirm_password: "",
        password2: "",
        full_name: toStr((userData as any).full_name),
        phone: toStr((userData as any).phone),
        gender: (userData as any).gender as any,
        date_of_birth: toStr((userData as any).date_of_birth),
        nationality: toStr((userData as any).nationality),

        id_type: (userData as any).id_type as any,
        id_number: toStr((userData as any).id_number),
        id_issue_date: toStr((userData as any).id_issue_date),
        id_expiry_date: toStr((userData as any).id_expiry_date),
        id_no_expiry: toBool((userData as any).id_no_expiry, false),

        address_line: toStr((userData as any).address_line),
        province: toStr((userData as any).province),
        commune: toStr((userData as any).commune),
        colline_or_quartier: toStr((userData as any).colline_or_quartier),

        emergency_contact_name: toStr((userData as any).emergency_contact_name),
        emergency_contact_phone: toStr((userData as any).emergency_contact_phone),
        emergency_contact_relationship: toStr((userData as any).emergency_contact_relationship),

        business_name: toStr((userData as any).business_name),
        business_entity_type: (userData as any).business_entity_type as any,
        business_registration_number: toStr((userData as any).business_registration_number),
        business_tax_id: toStr((userData as any).business_tax_id),
        business_doc_expiry_date: toStr((userData as any).business_doc_expiry_date),

        boutique_type: (userData as any).boutique_type as any,
        boutique_services: toArr((userData as any).boutique_services),

        delivery_vehicle: (userData as any).delivery_vehicle as any,
        vehicle_registration: toStr((userData as any).vehicle_registration),
        preferred_delivery_time: toStr((userData as any).preferred_delivery_time),
        delivery_instructions: toStr((userData as any).delivery_instructions),

        lumicash_msisdn: toStr((userData as any).lumicash_msisdn),

        accepted_terms: true,
        accepted_contract: toBool((userData as any).accepted_contract, false),

        // files (new upload only)
        id_front_image: null,
        id_back_image: null,
        passport_photo: null,
        business_document: null,
        photo: null,
        signature: null,

        kyc_status: ((userData as any).kyc_status as any) ?? undefined,
        account_status: ((userData as any).account_status as any) ?? undefined,

        account_type_label: (userData as any).account_type_label,
        account_category: (userData as any).account_category,
        account_category_label: (userData as any).account_category_label,
      } as any;

      setFormData(profileData);

      setEditMode({
        personal: false,
        address: false,
        identity: false,
        boutique: false,
        delivery: false,
        business: false,
      });
    } catch (error: any) {
      setErrorMessage("Erreur lors du chargement du profil: " + (error?.message || "Erreur inconnue"));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ------------------------- handlers -------------------------
  const handleInputChange: InputChangeHandler = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: ExtendedUserRegistrationData) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if ((formErrors as any)[name]) {
      setFormErrors((prev: FormValidationErrors) => {
        const newErrors = { ...(prev as any) };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange: FileChangeHandler = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Photo uniquement (crop)
      if (name === "photo") {
        try {
          const url = URL.createObjectURL(file);

          setRawPhotoName(file.name || "profile.jpg");
          setCropImageSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) URL.revokeObjectURL(prevSrc);
            return url;
          });

          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCroppedAreaPixels(null);
          setCropModalOpen(true);

          return;
        } catch {
          setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: file }));
          const url = URL.createObjectURL(file);
          setProfilePhotoPreview((prevUrl) => {
            if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
            return url;
          });
        }
        return;
      }

      // autres fichiers
      setFormData((prev: ExtendedUserRegistrationData) => ({
        ...prev,
        [name]: file,
      }));

      if ((formErrors as any)[name]) {
        setFormErrors((prev: FormValidationErrors) => {
          const newErrors = { ...(prev as any) };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleArrayChange: ArrayChangeHandler = (name: string, value: string[]) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange: CheckboxChangeHandler = (name: string, checked: boolean) => {
    setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: checked }));
  };

  // ------------------------- edit rules -------------------------
  const isReadOnlyThisTab = useMemo(() => {
    if (globalLocked) return true;
    if (accountBlocked) return true;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return true;
    return !editMode[activeTab];
  }, [activeTab, editMode, globalLocked, accountBlocked, docsLocked]);

  const allowEditThisTab = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return false;
    return true;
  }, [globalLocked, accountBlocked, activeTab, docsLocked]);

  const hideFileInputs = useMemo(() => {
    if (globalLocked || accountBlocked) return true;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return true;
    return !editMode[activeTab];
  }, [activeTab, editMode, globalLocked, accountBlocked, docsLocked]);

  const isEditingAnything = useMemo(() => Object.values(editMode).some(Boolean), [editMode]);

  const enableEditAll = () => {
    if (globalLocked) return;
    if (accountBlocked) return;

    setEditMode((prev) => ({
      ...prev,
      personal: true,
      address: true,
      boutique: true,
      delivery: true,
      identity: !docsLocked ? true : prev.identity,
      business: !docsLocked ? true : prev.business,
    }));

    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
  };

  const cancelEditAll = () => {
    setFormErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setEditMode({
      personal: false,
      address: false,
      identity: false,
      boutique: false,
      delivery: false,
      business: false,
    });
    loadUserProfile();
  };

  const toggleEditAll = () => {
    if (isEditingAnything) cancelEditAll();
    else enableEditAll();
  };

  // ------------------------- Docs modal -------------------------
  const openDocsModal = async (tab: "kyc" | "kyb") => {
    await loadUserProfile();
    setDocsModalTab(tab);
    setDocsModalOpen(true);
  };

  const closeDocsModal = () => setDocsModalOpen(false);

  const docsEditableInModal = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if (docsLocked) return false;
    if (docsModalTab === "kyb" && !kybRequired) return false;
    return true;
  }, [globalLocked, accountBlocked, docsLocked, docsModalTab, kybRequired]);

  const saveDocsFromModal = async () => {
    if (!docsEditableInModal) {
      setErrorMessage("Modification désactivée (délai expiré ou compte verrouillé).");
      return;
    }

    setIsSavingDocs(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const fd = new FormData();

      if (docsModalTab === "kyc") {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;

        if (f1 instanceof File) fd.append("id_front_image", f1);
        if (f2 instanceof File) fd.append("id_back_image", f2);
        if (f3 instanceof File) fd.append("passport_photo", f3);

        const idType = (formData as any).id_type;
        const idNumber = (formData as any).id_number;
        if (idType) fd.append("id_type", String(idType));
        if (idNumber) fd.append("id_number", String(idNumber));
      }

      if (docsModalTab === "kyb") {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) fd.append("business_document", b1);

        const bname = (formData as any).business_name;
        if (bname) fd.append("business_name", String(bname));
      }

      if ([...fd.keys()].length === 0) {
        setErrorMessage("Sélectionnez au moins un fichier à envoyer.");
        return;
      }

      await updateUserProfile(fd);
      await loadUserProfile();

      setSuccessMessage(docsModalTab === "kyc" ? "Documents KYC mis à jour !" : "Documents KYB mis à jour !");
    } catch (e: any) {
      setErrorMessage(e?.message || "Erreur lors de la mise à jour des documents");
    } finally {
      setIsSavingDocs(false);
    }
  };

  // ------------------------- Crop -------------------------
  const onCropComplete = (_: any, croppedPixels: any) => {
    if (!croppedPixels) return;
    setCroppedAreaPixels({
      x: croppedPixels.x,
      y: croppedPixels.y,
      width: croppedPixels.width,
      height: croppedPixels.height,
    });
  };

  const applyCroppedPhoto = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) {
        setCropModalOpen(false);
        return;
      }

      const blob = await getCroppedBlob(cropImageSrc, croppedAreaPixels);
      const finalFile = blobToFile(blob, rawPhotoName || "profile.jpg");

      setFormData((prev) => ({ ...prev, photo: finalFile } as any));

      const newPreviewUrl = URL.createObjectURL(finalFile);
      setProfilePhotoPreview((prevUrl) => {
        if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
        return newPreviewUrl;
      });

      setCropModalOpen(false);
    } catch (e) {
      setErrorMessage("Impossible de recadrer l'image. Réessayez avec une autre photo.");
      setCropModalOpen(false);
    }
  };

  // ------------------------- save profil -------------------------
  const handleSave = async (): Promise<void> => {
    if (accountBlocked) {
      setErrorMessage("Votre compte est bloqué car le délai est expiré. Les documents ne peuvent plus être modifiés.");
      return;
    }
    if (globalLocked) {
      setErrorMessage("Votre KYC est validé. Le profil est verrouillé.");
      return;
    }
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) {
      setErrorMessage("Le délai est terminé. Les documents ne peuvent plus être modifiés ni supprimés.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFormErrors({});

    try {
      const updateData = new FormData();

      const fieldsToUpdate = [
        "full_name",
        "phone",
        "email",
        "gender",
        "date_of_birth",
        "nationality",
        "address_line",
        "province",
        "commune",
        "colline_or_quartier",
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship",
        "business_name",
        "business_entity_type",
        "business_registration_number",
        "business_tax_id",
        "business_doc_expiry_date",
        "boutique_type",
        "boutique_services",
        "delivery_vehicle",
        "vehicle_registration",
        "preferred_delivery_time",
        "delivery_instructions",
        "lumicash_msisdn",
        "id_type",
        "id_number",
        "id_issue_date",
        "id_expiry_date",
        "id_no_expiry",
      ];

      fieldsToUpdate.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) updateData.append(key, value);
          else if (Array.isArray(value)) updateData.append(key, JSON.stringify(value));
          else updateData.append(key, String(value));
        }
      });

      if (editMode.personal) {
        const photo = (formData as any).photo;
        if (photo instanceof File) updateData.append("photo", photo);

        const signature = (formData as any).signature;
        if (signature instanceof File) updateData.append("signature", signature);
      }

      if (activeTab === "identity" && editMode.identity && !docsLocked) {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;
        if (f1 instanceof File) updateData.append("id_front_image", f1);
        if (f2 instanceof File) updateData.append("id_back_image", f2);
        if (f3 instanceof File) updateData.append("passport_photo", f3);
      }

      if (activeTab === "business" && editMode.business && !docsLocked) {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) updateData.append("business_document", b1);
      }

      await updateUserProfile(updateData);
      await loadUserProfile();

      setSuccessMessage("Profil mis à jour avec succès !");
    } catch (error: any) {
      if (error?.payload?.errors) {
        const backendErrors: FormValidationErrors = {};
        Object.entries(error.payload.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) (backendErrors as any)[field] = (messages as any[]).join(", ");
          else (backendErrors as any)[field] = String(messages);
        });
        setFormErrors(backendErrors);
      }
      setErrorMessage(error?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- Render form content -------------------------
  const renderFormBlock = (): React.ReactNode => {
    if (isLoadingProfile) {
      return (
        <div className="flex justify-center items-center py-14">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: BRAND.primary }} />
            <p className="text-sm" style={{ color: BRAND.muted }}>Chargement de votre profil...</p>
          </div>
        </div>
      );
    }

    if (!editMode[activeTab]) {
      switch (activeTab) {
        case "personal":
          return <PersonalInfoDisplay formData={formData} />;
        case "address":
          return <AddressDisplay formData={formData} />;
        case "identity":
          return <IdentityDisplay formData={formData} />;
        case "boutique":
          return <BoutiqueDisplay formData={formData} />;
        case "delivery":
          return <DeliveryDisplay formData={formData} />;
        case "business":
          return <BusinessDisplay formData={formData} />;
        default:
          return <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>Sélectionnez une section.</div>;
      }
    }

    const commonProps: RegistrationStepProps = {
      formData,
      formErrors,
      onInputChange: handleInputChange,
      onFileChange: handleFileChange,
      onArrayChange: handleArrayChange,
      onCheckboxChange: handleCheckboxChange,
      mode: "profile" as const,
    };

    switch (activeTab) {
      case "personal":
        return <RegisterPersonalInfoForm {...commonProps} />;
      case "address":
        return <RegisterAddressForm {...commonProps} />;
      case "identity":
        return <RegisterIdentityVerificationForm {...commonProps} />;
      case "boutique":
        return <RegisterBoutiqueInfoForm {...commonProps} />;
      case "delivery":
        return <RegisterDeliveryInfo {...commonProps} />;
      case "business":
        return <RegisterBusinessDocuments {...commonProps} />;
      default:
        return <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>Sélectionnez une section.</div>;
    }
  };

  // Ne pas afficher la Navigation si on est dans le dashboard
  const shouldShowNavigation = !isInDashboard && !location.pathname.includes("/dashboard");

  // ------------------------- Statistiques -------------------------
  const stats = useMemo(() => {
    return {
      bookings: (displayUser as any)?.bookings_count || 0,
      orders: (displayUser as any)?.orders_count || 0,
      invoices: (displayUser as any)?.invoices_count || 0,
      giftcards: (displayUser as any)?.giftcards_count || 0,
      reviews: (displayUser as any)?.reviews_count || 0,
      rating: (displayUser as any)?.rating || 0,
    };
  }, [displayUser]);

  // ------------------------- Menu items (latéral) -------------------------
  const menuItems = useMemo(() => [
    { 
      id: "personal" as ProfileSection, 
      label: "Informations Personnelles", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Nom, email, téléphone, etc."
    },
    { 
      id: "address" as ProfileSection, 
      label: "Adresse", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Adresse complète et contacts"
    },
    { 
      id: "identity" as ProfileSection, 
      label: "Vérification KYC", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Documents d'identité",
      badge: kycStatusLabel
    },
    ...(accountType === "commercant" ? [{
      id: "boutique" as ProfileSection, 
      label: "Boutique", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h18M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11v6M15 11v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Informations de boutique"
    }] : []),
    ...(accountType === "livreur" ? [{
      id: "delivery" as ProfileSection, 
      label: "Livraison", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 17h4V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 17h6v-4a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Informations de livraison"
    }] : []),
    ...(["fournisseur", "partenaire", "entreprise"].includes(accountType) ? [{
      id: "business" as ProfileSection, 
      label: "Documents Entreprise", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Documents KYB",
      badge: kybStatusLabel
    }] : []),
    { 
      id: "documents" as ProfileSection, 
      label: "Documents", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Tous vos documents"
    },
    { 
      id: "activity" as ProfileSection, 
      label: "Activité", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      description: "Historique d'activité"
    },
  ], [accountType, kycStatusLabel, kybStatusLabel]);

  // ------------------------- Composants UI réutilisables -------------------------
  const ActionButton = ({
    children,
    onClick,
    variant = "outline",
    disabled,
    className = "",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "outline" | "primary" | "accent";
    disabled?: boolean;
    className?: string;
  }) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border";
    
    if (variant === "primary") {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-90`}
          style={{
            borderColor: "transparent",
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {children}
        </button>
      );
    }
    
    if (variant === "accent") {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-90`}
          style={{
            borderColor: "transparent",
            background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentLight} 100%)`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {children}
        </button>
      );
    }
    
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${className} bg-white hover:bg-gray-50`}
        style={{
          borderColor: BRAND.border,
          color: BRAND.text,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {children}
      </button>
    );
  };

  const MenuItem = ({
    item,
    active,
    onClick,
  }: {
    item: any;
    active: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
          active 
            ? "bg-white shadow-sm ring-2" 
            : "hover:bg-gray-50/80"
        }`}
        style={{
          background: active ? BRAND.panel : "transparent",
          borderColor: active ? BRAND.accent : "transparent",
          ringColor: BRAND.ring,
        }}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: active 
              ? `linear-gradient(135deg, ${BRAND.primary}15 0%, ${BRAND.accent}15 100%)`
              : `linear-gradient(135deg, ${BRAND.light} 0%, #FFFFFF 100%)`,
            color: active ? BRAND.primary : BRAND.muted,
            border: `1px solid ${active ? BRAND.accent + '30' : BRAND.border}`,
          }}
        >
          {item.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${active ? 'text-gray-900' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {item.badge}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 truncate" style={{ color: BRAND.muted }}>
            {item.description}
          </p>
        </div>
      </button>
    );
  };

  // ========================= RENDER =========================
  return (
    <>
      {shouldShowNavigation && <Navigation />}

      {/* ✅ Modal docs */}
      {docsModalOpen && (
        <div className="fixed inset-0 z-[10050] animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeDocsModal();
            }}
            onTouchStart={(e) => {
              if (e.target === e.currentTarget) closeDocsModal();
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-scaleIn"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-extrabold text-gray-900">
                      {docsModalTab === "kyc" ? "Documents KYC" : "Documents KYB"}
                    </h3>
                    {docsModalTab === "kyc" ? (
                      <StatusBadge 
                        tone={effectiveKycStatus === "verified" ? "green" : effectiveKycStatus === "blocked" ? "red" : "yellow"} 
                        label={kycStatusLabel} 
                      />
                    ) : (
                      <StatusBadge 
                        tone={effectiveKybStatus === "verified" ? "green" : effectiveKybStatus === "blocked" ? "red" : "yellow"} 
                        label={kybStatusLabel} 
                      />
                    )}
                    {docsLocked ? <StatusBadge tone="red" label="Lecture seule" /> : <StatusBadge tone="blue" label="Éditable" />}
                  </div>
                  <p className="text-sm mt-1 text-gray-600">
                    {docsLocked
                      ? "Le délai est terminé. Vous pouvez consulter les fichiers soumis."
                      : "Vous pouvez consulter et mettre à jour vos fichiers tant que le délai n'est pas expiré."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDocsModal}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                  style={{ borderColor: "rgba(11,86,140,0.2)" }}
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6L6 18" strokeLinecap="round" />
                    <path d="M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Contenu du modal (simplifié pour la lisibilité) */}
              <div className="px-5 sm:px-6 py-5">
                {/* ... (contenu du modal existant) ... */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal crop photo */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[10000] animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setCropModalOpen(false);
            }}
            onTouchStart={(e) => {
              if (e.target === e.currentTarget) setCropModalOpen(false);
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white animate-scaleIn"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Ajuster la photo</h3>
                  <p className="text-sm mt-1 text-gray-600">Glissez pour déplacer l'image, puis zoomez pour ajuster.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                  style={{ borderColor: "rgba(11,86,140,0.2)" }}
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6L6 18" strokeLinecap="round" />
                    <path d="M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="px-5 sm:px-6 py-5">
                <div
                  className="relative w-full h-[340px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 touch-none"
                  style={{ touchAction: "none" }}
                >
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    restrictPosition={false}
                  />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Zoom</span>
                    <span className="text-xs font-semibold text-gray-600">{Math.round(zoom * 100)}%</span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-2"
                  />

                  <div className="mt-3 text-xs text-gray-600">Astuce: maintenez le clic gauche et glissez pour déplacer.</div>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCropModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200"
                  style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                >
                  Annuler
                </button>

                <button
                  onClick={applyCroppedPhoto}
                  className="px-4 py-2 rounded-full text-white font-semibold transition-all duration-200"
                  style={{ background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%)` }}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================= PAGE PRINCIPALE ========================= */}
      <div
        className={`${isInDashboard ? 'min-h-[calc(100vh-80px)]' : 'min-h-screen'}`}
        style={{
          background: isInDashboard ? '#FFFFFF' : `linear-gradient(135deg, ${BRAND.bgA} 0%, ${BRAND.bgB} 100%)`,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          marginTop: 80
        }}
      >
        {/* Contenu principal */}
        <div className={`${isInDashboard ? 'w-full px-4 py-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
          {/* Alerts */}
          <div className="mb-6 space-y-3">
            {successMessage && <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
            {errorMessage && <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}
          </div>

          {/* Zone d'alerte KYC */}
          {showKycZone && (
              <div className="mb-6" style={{ marginTop: 84}}>
                <div className="rounded-2xl p-4 border bg-gradient-to-r from-red-50 to-orange-50 shadow-sm" style={{ borderColor: "rgba(239,68,68,0.25)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">{kycDeadlineMessage}</p>
                        {!globalLocked && !accountBlocked && kycRemainingMs > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 py-1.5 font-mono text-sm font-bold text-red-700 shadow-sm animate-pulse">
                              {formatDuration(kycRemainingMs)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {accountBlocked && !globalLocked && (
                      <ActionButton
                        variant="accent"
                        onClick={handleSave}
                        className="whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Réactiver KYC
                      </ActionButton>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Layout: sidebar + contenu */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className={`${isInDashboard ? 'lg:col-span-3 xl:col-span-2' : 'lg:col-span-4'}`}>
              <div className="space-y-6">
                {/* Menu latéral */}
                <div className="rounded-2xl p-5 shadow-sm border bg-white" style={{ borderColor: BRAND.border }}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.muted }}>
                    Navigation
                  </h3>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        active={activeSection === item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setActiveTab(item.id);
                        }}
                      />
                    ))}
                  </div>

                  {/* Section KYC/KYB */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.muted }}>
                      Documents KYC/KYB
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: BRAND.text }}>Statut KYC</span>
                        <StatusBadge 
                          tone={effectiveKycStatus === "verified" ? "green" : effectiveKycStatus === "blocked" ? "red" : "yellow"} 
                          label={kycStatusLabel} 
                        />
                      </div>
                      {kybRequired && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: BRAND.text }}>Statut KYB</span>
                          <StatusBadge 
                            tone={effectiveKybStatus === "verified" ? "green" : effectiveKybStatus === "blocked" ? "red" : "yellow"} 
                            label={kybStatusLabel} 
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <ActionButton
                          variant="outline"
                          onClick={() => openDocsModal("kyc")}
                          disabled={!user?.id}
                          className="text-xs"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Voir KYC
                        </ActionButton>
                        <ActionButton
                          variant="outline"
                          onClick={() => openDocsModal("kyb")}
                          disabled={!user?.id || !kybRequired}
                          className="text-xs"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Voir KYB
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Contenu principal */}
            <main className={`${isInDashboard ? 'lg:col-span-9 xl:col-span-10' : 'lg:col-span-8'}`}>
              {/* Section sélectionnée */}
              <div className="rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                {/* Header de la section */}
                <div className="px-5 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: BRAND.border }}>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: BRAND.text }}>
                      {menuItems.find(m => m.id === activeSection)?.label || "Informations"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                      {menuItems.find(m => m.id === activeSection)?.description || "Gérez vos informations personnelles"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditingAnything && (
                      <ActionButton
                        variant="outline"
                        onClick={cancelEditAll}
                        disabled={globalLocked || accountBlocked}
                        className="text-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Annuler
                      </ActionButton>
                    )}
                    <ActionButton
                      variant={isEditingAnything ? "primary" : "outline"}
                      onClick={isEditingAnything ? handleSave : () => {
                        setEditMode(prev => ({ ...prev, [activeTab]: true }));
                      }}
                      disabled={isLoading || isLoadingProfile || globalLocked || accountBlocked || !allowEditThisTab}
                      className="text-sm"
                    >
                      {isEditingAnything ? (
                        isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points="7 3 7 8 15 8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Enregistrer
                          </>
                        )
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Modifier
                        </>
                      )}
                    </ActionButton>
                  </div>
                </div>

                {/* Contenu de la section */}
                <div className="p-5 sm:p-6">
                  <div
                    className={[
                      "animate-fadeIn",
                      isReadOnlyThisTab ? "pointer-events-none select-none opacity-95" : "",
                      hideFileInputs ? "[&_input[type=file]]:hidden **:data-upload:hidden **:data-file-upload:hidden [&_.file-upload]:hidden" : "",
                    ].join(" ")}
                  >
                    {renderFormBlock()}
                  </div>

                  {/* Boutons d'action en bas */}
                  {isEditingAnything && (
                    <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: BRAND.border }}>
                      <div className="text-sm" style={{ color: BRAND.muted }}>
                        {globalLocked
                          ? "Profil verrouillé après validation."
                          : accountBlocked
                          ? "Compte bloqué. Délai expiré et documents requis manquants."
                          : "Modifiez les champs ci-dessus puis enregistrez vos modifications."}
                      </div>
                      <div className="flex items-center gap-3">
                        <ActionButton
                          variant="outline"
                          onClick={loadUserProfile}
                          disabled={isLoading || isLoadingProfile}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Actualiser
                        </ActionButton>
                        <ActionButton
                          variant="primary"
                          onClick={handleSave}
                          disabled={isLoading || isLoadingProfile || globalLocked || accountBlocked || !allowEditThisTab}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              Enregistrement...
                            </>
                          ) : (
                            "Enregistrer les modifications"
                          )}
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section notes/activité (si sélectionnée) */}
              {activeSection === "activity" && (
                <div className="mt-6 rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                  <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: BRAND.border }}>
                    <h3 className="text-lg font-bold" style={{ color: BRAND.text }}>Notes et Activité</h3>
                  </div>
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Zone de saisie de note */}
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: BRAND.border }}>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Ajoutez une note interne..."
                        className="w-full min-h-[100px] px-4 py-3 text-sm outline-none resize-none"
                        style={{ color: BRAND.text }}
                      />
                      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between" style={{ borderColor: BRAND.border }}>
                        <span className="text-xs font-medium" style={{ color: BRAND.muted }}>
                          Note interne visible uniquement par l'équipe
                        </span>
                        <ActionButton
                          variant="accent"
                          onClick={() => {
                            if (noteText.trim()) {
                              setPinnedNote(noteText);
                              setNoteText("");
                            }
                          }}
                          className="text-xs"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Épingler
                        </ActionButton>
                      </div>
                    </div>

                    {/* Note épinglée */}
                    {pinnedNote && (
                      <div className="rounded-xl border overflow-hidden" style={{ 
                        borderColor: "rgba(245, 158, 11, 0.3)",
                        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(252, 211, 77, 0.05) 100%)"
                      }}>
                        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" style={{ color: "#D69E2E" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-sm font-semibold" style={{ color: "#92400E" }}>Note épinglée</span>
                          </div>
                          <button
                            onClick={() => setPinnedNote("")}
                            className="text-xs font-medium px-3 py-1 rounded-lg border hover:bg-white transition-colors"
                            style={{ 
                              borderColor: "rgba(245, 158, 11, 0.3)",
                              color: "#92400E"
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="px-4 py-3 text-sm leading-relaxed" style={{ color: "#78350F" }}>
                          {pinnedNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Fallback: utilisateur non connecté */}
          {!user?.id && (
            <div className="mt-8 rounded-2xl shadow-sm border bg-white p-8 text-center" style={{ borderColor: BRAND.border }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                background: `linear-gradient(135deg, ${BRAND.primary}15 0%, ${BRAND.accent}15 100%)`,
                color: BRAND.primary
              }}>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: BRAND.text }}>Vous n'êtes pas connecté</h3>
              <p className="text-sm mb-6" style={{ color: BRAND.muted }}>
                Connectez-vous ou créez un compte pour accéder à votre profil.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <ActionButton
                  variant="primary"
                  onClick={() => navigate("/register")}
                >
                  Créer un compte
                </ActionButton>
                <ActionButton
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Se connecter
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}