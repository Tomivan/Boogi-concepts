import React from 'react';
import { useCart } from '../../context/CartContext';
import { showSuccessAlert } from '../../utils/alert';
import Perfume from '../../assets/images/perfume.jpg';
import './product-grid.component.css';

const ProductGrid = () => {
    const addToCart = useCart();

    return(
        <div className='perfumes grid'>
            <div className="perfume">
                <img src={Perfume} alt='a bottle of perfume' />
                <p>Antonio Banderas</p>
                <p>&#8358; 35,000</p>
                <button onClick={() => addToCart()}>Add to Cart</button>
            </div>
            <div className="perfume">
                <img src={Perfume} alt='a bottle of perfume' />
                <p>Antonio Banderas</p>
                <p>&#8358; 35,000</p>
                <button>Add to Cart</button>
            </div>
            <div className="perfume">
                <img src={Perfume} alt='a bottle of perfume' />
                <p>Antonio Banderas</p>
                <p>&#8358; 35,000</p>
                <button>Add to Cart</button>
            </div>
            <div className="perfume">
                <img src={Perfume} alt='a bottle of perfume' />
                <p>Antonio Banderas</p>
                <p>&#8358; 35,000</p>
                <button>Add to Cart</button>
            </div>
        </div>
    )
}

export default ProductGrid;