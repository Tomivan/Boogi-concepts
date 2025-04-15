import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PaystackButton } from 'react-paystack';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './delivery.component.css';

const LOCAL_GOV_SHIPPING_FEES = {
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
};

const Delivery = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
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

  const calculateShippingFee = (lga) => {
    if (!lga) return 0;
    const matchedKey = Object.keys(LOCAL_GOV_SHIPPING_FEES).find(key => 
      key.toLowerCase().includes(lga.toLowerCase())
    );
    return matchedKey ? LOCAL_GOV_SHIPPING_FEES[matchedKey] : LOCAL_GOV_SHIPPING_FEES.default;
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
      console.log("Attempting to call Cloud Function...");
      const sendOrderConfirmation = httpsCallable(functions, 'sendOrderConfirmation');
      
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        total: cartTotal + shippingFee,
        transactionId: transaction.reference
      };

      const result = await sendOrderConfirmation({ orderData });
      
      clearCart();
      navigate('/order-completed', { 
        state: {
          cartItems: result.items,
          cartTotal: result.amount,
          orderId: result.orderId,
          shippingAddress: result.shippingAddress
        }
      });
    } catch (error) {
      console.error('Order processing failed:', error);
      // Payment succeeded but order processing failed
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

  return (
    <div className="component">
        <div className="logo">
            <span className='logo-purple'>BOGI</span>
            <span className='logo-gold'>NOIR</span>
        </div>
      <h1 className='billing-heading'>Billing Details</h1>
      <div className="delivery">
        <form className="delivery-form" onSubmit={(e) => e.preventDefault()}>
          <div className="flex">
            <div className="column">
              <label>First Name</label>
              <input 
                type='text' 
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="column">
              <label>Last name</label>
              <input 
                type='text' 
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
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
            <label>Local Government Area*</label>
            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              required
            >
              <option value="">Select your area</option>
              <option value="Abule egba, iyana ipaja, ikotun, igando, lasu, agege, berger, ketu">
                Abule Egba, Iyana Ipaja, Ikotun, Igando, LASU, Agege, Berger, Ketu
              </option>
              <option value="Maruwa, Lekki, Ikate, Chisco">
                Maruwa, Lekki, Ikate, Chisco
              </option>
              <option value="Iyanaworo, Gbagada, Bariga">
                Iyanaworo, Gbagada, Bariga
              </option>
              <option value="Mushin, Oshodi, Yaba, Surulere, Illupeju, Maryland, Ikeja">
                Mushin, Oshodi, Yaba, Surulere, Illupeju, Maryland, Ikeja
              </option>
              <option value="Sangotedo, Abraham Adesanya, Ogombo, Ibeju Lekki">
                Sangotedo, Abraham Adesanya, Ogombo, Ibeju Lekki
              </option>
              <option value="Osapa, Agungi, Jakande, Ilasan, Salem">
                Osapa, Agungi, Jakande, Ilasan, Salem
              </option>
              <option value="Ajah">Ajah</option>
              <option value="Victoria Island">Victoria Island</option>
              <option value="Ikota, Oral Estate, Eleganza, VGC, Chevron, Orchid, Egbon">
                Ikota, Oral Estate, Eleganza, VGC, Chevron, Orchid, Egbon
              </option>
            </select>
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
            disabled={!formData.email || !formData.lga || cartItems.length === 0 || isProcessing}
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
            <span>₦{shippingFee.toLocaleString()}</span>
          </div>
          <hr />
          <div className="total">
            <span>Total</span>
            <span>₦{(cartTotal + shippingFee).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;