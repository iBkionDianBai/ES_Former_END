// src/AuthGuard.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const isLoggedIn = sessionStorage.getItem('token');

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthGuard;