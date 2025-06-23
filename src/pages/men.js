import React, { useState } from 'react';
import Search from '../components/search/search.component';
import Brand from '../components/brand/brand.component';
import ProductGrid from '../components/product-grid/product-grid.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const Men = () => {
    const [brandFilters, setBrandFilters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const genderFilter = ['Male', 'Unisex', 'male', 'unisex'];

    return (
        <div className='component'>
            <NavbarComponent />
            <Search onSearch={setSearchTerm} />
            <div className='flex column-flex'>
                <Brand onBrandFilter={setBrandFilters} />
                <ProductGrid 
                    genderFilter={genderFilter}
                    brandFilter={brandFilters}
                    searchTerm={searchTerm}
                />
            </div>
            <ContactUs />
            <Footer />
        </div>
    );
};

export default Men;