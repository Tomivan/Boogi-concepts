import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import './footer.component.css'; 

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return(
        <div className='footer'>
            <div className="footer-left">   
                <h3>Contact Us</h3>
                <p>1A Yinusa Adeniji Street Muslim Avenue Lagos Ikeja</p>
                <p>Email: okwuchidavida@gmail.com </p>
                <div className="social-media">
                    <Link to="https://wa.me/07068899614" target='_blank'>
                        <FontAwesomeIcon icon={faWhatsapp} className='social-icon' />
                    </Link>
                    <Link to="https://www.instagram.com/boogi_noire/" target='_blank'>
                        <FontAwesomeIcon icon={faInstagram} className='social-icon' />
                    </Link>
                    <Link to="https://wa.me/07068899614" target='_blank'>
                        <FontAwesomeIcon icon={faTwitter} className='social-icon' />
                    </Link>
                </div>
            </div>
            <div className="footer-right">
                <p>&#169; Copyright {currentYear}, Boogi-Noire Perfumes. All rights reserved</p>
            </div>
        </div>
    )
}

export default Footer;