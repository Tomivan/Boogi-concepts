// completed.component.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './completed.component.css';

const Completed = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], cartTotal = 0, orderId = 'N/A', shippingAddress = {} } = state || {};

  const goToHomepage = () => navigate("/");

  return (
    <div className='completed'>
      <div className="confirmation">
        <p>Thank you for your order!</p>
      </div>
      
      <div className="order-details">
        <p>Order #{orderId}</p>
        
        {cartItems.map((item, index) => (
          <div className="item" key={index}>
            <img src={item.image} alt={item.name} className='cart-perfume' />
            <div className="left-detail">
              <p>{item.name}</p>
              <p>₦{item.price.toLocaleString()} × {item.quantity}</p>
              <p>Subtotal: ₦{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        ))}
        
        <div className="total-summary">
          <p><strong>Total: ₦{cartTotal.toLocaleString()}</strong></p>
        </div>
        
        {shippingAddress && (
          <div className="shipping-info">
            <h3>Shipping to:</h3>
            <p>{shippingAddress.name}</p>
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.city}, {shippingAddress.state}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        )}
        
        <button className='start-shopping' onClick={goToHomepage}>
          Back to shopping
        </button>
      </div>
    </div>
  );
};

export default Completed;