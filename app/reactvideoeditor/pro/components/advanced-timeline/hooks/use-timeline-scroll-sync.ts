import { useEffect } from 'react';
import { TimelineTrack } from '../types';

interface UseTimelineScrollSyncProps {
  tracks: TimelineTrack[];
}

/**
 * Hook to synchronize scroll positions between timeline components
 * 
 * Handles two types of scroll synchronization:
 * 1. Vertical scroll between track handles and timeline tracks
 * 2. Horizontal scroll between timeline markers and tracks
 */
export const useTimelineScrollSync = ({ tracks }: UseTimelineScrollSyncProps) => {
  // Synchronize vertical scroll between track handles and tracks
  useEffect(() => {
    const tracksScrollContainer = document.querySelector('.timeline-tracks-scroll-container');
    const handlesScrollContainer = document.querySelector('.track-handles-scroll');
    
    if (!tracksScrollContainer || !handlesScrollContainer) return;

    const handleTracksScroll = () => {
      handlesScrollContainer.scrollTop = tracksScrollContainer.scrollTop;
    };

    const handleHandlesScroll = () => {
      tracksScrollContainer.scrollTop = handlesScrollContainer.scrollTop;
    };

    tracksScrollContainer.addEventListener('scroll', handleTracksScroll);
    handlesScrollContainer.addEventListener('scroll', handleHandlesScroll);

    return () => {
      tracksScrollContainer.removeEventListener('scroll', handleTracksScroll);
      handlesScrollContainer.removeEventListener('scroll', handleHandlesScroll);
    };
  }, [tracks]);

  // Synchronize horizontal scroll between markers and tracks
  useEffect(() => {
    const markersScrollContainer = document.querySelector('.timeline-markers-wrapper');
    const tracksScrollContainer = document.querySelector('.timeline-tracks-scroll-container');
    
    if (!markersScrollContainer || !tracksScrollContainer) return;

    let isMarkersScrolling = false;
    let isTracksScrolling = false;

    const handleMarkersScroll = () => {
      if (isTracksScrolling) {
        isTracksScrolling = false;
        return;
      }
      isMarkersScrolling = true;
      tracksScrollContainer.scrollLeft = markersScrollContainer.scrollLeft;
    };

    const handleTracksScroll = () => {
      if (isMarkersScrolling) {
        isMarkersScrolling = false;
        return;
      }
      isTracksScrolling = true;
      markersScrollContainer.scrollLeft = tracksScrollContainer.scrollLeft;
    };

    markersScrollContainer.addEventListener('scroll', handleMarkersScroll);
    tracksScrollContainer.addEventListener('scroll', handleTracksScroll);

    return () => {
      markersScrollContainer.removeEventListener('scroll', handleMarkersScroll);
      tracksScrollContainer.removeEventListener('scroll', handleTracksScroll);
    };
  }, [tracks]);
};

