'use client'

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react'

const GlobalContext = createContext()

export function GlobalContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login')
    localStorage.clear();
    setUser(null)
    // onClose();
  };

  useEffect(() => {
    // Retrieve user from local storage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      // Parse the JSON string to an object and set it in state
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

    
  if (loading) {
    return null; 
  }
  
  const value = {
    user, setUser, handleLogout
  }

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
} 