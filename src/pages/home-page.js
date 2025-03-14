import React from 'react';
import Navbar from '../components/navbar/navbar.component';
import HeroSection from '../components/hero-section/hero-section.component';

const Home = () => {
    return(
        <div className='component'>
            <Navbar />
            <HeroSection />
        </div>
    )
}

export default Home;