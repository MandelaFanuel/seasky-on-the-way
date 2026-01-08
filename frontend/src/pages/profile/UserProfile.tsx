// ========================= src/pages/profile/UserProfile.tsx =========================
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";

import { RootState, updateProfile } from "../../store/store";
import { getCurrentUser, updateUserProfile, type UserProfile as ApiUserProfile } from "../../api/client";

import AlertBanner from "../../components/ui/AlertBanner";
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
} from "./userProfileParts";

// ✅ Import des styles d'animation du Dashboard
import "../../styles/animations.css";

// Constantes KYC
const KYC_WINDOW_MS = 72 * 60 * 60 * 1000; // 72h

// ✅ Couleurs projet (palette de votre application)
const BRAND = {
  primary: "#0B568C",
  primaryDark: "#1A4F75",
  accent: "#27B1E4",
  accentLight: "#4FC3F7",
  secondary: "#335F7A",
  text: "#1A202C",
  muted: "#718096",
  light: "#F7FAFC",
  panel: "rgba(255, 255, 255, 0.95)",
  border: "rgba(226, 232, 240, 0.8)",
  success: "#38A169",
  warning: "#D69E2E",
  error: "#E53E3E",
  info: "#3182CE",
  bgA: "rgba(11, 86, 140, 0.04)",
  bgB: "rgba(39, 177, 228, 0.04)",
  ring: "rgba(39, 177, 228, 0.35)",
};

interface UserDocumentItem {
  id: number;
  document_type: string;
  file: string;
  file_name?: string;
  description?: string;
  uploaded_at?: string;
  verified?: boolean;
  expiry_date?: string | null;
  file_type?: "image" | "pdf" | "other";
  file_url?: string;
  category?: "kyc" | "kyb";
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

  // ⚠️ IMPORTANT: une seule source pour la photo de profil : "photo"
  // On garde les autres champs en lecture seulement pour compat backend éventuel,
  // mais on NE les utilise pas pour afficher/mettre à jour si "photo" existe.
  photo_url?: string;
  photo?: string;

  avatar_url?: string; // legacy
  created_at?: string;
  date_joined?: string;

  client_type?: string;
  supplier_type?: string;
  merchant_type?: string;
  delivery_type?: string;
  boutique_type?: string;

  bookings_count?: number;
  orders_count?: number;
  invoices_count?: number;
  giftcards_count?: number;
  reviews_count?: number;
  rating?: number;

  [key: string]: any;
};

type DocsModalTabType = "kyc" | "kyb" | "all";

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

function pickAccountCreatedAt(u: any): Date | null {
  return safeDate(u?.created_at) || safeDate(u?.date_joined) || null;
}

/**
 * ✅ UNE SEULE PHOTO DE PROFIL
 * Priorité stricte:
 * 1) photo_url (si backend renvoie déjà l'URL absolue)
 * 2) photo (chemin media relatif ou absolu)
 * 3) (compat) profile_picture_url / avatar_url / etc. seulement si photo absent
 */
function pickProfilePhotoUrl(u: any): string {
  const direct = toStr(u?.photo_url) || toStr(u?.photo);
  if (direct) return direct;

  // fallback legacy (si ton backend ancien)
  return (
    toStr(u?.profile_photo_url) ||
    toStr(u?.profile_picture_url) ||
    toStr(u?.profile_picture) ||
    toStr(u?.avatar_url) ||
    toStr(u?.image_url) ||
    ""
  );
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

function getFileType(filename: string): "image" | "pdf" | "other" {
  if (!filename) return "other";
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return "image";
  return "other";
}

function getAbsoluteFileUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://") || fileUrl.startsWith("blob:")) return fileUrl;

  const apiBase =
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:8000/api/v1";

  const baseUrl = String(apiBase).replace(/\/+$/, "").replace("/api/v1", "");
  return `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function getInitials(name?: string) {
  const n = String(name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[1]?.[0] : "";
  return (a + b).toUpperCase();
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
export default function UserProfile({
  isInDashboard = false,
  onEditModeChange,
  externalEditMode, // ✅ contrôlé par UserDashboard (source de vérité)
  onAvatarUpdated, // ✅ callback pour mettre à jour l'avatar instantanément dans le dashboard
  onRequestToggleEditMode, // ✅ demandé au parent quand le profil veut changer l'état
}: {
  isInDashboard?: boolean;
  onEditModeChange?: (editMode: boolean) => void;
  externalEditMode?: boolean;
  onAvatarUpdated?: (url: string | null) => void;
  onRequestToggleEditMode?: () => void;
}) {
  type ProfileSection =
    | "personal"
    | "address"
    | "identity"
    | "boutique"
    | "delivery"
    | "business"
    | "documents"
    | "activity";

  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");
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
    gender: "" as any,
    date_of_birth: "",
    accepted_terms: true,
    address_line: "",
    province: "",
    commune: "",
    colline_or_quartier: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    id_type: "" as any,
    id_number: "",
    id_issue_date: "",
    id_expiry_date: "",
    id_no_expiry: false,
    boutique_type: "" as any,
    boutique_services: [],
    delivery_vehicle: "" as any,
    vehicle_registration: "",
    preferred_delivery_time: "",
    delivery_instructions: "",
    business_name: "",
    business_entity_type: "" as any,
    business_registration_number: "",
    business_tax_id: "",
    business_doc_expiry_date: "",
    lumicash_msisdn: "",
    accepted_contract: false,
    client_type: "" as any,
    supplier_type: "" as any,
    merchant_type: "" as any,
    delivery_type: "" as any,
    id_front_image: null,
    id_back_image: null,
    passport_photo: null,
    business_document: null,
    photo: null, // ✅ UNIQUE: photo de profil
    signature: null,
  } as ExtendedUserRegistrationData);

  const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ✅ Preview locale (blob) uniquement; si vide => URL serveur
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const [userDocuments, setUserDocuments] = useState<UserDocumentItem[]>([]);

  // ✅ Modals
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<DocsModalTabType>("kyc");
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

  // ------------------------- EDIT MODE (source unique) -------------------------
  // ✅ local fallback si pas contrôlé par le parent
  const [internalEditMode, setInternalEditMode] = useState<boolean>(false);

  // ✅ mode effectif = parent si fourni, sinon interne
  const editModeEffective = typeof externalEditMode === "boolean" ? externalEditMode : internalEditMode;

  // ✅ Suivi des modifications pour activer le bouton Enregistrer
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ✅ Initial data pour comparer les modifications
  const [initialData, setInitialData] = useState<ExtendedUserRegistrationData | null>(null);

  // ✅ Notifier le parent lorsque le mode effectif change
  useEffect(() => {
    onEditModeChange?.(editModeEffective);
  }, [editModeEffective, onEditModeChange]);

  // ✅ si navigation state utilisé ailleurs
  useEffect(() => {
    const state = location.state as { editMode?: boolean } | null;
    if (state?.editMode) {
      if (typeof externalEditMode === "boolean") onRequestToggleEditMode?.();
      else setInternalEditMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ✅ URL serveur de la photo (unique)
  const serverPhotoUrl = useMemo(() => {
    const raw = pickProfilePhotoUrl(displayUser);
    return raw ? getAbsoluteFileUrl(raw) : "";
  }, [displayUser]);

  // ✅ Avatar final affiché (preview blob si présent, sinon serveur)
  const effectivePhotoUrl = useMemo(() => {
    return profilePhotoPreview || serverPhotoUrl || "";
  }, [profilePhotoPreview, serverPhotoUrl]);

  // ✅ Vérifier s'il y a des modifications non sauvegardées
  useEffect(() => {
    if (!editModeEffective || !initialData) {
      setHasUnsavedChanges(false);
      return;
    }

    // Vérifier les modifications dans les champs de formulaire
    const fieldsToCheck = [
      "full_name", "phone", "email", "gender", "date_of_birth", "nationality",
      "address_line", "province", "commune", "colline_or_quartier",
      "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship",
      "business_name", "business_entity_type", "business_registration_number", "business_tax_id", "business_doc_expiry_date",
      "boutique_type", "boutique_services", "delivery_vehicle", "vehicle_registration",
      "preferred_delivery_time", "delivery_instructions", "lumicash_msisdn",
      "id_type", "id_number", "id_issue_date", "id_expiry_date", "id_no_expiry",
      "client_type", "supplier_type", "merchant_type", "delivery_type"
    ];

    let hasChanges = false;

    // Vérifier les champs de formulaire
    for (const field of fieldsToCheck) {
      const currentValue = (formData as any)[field];
      const initialValue = (initialData as any)[field];
      
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        if (JSON.stringify(currentValue.sort()) !== JSON.stringify(initialValue.sort())) {
          hasChanges = true;
          break;
        }
      } else if (currentValue !== initialValue) {
        hasChanges = true;
        break;
      }
    }

    // Vérifier la photo
    if (!hasChanges) {
      const hasPhotoChanged = (formData as any).photo !== null;
      hasChanges = hasPhotoChanged;
    }

    // Vérifier les documents KYC
    if (!hasChanges) {
      const kycFields = ["id_front_image", "id_back_image", "passport_photo"];
      for (const field of kycFields) {
        if ((formData as any)[field] !== null) {
          hasChanges = true;
          break;
        }
      }
    }

    // Vérifier les documents KYB
    if (!hasChanges) {
      if ((formData as any).business_document !== null) {
        hasChanges = true;
      }
    }

    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData, editModeEffective]);

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
    return docs
      .filter((d) =>
        ["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
          String(d.document_type || "").toLowerCase()
        )
      )
      .map((doc) => ({
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: "kyc" as const,
      }));
  }, [userDocuments]);

  const kybDocs = useMemo(() => {
    const docs = userDocuments || [];
    return docs
      .filter(
        (d) =>
          !["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
            String(d.document_type || "").toLowerCase()
          )
      )
      .map((doc) => ({
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: "kyb" as const,
      }));
  }, [userDocuments]);

  const allDocs = useMemo(() => {
    return (userDocuments || []).map((doc) => {
      const isKyc =
        ["id_card", "passport", "proof_of_address", "selfie", "id_front", "id_back", "passport_photo"].includes(
          String(doc.document_type || "").toLowerCase()
        ) === true;
      return {
        ...doc,
        file_type: getFileType(doc.file || doc.file_name || ""),
        file_url: getAbsoluteFileUrl(doc.file),
        category: isKyc ? ("kyc" as const) : ("kyb" as const),
      };
    });
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
      setUserDocuments(
        docs.map((doc) => ({
          ...doc,
          file_type: getFileType(doc.file || doc.file_name || ""),
        }))
      );

      // ✅ Photo profil unique: on ne garde qu'une seule source
      const pRaw = pickProfilePhotoUrl(userData);
      const pUrl = pRaw ? getAbsoluteFileUrl(pRaw) : "";

      // ✅ Important: on ne remplace PAS un preview blob par une url serveur pendant l'édition,
      // sauf si aucun blob n'existe
      setProfilePhotoPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return pUrl || "";
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

        client_type: (userData as any).client_type as any,
        supplier_type: (userData as any).supplier_type as any,
        merchant_type: (userData as any).merchant_type as any,
        delivery_type: (userData as any).delivery_type as any,

        id_front_image: null,
        id_back_image: null,
        passport_photo: null,
        business_document: null,
        photo: null, // ✅ on ne hydrate jamais un File depuis backend
        signature: null,

        kyc_status: ((userData as any).kyc_status as any) ?? undefined,
        account_status: ((userData as any).account_status as any) ?? undefined,
        account_type_label: (userData as any).account_type_label,
        account_category: (userData as any).account_category,
        account_category_label: (userData as any).account_category_label,
      } as any;

      setFormData(profileData);
      
      // ✅ Sauvegarder les données initiales pour la comparaison
      setInitialData(profileData);

      // ✅ IMPORTANT: remonter l'URL au Dashboard (header) si demandé
      // On envoie l'URL absolue de la photo au parent (Dashboard)
      if (onAvatarUpdated) {
        const photoUrl = pRaw ? getAbsoluteFileUrl(pRaw) : null;
        onAvatarUpdated(photoUrl);
      }
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

  const startCropFromFile = (file: File) => {
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
  };

  const handleFileChange: FileChangeHandler = (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];

    // Photo uniquement (crop) => "photo" UNIQUE
    if (name === "photo") {
      try {
        startCropFromFile(file);
        return;
      } catch {
        // fallback
        setFormData((prev: ExtendedUserRegistrationData) => ({ ...prev, [name]: file }));
        const url = URL.createObjectURL(file);
        setProfilePhotoPreview((prevUrl) => {
          if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
          return url;
        });
        return;
      }
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
    return !editModeEffective;
  }, [activeTab, editModeEffective, globalLocked, accountBlocked, docsLocked]);

  const allowEditThisTab = useMemo(() => {
    if (globalLocked) return false;
    if (accountBlocked) return false;
    if ((activeTab === "identity" || activeTab === "business") && docsLocked) return false;
    return editModeEffective;
  }, [globalLocked, accountBlocked, activeTab, docsLocked, editModeEffective]);

  // ------------------------- Docs modal -------------------------
  const openDocsModal = async (tab: DocsModalTabType) => {
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
    return editModeEffective;
  }, [globalLocked, accountBlocked, docsLocked, docsModalTab, kybRequired, editModeEffective]);

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

      // ✅ la seule photo de profil: "photo"
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
    if (!editModeEffective) {
      setErrorMessage("Le mode édition n'est pas activé. Utilisez le bouton dans le Dashboard.");
      return;
    }
    if (!hasUnsavedChanges) {
      setErrorMessage("Aucune modification à enregistrer.");
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
        "client_type",
        "supplier_type",
        "merchant_type",
        "delivery_type",
      ];

      fieldsToUpdate.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) updateData.append(key, JSON.stringify(value));
          else updateData.append(key, String(value));
        }
      });

      // ✅ PHOTO UNIQUE: "photo" uniquement
      const photo = (formData as any).photo;
      if (photo instanceof File) updateData.append("photo", photo);

      const signature = (formData as any).signature;
      if (signature instanceof File) updateData.append("signature", signature);

      // ✅ KYC docs (si onglet identity)
      if (activeTab === "identity" && !docsLocked) {
        const f1 = (formData as any).id_front_image;
        const f2 = (formData as any).id_back_image;
        const f3 = (formData as any).passport_photo;
        if (f1 instanceof File) updateData.append("id_front_image", f1);
        if (f2 instanceof File) updateData.append("id_back_image", f2);
        if (f3 instanceof File) updateData.append("passport_photo", f3);
      }

      // ✅ KYB docs
      if (activeTab === "business" && !docsLocked) {
        const b1 = (formData as any).business_document;
        if (b1 instanceof File) updateData.append("business_document", b1);
      }

      await updateUserProfile(updateData);

      // ✅ Recharge profil (documents + url photo)
      await loadUserProfile();

      // ✅ IMPORTANT: après save, on prend l'URL "photo" unique et on remonte au dashboard
      const after = await getCurrentUser();
      const newPhotoRaw = pickProfilePhotoUrl(after);
      const newPhotoAbs = newPhotoRaw ? getAbsoluteFileUrl(newPhotoRaw) : null;
      
      if (onAvatarUpdated) {
        onAvatarUpdated(newPhotoAbs);
      }

      // ✅ si on avait un blob preview, on le remplace par l'url serveur fraîche
      if (newPhotoAbs) {
        setProfilePhotoPreview((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return newPhotoAbs;
        });
      }

      // ✅ Réinitialiser les modifications
      setHasUnsavedChanges(false);
      
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

  // ------------------------- Toggle edit mode -------------------------
  const toggleEditMode = () => {
    if (typeof externalEditMode === "boolean") {
      onRequestToggleEditMode?.();
    } else {
      setInternalEditMode((v) => !v);
    }
  };

  // ------------------------- UI réutilisable -------------------------
  const ActionButton = ({
    children,
    onClick,
    variant = "outline",
    disabled,
    className = "",
    type = "button",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "outline" | "primary" | "accent";
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
  }) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border";

    if (variant === "primary") {
      return (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-95`}
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
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`${base} ${className} text-white hover:opacity-95`}
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
        type={type}
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

  const MenuItem = ({ item, active, onClick }: { item: any; active: boolean; onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
          active ? "bg-white shadow-sm ring-2" : "hover:bg-gray-50/80"
        }`}
        style={{
          background: active ? BRAND.panel : "transparent",
          borderColor: active ? BRAND.accent : "transparent",
          outline: active ? `2px solid ${BRAND.ring}` : "none",
          outlineOffset: active ? 2 : 0,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: active
              ? `linear-gradient(135deg, ${BRAND.primary}15 0%, ${BRAND.accent}15 100%)`
              : `linear-gradient(135deg, ${BRAND.light} 0%, #FFFFFF 100%)`,
            color: active ? BRAND.primary : BRAND.muted,
            border: `1px solid ${active ? BRAND.accent + "30" : BRAND.border}`,
          }}
        >
          {item.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold truncate ${active ? "text-gray-900" : "text-gray-700"}`}>
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

  const DocumentCard = ({ doc, category }: { doc: any; category: "kyc" | "kyb" }) => {
    const isImage = doc.file_type === "image";
    const isPDF = doc.file_type === "pdf";

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-between gap-3">
          <span className="truncate">{doc.document_type || "Document"}</span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                category === "kyc" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
              }`}
            >
              {category.toUpperCase()}
            </span>
            {doc.verified ? <VerifiedBadge label="Validé" /> : <StatusBadge tone="yellow" label="En attente" />}
          </div>
        </div>
        <div className="p-4">
          {isImage && doc.file_url ? (
            <div className="rounded-xl border border-gray-200 overflow-hidden mb-3 bg-gray-100">
              <img src={doc.file_url} alt={doc.document_type || "Document"} className="w-full h-48 object-cover" />
            </div>
          ) : isPDF ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h8" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">Document PDF</div>
                  <div className="text-xs text-gray-500">Cliquez pour ouvrir</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">Document</div>
                  <div className="text-xs text-gray-500">Fichier téléchargeable</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">{doc.uploaded_at && `Uploadé: ${formatDateOnly(doc.uploaded_at)}`}</div>
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: BRAND.primary + "30", color: BRAND.primary }}
            >
              Ouvrir
            </a>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------- Section Documents -------------------------
  const renderDocumentsSection = () => {
    if (allDocs.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
            <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun document</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore soumis de documents.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ActionButton variant="primary" onClick={() => openDocsModal("kyc")}>
              Ajouter des documents KYC
            </ActionButton>
            {kybRequired && (
              <ActionButton variant="outline" onClick={() => openDocsModal("kyb")}>
                Ajouter des documents KYB
              </ActionButton>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Documents KYC</h4>
              <StatusBadge
                tone={kycDocs.length > 0 ? "green" : "yellow"}
                label={kycDocs.length > 0 ? `${kycDocs.length} doc(s)` : "Aucun"}
              />
            </div>
            <div className="space-y-2">
              {kycDocs.length > 0 ? (
                kycDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="truncate">{doc.document_type || "Document"}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doc.verified ? "Vérifié" : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Aucun document KYC</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Documents KYB</h4>
              <StatusBadge
                tone={kybDocs.length > 0 ? "green" : kybRequired ? "yellow" : "gray"}
                label={kybRequired ? `${kybDocs.length} doc(s)` : "Non requis"}
              />
            </div>
            <div className="space-y-2">
              {kybDocs.length > 0 ? (
                kybDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="truncate">{doc.document_type || "Document"}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doc.verified ? "Vérifié" : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  {kybRequired ? "Aucun document KYB" : "KYB non requis pour votre profil"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Tous vos documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} category={doc.category || "kyc"} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ------------------------- Render form content -------------------------
  const renderFormBlock = (): React.ReactNode => {
    if (isLoadingProfile) {
      return (
        <div className="flex justify-center items-center py-14">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: BRAND.primary }} />
            <p className="text-sm" style={{ color: BRAND.muted }}>
              Chargement de votre profil...
            </p>
          </div>
        </div>
      );
    }

    if (!editModeEffective) {
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
        case "documents":
          return renderDocumentsSection();
        default:
          return (
            <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>
              Sélectionnez une section.
            </div>
          );
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
      case "documents":
        return renderDocumentsSection();
      default:
        return (
          <div className="text-center py-10 text-sm" style={{ color: BRAND.muted }}>
            Sélectionnez une section.
          </div>
        );
    }
  };

  // ------------------------- Menu items (latéral) -------------------------
  const menuItems = useMemo(() => {
    return [
      {
        id: "personal" as ProfileSection,
        label: "Informations Personnelles",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        description: "Nom, email, téléphone, etc.",
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
        description: "Adresse complète et contacts",
      },
      {
        id: "identity" as ProfileSection,
        label: "Vérification KYC",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Documents d'identité",
        badge: kycStatusLabel,
      },
      ...(accountType === "commercant"
        ? [
            {
              id: "boutique" as ProfileSection,
              label: "Boutique",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M3 7h18M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M9 11v6M15 11v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              description: "Informations de boutique",
            },
          ]
        : []),
      ...(accountType === "livreur"
        ? [
            {
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
              description: "Informations de livraison",
            },
          ]
        : []),
      ...(["fournisseur", "partenaire", "entreprise"].includes(accountType)
        ? [
            {
              id: "business" as ProfileSection,
              label: "Documents Entreprise",
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              ),
              description: "Documents KYB",
              badge: kybStatusLabel,
            },
          ]
        : []),
      {
        id: "documents" as ProfileSection,
        label: "Documents",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Tous vos documents",
        badge: allDocs.length > 0 ? `${allDocs.length} doc(s)` : "Aucun",
      },
      {
        id: "activity" as ProfileSection,
        label: "Activité",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        description: "Historique d'activité",
      },
    ];
  }, [accountType, kycStatusLabel, kybStatusLabel, allDocs.length]);

  // Ne pas afficher la Navigation si on est dans le dashboard
  const shouldShowNavigation = !isInDashboard && !location.pathname.includes("/dashboard");

  // ========================= RENDER =========================
  return (
    <>
      {shouldShowNavigation && <Navigation />}

      {/* ✅ Modal docs */}
      {docsModalOpen && (
        <div className="fixed inset-0 z-[10050] animate-fadeIn">
          <div className="absolute inset-0 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && closeDocsModal()} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-scaleIn">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-extrabold text-gray-900">
                      {docsModalTab === "kyc" ? "Documents KYC" : docsModalTab === "kyb" ? "Documents KYB" : "Tous les documents"}
                    </h3>
                    {docsLocked ? <StatusBadge tone="red" label="Lecture seule" /> : <StatusBadge tone="blue" label="Éditable" />}
                  </div>
                  <p className="text-sm mt-1 text-gray-600">
                    {docsLocked
                      ? "Le délai est terminé. Vous pouvez consulter les fichiers soumis."
                      : "Vous pouvez consulter et mettre à jour vos fichiers tant que le délai n'est pas expiré."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border" style={{ borderColor: BRAND.border }}>
                    <button
                      onClick={() => setDocsModalTab("kyc")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "kyc" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background:
                          docsModalTab === "kyc"
                            ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`
                            : "transparent",
                        borderRadius: docsModalTab === "kyc" ? "0.375rem" : "0",
                      }}
                    >
                      KYC
                    </button>
                    <button
                      onClick={() => setDocsModalTab("kyb")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "kyb" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background:
                          docsModalTab === "kyb"
                            ? `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentLight} 100%)`
                            : "transparent",
                        borderRadius: docsModalTab === "kyb" ? "0.375rem" : "0",
                      }}
                    >
                      KYB
                    </button>
                    <button
                      onClick={() => setDocsModalTab("all")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        docsModalTab === "all" ? "text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        background: docsModalTab === "all" ? `linear-gradient(135deg, #38A169 0%, #48BB78 100%)` : "transparent",
                        borderRadius: docsModalTab === "all" ? "0.375rem" : "0",
                      }}
                    >
                      Tous
                    </button>
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
              </div>

              <div className="px-5 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
                {docsModalTab === "kyc" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kycDocs.length === 0 ? (
                      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Aucun document KYC</div>
                      </div>
                    ) : (
                      kycDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} category="kyc" />)
                    )}
                  </div>
                )}

                {docsModalTab === "kyb" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kybDocs.length === 0 ? (
                      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <div className="text-sm font-semibold text-gray-600 mb-2">
                          {kybRequired ? "Aucun document KYB" : "KYB Non Requis"}
                        </div>
                      </div>
                    ) : (
                      kybDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} category="kyb" />)
                    )}
                  </div>
                )}

                {docsModalTab === "all" && renderDocumentsSection()}
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <ActionButton variant="outline" onClick={loadUserProfile} disabled={isLoadingProfile} className="text-xs">
                  Actualiser
                </ActionButton>

                {docsModalTab !== "all" && docsEditableInModal && (
                  <ActionButton variant="primary" onClick={saveDocsFromModal} disabled={isSavingDocs}>
                    {isSavingDocs ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal crop photo */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[10000] animate-fadeIn">
          <div className="absolute inset-0 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && setCropModalOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white animate-scaleIn">
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
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <ActionButton
                  variant="outline"
                  onClick={() => {
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCropModalOpen(false);
                  }}
                >
                  Annuler
                </ActionButton>

                <ActionButton variant="primary" onClick={applyCroppedPhoto}>
                  Appliquer
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================= PAGE PRINCIPALE ========================= */}
      <div
        className={`${isInDashboard ? "min-h-[calc(100vh-80px)]" : "min-h-screen"}`}
        style={{
          background: isInDashboard ? "#FFFFFF" : `linear-gradient(135deg, ${BRAND.bgA} 0%, ${BRAND.bgB} 100%)`,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          marginTop: isInDashboard ? 0 : 80,
        }}
      >
        <div className={`${isInDashboard ? "w-full px-4 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}`}>
          {/* Alerts */}
          <div className="mb-6 space-y-3">
            {successMessage && <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
            {errorMessage && <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}
          </div>

          {/* Zone d'alerte KYC */}
          {showKycZone && (
            <div className="mb-6" style={{ marginTop: isInDashboard ? 0 : 0 }}>
              <div
                className="rounded-2xl p-4 border bg-gradient-to-r from-red-50 to-orange-50 shadow-sm"
                style={{ borderColor: "rgba(239,68,68,0.25)" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
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
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className={`${isInDashboard ? "lg:col-span-3 xl:col-span-2" : "lg:col-span-4"}`}>
              <div className="space-y-6">
                <div className="rounded-2xl p-5 shadow-sm border bg-white" style={{ borderColor: BRAND.border }}>
                  {/* ✅ SEUL ET UNIQUE BLOC PHOTO DE PROFIL */}
                  <div className="mb-5 pb-5 border-b" style={{ borderColor: BRAND.border }}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden border-2 bg-gray-100"
                          style={{ borderColor: "rgba(11,86,140,0.25)" }}
                        >
                          {effectivePhotoUrl ? (
                            <img src={effectivePhotoUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: BRAND.primary }}>
                              {getInitials(displayUser?.full_name || displayUser?.username)}
                            </div>
                          )}
                        </div>

                        {editModeEffective && (
                          <label
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "rgba(11,86,140,0.2)" }}
                            title="Changer la photo"
                          >
                            <input
                              type="file"
                              name="photo"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e as any)}
                            />
                            <svg className="w-4 h-4" style={{ color: BRAND.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </label>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold truncate" style={{ color: BRAND.text }}>
                          {displayUser?.full_name || displayUser?.username || "Utilisateur"}
                        </div>
                        <div className="text-xs truncate" style={{ color: BRAND.muted }}>
                          {displayUser?.email || ""}
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <StatusBadge
                            tone={effectiveKycStatus === "verified" ? "green" : effectiveKycStatus === "blocked" ? "red" : "yellow"}
                            label={kycStatusLabel}
                          />
                          {kybRequired && (
                            <StatusBadge
                              tone={effectiveKybStatus === "verified" ? "green" : effectiveKybStatus === "blocked" ? "red" : "yellow"}
                              label={kybStatusLabel}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

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

                  {/* Actions docs */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                    <div className="grid grid-cols-2 gap-2">
                      <ActionButton variant="outline" onClick={() => openDocsModal("kyc")} disabled={!user?.id} className="text-xs">
                        Voir KYC
                      </ActionButton>
                      <ActionButton
                        variant="outline"
                        onClick={() => openDocsModal("kyb")}
                        disabled={!user?.id || !kybRequired}
                        className="text-xs"
                      >
                        Voir KYB
                      </ActionButton>
                    </div>
                    <div className="mt-3">
                      <ActionButton
                        variant="accent"
                        onClick={() => openDocsModal("all")}
                        disabled={!user?.id || allDocs.length === 0}
                        className="w-full text-xs"
                      >
                        Voir tous ({allDocs.length})
                      </ActionButton>
                    </div>
                  </div>

                  {/* ✅ SEUL ET UNIQUE BOUTON ENREGISTRER */}
                  {editModeEffective && (
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                      <ActionButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={isLoading || isLoadingProfile || globalLocked || accountBlocked || !allowEditThisTab || !hasUnsavedChanges}
                        className="w-full justify-center"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              <path d="M17 21v-8H7v8" />
                              <path d="M7 3v5h8" />
                            </svg>
                            Enregistrer les modifications
                          </>
                        )}
                      </ActionButton>
                      
                      {/* Indicateur visuel des modifications */}
                      {hasUnsavedChanges && (
                        <div className="mt-2 text-xs text-center font-medium" style={{ color: BRAND.primary }}>
                          ✓ Modifications non sauvegardées
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle mode édition */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: BRAND.border }}>
                    <ActionButton
                      variant={editModeEffective ? "primary" : "outline"}
                      onClick={() => {
                        toggleEditMode();
                      }}
                      className="w-full justify-center"
                    >
                      {editModeEffective ? "Désactiver l'édition" : "Activer l'édition"}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <main className={`${isInDashboard ? "lg:col-span-9 xl:col-span-10" : "lg:col-span-8"}`}>
              <div className="rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                <div
                  className="px-5 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ borderColor: BRAND.border }}
                >
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: BRAND.text }}>
                      {menuItems.find((m) => m.id === activeSection)?.label || "Informations"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                      {menuItems.find((m) => m.id === activeSection)?.description || "Gérez vos informations personnelles"}
                    </p>
                    {editModeEffective && (
                      <div className="mt-2">
                        <StatusBadge tone="blue" label="Mode édition activé" />
                      </div>
                    )}
                  </div>

                  {/* ✅ PAS DE BOUTON ENREGISTRER ICI - SEULEMENT DANS LA SIDEBAR */}
                </div>

                <div className="p-5 sm:p-6">
                  <div className={["animate-fadeIn", isReadOnlyThisTab ? "pointer-events-none select-none opacity-95" : ""].join(" ")}>
                    {renderFormBlock()}
                  </div>

                  {/* ✅ PAS DE SECTION ENREGISTRER ICI - TOUT EST DANS LA SIDEBAR */}
                </div>
              </div>

              {activeSection === "activity" && (
                <div className="mt-6 rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: BRAND.border }}>
                  <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: BRAND.border }}>
                    <h3 className="text-lg font-bold" style={{ color: BRAND.text }}>
                      Notes et Activité
                    </h3>
                  </div>
                  <div className="p-5 sm:p-6 space-y-4">
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
                          Épingler
                        </ActionButton>
                      </div>
                    </div>

                    {pinnedNote && (
                      <div
                        className="rounded-xl border overflow-hidden"
                        style={{
                          borderColor: "rgba(245, 158, 11, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(252, 211, 77, 0.05) 100%)",
                        }}
                      >
                        <div
                          className="px-4 py-3 border-b flex items-center justify-between"
                          style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}
                        >
                          <span className="text-sm font-semibold" style={{ color: "#92400E" }}>
                            Note épinglée
                          </span>
                          <button
                            onClick={() => setPinnedNote("")}
                            className="text-xs font-medium px-3 py-1 rounded-lg border hover:bg-white transition-colors"
                            style={{ borderColor: "rgba(245, 158, 11, 0.3)", color: "#92400E" }}
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

              {!user?.id && (
                <div className="mt-8 rounded-2xl shadow-sm border bg-white p-8 text-center" style={{ borderColor: BRAND.border }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: BRAND.text }}>
                    Vous n'êtes pas connecté
                  </h3>
                  <p className="text-sm mb-6" style={{ color: BRAND.muted }}>
                    Connectez-vous ou créez un compte pour accéder à votre profil.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <ActionButton variant="primary" onClick={() => navigate("/register")}>
                      Créer un compte
                    </ActionButton>
                    <ActionButton variant="outline" onClick={() => navigate("/login")}>
                      Se connecter
                    </ActionButton>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}