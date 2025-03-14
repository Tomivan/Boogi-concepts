import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import Search from '../components/search/search.component';
import Brand from '../components/brand/brand.component';
import ProductGrid from '../components/product-grid/product-grid.component';

const Men = () => {
    return(
        <div className='men'>
            <Navbar />
            <Search />
            <Brand />
            <ProductGrid />
        </div>
    )
}

export default Men;