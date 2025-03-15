import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import ProductDetails from '../components/product-details/product-details.component';

const ProductDetailsPage = () => {
    return(
        <div className='component'>
            <Navbar />
            <ProductDetails />
        </div>
    )
}

export default ProductDetailsPage;