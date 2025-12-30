// // src/components/ui/PhoneInput.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { CountryCode } from '../../pages/types/auth.types';
// import { COUNTRIES, formatInternationalPhone, normalizePhoneNumber } from '../../pages/utils/phoneValidator';

// interface PhoneInputProps {
//   name: string;
//   value: string;
//   countryCode: CountryCode;
//   onChange: (value: string, countryCode: CountryCode) => void;
//   error?: string;
//   required?: boolean;
//   disabled?: boolean;
//   placeholder?: string;
//   className?: string;
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({
//   name,
//   value,
//   countryCode,
//   onChange,
//   error,
//   required = false,
//   disabled = false,
//   placeholder,
//   className = '',
// }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [inputValue, setInputValue] = useState(value);
//   const dropdownRef = useRef<HTMLDivElement>(null);
  
//   const currentCountry = COUNTRIES[countryCode] || COUNTRIES.BI;
  
//   // Mettre à jour la valeur d'entrée quand la valeur prop change
//   useEffect(() => {
//     setInputValue(value);
//   }, [value]);
  
//   // Fermer le dropdown quand on clique en dehors
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);
  
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value.replace(/\D/g, '');
//     setInputValue(newValue);
//     onChange(newValue, countryCode);
//   };
  
//   const handleCountrySelect = (newCountryCode: CountryCode) => {
//     setIsDropdownOpen(false);
    
//     if (newCountryCode !== countryCode) {
//       // Convertir le numéro existant pour le nouveau pays si possible
//       const normalized = normalizePhoneNumber(inputValue, countryCode);
//       onChange(normalized, newCountryCode);
//     }
//   };
  
//   const getFormattedExample = () => {
//     return currentCountry.format(currentCountry.example);
//   };
  
//   return (
//     <div className={`space-y-2 ${className}`}>
//       <div className="relative">
//         <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
//           {/* Sélecteur de pays */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               type="button"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               disabled={disabled}
//               className="flex items-center gap-2 px-3 py-3 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
//             >
//               <span className="text-lg">{currentCountry.flag}</span>
//               <span className="text-sm font-medium">{currentCountry.phoneCode}</span>
//               <svg
//                 className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
            
//             {/* Dropdown des pays */}
//             {isDropdownOpen && (
//               <div className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
//                 {Object.values(COUNTRIES).map((country) => (
//                   <button
//                     key={country.code}
//                     type="button"
//                     onClick={() => handleCountrySelect(country.code)}
//                     className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-gray-100 last:border-b-0"
//                   >
//                     <span className="text-xl">{country.flag}</span>
//                     <div className="flex-1">
//                       <div className="font-medium text-gray-900">{country.name}</div>
//                       <div className="text-sm text-gray-500">{country.phoneCode}</div>
//                     </div>
//                     <div className="text-xs text-gray-400">
//                       Ex: {country.format(country.example)}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
          
//           {/* Champ de saisie */}
//           <div className="flex-1 relative">
//             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
//               {currentCountry.phoneCode}
//             </div>
//             <input
//               type="tel"
//               name={name}
//               value={currentCountry.format(inputValue)}
//               onChange={handleInputChange}
//               disabled={disabled}
//               required={required}
//               placeholder={placeholder || getFormattedExample()}
//               className="w-full pl-16 pr-3 py-3 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
//               maxLength={currentCountry.maxLength + 3} // Pour les espaces
//             />
//           </div>
//         </div>
        
//         {/* Indicateur de format */}
//         <div className="mt-1 text-xs text-gray-500 flex justify-between">
//           <span>Format attendu: {getFormattedExample()}</span>
//           <span>{inputValue.length}/{currentCountry.maxLength}</span>
//         </div>
//       </div>
      
//       {/* Affichage du format international */}
//       {inputValue && inputValue.length >= currentCountry.minLength && (
//         <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">
//           <div className="flex items-center gap-2">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span>
//               Format international: {formatInternationalPhone(inputValue, countryCode)}
//             </span>
//           </div>
//         </div>
//       )}
      
//       {/* Message d'erreur */}
//       {error && (
//         <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 animate-fadeIn">
//           <div className="flex items-center gap-2">
//             <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span>{error}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhoneInput;