import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, where, limit, orderBy, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaEdit } from 'react-icons/fa';
import { db } from '../../firebase';
import './shop.component.css';

const ADMIN_EMAILS = ['okwuchidavida@gmail.com'];
const Shop = () => {
    const [menProducts, setMenProducts] = useState([]);
    const [womenProducts, setWomenProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For admin to select from
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSection, setSelectedSection] = useState('popular');
    const { currentUser } = useAuth();

    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
    
    // State for each carousel
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
    const [adminMode, setAdminMode] = useState(false);
    const navigate = useNavigate();

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

                // Fetch all products for admin selection
                const allProductsQuery = query(collection(db, 'products'));
                const allProductsSnapshot = await getDocs(allProductsQuery);
                const allProductsData = allProductsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllProducts(allProductsData);

                // Fetch popular perfumes
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
                
                // Fetch men's perfumes
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
                
                // Fetch women's perfumes
                const womenQuery = query(collection(db, 'products'), where('Gender', '==', 'Female'), limit(12));
                const womenSnapshot = await getDocs(womenQuery);
                const womenProductsData = womenSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setMenProducts(menProductsData.filter(Boolean));
                setWomenProducts(womenProductsData);
                setPopularProducts(popularData.filter(Boolean));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const redirectToProductDetail = (product) => {
        navigate("/product-details", { state: { product } });
    };

    const addToSection = async (section) => {
        if (!selectedProduct) return;
        
        try {
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
            
            if (section === 'popular') {
                setPopularProducts(prev => [...prev, { id: selectedProduct, ...productData }]);
            } else if (section === 'men') {
                setMenProducts(prev => [...prev, { id: selectedProduct, ...productData }]);
            } else {
                setWomenProducts(prev => [...prev, { id: selectedProduct, ...productData }]);
            }
            
            setSelectedProduct('');
        } catch (error) {
            console.error('Error adding to section:', error);
        }
    };

    const removeFromSection = async (section, productId) => {
        try {
            // Remove from the appropriate collection
            const sectionCollection = 
                section === 'popular' ? 'popularPerfumes' : 
                section === 'men' ? 'mensPerfume' : 
                'womensPerfume';
            
            await deleteDoc(doc(db, sectionCollection, productId));
            
            // Update state
            if (section === 'popular') {
                setPopularProducts(prev => prev.filter(p => p.id !== productId));
            } else if (section === 'men') {
                setMenProducts(prev => prev.filter(p => p.id !== productId));
            } else {
                setWomenProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (error) {
            console.error('Error removing from section:', error);
        }
    };

    const renderAdminControls = (section) => {
        if (!isAdmin || !adminMode) return null;
        
        return (
            <div className="admin-controls">
                <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className='admin-select'
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
                    disabled={!selectedProduct}
                    className="add-button"
                >
                    <FaPlus /> Add to {section}
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
                    disabled={currentIndices[section] === 0}
                >
                    <FaChevronLeft />
                </button>
                
                <div className="perfumes">
                    {products.slice(
                        currentIndices[section], 
                        currentIndices[section] + productsPerPage[section]
                    ).map(product => (
                        <div className="perfume" key={product.id}>
                            {adminMode && (
                                <div 
                                    className="remove-button"
                                    onClick={() => removeFromSection(section, product.id)}
                                >
                                    <FaTimes />
                                </div>
                            )}
                            <img 
                                src={product.ImageUrl || product.image} 
                                alt={product.Name || product.name} 
                                onClick={() => redirectToProductDetail(product)}
                            />
                            <p className='perfume-name'>{product.Name || product.name}</p>
                            <p className='price'>&#8358; {(product.Price || product.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                
                <button 
                    className="carousel-arrow right-arrow" 
                    onClick={() => nextSlide(section)}
                    disabled={currentIndices[section] >= products.length - productsPerPage[section]}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="shop">
            {isAdmin && (
                <div className="admin-mode-toggle">
                    <button onClick={() => setAdminMode(!adminMode)} className="admin-mode">
                        <FaEdit /> {adminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                    </button>
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