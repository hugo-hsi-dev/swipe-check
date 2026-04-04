import { useEffect, useState } from 'react';

import { bootstrapSQLite, getBootstrapGeneration } from '@/lib/local-data/sqlite';
import type { BootstrapResult } from '@/lib/local-data/bootstrap';

type AppBootstrapState = {
  bootstrapResult: BootstrapResult | null;
  bootstrapError: Error | null;
  isBootstrapping: boolean;
};

export function useAppBootstrap(pathname: string): AppBootstrapState {
  const [bootstrapResult, setBootstrapResult] = useState<BootstrapResult | null>(null);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [lastGeneration, setLastGeneration] = useState(getBootstrapGeneration());

  useEffect(() => {
    let isMounted = true;
    const currentGeneration = getBootstrapGeneration();

    async function runBootstrap() {
      try {
        const result = await bootstrapSQLite();

        if (isMounted) {
          setBootstrapResult(result);
          setLastGeneration(getBootstrapGeneration());
        }
      } catch (error) {
        if (isMounted) {
          setBootstrapError(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    if (currentGeneration !== lastGeneration) {
      setIsBootstrapping(true);
      runBootstrap();
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, lastGeneration]);

  return { bootstrapResult, bootstrapError, isBootstrapping };
}
