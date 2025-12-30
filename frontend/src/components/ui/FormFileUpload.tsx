// src/components/ui/FormFileUpload.tsx
import React, { useRef, useState } from 'react';

interface FormFileUploadProps {
  name: string;
  label: string;
  accept?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  preview?: boolean;
  maxSize?: number; // Taille maximale en MB
}

const FormFileUpload: React.FC<FormFileUploadProps> = ({
  name,
  label,
  accept,
  error,
  onChange,
  fileName,
  required = false,
  helperText,
  disabled = false,
  preview = false,
  maxSize = 5 // 5MB par défaut
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const getAcceptableFormats = () => {
    if (!accept) return 'Tous les formats';
    
    const formats = accept.split(',').map(format => {
      if (format.includes('image/*')) return 'Images';
      if (format.includes('.pdf')) return 'PDF';
      if (format.includes('.doc')) return 'Word';
      if (format.includes('.xls')) return 'Excel';
      return format.replace('.', '').toUpperCase();
    });
    
    return formats.join(', ');
  };

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Le fichier est trop volumineux. Taille maximale: ${maxSize}MB`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Générer un aperçu pour les images
      if (preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
    onChange(e);
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFilePreview(null);
    // Créer un événement de changement vide pour notifier le parent
    const event = {
      target: {
        name,
        files: null,
        type: 'file'
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const getFileIcon = (fileName: string = '') => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileName.includes('image') || /(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return '🖼️';
    } else if (/(pdf)$/i.test(fileName)) {
      return '📄';
    } else if (/(doc|docx)$/i.test(fileName)) {
      return '📝';
    } else if (/(xls|xlsx)$/i.test(fileName)) {
      return '📊';
    }
    return '📁';
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={disabled}
        />
        
        {/* Zone de dépôt et bouton */}
        <div
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${disabled 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Cliquez pour télécharger</span> ou glissez-déposez
            </div>
          </div>
        </div>

        {/* Aperçu du fichier sélectionné */}
        {(fileName || filePreview) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {filePreview ? (
                  <img 
                    src={filePreview} 
                    alt="Aperçu" 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-2xl">{getFileIcon(fileName)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Fichier sélectionné
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Supprimer le fichier"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Informations sur les formats acceptés */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>Formats acceptés: {getAcceptableFormats()}</span>
        <span>Max: {maxSize}MB</span>
      </div>
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormFileUpload;