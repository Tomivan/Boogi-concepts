import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import './hero-section.component.css';


import CriticalMobile from '../../assets/images/background-mobile.webp';
import CriticalTablet from '../../assets/images/background-tablet.webp';
import CriticalDesktop from '../../assets/images/background.webp';

const NON_CRITICAL_SRCSET = {
  2: {
    mobile: () => import('../../assets/images/background-1-mobile.webp'),
    tablet: () => import('../../assets/images/background-1-tablet.webp'),
    desktop: () => import('../../assets/images/background-1.webp'),
  },
  3: {
    mobile: () => import('../../assets/images/background-2-mobile.webp'),
    tablet: () => import('../../assets/images/background-2-tablet.webp'),
    desktop: () => import('../../assets/images/background-2.webp'),
  },
  4: {
    mobile: () => import('../../assets/images/background-3-mobile.webp'),
    tablet: () => import('../../assets/images/background-3-tablet.webp'),
    desktop: () => import('../../assets/images/background-3.webp'),
  },
  5: {
    mobile: () => import('../../assets/images/background-5-mobile.webp'),
    tablet: () => import('../../assets/images/background-5-tablet.webp'),
    desktop: () => import('../../assets/images/background-5.webp'),
  },
};

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
    alt: 'a white perfume in a white background',
    critical: true
  },
  { 
    id: 2,
    alt: 'a red perfume in a red background',
    critical: false
  },
  { 
    id: 3,
    alt: 'a woman with the eiffel tower background',
    critical: false
  },
  { 
    id: 4,
    alt: 'a perfume bottle with a nightclub background',
    critical: false
  },
  { 
    id: 5,
    alt: 'a black perfume in a black background',
    critical: false
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loadedImages, setLoadedImages] = useState({ 
    1: { 
      mobile: CriticalMobile, 
      tablet: CriticalTablet, 
      desktop: CriticalDesktop 
    } 
  });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  const autoPlayRef = useRef(null);
  const lcpImageRef = useRef(null);
  const preloadQueueRef = useRef([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    setIsClient(true);
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
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
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Preload non-critical images after critical one loads
  useEffect(() => {
    if (!isClient) return;

    const preloadNextImages = async () => {
      const preloadIndices = [2, 3]; 
      
      for (const index of preloadIndices) {
        const slideId = index;
        if (loadedImages[slideId] || preloadQueueRef.current.includes(slideId)) continue;
        
        preloadQueueRef.current.push(slideId);
        
        try {
          // Determine which images to load based on screen size
          const isMobileView = window.innerWidth <= 767;
          const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 767;
          
          let desktopImg, mobileImg, tabletImg;
          
          if (isMobileView) {
            mobileImg = await NON_CRITICAL_SRCSET[slideId].mobile();
            desktopImg = mobileImg; // Fallback
          } else if (isTabletView) {
            tabletImg = await NON_CRITICAL_SRCSET[slideId].tablet();
            desktopImg = tabletImg; // Fallback
          } else {
            desktopImg = await NON_CRITICAL_SRCSET[slideId].desktop();
          }
          
          if (isMountedRef.current && !loadedImages[slideId]) {
            setLoadedImages(prev => ({
              ...prev,
              [slideId]: {
                mobile: mobileImg?.default || desktopImg.default,
                tablet: tabletImg?.default || desktopImg.default,
                desktop: desktopImg.default
              }
            }));
          }
        } catch (error) {
          console.error(`Failed to preload image ${slideId}:`, error);
          if (isMountedRef.current) {
            setImageLoadErrors(prev => ({ ...prev, [slideId]: true }));
          }
        } finally {
          preloadQueueRef.current = preloadQueueRef.current.filter(id => id !== slideId);
        }
      }
    };

    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadNextImages, { timeout: 2000 });
    } else {
      setTimeout(preloadNextImages, 1000);
    }
  }, [isClient, loadedImages]);

  const goTo = useCallback(async (index) => {
    const slide = slides[index];
    const slideId = slide.id;
    
    if (!slide.critical && !loadedImages[slideId] && !preloadQueueRef.current.includes(slideId)) {
      preloadQueueRef.current.push(slideId);
      
      try {
        const isMobileView = window.innerWidth <= 767;
        const isTabletView = window.innerWidth <= 1024 && window.innerWidth > 767;
        
        let desktopImg, mobileImg, tabletImg;
        
        if (isMobileView) {
          mobileImg = await NON_CRITICAL_SRCSET[slideId].mobile();
          desktopImg = mobileImg;
        } else if (isTabletView) {
          tabletImg = await NON_CRITICAL_SRCSET[slideId].tablet();
          desktopImg = tabletImg;
        } else {
          desktopImg = await NON_CRITICAL_SRCSET[slideId].desktop();
        }
        
        if (isMountedRef.current) {
          setLoadedImages(prev => ({
            ...prev,
            [slideId]: {
              mobile: mobileImg?.default || desktopImg.default,
              tablet: tabletImg?.default || desktopImg.default,
              desktop: desktopImg.default
            }
          }));
        }
      } catch (error) {
        console.error(`Failed to load image ${index}:`, error);
        if (isMountedRef.current) {
          setImageLoadErrors(prev => ({ ...prev, [slideId]: true }));
        }
      } finally {
        preloadQueueRef.current = preloadQueueRef.current.filter(id => id !== slideId);
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

  // Autoplay with cleanup
  useEffect(() => {
    if (isAutoPlaying && isClient) {
      autoPlayRef.current = setInterval(next, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, next, isClient]);

  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), []);
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), []);

  const textContent = useMemo(() => 
    isMobile ? MOBILE_HERO_TEXT : HERO_TEXT
  , [isMobile]);

  if (!isClient) {
    return (
      <div className="hero-carousel" aria-label="Featured products carousel">
        <div className="hero-carousel__track">
          <div className="hero-carousel__slide active">
            <picture>
              <source media="(max-width: 767px)" srcSet={CriticalMobile} />
              <source media="(max-width: 1024px)" srcSet={CriticalTablet} />
              <img
                ref={lcpImageRef}
                src={CriticalDesktop}
                alt="a white perfume in a white background"
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                width="1920"
                height="1080"
                className="hero-carousel__image loaded"
              />
            </picture>
          </div>
        </div>

        {/* Dots for visual reference (static) */}
        <div className="hero-carousel__controls">
          <div className="hero-carousel__dots" role="tablist">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`hero-carousel__dot ${index === 0 ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === 0 ? 'true' : 'false'}
                disabled={!isClient}
              />
            ))}
          </div>
        </div>

        {/* Text content - part of LCP */}
        <div className="content">
          <h2 className="hero-title">{HERO_TEXT.title}</h2>
          <p className="hero-subtitle">{HERO_TEXT.subtitle}</p>
        </div>
      </div>
    );
  }

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
        {slides.map((slide, index) => {
          const isActive = index === current;
          const isCritical = slide.critical;
          const imageSet = loadedImages[slide.id];
          const hasError = imageLoadErrors[slide.id];
          
          if (!isCritical && !imageSet && !isActive) return null;
          
          return (
            <div
              key={slide.id}
              className={`hero-carousel__slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
              inert={!isActive ? "true" : undefined}
            >
              {isActive && imageSet && !hasError ? (
                <picture>
                  <source 
                    media="(max-width: 767px)" 
                    srcSet={imageSet.mobile} 
                  />
                  <source 
                    media="(max-width: 1024px)" 
                    srcSet={imageSet.tablet} 
                  />
                  <img
                    ref={isCritical ? lcpImageRef : null}
                    src={imageSet.desktop}
                    alt={slide.alt}
                    fetchPriority={isCritical ? 'high' : 'auto'}
                    loading={isCritical ? 'eager' : 'lazy'}
                    decoding={isCritical ? 'sync' : 'async'}
                    width="1920"
                    height="1080"
                    className="hero-carousel__image"
                    onLoad={(e) => {
                      e.target.classList.add('loaded');
                      if (isCritical) {
                        window.dispatchEvent(new CustomEvent('lcp-image-loaded'));
                      }
                    }}
                    onError={() => {
                      setImageLoadErrors(prev => ({ ...prev, [slide.id]: true }));
                    }}
                  />
                </picture>
              ) : isActive ? (
                <div className="hero-carousel__placeholder" aria-label="Loading image..." />
              ) : null}
            </div>
          );
        })}
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
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel__dot ${index === current ? 'active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current ? 'true' : 'false'}
            />
          ))}
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