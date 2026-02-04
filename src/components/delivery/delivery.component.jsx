import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import { PaystackButton } from 'react-paystack';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showLoadingAlert, 
  closeAlert 
} from '../../utils/alert';
import './delivery.component.css';

const Delivery = () => {
  const navigate = useNavigate();
  
  const { 
    cartItems, 
    cartTotal, 
    clearCart, 
    loading: cartLoading 
  } = useCartStore((state) => ({
    cartItems: state.cartItems,
    cartTotal: state.cartTotal,
    clearCart: state.clearCart,
    loading: state.loading
  }));
  
  const { isAdmin } = useAuth();
  const functions = getFunctions();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: 'Lagos',
    lga: '',
    phone: '',
    email: '',
    instructions: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFees, setShippingFees] = useState({});
  const [loadingFees, setLoadingFees] = useState(true);

  // Fetch shipping fees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'shippingFees'), (doc) => {
      if (doc.exists()) {
        setShippingFees(doc.data().areas || {});
      } else {
        // Fallback to default fees if not configured
        setShippingFees({
          'abule egba, iyana ipaja, ikotun, igando, lasu, agege, berger, ketu': 5000,
          'maruwa, lekki, ikate, chisco': 7000,
          'iyanaworo, gbagada, bariga': 5000,
          'mushin, oshodi, yaba, surulere, illupeju, maryland, ikeja': 4500,
          'sangotedo, abraham adesanya, ogombo, ibeju lekki': 10000,
          'osapa, agungi, jakande, ilasan, salem': 7500,
          'ajah': 9000,
          'victoria island': 6500,
          'ikota, oral estate, eleganza, vgc, chevron, orchid, egbon': 8000,
          'default': 5000
        });
      }
      setLoadingFees(false);
    }, (error) => {
      setLoadingFees(false);
      showErrorAlert(
        'Shipping Error', 
        'Failed to load shipping fees. Using default rates.'
      );
    });

    return () => unsubscribe();
  }, []);

  const calculateShippingFee = (lga) => {
    if (!lga || loadingFees) return 0;
    const matchedKey = Object.keys(shippingFees).find(key => 
      key.toLowerCase().includes(lga.toLowerCase())
    );
    return matchedKey ? shippingFees[matchedKey] : (shippingFees.default || 5000);
  };

  const redirectToHomepage = () => {
    navigate("/");
  };

  const shippingFee = calculateShippingFee(formData.lga);
  const grandTotal = (cartTotal + shippingFee) * 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processOrder = async (transaction) => {
    setIsProcessing(true);
    showLoadingAlert('Processing Order', 'Please wait while we confirm your payment...');
    
    try {
      const sendOrderConfirmation = httpsCallable(functions, 'sendOrderConfirmation');
      
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          name: item.Name || item.name,
          price: item.Price || item.price,
          quantity: item.quantity,
          imageUrl: item.ImageUrl || item.image
        })),
        total: cartTotal + shippingFee,
        transactionId: transaction.reference,
        shippingFee: shippingFee
      };
  
      await sendOrderConfirmation({ orderData });
      
      closeAlert();
      clearCart();
      
      showSuccessAlert(
        'Order Confirmed!', 
        'Your order has been placed successfully.',
        2000
      );

      setTimeout(() => {
        navigate('/order-completed', { 
          state: {
            cartItems: cartItems.map(item => ({
              name: item.Name || item.name,
              price: item.Price || item.price,
              quantity: item.quantity,
              image: item.ImageUrl || item.image
            })),
            cartTotal: cartTotal + shippingFee,
            orderId: transaction.reference,
            shippingAddress: {
              name: `${formData.firstName} ${formData.lastName}`,
              street: formData.address,
              city: formData.city,
              state: formData.state,
              phone: formData.phone
            }
          }
        });
      }, 2200);
      
    } catch (error) {
      closeAlert();
      
      showErrorAlert(
        'Order Confirmation Failed',
        'Payment was successful, but we had trouble confirming your order. Please contact support with your transaction ID.'
      );
      
      setTimeout(() => {
        navigate('/order-completed', { 
          state: { 
            transactionId: transaction.reference,
            error: 'Payment processed but order confirmation failed. Please contact support with your transaction ID.'
          } 
        });
      }, 2500);
    } finally {
      setIsProcessing(false);
    }
  };

  const paystackConfig = {
    email: formData.email,
    amount: grandTotal,
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    text: isProcessing ? "Processing..." : `Pay ₦${(grandTotal / 100).toLocaleString()}`,
    onSuccess: (transaction) => processOrder(transaction),
    onClose: () => {
      showSuccessAlert(
        'Payment Cancelled',
        'You can continue shopping. Your cart items are still saved.',
        2000
      );
    },
    onError: (error) => {
      console.error('Paystack Error:', error);
      showErrorAlert(
        'Payment Failed',
        error.message || 'An unknown error occurred. Please try again.'
      );
    },
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${formData.firstName} ${formData.lastName}`
        },
        {
          display_name: "Delivery Address",
          variable_name: "delivery_address",
          value: formData.address
        }
      ]
    }
  };

  const areaOptions = Object.keys(shippingFees)
    .filter(area => area !== 'default')
    .map(area => (
      <option key={area} value={area}>{area}</option>
    ));

  // Loading components
  const Loader = ({ size = 'small', inline = false }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''}`}>
      <div className="loader-spinner"></div>
    </div>
  );

  // Handle empty cart
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      showErrorAlert(
        'Empty Cart',
        'Your cart is empty. Please add items before checkout.'
      );
      setTimeout(() => navigate('/'), 2000);
    }
  }, [cartItems, cartLoading, navigate]);

  if (cartLoading) {
    return (
      <div className="component">
        <div className="header-section">
          <div className="logo" onClick={redirectToHomepage}>
            <span className='logo-purple'>BOOGI</span>
            <span className='logo-gold'>NOIRE</span>
          </div>
        </div>
        <div className="loading-container full-page-loader">
          <Loader size="large" />
          <p className="loading-text">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component">
      <div className="header-section">
        <div className="logo" onClick={redirectToHomepage}>
          <span className='logo-purple'>BOOGI</span>
          <span className='logo-gold'>NOIRE</span>
        </div>
        {isAdmin && (
          <div className="admin-link">
            <button 
              onClick={() => navigate('/admin/shipping')}
              className="admin-button"
            >
              Admin Panel
            </button>
          </div>
        )}
      </div>
      
      <div className="delivery">
        <form className="delivery-form" onSubmit={(e) => e.preventDefault()}>
          <h1 className='billing-heading'>Billing Details</h1>
          <div className="form-group">
            <label>First Name</label>
            <input 
              type='text' 
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isProcessing}
            />
          </div>
          <div className="form-group">
            <label>Last name</label>
            <input 
              type='text' 
              name='lastName'
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="form-group">
            <label>Street Address*</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter house number and street name"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isProcessing}
              />
            </div>
            <div className="form-group">
              <label>State*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location*</label>
            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              required
              disabled={loadingFees || isProcessing}
              className={loadingFees ? 'loading-select' : ''}
            >
              <option value="">Select your area</option>
              {areaOptions}
            </select>
            {loadingFees && (
              <div className="select-loader">
                <Loader inline />
                <span>Loading shipping options</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="form-group">
            <label>Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="form-group">
            <label>Order Instructions (Optional)</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special delivery instructions"
              disabled={isProcessing}
            />
          </div>
          
          <PaystackButton 
            {...paystackConfig} 
            className={`place-order ${isProcessing ? 'processing' : ''}`}
            disabled={
              !formData.email || 
              !formData.lga || 
              cartItems.length === 0 || 
              isProcessing ||
              loadingFees ||
              cartLoading
            }
          >
            {isProcessing && <Loader inline />}
            {isProcessing ? "Processing..." : `Pay ₦${(grandTotal / 100).toLocaleString()}`}
          </PaystackButton>
        </form>

        <div className="billing-summary">
          <h3>Order Summary</h3>
          <div className="total">
            <span>Items ({cartItems.length})</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="total">
            <span>Shipping ({formData.lga ? 'Selected' : 'Not selected'})</span>
            <span className="shipping-fee">
              {loadingFees ? (
                <>
                  <Loader inline />
                  <span className="loading-label">Calculating</span>
                </>
              ) : (
                `₦${shippingFee.toLocaleString()}`
              )}
            </span>
          </div>
          <hr />
          <div className="total grand-total">
            <span>Total</span>
            <span className="total-amount">
              {loadingFees ? (
                <>
                  <Loader inline />
                  <span className="loading-label">Calculating total</span>
                </>
              ) : (
                `₦${(cartTotal + shippingFee).toLocaleString()}`
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;