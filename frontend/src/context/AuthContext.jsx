import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // We temporarily store the pending login details if the user logs in
  const [pendingDetails, setPendingDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('token', idToken);
        
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://bajaj-finserv-backend-production-84d5.up.railway.app';
          
          // Get pending details from state or session storage if page reloaded
          const storedDetails = sessionStorage.getItem('pendingAuthDetails');
          const details = pendingDetails || (storedDetails ? JSON.parse(storedDetails) : {});
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              name: details.username || currentUser.displayName,
              email: currentUser.email,
              photo: currentUser.photoURL,
              roll_number: details.rollNumber || ''
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setPendingDetails(null);
            sessionStorage.removeItem('pendingAuthDetails');
          } else {
            console.error('Backend authentication failed');
            setUser(currentUser);
          }
        } catch (err) {
          console.error('Failed to sync with backend', err);
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pendingDetails]);

  const loginWithGoogle = async (username, rollNumber) => {
    try {
      const details = { username, rollNumber };
      setPendingDetails(details);
      sessionStorage.setItem('pendingAuthDetails', JSON.stringify(details));
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error logging in with Google', error);
      setPendingDetails(null);
      sessionStorage.removeItem('pendingAuthDetails');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
