import React from 'react';
import Completed from '../components/completed/completed.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const OrderCompleted = () => {
    return(
        <div className='component'>
            <NavbarComponent />
            <Completed />
            <Footer />
        </div>
    )
}

export default OrderCompleted;