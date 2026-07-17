import { useCallback, useEffect, useState } from 'react';
import { apiError } from './api';

// Tiny data-fetching hook — handles loading / error / refetch so screens don't
// repeat the same boilerplate. `fetcher` should return the data (or a promise
// of it); `deps` controls when it re-runs (e.g. a route `id`).
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await run());
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, refetch: load };
}
