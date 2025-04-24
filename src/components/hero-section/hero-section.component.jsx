import React from 'react';
import Background from '../../assets/images/background.jpeg';
import Background1 from '../../assets/images/background-1.jpeg';
import Background2 from '../../assets/images/background-2.jpeg';
import Background3 from '../../assets/images/background-3.jpeg';
import './hero-section.component.css';

const HeroSection = () => {
    return(
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div className="carousel-item active">
                    <img src={Background} className="d-block width" alt="..." />
                </div>
                <div className="carousel-item">
                    <img src={Background1} className="d-block width" alt="..." />
                </div>
                <div className="carousel-item">
                    <img src={Background2} className="d-block width" alt="..." />
                </div>
                <div class="carousel-item">
                    <img src={Background3} className="d-block width" alt="..." />
                </div>
            </div>
            <a role='button' className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </a>
            <a role='button' className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </a>
            <div className="content">
                <h2>Discover the Essence of Elegance</h2>
                <button className='shop-now'>Shop Now</button>
            </div>
        </div> 
    )
}

export default HeroSection;