import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import HeroSection from '../components/hero-section/hero-section.component';
import Shop from '../components/shop/shop.component';

const Home = () => {
    return(
        <div className='component'>
            <Navbar />
            <HeroSection />
            <Shop />
        </div>
    )
}

export default Home;