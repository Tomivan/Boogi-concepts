import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaMale, FaFemale, FaShoppingBag, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCartStore } from '../../store/cartStore';
import './navbar.component.css';

const Loader = ({ size = 'small', inline = false, light = false }) => (
  <div className={`loader ${size} ${inline ? 'inline-loader' : ''} ${light ? 'light-loader' : ''}`}>
    <div className="loader-spinner"></div>
  </div>
);

const NavbarComponent = () => {
  const { currentUser: user, logout } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const hasFetchedOrders = useRef(false);
  
  const navigate = useNavigate();
  
  const cartItems = useCartStore(useCallback((state) => state.cartItems || [], []));
  
  const cartCount = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    
    return cartItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cartItems]);

  const userDisplayName = useMemo(() => {
    if (!user) return null;
    return user.displayName || user.email?.split('@')[0] || 'User';
  }, [user]);

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false);
      setIsDropdownOpen(false);
    }
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const redirectToHomepage = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) {
      setOrderCount(0);
      hasFetchedOrders.current = false;
      return;
    }

    if (hasFetchedOrders.current) return;
    
    const fetchOrders = async () => {
      const controller = new AbortController();
      
      setOrderLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!controller.signal.aborted) {
          setOrderCount(querySnapshot.size);
          hasFetchedOrders.current = true;
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching orders:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setOrderLoading(false);
        }
      }
      
      return () => controller.abort();
    };

    fetchOrders();
    
    // Cleanup function
    return () => {
      hasFetchedOrders.current = false;
    };
  }, [user?.uid, user]); 

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  const navItems = useMemo(() => [
    { to: "/", icon: FaHome, label: "Home" },
    { to: "/men", icon: FaMale, label: "Men" },
    { to: "/women", icon: FaFemale, label: "Women" },
    { to: "/cart", icon: FaShoppingBag, label: "Cart" }
  ], []);

  return (
    <nav className="topbar" role="navigation" aria-label="Main navigation">
      <div 
        className="logo" 
        onClick={redirectToHomepage} 
        role="button" 
        tabIndex={0} 
        onKeyDown={(e) => e.key === 'Enter' && redirectToHomepage()}
      >
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
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <div 
        className={`topbar-collapse ${isMenuOpen ? 'show' : ''}`}
        id="basic-navbar-nav"
        ref={menuRef}
      >
        <ul className="navigation" role="menubar">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} role="none">
              <Link to={to} className='link' role="menuitem">
                <Icon className='navbar-icon' aria-hidden="true" />
                {label}
                {to === "/cart" && cartCount > 0 && (
                  <span className="cart-count" aria-label={`${cartCount} items in cart`}>
                    ({cartCount})
                  </span>
                )}
              </Link>
            </li>
          ))}
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
              tabIndex={0}
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
                  Welcome, {userDisplayName}
                  {orderCount > 0 && (
                    <span className="order-badge" aria-label={`${orderCount} orders`}>
                      {orderCount}
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