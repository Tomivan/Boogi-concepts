import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import EditPerfumeForm from '../edit-component/edit-perfume.component';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showLoadingAlert,
  showConfirmAlert,
  closeAlert 
} from '../../utils/alert';
import './product-grid.component.css';

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const PRODUCTS_PER_PAGE = 40;

const ProductGrid = ({ genderFilter, brandFilter, searchTerm }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  
  const { currentUser } = useAuth(); 
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  // Loader Components
  const Loader = ({ size = 'small', inline = false }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''}`}>
      <div className="loader-spinner"></div>
    </div>
  );

  const ProductSkeleton = () => (
    <div className="perfume skeleton-perfume">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-button"></div>
          {isAdmin && <div className="skeleton-button small"></div>}
        </div>
      </div>
    </div>
  );

  // Fetch all products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        showLoadingAlert('Loading', 'Fetching products...');
        
        let productsQuery = collection(db, 'products');

        if (genderFilter) {
          productsQuery = query(
            productsQuery,
            where('Gender', 'in', genderFilter)
          );
        }

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
        setError(null);
        closeAlert();
      } catch (err) {
        console.error('Error fetching products:', err);
        closeAlert();
        showErrorAlert(
          'Load Failed', 
          'Failed to load products. Please check your connection and try again.'
        );
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [genderFilter, brandFilter]);

  useEffect(() => {
    setFiltering(true);
    
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
    
    setPage(1);
    
    // Small delay to show filtering animation
    const timer = setTimeout(() => setFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, allProducts]);

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

  const handleAddToCart = async (product) => {
    if (addingToCart === product.id) return;
    
    setAddingToCart(product.id);
    showLoadingAlert('Adding to Cart', `Adding ${product.Name} to your cart...`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async
      addToCart(product);
      
      closeAlert();
      showSuccessAlert(
        'Added to Cart!',
        `${product.Name} has been added to your shopping cart.`,
        1500
      );
    } catch (error) {
      closeAlert();
      showErrorAlert(
        'Add Failed',
        `Failed to add ${product.Name} to cart. Please try again.`
      );
    } finally {
      setTimeout(() => setAddingToCart(null), 300);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      showLoadingAlert('Updating', `Saving changes to ${updatedProduct.Name}...`);
      
      // Update in Firebase
      const productRef = doc(db, 'products', updatedProduct.id);
      await updateDoc(productRef, updatedProduct);
      
      // Update local state
      setAllProducts(allProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));
      
      closeAlert();
      showSuccessAlert(
        'Product Updated!',
        `${updatedProduct.Name} has been updated successfully.`,
        1500
      );
      
      setShowEditForm(false);
    } catch (err) {
      closeAlert();
      console.error('Error updating product:', err);
      showErrorAlert('Update Failed', 'Failed to update product. Please try again.');
    }
  };

  const redirectToProductDetail = (product) => {
    navigate("/product-details", { state: { product } });
  };

  const handleAddNew = async (newProduct) => {
    try {
      showLoadingAlert('Adding Product', `Creating ${newProduct.Name}...`);
      
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      // Update local state with the new ID from Firebase
      const addedProduct = { ...newProduct, id: docRef.id };
      setAllProducts([...allProducts, addedProduct]);
      
      closeAlert();
      showSuccessAlert(
        'Product Added!',
        `${newProduct.Name} has been added to the catalog successfully.`,
        1500
      );
      
      setShowEditForm(false);
      
      // Go to last page where the new product appears
      const newTotalPages = Math.ceil((allProducts.length + 1) / PRODUCTS_PER_PAGE);
      setPage(newTotalPages);
    } catch (err) {
      closeAlert();
      console.error('Error adding product:', err);
      showErrorAlert('Add Failed', 'Failed to add product. Please try again.');
    }
  };

  const handleAddNewProduct = () => {
    const result = showConfirmAlert(
      'Add New Perfume',
      'This will open the perfume editor. Do you want to continue?',
      'Yes, Continue',
      'Cancel'
    );
    
    result.then((confirmed) => {
      if (confirmed.isConfirmed) {
        setEditingProduct(null);
        setShowEditForm(true);
      }
    });
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageJump = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className='product-management'>
        <div className='perfumes grid'>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
        <div className="loading-overlay">
          <Loader size="large" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Products</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='product-management'>
      {isAdmin && (
        <button 
          className="add-product-button"
          onClick={handleAddNewProduct}
          disabled={filtering}
        >
          + Add New Perfume
        </button>
      )}

      {filtering && (
        <div className="filtering-overlay">
          <Loader size="medium" />
          <p>Filtering products...</p>
        </div>
      )}

      <div className='perfumes grid'>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <div className="perfume" key={product.id}>
              <img 
                src={product.ImageUrl || product.image} 
                alt={product.Name}  
                onClick={() => redirectToProductDetail(product)}
                loading="lazy"
                width="150"
                height="150"
              />
              <p>{product.Name}</p>
              <p>&#8358; {product.Price.toLocaleString()}</p>
              <div className="buttons">
                <button 
                  className="add-to-cart"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === product.id || filtering}
                >
                  {addingToCart === product.id ? (
                    <>
                      <span className="button-loader"></span>
                      Adding...
                    </>
                  ) : 'Add to Cart'}
                </button>
                {isAdmin && (
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(product)}
                    aria-label={`Edit ${product.Name}`}
                    disabled={filtering}
                  >
                    <FontAwesomeIcon icon={faPencil} className='edit-icon' />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {filteredProducts.length > 0 && (
        <>
          <div className="pagination-info">
            {filtering ? (
              <>
                <Loader inline />
                <span>Filtering...</span>
              </>
            ) : (
              `Showing ${(page - 1) * PRODUCTS_PER_PAGE + 1} - ${Math.min(page * PRODUCTS_PER_PAGE, filteredProducts.length)} of ${filteredProducts.length} products`
            )}
          </div>

          {filteredProducts.length > PRODUCTS_PER_PAGE && (
            <div className="pagination-controls">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1 || filtering}
                className="pagination-button"
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(pageNum => 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  )
                  .map((pageNum, index, array) => {
                    const showEllipsis = index < array.length - 1 && array[index + 1] !== pageNum + 1;
                    return (
                      <div key={pageNum} className="page-number-group">
                        <button
                          onClick={() => handlePageJump(pageNum)}
                          className={`page-button ${page === pageNum ? 'active' : ''}`}
                          disabled={filtering}
                        >
                          {pageNum}
                        </button>
                        {showEllipsis && <span className="page-ellipsis">...</span>}
                      </div>
                    );
                  })
                }
              </div>
              
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages || filtering}
                className="pagination-button"
              >
                Next <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
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