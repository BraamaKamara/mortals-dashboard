import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Optimized infinite scroll hook using Intersection Observer
 * @param {Function} loadMore - Function to call when loading more items
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether currently loading
 * @param {number} threshold - Distance from bottom to trigger (0.0 to 1.0)
 */
export function useInfiniteScroll(loadMore, hasMore, loading, threshold = 0.8) {
  const observerRef = useRef(null);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  // Update refs to avoid stale closures
  useEffect(() => {
    loadingRef.current = loading;
    hasMoreRef.current = hasMore;
  }, [loading, hasMore]);

  const lastElementRef = useCallback((node) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't observe if loading or no more items
    if (loadingRef.current || !hasMoreRef.current) return;

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadMore();
        }
      },
      {
        // Trigger when element is 80% visible
        threshold: threshold,
        // Add margin to trigger slightly before reaching element
        rootMargin: '100px'
      }
    );

    // Observe the node
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loadMore, threshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}

/**
 * Scroll position restoration
 */
export function useScrollRestoration(key) {
  const [shouldRestore, setShouldRestore] = useState(false);

  useEffect(() => {
    // Save scroll position before unmount
    return () => {
      sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString());
    };
  }, [key]);

  useEffect(() => {
    // Restore scroll position on mount
    const savedPosition = sessionStorage.getItem(`scroll_${key}`);
    if (savedPosition && !shouldRestore) {
      // Delay restoration slightly to ensure content is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
          setShouldRestore(true);
        });
      });
    }
  }, [key, shouldRestore]);

  const resetScroll = useCallback(() => {
    sessionStorage.removeItem(`scroll_${key}`);
  }, [key]);

  return { resetScroll };
}

/**
 * Virtual scrolling for extremely large lists
 * Only renders visible items + buffer
 */
export function useVirtualScroll(items, itemHeight, containerHeight = window.innerHeight, buffer = 5) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [scrollTop, itemHeight, containerHeight, buffer, items.length]);

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    onScroll,
    visibleRange
  };
}

/**
 * Debounced scroll detection
 */
export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking.current = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, threshold]);

  return scrollDirection;
}
