import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_NAV_VARIANT, type NavVariantName } from '@/constants/nav-variants';

type NavVariantContextValue = {
  activeVariant: NavVariantName;
  setActiveVariant: React.Dispatch<React.SetStateAction<NavVariantName>>;
};

const NavVariantContext = createContext<NavVariantContextValue | null>(null);

export function NavVariantProvider({ children }: { children: ReactNode }) {
  const [activeVariant, setActiveVariant] = useState<NavVariantName>(DEFAULT_NAV_VARIANT);

  const value = useMemo(
    () => ({
      activeVariant,
      setActiveVariant,
    }),
    [activeVariant, setActiveVariant]
  );

  return (
    <NavVariantContext.Provider value={value}>
      {children}
    </NavVariantContext.Provider>
  );
}

export function useNavVariant() {
  const context = useContext(NavVariantContext);

  if (!context) {
    throw new Error('useNavVariant must be used within a NavVariantProvider');
  }

  return context;
}
