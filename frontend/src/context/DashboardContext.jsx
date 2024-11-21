'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const DashboardContext = createContext()

export function DashboardContextProvider({ children }) {
  const [viewProject, setViewProject] = useState(false);

  const value ={
    viewProject, setViewProject
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



