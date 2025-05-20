import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import Cart from '../components/cart/cart.component';
import ContactUs from '../components/contact-us/contact-us.component';

const ShoppingCart = () => {
    return(
        <div className='component'>
            <Navbar />
            <Cart />
            <ContactUs />
        </div>
    )
}

export default ShoppingCart;