import React from 'react';
import Orders from '../components/orders/orders.component';
import Footer from '../components/footer/footer.component';
import NavbarComponent from '../components/navbar/navbar.component';

const MyOrders = () => {
    return(
        <div>
            <NavbarComponent />
            <Orders />
            <Footer />
        </div>
    )
}

export default MyOrders;