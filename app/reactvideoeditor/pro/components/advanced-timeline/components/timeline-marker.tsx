import React from "react";

/**
 * Props for the TimelineMarker component.
 */
interface TimelineMarkerProps {
  /** Current frame position */
  currentFrame: number;
  
  /** Total duration in frames */
  totalDurationInFrames: number;
  
  /** Zoom scale for calculating position */
  zoomScale?: number;
}

/**
 * TimelineMarker component displays the current playback position as a vertical line.
 * Shows a red line with a triangle pointer at the top to indicate current frame.
 */
export const TimelineMarker: React.FC<TimelineMarkerProps> = ({
  currentFrame,
  totalDurationInFrames,
}) => {
  // Calculate the marker's position as a percentage
  const markerPosition = totalDurationInFrames > 0 
    ? (currentFrame / totalDurationInFrames) * 100 
    : 0;

  // Clamp position between 0 and 100
  const clampedPosition = Math.max(0, Math.min(100, markerPosition));

  return (
    <div
      className="absolute top-0 z-50"
      data-timeline-marker="playhead"
      style={{
        left: `${clampedPosition}%`,
        transform: "translateX(-50%)",
        height: "100%",
        width: "2px",
        pointerEvents: "none", // No interaction to prevent interference with resizing
      }}
    >
      {/* Main marker line */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[2px] bg-red-500 shadow-lg"
        style={{
          height: "100%",
        }}
      />

      {/* Clean rectangular marker head */}
      <div
        className="absolute -top-[2px] left-1/2 transform -translate-x-1/2 w-2.5 h-5 bg-red-500 rounded-sm shadow-sm"
      />
    </div>
  );
}; 