import React from 'react';
import { useCart } from '../../context/CartContext';
import Perfume from '../../assets/images/perfume.jpg';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './product-grid.component.css';

// Define your products array
const products = [
  {
    id: 1,
    name: 'Antonio Banderas',
    price: 35000,
    image: Perfume
  },
  {
    id: 2,
    name: 'Chanel No. 5',
    price: 45000,
    image: Perfume
  },
  {
    id: 3,
    name: 'Dior Sauvage',
    price: 55000,
    image: Perfume
  },
  {
    id: 4,
    name: 'Versace Eros',
    price: 40000,
    image: Perfume
  }
];

const ProductGrid = () => {
  // Destructure addToCart from useCart
  const { addToCart } = useCart();

  return (
    <div className='perfumes grid'>
      {products.map(product => (
        <div className="perfume" key={product.id}>
          <img src={product.image} alt={product.name} />
          <p>{product.name}</p>
          <p>&#8358; {product.price.toLocaleString()}</p>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;