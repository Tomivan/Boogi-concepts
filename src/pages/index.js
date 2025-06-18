import { Routes, Route } from "react-router-dom";
import Signup from "./signup";
import ForgotPassword from "./forgot-password";
import Login from "./login";
import ResetPassword from "./reset-password";
import Home from "./home-page";
import Men from "./men";
import Women from "./women";
import ProductDetailsPage from "./product-details";
import ShoppingCart from "./shopping-cart";
import Checkout from "./checkout-page";
import OrderCompleted from "./completed";
import MyOrders from "./my-orders";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import Contact from "./contact-form";

const Pages = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Home /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Home /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<Home />} />
      <Route path="/men" element={<Men />} />
      <Route path="/women" element={<Women />} />
      <Route path="/product-details" element={<ProductDetailsPage />} />
      <Route path="/cart" element={<ShoppingCart />} />
      <Route path="/contact-us" element={<Contact />} />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />
      
      <Route path="/order-completed" element={
        <ProtectedRoute>
          <OrderCompleted />
        </ProtectedRoute>
      } />
      
      <Route path="/my-orders" element={
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default Pages;