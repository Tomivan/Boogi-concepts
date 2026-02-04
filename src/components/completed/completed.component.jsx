import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './completed.component.css';

const Completed = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const { 
      cartItems = [], 
      cartTotal = 0, 
      orderId = 'N/A', 
      shippingAddress = {},
      error 
    } = state || {};
  
    // Transform items if they come from different sources
    const normalizedItems = cartItems.map(item => ({
      name: item.name || item.productName || 'Unknown Item',
      price: item.price || item.productPrice || 0,
      quantity: item.quantity || 1,
      image: item.image || item.imageUrl || 'default-image.jpg'
    }));
  
    const goToHomepage = () => navigate("/");
  
    if (error) {
      console.log(error)
      return (
        <div className='completed'>
          <div className="confirmation error">
            <p>Payment Successful but Order Processing Failed</p>
            <p>{error}</p>
            <p>Transaction ID: {orderId}</p>
            <button className='start-shopping' onClick={goToHomepage}>
              Back to shopping
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className='completed'>
        <div className="confirmation">
          <p>Thank you for your order!</p>
          <p>Order #{orderId}</p>
        </div>
        
        <div className="order-details">
          {normalizedItems.map((item, index) => (
            <div className="item" key={index}>
              <img src={item.image} alt={item.name} loading="lazy"className='cart-perfume' width="150" height="150"/>
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
              <p>{shippingAddress.name || `${shippingAddress.firstName} ${shippingAddress.lastName}`}</p>
              <p>{shippingAddress.street || shippingAddress.address}</p>
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