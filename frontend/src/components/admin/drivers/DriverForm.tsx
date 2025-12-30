// ========================= src/components/admin/drivers/DriverForm.tsx =========================
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
};

type TransportMode = "vehicule" | "moto" | "velo" | "camion" | "pied";

type FormState = {
  username: string;
  email: string;
  phone: string;
  full_name: string;
  password: string;
  confirm_password: string;

  transport_mode: TransportMode;

  license_number: string;
  license_expiry: string;

  vehicle_type: string;
  vehicle_registration: string;

  insurance_number: string;
  insurance_expiry: string;

  hire_date: string;

  base_salary: string;
  commission_rate: string;
  assigned_zone: string;
  max_capacity: string;

  notes: string;
  can_be_pdv: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const transportModes: Array<{ value: TransportMode; label: string }> = [
  { value: "vehicule", label: "Véhicule" },
  { value: "moto", label: "Moto" },
  { value: "velo", label: "Vélo" },
  { value: "camion", label: "Camion" },
  { value: "pied", label: "À pied" },
];

// --------------------- FormInput (design fourni) ---------------------
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  type?: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

function FormInput({
  label,
  error,
  helperText,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className = "",
  ...rest
}: FormInputProps) {
  const id = (rest.name || label.toLowerCase().replace(/\s+/g, "-")).toString();
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error
      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
      : isFocused
        ? "border-blue-500 focus:ring-blue-500 focus:border-blue-500"
        : "border-gray-300 hover:border-gray-400"
    }
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white"}
    ${className}
  `;

  const labelClasses = `
    block text-sm font-medium mb-1.5
    ${error ? "text-red-700" : "text-gray-700"}
  `;

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          {...rest}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}

        {value && !error && type !== "password" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-red-600 text-sm animate-fadeInUp">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}

// --------------------- Helpers ---------------------
function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseAxiosDrfErrors(err: any): { global?: string; fields?: Record<string, string> } {
  const data = err?.response?.data;

  if (!data || typeof data !== "object") {
    return { global: err?.message || "Erreur inconnue" };
  }

  if (typeof data.detail === "string") return { global: data.detail };

  const fields: Record<string, string> = {};
  Object.keys(data).forEach((k) => {
    const v = data[k];
    if (Array.isArray(v)) fields[k] = String(v[0]);
    else if (typeof v === "string") fields[k] = v;
    else fields[k] = JSON.stringify(v);
  });

  return { global: data.message || data.error, fields };
}

function normalizeDecimal(v: string) {
  return String(v || "0").replace(",", ".").trim();
}

// --------------------- Component ---------------------
export default function DriverForm({ open, onClose, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormState>(() => ({
    username: "",
    email: "",
    phone: "",
    full_name: "",
    password: "",
    confirm_password: "",

    transport_mode: "vehicule",

    license_number: "",
    license_expiry: "",

    vehicle_type: "",
    vehicle_registration: "",

    insurance_number: "",
    insurance_expiry: "",

    hire_date: toISODate(new Date()),

    base_salary: "0.00",
    commission_rate: "0.00",
    assigned_zone: "",
    max_capacity: "0.00",

    notes: "",
    can_be_pdv: false,
  }));

  const canSubmit = useMemo(() => {
    return (
      form.username.trim() &&
      form.phone.trim() &&
      form.full_name.trim() &&
      form.password &&
      form.confirm_password &&
      form.password === form.confirm_password
    );
  }, [form]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalError(null);
  };

  const resetForm = () => {
    setErrors({});
    setGlobalError(null);
    setForm({
      username: "",
      email: "",
      phone: "",
      full_name: "",
      password: "",
      confirm_password: "",

      transport_mode: "vehicule",

      license_number: "",
      license_expiry: "",

      vehicle_type: "",
      vehicle_registration: "",

      insurance_number: "",
      insurance_expiry: "",

      hire_date: toISODate(new Date()),

      base_salary: "0.00",
      commission_rate: "0.00",
      assigned_zone: "",
      max_capacity: "0.00",

      notes: "",
      can_be_pdv: false,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGlobalError(null);
    setErrors({});

    try {
      // ✅ payload conforme DriverCreateSerializer
      const payload = {
        username: form.username.trim(),
        email: (form.email || "").trim(),
        phone: form.phone.trim(),
        full_name: form.full_name.trim(),
        password: form.password,
        confirm_password: form.confirm_password,

        transport_mode: form.transport_mode,

        license_number: (form.license_number || "").trim(),
        license_expiry: form.license_expiry ? form.license_expiry : null,

        vehicle_type: (form.vehicle_type || "").trim(),
        vehicle_registration: (form.vehicle_registration || "").trim(),

        insurance_number: (form.insurance_number || "").trim(),
        insurance_expiry: form.insurance_expiry ? form.insurance_expiry : null,

        hire_date: form.hire_date || undefined,

        base_salary: normalizeDecimal(form.base_salary),
        commission_rate: normalizeDecimal(form.commission_rate),
        assigned_zone: (form.assigned_zone || "").trim(),
        max_capacity: normalizeDecimal(form.max_capacity),

        notes: form.notes || "",
        can_be_pdv: !!form.can_be_pdv,
      };

      await onSubmit(payload);

      onClose();
      resetForm();
    } catch (err: any) {
      const parsed = parseAxiosDrfErrors(err);
      if (parsed.fields) {
        const mapped: FieldErrors = {};
        Object.entries(parsed.fields).forEach(([k, v]) => {
          (mapped as any)[k] = v;
        });
        setErrors(mapped);
      }
      setGlobalError(
        parsed.global ||
          "Erreur: vérifie les champs (username/phone/email unique, dates, mots de passe...)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>Nouveau Chauffeur</DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#f8fafc" }}>
        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-900">Création Chauffeur</p>
            <p className="text-sm text-gray-500">
              Enregistre l’utilisateur <b>+ chauffeur</b> via <b>/api/v1/drivers/</b>.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nom d'utilisateur"
                name="username"
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                error={errors.username}
                required
              />

              <FormInput
                label="Nom complet"
                name="full_name"
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                error={errors.full_name}
                required
              />

              <FormInput
                label="Téléphone"
                name="phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                error={errors.phone}
                required
              />

              <FormInput
                label="Email (optionnel)"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                error={errors.email}
              />

              <FormInput
                label="Mot de passe"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                error={errors.password}
                required
              />

              <FormInput
                label="Confirmer le mot de passe"
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={(e) => setField("confirm_password", e.target.value)}
                error={errors.confirm_password}
                required
              />

              {/* Select transport */}
              <div className="w-full space-y-1.5">
                <label className={`block text-sm font-medium mb-1.5 ${errors.transport_mode ? "text-red-700" : "text-gray-700"}`}>
                  Mode de transport <span className="text-red-500 ml-0.5">*</span>
                </label>

                <select
                  value={form.transport_mode}
                  onChange={(e) => setField("transport_mode", e.target.value as TransportMode)}
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${errors.transport_mode
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500 bg-white"}
                  `}
                >
                  {transportModes.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {errors.transport_mode && (
                  <div className="flex items-start gap-1.5 text-red-600 text-sm animate-fadeInUp">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.transport_mode}</span>
                  </div>
                )}
              </div>

              <FormInput
                label="Zone assignée (optionnel)"
                name="assigned_zone"
                value={form.assigned_zone}
                onChange={(e) => setField("assigned_zone", e.target.value)}
                error={errors.assigned_zone}
              />

              <FormInput
                label="Date d'embauche"
                name="hire_date"
                type="date"
                value={form.hire_date}
                onChange={(e) => setField("hire_date", e.target.value)}
                error={errors.hire_date}
              />

              <FormInput
                label="Numéro de permis (optionnel)"
                name="license_number"
                value={form.license_number}
                onChange={(e) => setField("license_number", e.target.value)}
                error={errors.license_number}
              />

              <FormInput
                label="Expiration permis (optionnel)"
                name="license_expiry"
                type="date"
                value={form.license_expiry}
                onChange={(e) => setField("license_expiry", e.target.value)}
                error={errors.license_expiry}
              />

              <FormInput
                label="Type de véhicule (optionnel)"
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={(e) => setField("vehicle_type", e.target.value)}
                error={errors.vehicle_type}
              />

              <FormInput
                label="Immatriculation (optionnel)"
                name="vehicle_registration"
                value={form.vehicle_registration}
                onChange={(e) => setField("vehicle_registration", e.target.value)}
                error={errors.vehicle_registration}
              />

              <FormInput
                label="Numéro d'assurance (optionnel)"
                name="insurance_number"
                value={form.insurance_number}
                onChange={(e) => setField("insurance_number", e.target.value)}
                error={errors.insurance_number}
              />

              <FormInput
                label="Expiration assurance (optionnel)"
                name="insurance_expiry"
                type="date"
                value={form.insurance_expiry}
                onChange={(e) => setField("insurance_expiry", e.target.value)}
                error={errors.insurance_expiry}
              />

              <FormInput
                label="Salaire de base"
                name="base_salary"
                type="number"
                value={form.base_salary}
                onChange={(e) => setField("base_salary", e.target.value)}
                error={errors.base_salary}
                placeholder="0.00"
              />

              <FormInput
                label="Commission (%)"
                name="commission_rate"
                type="number"
                value={form.commission_rate}
                onChange={(e) => setField("commission_rate", e.target.value)}
                error={errors.commission_rate}
                placeholder="0.00"
              />

              <FormInput
                label="Capacité max (L)"
                name="max_capacity"
                type="number"
                value={form.max_capacity}
                onChange={(e) => setField("max_capacity", e.target.value)}
                error={errors.max_capacity}
                placeholder="0.00"
              />

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1.5 ${errors.notes ? "text-red-700" : "text-gray-700"}`}>
                  Notes (optionnel)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={4}
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${errors.notes
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500 bg-white"}
                  `}
                />
                {errors.notes && (
                  <div className="flex items-start gap-1.5 text-red-600 text-sm animate-fadeInUp mt-1.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.notes}</span>
                  </div>
                )}
              </div>

              {/* can_be_pdv */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">Peut être PDV</p>
                    <p className="text-xs text-gray-500">Activer si ce chauffeur peut servir comme point de vente</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setField("can_be_pdv", !form.can_be_pdv)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      form.can_be_pdv ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    aria-pressed={form.can_be_pdv}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        form.can_be_pdv ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={resetForm} disabled={loading} sx={{ borderRadius: 2, textTransform: "none" }}>
          Réinitialiser
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
        >
          {loading ? "Création..." : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
