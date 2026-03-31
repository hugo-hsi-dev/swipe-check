import { useEffect, useState } from 'react';

import { bootstrapSQLite } from '@/lib/local-data/sqlite';
import type { BootstrapResult } from '@/lib/local-data/bootstrap';

type AppBootstrapState = {
  bootstrapResult: BootstrapResult | null;
  bootstrapError: Error | null;
  isBootstrapping: boolean;
};

export function useAppBootstrap(): AppBootstrapState {
  const [bootstrapResult, setBootstrapResult] = useState<BootstrapResult | null>(null);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function runBootstrap() {
      try {
        const result = await bootstrapSQLite();

        if (isMounted) {
          setBootstrapResult(result);
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

    runBootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return { bootstrapResult, bootstrapError, isBootstrapping };
}
