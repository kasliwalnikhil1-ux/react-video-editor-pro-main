import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { TimelineHeader, TimelineTrackHandles, TimelineContent } from './components';
import { 
  useTimelineZoom, 
  useTimelineInteractions, 
  useTimelineTracks,
  useTimelineSettings,
  useTimelineComposition,
  useTimelineOperations,
  useTimelineHistory,
  useTimelineShortcuts,
  useMobileDetection,
  useTimelineScrollSync,
  useTimelineScroll,
} from './hooks';
import { useTimelineStore } from './stores';
import { TimelineProps, TimelineRef } from './types';

/**
 * Timeline Component with Comprehensive Theming Support
 * 
 * This component now uses CSS custom properties for theming, providing:
 * - Consistent color usage across light, dark, and RVE themes
 * - Smooth transitions between theme changes
 * - Proper semantic color mapping for timeline elements
 * 
 * Theme Variables Used:
 * - --background: Main timeline container background
 * - --surface: Timeline content area background
 * - --surface-elevated: Track handles and header backgrounds
 * - --border: All border colors
 * - --timeline-row: Individual track row backgrounds
 * - --timeline-tick: Marker tick colors
 * - --timeline-item-selected-border: Selected timeline item borders
 * - --interactive-hover: Hover states for interactive elements
 * - --interactive-pressed: Active/pressed states
 * - --primary-50/300: Drop target highlighting
 * - --text-secondary: Marker labels
 * - --text-disabled: Disabled/overflow text
 */

// Re-export types for backward compatibility
export type { TimelineItem, TimelineTrack, TimelineProps } from './types';

export const Timeline = forwardRef<TimelineRef, TimelineProps>(({ 
  tracks: initialTracks, 
  totalDuration, 
  currentFrame = 0,
  fps = 30,
  onFrameChange,
  onItemMove,
  onItemResize,
  onItemSelect,
  onDeleteItems,
  onDuplicateItems,
  onSplitItems,
  selectedItemIds = [],
  onSelectedItemsChange,
  onTracksChange,
  onAddNewItem,
  onNewItemDrop,
  showZoomControls = false,
  isPlaying = false,
  onPlay,
  onPause,
  onSeekToStart,
  onSeekToEnd,
  showPlaybackControls = false,
  playbackRate = 1,
  setPlaybackRate,
  autoRemoveEmptyTracks = true,
  onAutoRemoveEmptyTracksChange,
  showTimelineGuidelines = true,
  showUndoRedoControls = false,
  hideItemsOnDrag = true,
  enableTrackDrag = true,
  enableMagneticTrack = true,
  enableTrackDelete = true,
  // Undo/Redo props from parent
  canUndo: parentCanUndo,
  canRedo: parentCanRedo,
  onUndo: parentOnUndo,
  onRedo: parentOnRedo,
  // Aspect ratio props
  aspectRatio,
  onAspectRatioChange,
  showAspectRatioControls = true,
  // Visibility controls
  onCollapseChange,
  // Debug export
  overlays = [],
}, ref) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Timeline scroll utilities
  const scrollUtils = useTimelineScroll();
  
  // Detect mobile devices to adjust UX behavior
  const { isMobile } = useMobileDetection();
  
  // Get drag state from timeline store
  const { isDragging: timelineStoreDragging } = useTimelineStore();
  
  // On mobile devices, don't hide items during drag to maintain better UX
  const effectiveHideItemsOnDrag = isMobile ? false : hideItemsOnDrag;
  
  // Initialize all hooks
  const { zoomScale, setZoomScale, handleWheelZoom } = useTimelineZoom(timelineRef);
  
  const {
    ghostMarkerPosition,
    isDragging,
    handleMouseMove,
    handleMouseLeave,
  } = useTimelineInteractions(timelineRef);
  
  const {
    isAutoRemoveEnabled,
    isSplittingEnabled,
    handleToggleAutoRemoveEmptyTracks,
    handleToggleSplitting,
  } = useTimelineSettings({ 
    autoRemoveEmptyTracks, 
    onAutoRemoveEmptyTracksChange 
  });
  
  const {
    tracks,
    setTracks,
    handleItemMove: internalItemMove,
    handleItemResize: internalItemResize,
    handleItemsDelete: internalItemsDelete,
    handleInsertTrackAt,
    handleInsertMultipleTracksAt,
    handleCreateTracksWithItems,
    handleTrackReorder,
    handleTrackDelete,
    handleToggleMagnetic,
    addNewItem,
  } = useTimelineTracks({ 
    initialTracks, 
    autoRemoveEmptyTracks: isAutoRemoveEnabled, 
    onTracksChange,
    selectedItemIds,
    onSelectedItemsChange
  });

  // Timeline history for undo/redo
  const {
    undo: internalUndo,
    redo: internalRedo,
    canUndo: internalCanUndo,
    canRedo: internalCanRedo,
  } = useTimelineHistory(tracks, setTracks, onTracksChange, timelineStoreDragging);

  // Use parent undo/redo props if provided, otherwise use internal timeline history
  const undo = parentOnUndo || internalUndo;
  const redo = parentOnRedo || internalRedo;
  const canUndo = parentCanUndo !== undefined ? parentCanUndo : internalCanUndo;
  const canRedo = parentCanRedo !== undefined ? parentCanRedo : internalCanRedo;

  // Create handlePlayPause function for keyboard shortcuts
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  // Setup keyboard shortcuts
  useTimelineShortcuts({
    handlePlayPause,
    undo,
    redo,
    canUndo,
    canRedo,
    zoomScale,
    setZoomScale,
  });
  
  const {
    handleExternalItemMove,
    handleExternalItemResize,
    handleExternalItemsDelete,
    handleExternalItemsDuplicate,
    handleExternalItemSplit,
    handleExternalAddNewItem,
  } = useTimelineOperations({
    onItemMove,
    onItemResize,
    onDeleteItems,
    onDuplicateItems,
    onSplitItems,
    onAddNewItem,
  });
  
  const { compositionDuration, viewportDuration, currentTime } = useTimelineComposition({
    tracks,
    totalDuration,
    currentFrame,
    fps,
    zoomScale,
  });

  // Manage context menu state
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  
  const handleContextMenuOpenChange = useCallback((isOpen: boolean) => {
    setIsContextMenuOpen(isOpen);
  }, []);

  // Manage timeline collapse state
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  
  const handleToggleCollapse = useCallback(() => {
    setIsTimelineCollapsed(prev => {
      const newValue = !prev;
      onCollapseChange?.(newValue);
      return newValue;
    });
  }, [onCollapseChange]);

  // Combined handlers that call both internal and external callbacks
  const handleCombinedItemMove = useCallback((itemId: string, newStart: number, newEnd: number, newTrackId: string) => {
    internalItemMove(itemId, newStart, newEnd, newTrackId);
    handleExternalItemMove(itemId, newStart, newEnd, newTrackId);
  }, [internalItemMove, handleExternalItemMove]);

  // Helper function to check if playhead is over the selected item
  const isPlayheadOverSelectedItem = useCallback(() => {
    if (selectedItemIds.length !== 1) return false;

    const selectedItemId = selectedItemIds[0];
    const currentTimeInSeconds = currentFrame / fps;
    
    // Find the selected item across all tracks
    for (const track of tracks) {
      const item = track.items.find(item => item.id === selectedItemId);
      if (item) {
        // Check if the current playhead is within the item's time range
        return currentTimeInSeconds >= item.start && currentTimeInSeconds <= item.end;
      }
    }
    return false;
  }, [selectedItemIds, currentFrame, fps, tracks]);

  // Handler for splitting selected item at current playhead position
  const handleSplitAtSelection = useCallback(() => {
    if (selectedItemIds.length !== 1) {
      console.warn('Split at selection requires exactly one selected item');
      return;
    }

    const selectedItemId = selectedItemIds[0];
    const currentTimeInSeconds = currentFrame / fps;
    
    // Find the selected item across all tracks
    let selectedItem = null;
    for (const track of tracks) {
      const item = track.items.find(item => item.id === selectedItemId);
      if (item) {
        selectedItem = item;
        break;
      }
    }

    if (!selectedItem) {
      console.warn('Selected item not found in tracks');
      return;
    }

    // Check if the current playhead is within the item's time range
    if (currentTimeInSeconds < selectedItem.start || currentTimeInSeconds > selectedItem.end) {
      console.warn('Current playhead is not within the selected item\'s time range');
      return;
    }

    // Check minimum segment duration (same as existing splitting logic)
    const minSegmentDuration = 0.016; // ~1 frame at 60fps
    const leftSegmentDuration = currentTimeInSeconds - selectedItem.start;
    const rightSegmentDuration = selectedItem.end - currentTimeInSeconds;

    if (leftSegmentDuration < minSegmentDuration || rightSegmentDuration < minSegmentDuration) {
      console.warn('Split rejected: segments would be too small', {
        leftSegment: leftSegmentDuration,
        rightSegment: rightSegmentDuration,
        minRequired: minSegmentDuration
      });
      return;
    }

    // Perform the split
    handleExternalItemSplit(selectedItemId, currentTimeInSeconds);
  }, [selectedItemIds, currentFrame, fps, tracks, handleExternalItemSplit]);

  const handleCombinedItemResize = useCallback((itemId: string, newStart: number, newEnd: number) => {
    internalItemResize(itemId, newStart, newEnd);
    handleExternalItemResize(itemId, newStart, newEnd);
  }, [internalItemResize, handleExternalItemResize]);

  const handleCombinedItemsDelete = useCallback((itemIds: string[]) => {
    internalItemsDelete(itemIds);
    handleExternalItemsDelete(itemIds);
  }, [internalItemsDelete, handleExternalItemsDelete]);

  const handleCombinedAddNewItem = useCallback((itemData: {
    type: string;
    label?: string;
    duration?: number;
    color?: string;
    data?: any;
    preferredTrackId?: string;
    preferredStartTime?: number;
  }) => {
    const createdItem = addNewItem(itemData, currentFrame, fps) as any;
    if (createdItem) {
      handleExternalAddNewItem({
        ...itemData,
        trackId: createdItem.trackId,
        start: createdItem.start,
        end: createdItem.end,
      });
    }
  }, [addNewItem, currentFrame, fps, handleExternalAddNewItem]);

  // Enhanced auto-remove handler that applies changes immediately
  const handleEnhancedToggleAutoRemoveEmptyTracks = useCallback((enabled: boolean) => {
    handleToggleAutoRemoveEmptyTracks(enabled);
    
    // If enabling auto-remove, immediately clean up empty tracks
    if (enabled && onTracksChange) {
      const filteredTracks = tracks.filter(track => track.items.length > 0);
      const updatedTracks = filteredTracks.length === 0 ? [tracks[0] || {
        id: `track-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: undefined,
        items: [],
      }] : filteredTracks;
      onTracksChange(updatedTracks);
    }
  }, [handleToggleAutoRemoveEmptyTracks, tracks, onTracksChange]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addNewItem: handleCombinedAddNewItem,
    scroll: scrollUtils
  }), [handleCombinedAddNewItem, scrollUtils]);

  // Add wheel zoom event listener
  useEffect(() => {
    const element = timelineRef?.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => element.removeEventListener("wheel", handleWheelZoom);
  }, [handleWheelZoom]);

  // Synchronize scroll between timeline components
  useTimelineScrollSync({ tracks });

  return (
    <div className="timeline-container bg-background flex flex-col h-full overflow-hidden">
      <TimelineHeader 
        totalDuration={compositionDuration}
        currentTime={currentTime}
        showZoomControls={showZoomControls}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onSeekToStart={onSeekToStart}
        onSeekToEnd={onSeekToEnd}
        showPlaybackControls={showPlaybackControls}
        playbackRate={playbackRate}
        setPlaybackRate={setPlaybackRate}
        autoRemoveEmptyTracks={isAutoRemoveEnabled}
        onToggleAutoRemoveEmptyTracks={handleEnhancedToggleAutoRemoveEmptyTracks}
        splittingEnabled={isSplittingEnabled}
        onToggleSplitting={handleToggleSplitting}
        onSplitAtSelection={handleSplitAtSelection}
        hasSelectedItem={selectedItemIds.length === 1 && isPlayheadOverSelectedItem()}
        selectedItemsCount={selectedItemIds.length}
        showSplitAtSelection={true}
        showUndoRedoControls={showUndoRedoControls}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        aspectRatio={aspectRatio}
        onAspectRatioChange={onAspectRatioChange}
        showAspectRatioControls={showAspectRatioControls}
        overlays={overlays}
        isCollapsed={isTimelineCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Tracks container - flex layout with scroll */}
      <div 
        className="timeline-tracks-wrapper flex flex-1 overflow-hidden"
        style={{ display: isTimelineCollapsed ? 'none' : 'flex' }}
      >
        <div className="hidden md:block">
          <TimelineTrackHandles 
            tracks={tracks} 
            onTrackReorder={handleTrackReorder}
            onTrackDelete={handleTrackDelete}
            onToggleMagnetic={handleToggleMagnetic}
            enableTrackDrag={enableTrackDrag}
            enableMagneticTrack={enableMagneticTrack}
            enableTrackDelete={enableTrackDelete}
          />
        </div>
        
        <div className="timeline-content flex-1 relative bg-surface overflow-auto">
          <TimelineContent
            tracks={tracks}
            totalDuration={compositionDuration}
            viewportDuration={viewportDuration}
            currentFrame={currentFrame}
            fps={fps}
            zoomScale={zoomScale}
            onFrameChange={onFrameChange}
            onItemSelect={onItemSelect}
            onDeleteItems={handleCombinedItemsDelete}
            onDuplicateItems={handleExternalItemsDuplicate}
            onSplitItems={handleExternalItemSplit}
            selectedItemIds={selectedItemIds}
            onSelectedItemsChange={onSelectedItemsChange}
            onItemMove={handleCombinedItemMove}
            onItemResize={handleCombinedItemResize}
            onNewItemDrop={onNewItemDrop}
            timelineRef={timelineRef}
            ghostMarkerPosition={ghostMarkerPosition}
            isDragging={isDragging}
            isContextMenuOpen={isContextMenuOpen}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onInsertTrackAt={handleInsertTrackAt}
            onInsertMultipleTracksAt={handleInsertMultipleTracksAt}
            onCreateTracksWithItems={handleCreateTracksWithItems}
            showTimelineGuidelines={showTimelineGuidelines}
            onContextMenuOpenChange={handleContextMenuOpenChange}
            splittingEnabled={isSplittingEnabled}
            hideItemsOnDrag={effectiveHideItemsOnDrag}
          />
        </div>
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;