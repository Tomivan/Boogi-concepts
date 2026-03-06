import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFemale, faHome, faMale, faShoppingBag, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import {  db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCartStore } from '../../store/cartStore'; 
import './navbar.component.css';

const NavbarComponent = () => {
  const { currentUser: user, logout } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  
  const cartItems = useCartStore((state) => state.cartItems || []);
  
  const cartCount = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    
    const count = cartItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
    
    return count;
  }, [cartItems]);

  useEffect(() => {
    if (!user) {
      setOrderCount(0);
      return;
    }

    const fetchOrders = async () => {
      setOrderLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setOrderCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrders();
  }, [user]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const redirectToHomepage = () => {
    navigate("/")
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const Loader = ({ size = 'small', inline = false, light = false }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''} ${light ? 'light-loader' : ''}`}>
      <div className="loader-spinner"></div>
    </div>
  );

  return (
    <nav className="topbar" role="navigation" aria-label="Main navigation">
        <div className="logo" onClick={redirectToHomepage} role="button" tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && redirectToHomepage()}>
          <span className='logo-purple'>BOOGI</span>
          <span className='logo-gold'>NOIRE</span>
        </div>
        
        <button
          className="topbar-toggle"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="basic-navbar-nav"
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
        
        <div 
          className={`topbar-collapse ${isMenuOpen ? 'show' : ''}`}
          id="basic-navbar-nav"
          ref={menuRef}
        >
          <ul className="navigation" role="menubar">
            <li role="none">
              <Link to="/" className='link' role="menuitem">
                <FontAwesomeIcon icon={faHome} className='navbar-icon' aria-hidden="true" />
                Home
              </Link>
            </li>
            <li role="none">
              <Link to="/men" className='link' role="menuitem">
                <FontAwesomeIcon icon={faMale} className='navbar-icon' aria-hidden="true" />
                Men
              </Link>
            </li>
            <li role="none">
              <Link to="/women" className='link' role="menuitem">
                <FontAwesomeIcon icon={faFemale} className='navbar-icon' aria-hidden="true" />
                Women
              </Link>
            </li>
            <li role="none">
              <Link to="/cart" className='link cart-link' role="menuitem">
                <FontAwesomeIcon icon={faShoppingBag} className='navbar-icon' aria-hidden="true" />
                Cart 
                {cartCount > 0 ? (
                  <span className="cart-count" aria-label={`${cartCount} items in cart`}>
                    ({cartCount})
                  </span>
                ) : null}
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="right">
          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <span 
                className="user-welcome" 
                onClick={toggleDropdown}
                onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
                role="button"
                tabIndex="0"
                aria-expanded={isDropdownOpen}
                aria-controls="user-dropdown-menu"
                aria-haspopup="true"
              >
                {orderLoading ? (
                  <>
                    <Loader inline light size="small" />
                    <span className="loading-text">Loading...</span>
                  </>
                ) : (
                  <>
                    Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}
                    {orderCount > 0 && (
                      <span className="order-badge" aria-label={`${orderCount} orders`}>
                        {orderLoading ? (
                          <Loader inline light size="extra-small" />
                        ) : (
                          orderCount
                        )}
                      </span>
                    )}
                  </>
                )}
              </span>
              <div 
                className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}
                id="user-dropdown-menu"
                role="menu"
              >
                {orderLoading ? (
                  <div className="dropdown-loading" role="status">
                    <Loader inline size="small" />
                    <span>Loading orders...</span>
                  </div>
                ) : (
                  <Link to="/my-orders" role="menuitem">
                    My Orders {orderCount > 0 && `(${orderCount})`}
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="logout-button"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="link">Login</Link>
          )}
        </div>
    </nav>
  );
};

export default NavbarComponent;