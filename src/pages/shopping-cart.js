import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import Cart from '../components/cart/cart.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';

const ShoppingCart = () => {
    return(
        <div className='component'>
            <Navbar />
            <Cart />
            <ContactUs />
            <Footer />
        </div>
    )
}

export default ShoppingCart;