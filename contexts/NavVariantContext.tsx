import React, { createContext, useContext, useState, useCallback } from 'react';

import type { NavVariantName } from '@/constants/nav-variants';

type NavVariantContextValue = {
  activeVariant: NavVariantName;
  setVariant: (variant: NavVariantName) => void;
};

const NavVariantContext = createContext<NavVariantContextValue | null>(null);

export function NavVariantProvider({ children }: { children: React.ReactNode }) {
  const [activeVariant, setActiveVariant] = useState<NavVariantName>('A');

  const setVariant = useCallback((variant: NavVariantName) => {
    setActiveVariant(variant);
  }, []);

  return (
    <NavVariantContext.Provider value={{ activeVariant, setVariant }}>
      {children}
    </NavVariantContext.Provider>
  );
}

export function useNavVariant() {
  const context = useContext(NavVariantContext);
  if (!context) {
    throw new Error('useNavVariant must be used within NavVariantProvider');
  }
  return context;
}