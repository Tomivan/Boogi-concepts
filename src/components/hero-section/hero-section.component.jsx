import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import './hero-section.component.css';

const HERO_TEXT = {
  title: 'Discover the Essence of Elegance',
  subtitle: 'Experience the exclusivity of boogi-rye\'s handcrafted fragrances with gold-standard luxury. Designed for those who leave an impression.'
};

const MOBILE_HERO_TEXT = {
  title: 'Discover Elegance',
  subtitle: 'Handcrafted luxury fragrances for those who leave an impression.'
};

const slides = [
  { 
    id: 1,
    srcSet: {
      desktop: () => import('../../assets/images/background.webp'),
      tablet: () => import('../../assets/images/background-tablet.webp'),
      mobile: () => import('../../assets/images/background-mobile.webp')
    },
    alt: 'a white perfume in a white background',
    critical: true 
  },
  { 
    id: 2,
    srcSet: {
      desktop: () => import('../../assets/images/background-1.webp'),
      tablet: () => import('../../assets/images/background-1-tablet.webp'),
      mobile: () => import('../../assets/images/background-1-mobile.webp')
    },
    alt: 'a red perfume in a red background',
    critical: false
  },
  { 
    id: 3,
    srcSet: {
      desktop: () => import('../../assets/images/background-2.webp'),
      tablet: () => import('../../assets/images/background-2-tablet.webp'),
      mobile: () => import('../../assets/images/background-2-mobile.webp')
    },
    alt: 'a woman with the eiffel tower background',
    critical: false
  },
  { 
    id: 4,
    srcSet: {
      desktop: () => import('../../assets/images/background-3.webp'),
      tablet: () => import('../../assets/images/background-3-tablet.webp'),
      mobile: () => import('../../assets/images/background-3-mobile.webp')
    },
    alt: 'a perfume bottle with a nightclub background',
    critical: false
  },
  { 
    id: 5,
    srcSet: {
      desktop: () => import('../../assets/images/background-5.webp'),
      tablet: () => import('../../assets/images/background-5-tablet.webp'),
      mobile: () => import('../../assets/images/background-5-mobile.webp')
    },
    alt: 'a black perfume in a black background',
    critical: false
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  const autoPlayRef = useRef(null);
  const lcpImageRef = useRef(null);
  const preloadQueueRef = useRef([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const checkMobile = () => {
      if (isMountedRef.current) {
        setIsMobile(window.innerWidth <= 767);
      }
    };
    
    let ticking = false;
    const handleResize = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkMobile();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loadCriticalImage = async () => {
      const criticalSlide = slides.find(s => s.critical);
      if (!criticalSlide) return;

      try {
        const isMobileView = window.innerWidth <= 767;
        const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 767;
        
        let imageModule;
        if (isMobileView) {
          imageModule = await criticalSlide.srcSet.mobile();
        } else if (isTabletView) {
          imageModule = await criticalSlide.srcSet.tablet();
        } else {
          imageModule = await criticalSlide.srcSet.desktop();
        }
        
        if (isMountedRef.current) {
          setLoadedImages(prev => ({ 
            ...prev, 
            [criticalSlide.id]: imageModule.default 
          }));
        }
      } catch (error) {
        console.error('Failed to load critical image:', error);
        if (isMountedRef.current) {
          setImageLoadErrors(prev => ({ ...prev, [criticalSlide.id]: true }));
        }
      }
    };
    
    loadCriticalImage();
  }, []);

  const preloadImages = useCallback(async (indices) => {
    const isMobileView = window.innerWidth <= 767;
    const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 767;
    
    for (const index of indices) {
      const slide = slides[index];
      if (!slide || loadedImages[slide.id] || preloadQueueRef.current.includes(slide.id)) {
        continue;
      }
      
      preloadQueueRef.current.push(slide.id);
      
      try {
        let imageModule;
        if (isMobileView) {
          imageModule = await slide.srcSet.mobile();
        } else if (isTabletView) {
          imageModule = await slide.srcSet.tablet();
        } else {
          imageModule = await slide.srcSet.desktop();
        }
        
        if (isMountedRef.current && !loadedImages[slide.id]) {
          setLoadedImages(prev => ({ 
            ...prev, 
            [slide.id]: imageModule.default 
          }));
        }
      } catch (error) {
        console.error(`Failed to preload image ${index}:`, error);
        if (isMountedRef.current) {
          setImageLoadErrors(prev => ({ ...prev, [slide.id]: true }));
        }
      } finally {
        preloadQueueRef.current = preloadQueueRef.current.filter(id => id !== slide.id);
      }
    }
  }, [loadedImages]);

  useEffect(() => {
    const nextIndices = [
      (current + 1) % slides.length,
      (current + 2) % slides.length
    ];
    
    preloadImages(nextIndices);
  }, [current, preloadImages]);

  const goTo = useCallback(async (index) => {
    const slide = slides[index];
    
    if (!loadedImages[slide.id] && !preloadQueueRef.current.includes(slide.id)) {
      const isMobileView = window.innerWidth <= 767;
      const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 767;
      
      preloadQueueRef.current.push(slide.id);
      
      try {
        let imageModule;
        if (isMobileView) {
          imageModule = await slide.srcSet.mobile();
        } else if (isTabletView) {
          imageModule = await slide.srcSet.tablet();
        } else {
          imageModule = await slide.srcSet.desktop();
        }
        
        if (isMountedRef.current) {
          setLoadedImages(prev => ({ 
            ...prev, 
            [slide.id]: imageModule.default 
          }));
        }
      } catch (error) {
        console.error(`Failed to load image ${index}:`, error);
        if (isMountedRef.current) {
          setImageLoadErrors(prev => ({ ...prev, [slide.id]: true }));
        }
      } finally {
        preloadQueueRef.current = preloadQueueRef.current.filter(id => id !== slide.id);
      }
    }
    
    if (isMountedRef.current) {
      setCurrent(index);
    }
  }, [loadedImages]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(next, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, next]);

  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), []);
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), []);

  const textContent = useMemo(() => 
    isMobile ? MOBILE_HERO_TEXT : HERO_TEXT
  , [isMobile]);

  const renderedSlides = useMemo(() => {
    return slides.map((slide, index) => {
      const isActive = index === current;
      const imageSrc = loadedImages[slide.id];
      const hasError = imageLoadErrors[slide.id];
      
      return (
        <div
          key={slide.id}
          className={`hero-carousel__slide ${isActive ? 'active' : ''}`}
          aria-hidden={!isActive}
          inert={!isActive ? "true" : undefined}
        >
          {isActive && imageSrc && !hasError ? (
            <img
              ref={slide.critical ? lcpImageRef : null}
              src={imageSrc}
              alt={slide.alt}
              fetchPriority={slide.critical ? 'high' : 'auto'}
              loading={slide.critical ? 'eager' : 'lazy'}
              decoding={slide.critical ? 'sync' : 'async'}
              width="1920"
              height="1080"
              className="hero-carousel__image"
              onLoad={(e) => {
                e.target.classList.add('loaded');
                window.dispatchEvent(new CustomEvent('hero-image-loaded', { 
                  detail: { slideId: slide.id } 
                }));
              }}
              onError={() => {
                setImageLoadErrors(prev => ({ ...prev, [slide.id]: true }));
              }}
            />
          ) : (
            <div className="hero-carousel__placeholder" aria-label="Loading image..." />
          )}
        </div>
      );
    });
  }, [current, loadedImages, imageLoadErrors]);

  const dotButtons = useMemo(() => {
    return slides.map((_, index) => (
      <button
        key={index}
        className={`hero-carousel__dot ${index === current ? 'active' : ''}`}
        onClick={() => goTo(index)}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={index === current ? 'true' : 'false'}
      />
    ));
  }, [current, goTo]);

  return (
    <div 
      className="hero-carousel" 
      aria-label="Featured products carousel"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={pauseAutoPlay}
      onTouchEnd={resumeAutoPlay}
    >
      <div className="hero-carousel__track">
        {renderedSlides}
      </div>

      <div className="hero-carousel__controls">
        <button 
          className="hero-carousel__btn hero-carousel__btn--prev" 
          onClick={prev} 
          aria-label="Previous slide"
          aria-disabled={!loadedImages[slides[current]?.id]}
        >
          ‹
        </button>
        <button 
          className="hero-carousel__btn hero-carousel__btn--next" 
          onClick={next} 
          aria-label="Next slide"
          aria-disabled={!loadedImages[slides[current]?.id]}
        >
          ›
        </button>

        <div className="hero-carousel__dots" role="tablist">
          {dotButtons}
        </div>
      </div>

      <div className="content">
        <h2 className="hero-title">{textContent.title}</h2>
        <p className="hero-subtitle">{textContent.subtitle}</p>
      </div>
    </div>
  );
};

export default HeroSection;