import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Background1 from '../../assets/images/background-1.jpeg';
import Background2 from '../../assets/images/background-2.jpeg';
import Background3 from '../../assets/images/background-3.jpeg';
import './hero-section.component.css';

const HeroSection = () => {
    return(
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <Carousel fade>
                    <Carousel.Item>
                        <img src={Background1} alt='' className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background2} alt='' className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background3} alt='' className="width" />
                    </Carousel.Item>
                </Carousel>
            </div>
            <div className="content">
                <h2>Discover the Essence of Elegance</h2>
            </div>
        </div> 
    )
}

export default HeroSection;