import { useState, Suspense, lazy } from 'react';
import Search from '../components/search/search.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const Brand = lazy(() => import('../components/brand/brand.component'));
const ProductGrid = lazy(() => import('../components/product-grid/product-grid.component'));

const Men = () => {
    const [brandFilters, setBrandFilters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const genderFilter = ['Male', 'Unisex', 'male', 'unisex'];

    return (
        <div className='component'>
            <NavbarComponent />
            <Search onSearch={setSearchTerm} />
            <div className='flex column-flex'>
                <Suspense fallback={
                    <div className="brand-skeleton">
                        <div className="skeleton-header"></div>
                        <div className="skeleton-checkbox"></div>
                        <div className="skeleton-checkbox"></div>
                        <div className="skeleton-checkbox"></div>
                    </div>
                }>
                    <Brand onBrandFilter={setBrandFilters} />
                </Suspense>
                
                <Suspense fallback={
                    <div className="product-grid-skeleton">
                        <div className="skeleton-product"></div>
                        <div className="skeleton-product"></div>
                        <div className="skeleton-product"></div>
                        <div className="skeleton-product"></div>
                    </div>
                }>
                    <ProductGrid 
                        genderFilter={genderFilter}
                        brandFilter={brandFilters}
                        searchTerm={searchTerm}
                    />
                </Suspense>
            </div>
            <ContactUs />
            <Footer />
        </div>
    );
};

export default Men;