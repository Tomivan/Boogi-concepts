import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import './cart.component.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const goToHomepage = () => navigate("/");
  const moveToCheckout = () => navigate("/checkout", { state: { cartItems, cartTotal } });

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className='component'>
        <div className="empty">
          <FontAwesomeIcon icon={faCartPlus} className='cart' />
          <p>Your cart is empty</p>
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
              <img 
                src={item.ImageUrl || item.image} 
                alt={item.Name || item.name} 
                className='cart-perfume' 
              />
              <div className="left-detail">
                <p>{item.Name || item.name}</p>
                <p>Brand: {item['Brand Name'] || item.Brand || 'No brand specified'}</p>
              </div>
            </div>
            <div className="cart-right">
              <p><strong>₦{(item.price * item.quantity).toLocaleString()}</strong></p>
            </div>
          </div>
          <div className="bottom">
            <div className="remove" onClick={() => removeFromCart(item.id)}>
              <FontAwesomeIcon icon={faTrash} className='trash'/>
              <p>Remove</p>
            </div>
            <div className="counter">
              <FontAwesomeIcon icon={faMinus} className='minus' onClick={() => handleDecrement(item)} />
              <p><strong>{item.quantity}</strong></p>
              <FontAwesomeIcon icon={faPlus} className='plus' onClick={() => updateQuantity(item.id, item.quantity + 1)} />
            </div>
          </div>
          <hr />
        </section>
      ))}
      
      <section className='total'>
        <div className="total-actions">
          <button className='clear-cart' onClick={clearCart}>
            Clear Cart
          </button>
          <p><strong>Total: </strong>₦{cartTotal.toLocaleString()}</p>
        </div>
        <button className='checkout' onClick={moveToCheckout}>
          Proceed to Checkout
        </button>
      </section>
    </div>
  );
};

export default Cart;