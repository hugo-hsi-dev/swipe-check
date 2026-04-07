import { useEffect, useState } from 'react';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export type IconFontsState = {
  error: Error | null;
  isLoading: boolean;
};

export function useIconFonts(): IconFontsState {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFonts() {
      try {
        await Promise.all([Ionicons.loadFont(), MaterialIcons.loadFont()]);
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught : new Error(String(caught)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { error, isLoading };
}
