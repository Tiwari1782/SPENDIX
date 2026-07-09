import { useState, useEffect, useRef } from 'react';

/**
 * usePageLoader — Two-phase loading hook
 * Phase 1: SpendixLoader (1 second minimum)
 * Phase 2: Skeleton loader (2 seconds minimum)
 * Phase 3: Actual content
 * 
 * Usage:
 *   const { phase, data } = usePageLoader(fetchFn);
 *   if (phase === 'loader') return <SpendixLoader />;
 *   if (phase === 'skeleton') return <SkeletonCard />;
 *   // render content with data
 */
export default function usePageLoader(fetchFn, deps = []) {
  const [phase, setPhase] = useState('loader'); // 'loader' | 'skeleton' | 'ready'
  const [data, setData] = useState(null);
  const fetchDone = useRef(false);
  const loaderDone = useRef(false);
  const skeletonDone = useRef(false);

  useEffect(() => {
    fetchDone.current = false;
    loaderDone.current = false;
    skeletonDone.current = false;
    setPhase('loader');

    let fetchedData = null;

    // Start the fetch
    const doFetch = async () => {
      try {
        fetchedData = await fetchFn();
      } catch {
        fetchedData = null;
      }
      fetchDone.current = true;
      tryAdvance();
    };

    // Phase 1 timer: 1 second for SpendixLoader
    const loaderTimer = setTimeout(() => {
      loaderDone.current = true;
      setPhase('skeleton');
      // Phase 2 timer: 2 seconds for skeleton
      const skeletonTimer = setTimeout(() => {
        skeletonDone.current = true;
        tryAdvance();
      }, 2000);
      timerRefs.push(skeletonTimer);
    }, 1000);

    const timerRefs = [loaderTimer];

    const tryAdvance = () => {
      if (fetchDone.current && skeletonDone.current) {
        setData(fetchedData);
        setPhase('ready');
      }
    };

    doFetch();

    return () => timerRefs.forEach(t => clearTimeout(t));
  }, deps);

  return { phase, data };
}
