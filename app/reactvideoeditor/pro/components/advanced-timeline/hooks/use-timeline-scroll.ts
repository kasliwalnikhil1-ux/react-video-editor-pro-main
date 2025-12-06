import { useCallback, useMemo } from 'react';
import { TIMELINE_CONSTANTS } from '../constants';
import { TimelineScrollUtils } from '../types';

/**
 * CSS selectors for the timeline scroll containers
 * All three need to be scrolled in sync for proper alignment
 */
const SCROLL_CONTAINER_SELECTORS = [
  '.timeline-tracks-scroll-container',  // Main tracks area
  '.timeline-content',                   // Parent content wrapper
  '.track-handles-scroll',               // Track handles on the left
] as const;

/**
 * Hook that provides scroll utilities for the timeline
 * 
 * Handles scrolling multiple synchronized containers:
 * - timeline-tracks-scroll-container: The main scrollable tracks area
 * - timeline-content: The parent content wrapper
 * - track-handles-scroll: The track handles column (must stay in sync)
 * 
 * @returns TimelineScrollUtils object with scroll methods
 * 
 * @example
 * ```tsx
 * const scrollUtils = useTimelineScroll();
 * 
 * // Scroll to top
 * scrollUtils.scrollToTop();
 * 
 * // Scroll to bottom
 * scrollUtils.scrollToBottom();
 * 
 * // Scroll to specific track (0-indexed)
 * scrollUtils.scrollToTrack(5);
 * 
 * // Get current scroll position
 * const { top, left } = scrollUtils.getScrollPosition();
 * 
 * // Set scroll position directly
 * scrollUtils.setScrollPosition({ top: 200 });
 * ```
 */
export function useTimelineScroll(): TimelineScrollUtils {
  // Helper to get all scroll containers that need to be synchronized
  const getScrollContainers = useCallback((): HTMLDivElement[] => {
    return SCROLL_CONTAINER_SELECTORS
      .map(selector => document.querySelector(selector))
      .filter((el): el is HTMLDivElement => el !== null);
  }, []);

  const scrollUtils = useMemo<TimelineScrollUtils>(() => ({
    /**
     * Scroll all timeline containers to the top
     */
    scrollToTop: () => {
      const containers = getScrollContainers();
      containers.forEach(container => {
        container.scrollTop = 0;
      });
    },

    /**
     * Scroll all timeline containers to the bottom
     */
    scrollToBottom: () => {
      const containers = getScrollContainers();
      containers.forEach(container => {
        container.scrollTop = container.scrollHeight;
      });
    },

    /**
     * Scroll to a specific track by index
     * @param trackIndex - Zero-based track index
     */
    scrollToTrack: (trackIndex: number) => {
      const containers = getScrollContainers();
      const targetScroll = trackIndex * TIMELINE_CONSTANTS.TRACK_HEIGHT;

      containers.forEach(container => {
        container.scrollTop = targetScroll;
      });
    },

    /**
     * Get the current scroll position
     * @returns Object with top and left scroll values
     */
    getScrollPosition: () => {
      const containers = getScrollContainers();
      const container = containers[0]; // Use first container as reference

      if (container) {
        return {
          top: container.scrollTop,
          left: container.scrollLeft,
        };
      }

      return { top: 0, left: 0 };
    },

    /**
     * Set scroll position directly
     * @param position - Object with optional top and left values
     */
    setScrollPosition: (position: { top?: number; left?: number }) => {
      const containers = getScrollContainers();

      containers.forEach(container => {
        if (position.top !== undefined) {
          container.scrollTop = position.top;
        }
        if (position.left !== undefined) {
          container.scrollLeft = position.left;
        }
      });
    },
  }), [getScrollContainers]);

  return scrollUtils;
}

export default useTimelineScroll;

