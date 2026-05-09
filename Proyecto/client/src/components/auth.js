// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/userManagement/verify', {
                method: 'GET',
                credentials: 'include', // ¡Crucial para enviar la cookie!
            });
            
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Error verificando auth:', err);
            setUser(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/userManagement/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Error en logout:', err);
        }
        sessionStorage.removeItem("suggestionShown");
        localStorage.removeItem("lastSimulation");
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};