import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './contact-us.component.css';

const ContactUs = () => {
    return(
        <div className="contact-us">
            <p>Contact us:</p>
            <Link to="https://wa.me/2347068899614" target='_blank'>
                <FaWhatsapp className='whatsapp-icon' size={50} />
            </Link>
        </div>
    )
}

export default ContactUs;