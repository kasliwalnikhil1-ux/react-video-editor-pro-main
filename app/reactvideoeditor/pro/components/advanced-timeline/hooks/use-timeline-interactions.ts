import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to handle timeline mouse interactions
 * Uses CSS custom properties for ghost marker positioning to avoid React re-renders
 */
export const useTimelineInteractions = (timelineRef: React.RefObject<HTMLDivElement>) => {
  // Keep only essential React state that actually needs to trigger re-renders
  const [isDragging, setIsDragging] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  
  // Throttle mouse move updates to improve performance
  const throttleRef = useRef<number | null>(null);
  const lastPositionRef = useRef<number | null>(null);
  const isGhostMarkerVisibleRef = useRef<boolean>(false);

  // Handle mouse movement using CSS custom properties (no React re-renders!)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && timelineRef.current) {
      // Cancel previous throttled call
      if (throttleRef.current) {
        cancelAnimationFrame(throttleRef.current);
      }
      
      // Throttle using requestAnimationFrame for smooth 60fps updates
      throttleRef.current = requestAnimationFrame(() => {
        // USE THE EXACT SAME LOGIC AS TIMELINE-MARKERS CLICK HANDLING!
        // Find the timeline-markers-container element (same as what markers use)
        const container = document.querySelector('.timeline-markers-container') as HTMLElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickPosition = x / rect.width;
        
        // Convert to percentage (0-100)
        const position = Math.max(0, Math.min(100, clickPosition * 100));
        
        // Only update if position has changed significantly
        if (lastPositionRef.current === null || Math.abs(position - lastPositionRef.current) > 0.1) {
          // Update CSS custom property directly - NO REACT RE-RENDER!
          const precision = 2;
          
          // Find the root timeline container (parent of both tracks and overlay)
          const element = timelineRef.current;
          const rootContainer = element?.parentElement?.parentElement;
          if (rootContainer) {
            rootContainer.style.setProperty('--ghost-marker-position', `${position.toFixed(precision)}%`);
            rootContainer.style.setProperty('--ghost-marker-visible', '1');
          }

          lastPositionRef.current = position;
          isGhostMarkerVisibleRef.current = true;
        }
      });
    }
  }, [isDragging, timelineRef]);

  // Handle mouse leave to hide ghost marker
  const handleMouseLeave = useCallback(() => {
    // Cancel any pending throttled updates
    if (throttleRef.current) {
      cancelAnimationFrame(throttleRef.current);
      throttleRef.current = null;
    }
    
    // Hide ghost marker using CSS custom property - NO REACT RE-RENDER!
    if (timelineRef.current && isGhostMarkerVisibleRef.current) {
      // Find the root timeline container (parent of both tracks and overlay)
      const rootContainer = timelineRef.current.parentElement?.parentElement;
      if (rootContainer) {
        rootContainer.style.setProperty('--ghost-marker-visible', '0');
      }
      isGhostMarkerVisibleRef.current = false;
    }
    
    lastPositionRef.current = null;
  }, [timelineRef]);

  return {
    ghostMarkerPosition: null, // Legacy prop for backward compatibility - always null now
    isDragging,
    isContextMenuOpen,
    setIsDragging,
    setIsContextMenuOpen,
    handleMouseMove,
    handleMouseLeave,
  };
}; 