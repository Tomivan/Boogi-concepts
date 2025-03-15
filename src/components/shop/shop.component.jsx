import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Perfume from '../../assets/images/perfume.jpg';
import './shop.component.css';

const Shop = () => {
    const navigate = useNavigate();
    const redirectToProductDetail = () => {
       navigate("/product-details");
    }
    return(
        <div className="shop">
            <section className="section">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                <div className="perfumes">
                    <div className="perfume" onClick={redirectToProductDetail}>
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="heading">
                    <h2>Women's Perfume</h2>
                    <Link to='/women' className='link'>View all</Link>
                </div>
                <div className="perfumes">
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                    <div className="perfume">
                        <img src={Perfume} alt='a bottle of perfume' />
                        <p>Antonio Banderas</p>
                        <p>&#8358; 35,000</p>
                        <button className='add-to-cart'>Add to Cart</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Shop 