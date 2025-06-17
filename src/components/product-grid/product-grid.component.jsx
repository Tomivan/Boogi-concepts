import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import EditPerfumeForm from '../edit-component/edit-perfume.component';
import './product-grid.component.css';

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const PRODUCTS_PER_PAGE = 40;

const ProductGrid = ({ genderFilter, brandFilter, searchTerm }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  // Fetch all products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let productsQuery = collection(db, 'products');

        // Apply gender filter if provided
        if (genderFilter) {
          productsQuery = query(
            productsQuery,
            where('Gender', 'in', genderFilter)
          );
        }

        // Apply brand filter if provided
        if (brandFilter && brandFilter.length > 0) {
          productsQuery = query(
            productsQuery,
            where('Brand Name', 'in', brandFilter)
          );
        }

        const querySnapshot = await getDocs(productsQuery);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAllProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [genderFilter, brandFilter]);

  // Apply search filter whenever searchTerm or allProducts changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(allProducts);
    } else {
      const term = searchTerm.toLowerCase();
      const results = allProducts.filter(product => {
        return (
          (product.Name && product.Name.toLowerCase().includes(term)) ||
          (product.Description && product.Description.toLowerCase().includes(term)) ||
          (product['Brand Name'] && product['Brand Name'].toLowerCase().includes(term))
        );
      });
      setFilteredProducts(results);
    }
    // Reset to first page when search term changes
    setPage(1);
  }, [searchTerm, allProducts]);

  // Update paginated products when page or filteredProducts changes
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
      const endIdx = startIdx + PRODUCTS_PER_PAGE;
      setPaginatedProducts(filteredProducts.slice(startIdx, endIdx));
      setTotalPages(Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    } else {
      setPaginatedProducts([]);
      setTotalPages(1);
    }
  }, [page, filteredProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      // Update in Firebase
      const productRef = doc(db, 'products', updatedProduct.id);
      await updateDoc(productRef, updatedProduct);
      
      // Update local state
      setAllProducts(allProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    }
  };

  const redirectToProductDetail = (product) => {
        navigate("/product-details", { state: { product } });
    };

  const handleAddNew = async (newProduct) => {
    try {
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      // Update local state with the new ID from Firebase
      const addedProduct = { ...newProduct, id: docRef.id };
      setAllProducts([...allProducts, addedProduct]);
      setShowEditForm(false);
      
      // Go to last page where the new product appears
      const newTotalPages = Math.ceil((allProducts.length + 1) / PRODUCTS_PER_PAGE);
      setPage(newTotalPages);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePageJump = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

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
        {paginatedProducts.map(product => (
          <div className="perfume" key={product.id}>
            <img src={product.ImageUrl || product.image} 
            alt={product.Name}  onClick={() => redirectToProductDetail(product)} />
            <p>{product.Name}</p>
            <p>&#8358; {product.Price.toLocaleString()}</p>
            <div className="buttons">
              <button 
                className="add-to-cart"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
              {isAdmin && (
                <button 
                  className="edit-button"
                  onClick={() => handleEdit(product)}
                >
                  <FontAwesomeIcon icon={faPencil} className='edit-icon' />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-info">
        Showing {(page - 1) * PRODUCTS_PER_PAGE + 1} - 
        {Math.min(page * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
      </div>

      {filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="pagination-controls">
          <button 
            onClick={handlePrevPage} 
            disabled={page === 1}
            className="pagination-button"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageJump(pageNum)}
                className={`page-button ${page === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleNextPage} 
            disabled={page === totalPages}
            className="pagination-button"
          >
            Next <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

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