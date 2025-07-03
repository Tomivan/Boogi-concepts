import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, limit, orderBy, getDoc } from 'firebase/firestore';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { db } from '../../firebase';
import './shop.component.css';

const Shop = () => {
    const [menProducts, setMenProducts] = useState([]);
    const [womenProducts, setWomenProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    
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
        // Check screen size and set productsPerPage accordingly
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

        // Set initial value
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Fetch popular perfumes
                const popularQuery = query(
                    collection(db, 'popularPerfumes'),
                    orderBy('rank')
                );
                const popularSnapshot = await getDocs(popularQuery);
                const popularData = await Promise.all(
                    popularSnapshot.docs.map(async doc => {
                        const perfumeRef = doc.data().perfumeRef;
                        
                        if (!perfumeRef || typeof perfumeRef !== 'object' || !perfumeRef.path) {
                            console.warn('Invalid perfumeRef in popular perfume:', doc.id);
                            return null;
                        }
                        
                        try {
                            const perfumeSnap = await getDoc(perfumeRef);
                            return perfumeSnap.exists() ? {
                                id: perfumeSnap.id,
                                ...perfumeSnap.data()
                            } : null;
                        } catch (error) {
                            console.error('Error fetching perfume:', error);
                            return null;
                        }
                    })
                );
                
                // Fetch men's perfumes - fixed collection name to 'mensPerfumes'
                const menQuery = query(
                    collection(db, 'mensPerfume'),
                    orderBy('rank')
                );
                const menSnapshot = await getDocs(menQuery);
                const menProductsData = await Promise.all(
                    menSnapshot.docs.map(async doc => {
                        const perfumeRef = doc.data().perfumeRef;
                        
                        if (!perfumeRef || typeof perfumeRef !== 'object' || !perfumeRef.path) {
                            console.warn('Invalid perfumeRef in mens perfume:', doc.id);
                            return null;
                        }
                        
                        try {
                            const perfumeSnap = await getDoc(perfumeRef);
                            return perfumeSnap.exists() ? {
                                id: perfumeSnap.id,
                                ...perfumeSnap.data()
                            } : null;
                        } catch (error) {
                            console.error('Error fetching perfume:', error);
                            return null;
                        }
                    })
                );
                
                // Fetch women's perfumes
                const womenQuery = query(
                    collection(db, 'products'),
                    where('Gender', '==', 'Female'),
                    limit(12) 
                );
                const womenSnapshot = await getDocs(womenQuery);
                const womenProductsData = womenSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter out null products before setting state
                setMenProducts(menProductsData.filter(product => product !== null));
                setWomenProducts(womenProductsData);
                setPopularProducts(popularData.filter(product => product !== null));
                
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
                            <img 
                                src={product.ImageUrl || product.image} 
                                alt={product.Name || product.name} 
                                onClick={() => redirectToProductDetail(product)}
                            />
                            <p>{product.Name || product.name}</p>
                            <p>
                                &#8358; {(product.Price || product.price).toLocaleString()}
                            </p>
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
            <section className="section">
                <h2>Most Popular</h2>
                {renderCarousel('popular', popularProducts)}
            </section>
            
            <section className="section gender">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                {renderCarousel('men', menProducts)}
            </section>
            
            <section className="section gender">
                <div className="heading">
                    <h2>Women's Perfume</h2>
                    <Link to='/women' className='link'>View all</Link>
                </div>
                {renderCarousel('women', womenProducts)}
            </section>
        </div>
    );
};

export default Shop;