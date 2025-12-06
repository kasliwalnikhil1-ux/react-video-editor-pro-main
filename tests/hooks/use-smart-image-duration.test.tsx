import { renderHook } from "@testing-library/react";
import { useCompositionDuration } from "../../app/reactvideoeditor/pro/hooks/use-composition-duration";
import { Overlay, OverlayType } from "../../app/reactvideoeditor/pro/types";
import { 
  DEFAULT_IMAGE_DURATION_FRAMES, 
  MINIMUM_COMPOSITION_DURATION_SECONDS,
  IMAGE_DURATION_PERCENTAGE
} from "../../app/constants";

describe("useCompositionDuration - Smart Image Duration", () => {
  const fps = 30;

  it("should calculate composition duration based on existing overlays", () => {
    const overlays: Overlay[] = [
      {
        id: 0,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 300, // 10 seconds at 30fps
        row: 0,
        isDragging: false,
      } as Overlay,
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays, fps));

    expect(result.current.durationInFrames).toBe(300);
    expect(result.current.durationInSeconds).toBe(10);
  });

  it("should return minimum duration when no overlays exist", () => {
    const overlays: Overlay[] = [];

    const { result } = renderHook(() => useCompositionDuration(overlays, fps));

    // Minimum duration is 1 second (MINIMUM_COMPOSITION_DURATION_SECONDS)
    const minimumDurationFrames = fps * MINIMUM_COMPOSITION_DURATION_SECONDS;
    expect(result.current.durationInFrames).toBe(minimumDurationFrames);
    expect(result.current.durationInSeconds).toBe(MINIMUM_COMPOSITION_DURATION_SECONDS);
  });

  it("should calculate duration from multiple overlays with different end times", () => {
    const overlays: Overlay[] = [
      {
        id: 0,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 150, // Ends at frame 150
        row: 0,
        isDragging: false,
      } as Overlay,
      {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 100,
        durationInFrames: 200, // Ends at frame 300
        row: 1,
        isDragging: false,
      } as Overlay,
      {
        id: 2,
        type: OverlayType.IMAGE,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 50,
        durationInFrames: 100, // Ends at frame 150
        row: 2,
        isDragging: false,
      } as Overlay,
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays, fps));

    // The latest ending overlay is at frame 300 (from 100 + duration 200)
    expect(result.current.durationInFrames).toBe(300);
    expect(result.current.durationInSeconds).toBe(10);
  });

  it("should handle overlays starting at different times", () => {
    const overlays: Overlay[] = [
      {
        id: 0,
        type: OverlayType.IMAGE,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 200, // Starts at frame 200
        durationInFrames: 100, // Ends at frame 300
        row: 0,
        isDragging: false,
      } as Overlay,
    ];

    const { result } = renderHook(() => useCompositionDuration(overlays, fps));

    expect(result.current.durationInFrames).toBe(300);
  });

  it("should demonstrate smart image duration use case", () => {
    // Scenario: User has a video that is 600 frames (20 seconds at 30fps)
    const existingOverlays: Overlay[] = [
      {
        id: 0,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        from: 0,
        durationInFrames: 600, // 20 seconds
        row: 0,
        isDragging: false,
      } as Overlay,
    ];

    const { result } = renderHook(() =>
      useCompositionDuration(existingOverlays, fps)
    );

    // The composition duration should be 600 frames
    const compositionDuration = result.current.durationInFrames;
    expect(compositionDuration).toBe(600);

    // When user adds a new image, it should use IMAGE_DURATION_PERCENTAGE of the composition duration
    // Implementation: overlays.length > 0 ? Math.round(durationInFrames * IMAGE_DURATION_PERCENTAGE) : DEFAULT_IMAGE_DURATION_FRAMES
    const smartDuration = existingOverlays.length > 0 
      ? Math.round(compositionDuration * IMAGE_DURATION_PERCENTAGE)
      : DEFAULT_IMAGE_DURATION_FRAMES;
    expect(smartDuration).toBe(120); // 600 * 0.2 = 120 frames (4 seconds)
    expect(smartDuration).toBeLessThan(compositionDuration); // A fraction of the composition
  });

  it("should fallback to default duration for empty composition", () => {
    const existingOverlays: Overlay[] = [];

    const { result } = renderHook(() =>
      useCompositionDuration(existingOverlays, fps)
    );

    const compositionDuration = result.current.durationInFrames;
    const minimumDurationFrames = fps * MINIMUM_COMPOSITION_DURATION_SECONDS;
    expect(compositionDuration).toBe(minimumDurationFrames);

    // When adding an image to empty composition, we check if there are existing overlays
    // Implementation: overlays.length > 0 ? durationInFrames : DEFAULT_IMAGE_DURATION_FRAMES
    const smartDuration = existingOverlays.length > 0 ? compositionDuration : DEFAULT_IMAGE_DURATION_FRAMES;
    expect(smartDuration).toBe(DEFAULT_IMAGE_DURATION_FRAMES);
  });
});
