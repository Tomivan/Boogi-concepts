import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './product-details.component.css';

const ProductDetails = () => {
  const { state } = useLocation();
  const product = state?.product;

  const { addToCart } = useCart();

  if (!product) {
    return <div>Product not found</div>;
  }

  return(
    <div className="product-details">
      <img src={product.image} alt={`a bottle of ${product.name}`} />
      <div className="details">
        <p><strong className='name'>{product.name}</strong></p>
        <p>Brand: {product.brand}</p>
        <p><strong>&#8358; {product.price.toLocaleString()}</strong></p>
        <p>{product.description}</p>
        <button className='add-to-cart' onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  )
}

export default ProductDetails;