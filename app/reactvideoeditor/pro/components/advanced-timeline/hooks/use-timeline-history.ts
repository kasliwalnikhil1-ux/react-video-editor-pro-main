import { useState, useCallback, useEffect, useRef } from "react";
import { TimelineTrack } from "../types";

interface HistoryState {
  past: TimelineTrack[][];
  present: TimelineTrack[];
  future: TimelineTrack[][];
}

export function useTimelineHistory(
  tracks: TimelineTrack[],
  setTracks: (tracks: TimelineTrack[]) => void,
  onTracksChange?: (tracks: TimelineTrack[]) => void,
  isDragging?: boolean
) {
  // Track if this is the very first change (initial project load)
  const isFirstChangeRef = useRef(true);
  
  // Track batching state for drag operations and slider changes
  const isBatchingRef = useRef(false);
  const batchStartStateRef = useRef<TimelineTrack[] | null>(null);
  const batchTimeoutRef = useRef<any| null>(null);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: tracks,
    future: [],
  });

  // Track if we're in the middle of an undo/redo operation to prevent infinite loops
  const isUndoRedoOperation = useRef(false);

  // Use the isDragging parameter passed from parent, default to false
  const isCurrentlyDragging = isDragging || false;

  // Function to commit a batch
  const commitBatch = useCallback(() => {
    if (!isBatchingRef.current) return;
    
    isBatchingRef.current = false;
    const startState = batchStartStateRef.current;
    batchStartStateRef.current = null;
    
    // Clear any pending timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    // Only record if there was actually a change from the start of the batch
    if (startState && JSON.stringify(startState) !== JSON.stringify(tracks)) {
      setHistory(prev => ({
        past: [...prev.past, startState],
        present: tracks,
        future: [], // Clear future when new action is performed
      }));
    } else {
      // Just update present state
      setHistory(prev => ({
        ...prev,
        present: tracks,
      }));
    }
  }, [tracks]);

  // Function to start batching (can be called externally for slider operations)
  const startBatch = useCallback(() => {
    if (!isBatchingRef.current) {
      isBatchingRef.current = true;
      batchStartStateRef.current = history.present;
    }
    
    // Clear any existing timeout and set a new one
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    // Auto-commit batch after 500ms of inactivity (for slider operations)
    batchTimeoutRef.current = setTimeout(() => {
      commitBatch();
    }, 500);
  }, [history.present, commitBatch]);

  // Update history when tracks change (but not during undo/redo operations)
  useEffect(() => {
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    // Handle drag state changes
    if (isCurrentlyDragging && !isBatchingRef.current) {
      // Start of drag operation - begin batching
      isBatchingRef.current = true;
      batchStartStateRef.current = history.present;
    } else if (!isCurrentlyDragging && isBatchingRef.current && !batchTimeoutRef.current) {
      // End of drag operation - commit the batch (only if not waiting for slider timeout)
      commitBatch();
      return;
    }

    setHistory((prev) => {
      // Don't record history if this change was from undo/redo
      if (prev.present === tracks) return prev;

      // Skip the very first initialization, but capture all subsequent changes
      if (isFirstChangeRef.current) {
        isFirstChangeRef.current = false;
        return {
          ...prev,
          present: tracks,
        };
      }

      // For non-drag changes, check if we should start batching
      if (!isCurrentlyDragging && !isBatchingRef.current) {
        // Check if this might be a property change (duration, position, etc.)
        const hasPropertyChanges = tracks.some((track, trackIndex) => {
          const prevTrack = prev.present[trackIndex];
          if (!prevTrack) return true;
          
          return track.items.some((item, itemIndex) => {
            const prevItem = prevTrack.items[itemIndex];
            if (!prevItem) return true;
            
            // Check for changes that might be from sliders or continuous adjustments
            return item.start !== prevItem.start || 
                   item.end !== prevItem.end ||
                   JSON.stringify(item.data) !== JSON.stringify(prevItem.data);
          });
        });
        
        if (hasPropertyChanges) {
          // Start batching for potential slider changes
          startBatch();
        }
      }

      // Don't record intermediate changes during batching
      if (isBatchingRef.current) {
        return {
          ...prev,
          present: tracks,
        };
      }

      // Record all other user changes normally
      return {
        past: [...prev.past, prev.present],
        present: tracks,
        future: [], // Clear future when new action is performed
      };
    });
  }, [tracks, isCurrentlyDragging, history.present, commitBatch, startBatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  const undo = useCallback(() => {
    // Don't allow undo during batch operations
    if (isBatchingRef.current) {
      return;
    }

    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];

      // Mark that we're performing an undo operation
      isUndoRedoOperation.current = true;

      // Update tracks directly
      setTracks(newPresent);
      onTracksChange?.(newPresent);

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, [setTracks, onTracksChange]);

  const redo = useCallback(() => {
    // Don't allow redo during batch operations
    if (isBatchingRef.current) {
      return;
    }

    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = prev.future[0];

      // Mark that we're performing a redo operation
      isUndoRedoOperation.current = true;

      // Update tracks directly
      setTracks(newPresent);
      onTracksChange?.(newPresent);

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, [setTracks, onTracksChange]);

  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: tracks,
      future: [],
    });
    isFirstChangeRef.current = false; // Reset initialization flag
  }, [tracks]);

  return {
    undo,
    redo,
    clearHistory,
    canUndo: history.past.length > 0 && !isBatchingRef.current,
    canRedo: history.future.length > 0 && !isBatchingRef.current,
    startBatch, // Expose for external use
    commitBatch, // Expose for external use
  };
} 