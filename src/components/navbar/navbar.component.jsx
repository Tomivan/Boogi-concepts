import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFemale, faHome, faMale, faShoppingBag, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCartStore } from '../../store/cartStore'; 
import './navbar.component.css';

const NavbarComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const storeState = useCartStore.getState();
    console.log('Store cartCount getter:', storeState.cartCount);
  }, [cartItems, cartCount]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setOrderLoading(true);
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          setOrderCount(querySnapshot.size);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setOrderLoading(false);
        }
      }
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

  const Loader = ({ size = 'small', inline = false, light = false }) => (
    <div className={`loader ${size} ${inline ? 'inline-loader' : ''} ${light ? 'light-loader' : ''}`}>
      <div className="loader-spinner"></div>
    </div>
  );

  const UserSkeleton = () => (
    <div className="user-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-text-container">
        <div className="skeleton-text short"></div>
        <div className="skeleton-text shorter"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="navbar navbar-loading">
        <Container>
          <div className="logo" onClick={redirectToHomepage}>
            <span className='logo-purple'>BOOGI</span>
            <span className='logo-gold'>NOIRE</span>
          </div>
          <div className="navbar-skeleton">
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
          </div>
          <div className="right-skeleton">
            <div className="skeleton-user"></div>
          </div>
        </Container>
      </div>
    );
  }

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
          {loading ? (
            <UserSkeleton />
          ) : user ? (
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
                    Welcome, {user.displayName || user.email.split('@')[0]}
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