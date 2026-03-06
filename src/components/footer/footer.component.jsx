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
            <div className="footer-top">
                <div className="footer-left">   
                    <h3>Fragrances</h3>
                    <Link to="/men" className='footer-link'><p> Men </p></Link>
                    <Link to="/women" className='footer-link'><p>Women</p></Link>
                </div>
                <div className="footer-middle">
                    <h3>Customer Support</h3>
                    <Link to="/contact-us" className="footer-link"><p>Contact Form</p></Link>
                    <p> +2347068899614</p>
                    <p>+2348137551483</p>
                </div>
                <div className="footer-right">
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
                <div className="footer-subscribe">
                    <h3>BoogiTips & Trends</h3>
                    <p>Join our exclusive community to <br /> enjoy latest updates on niche fragrance, <br/> skincare, and makeup brands.</p>
                    <div className="column">
                        <input type='text' placeholder='Enter your email address' />
                        <button className='subscribe'>Subscribe</button>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&#169; Copyright {currentYear}, Boogi-Noire Perfumes. All rights reserved</p>
            </div>
        </div>
    )
}

export default Footer;