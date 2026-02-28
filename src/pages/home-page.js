import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import NavbarComponent from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';
import HeroSection from '../components/hero-section/hero-section.component';

const Shop = lazy(() => import('../components/shop/shop.component'));
const ProductGrid = lazy(() => import('../components/product-grid/product-grid.component'));
const ContactUs = lazy(() => import('../components/contact-us/contact-us.component'));
const Footer = lazy(() => import('../components/footer/footer.component'));

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showBottomComponents, setShowBottomComponents] = useState(false);
    const bottomRef = useRef(null);

    // Load bottom components when user scrolls near them
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowBottomComponents(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px' }
        );

        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, []);

    // Prefetch components based on user interaction
    useEffect(() => {
        const timer = setTimeout(() => {
            import('../components/shop/shop.component');
        }, 3000); // give the page time to settle first
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='component'>
            <NavbarComponent />
            <Search onSearch={setSearchTerm} />

            {searchTerm ? (
                <Suspense fallback={
                    <div className="search-results-skeleton">
                        <h2>Searching for "{searchTerm}"...</h2>
                        <div className="skeleton-grid">
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                        </div>
                    </div>
                }>
                    <ProductGrid 
                        searchTerm={searchTerm}
                    />
                </Suspense>
            ) : (
                <>
                    <HeroSection />
                    
                    <Suspense fallback={
                        <div className="shop-skeleton">
                            <div className="skeleton-section">
                                <div className="skeleton-header"></div>
                                <div className="skeleton-carousel">
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                </div>
                            </div>
                            <div className="skeleton-section">
                                <div className="skeleton-header"></div>
                                <div className="skeleton-carousel">
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                    <div className="skeleton-product"></div>
                                </div>
                            </div>
                        </div>
                    }>
                        <Shop />
                    </Suspense>
                </>
            )}
            
            <div ref={bottomRef} />
            
            {showBottomComponents && (
                <>
                    <Suspense fallback={<div className="contact-skeleton">Loading contact...</div>}>
                        <ContactUs />
                    </Suspense>
                    <Suspense fallback={<div className="footer-skeleton">Loading footer...</div>}>
                        <Footer />
                    </Suspense>
                </>
            )}
        </div>
    );
};

export default Home;