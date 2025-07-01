import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PaystackButton } from 'react-paystack';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './delivery.component.css';

const Delivery = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
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
          'abule egba, iyana ipaja, ikotun, igando, lasu, agege, berger, ketu': 4000,
          'maruwa, lekki, ikate, chisco': 3500,
          'iyanaworo, gbagada, bariga': 3000,
          'mushin, oshodi, yaba, surulere, illupeju, maryland, ikeja': 2500,
          'sangotedo, abraham adesanya, ogombo, ibeju lekki': 5000,
          'osapa, agungi, jakande, ilasan, salem': 3000,
          'ajah': 4000,
          'victoria island': 2500,
          'ikota, oral estate, eleganza, vgc, chevron, orchid, egbon': 5000,
          'default': 5000
        });
      }
      setLoadingFees(false);
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
  const grandTotal = (cartTotal + shippingFee) * 100; // Paystack uses kobo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processOrder = async (transaction) => {
    setIsProcessing(true);
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
      
      clearCart();
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
    } catch (error) {
      console.error('Order processing failed:', error);
      navigate('/order-completed', { 
        state: { 
          transactionId: transaction.reference,
          error: 'Payment processed but order confirmation failed. Please contact support with your transaction ID.'
        } 
      });
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
    onClose: () => console.log('Payment window closed'),
    onError: (error) => {
      console.error('Paystack Error:', error);
      alert(`Payment error: ${error.message || 'Unknown error occurred'}`);
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
              disabled={loadingFees}
            >
              <option value="">Select your area</option>
              {areaOptions}
            </select>
            {loadingFees && <p className="loading-text">Loading shipping options...</p>}
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
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
            />
          </div>

          <div className="form-group">
            <label>Order Instructions (Optional)</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special delivery instructions"
            />
          </div>
          
          <PaystackButton 
            {...paystackConfig} 
            className="place-order"
            disabled={
              !formData.email || 
              !formData.lga || 
              cartItems.length === 0 || 
              isProcessing ||
              loadingFees
            }
          />
        </form>

        <div className="billing-summary">
          <h3>Order Summary</h3>
          <div className="total">
            <span>Items ({cartItems.length})</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="total">
            <span>Shipping ({formData.lga ? 'Selected' : 'Not selected'})</span>
            <span>
              {loadingFees ? 'Loading...' : `₦${shippingFee.toLocaleString()}`}
            </span>
          </div>
          <hr />
          <div className="total">
            <span>Total</span>
            <span>
              {loadingFees ? 'Calculating...' : `₦${(cartTotal + shippingFee).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;