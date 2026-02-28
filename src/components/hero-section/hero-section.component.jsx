import { useState, useCallback, useEffect, useRef } from 'react';
import './hero-section.component.css';

import Background from '../../assets/images/background.webp';

const slides = [
    { src: () => import('../../assets/images/background.webp'),   alt: 'a white perfume in a white background',        eager: true  },
    { src: () => import('../../assets/images/background-1.webp'), alt: 'a red perfume in a red background',            eager: false },
    { src: () => import('../../assets/images/background-2.webp'), alt: 'a woman with the eiffel tower background',     eager: false },
    { src: () => import('../../assets/images/background-3.webp'), alt: 'a perfume bottle with a nightclub background', eager: false },
    { src: () => import('../../assets/images/background-5.webp'), alt: 'a black perfume in a black background',        eager: false },
];

const HeroSection = () => {
    const [current, setCurrent] = useState(0);
    const [loadedImages, setLoadedImages] = useState({ 0: Background });
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayRef = useRef(null);

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
            }, 5000); // Change slide every 5 seconds
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, next]);

    // Pause autoplay on hover
    const pauseAutoPlay = () => setIsAutoPlaying(false);
    const resumeAutoPlay = () => setIsAutoPlaying(true);

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
                        {loadedImages[index] && (
                            <img
                                src={loadedImages[index]}
                                alt={slide.alt}
                                fetchPriority={index === 0 ? 'high' : 'low'}
                                decoding={index === 0 ? 'sync' : 'async'}
                                width="1920"
                                height="500"
                                className="hero-carousel__image"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Controls container for better positioning */}
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