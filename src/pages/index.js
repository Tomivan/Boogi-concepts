import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

const Pages = () => {
    return(
        <Router>
            <Routes>
                <Route path='' element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/men' element={<Men />} />
                <Route path='/women' element={<Women />} />
                <Route path='/product-details' element={<ProductDetailsPage />} />
                <Route path='/cart' element={<ShoppingCart />} />
                <Route path='/checkout' element={<Checkout />} />
            </Routes>
        </Router>
    )
}

export default Pages;