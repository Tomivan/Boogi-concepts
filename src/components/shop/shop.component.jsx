import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import './shop.component.css';

const Shop = () => {
    const [menProducts, setMenProducts] = useState([]);
    const [womenProducts, setWomenProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                // Fetch first 4 men's perfumes
                const menQuery = query(
                    collection(db, 'products'),
                    where('Gender', '==', 'Male'),
                    limit(10)
                );
                const menSnapshot = await getDocs(menQuery);
                const menProductsData = menSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Fetch first 4 women's perfumes
                const womenQuery = query(
                    collection(db, 'products'),
                    where('Gender', '==', 'Female'),
                    limit(10) 
                );
                const womenSnapshot = await getDocs(womenQuery);
                const womenProductsData = womenSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setMenProducts(menProductsData);
                setWomenProducts(womenProductsData);
                
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