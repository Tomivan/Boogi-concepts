import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./signup";
import ForgotPassword from "./forgot-password";
import Login from "./login";
import ResetPassword from "./reset-password";
import Contact from "./contact-form";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";


const Home = lazy(() => import("./home-page"));
const Men = lazy(() => import("./men"));
const Women = lazy(() => import("./women"));
const ProductDetailsPage = lazy(() => import("./product-details"));
const Checkout = lazy(() => import("./checkout-page"));
const OrderCompleted = lazy(() => import("./completed"));
const MyOrders = lazy(() => import("./my-orders"));
const AdminShippingEditor = lazy(() => import('../components/admin/adminShippingEditor'));
const ShoppingCart = lazy(() => import('./shopping-cart'));


const LoadingFallback = () => {
  const styles = {
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "5px solid rgba(0, 0, 0, 0.1)",
      borderTop: "5px solid #8a2be2",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
   
    animationStyle: {
      __html: `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `,
    },
  };

  return (
    <>
      <div dangerouslySetInnerHTML={styles.animationStyle} />
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    </>
  );
};

const Pages = () => {
  const { currentUser, isAdmin } = useAuth();

  const LazyComponent = ({ Component }) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={currentUser ? <LazyComponent Component={Home} /> : <Login />} />
        <Route path="/signup" element={currentUser ? <LazyComponent Component={Home} /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<LazyComponent Component={Home} />} />
        <Route path="/men" element={<LazyComponent Component={Men} />} />
        <Route path="/women" element={<LazyComponent Component={Women} />} />
        <Route path="/product-details" element={<LazyComponent Component={ProductDetailsPage} />} />
        <Route path="/cart" element={<LazyComponent Component={ShoppingCart} />} />
        <Route path="/contact-us" element={<Contact />} />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <LazyComponent Component={Checkout} />
          </ProtectedRoute>
        } />
        
        <Route path="/order-completed" element={
          <ProtectedRoute>
            <LazyComponent Component={OrderCompleted} />
          </ProtectedRoute>
        } />
        
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <LazyComponent Component={MyOrders} />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/shipping" element={
          <ProtectedRoute>
            {isAdmin ? <LazyComponent Component={AdminShippingEditor} /> : <LazyComponent Component={Home} />}
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

export default Pages;