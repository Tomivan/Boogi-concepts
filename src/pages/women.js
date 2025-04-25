import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';
import Brand from '../components/brand/brand.component';
import ProductGrid from '../components/product-grid/product-grid.component';

const Women = () => {
    return(
        <div className='component'>
            <Navbar />
            <Search />
            <div className='flex column-flex'>
                <Brand />
                <ProductGrid />
            </div>
        </div>
    )
}

export default Women;