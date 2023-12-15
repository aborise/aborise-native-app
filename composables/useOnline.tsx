// OnlineContext.js
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Creating the context
const OnlineContext = createContext<boolean | null>(null);

export const OnlineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isInternetReachable);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return <OnlineContext.Provider value={isOnline}>{children}</OnlineContext.Provider>;
};

export const useOnline = () => {
  return useContext(OnlineContext);
};
