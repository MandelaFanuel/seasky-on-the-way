// src/components/debug/FormDebugger.tsx
import React from 'react';

// Interface simplifiée pour FormDebugger
interface FormDebuggerProps {
  formData: any;
  currentStep: number;
  formErrors: Record<string, string>;
  visibleSteps: readonly string[] | string[];
  isVisible?: boolean;
}

export default function FormDebugger({ 
  formData, 
  currentStep, 
  formErrors, 
  visibleSteps,
  isVisible = false
}: FormDebuggerProps) {
  
  // Si le debugger n'est pas visible, ne rien afficher
  if (!isVisible) {
    return null;
  }
  
  // Fonction pour afficher la valeur d'un champ
  const renderFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return `[${value.join(', ')}]`;
    if (value instanceof File) return `File: ${value.name} (${value.size} bytes)`;
    return String(value);
  };

  // Vérifier les champs requis pour l'étape actuelle
  const checkRequiredFields = () => {
    const requiredChecks: { field: string; value: any; required: boolean; message: string }[] = [];
    
    switch (currentStep) {
      case 2: // Identifiants
        requiredChecks.push(
          { field: 'username', value: formData.username, required: true, message: 'Nom d\'utilisateur requis' },
          { field: 'email', value: formData.email, required: true, message: 'Email requis' },
          { field: 'password', value: formData.password, required: true, message: 'Mot de passe requis' },
          { field: 'password2', value: formData.password2, required: true, message: 'Confirmation mot de passe requise' }
        );
        break;
        
      case 3: // Infos personnelles
        requiredChecks.push(
          { field: 'full_name', value: formData.full_name, required: true, message: 'Nom complet requis' },
          { field: 'phone', value: formData.phone, required: true, message: 'Téléphone requis' }
        );
        if (formData.account_type === 'client') {
          requiredChecks.push(
            { field: 'gender', value: formData.gender, required: true, message: 'Genre requis' },
            { field: 'date_of_birth', value: formData.date_of_birth, required: true, message: 'Date de naissance requise' },
            { field: 'nationality', value: formData.nationality, required: true, message: 'Nationalité requise' }
          );
        }
        break;
        
      case 4: // KYC
        requiredChecks.push(
          { field: 'id_type', value: formData.id_type, required: true, message: 'Type de pièce requis' },
          { field: 'id_number', value: formData.id_number, required: true, message: 'Numéro de pièce requis' },
          { field: 'id_issue_date', value: formData.id_issue_date, required: true, message: 'Date d\'émission requise' }
        );
        if (!formData.id_no_expiry) {
          requiredChecks.push(
            { field: 'id_expiry_date', value: formData.id_expiry_date, required: true, message: 'Date d\'expiration requise' }
          );
        }
        break;
        
      case 5: // Adresse
        requiredChecks.push(
          { field: 'address_line', value: formData.address_line, required: true, message: 'Adresse requise' },
          { field: 'province', value: formData.province, required: true, message: 'Province requise' },
          { field: 'commune', value: formData.commune, required: true, message: 'Commune requise' }
        );
        if (formData.account_type === 'client') {
          requiredChecks.push(
            { field: 'colline_or_quartier', value: formData.colline_or_quartier, required: true, message: 'Quartier/Colline requis' }
          );
        }
        break;
    }
    
    return requiredChecks;
  };

  const requiredFields = checkRequiredFields();
  const currentStepLabel = visibleSteps[currentStep] || `Étape ${currentStep}`;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto z-50 text-xs">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
        <h3 className="font-bold text-sm">🔧 Debug Form</h3>
        <span className="text-gray-400 text-xs">{currentStepLabel}</span>
      </div>
      
      <div className="space-y-3">
        {/* Informations générales */}
        <div className="space-y-1">
          <div className="text-gray-300 font-medium">Informations</div>
          <div><span className="text-gray-400">Type de compte:</span> {formData.account_type || '❌ Non sélectionné'}</div>
          <div><span className="text-gray-400">Catégorie:</span> {
            formData.client_type || 
            formData.supplier_type || 
            formData.merchant_type || 
            formData.delivery_type || 
            '❌ Non sélectionnée'
          }</div>
          <div><span className="text-gray-400">Étape:</span> {currentStep} - {currentStepLabel}</div>
        </div>
        
        {/* Champs requis pour l'étape actuelle */}
        {requiredFields.length > 0 && (
          <div className="space-y-1">
            <div className="text-gray-300 font-medium">Validation Étape {currentStep}</div>
            {requiredFields.map((check, index) => (
              <div key={index} className={`flex items-center ${check.value ? 'text-green-400' : 'text-red-400'}`}>
                <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                <span className="flex-1">
                  {check.field}: {renderFieldValue(check.value) || '❌'}
                </span>
                {!check.value && (
                  <span className="text-xs text-red-300 ml-2">({check.message})</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Erreurs de validation */}
        <div className="space-y-1">
          <div className="text-gray-300 font-medium">Erreurs</div>
          {Object.keys(formErrors).length === 0 ? (
            <div className="text-green-400">✅ Aucune erreur</div>
          ) : (
            <div className="space-y-1">
              {Object.entries(formErrors).map(([key, value]) => (
                <div key={key} className="text-red-400 flex items-start">
                  <span className="w-2 h-2 rounded-full mr-2 bg-red-400 mt-1 shrink-0"></span>
                  <div>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Données de débogage (collapsible) */}
        <details>
          <summary className="text-gray-300 font-medium cursor-pointer hover:text-white">
            Données brutes
          </summary>
          <pre className="bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-40 text-[10px]">
            {JSON.stringify({
              account_type: formData.account_type,
              client_type: formData.client_type,
              supplier_type: formData.supplier_type,
              merchant_type: formData.merchant_type,
              delivery_type: formData.delivery_type,
              username: formData.username?.substring(0, 10) + (formData.username?.length > 10 ? '...' : ''),
              email: formData.email?.substring(0, 15) + (formData.email?.length > 15 ? '...' : ''),
              phone: formData.phone,
              full_name: formData.full_name,
              id_type: formData.id_type,
              id_number: formData.id_number,
              address_line: formData.address_line,
              province: formData.province,
              commune: formData.commune,
              accepted_terms: formData.accepted_terms,
              accepted_contract: formData.accepted_contract
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}