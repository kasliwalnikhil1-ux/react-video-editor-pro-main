import React from 'react';
import { Video, Loader2 } from 'lucide-react';
import { TimelineItemLabel } from './timeline-item-label';

interface VideoItemContentProps {
  label?: string;
  data?: {
    thumbnailUrl?: string;
    thumbnails?: string[];
    thumbnailTimestamps?: number[];
    duration?: number;
    fps?: number;
    resolution?: string;
    codec?: string;
    originalUrl?: string;
    src?: string; // Video source URL or File
    width?: number;
    height?: number;
    // Content timing properties
    startFromVideo?: number; // Start time in the source video (in seconds)
    endFromVideo?: number; // End time in the source video (in seconds)
    isLoadingThumbnails?: boolean; // Added from enhanced data
    thumbnailError?: string; // Added from enhanced data
  };
  itemWidth: number;
  itemHeight: number;
  start: number;
  end: number;
  isHovering?: boolean;
  onThumbnailDisplayChange?: (isShowingThumbnails: boolean) => void; // Callback to notify parent when thumbnails are displayed
}

export const VideoItemContent: React.FC<VideoItemContentProps> = ({
  label,
  data,
  itemWidth,
  isHovering = false,
  onThumbnailDisplayChange
}) => {
  const thumbnails = data?.thumbnails;
  const isLoadingThumbnails = data?.isLoadingThumbnails;
  const thumbnailError = data?.thumbnailError;

  const showLabelOnHover = false;

  // Determine if we're showing thumbnails
  const isShowingThumbnails = thumbnails && thumbnails.length > 0 && !isLoadingThumbnails;

  // Notify parent component when thumbnail display state changes
  React.useEffect(() => {
    onThumbnailDisplayChange?.(!!isShowingThumbnails);
  }, [isShowingThumbnails, onThumbnailDisplayChange]);

  // If we have thumbnails and enough width to display them meaningfully
  if (isShowingThumbnails) {
    const thumbnailWidth = itemWidth / thumbnails.length;
    
    return (
      <div className="flex items-center h-full w-full overflow-hidden relative rounded-[3px]">
        {/* Thumbnail strip */}
        <div className="flex-1 flex h-full">
          {thumbnails.map((thumbnail, index) => (
            <div
              key={index}
              className="shrink-0 h-full last:border-r-0 overflow-hidden relative"
              style={{ width: thumbnailWidth }}
            >
              <img
                src={thumbnail}
                alt={`Frame ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                style={{
                  imageRendering: 'crisp-edges'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Overlay label when hovering or if item is very narrow */}
        {(isHovering || itemWidth < 80) && showLabelOnHover && ( // Reduced from 120 to 80px to better accommodate higher thumbnail density
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xs">
            <TimelineItemLabel 
              icon={Video}
              label={"VIDEO"}
              defaultLabel="VIDEO"
              isHovering={isHovering}
            />
          </div>
        )}
      </div>
    );
  }

  // Show loading state
  if (isLoadingThumbnails && (data?.src || data?.originalUrl)) {
    return (
      <TimelineItemLabel 
        icon={Loader2}
        label={"Loading..."}
        defaultLabel="VIDEO"
        iconClassName="w-4 h-4 animate-spin text-white/60"
        isHovering={isHovering}
      />
    );
  }

  // Show error state if thumbnail generation failed
  if (thumbnailError) {
    return (
      <TimelineItemLabel 
        icon={Video}
        label={"VIDEO"}
        defaultLabel="VIDEO"
        iconClassName="w-4 h-4 text-red-400"
        isHovering={isHovering}
      />
    );
  }

  // Fallback to simple label (no video source or small width)
  return (
    <TimelineItemLabel 
      icon={Video}
      label={label}
      defaultLabel="VIDEO"
      isHovering={isHovering}
    />
  );
}; 