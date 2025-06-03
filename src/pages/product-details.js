import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import ProductDetails from '../components/product-details/product-details.component';
import Footer from '../components/footer/footer.component';

const ProductDetailsPage = () => {
    return(
        <div className='component'>
            <Navbar />
            <ProductDetails />
            <Footer />
        </div>
    )
}

export default ProductDetailsPage;