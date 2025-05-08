// UseActiveTab.tsx
import React, { createContext, useContext, useState, useEffect, use } from 'react';
import { useLocation } from "react-router-dom";

const ActiveTabContext = createContext<string | null>(null);

export const useActiveTab = () => useContext(ActiveTabContext);

interface ActiveTabProviderProps {
    value: string;
    children?: React.ReactNode;
}  

export const ActiveTabProvider: React.FC<ActiveTabProviderProps> = ({ value, children }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  useEffect(() => {
    setActiveTab(value);
  }, [value]);
  console.log("ActiveTabProvider value", value);
  console.log("ActiveTabProvider activeTab", activeTab);
  
  const location = useLocation();

  useEffect(() => {
    // Assuming you want to set the initial active tab based on route
    const pathname = location.pathname;
    console.log("pathname", pathname);
    
    if (pathname === '/' || pathname === '/dashboard') {
      setActiveTab('Dashboard');
    } else if (pathname === '/summary') {
      setActiveTab('Summary');
    } else if (pathname === '/leaderboard') {
      setActiveTab('BigCodeBench Leaderboard');
    } else if (pathname === '/model-comparison') {
      setActiveTab('Model Comparison');
    } else if (pathname === '/model-server-logs') {
      setActiveTab('Model Server Logs');
    }
  }, []);

  return (
    <ActiveTabContext.Provider value={activeTab}>
      {children}
    </ActiveTabContext.Provider>
  );
};