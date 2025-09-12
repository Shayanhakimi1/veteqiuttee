import { memo, useMemo, useCallback, lazy } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      componentMounts: 0,
      componentUpdates: 0,
      memoryUsage: []
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory usage every 30 seconds
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        if (performance.memory) {
          this.metrics.memoryUsage.push({
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now()
          });
          
          // Keep only last 100 measurements
          if (this.metrics.memoryUsage.length > 100) {
            this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
          }
        }
      }, 30000);
    }
  }

  // Track component render time
  trackRender(componentName, renderTime) {
    this.metrics.renderTimes.push({
      component: componentName,
      time: renderTime,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 render times
    if (this.metrics.renderTimes.length > 1000) {
      this.metrics.renderTimes = this.metrics.renderTimes.slice(-1000);
    }
    
    // Log slow renders
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  // Track component lifecycle
  trackMount(componentName) {
    this.metrics.componentMounts++;
    console.debug(`Component mounted: ${componentName}`);
  }

  trackUpdate(componentName) {
    this.metrics.componentUpdates++;
    console.debug(`Component updated: ${componentName}`);
  }

  // Get performance metrics
  getMetrics() {
    const avgRenderTime = this.metrics.renderTimes.length > 0
      ? this.metrics.renderTimes.reduce((sum, item) => sum + item.time, 0) / this.metrics.renderTimes.length
      : 0;
    
    const slowRenders = this.metrics.renderTimes.filter(item => item.time > 16).length;
    
    const currentMemory = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
      : null;
    
    return {
      averageRenderTime: avgRenderTime.toFixed(2),
      slowRenders,
      totalRenders: this.metrics.renderTimes.length,
      componentMounts: this.metrics.componentMounts,
      componentUpdates: this.metrics.componentUpdates,
      currentMemoryUsage: currentMemory ? {
        used: (currentMemory.used / 1024 / 1024).toFixed(2) + ' MB',
        total: (currentMemory.total / 1024 / 1024).toFixed(2) + ' MB',
        percentage: ((currentMemory.used / currentMemory.total) * 100).toFixed(2) + '%'
      } : null
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = {
      renderTimes: [],
      componentMounts: 0,
      componentUpdates: 0,
      memoryUsage: []
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Higher-order component for performance tracking
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  const TrackedComponent = memo((props) => {
    const startTime = performance.now();
    
    // Track mount
    React.useEffect(() => {
      performanceMonitor.trackMount(componentName);
    }, []);
    
    // Track updates
    React.useEffect(() => {
      performanceMonitor.trackUpdate(componentName);
    });
    
    // Track render time
    React.useLayoutEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.trackRender(componentName, renderTime);
    });
    
    return React.createElement(WrappedComponent, props);
  });
  
  TrackedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return TrackedComponent;
};

// Custom hook for performance optimization
export const usePerformanceOptimization = () => {
  // Memoized callback factory
  const createMemoizedCallback = useCallback((fn, deps) => {
    return useCallback(fn, deps);
  }, []);
  
  // Memoized value factory
  const createMemoizedValue = useCallback((fn, deps) => {
    return useMemo(fn, deps);
  }, []);
  
  // Debounced function
  const createDebouncedFunction = useCallback((fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), delay);
    };
  }, []);
  
  // Throttled function
  const createThrottledFunction = useCallback((fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);
  
  return {
    createMemoizedCallback,
    createMemoizedValue,
    createDebouncedFunction,
    createThrottledFunction
  };
};

// Lazy loading utilities
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Image optimization component
export const OptimizedImage = memo(({ src, alt, className, loading = 'lazy', ...props }) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);
  
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="w-full h-full bg-gray-300"></div>
      </div>
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY
  };
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const modules = require.cache;
    const moduleStats = {};
    
    Object.keys(modules).forEach(modulePath => {
      const module = modules[modulePath];
      if (module && module.exports) {
        const size = JSON.stringify(module.exports).length;
        moduleStats[modulePath] = size;
      }
    });
    
    const sortedModules = Object.entries(moduleStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.table(sortedModules.map(([path, size]) => ({
      module: path.split('/').pop(),
      size: `${(size / 1024).toFixed(2)} KB`
    })));
  }
};

// Performance debugging tools
export const PerformanceDebugger = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [metrics, setMetrics] = React.useState(null);
  
  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };
    
    if (isVisible) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        {isVisible ? 'Hide' : 'Show'} Performance
      </button>
      
      {isVisible && metrics && (
        <div className="mt-2 bg-black text-white p-4 rounded text-xs max-w-sm">
          <h3 className="font-bold mb-2">Performance Metrics</h3>
          <div>Avg Render Time: {metrics.averageRenderTime}ms</div>
          <div>Slow Renders: {metrics.slowRenders}</div>
          <div>Total Renders: {metrics.totalRenders}</div>
          <div>Component Mounts: {metrics.componentMounts}</div>
          <div>Component Updates: {metrics.componentUpdates}</div>
          {metrics.currentMemoryUsage && (
            <div>
              <div>Memory Used: {metrics.currentMemoryUsage.used}</div>
              <div>Memory Total: {metrics.currentMemoryUsage.total}</div>
              <div>Memory %: {metrics.currentMemoryUsage.percentage}</div>
            </div>
          )}
          <button
            onClick={() => performanceMonitor.clearMetrics()}
            className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Metrics
          </button>
        </div>
      )}
    </div>
  );
};

export default {
  PerformanceMonitor,
  performanceMonitor,
  withPerformanceTracking,
  usePerformanceOptimization,
  createLazyComponent,
  OptimizedImage,
  useVirtualScrolling,
  analyzeBundleSize,
  PerformanceDebugger
};