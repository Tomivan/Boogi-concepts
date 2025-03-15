import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.component.css';

const Navbar = () => {
    return (
        <div className='navbar'>
            <div className="logo">
                <span className='logo-purple'>BOGI</span>
                <span className='logo-gold'>NOIR</span>
            </div>
            <ul>
                <Link to='/' className='link'><li>Home</li></Link>
                <Link to='/men' className='link'><li>Men</li></Link>
                <Link to='/women' className='link'><li>Women</li></Link>
                <Link to='/cart' className='link'><li>Cart</li></Link>
            </ul>
            <div className="right">
                <Link to='/login' className='login-link'>Login</Link>
            </div>
        </div>
    )
}

export default Navbar;