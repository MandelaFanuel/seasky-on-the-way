// src/components/auth/TermsAndConditions.tsx
import React from 'react';

interface TermsAndConditionsProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onShowTerms: () => void;
}

export default function TermsAndConditions({ accepted, onAcceptChange, onShowTerms }: TermsAndConditionsProps) {
  return (
    <section className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </span>
        Conditions générales d'utilisation
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="max-h-40 overflow-y-auto mb-4 text-sm">
          <h4 className="font-bold text-gray-800 mb-2">1. Acceptation des conditions</h4>
          <p className="text-gray-700 mb-3">
            En utilisant la plateforme SeaSky, vous acceptez les présentes conditions générales d'utilisation.
          </p>
          
          <h4 className="font-bold text-gray-800 mb-2">2. Services fournis</h4>
          <p className="text-gray-700 mb-3">
            SeaSky met à disposition une plateforme de mise en relation entre producteurs, distributeurs et consommateurs de produits laitiers.
          </p>
          
          <h4 className="font-bold text-gray-800 mb-2">3. Engagements de l'utilisateur</h4>
          <p className="text-gray-700">
            Vous vous engagez à fournir des informations exactes et à jour, et à respecter les normes de qualité établies.
          </p>
        </div>

        <button
          type="button"
          onClick={onShowTerms}
          className="text-blue-600 hover:text-blue-800 text-sm underline transition-colors duration-200 font-medium"
        >
          📄 Lire les conditions générales complètes
        </button>
      </div>
      
      <div className="flex items-center">
        <input
          id="terms-acceptance"
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms-acceptance" className="ml-2 block text-sm text-gray-900">
          J'accepte les termes et conditions d'utilisation de SeaSky
        </label>
      </div>

      {accepted && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Vous avez accepté les conditions générales
          </p>
        </div>
      )}
    </section>
  );
}