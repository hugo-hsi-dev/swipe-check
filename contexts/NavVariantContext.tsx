import React, { createContext, useContext } from 'react';

import type { NavVariantName } from '@/constants/nav-variants';

type NavVariantContextValue = {
  activeVariant: NavVariantName;
};

const NavVariantContext = createContext<NavVariantContextValue>({
  activeVariant: 'C',
});

export function NavVariantProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavVariantContext.Provider value={{ activeVariant: 'C' }}>
      {children}
    </NavVariantContext.Provider>
  );
}

export function useNavVariant() {
  return useContext(NavVariantContext);
}
