import React from 'react';
import { TimelineMarkers } from './';
import { getTimelineContentStyles } from '../utils';

interface TimelineMarkersSectionProps {
  viewportDuration: number;
  fps: number;
  zoomScale: number;
  onFrameChange?: (frame: number) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragStateChange: (isDragging: boolean) => void;
}

/**
 * Fixed markers section at the top of the timeline
 * Handles horizontal scrolling only while remaining fixed vertically
 */
export const TimelineMarkersSection: React.FC<TimelineMarkersSectionProps> = ({
  viewportDuration,
  fps,
  zoomScale,
  onFrameChange,
  onMouseMove,
  onMouseLeave,
  onDragStateChange,
}) => {
  return (
    <div className="timeline-markers-wrapper overflow-x-auto overflow-y-hidden scrollbar-hide flex-shrink-0">
      <div 
        className="timeline-markers-content"
        style={{
          ...getTimelineContentStyles(zoomScale),
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className="timeline-markers-container">
          <TimelineMarkers
            totalDuration={viewportDuration}
            onTimeClick={(timeInSeconds: number) => {
              const frame = Math.round(timeInSeconds * fps);
              onFrameChange?.(frame);
            }}
            onDragStateChange={onDragStateChange}
            zoomScale={zoomScale}
          />
        </div>
      </div>
    </div>
  );
};

