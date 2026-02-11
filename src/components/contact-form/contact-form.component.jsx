import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
  showSuccessAlert, 
  showErrorAlert
} from '../../utils/alert';
import './contact-form.component.css';

const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: ''
    });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSendingLoader, setShowSendingLoader] = useState(false);

  const redirectToHomepage = () => navigate("/");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setShowSendingLoader(true);

    try {
      const functions = getFunctions();
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
      
      await sendContactEmail({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      setShowSendingLoader(false);
      showSuccessAlert(
        'Message Sent!', 
        'Thank you for contacting us. We\'ll get back to you soon.',
        3000
      );
      
      setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' });
      
      setTimeout(() => {
        navigate('/');
      }, 3500);
      
    } catch (error) {
      setShowSendingLoader(false);
      showErrorAlert(
        'Message Failed', 
        'We couldn\'t send your message. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
    return (
        <div className='component'>

            {showSendingLoader && (
              <div className="contact-overlay-loader">
                <div className="contact-overlay-container">
                  <div className="contact-overlay-spinner"></div>
                  <p>Sending your message...</p>
                </div>
              </div>
            )}
            
            <div className="logo" onClick={redirectToHomepage}>
                <span className='logo-purple'>BOOGI</span>
                <span className='logo-gold'>NOIRE</span>
            </div>
            <div className="contact">
                <form className="contact-form" onSubmit={handleSubmit}>
                <h1>Contact Form</h1>
                
                <div className="form-group">
                    <label>First Name</label>
                    <input 
                    type='text' 
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number*</label>
                    <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label>Your Message</label>
                    <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any special delivery instructions"
                    disabled={isSubmitting}
                    />
                </div>
                <button 
                  className='add-to-cart' 
                  type="submit" 
                  disabled={isSubmitting}
                >
                    {isSubmitting ? (
                      <>
                        <span className="button-loader"></span>
                        Sending...
                      </>
                    ) : 'Submit'}
                </button>
                </form>
            </div>
        </div>
    )
}

export default ContactForm;