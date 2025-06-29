import React, { useState } from 'react';
import HeroSection from '../components/hero-section/hero-section.component';
import Shop from '../components/shop/shop.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';
import ProductGrid from '../components/product-grid/product-grid.component';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilters, setBrandFilters] = useState([]);

    return (
        <div className='component'>
            <NavbarComponent />
            <Search onSearch={setSearchTerm} />
            
            {/* Show HeroSection only when there's no search term */}
            {!searchTerm && <HeroSection />}
            
            {/* Show either Shop or ProductGrid based on search term */}
            {searchTerm ? (
                <ProductGrid 
                    searchTerm={searchTerm}
                    brandFilter={brandFilters}
                />
            ) : (
                <Shop />
            )}
            
            <ContactUs />
            <Footer />
        </div>
    );
};

export default Home;