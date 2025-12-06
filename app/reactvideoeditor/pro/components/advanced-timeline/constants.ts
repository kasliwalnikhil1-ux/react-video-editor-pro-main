// Timeline dimension constants
export const TIMELINE_CONSTANTS = {
  // Header height
  HEADER_HEIGHT: 80, // Height of timeline header
  
  // Track height - used for both timeline tracks and row handles
  TRACK_HEIGHT: 48, // Height of each track row

  TRACK_ITEM_HEIGHT: 40, // Height of each track item
  
  // Row handles width
  HANDLE_WIDTH: 94, // Width of row handles column
  
  // Timeline markers
  MARKERS_HEIGHT: 40, // Height of time markers area - increased to show labels
};

export const ZOOM_CONSTRAINTS = {
  min: 0.5, // Minimum zoom level (up to 100x zoom out capability)
  max: 5, // Maximum zoom level (5x zoom in capability)
  step: 0.15, // Smallest increment for manual zoom controls
  default: 1, // Default zoom level
  zoomStep: 0.15, // Zoom increment for zoom in/out buttons
  wheelStep: 0.1, // Zoom increment for mouse wheel (reduced sensitivity)
  transitionDuration: 100, // Animation duration in milliseconds
  easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Smooth easing function for zoom transitions
};

// Enhanced snapping configuration for timeline items
export const SNAPPING_CONFIG = {
  gridSize: 0.1, // Snap to 0.1 second intervals
  edgeSnapTolerance: 0.05, // Tolerance for edge snapping (in seconds) - smaller value = more precise snapping
  prioritizeEdgeSnap: true, // Prioritize edge snapping over grid snapping when both are available
};