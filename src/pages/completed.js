import React from 'react';
import Completed from '../components/completed/completed.component';
import Footer from '../components/footer/footer.component';
import Navbar from '../components/navbar/navbar.component';

const OrderCompleted = () => {
    return(
        <div className='component'>
            <Navbar />
            <Completed />
            <Footer />
        </div>
    )
}

export default OrderCompleted;