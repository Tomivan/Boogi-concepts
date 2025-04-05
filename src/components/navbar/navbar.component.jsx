import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useCart } from '../../context/CartContext';
import './navbar.component.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="navbar">Loading...</div>;
  }

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
        <Link to='/cart' className='link'>
          <li>Cart {cartCount > 0 && `(${cartCount})`}</li>
        </Link>
      </ul>
      <div className="right">
        {user ? (
          <div className="user-welcome">
            <span>Welcome, {user.displayName || user.email.split('@')[0]}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <Link to='/login' className='login-link'>Login</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;