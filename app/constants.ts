import { Overlay, OverlayType } from "./reactvideoeditor/pro/types";

// Default and maximum number of rows to display in the editor
export const INITIAL_ROWS = 5;
export const MAX_ROWS = 8;
// Frames per second for video rendering
export const FPS = 30;

// Name of the component being tested/rendered
export const COMP_NAME = "TestComponent";

// Video configuration
export const DURATION_IN_FRAMES = 30;
export const VIDEO_WIDTH = 1280; // 720p HD video dimensions
export const VIDEO_HEIGHT = 720;

// UI configuration
export const ROW_HEIGHT = 44; // Slightly increased from 48
export const SHOW_LOADING_PROJECT_ALERT = true; // Controls visibility of asset loading indicator
export const DISABLE_MOBILE_LAYOUT = false;
export const SHOW_MOBILE_WARNING = true; // Show warning modal on mobile devices

/**
 * This constant disables video keyframe extraction in the browser. Enable this if you're working with
 * multiple videos or large video files to improve performance. Keyframe extraction is CPU-intensive and can
 * cause browser lag. For production use, consider moving keyframe extraction to the server side.
 * Future versions of Remotion may provide more efficient keyframe handling.
 */
export const DISABLE_VIDEO_KEYFRAMES = false;

// AWS deployment configuration
export const SITE_NAME = "example-site";
export const LAMBDA_FUNCTION_NAME =
  "remotion-render-4-0-356-mem2048mb-disk2048mb-120sec";
export const REGION = "us-east-1";

// Zoom control configuration
export const ZOOM_CONSTRAINTS = {
  min: 0.1, // Minimum zoom level (changed from 1)
  max: 30, // Maximum zoom level (increased from 10 for extreme zoom capability)
  step: 0.15, // Smallest increment for manual zoom controls
  default: 1, // Default zoom level
  zoomStep: 0.15, // Zoom increment for zoom in/out buttons
  wheelStep: 0.5, // Zoom increment for mouse wheel
  transitionDuration: 100, // Animation duration in milliseconds
  easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Smooth easing function for zoom transitions
};

// Timeline Snapping configuration
export const SNAPPING_CONFIG = {
  thresholdFrames: 1, // Default snapping sensitivity in frames
  enableVerticalSnapping: true, // Enable snapping to items in adjacent rows
};

// Add new constant for push behavior
export const ENABLE_PUSH_ON_DRAG = false; // Set to false to disable pushing items on drag

// Autosave configuration
export const AUTO_SAVE_INTERVAL = 10000; // Autosave every 10 seconds

// Overlay colors for timeline items
export const OVERLAY_COLORS = {
  TEXT: '#9E53E6', // blue
  IMAGE: '#10b981', // green
  VIDEO: '#8b5cf6', // purple
  SOUND: '#f59e0b', // amber
  CAPTION: '#6b7280', 
  STICKER: '#ec4899', // pink
  SHAPE: '#6b7280', // gray
  DEFAULT: '#9ca3af', // gray
} as const;

/**
 * Default duration for image overlays when added to an empty timeline
 * Equivalent to approximately 6.67 seconds at 30fps
 */
export const DEFAULT_IMAGE_DURATION_FRAMES = 200;

/**
 * Percentage of composition duration to use for smart image duration
 * When adding an image to a timeline with existing content, the image duration
 * will be set to this percentage of the total composition duration (0.2 = 20% or 1/5th)
 */
export const IMAGE_DURATION_PERCENTAGE = 0.2;

/**
 * Minimum composition duration in seconds
 * Used when calculating smart durations for empty timelines
 */
export const MINIMUM_COMPOSITION_DURATION_SECONDS = 1;

export const DEFAULT_OVERLAYS: Overlay[] = [
  {
    left: 215,
    top: 265,
    width: 859,
    height: 190,
    durationInFrames: 201,
    from: 363,
    row: 0,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "Theres never been a better time to create amazing video experiences on the web",
    styles: {
      fontSize: "3.5rem",
      fontWeight: "100",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade"
      },
      fontSizeScale: 2.5
    },
    id: 7
  },
  {
    left: 139,
    top: 229,
    width: 1003,
    height: 263,
    durationInFrames: 150,
    from: 591,
    row: 0,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "Video AI is evolving faster than ever before.",
    styles: {
      fontSize: "3.5rem",
      fontWeight: "100",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade"
      },
      fontSizeScale: 1.2
    },
    id: 16
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 360,
    from: 0,
    rotation: 0,
    row: 1,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "https://images.pexels.com/videos/854261/free-video-854261.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/854261/854261-hd_1280_720_30fps.mp4",
    videoStartTime: 0,
    mediaSrcDuration: 33.92,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      animation: {
        enter: "none",
        exit: "fade"
      }
    },
    id: 5
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 123,
    from: 462,
    rotation: 0,
    row: 1,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "https://images.pexels.com/videos/7722221/adult-aquarium-audience-band-7722221.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/7722221/7722221-hd_1280_720_25fps.mp4",
    videoStartTime: 0,
    mediaSrcDuration: 9.08,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      animation: {
        enter: "none",
        exit: "fade"
      }
    },
    id: 9
  },
  {
    left: 146,
    top: 324,
    width: 996,
    height: 72,
    durationInFrames: 120,
    from: 762,
    row: 1,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "React Video Editor is building for this future.",
    styles: {
      fontSize: "3.5rem",
      fontWeight: "100",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade"
      },
      fontSizeScale: 0.9
    },
    id: 14
  },
  {
    left: 236,
    top: 170,
    width: 816,
    height: 251,
    durationInFrames: 126,
    from: 885,
    row: 1,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "There's never been a better time to build.",
    styles: {
      fontSize: "3.5rem",
      fontWeight: "100",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade"
      }
    },
    id: 15
  },
  {
    left: 237,
    top: 235,
    width: 816,
    height: 251,
    durationInFrames: 102,
    from: 909,
    row: 2,
    rotation: 0,
    isDragging: false,
    type: OverlayType.TEXT,
    content: "What are you waiting for?",
    styles: {
      fontSize: "3.5rem",
      fontWeight: "100",
      color: "#FFFFFF",
      backgroundColor: "",
      fontFamily: "font-league-spartan",
      fontStyle: "normal",
      textDecoration: "none",
      lineHeight: "1",
      textAlign: "center",
      letterSpacing: "0.02em",
      textShadow: "2px 2px 0px rgba(0, 0, 0, 0.2)",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade"
      }
    },
    id: 17
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 279,
    from: 732,
    rotation: 0,
    row: 3,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "https://images.pexels.com/videos/7664770/pexels-photo-7664770.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/7664770/7664770-hd_1280_720_25fps.mp4",
    videoStartTime: 0,
    mediaSrcDuration: 14.44,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      animation: {
        enter: "fade",
        exit: "fade"
      }
    },
    id: 13
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 195,
    from: 318,
    rotation: 0,
    row: 4,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "https://images.pexels.com/videos/856142/free-video-856142.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/856142/856142-hd_1920_1080_30fps.mp4",
    videoStartTime: 0,
    mediaSrcDuration: 15.015,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      animation: {
        enter: "none",
        exit: "fade"
      }
    },
    id: 6
  },
  {
    left: 0,
    top: 0,
    width: 1280,
    height: 720,
    durationInFrames: 177,
    from: 573,
    rotation: 0,
    row: 4,
    isDragging: false,
    type: OverlayType.VIDEO,
    content: "https://images.pexels.com/videos/7180708/pexels-photo-7180708.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    src: "https://videos.pexels.com/video-files/7180708/7180708-hd_2048_1080_25fps.mp4",
    videoStartTime: 0,
    mediaSrcDuration: 40.96,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      animation: {
        enter: "fade",
        exit: "fade"
      }
    },
    id: 11
  },
  {
    type: OverlayType.SOUND,
    content: "Another Lowfi",
    src: "https://rwxrdxvxndclnqvznxfj.supabase.co/storage/v1/object/public/sounds/sound-3.mp3?t=2024-11-04T03%3A52%3A35.101Z",
    from: 150,
    row: 5,
    left: 0,
    top: 0,
    width: 1920,
    height: 100,
    rotation: 0,
    isDragging: false,
    durationInFrames: 861,
    styles: {
      opacity: 1
    },
    id: 4,
    startFromSound: 0
  }
];