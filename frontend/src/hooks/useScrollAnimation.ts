// src/hooks/useScrollAnimation.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  animationClass?: string;
  activeClass?: string;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    animationClass = 'animate-fade-in-up',
    activeClass = 'active'
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Si l'animation a déjà été déclenchée et que once est true, on ne fait rien
    if (once && hasAnimated) return;

    let observer: IntersectionObserver | null = null;
    
    // Fonction de gestion de l'intersection
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Ajouter les classes d'animation
          entry.target.classList.add(animationClass, activeClass);
          setHasAnimated(true);
          
          // Si once est true, on arrête d'observer après activation
          if (once && observer && ref.current) {
            observer.unobserve(ref.current);
            observer.disconnect();
            observer = null;
          }
        } else if (!once) {
          // Retirer les classes si on veut que l'animation se répète
          entry.target.classList.remove(animationClass, activeClass);
        }
      });
    };

    // Vérification de la compatibilité IntersectionObserver
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin
      });

      if (ref.current) {
        observer.observe(ref.current);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
      // Appliquer directement l'animation
      if (ref.current) {
        ref.current.classList.add(animationClass, activeClass);
        setHasAnimated(true);
      }
    }

    return () => {
      // Nettoyage
      if (observer) {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, once, animationClass, activeClass, hasAnimated]);

  return ref;
};

// Version alternative pour plusieurs éléments dans un conteneur
export const useScrollAnimations = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const animatedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    // Vérification de la compatibilité
    if (!('IntersectionObserver' in window)) {
      // Fallback: appliquer directement les animations
      if (ref.current) {
        const elements = ref.current.querySelectorAll(
          '.fade-in, .slide-in-left, .slide-in-right, .scale-in, .fade-in-up'
        );
        elements.forEach(el => {
          if (el.classList.contains('fade-in')) el.classList.add('animate-fade-in');
          if (el.classList.contains('slide-in-left')) el.classList.add('animate-slide-in-left');
          if (el.classList.contains('slide-in-right')) el.classList.add('animate-slide-in-right');
          if (el.classList.contains('scale-in')) el.classList.add('animate-scale-in');
          if (el.classList.contains('fade-in-up')) el.classList.add('animate-fade-in-up');
        });
      }
      return;
    }

    let observer: IntersectionObserver | null = null;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Ajouter les classes d'animation selon le type d'élément
          if (entry.target.classList.contains('fade-in')) {
            entry.target.classList.add('animate-fade-in');
          }
          if (entry.target.classList.contains('slide-in-left')) {
            entry.target.classList.add('animate-slide-in-left');
          }
          if (entry.target.classList.contains('slide-in-right')) {
            entry.target.classList.add('animate-slide-in-right');
          }
          if (entry.target.classList.contains('scale-in')) {
            entry.target.classList.add('animate-scale-in');
          }
          if (entry.target.classList.contains('fade-in-up')) {
            entry.target.classList.add('animate-fade-in-up');
          }
          
          // Marquer comme animé
          animatedElementsRef.current.add(entry.target);
          
          // Si once est true, arrêter d'observer cet élément
          if (once && observer) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          // Retirer les animations si on veut qu'elles se répètent
          entry.target.classList.remove(
            'animate-fade-in',
            'animate-slide-in-left',
            'animate-slide-in-right',
            'animate-scale-in',
            'animate-fade-in-up'
          );
          animatedElementsRef.current.delete(entry.target);
        }
      });
    };

    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    if (ref.current) {
      // Observer tous les enfants avec des classes d'animation
      const animatedElements = ref.current.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right, .scale-in, .fade-in-up'
      );
      animatedElements.forEach((el) => {
        // Ne pas observer les éléments déjà animés si once est true
        if (!once || !animatedElementsRef.current.has(el)) {
          observer!.observe(el);
        }
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, once]);

  return ref;
};

// Hook pour les animations par étape (stagger)
export const useStaggeredAnimation = (
  staggerDelay: number = 100,
  options?: UseScrollAnimationOptions
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options || {};
  
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !ref.current) return;

    let observer: IntersectionObserver | null = null;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target as HTMLElement;
          const children = container.querySelectorAll('.stagger-item');
          
          // Appliquer l'animation avec un délai progressif
          children.forEach((child, index) => {
            setTimeout(() => {
              (child as HTMLElement).style.opacity = '1';
              (child as HTMLElement).style.transform = 'translateY(0)';
              child.classList.add('animated');
            }, index * staggerDelay);
          });
          
          // Arrêter d'observer si once est true
          if (once && observer) {
            observer.unobserve(container);
          }
        } else if (!once) {
          // Réinitialiser pour les animations répétées
          const container = entry.target as HTMLElement;
          const children = container.querySelectorAll('.stagger-item');
          children.forEach((child) => {
            (child as HTMLElement).style.opacity = '0';
            (child as HTMLElement).style.transform = 'translateY(20px)';
            child.classList.remove('animated');
          });
        }
      });
    };

    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [staggerDelay, threshold, rootMargin, once]);

  return ref;
};

// Hook utilitaire pour vérifier si un élément est visible
export const useIsVisible = (options?: {
  threshold?: number;
  rootMargin?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: options?.threshold || 0,
        rootMargin: options?.rootMargin || '0px'
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [options?.threshold, options?.rootMargin]);

  return [ref, isVisible] as const;
};
