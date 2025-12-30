// ========================= src/pages/profile/UserProfileView.tsx =========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { RootState, updateProfile } from "../../store/store";
import { getCurrentUser, updateUserProfile, type UserProfile as ApiUserProfile } from "../../api/client";

import AlertBanner from "../../components/ui/AlertBanner";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

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

import { SeaSkyColors } from "../../styles/colors";

import {
  // types
  Area,
  ProfileTab,
  UserDocumentItem,
  // utils
  toStr,
  toBool,
  toArr,
  safeDate,
  initialsFrom,
  pickPhotoUrl,
  pickAccountCreatedAt,
  hasValue,
  getAccountSubtypeLabel,
  getAccountTypeLabel,
  formatLabelTitleCase,
  // crop
  getCroppedBlob,
  blobToFile,
  // UI/components
  StatusBadge,
  VerifiedBadge,
  StepStateBadge,
  PhoneCallButton,
  HeroPrimaryButton,
  HeroOutlineButton,
  InlineCountdown,
  ProfileStepCard,
  PersonalInfoDisplay,
  AddressDisplay,
  IdentityDisplay,
  BoutiqueDisplay,
  DeliveryDisplay,
  BusinessDisplay,
  DashboardProfileHeader,
  DocumentsModal,
  CropPhotoModal,
} from "./userProfileParts";

// Constantes KYC
const KYC_WINDOW_MS = 72 * 60 * 60 * 1000; // 72h

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
  [key: string]: any;
};

export default function UserProfileView({ isInDashboard = false }: { isInDashboard?: boolean }) {
  const [activeTab, setActiveTab] = useState<string>("personal");

  // ✅ FIX: on inclut genre + date_of_birth dans l'état initial pour éviter "non affiché"
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

  // ✅ modal documents
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<"kyc" | "kyb">("kyc");

  // ✅ crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawPhotoName, setRawPhotoName] = useState<string>("profile.jpg");

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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

  const backendKycStatus = (user?.kyc_status || "unverified") as string;
  const globalLocked = useMemo(() => backendKycStatus === "verified", [backendKycStatus]);

  const docsLocked = useMemo(() => {
    if (globalLocked) return true;
    if (kycRemainingMs <= 0) return true;
    return false;
  }, [globalLocked, kycRemainingMs]);

  const accountBlocked = useMemo(() => {
    if (globalLocked) return false;
    return kycRemainingMs <= 0 && backendKycStatus !== "verified";
  }, [globalLocked, kycRemainingMs, backendKycStatus]);

  const showKycZone = useMemo(() => {
    if (!user?.id) return false;
    return !globalLocked;
  }, [user?.id, globalLocked]);

  const kycTone: "green" | "yellow" | "red" | "gray" | "blue" =
    backendKycStatus === "verified"
      ? "green"
      : backendKycStatus === "pending"
      ? "yellow"
      : backendKycStatus === "rejected"
      ? "red"
      : accountBlocked
      ? "red"
      : "blue";

  const kycStatusLabel =
    backendKycStatus === "verified"
      ? "KYC Vérifié"
      : backendKycStatus === "pending"
      ? "KYC En Attente"
      : backendKycStatus === "rejected"
      ? "KYC Rejeté"
      : accountBlocked
      ? "KYC Incomplet (Compte bloqué)"
      : "KYC Incomplet";

  const kycDeadlineMessage = useMemo(() => {
    const uname = user?.username ? String(user.username) : "utilisateur";
    return `Monsieur ${uname}, vous disposez de 72 heures après votre inscription pour mettre à jour vos documents KYC/KYB. Après ce délai, aucune modification ne sera possible.`;
  }, [user?.username]);

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

  // ------------------------- Completion -------------------------
  const stepCompletion = useMemo(() => {
    const personalRequiredKeys: Array<keyof ExtendedUserRegistrationData> = ["full_name", "nationality"];
    const personalOk =
      personalRequiredKeys.every((k) => hasValue((formData as any)[k])) &&
      (hasValue((formData as any).phone) || hasValue((formData as any).email));

    const addressRequiredKeys: Array<keyof ExtendedUserRegistrationData> = ["address_line", "province", "commune"];
    const addressOk = addressRequiredKeys.every((k) => hasValue((formData as any)[k]));

    const hasIdNumber = hasValue((formData as any).id_number);
    const hasIdType = hasValue((formData as any).id_type);

    const kycDocsOk =
      kycDocs.length > 0 ||
      (formData as any).passport_photo instanceof File ||
      (formData as any).id_front_image instanceof File;

    const kycFormOk = hasIdType && hasIdNumber && kycDocsOk;

    const boutiqueOk =
      user?.account_type === "commercant"
        ? hasValue((formData as any).boutique_type) &&
          Array.isArray((formData as any).boutique_services) &&
          (formData as any).boutique_services.length > 0
        : true;

    const deliveryOk =
      user?.account_type === "livreur"
        ? hasValue((formData as any).delivery_vehicle) && hasValue((formData as any).vehicle_registration)
        : true;

    const businessOk =
      ["fournisseur", "partenaire", "entreprise"].includes(user?.account_type || "")
        ? hasValue((formData as any).business_name) &&
          hasValue((formData as any).business_entity_type) &&
          hasValue((formData as any).business_registration_number) &&
          hasValue((formData as any).business_tax_id)
        : true;

    return { personalOk, addressOk, kycFormOk, boutiqueOk, deliveryOk, businessOk };
  }, [formData, user?.account_type, kycDocs]);

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

        // ✅ ces deux champs existaient déjà, on les garde
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

        client_type: (userData as any).client_type as any,
        supplier_type: (userData as any).supplier_type as any,
        merchant_type: (userData as any).merchant_type as any,
        delivery_type: (userData as any).delivery_type as any,

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
          setFormData((prev: ExtendedUserRegistrationData) => ({
            ...prev,
            [name]: file,
          }));
          const url = URL.createObjectURL(file);
          setProfilePhotoPreview((prevUrl) => {
            if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
            return url;
          });
        }
        return;
      }

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

  const canPickProfilePhoto = useMemo(() => {
    if (globalLocked || accountBlocked) return false;
    if (activeTab !== "personal") return false;
    return Boolean(editMode.personal);
  }, [globalLocked, accountBlocked, activeTab, editMode.personal]);

  const openProfilePhotoPicker = () => {
    if (!canPickProfilePhoto) return;
    photoInputRef.current?.click();
  };

  const handleReactivate = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setActiveTab("identity");
    setEditMode((prev) => ({ ...prev, identity: true }));
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openDocsModal = async (tab: "kyc" | "kyb") => {
    await loadUserProfile();
    setDocsModalTab(tab);
    setDocsModalOpen(true);
  };

  // ✅ crop callbacks
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

  // ------------------------- save -------------------------
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

      if (activeTab === "identity") {
        setDocsModalTab("kyc");
        setDocsModalOpen(true);
      } else if (activeTab === "business") {
        setDocsModalTab("kyb");
        setDocsModalOpen(true);
      }
    } catch (error: any) {
      if (error?.payload?.errors) {
        const backendErrors: FormValidationErrors = {};
        Object.entries(error.payload.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) (backendErrors as any)[field] = messages.join(", ");
          else (backendErrors as any)[field] = String(messages);
        });
        setFormErrors(backendErrors);
      }
      setErrorMessage(error?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- Tabs -------------------------
  const tabs: ProfileTab[] = useMemo(() => {
    const baseTabs: ProfileTab[] = [
      {
        id: "personal",
        label: "Profil Personnel",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).personalOk,
      },
      {
        id: "address",
        label: "Adresse",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).addressOk,
      },
      {
        id: "identity",
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
        completed: (stepCompletion as any).kycFormOk || globalLocked,
      },
    ];

    if (user?.account_type === "commercant") {
      baseTabs.push({
        id: "boutique",
        label: "Boutique",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h18M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-4h14l2 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11v6M15 11v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).boutiqueOk,
      });
    }

    if (user?.account_type === "livreur") {
      baseTabs.push({
        id: "delivery",
        label: "Livraison",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 17h4V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 17h6v-4a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).deliveryOk,
      });
    }

    if (["fournisseur", "partenaire", "entreprise"].includes(user?.account_type || "")) {
      baseTabs.push({
        id: "business",
        label: "Documents Entreprise",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        completed: (stepCompletion as any).businessOk,
      });
    }

    return baseTabs;
  }, [user?.account_type, stepCompletion, globalLocked]);

  // ------------------------- Render tab content -------------------------
  const renderTabContent = (): React.ReactNode => {
    if (isLoadingProfile) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm" style={{ color: SeaSkyColors.steelBlue }}>
              Chargement de votre profil...
            </p>
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
          return (
            <div className="text-center py-10 text-sm" style={{ color: SeaSkyColors.steelBlue }}>
              Sélectionnez une section à modifier
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
      default:
        return (
          <div className="text-center py-10 text-sm" style={{ color: SeaSkyColors.steelBlue }}>
            Sélectionnez une section à modifier
          </div>
        );
    }
  };

  // ------------------------- UI -------------------------
  const accountSubtypeLabel = useMemo(() => formatLabelTitleCase(getAccountSubtypeLabel(user)), [user]);
  const accountTypeLabel = useMemo(() => getAccountTypeLabel(user), [user]);

  return (
    <>
      <DocumentsModal
        open={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        kycDocs={kycDocs}
        kybDocs={kybDocs}
        active={docsModalTab}
        setActive={setDocsModalTab}
        docsLocked={docsLocked}
        onRefresh={loadUserProfile}
        onGoEditKyc={() => {
          setActiveTab("identity");
          setEditMode((p) => ({ ...p, identity: true }));
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
        }}
        onGoEditKyb={() => {
          setActiveTab("business");
          setEditMode((p) => ({ ...p, business: true }));
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
        }}
      />

      <CropPhotoModal
        open={cropModalOpen}
        onClose={() => {
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCropModalOpen(false);
        }}
        cropImageSrc={cropImageSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onCropComplete={onCropComplete}
        onApply={applyCroppedPhoto}
      />

      {/* ========================= Profil avec style Dashboard ========================= */}
      <div className="w-full">
        {/* Header du profil avec style Dashboard */}
        <DashboardProfileHeader
          user={user}
          profilePhotoPreview={profilePhotoPreview}
          initialsFrom={initialsFrom}
          accountTypeLabel={accountTypeLabel}
          accountSubtypeLabel={accountSubtypeLabel}
          kycStatusLabel={kycStatusLabel}
          kycTone={kycTone}
          isEditingAnything={isEditingAnything}
          toggleEditAll={toggleEditAll}
          isLoading={isLoading}
          handleSave={handleSave}
          allowEditThisTab={allowEditThisTab}
          editMode={editMode}
          activeTab={activeTab}
        />

        {/* Alerts */}
        <div className="mb-6 space-y-4">
          {successMessage && <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage("")} />}
          {errorMessage && <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}
        </div>

        {/* Zone d'alerte KYC */}
        {showKycZone && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
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
                      <InlineCountdown remainingMs={kycRemainingMs} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglets de navigation */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const disabledTab = accountBlocked ? tab.id !== "identity" : false;

                const handleTabClick = async () => {
                  if (disabledTab) return;

                  if (tab.id === "business") {
                    setActiveTab("business");
                    await openDocsModal("kyb");
                    return;
                  }

                  if (tab.id === "identity" && docsModalOpen) {
                    setDocsModalTab("kyc");
                  }

                  setActiveTab(tab.id);
                };

                return (
                  <button
                    key={tab.id}
                    onClick={handleTabClick}
                    disabled={disabledTab}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 shrink-0",
                      "bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow transform hover:-translate-y-0.5",
                      isActive ? "ring-2 ring-[#27B1E4]/50 bg-white" : "border-white/30",
                      disabledTab ? "opacity-50 cursor-not-allowed hover:shadow-none hover:transform-none" : "",
                    ].join(" ")}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: tab.completed ? "rgba(51,95,122,0.12)" : isActive ? "rgba(39,177,228,0.15)" : "rgba(243,244,246,0.8)",
                        color: tab.completed ? (SeaSkyColors.steelBlue || "#335F7A") : SeaSkyColors.brandBlue,
                      }}
                    >
                      {tab.icon}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate" style={{ color: isActive ? SeaSkyColors.inkBlue : SeaSkyColors.steelBlue }}>
                          {tab.label}
                        </span>
                        <StepStateBadge completed={Boolean(tab.completed)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-white/60 bg-white/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold" style={{ color: SeaSkyColors.inkBlue }}>
                      {tabs.find((t) => t.id === activeTab)?.label || "Section"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: SeaSkyColors.steelBlue }}>
                      {globalLocked
                        ? "Profil verrouillé après validation."
                        : accountBlocked
                        ? "Compte bloqué. Délai expiré."
                        : editMode[activeTab]
                        ? "Vous êtes en mode édition. Modifiez les champs ci-dessous."
                        : "Cliquez sur « Modifier » pour éditer cette section."}
                    </p>

                    {(activeTab === "identity" || activeTab === "business") && docsLocked && !globalLocked && (
                      <div className="mt-3">
                        <StatusBadge tone="red" label="Docs verrouillés (délai terminé)" />
                      </div>
                    )}
                  </div>

                  {isEditingAnything ? (
                    <div className="flex justify-start sm:justify-end">
                      <HeroOutlineButton size="sm" onClick={toggleEditAll} disabled={globalLocked || accountBlocked}>
                        Annuler
                      </HeroOutlineButton>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="px-6 py-6">
                <div
                  className={[
                    "relative",
                    isReadOnlyThisTab ? "pointer-events-none select-none opacity-95" : "",
                    hideFileInputs
                      ? "[&_input[type=file]]:hidden **:data-upload:hidden **:data-file-upload:hidden [&_.file-upload]:hidden"
                      : "",
                  ].join(" ")}
                >
                  {renderTabContent()}
                </div>

                <div className="mt-8 pt-6 border-t border-white/80">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <HeroOutlineButton onClick={loadUserProfile} disabled={isLoading || isLoadingProfile} size="sm">
                      Actualiser
                    </HeroOutlineButton>

                    <HeroPrimaryButton onClick={handleSave} disabled={isLoading || isLoadingProfile || globalLocked || !allowEditThisTab} size="sm">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Enregistrement...
                        </span>
                      ) : (
                        "Enregistrer"
                      )}
                    </HeroPrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: SeaSkyColors.inkBlue }}>
                Progression du Profil
              </h3>

              <div className="space-y-3">
                {tabs.map((tab) => (
                  <ProfileStepCard
                    key={tab.id}
                    label={tab.label}
                    completed={tab.completed || false}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={accountBlocked ? tab.id !== "identity" : globalLocked}
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/80">
                <div className="text-sm font-semibold mb-3" style={{ color: SeaSkyColors.steelBlue }}>
                  Documents (KYC/KYB)
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <StatusBadge tone="gray" label={`KYC: ${kycDocs.length}`} />
                  <StatusBadge tone="gray" label={`KYB: ${kybDocs.length}`} />
                  {docsLocked ? <StatusBadge tone="red" label="Verrouillé" /> : <StatusBadge tone="blue" label="Éditable" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HeroOutlineButton size="sm" onClick={() => openDocsModal("kyc")} disabled={!user?.id}>
                    Voir KYC
                  </HeroOutlineButton>
                  <HeroOutlineButton size="sm" onClick={() => openDocsModal("kyb")} disabled={!user?.id}>
                    Voir KYB
                  </HeroOutlineButton>
                </div>

                <p className="text-xs mt-3" style={{ color: SeaSkyColors.steelBlue }}>
                  Si le délai est terminé, les documents s'affichent en lecture seule avec le badge "Validated".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}