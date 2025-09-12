import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useVirtualScrolling } from '../../utils/performance';

// Virtual List Component for handling large datasets efficiently
const VirtualList = memo(({ 
  items = [], 
  itemHeight = 50, 
  containerHeight = 400, 
  renderItem, 
  className = '',
  onScroll,
  overscan = 5
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible items with overscan for smoother scrolling
  const visibleData = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan * 2
    );
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
  
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(e);
  }, [onScroll]);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleData.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleData.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleData.visibleItems.map((item, index) => (
            <div
              key={visibleData.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleData.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

// Optimized Table Component with virtual scrolling
export const VirtualTable = memo(({ 
  data = [], 
  columns = [], 
  rowHeight = 40, 
  headerHeight = 40,
  containerHeight = 400,
  className = '',
  onRowClick
}) => {
  const renderRow = useCallback((row, index) => (
    <div 
      className="flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => onRowClick?.(row, index)}
    >
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="px-4 py-2 flex-1"
          style={{ width: column.width || 'auto' }}
        >
          {column.render ? column.render(row[column.key], row, index) : row[column.key]}
        </div>
      ))}
    </div>
  ), [columns, onRowClick]);
  
  return (
    <div className={`border border-gray-300 rounded ${className}`}>
      {/* Header */}
      <div 
        className="flex bg-gray-100 border-b border-gray-300 font-semibold"
        style={{ height: headerHeight }}
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className="px-4 py-2 flex-1"
            style={{ width: column.width || 'auto' }}
          >
            {column.title}
          </div>
        ))}
      </div>
      
      {/* Virtual List Body */}
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight - headerHeight}
        renderItem={renderRow}
      />
    </div>
  );
});

VirtualTable.displayName = 'VirtualTable';

// Infinite Scroll Component
export const InfiniteScroll = memo(({ 
  items = [],
  hasMore = false,
  loadMore,
  loader = <div>Loading...</div>,
  endMessage = <div>No more items</div>,
  threshold = 100,
  renderItem,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  
  const handleScroll = useCallback(async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loading) {
      setLoading(true);
      try {
        await loadMore();
      } finally {
        setLoading(false);
      }
    }
  }, [hasMore, loading, loadMore, threshold]);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {loading && loader}
      {!hasMore && !loading && endMessage}
    </div>
  );
});

InfiniteScroll.displayName = 'InfiniteScroll';

// Optimized Grid Component
export const VirtualGrid = memo(({ 
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = 800,
  containerHeight = 600,
  gap = 10,
  renderItem,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const gridData = useMemo(() => {
    const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const rowHeight = itemHeight + gap;
    
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      totalRows,
      startRow + Math.ceil(containerHeight / rowHeight) + 1
    );
    
    const visibleItems = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          visibleItems.push({
            item: items[index],
            index,
            x: col * (itemWidth + gap),
            y: row * rowHeight
          });
        }
      }
    }
    
    return {
      visibleItems,
      totalHeight: totalRows * rowHeight,
      offsetY: startRow * rowHeight
    };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, scrollTop]);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: gridData.totalHeight, position: 'relative' }}>
        {gridData.visibleItems.map(({ item, index, x, y }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualGrid.displayName = 'VirtualGrid';

export default VirtualList;