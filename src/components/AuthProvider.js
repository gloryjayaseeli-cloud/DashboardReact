// src/context/AuthProvider.js
import React, { useEffect, useState } from 'react';
import useApi from '../services/ApiService';
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userName');
    return savedUser ? savedUser : null;
  });
    const [role,setRole]= useState(() => {
    const userRole = localStorage.getItem('role');
    return userRole ? userRole : null;
  })
  
    const [token, setToken] = useState(localStorage.getItem('token'));
   

    const login = (userData, authToken, role) => {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);   
        setRole(role)
    };

    const logout = () => {
       
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        localStorage.setItem("role", "");
        localStorage.setItem("userName", "")
         window.location.href = '/'; 
    };

   
    const value = { user, token, login, logout };

    const hasRole = (roleName) => {
        return user?.groups?.includes(roleName) || false;
    };

    return (
        <AuthContext.Provider value={{ user, hasRole, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};