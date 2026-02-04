import { useState, Suspense, lazy, useEffect } from 'react';
import NavbarComponent from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';

const Shop = lazy(() => import('../components/shop/shop.component'));
const ProductGrid = lazy(() => import('../components/product-grid/product-grid.component'));
const HeroSection = lazy(() => import('../components/hero-section/hero-section.component'));
const ContactUs = lazy(() => import('../components/contact-us/contact-us.component'));
const Footer = lazy(() => import('../components/footer/footer.component'));

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilters, setBrandFilters] = useState([]);
    const [showBottomComponents, setShowBottomComponents] = useState(false);

    // Load bottom components when user scrolls near them
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + window.pageYOffset;
            const pageHeight = document.documentElement.scrollHeight;
            
            if (scrollPosition > pageHeight * 0.7 && !showBottomComponents) {
                setShowBottomComponents(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showBottomComponents]);

    // Prefetch components based on user interaction
    useEffect(() => {
        const prefetchComponents = async () => {
            if (!searchTerm) {
                import('../components/shop/shop.component');
                import('../components/hero-section/hero-section.component');
            }
        };

        const timer = setTimeout(prefetchComponents, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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
                        brandFilter={brandFilters}
                    />
                </Suspense>
            ) : (
                <>
                    <Suspense fallback={
                        <div className="hero-skeleton">
                            <div className="skeleton-hero-image"></div>
                        </div>
                    }>
                        <HeroSection />
                    </Suspense>
                    
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
            
            {showBottomComponents ? (
                <>
                    <Suspense fallback={<div className="contact-skeleton">Loading contact...</div>}>
                        <ContactUs />
                    </Suspense>
                    
                    <Suspense fallback={<div className="footer-skeleton">Loading footer...</div>}>
                        <Footer />
                    </Suspense>
                </>
            ) : (
                <div className="bottom-placeholder">
                    <div className="scroll-hint">Scroll to see more</div>
                </div>
            )}
        </div>
    );
};

export default Home;