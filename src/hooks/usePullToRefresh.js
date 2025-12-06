import { useState, useEffect, useRef } from 'react';

export function usePullToRefresh(onRefresh, threshold = 80) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Only enable on mobile/touch devices
    if (!('ontouchstart' in window)) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Only trigger if scrolled to top
      if (window.scrollY === 0 && container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only pull down (positive distance) and when at top
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setIsPulling(true);
        // Apply resistance effect (harder to pull as distance increases)
        const resistance = Math.pow(distance / threshold, 0.7) * threshold;
        setPullDistance(Math.min(resistance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (isRefreshing) return;

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, pullDistance, isRefreshing]);

  return { 
    containerRef, 
    isPulling: isPulling || isRefreshing, 
    pullDistance,
    isRefreshing 
  };
}

export function PullToRefreshIndicator({ isPulling, isRefreshing, pullDistance }) {
  const rotation = Math.min((pullDistance / 80) * 360, 360);

  return (
    <div 
      className="ptr-indicator"
      style={{
        top: isPulling ? `${Math.min(pullDistance - 40, 20)}px` : '-60px',
        opacity: isPulling ? 1 : 0
      }}
    >
      <div 
        style={{
          transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
          transition: isRefreshing ? 'none' : 'transform 0.1s ease'
        }}
      >
        {isRefreshing ? (
          <div className="animate-spin text-amber-600 text-2xl">⟳</div>
        ) : (
          <div className="text-amber-600 text-2xl">↓</div>
        )}
      </div>
    </div>
  );
}
