import * as React from 'react';

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
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className = '', 
  ...rest 
}: FormInputProps) {
  const id = rest.name || label.toLowerCase().replace(/\s+/g, '-');
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Gérer le type pour les mots de passe
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Classes dynamiques
  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : isFocused 
        ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500' 
        : 'border-gray-300 hover:border-gray-400'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}
    ${className}
  `;

  const labelClasses = `
    block text-sm font-medium mb-1.5
    ${error ? 'text-red-700' : 'text-gray-700'}
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          {...rest}
        />

        {/* Bouton pour afficher/masquer le mot de passe */}
        {type === 'password' && (
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

        {/* Indicateur de validation pour les champs valides */}
        {value && !error && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Message d'erreur avec animation */}
      {error && (
        <div className="flex items-start gap-1.5 text-red-600 text-sm animate-fadeInUp">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Texte d'aide */}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {/* Indicateur de force pour les mots de passe */}
      {type === 'password' && value && typeof value === 'string' && !error && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  value.length >= 12 ? 'bg-green-500' :
                  value.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (value.length / 12) * 100)}%` 
                }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {value.length >= 12 ? 'Fort' : 
               value.length >= 8 ? 'Moyen' : 'Faible'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}