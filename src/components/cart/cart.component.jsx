import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import './cart.component.css';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart
  } = useCart();

  const goToHomepage = () => navigate("/");
  const moveToCheckout = () => {
    navigate("/checkout", { 
      state: { 
        cartItems,
        cartTotal 
      } 
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className='component'>
        <div className="empty">
          <FontAwesomeIcon icon={faCartPlus} className='cart' />
          <p>Your cart is empty</p>
          <p>Browse our perfumes and get the best deals</p>
          <button className='start-shopping' onClick={goToHomepage}>
            Shop for Perfumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='component'>
      <h1 className='cart-h1'>Cart</h1>
      <hr />
      
      {cartItems.map(item => (
        <section className="perfume-in-cart" key={item.id}>
          <div className="top">
            <div className="cart-left">
              <img src={item.image} alt={item.name} className='cart-perfume' />
              <div className="left-detail">
                <p>{item.name}</p>
                <p>In stock</p>
              </div>
            </div>
            <div className="cart-right">
              <p><strong>&#8358; {item.price.toLocaleString()}</strong></p>
            </div>
          </div>
          <div className="bottom">
            <div className="remove" onClick={() => removeFromCart(item.id)}>
              <FontAwesomeIcon icon={faTrash} className='trash'/>
              <p>Remove</p>
            </div>
            <div className="counter">
              <FontAwesomeIcon 
                icon={faMinus} 
                className='minus' 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              />
              <p><strong>{item.quantity}</strong></p>
              <FontAwesomeIcon 
                icon={faPlus} 
                className='plus' 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              />
            </div>
          </div>
          <hr />
        </section>
      ))}
      
      <section className='total'>
        <p><strong>Total: </strong>&#8358; {cartTotal.toLocaleString()}</p>
        <button className='checkout' onClick={moveToCheckout}>
          Checkout
        </button>
      </section>
    </div>
  );
};

export default Cart;