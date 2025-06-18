import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  const [submitStatus, setSubmitStatus] = useState(null);

  const redirectToHomepage = () => navigate("/");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const functions = getFunctions();
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
      
      await sendContactEmail({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
    return (
        <div className='component'>
            <div className="logo" onClick={redirectToHomepage}>
                <span className='logo-purple'>BOOGI</span>
                <span className='logo-gold'>NOIRE</span>
            </div>
            <div className="contact">
                <form className="contact-form" onSubmit={handleSubmit}>
                <h1>Contact Form</h1>
                {submitStatus === 'success' && (
                    <div className="success-message">
                    Thank you! Your message has been sent.
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="error-message">
                    Failed to send message. Please try again.
                    </div>
                )}
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
                    <label>Your Message</label>
                    <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any special delivery instructions"
                    />
                </div>
                <button className='add-to-cart' type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
                </form>
            </div>
        </div>
    )
}

export default ContactForm;