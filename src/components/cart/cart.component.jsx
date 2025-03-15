import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Perfume from '../../assets/images/perfume.jpg';
import './cart.component.css';

const Cart = () => {
    const navigate = useNavigate();
    const goToHomepage = () => {
        navigate("/");
    }
    const moveTocheckout = () => {
        navigate("/checkout")
    }
    return(
        <div className='component'>
            {/* <div className="empty">
                <FontAwesomeIcon icon={faCartPlus} className='cart' />
                <p>Your cart is empty</p>
                <p>Browse our perfumes and get the best deals</p>
                <button className='start-shopping' onClick={goToHomepage}>Shop for Perfumes</button>
            </div> */}
            <section className="perfume-in-cart">
                <h1>Cart</h1>
                <hr />
                <div className="top">
                    <div className="cart-left">
                        <img src={Perfume} alt='a bottle of perfume' className='cart-perfume' />
                        <div className="left-detail">
                            <p>Antonio Banderas</p>
                            <p>In stock</p>
                        </div>
                    </div>
                    <div className="cart-right">
                        <p><strong>&#8358; 35,000</strong></p>
                    </div>
                </div>
                <div className="bottom">
                    <div className="remove">
                        <FontAwesomeIcon icon={faTrash} className='trash'/>
                        <p>Remove</p>
                    </div>
                    <div className="counter">
                        <FontAwesomeIcon icon={faMinus} className='minus' />
                        <p><strong>1</strong></p>
                        <FontAwesomeIcon icon={faPlus} className='plus' />
                    </div>
                </div>
            </section>
            <hr />
            <section className='total'>
                <p><strong>Total: </strong>&#8358; 35,000</p>
                <button className='checkout' onClick={moveTocheckout}>Checkout</button>
            </section>
        </div>
    )
}

export default Cart;