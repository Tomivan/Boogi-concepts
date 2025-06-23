import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFemale, faHome, faMale, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useCart } from '../../context/CartContext';
import './navbar.component.css';

const NavbarComponent = () => {
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

  const redirectToHomepage = () => {
    navigate("/")
  }

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
        <Navbar expand="lg" className="navbar">
          <Container>
            <div className="logo" onClick={redirectToHomepage}>
              <span className='logo-purple'>BOOGI</span>
              <span className='logo-gold'>NOIRE</span>
            </div>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto move-left">
                <Nav.Link href="/" className='link'>
                  <FontAwesomeIcon icon={faHome} className='navbar-icon' />
                    Home
                </Nav.Link>
                <Nav.Link href="/men" className='link'>
                  <FontAwesomeIcon icon={faMale} className='navbar-icon' />
                  Men
                </Nav.Link>
                <Nav.Link href="/women" className='link'>
                  <FontAwesomeIcon icon={faFemale} className='navbar-icon' /> 
                  Women
                </Nav.Link>
                <Nav.Link href="/cart" className='link'>
                <FontAwesomeIcon icon={faShoppingBag} className='navbar-icon' />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Nav.Link>
              </Nav>
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
            </Navbar.Collapse>
          </Container>
        </Navbar>
  );
};

export default NavbarComponent;