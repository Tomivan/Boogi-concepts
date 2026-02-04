import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { 
  showSuccessAlert,
  showLoadingAlert, 
  showConfirmAlert,
  closeAlert 
} from '../../utils/alert';
import './cart.component.css';

const Cart = () => {
  const navigate = useNavigate();
  
  const cartItems = useCartStore((state) => state.cartItems);
  const cartTotal = useCartStore((state) => state.cartTotal);
  const loading = useCartStore((state) => state.loading);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);

  const goToHomepage = () => navigate("/");
  
  const moveToCheckout = () => {
    setIsProcessing(true);
    showLoadingAlert('Preparing Checkout', 'Redirecting to checkout...');
    
    setTimeout(() => {
      closeAlert();
      navigate("/checkout", { state: { cartItems, cartTotal } });
      setIsProcessing(false);
    }, 500);
  };

  const handleDecrement = async (item) => {
    setUpdatingQuantity(item.id);
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
      showSuccessAlert('Updated', `Reduced ${item.Name || item.name} quantity`, 1000);
    } else {
      await handleRemove(item.id);
    }
    setTimeout(() => setUpdatingQuantity(null), 300);
  };

  const handleIncrement = (item) => {
    setUpdatingQuantity(item.id);
    updateQuantity(item.id, item.quantity + 1);
    showSuccessAlert('Updated', `Increased ${item.Name || item.name} quantity`, 1000);
    setTimeout(() => setUpdatingQuantity(null), 300);
  };

  const handleRemove = async (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    
    setRemovingItem(itemId);
    
    showLoadingAlert('Removing Item', 'Removing from cart...');
    
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItem(null);
      closeAlert();
      showSuccessAlert(
        'Item Removed', 
        `${item.Name || item.name} has been removed from your cart.`,
        1500
      );
    }, 500);
  };

  const handleClearCart = async () => {
    const result = await showConfirmAlert(
      'Clear Cart?',
      'This will remove all items from your cart. This action cannot be undone.',
      'Yes, Clear All',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      setIsClearing(true);
      showLoadingAlert('Clearing Cart', 'Removing all items...');
      
      setTimeout(() => {
        clearCart();
        setIsClearing(false);
        closeAlert();
        showSuccessAlert(
          'Cart Cleared!',
          'All items have been removed from your cart.',
          2000
        );
      }, 800);
    }
  };

  const CartItemSkeleton = () => (
    <section className="perfume-in-cart skeleton-cart-item">
      <div className="top">
        <div className="cart-left">
          <div className="skeleton-image"></div>
          <div className="left-detail">
            <div className="skeleton-title"></div>
            <div className="skeleton-brand"></div>
          </div>
        </div>
        <div className="cart-right">
          <div className="skeleton-price"></div>
        </div>
      </div>
      <div className="bottom">
        <div className="remove skeleton-button"></div>
        <div className="counter">
          <div className="skeleton-counter-minus"></div>
          <div className="skeleton-counter-value"></div>
          <div className="skeleton-counter-plus"></div>
        </div>
      </div>
      <div className="skeleton-divider"></div>
    </section>
  );

  if (loading) {
    return (
      <div className='component'>
        <div className="cart-loading">
          <div className="cart-loader"></div>
          <p>Loading your cart...</p>
        </div>
        <div className="cart-skeleton-container">
          {[1, 2, 3].map(i => (
            <CartItemSkeleton key={i} />
          ))}
          <div className="cart-total-skeleton">
            <div className="total-actions-skeleton">
              <div className="skeleton-clear-btn"></div>
              <div className="skeleton-total-text"></div>
            </div>
            <div className="skeleton-checkout-btn"></div>
          </div>
        </div>
      </div>
    );
  }

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
                loading="lazy"
                className='cart-perfume'
                width="150"
                height="150"
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
            <div 
              className={`remove ${removingItem === item.id ? 'removing' : ''}`} 
              onClick={() => handleRemove(item.id)}
            >
              {removingItem === item.id ? (
                <>
                  <div className="removing-loader"></div>
                  <p>Removing...</p>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className='trash'/>
                  <p>Remove</p>
                </>
              )}
            </div>
            <div className="counter">
              <button 
                className="counter-btn minus-btn"
                onClick={() => handleDecrement(item)}
                disabled={updatingQuantity === item.id}
              >
                {updatingQuantity === item.id ? (
                  <div className="counter-loader"></div>
                ) : (
                  <FontAwesomeIcon icon={faMinus} />
                )}
              </button>
              <p><strong>{item.quantity}</strong></p>
              <button 
                className="counter-btn plus-btn"
                onClick={() => handleIncrement(item)}
                disabled={updatingQuantity === item.id}
              >
                {updatingQuantity === item.id ? (
                  <div className="counter-loader"></div>
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
              </button>
            </div>
          </div>
          <hr />
        </section>
      ))}
      
      <section className='cart-total'>
        <div className="total-actions">
          <button 
            className='clear-cart' 
            onClick={handleClearCart}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <span className="button-loader"></span>
                Clearing...
              </>
            ) : 'Clear Cart'}
          </button>
          <p><strong>Total: </strong>₦{cartTotal.toLocaleString()}</p>
        </div>
        <button 
          className='checkout' 
          onClick={moveToCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="button-loader"></span>
              Processing...
            </>
          ) : 'Proceed to Checkout'}
        </button>
      </section>
    </div>
  );
};

export default Cart;