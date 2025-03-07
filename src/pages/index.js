import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./signup";
import ForgotPassword from "./forgot-password";
import Login from "./login";
import ResetPassword from "./reset-password";

const Pages = () => {
    return(
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
            </Routes>
        </Router>
    )
}

export default Pages;