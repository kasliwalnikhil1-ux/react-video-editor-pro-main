// Timeline type definitions
import { AspectRatio, Overlay } from '../../types';

export enum TrackItemType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  CAPTION = "caption",
  STICKER = "sticker",
}

// A single timeline item (e.g., a clip, text overlay, etc.)
export interface TimelineItem {
  id: string;
  trackId: string;
  start: number; // in seconds - timeline position start
  end: number;   // in seconds - timeline position end
  label?: string;
  type?: TrackItemType | string; // using OverlayType enum with extensible string fallback
  color?: string; // optional styling
  data?: any;     // extra metadata for custom rendering
  // Media offset properties - for split video/audio clips
  mediaStart?: number; // in seconds - where to start playing the media file
  mediaEnd?: number;   // in seconds - where to end playing the media file
  mediaSrcDuration?: number; // in seconds - total duration of the source media file
}

// A track (row) in the timeline
export interface TimelineTrack {
  id: string;
  name?: string;
  items: TimelineItem[];
  magnetic?: boolean; // Whether magnetic timeline is enabled
  visible?: boolean;  // Whether track is visible
  muted?: boolean;    // Whether track is muted
}

// Timeline scroll utilities interface
export interface TimelineScrollUtils {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToTrack: (trackIndex: number) => void;
  getScrollPosition: () => { top: number; left: number };
  setScrollPosition: (position: { top?: number; left?: number }) => void;
}

// Timeline component ref interface for imperative methods
export interface TimelineRef {
  addNewItem: (itemData: {
    type: string;
    label?: string;
    duration?: number;
    color?: string;
    data?: any;
    preferredTrackId?: string;
    preferredStartTime?: number;
  }) => void;
  // Scroll utilities
  scroll: TimelineScrollUtils;
}

// Timeline component props
export interface TimelineProps {
  tracks: TimelineTrack[];
  totalDuration: number; // total timeline length in seconds
  currentFrame?: number; // current frame position
  fps?: number; // frames per second for frame to time conversion
  onFrameChange?: (frame: number) => void; // callback when frame changes
  onItemMove?: (itemId: string, newStart: number, newEnd: number, newTrackId: string) => void;
  onItemResize?: (itemId: string, newStart: number, newEnd: number) => void;
  onItemSelect?: (itemId: string) => void;
  onDeleteItems?: (itemIds: string[]) => void; // Callback when items should be deleted
  onDuplicateItems?: (itemIds: string[]) => void; // Callback when items should be duplicated
  onSplitItems?: (itemId: string, splitTime: number) => void; // Callback when item should be split
  selectedItemIds?: string[]; // Currently selected item IDs (supports multiple)
  onSelectedItemsChange?: (itemIds: string[]) => void; // Callback when selection changes
  onTracksChange?: (tracks: TimelineTrack[]) => void; // New callback for when tracks are updated internally
  onAddNewItem?: (item: Partial<TimelineItem> & { trackId: string; start: number; end: number }) => void; // Callback when new item should be added
  onNewItemDrop?: (itemType: string, trackIndex: number, startTime: number, itemData?: { duration?: number; label?: string; data?: any }) => void; // Callback when new item is dropped from external source
  showZoomControls?: boolean; // Optional zoom controls
  // Playback controls
  isPlaying?: boolean; // Current playback state
  onPlay?: () => void; // Callback when play is requested
  onPause?: () => void; // Callback when pause is requested
  onSeekToStart?: () => void; // Callback when seek to start is requested
  onSeekToEnd?: () => void; // Callback when seek to end is requested
  showPlaybackControls?: boolean; // Whether to show play/pause buttons
  // Playback speed controls
  playbackRate?: number; // Current playback speed multiplier
  setPlaybackRate?: (rate: number) => void; // Callback when playback rate changes
  // Auto-remove empty tracks
  autoRemoveEmptyTracks?: boolean; // Whether to automatically remove tracks when they become empty
  onAutoRemoveEmptyTracksChange?: (enabled: boolean) => void; // Callback when auto-remove setting changes
  // Timeline guidelines
  showTimelineGuidelines?: boolean; // Whether to show alignment guidelines when dragging
  // Undo/Redo controls
  showUndoRedoControls?: boolean; // Whether to show undo/redo controls in the header
  canUndo?: boolean; // Whether undo action is available
  canRedo?: boolean; // Whether redo action is available
  onUndo?: () => void; // Callback when undo is requested
  onRedo?: () => void; // Callback when redo is requested
  // Hide items during drag
  hideItemsOnDrag?: boolean; // Whether to hide selected timeline items during drag operations (default: false)
  // Track handle controls
  enableTrackDrag?: boolean; // Whether to show track drag/reorder handles (default: true)
  enableMagneticTrack?: boolean; // Whether to show magnetic track toggle buttons (default: true)
  enableTrackDelete?: boolean; // Whether to show track delete buttons (default: true)
  // Aspect ratio controls
  aspectRatio?: AspectRatio; // Current aspect ratio
  onAspectRatioChange?: (ratio: AspectRatio) => void; // Callback when aspect ratio changes
  showAspectRatioControls?: boolean; // Whether to show aspect ratio dropdown (default: false)
  // Visibility controls
  onCollapseChange?: (collapsed: boolean) => void; // Callback when timeline collapsed state changes
  // Debug export
  overlays?: Overlay[]; // Overlays data for debug export
}

// Timeline content area props
export interface TimelineContentProps {
  tracks: TimelineTrack[];
  totalDuration: number;
  viewportDuration: number;
  currentFrame: number;
  fps: number;
  zoomScale: number;
  onFrameChange?: (frame: number) => void;
  onItemSelect?: (itemId: string) => void;
  onDeleteItems?: (itemIds: string[]) => void; // Callback when items should be deleted
  onDuplicateItems?: (itemIds: string[]) => void; // Callback when items should be duplicated
  onSplitItems?: (itemId: string, splitTime: number) => void; // Callback when item should be split
  selectedItemIds?: string[]; // Currently selected item IDs (supports multiple)
  onSelectedItemsChange?: (itemIds: string[]) => void; // Callback when selection changes
  onItemMove?: (itemId: string, newStart: number, newEnd: number, newTrackId: string) => void;
  onItemResize?: (itemId: string, newStart: number, newEnd: number) => void;
  onNewItemDrop?: (
    itemType: string,
    trackIndex: number,
    startTime: number,
    itemData?: {
      duration?: number;
      label?: string;
      data?: any;
    }
  ) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  ghostMarkerPosition: number | null;
  isDragging: boolean;
  isContextMenuOpen: boolean;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  onInsertTrackAt?: (
    index: number,
    move?: { itemId: string; newStart: number; newEnd: number }
  ) => string;
  onInsertMultipleTracksAt?: (index: number, count: number) => string[];
  onCreateTracksWithItems?: (
    index: number, 
    trackItems: Array<{ trackId: string; items: Array<{ itemId: string; start: number; end: number }> }>
  ) => void;
  // Timeline guidelines
  showTimelineGuidelines?: boolean; // Whether to show alignment guidelines when dragging
  onContextMenuOpenChange?: (isOpen: boolean) => void; // New prop for context menu state
  // Splitting mode
  splittingEnabled?: boolean; // Whether splitting mode is enabled
  // Hide items during drag
  hideItemsOnDrag?: boolean; // Whether to hide selected timeline items during drag operations (default: false)
} 