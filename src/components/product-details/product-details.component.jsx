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
      <img src={product.ImageUrl} alt={`a bottle of ${product.Name}`} />
      <div className="details">
        <p><strong className='name'>{product.Name}</strong></p>
        <p>Brand: {product['Brand Name'] || product.Brand || 'No brand specified'}</p>
        <p><strong>&#8358; {product.Price.toLocaleString()}</strong></p>
        <p>{product.Description}</p>
        <button className='add-to-cart' onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  )
}

export default ProductDetails;