import * as React from 'react';
import FormInput from '../ui/FormInput';
import { RegistrationStepProps } from '../../pages/types/auth.types';

export default function RegisterCredentialsForm({ 
  formData, 
  formErrors, 
  onInputChange 
}: RegistrationStepProps) {
  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
        Identifiants de connexion
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom d'utilisateur */}
        <div className="space-y-2">
          <FormInput
            name="username"
            label="Nom d'utilisateur *"
            value={formData.username}
            onChange={onInputChange}
            required
            error={formErrors.username}
            helperText="Minimum 3 caractères (lettres, chiffres, underscore)"
            placeholder="john_doe"
          />
          
          {/* Affichage amélioré de l'erreur */}
          {formErrors.username && (
            <div className="mt-1 ml-4">
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-fadeIn">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formErrors.username}</span>
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <FormInput
            name="email"
            label="Adresse email *"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            required
            error={formErrors.email}
            helperText="Nous vous enverrons un email de confirmation"
            placeholder="john@example.com"
          />
          
          {formErrors.email && (
            <div className="mt-1 ml-4">
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-fadeIn">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formErrors.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Mot de passe */}
        <div className="space-y-2">
          <FormInput
            name="password"
            label="Mot de passe *"
            type="password"
            value={formData.password}
            onChange={onInputChange}
            required
            error={formErrors.password}
            helperText="Minimum 8 caractères avec majuscule, minuscule et chiffre"
            placeholder="••••••••"
          />
          
          {formErrors.password && (
            <div className="mt-1 ml-4">
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-fadeIn">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formErrors.password}</span>
              </div>
            </div>
          )}
          
          {/* Indicateur de force du mot de passe */}
          {formData.password && !formErrors.password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      formData.password.length >= 12 ? 'bg-green-500' :
                      formData.password.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (formData.password.length / 12) * 100)}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {formData.password.length >= 12 ? 'Fort' : 
                   formData.password.length >= 8 ? 'Moyen' : 'Faible'}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" 
                      d={/[A-Z]/.test(formData.password) ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} 
                    />
                  </svg>
                  Au moins une majuscule
                </div>
                <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" 
                      d={/[0-9]/.test(formData.password) ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} 
                    />
                  </svg>
                  Au moins un chiffre
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation du mot de passe */}
        <div className="space-y-2">
          <FormInput
            name="password2"
            label="Confirmation du mot de passe *"
            type="password"
            value={formData.password2}
            onChange={onInputChange}
            required
            error={formErrors.password2}
            helperText="Doit correspondre au mot de passe"
            placeholder="••••••••"
          />
          
          {formErrors.password2 && (
            <div className="mt-1 ml-4">
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-fadeIn">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formErrors.password2}</span>
              </div>
            </div>
          )}
          
          {/* Indicateur de correspondance */}
          {formData.password2 && !formErrors.password2 && (
            <div className="mt-2">
              <div className={`flex items-center gap-2 text-sm ${
                formData.password === formData.password2 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {formData.password === formData.password2 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span>
                  {formData.password === formData.password2 
                    ? 'Les mots de passe correspondent' 
                    : 'Les mots de passe ne correspondent pas'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note de sécurité */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Conseils de sécurité
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Utilisez un mot de passe unique pour SeaSky</li>
                <li>Évitez les mots de passe faciles à deviner</li>
                <li>Changez votre mot de passe régulièrement</li>
                <li>Activez l'authentification à deux facteurs si disponible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}