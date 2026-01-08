import * as React from "react";

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

export default function FormInput({
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
  const id = rest.name || label.toLowerCase().replace(/\s+/g, "-");
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Gérer le type pour les mots de passe
  const inputType = type === "password" && showPassword ? "text" : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  /**
   * ✅ Responsive-only fix:
   * - Mobile: on évite l'empilement de bordures (border-0 + ring-1)
   * - Desktop (sm+): on revient à ton style original (border)
   * - Padding mobile légèrement réduit en X pour donner plus de place utile
   */
  const baseClasses = `
    w-full
    px-3 sm:px-4
    py-3
    bg-gray-50
    rounded-xl
    transition-all duration-200
    focus:outline-none
    text-sm md:text-base
    placeholder-gray-500
  `.trim();

  const stateClasses = error
    ? `
      bg-red-50
      ring-1 ring-red-300
      focus:ring-2 focus:ring-red-500/30
      sm:ring-0 sm:border sm:border-red-300 sm:focus:border-red-500
    `
    : isFocused
    ? `
      bg-white
      ring-2 ring-[#0077B5]/30
      sm:ring-0 sm:border sm:border-[#0077B5] sm:focus:border-[#0077B5]
    `
    : `
      ring-1 ring-gray-300
      hover:bg-white
      sm:ring-0 sm:border sm:border-gray-300
    `;

  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed opacity-70 ring-1 ring-gray-200 sm:border-gray-200" : "";

  const inputClasses = `
    ${baseClasses}
    border-0 sm:border
    focus:ring-offset-1
    ${stateClasses}
    ${disabledClasses}
    ${className}
  `.replace(/\s+/g, " ").trim();

  const labelClasses = `
    block text-sm font-semibold mb-2
    ${error ? "text-red-700" : "text-gray-800"}
  `.trim();

  return (
    <div className="w-full space-y-2">
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...rest}
        />

        {/* Bouton pour afficher/masquer le mot de passe */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-controls={id}
            aria-expanded={showPassword}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        )}

        {/* Indicateur de validation pour les champs valides (uniquement sur desktop) */}
        {value && !error && type !== "password" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div id={`${id}-error`} className="flex items-start gap-1.5 text-red-600 text-sm animate-fadeIn mt-1">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Texte d'aide */}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {/* Indicateur de force pour les mots de passe */}
      {type === "password" && value && typeof value === "string" && !error && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  value.length >= 12 ? "bg-emerald-500" : value.length >= 8 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(100, (value.length / 12) * 100)}%`,
                }}
                aria-valuenow={Math.min(100, (value.length / 12) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{value.length >= 12 ? "Fort" : value.length >= 8 ? "Moyen" : "Faible"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
