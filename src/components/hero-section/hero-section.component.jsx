import Carousel from 'react-bootstrap/Carousel';
import Background from '../../assets/images/background.webp';
import Background1 from '../../assets/images/background-1.webp';
import Background2 from '../../assets/images/background-2.webp';
import Background3 from '../../assets/images/background-3.webp';
import Background5 from '../../assets/images/background-5.webp';
import './hero-section.component.css';

const HeroSection = () => {
    return(
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <Carousel fade>
                    <Carousel.Item>
                        <img src={Background} alt='a white perfume in a white background' loading="lazy" className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background1} alt='a red perfume in a red background' loading="lazy" className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background2} alt='a woman with the eiffel tower background' loading="lazy" className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background3} alt='a perfume bottle with a nightclub background' loading="lazy" className="width" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={Background5} alt='a black perfume in a black background' className="width" />
                    </Carousel.Item>
                </Carousel>
            </div>
            <div className="content">
                <h2>Discover the Essence of Elegance</h2>
                <p className='white'>Experience the exclusivity of boogi-noire's handcrafted fragrances <br />with gold-standard luxury.
                    Designed for those who leave <br/> an impression.
                </p>
            </div>
        </div> 
    )
}

export default HeroSection;