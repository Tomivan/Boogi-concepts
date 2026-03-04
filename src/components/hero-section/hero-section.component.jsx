import { useState, useCallback, useEffect, useRef } from 'react';
import './hero-section.component.css';

// Image imports with responsive versions
import BackgroundDesktop from '../../assets/images/background.webp';
import BackgroundTablet from '../../assets/images/background-tablet.webp';
import BackgroundMobile from '../../assets/images/background-mobile.webp';

import Background1Desktop from '../../assets/images/background-1.webp';
import Background1Tablet from '../../assets/images/background-1-tablet.webp';
import Background1Mobile from '../../assets/images/background-1-mobile.webp';

import Background2Desktop from '../../assets/images/background-2.webp';
import Background2Tablet from '../../assets/images/background-2-tablet.webp';
import Background2Mobile from '../../assets/images/background-2-mobile.webp';

import Background3Desktop from '../../assets/images/background-3.webp';
import Background3Tablet from '../../assets/images/background-3-tablet.webp';
import Background3Mobile from '../../assets/images/background-3-mobile.webp';

import Background5Desktop from '../../assets/images/background-5.webp';
import Background5Tablet from '../../assets/images/background-5-tablet.webp';
import Background5Mobile from '../../assets/images/background-5-mobile.webp';

const slides = [
    { 
        src: () => import('../../assets/images/background.webp'),
        srcSet: {
            desktop: BackgroundDesktop,
            tablet: BackgroundTablet,
            mobile: BackgroundMobile
        },
        alt: 'a white perfume in a white background',
        eager: true
    },
    { 
        src: () => import('../../assets/images/background-1.webp'),
        srcSet: {
            desktop: Background1Desktop,
            tablet: Background1Tablet,
            mobile: Background1Mobile
        },
        alt: 'a red perfume in a red background',
        eager: false
    },
    { 
        src: () => import('../../assets/images/background-2.webp'),
        srcSet: {
            desktop: Background2Desktop,
            tablet: Background2Tablet,
            mobile: Background2Mobile
        },
        alt: 'a woman with the eiffel tower background',
        eager: false
    },
    { 
        src: () => import('../../assets/images/background-3.webp'),
        srcSet: {
            desktop: Background3Desktop,
            tablet: Background3Tablet,
            mobile: Background3Mobile
        },
        alt: 'a perfume bottle with a nightclub background',
        eager: false
    },
    { 
        src: () => import('../../assets/images/background-5.webp'),
        srcSet: {
            desktop: Background5Desktop,
            tablet: Background5Tablet,
            mobile: Background5Mobile
        },
        alt: 'a black perfume in a black background',
        eager: false
    },
];

const HeroSection = () => {
    const [current, setCurrent] = useState(0);
    const [loadedImages, setLoadedImages] = useState({ 0: BackgroundDesktop });
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [imagesPreloaded, setImagesPreloaded] = useState(false);
    const autoPlayRef = useRef(null);

    // Preload next images for smoother transitions
    useEffect(() => {
        if (!imagesPreloaded) {
            // Preload the next 2 images after the first one
            const preloadImages = [1, 2].map(async (index) => {
                if (!loadedImages[index]) {
                    const module = await slides[index].src();
                    setLoadedImages(prev => ({ ...prev, [index]: module.default }));
                }
            });
            
            Promise.all(preloadImages).then(() => {
                setImagesPreloaded(true);
            });
        }
    }, [imagesPreloaded, loadedImages]);

    const goTo = useCallback(async (index) => {
        // Load the image if not already loaded
        if (!loadedImages[index]) {
            const module = await slides[index].src();
            setLoadedImages(prev => ({ ...prev, [index]: module.default }));
        }
        setCurrent(index);
    }, [loadedImages]);

    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length);
    }, [current, goTo]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, goTo]);

    // Autoplay functionality
    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayRef.current = setInterval(() => {
                next();
            }, 5000);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, next]);

    const pauseAutoPlay = () => setIsAutoPlaying(false);
    const resumeAutoPlay = () => setIsAutoPlaying(true);

    // Get responsive image source based on screen size
    const getResponsiveImage = (slide, loadedSrc) => {
        // If the high-res image is loaded, use it
        if (loadedSrc) {
            return (
                <picture>
                    <source media="(max-width: 767px)" srcSet={slide.srcSet.mobile} />
                    <source media="(max-width: 1024px)" srcSet={slide.srcSet.tablet} />
                    <img
                        src={loadedSrc}
                        alt={slide.alt}
                        fetchPriority={slide.eager ? 'high' : 'auto'}
                        loading={slide.eager ? 'eager' : 'lazy'}
                        decoding={slide.eager ? 'sync' : 'async'}
                        width="1920"
                        height="500"
                        className="hero-carousel__image"
                        onLoad={(e) => {
                            // Add a class when image is fully loaded
                            e.target.classList.add('loaded');
                        }}
                    />
                </picture>
            );
        }
        return null;
    };

    return (
        <div 
            className="hero-carousel" 
            aria-label="Featured products carousel"
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
        >
            <div className="hero-carousel__track">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`hero-carousel__slide ${index === current ? 'active' : ''}`}
                        aria-hidden={index !== current}
                    >
                        {loadedImages[index] && getResponsiveImage(slide, loadedImages[index])}
                    </div>
                ))}
            </div>

            <div className="hero-carousel__controls">
                <button className="hero-carousel__btn hero-carousel__btn--prev" onClick={prev} aria-label="Previous slide">&#8249;</button>
                <button className="hero-carousel__btn hero-carousel__btn--next" onClick={next} aria-label="Next slide">&#8250;</button>

                <div className="hero-carousel__dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`hero-carousel__dot ${index === current ? 'active' : ''}`}
                            onClick={() => goTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="content">
                <h2>Discover the Essence of Elegance</h2>
                <p className="white">
                    Experience the exclusivity of boogi-rye's handcrafted fragrances
                    with gold-standard luxury. Designed for those who leave an impression.
                </p>
            </div>
        </div>
    );
};

export default HeroSection;