import React from 'react';
import Perfume from '../../assets/images/perfume.jpg';
import './product-grid.component.css';

const ProductGrid = () => {
    return(
        <div className='perfumes grid'>
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