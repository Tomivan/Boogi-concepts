import { useState, useEffect, useRef } from 'react';
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
  showConfirmAlert
} from '../../utils/alert';
import './product-grid.component.css';

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const PRODUCTS_PER_PAGE = 40;
const PRODUCTS_CACHE_TTL = 24 * 60 * 60 * 1000;

// Simple cache manager
const createCacheManager = () => {
  let cache = {
    data: null,
    timestamp: null,
    filters: null,
    isValid: false
  };

  const isCacheValid = (currentFilters) => {
    if (!cache.timestamp || !cache.isValid) return false;
    
    const cacheAge = Date.now() - cache.timestamp;
    if (cacheAge > PRODUCTS_CACHE_TTL) return false;
    
    if (currentFilters) {
      const cachedFilters = JSON.stringify(cache.filters);
      const currentFiltersStr = JSON.stringify(currentFilters);
      return cachedFilters === currentFiltersStr;
    }
    
    return true;
  };

  const getCachedData = (currentFilters) => {
    if (isCacheValid(currentFilters)) {
      return cache.data;
    }
    return null;
  };

  const setCacheData = (data, filters = null) => {
    cache = {
      data,
      timestamp: Date.now(),
      filters,
      isValid: true
    };
  };

  const invalidateCache = () => {
    cache.isValid = false;
  };

  return {
    getCachedData,
    setCacheData,
    invalidateCache,
    isCacheValid
  };
};

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
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  
  // Create cache manager instance
  const cacheManagerRef = useRef(null);
  if (!cacheManagerRef.current) {
    cacheManagerRef.current = createCacheManager();
  }
  const cacheManager = cacheManagerRef.current;

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  // Build filter object for cache key
  const getCurrentFilters = () => {
    return {
      genderFilter,
      brandFilter: brandFilter ? [...brandFilter].sort() : null
    };
  };

  // Fetch all products from Firestore with caching
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const currentFilters = getCurrentFilters();
        const cachedData = cacheManager.getCachedData(currentFilters);
        
        if (cachedData) {
          setAllProducts(cachedData);
          setLoading(false);
          return;
        }
        
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

        // Cache the results
        cacheManager.setCacheData(productsData, currentFilters);
        
        setAllProducts(productsData);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching products:', err);
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

  // Filter products based on search term
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
    
    const timer = setTimeout(() => setFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, allProducts]);

  // Pagination logic
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
    
    try {
      addToCart(product);
      
      showSuccessAlert(
        'Added to Cart!',
        `${product.Name} has been added to your shopping cart.`,
        1500
      );
    } catch (error) {
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
      setActionLoading(true);
      
      // Update in Firebase
      const productRef = doc(db, 'products', updatedProduct.id);
      await updateDoc(productRef, updatedProduct);
      
      // Update local state
      const updatedProducts = allProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      );
      setAllProducts(updatedProducts);
      
      // Invalidate cache since we modified a product
      cacheManager.invalidateCache();
      
      setActionLoading(false);
      showSuccessAlert(
        'Product Updated!',
        `${updatedProduct.Name} has been updated successfully.`,
        1500
      );
      
      setShowEditForm(false);
    } catch (err) {
      setActionLoading(false);
      console.error('Error updating product:', err);
      showErrorAlert('Update Failed', 'Failed to update product. Please try again.');
    }
  };

  const redirectToProductDetail = (product) => {
    navigate("/product-details", { state: { product } });
  };

  const handleAddNew = async (newProduct) => {
    try {
      setActionLoading(true);
      
      // Add to Firebase
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      // Update local state with the new ID from Firebase
      const addedProduct = { ...newProduct, id: docRef.id };
      const updatedProducts = [...allProducts, addedProduct];
      setAllProducts(updatedProducts);
      
      // Invalidate cache since we added a product
      cacheManager.invalidateCache();
      
      setActionLoading(false);
      showSuccessAlert(
        'Product Added!',
        `${newProduct.Name} has been added to the catalog successfully.`,
        1500
      );
      
      setShowEditForm(false);
      
      // Go to last page where the new product appears
      const newTotalPages = Math.ceil(updatedProducts.length / PRODUCTS_PER_PAGE);
      setPage(newTotalPages);
    } catch (err) {
      setActionLoading(false);
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

  // Loader Components
  const Loader = ({ size = 'small', inline = false, color = 'primary' }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''} ${color}`}>
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

  // Action Loader Overlay
  const ActionLoaderOverlay = () => (
    <div className="action-loader-overlay">
      <div className="action-loader-container">
        <Loader size="large" />
        <p>Processing...</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='product-management'>
        <div className='perfumes grid'>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
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
      {actionLoading && <ActionLoaderOverlay />}

      {isAdmin && (
        <button 
          className="add-product-button"
          onClick={handleAddNewProduct}
          disabled={filtering || actionLoading}
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
                  disabled={addingToCart === product.id || filtering || actionLoading}
                >
                  {addingToCart === product.id ? (
                    <>
                      <Loader inline size="small" color="light" />
                      Adding...
                    </>
                  ) : 'Add to Cart'}
                </button>
                {isAdmin && (
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(product)}
                    aria-label={`Edit ${product.Name}`}
                    disabled={filtering || actionLoading}
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
                disabled={page === 1 || filtering || actionLoading}
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
                          disabled={filtering || actionLoading}
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
                disabled={page === totalPages || filtering || actionLoading}
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