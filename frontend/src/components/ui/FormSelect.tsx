import * as React from 'react';

interface FormSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  options: Array<{ value: string; label: string }>;
}

export default function FormSelect({ 
  name,
  label, 
  error, 
  helperText,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Sélectionnez...",
  className = '', 
  options
}: FormSelectProps) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Classes dynamiques
  const selectClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em_1.5em]
    bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")]
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
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={selectClasses}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Indicateur de validation pour les champs valides */}
        {value && !error && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
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
    </div>
  );
}