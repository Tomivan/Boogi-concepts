import React from 'react';
import Perfume from '../../assets/images/perfume.jpg';
import './product-details.component.css';

const ProductDetails = () => {
    return(
        <div className="product-details">
            <img src={Perfume} alt='a bottle of perfume' />
            <div className="details">
                <p><strong className='name'>Antonio Banderas</strong></p>
                <p>Brand: Antonio Banderas</p>
                <p><strong>&#8358; 35000</strong></p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                <button className='add-to-cart'>Add to Cart</button>
            </div>
        </div>
    )
}

export default ProductDetails;