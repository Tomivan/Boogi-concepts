import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import Perfume from '../../assets/images/perfume.jpg';
import EditPerfumeForm from '../edit-component/edit-perfume.component';
import './product-grid.component.css';

// Initial products data - in a real app, you'd fetch this from Firebase
const initialProducts = [
  {
    id: 1,
    name: 'Antonio Banderas',
    price: 35000,
    image: Perfume,
    description: 'A bold masculine fragrance'
  },
  {
    id: 2,
    name: 'Chanel No. 5',
    price: 45000,
    image: Perfume,
    description: 'Timeless feminine classic'
  },
  {
    id: 3,
    name: 'Dior Sauvage',
    price: 55000,
    image: Perfume,
    description: 'Fresh and woody masculine scent'
  },
  {
    id: 4,
    name: 'Versace Eros',
    price: 40000,
    image: Perfume,
    description: 'Powerful and seductive fragrance'
  }
];

const ProductGrid = () => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  console.log('Current User:', currentUser?.email);
  console.log('Is Admin:', isAdmin);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleUpdate = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    setShowEditForm(false);
    // In a real app, you would update Firebase here
  };

  const handleAddNew = (newProduct) => {
    setProducts([...products, newProduct]);
    setShowEditForm(false);
    // In a real app, you would add to Firebase here
  };

  return (
    <div className='product-management'>
      {isAdmin && (
        <button 
          className="add-product-button"
          onClick={() => {
            setEditingProduct(null);
            setShowEditForm(true);
          }}
        >
          Add New Perfume
        </button>
      )}

      <div className='perfumes grid'>
        {products.map(product => (
          <div className="perfume" key={product.id}>
            <img src={product.image} alt={product.name} />
            <p>{product.name}</p>
            <p>&#8358; {product.price.toLocaleString()}</p>
            <div className="buttons">
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            
            {isAdmin && (
              <button 
                className="edit-button"
                onClick={() => handleEdit(product)}
              >
                <FontAwesomeIcon icon={faPencil} className='edit-icon' />
              </button>
            )}</div>
          </div>
        ))}
      </div>

      {showEditForm && (
        <EditPerfumeForm
          product={editingProduct}
          onSave={editingProduct ? handleUpdate : handleAddNew}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default ProductGrid;

// Admin emails configuration
const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];