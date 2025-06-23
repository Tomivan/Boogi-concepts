import React from 'react';
import Footer from '../components/footer/footer.component';
import ContactForm from '../components/contact-form/contact-form.component';
import NavbarComponent from '../components/navbar/navbar.component';

const Contact = () => {
    return(
        <div>
            <NavbarComponent />
            <ContactForm />
            <Footer />
        </div>
    )
}

export default Contact;