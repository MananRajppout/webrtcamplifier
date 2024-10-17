'use client'

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const GlobalContext = createContext()

export function GlobalContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    // Establish socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_BASE_URL);
    setSocket(newSocket);

    // Log when connection is established
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    // Log any connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

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
    user, setUser, handleLogout, socket
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