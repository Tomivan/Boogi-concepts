import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Perfume from '../../assets/images/perfume.jpg';
import './shop.component.css';

const products = [
  {
    id: 1,
    name: 'Antonio Banderas',
    price: 35000,
    image: Perfume
  },
  {
    id: 2,
    name: 'Chanel No. 5',
    price: 45000,
    image: Perfume
  },
  {
    id: 3,
    name: 'Dior Sauvage',
    price: 55000,
    image: Perfume
  },
  {
    id: 4,
    name: 'Versace Eros',
    price: 40000,
    image: Perfume
  }
];

const Shop = () => {

    const navigate = useNavigate();
    const redirectToProductDetail = (product) => {
       navigate("/product-details", { state: { product } });
    }
    return(
        <div className="shop">
            <section className="section">
                <div className="heading">
                    <h2>Men's Perfume</h2>
                    <Link to='/men' className='link'>View all</Link>
                </div>
                <div className='perfumes'>
                    {products.map(product => (
                        <div className="perfume" key={product.id}>
                            <img src={product.image} alt={product.name} onClick={() => redirectToProductDetail(product)}/>
                            <p>{product.name}</p>
                            <p>&#8358; {product.price.toLocaleString()}</p>
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
                    {products.map(product => (
                        <div className="perfume" key={product.id}>
                            <img src={product.image} alt={product.name} onClick={() => redirectToProductDetail(product)} />
                            <p>{product.name}</p>
                            <p>&#8358; {product.price.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Shop 