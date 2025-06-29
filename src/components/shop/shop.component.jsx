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
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const productsPerPage = 4;
  
    const nextSlide = () => {
        if (currentIndex < popularProducts.length - productsPerPage) {
        setCurrentIndex(currentIndex + 1);
        }
    };
    
    const prevSlide = () => {
        if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        }
    };

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
                collection(db, 'mensPerfume'), // Changed from 'mensPerfume'
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

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="shop">
            <section className="section">
                <h2>Most Popular</h2>
                <div className="perfume-carousel-container">
                <button 
                    className="carousel-arrow left-arrow" 
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                >
                    <FaChevronLeft />
                </button>
                
                <div className="perfumes" ref={carouselRef}>
                    {popularProducts.slice(currentIndex, currentIndex + productsPerPage).map(product => (
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
                        <button className="add-to-cart"> Add to Cart</button>
                    </div>
                    ))}
                </div>
                
                <button 
                    className="carousel-arrow right-arrow" 
                    onClick={nextSlide}
                    disabled={currentIndex >= popularProducts.length - productsPerPage}
                >
                    <FaChevronRight />
                </button>
                </div>
            </section>
            <section className="section">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                <div className='perfumes'>
                    {menProducts.map(product => (
                        <div className="perfume" key={product.id}>
                            <img 
                                src={product.ImageUrl || product.image} 
                                alt={product.Name || product.name} 
                                onClick={() => redirectToProductDetail(product)}
                            />
                            <p>{product.Name || product.name}</p>
                            <p>&#8358; {(product.Price || product.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="section">
                <div className="heading">
                    <h2>Women's Perfume</h2>
                    <Link to='/women' className='link'>View all</Link>
                </div>
                <div className='perfumes'>
                    {womenProducts.map(product => (
                        <div className="perfume" key={product.id}>
                            <img 
                                src={product.ImageUrl || product.image} 
                                alt={product.Name || product.name} 
                                onClick={() => redirectToProductDetail(product)}
                            />
                            <p>{product.Name || product.name}</p>
                            <p>&#8358; {(product.Price || product.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Shop;