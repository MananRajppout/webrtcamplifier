'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGlobalContext } from './GlobalContext';

const queryClient = new QueryClient();

const DashboardContext = createContext()

export function DashboardContextProvider({ children }) {
  const { user } = useGlobalContext()

  console.log("user in the dashboard context", user)

  const value ={
    user
  }

  return (
    <QueryClientProvider client={queryClient}>
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  </QueryClientProvider>
  );

}

  export function useDashboardContext() {
    return useContext(DashboardContext);
  }



