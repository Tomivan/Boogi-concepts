import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, where, limit, orderBy, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaEdit } from 'react-icons/fa';
import { db } from '../../firebase';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmAlert
} from '../../utils/alert';
import './shop.component.css';

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const SHOP_CACHE_TTL = 24 * 60 * 60 * 1000;

const createShopCacheManager = () => {
  let cache = {
    popular: null,
    men: null,
    women: null,
    allProducts: null,
    timestamp: null,
    isValid: false
  };

  const isCacheValid = () => {
    if (!cache.timestamp || !cache.isValid) return false;
    const cacheAge = Date.now() - cache.timestamp;
    return cacheAge < SHOP_CACHE_TTL;
  };

  const getCachedData = (key) => {
    if (isCacheValid()) {
      return cache[key];
    }
    return null;
  };

  const setCacheData = (popular, men, women, allProducts) => {
    cache = {
      popular,
      men,
      women,
      allProducts,
      timestamp: Date.now(),
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

const Shop = () => {
    const [menProducts, setMenProducts] = useState([]);
    const [womenProducts, setWomenProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const { currentUser } = useAuth();

    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
    
    const [currentIndices, setCurrentIndices] = useState({
        popular: 0,
        men: 0,
        women: 0
    });
    
    const [productsPerPage, setProductsPerPage] = useState({
        popular: 4,
        men: 4,
        women: 4
    }); 
    
    const [loading, setLoading] = useState(true);
    const [addingProduct, setAddingProduct] = useState(false);
    const [removingProduct, setRemovingProduct] = useState('');
    const [adminMode, setAdminMode] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    
    const cacheManagerRef = useRef(null);
    if (!cacheManagerRef.current) {
      cacheManagerRef.current = createShopCacheManager();
    }
    const cacheManager = cacheManagerRef.current;

    const nextSlide = (section) => {
        const products = 
            section === 'popular' ? popularProducts : 
            section === 'men' ? menProducts : 
            womenProducts;
            
        if (currentIndices[section] < products.length - productsPerPage[section]) {
            setCurrentIndices(prev => ({
                ...prev,
                [section]: prev[section] + 1
            }));
        }
    };
    
    const prevSlide = (section) => {
        if (currentIndices[section] > 0) {
            setCurrentIndices(prev => ({
                ...prev,
                [section]: prev[section] - 1
            }));
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const newProductsPerPage = {
                popular: window.matchMedia('(max-width: 767px)').matches ? 1 : 
                        window.matchMedia('(min-width: 767px) and (max-width: 1023px)').matches ? 2 : 4,
                men: window.matchMedia('(max-width: 767px)').matches ? 1 : 
                     window.matchMedia('(min-width: 767px) and (max-width: 1023px)').matches ? 2 : 4,
                women: window.matchMedia('(max-width: 767px)').matches ? 1 : 
                       window.matchMedia('(min-width: 767px) and (max-width: 1023px)').matches ? 2 : 4
            };
            
            setProductsPerPage(newProductsPerPage);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                if (cacheManager.isCacheValid()) {
                    const cachedPopular = cacheManager.getCachedData('popular');
                    const cachedMen = cacheManager.getCachedData('men');
                    const cachedWomen = cacheManager.getCachedData('women');
                    const cachedAllProducts = cacheManager.getCachedData('allProducts');
                    
                    if (cachedPopular && cachedMen && cachedWomen && cachedAllProducts) {
                        setPopularProducts(cachedPopular);
                        setMenProducts(cachedMen);
                        setWomenProducts(cachedWomen);
                        setAllProducts(cachedAllProducts);
                        setLoading(false);
                        return;
                    }
                }

                const allProductsQuery = query(collection(db, 'products'));
                const allProductsSnapshot = await getDocs(allProductsQuery);
                const allProductsData = allProductsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllProducts(allProductsData);

                const popularQuery = query(collection(db, 'popularPerfumes'), orderBy('rank'));
                const popularSnapshot = await getDocs(popularQuery);
                const popularData = await Promise.all(
                    popularSnapshot.docs.map(async doc => {
                        const perfumeRef = doc.data().perfumeRef;
                        if (!perfumeRef?.path) return null;
                        const perfumeSnap = await getDoc(perfumeRef);
                        return perfumeSnap.exists() ? { id: perfumeSnap.id, ...perfumeSnap.data() } : null;
                    })
                );
                
                const menQuery = query(collection(db, 'mensPerfume'), orderBy('rank'));
                const menSnapshot = await getDocs(menQuery);
                const menProductsData = await Promise.all(
                    menSnapshot.docs.map(async doc => {
                        const perfumeRef = doc.data().perfumeRef;
                        if (!perfumeRef?.path) return null;
                        const perfumeSnap = await getDoc(perfumeRef);
                        return perfumeSnap.exists() ? { id: perfumeSnap.id, ...perfumeSnap.data() } : null;
                    })
                );
                
                const womenQuery = query(collection(db, 'products'), where('Gender', '==', 'Female'), limit(12));
                const womenSnapshot = await getDocs(womenQuery);
                const womenProductsData = womenSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const filteredPopular = popularData.filter(Boolean);
                const filteredMen = menProductsData.filter(Boolean);
                
                setPopularProducts(filteredPopular);
                setMenProducts(filteredMen);
                setWomenProducts(womenProductsData);
                
                cacheManager.setCacheData(filteredPopular, filteredMen, womenProductsData, allProductsData);
                
                if (isAdmin) {
                    showSuccessAlert('Shop Loaded', 'Products are ready for display.', 1500);
                }
            } catch (error) {
                console.error('Error fetching shop products:', error);
                
                const cachedPopular = cacheManager.getCachedData('popular');
                const cachedMen = cacheManager.getCachedData('men');
                const cachedWomen = cacheManager.getCachedData('women');
                
                if (cachedPopular && cachedMen && cachedWomen) {
                    setPopularProducts(cachedPopular);
                    setMenProducts(cachedMen);
                    setWomenProducts(cachedWomen);
                } else {
                    showErrorAlert('Load Failed', 'Failed to load products. Please refresh the page.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isAdmin]);

    const redirectToProductDetail = (product) => {
        navigate("/product-details", { state: { product } });
    };

    const addToSection = async (section) => {
        if (!selectedProduct) return;
        
        try {
            setAddingProduct(true);
            setActionLoading(true);
            
            const productRef = doc(db, 'products', selectedProduct);
            const rank = section === 'popular' ? popularProducts.length + 1 : 
                         section === 'men' ? menProducts.length + 1 : 
                         womenProducts.length + 1;
            
            // Add to the appropriate collection
            const sectionCollection = 
                section === 'popular' ? 'popularPerfumes' : 
                section === 'men' ? 'mensPerfume' : 
                'womensPerfume';
            
            await setDoc(doc(db, sectionCollection, selectedProduct), {
                perfumeRef: productRef,
                rank: rank
            });
            
            // Refresh the products
            const productSnap = await getDoc(productRef);
            const productData = productSnap.data();
            
            let updatedPopular = [...popularProducts];
            let updatedMen = [...menProducts];
            let updatedWomen = [...womenProducts];
            
            const newProduct = { id: selectedProduct, ...productData };
            
            if (section === 'popular') {
                updatedPopular = [...updatedPopular, newProduct];
                setPopularProducts(updatedPopular);
            } else if (section === 'men') {
                updatedMen = [...updatedMen, newProduct];
                setMenProducts(updatedMen);
            } else {
                updatedWomen = [...updatedWomen, newProduct];
                setWomenProducts(updatedWomen);
            }
            
            // Update cache with new data
            cacheManager.setCacheData(updatedPopular, updatedMen, updatedWomen, allProducts);
            
            setSelectedProduct('');
            
            setActionLoading(false);
            showSuccessAlert(
                'Product Added!', 
                `Product added to ${section} section successfully.`,
                1500
            );
        } catch (error) {
            setActionLoading(false);
            showErrorAlert('Add Failed', 'Failed to add product. Please try again.');
        } finally {
            setAddingProduct(false);
        }
    };

    const removeFromSection = async (section, productId) => {
        const productToRemove = [...popularProducts, ...menProducts, ...womenProducts]
            .find(p => p.id === productId);
        
        if (!productToRemove) return;

        const result = await showConfirmAlert(
            'Remove Product',
            `Are you sure you want to remove "${productToRemove.Name || productToRemove.name}" from ${section} section?`,
            'Yes, Remove',
            'Cancel'
        );
        
        if (!result.isConfirmed) return;
        
        try {
            setRemovingProduct(productId);
            setActionLoading(true);
            
            // Remove from the appropriate collection
            const sectionCollection = 
                section === 'popular' ? 'popularPerfumes' : 
                section === 'men' ? 'mensPerfume' : 
                'womensPerfume';
            
            await deleteDoc(doc(db, sectionCollection, productId));
            
            // Update state
            let updatedPopular = [...popularProducts];
            let updatedMen = [...menProducts];
            let updatedWomen = [...womenProducts];
            
            if (section === 'popular') {
                updatedPopular = updatedPopular.filter(p => p.id !== productId);
                setPopularProducts(updatedPopular);
            } else if (section === 'men') {
                updatedMen = updatedMen.filter(p => p.id !== productId);
                setMenProducts(updatedMen);
            } else {
                updatedWomen = updatedWomen.filter(p => p.id !== productId);
                setWomenProducts(updatedWomen);
            }
            
            // Update cache with removed data
            cacheManager.setCacheData(updatedPopular, updatedMen, updatedWomen, allProducts);
            
            setActionLoading(false);
            showSuccessAlert(
                'Product Removed!',
                `Product removed from ${section} section successfully.`,
                1500
            );
        } catch (error) {
            setActionLoading(false);
            showErrorAlert('Remove Failed', 'Failed to remove product. Please try again.');
        } finally {
            setRemovingProduct('');
        }
    };

    const toggleAdminMode = () => {
        if (adminMode) {
            showSuccessAlert(
                'Admin Mode Disabled',
                'Admin controls are now hidden.',
                1500
            );
        } else {
            showSuccessAlert(
                'Admin Mode Enabled',
                'Admin controls are now visible.',
                1500
            );
        }
        setAdminMode(!adminMode);
    };

    const handleClearCache = () => {
        cacheManager.invalidateCache();
        showSuccessAlert('Cache Cleared', 'Shop cache has been cleared.', 1500);
    };

    // Loader Components
    const Loader = ({ size = 'small', inline = false, color = 'primary' }) => (
        <div className={`loader ${size} ${inline ? 'inline-loader' : ''} ${color}`}>
            <div className="loader-spinner"></div>
        </div>
    );

    const CarouselSkeleton = () => (
        <div className="perfume-carousel-container">
            <button className="carousel-arrow left-arrow" disabled>
                <FaChevronLeft />
            </button>
            <div className="perfumes skeleton-carousel">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="perfume skeleton-perfume">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-title"></div>
                            <div className="skeleton-price"></div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="carousel-arrow right-arrow" disabled>
                <FaChevronRight />
            </button>
        </div>
    );

    const ActionLoaderOverlay = () => (
        <div className="action-loader-overlay">
            <div className="action-loader-container">
                <Loader size="large" />
                <p>Processing...</p>
            </div>
        </div>
    );

    const renderAdminControls = (section) => {
        if (!isAdmin || !adminMode) return null;
        
        return (
            <div className="admin-controls">
                <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className='admin-select'
                    disabled={addingProduct || actionLoading}
                >
                    <option value="">Select a product</option>
                    {allProducts.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.Name || product.name}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={() => addToSection(section)}
                    disabled={!selectedProduct || addingProduct || actionLoading}
                    className="add-button"
                >
                    {addingProduct ? (
                        <>
                            <Loader inline size="small" color="light" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <FaPlus /> Add to {section}
                        </>
                    )}
                </button>
            </div>
        );
    };

    const renderCarousel = (section, products) => {
        return (
            <div className="perfume-carousel-container">
                <button 
                    className="carousel-arrow left-arrow" 
                    onClick={() => prevSlide(section)}
                    disabled={currentIndices[section] === 0 || loading || actionLoading}
                >
                    <FaChevronLeft />
                </button>
                
                <div className="perfumes">
                    {loading ? (
                        <div className="carousel-loading">
                            <Loader size="medium" />
                            <p>Loading {section} products...</p>
                        </div>
                    ) : products.slice(
                        currentIndices[section], 
                        currentIndices[section] + productsPerPage[section]
                    ).map(product => (
                        <div className="perfume" key={product.id}>
                            {adminMode && (
                                <div 
                                    className="remove-button"
                                    onClick={() => removeFromSection(section, product.id)}
                                    title="Remove from section"
                                    disabled={removingProduct === product.id || actionLoading}
                                >
                                    {removingProduct === product.id ? (
                                        <Loader inline size="small" color="light" />
                                    ) : (
                                        <FaTimes />
                                    )}
                                </div>
                            )}
                            <img 
                                src={product.ImageUrl || product.image} 
                                alt={product.Name || product.name} 
                                loading="lazy"
                                onClick={() => redirectToProductDetail(product)}
                                width="150"
                                height="150"
                            />
                            <p className='perfume-name'>{product.Name || product.name}</p>
                            <p className='price'>&#8358; {(product.Price || product.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                
                <button 
                    className="carousel-arrow right-arrow" 
                    onClick={() => nextSlide(section)}
                    disabled={currentIndices[section] >= products.length - productsPerPage[section] || loading || actionLoading}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="shop-loading">
                <Loader size="large" />
                <p>Loading shop...</p>
            </div>
        );
    }

    return (
        <div className="shop">
            {actionLoading && <ActionLoaderOverlay />}

            {isAdmin && (
                <div className="admin-mode-toggle">
                    <button 
                        onClick={toggleAdminMode} 
                        className="admin-mode"
                        disabled={loading || actionLoading}
                    >
                        <FaEdit /> {adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                    </button>
                    {adminMode && (
                        <button 
                            onClick={handleClearCache}
                            className="clear-cache-button"
                            title="Clear shop cache"
                            disabled={actionLoading}
                        >
                            🗑️ Clear Cache
                        </button>
                    )}
                </div>
            )}
            
            <section className="section">
                <h2>Most Popular</h2>
                {renderAdminControls('popular')}
                {renderCarousel('popular', popularProducts)}
            </section>
            
            <section className="section gender">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                {renderAdminControls('men')}
                {renderCarousel('men', menProducts)}
            </section>
            
            <section className="section gender">
                <div className="heading">
                    <h2>Women's Perfume</h2>
                    <Link to='/women' className='link'>View all</Link>
                </div>
                {renderAdminControls('women')}
                {renderCarousel('women', womenProducts)}
            </section>
        </div>
    );
};

export default Shop;