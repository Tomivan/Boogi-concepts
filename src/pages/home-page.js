import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import HeroSection from '../components/hero-section/hero-section.component';
import Shop from '../components/shop/shop.component';
import ContactUs from '../components/contact-us/contact-us.component';
import Footer from '../components/footer/footer.component';

const Home = () => {
    return(
        <div className='component'>
            <Navbar />
            <HeroSection />
            <Shop />
            <ContactUs />
            <Footer />
        </div>
    )
}

export default Home;