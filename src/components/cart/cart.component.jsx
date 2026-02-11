import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore'; 
import { selectCartTotal } from '../../store/cartStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { 
  showSuccessAlert,
  showConfirmAlert
} from '../../utils/alert';
import './cart.component.css';

const Cart = () => {
  const navigate = useNavigate();
  
  const cartItems = useCartStore((state) => state.cartItems);
  const cartTotal = useCartStore(selectCartTotal);
  const loading = useCartStore((state) => state.loading);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);
  const [showCheckoutLoader, setShowCheckoutLoader] = useState(false);
  const [showRemoveLoader, setShowRemoveLoader] = useState(false);
  const [showClearLoader, setShowClearLoader] = useState(false);

  const goToHomepage = () => navigate("/");
  
  const moveToCheckout = () => {
    setIsProcessing(true);
    setShowCheckoutLoader(true);
    
    setTimeout(() => {
      setShowCheckoutLoader(false);
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
    setShowRemoveLoader(true);
    
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItem(null);
      setShowRemoveLoader(false);
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
      setShowClearLoader(true);
      
      setTimeout(() => {
        clearCart();
        setIsClearing(false);
        setShowClearLoader(false);
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

  return (
    <div className='component'>

      {showCheckoutLoader && (
        <div className="cart-overlay-loader">
          <div className="cart-overlay-container">
            <div className="cart-overlay-spinner"></div>
            <p>Preparing checkout...</p>
          </div>
        </div>
      )}

      {showRemoveLoader && (
        <div className="cart-overlay-loader">
          <div className="cart-overlay-container">
            <div className="cart-overlay-spinner"></div>
            <p>Removing item...</p>
          </div>
        </div>
      )}

      {showClearLoader && (
        <div className="cart-overlay-loader">
          <div className="cart-overlay-container">
            <div className="cart-overlay-spinner"></div>
            <p>Clearing cart...</p>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty">
          <FontAwesomeIcon icon={faCartPlus} className='cart' />
          <p>Your cart is empty</p>
          <button className='start-shopping' onClick={goToHomepage}>
            Shop for Perfumes
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Cart;