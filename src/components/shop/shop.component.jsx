import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    collection, getDocs, query, where, 
    limit, orderBy, getDoc, doc, setDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alert';
import './shop.component.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const CACHE_TTL = 24 * 60 * 60 * 1000;

const SECTION_COLLECTIONS = {
    popular: 'popularPerfumes',
    men:     'mensPerfume',
    women:   'womensPerfume',
};

// ─── Cache (module-level singleton, survives re-renders) ──────────────────────

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

// ─── Responsive helper (runs once, not on every resize) ──────────────────────

const getProductsPerPage = () => {
    if (window.matchMedia('(max-width: 767px)').matches)  return 1;
    if (window.matchMedia('(max-width: 1023px)').matches) return 2;
    return 4;
};


const Spinner = ({ light = false }) => (
    <div className={`loader-spinner ${light ? 'light' : ''}`} />
);

const CarouselSkeleton = () => (
    <div className="perfume-carousel-container">
        <button className="carousel-arrow left-arrow" disabled aria-hidden="true">&#8249;</button>
        <div className="perfumes skeleton-carousel">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="perfume skeleton-perfume">
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                        <div className="skeleton-title" />
                        <div className="skeleton-price" />
                    </div>
                </div>
            ))}
        </div>
        <button className="carousel-arrow right-arrow" disabled aria-hidden="true">&#8250;</button>
    </div>
);

const ActionLoaderOverlay = () => (
    <div className="action-loader-overlay" role="status" aria-live="polite">
        <div className="action-loader-container">
            <Spinner />
            <p>Processing...</p>
        </div>
    </div>
);


const Shop = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Memoize isAdmin so it doesn't change reference every render
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
    const [addingTo, setAddingTo] = useState('');       // section name or ''
    const [removingId, setRemovingId] = useState('');   // product id or ''
    const [actionLoading, setActionLoading] = useState(false);

    // ── Responsive perPage ──────────────────────────────────────────────────

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const mq2 = window.matchMedia('(max-width: 1023px)');

        const update = () => setPerPage(getProductsPerPage());

        mq.addEventListener('change', update);
        mq2.addEventListener('change', update);
        return () => {
            mq.removeEventListener('change', update);
            mq2.removeEventListener('change', update);
        };
    }, []);

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

                // Fetch all three queries in parallel
                const [allSnap, popularSnap, menSnap, womenSnap] = await Promise.all([
                    getDocs(query(collection(db, 'products'))),
                    getDocs(query(collection(db, 'popularPerfumes'), orderBy('rank'))),
                    getDocs(query(collection(db, 'mensPerfume'), orderBy('rank'))),
                    getDocs(query(collection(db, 'products'), where('Gender', '==', 'Female'), limit(12))),
                ]);

                const allProducts = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Resolve perfume refs in parallel (batched per section)
                const resolveRefs = async (snapshot) => {
                    const refs = snapshot.docs
                        .map(d => d.data().perfumeRef)
                        .filter(ref => ref?.path);

                    const snaps = await Promise.all(refs.map(ref => getDoc(ref)));
                    return snaps
                        .filter(s => s.exists())
                        .map(s => ({ id: s.id, ...s.data() }));
                };

                const [popular, men] = await Promise.all([
                    resolveRefs(popularSnap),
                    resolveRefs(menSnap),
                ]);

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
    }, []); // no isAdmin dependency — fetching doesn't depend on admin status

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

    // ── Admin actions ───────────────────────────────────────────────────────

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

    // ── Render helpers ──────────────────────────────────────────────────────

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
                    {addingTo === section ? <><Spinner light /> Adding...</> : `+ Add to ${section}`}
                </button>
            </div>
        );
    };

    const renderCarousel = (section) => {
        const list = products[section];
        const start = indices[section];
        const visible = list.slice(start, start + perPage);

        return (
            <div className="perfume-carousel-container">
                <button
                    className="carousel-arrow left-arrow"
                    onClick={() => prev(section)}
                    disabled={indices[section] === 0 || actionLoading}
                    aria-label="Previous products"
                >
                    &#8249;
                </button>

                <div className="perfumes">
                    {visible.map(product => (
                        <div className="perfume" key={product.id}>
                            {adminMode && (
                                <button
                                    className="remove-button"
                                    onClick={() => removeFromSection(section, product.id)}
                                    disabled={removingId === product.id || actionLoading}
                                    aria-label={`Remove ${product.Name || product.name}`}
                                >
                                    {removingId === product.id ? <Spinner light /> : '✕'}
                                </button>
                            )}
                            <img
                                src={product.ImageUrl || product.image}
                                alt={product.Name || product.name}
                                width="150"
                                height="150"
                                loading="lazy"
                                decoding="async"
                                style={{ aspectRatio: '1/1', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => goToProduct(product)}
                            />
                            <p className="perfume-name">{product.Name || product.name}</p>
                            <p className="price">
                                &#8358; {(product.Price || product.price).toLocaleString()}
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
                    &#8250;
                </button>
            </div>
        );
    };

    // ── Loading state ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="shop">
                <section className="section"><h2>Most Popular</h2><CarouselSkeleton /></section>
                <section className="section gender">
                    <div className="heading"><h2>Men's Perfume</h2><Link to='/men' className='link'>View all</Link></div>
                    <CarouselSkeleton />
                </section>
                <section className="section gender">
                    <div className="heading"><h2>Women's Perfume</h2><Link to='/women' className='link'>View all</Link></div>
                    <CarouselSkeleton />
                </section>
            </div>
        );
    }

    // ── Full render ─────────────────────────────────────────────────────────

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
                {renderCarousel('popular')}
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