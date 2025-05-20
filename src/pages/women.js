import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';
import Brand from '../components/brand/brand.component';
import ProductGrid from '../components/product-grid/product-grid.component';
import ContactUs from '../components/contact-us/contact-us.component';

const Women = () => {
    return(
        <div className='component'>
            <Navbar />
            <Search />
            <div className='flex column-flex'>
                <Brand />
                <ProductGrid />
            </div>
            <ContactUs />
        </div>
    )
}

export default Women;