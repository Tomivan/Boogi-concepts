import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import './contact-us.component.css';

const ContactUs = () => {
    return(
        <div className="contact-us">
            <p>Contact us:</p>
            <Link to="https://wa.me/08137551483" target='_blank'>
                <FontAwesomeIcon icon={faWhatsapp} className='whatsapp-icon' />
            </Link>
        </div>
    )
}

export default ContactUs;