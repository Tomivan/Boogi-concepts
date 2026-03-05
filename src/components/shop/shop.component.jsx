import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    collection, getDocs, query, where, 
    limit, orderBy, getDoc, doc, setDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alert';
import './shop.component.css';


const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const CACHE_TTL = 24 * 60 * 60 * 1000;

const SECTION_COLLECTIONS = {
    popular: 'popularPerfumes',
    men:     'mensPerfume',
    women:   'womensPerfume',
};


let _cache = { data: null, timestamp: null };

const cache = {
    get: ()        => {
        if (!_cache.data || !_cache.timestamp) return null;
        if (Date.now() - _cache.timestamp > CACHE_TTL) return null;
        return _cache.data;
    },
    set: (data)    => { _cache = { data, timestamp: Date.now() }; },
    clear: ()      => { _cache = { data: null, timestamp: null }; },
};


const getProductsPerPage = () => {
    if (window.matchMedia('(max-width: 767px)').matches)  return 1;
    if (window.matchMedia('(max-width: 1023px)').matches) return 2;
    return 4;
};

const Spinner = ({ light = false, size = 'medium' }) => (
    <div className={`loader-spinner ${light ? 'light' : ''} size-${size}`} />
);

const ProductSkeleton = ({ priority = false }) => (
    <div className={`perfume skeleton-perfume ${priority ? 'priority-skeleton' : ''}`}>
        <div className="skeleton-image" />
        <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-price" />
        </div>
    </div>
);

const PriorityCarouselSkeleton = () => (
    <div className="perfume-carousel-container priority-carousel">
        <button className="carousel-arrow left-arrow" disabled aria-hidden="true">‹</button>
        <div className="perfumes">
            {[1].map(i => (
                <ProductSkeleton key={i} priority={true} />
            ))}
        </div>
        <button className="carousel-arrow right-arrow" disabled aria-hidden="true">›</button>
    </div>
);

const RegularCarouselSkeleton = () => (
    <div className="perfume-carousel-container">
        <button className="carousel-arrow left-arrow" disabled aria-hidden="true">‹</button>
        <div className="perfumes">
            {[1, 2, 3, 4].map(i => (
                <ProductSkeleton key={i} priority={false} />
            ))}
        </div>
        <button className="carousel-arrow right-arrow" disabled aria-hidden="true">›</button>
    </div>
);

const ActionLoaderOverlay = () => (
    <div className="action-loader-overlay" role="status" aria-live="polite">
        <div className="action-loader-container">
            <Spinner size="large" />
            <p>Processing...</p>
        </div>
    </div>
);


const ProductImage = ({ product, onClick, priority = false }) => (
    <img
        src={product.ImageUrl || product.image}
        alt={product.Name || product.name}
        width="150"
        height="150"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={`product-image ${priority ? 'priority-image' : ''}`}
        style={{ aspectRatio: '1/1', objectFit: 'cover', cursor: 'pointer' }}
        onClick={onClick}
    />
);

const Shop = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const isAdmin = useMemo(
        () => !!(currentUser && ADMIN_EMAILS.includes(currentUser.email)),
        [currentUser]
    );

    const [products, setProducts] = useState({ popular: [], men: [], women: [], all: [] });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [indices, setIndices] = useState({ popular: 0, men: 0, women: 0 });
    const [perPage, setPerPage] = useState(getProductsPerPage);
    const [loading, setLoading] = useState(true);
    const [adminMode, setAdminMode] = useState(false);
    const [addingTo, setAddingTo] = useState('');
    const [removingId, setRemovingId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const mq2 = window.matchMedia('(max-width: 1023px)');

        const update = () => setPerPage(getProductsPerPage());

        // Use passive listeners for better performance
        mq.addEventListener('change', update, { passive: true });
        mq2.addEventListener('change', update, { passive: true });
        
        return () => {
            mq.removeEventListener('change', update);
            mq2.removeEventListener('change', update);
        };
    }, []);

    // Optimized data fetching with priority for popular section
    useEffect(() => {
        const fetchProducts = async () => {
            // Return cached data immediately if valid
            const cached = cache.get();
            if (cached) {
                setProducts(cached);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch popular section first (priority for LCP)
                const popularSnap = await getDocs(
                    query(collection(db, 'popularPerfumes'), orderBy('rank'))
                );

                // Resolve popular products first
                const popularRefs = popularSnap.docs
                    .map(d => d.data().perfumeRef)
                    .filter(ref => ref?.path);

                const popularSnaps = await Promise.all(
                    popularRefs.map(ref => getDoc(ref))
                );

                const popular = popularSnaps
                    .filter(s => s.exists())
                    .map(s => ({ id: s.id, ...s.data() }));

                // Set popular products immediately
                setProducts(prev => ({ ...prev, popular }));

                // Fetch remaining data in background
                const [allSnap, menSnap, womenSnap] = await Promise.all([
                    getDocs(query(collection(db, 'products'))),
                    getDocs(query(collection(db, 'mensPerfume'), orderBy('rank'))),
                    getDocs(query(collection(db, 'products'), where('Gender', '==', 'Female'), limit(12))),
                ]);

                const allProducts = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Resolve men's products
                const menRefs = menSnap.docs
                    .map(d => d.data().perfumeRef)
                    .filter(ref => ref?.path);

                const menSnaps = await Promise.all(
                    menRefs.map(ref => getDoc(ref))
                );

                const men = menSnaps
                    .filter(s => s.exists())
                    .map(s => ({ id: s.id, ...s.data() }));

                const women = womenSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const data = { popular, men, women, all: allProducts };
                cache.set(data);
                setProducts(data);

            } catch (error) {
                console.error('Error fetching shop products:', error);
                showErrorAlert('Load Failed', 'Failed to load products. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); 

    const next = useCallback((section) => {
        setIndices(prev => {
            const total = products[section].length;
            const next = prev[section] + 1;
            return next <= total - perPage
                ? { ...prev, [section]: next }
                : prev;
        });
    }, [products, perPage]);

    const prev = useCallback((section) => {
        setIndices(prev => {
            return prev[section] > 0
                ? { ...prev, [section]: prev[section] - 1 }
                : prev;
        });
    }, []);

    const goToProduct = useCallback((product) => {
        navigate('/product-details', { state: { product } });
    }, [navigate]);

    const addToSection = useCallback(async (section) => {
        if (!selectedProduct) return;

        try {
            setAddingTo(section);
            setActionLoading(true);

            const productRef = doc(db, 'products', selectedProduct);
            const rank = products[section].length + 1;

            await setDoc(doc(db, SECTION_COLLECTIONS[section], selectedProduct), {
                perfumeRef: productRef,
                rank,
            });

            const snap = await getDoc(productRef);
            const newProduct = { id: selectedProduct, ...snap.data() };

            setProducts(prev => {
                const updated = { ...prev, [section]: [...prev[section], newProduct] };
                cache.set(updated);
                return updated;
            });

            setSelectedProduct('');
            showSuccessAlert('Product Added!', `Added to ${section} section.`, 1500);
        } catch {
            showErrorAlert('Add Failed', 'Failed to add product. Please try again.');
        } finally {
            setAddingTo('');
            setActionLoading(false);
        }
    }, [selectedProduct, products]);

    const removeFromSection = useCallback(async (section, productId) => {
        const product = products[section].find(p => p.id === productId);
        if (!product) return;

        const result = await showConfirmAlert(
            'Remove Product',
            `Remove "${product.Name || product.name}" from ${section}?`,
            'Yes, Remove', 'Cancel'
        );
        if (!result.isConfirmed) return;

        try {
            setRemovingId(productId);
            setActionLoading(true);

            await deleteDoc(doc(db, SECTION_COLLECTIONS[section], productId));

            setProducts(prev => {
                const updated = {
                    ...prev,
                    [section]: prev[section].filter(p => p.id !== productId),
                };
                cache.set(updated);
                return updated;
            });

            showSuccessAlert('Removed!', `Removed from ${section} section.`, 1500);
        } catch {
            showErrorAlert('Remove Failed', 'Failed to remove product. Please try again.');
        } finally {
            setRemovingId('');
            setActionLoading(false);
        }
    }, [products]);

    const toggleAdminMode = useCallback(() => {
        setAdminMode(prev => {
            const next = !prev;
            showSuccessAlert(
                next ? 'Admin Mode Enabled' : 'Admin Mode Disabled',
                next ? 'Admin controls are now visible.' : 'Admin controls are now hidden.',
                1500
            );
            return next;
        });
    }, []);

    const renderAdminControls = (section) => {
        if (!isAdmin || !adminMode) return null;
        return (
            <div className="admin-controls">
                <select
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="admin-select"
                    disabled={!!addingTo || actionLoading}
                >
                    <option value="">Select a product</option>
                    {products.all.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.Name || p.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => addToSection(section)}
                    disabled={!selectedProduct || !!addingTo || actionLoading}
                    className="add-button"
                >
                    {addingTo === section ? <><Spinner size="small" light /> Adding...</> : `+ Add to ${section}`}
                </button>
            </div>
        );
    };

    const renderCarousel = (section, isPriority = false) => {
        const list = products[section];
        const start = indices[section];
        const visible = list.slice(start, start + perPage);

        return (
            <div className={`perfume-carousel-container ${isPriority ? 'priority-carousel' : ''}`}>
                <button
                    className="carousel-arrow left-arrow"
                    onClick={() => prev(section)}
                    disabled={indices[section] === 0 || actionLoading}
                    aria-label="Previous products"
                >
                    ‹
                </button>

                <div className="perfumes">
                    {visible.map((product, index) => (
                        <div className="perfume" key={product.id}>
                            {adminMode && (
                                <button
                                    className="remove-button"
                                    onClick={() => removeFromSection(section, product.id)}
                                    disabled={removingId === product.id || actionLoading}
                                    aria-label={`Remove ${product.Name || product.name}`}
                                >
                                    {removingId === product.id ? <Spinner size="small" light /> : '✕'}
                                </button>
                            )}
                            <ProductImage
                                product={product}
                                onClick={() => goToProduct(product)}
                                priority={isPriority && index === 0} // First image in priority section gets highest priority
                            />
                            <p className="perfume-name">{product.Name || product.name}</p>
                            <p className="price">
                                ₦ {(product.Price || product.price).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    className="carousel-arrow right-arrow"
                    onClick={() => next(section)}
                    disabled={indices[section] >= list.length - perPage || actionLoading}
                    aria-label="Next products"
                >
                    ›
                </button>
            </div>
        );
    };

    // Optimized loading state with priority for above-fold content
    if (loading) {
        return (
            <div className="shop">
                <section className="section">
                    <h2>Most Popular</h2>
                    <PriorityCarouselSkeleton />
                </section>
                <section className="section gender">
                    <div className="heading">
                        <h2>Men's Perfume</h2>
                        <Link to='/men' className='link'>View all</Link>
                    </div>
                    <RegularCarouselSkeleton />
                </section>
                <section className="section gender">
                    <div className="heading">
                        <h2>Women's Perfume</h2>
                        <Link to='/women' className='link'>View all</Link>
                    </div>
                    <RegularCarouselSkeleton />
                </section>
            </div>
        );
    }

    return (
        <div className="shop">
            {actionLoading && <ActionLoaderOverlay />}

            {isAdmin && (
                <div className="admin-mode-toggle">
                    <button onClick={toggleAdminMode} className="admin-mode" disabled={actionLoading}>
                        ✎ {adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                    </button>
                    {adminMode && (
                        <button
                            onClick={() => { cache.clear(); showSuccessAlert('Cache Cleared', '', 1500); }}
                            className="clear-cache-button"
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
                {renderCarousel('popular', true)}
            </section>

            <section className="section gender">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                {renderAdminControls('men')}
                {renderCarousel('men')}
            </section>

            <section className="section gender">
                <div className="heading">
                    <h2>Women's Perfume</h2>
                    <Link to='/women' className='link'>View all</Link>
                </div>
                {renderAdminControls('women')}
                {renderCarousel('women')}
            </section>
        </div>
    );
};

export default Shop;