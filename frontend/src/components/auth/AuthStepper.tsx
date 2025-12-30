// src/components/auth/AuthStepper.tsx
import React, { useEffect, useState } from 'react';

interface AuthStepperProps {
  steps: readonly string[] | string[];
  currentStep: number;
  showProgress?: boolean;
  showAnimation?: boolean;
}

const AuthStepper: React.FC<AuthStepperProps> = ({ 
  steps, 
  currentStep, 
  showProgress = false, 
  showAnimation = false 
}) => {
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([])
  const [progressWidth, setProgressWidth] = useState<string>('0%')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Calcul du pourcentage de progression
  const progressPercentage = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100

  // Gestion des animations étape par étape
  useEffect(() => {
    if (showAnimation && showProgress && steps.length > 1) {
      // Animation fluide de la barre de progression
      const timer = setTimeout(() => {
        setProgressWidth(`${progressPercentage}%`)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [showAnimation, showProgress, steps.length, progressPercentage])

  // Animation des étapes complétées
  useEffect(() => {
    if (showAnimation) {
      // Réinitialiser l'animation lors du premier chargement
      if (isInitialLoad) {
        setIsInitialLoad(false)
        return
      }

      // Animer les étapes une par une
      const newAnimatedSteps: number[] = []
      const timeouts: NodeJS.Timeout[] = []
      
      for (let i = 0; i <= currentStep; i++) {
        const timeout = setTimeout(() => {
          setAnimatedSteps(prev => {
            if (!prev.includes(i)) {
              return [...prev, i]
            }
            return prev
          })
        }, i * 200) // Délai de 200 ms entre chaque étape
        
        timeouts.push(timeout)
      }
      
      return () => {
        // Nettoyage des délais d'attente
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [currentStep, showAnimation, isInitialLoad])

  // Couleurs dynamiques basées sur la progression
  const getStepColor = (index: number) => {
    const isCompleted = index < currentStep
    const isActive = index === currentStep
    const progressRatio = index / (steps.length - 1)

    if (isCompleted) {
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        border: 'border-blue-500',
        text: 'text-white',
        ring: 'ring-2 ring-blue-100',
        shadow: 'shadow-md shadow-blue-100',
      }
    }
    
    if (isActive) {
      return {
        bg: 'bg-white',
        border: 'border-blue-500',
        text: 'text-blue-600',
        ring: 'ring-2 ring-blue-200',
        shadow: 'shadow-md',
      }
    }
    
    // Étape future avec dégradé basé sur la position
    if (progressRatio < 0.33) {
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-400',
        ring: '',
        shadow: '',
      }
    } else if (progressRatio < 0.66) {
      return {
        bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
        border: 'border-gray-300',
        text: 'text-gray-500',
        ring: '',
        shadow: '',
      }
    } else {
      return {
        bg: 'bg-gradient-to-br from-gray-200 to-gray-300',
        border: 'border-gray-400',
        text: 'text-gray-600',
        ring: '',
        shadow: '',
      }
    }
  }

  // Couleur de la barre de progression
  const getProgressBarColor = () => {
    if (progressPercentage < 33) {
      return 'from-blue-400 via-blue-500 to-blue-600'
    } else if (progressPercentage < 66) {
      return 'from-blue-500 via-blue-600 to-blue-700'
    } else {
      return 'from-blue-600 via-blue-700 to-blue-800'
    }
  }

  // Animation pour les étapes complétées
  const getStepAnimation = (index: number) => {
    if (animatedSteps.includes(index)) {
      return 'animate-[stepPulse_1s_ease-in-out]'
    }
    return ''
  }

  const shouldShowProgress = showProgress && steps.length > 1

  return (
    <div className="w-full relative">
      {/* Effet de halo lumineux pour l'étape active */}
      {showAnimation && (
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-100/20 via-blue-200/10 to-blue-100/20 rounded-xl blur-xl animate-pulse pointer-events-none -z-10" />
      )}

      {/* Stepper détaillé - Version Desktop */}
      {shouldShowProgress ? (
        <div className="hidden md:block mb-10 relative z-20">
          <div className="relative">
            {/* Ligne de fond avec effet de profondeur */}
            <div className="absolute top-5 left-0 right-0 h-2 bg-gradient-to-r from-gray-100 via-gray-150 to-gray-100 rounded-full -z-10 shadow-inner" />
            
            {/* Ligne de progression animée */}
            <div 
              className={`absolute top-5 left-0 h-2 bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-1000 ease-out -z-10 shadow-lg`}
              style={{ width: progressWidth }}
            >
              {/* Effet de brillance sur la barre de progression */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 via-transparent to-white/10 rounded-full" />
            </div>

            {/* Étapes avec animation séquentielle */}
            <div className="flex justify-between relative">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isActive = index === currentStep
                const stepColors = getStepColor(index)
                const stepAnimation = getStepAnimation(index)

                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center relative flex-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Connecteur à gauche (sauf pour la première étape) */}
                    {index > 0 && (
                      <div 
                        className={`absolute top-5 right-1/2 h-2 w-full ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-150'
                        } rounded-l-full`}
                        style={{ transform: 'translateY(-50%)' }}
                      />
                    )}

                    {/* Cercle d'étape avec effets */}
                    <div className={`relative z-20 ${stepAnimation}`}>
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                          stepColors.bg
                        } ${stepColors.border} ${stepColors.ring} ${stepColors.shadow} hover:scale-110`}
                      >
                        {isCompleted ? (
                          <div 
                            className="animate-[checkmark_0.5s_ease-in-out_forwards]"
                            style={{ animationDelay: '0.2s' }}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7"
                                style={{ 
                                  strokeDasharray: 100, 
                                  strokeDashoffset: isCompleted ? 0 : 100 
                                }}
                              />
                            </svg>
                          </div>
                        ) : (
                          <span className={`text-lg font-bold ${stepColors.text}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Effet de halo pour l'étape active */}
                      {isActive && showAnimation && (
                        <>
                          <div className="absolute -inset-3 bg-blue-400/20 rounded-full animate-ping" />
                          <div className="absolute -inset-2 bg-blue-300/10 rounded-full animate-pulse" />
                        </>
                      )}

                      {/* Indicateur d'étape active (point bleu animé) */}
                      {isActive && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>

                    {/* Étiquette d'étape avec pourcentage en surimpression */}
                    <div className="mt-4 text-center max-w-[140px]">
                      <div className="relative">
                        <span 
                          className={`text-sm font-medium transition-all duration-500 ${
                            isCompleted || isActive 
                              ? `${stepColors.text} font-semibold` 
                              : 'text-gray-500'
                          }`}
                        >
                          {step}
                        </span>

                        {/* Pourcentage de progression sous l'étape */}
                        {isActive && (
                          <div className="mt-1">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
                              {Math.round(progressPercentage)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Affichage simplifié pour les premières étapes */
        <div className="hidden md:block mb-6">
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">{currentStep + 1}</span>
                </div>
                <div className="absolute -inset-1 bg-blue-400/20 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-700">
                  Étape {currentStep + 1} sur {steps.length}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {steps[currentStep]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stepper simplifié - Version Mobile avec animation */}
      <div className="md:hidden mb-6">
        {shouldShowProgress ? (
          <div className="space-y-4">
            {/* Barre de progression mobile animée */}
            <div className="relative">
              <div className="w-full h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: progressWidth }}
                />
              </div>

              {/* Points indicateurs d'étapes */}
              <div className="flex justify-between mt-2">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep
                  const isActive = index === currentStep

                  return (
                    <div key={index} className="flex flex-col items-center relative">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500' 
                            : isActive 
                            ? 'bg-white border-blue-500 ring-2 ring-blue-200' 
                            : 'bg-white border-gray-300'
                        } ${getStepAnimation(index)}`}
                      >
                        {isCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Label pour l'étape active avec pourcentage */}
                      {isActive && (
                        <div className="absolute -bottom-8 text-center">
                          <span className="text-xs font-medium text-blue-600 whitespace-nowrap">
                            {step}
                          </span>
                          <div className="text-[10px] font-bold text-blue-500 mt-0.5">
                            {Math.round(progressPercentage)}%
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Affichage simplifié pour mobile (premières étapes) */
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-sm">{currentStep + 1}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-blue-700">
                  Étape {currentStep + 1}/{steps.length}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {steps[currentStep]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthStepper