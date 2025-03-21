import React from 'react';
import Perfume from '../../assets/images/perfume.jpg';
import './completed.component.css';

const Completed = () => {
    return(
        <div className='completed'>
            <div className="confirmation">
                <p>"Thank you for your order!"</p>
            </div>
            <div className="order-details">
                <p>Order 82392390</p>
                <div className="item">
                    <img src={Perfume} alt='a bottle of perfume' className='cart-perfume' />
                    <div className="left-detail">
                        <p>Antonio Banderas</p>
                        <p>&#8358; 34000</p>
                        <p>20, Omonrinre Johnson street, Lekki, Lagos.</p>
                    </div>
                </div>
                <button className='start-shopping'>Back to shopping</button>
            </div>
        </div>
    )
}

export default Completed;