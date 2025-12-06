import { renderHook } from "@testing-library/react";
import { useTimelineComposition } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-composition";
import { TimelineTrack } from "app/reactvideoeditor/pro/components/advanced-timeline/types";

// Helper to create test tracks
const createTestTracks = (items: Array<{ start: number; end: number }>): TimelineTrack[] => [
  {
    id: "track-1",
    name: "Track 1",
    items: items.map((item, idx) => ({
      id: `item-${idx}`,
      trackId: "track-1",
      start: item.start,
      end: item.end,
    })),
  },
];

describe("useTimelineComposition", () => {
  describe("composition duration calculation", () => {
    it("should return totalDuration when no items exist", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10);
    });

    it("should return totalDuration when all items are within totalDuration", () => {
      const tracks = createTestTracks([
        { start: 0, end: 5 },
        { start: 5, end: 8 },
      ]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10);
    });

    it("should extend composition duration when items exceed totalDuration", () => {
      const tracks = createTestTracks([
        { start: 0, end: 5 },
        { start: 5, end: 15 }, // Extends beyond totalDuration
      ]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(15);
    });

    it("should find max end time across multiple tracks", () => {
      const tracks: TimelineTrack[] = [
        {
          id: "track-1",
          name: "Track 1",
          items: [
            { id: "item-1", trackId: "track-1", start: 0, end: 10 },
          ],
        },
        {
          id: "track-2",
          name: "Track 2",
          items: [
            { id: "item-2", trackId: "track-2", start: 5, end: 20 },
          ],
        },
        {
          id: "track-3",
          name: "Track 3",
          items: [
            { id: "item-3", trackId: "track-3", start: 0, end: 15 },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      // Should be the max end time (20) from track-2
      expect(result.current.compositionDuration).toBe(20);
    });

    it("should handle tracks with no items", () => {
      const tracks: TimelineTrack[] = [
        {
          id: "track-1",
          name: "Track 1",
          items: [],
        },
        {
          id: "track-2",
          name: "Track 2",
          items: [],
        },
      ];

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10);
    });

    it("should handle mix of empty and non-empty tracks", () => {
      const tracks: TimelineTrack[] = [
        {
          id: "track-1",
          name: "Track 1",
          items: [],
        },
        {
          id: "track-2",
          name: "Track 2",
          items: [
            { id: "item-1", trackId: "track-2", start: 0, end: 25 },
          ],
        },
        {
          id: "track-3",
          name: "Track 3",
          items: [],
        },
      ];

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(25);
    });

    it("should update when tracks change", () => {
      const initialTracks = createTestTracks([{ start: 0, end: 5 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks: initialTracks,
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.compositionDuration).toBe(10);

      // Update with longer tracks
      const updatedTracks = createTestTracks([
        { start: 0, end: 5 },
        { start: 5, end: 20 },
      ]);

      rerender({
        tracks: updatedTracks,
        totalDuration: 10,
        currentFrame: 0,
        fps: 30,
        zoomScale: 1,
      });

      expect(result.current.compositionDuration).toBe(20);
    });

    it("should update when totalDuration changes", () => {
      const tracks = createTestTracks([{ start: 0, end: 5 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks,
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.compositionDuration).toBe(10);

      // Increase totalDuration
      rerender({
        tracks,
        totalDuration: 30,
        currentFrame: 0,
        fps: 30,
        zoomScale: 1,
      });

      expect(result.current.compositionDuration).toBe(30);
    });
  });

  describe("viewport duration calculation", () => {
    it("should return composition duration when zoom scale is 1", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.viewportDuration).toBe(10);
      expect(result.current.compositionDuration).toBe(10);
    });

    it("should return composition duration when zoomed in (scale > 1)", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 2,
        })
      );

      // When zoomed in, viewport stays at composition duration
      expect(result.current.viewportDuration).toBe(10);
    });

    it("should expand viewport when zoomed out (scale < 1)", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 0.5,
        })
      );

      // When zoomed out at 0.5, viewport should be 10 * (1 / 0.5) = 20
      expect(result.current.viewportDuration).toBe(20);
    });

    it("should handle very small zoom scales", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 0.1,
        })
      );

      // Viewport should be 10 * (1 / 0.1) = 100
      expect(result.current.viewportDuration).toBe(100);
    });

    it("should update viewport when zoom scale changes", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks,
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.viewportDuration).toBe(10);

      // Zoom out
      rerender({
        tracks,
        totalDuration: 10,
        currentFrame: 0,
        fps: 30,
        zoomScale: 0.5,
      });

      expect(result.current.viewportDuration).toBe(20);

      // Zoom in
      rerender({
        tracks,
        totalDuration: 10,
        currentFrame: 0,
        fps: 30,
        zoomScale: 2,
      });

      expect(result.current.viewportDuration).toBe(10);
    });

    it("should use composition duration in viewport calculation", () => {
      // Items extend beyond totalDuration
      const tracks = createTestTracks([{ start: 0, end: 20 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 0.5,
        })
      );

      // Composition duration should be 20 (from items)
      expect(result.current.compositionDuration).toBe(20);
      // Viewport should be 20 * (1 / 0.5) = 40
      expect(result.current.viewportDuration).toBe(40);
    });
  });

  describe("current time calculation", () => {
    it("should convert frame to time at 30 fps", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 30,
          fps: 30,
          zoomScale: 1,
        })
      );

      // 30 frames at 30fps = 1 second
      expect(result.current.currentTime).toBe(1);
    });

    it("should convert frame to time at 60 fps", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 60,
          fps: 60,
          zoomScale: 1,
        })
      );

      // 60 frames at 60fps = 1 second
      expect(result.current.currentTime).toBe(1);
    });

    it("should handle frame 0", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.currentTime).toBe(0);
    });

    it("should handle large frame numbers", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 100,
          currentFrame: 3000,
          fps: 30,
          zoomScale: 1,
        })
      );

      // 3000 frames at 30fps = 100 seconds
      expect(result.current.currentTime).toBe(100);
    });

    it("should handle fractional results", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 45,
          fps: 30,
          zoomScale: 1,
        })
      );

      // 45 frames at 30fps = 1.5 seconds
      expect(result.current.currentTime).toBe(1.5);
    });

    it("should update when current frame changes", () => {
      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks: [],
            totalDuration: 10,
            currentFrame: 30,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.currentTime).toBe(1);

      // Update frame
      rerender({
        tracks: [],
        totalDuration: 10,
        currentFrame: 60,
        fps: 30,
        zoomScale: 1,
      });

      expect(result.current.currentTime).toBe(2);
    });

    it("should update when fps changes", () => {
      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks: [],
            totalDuration: 10,
            currentFrame: 60,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      // 60 frames at 30fps = 2 seconds
      expect(result.current.currentTime).toBe(2);

      // Change fps
      rerender({
        tracks: [],
        totalDuration: 10,
        currentFrame: 60,
        fps: 60,
        zoomScale: 1,
      });

      // 60 frames at 60fps = 1 second
      expect(result.current.currentTime).toBe(1);
    });
  });

  describe("memoization", () => {
    it("should memoize composition duration when inputs don't change", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks,
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      const firstDuration = result.current.compositionDuration;

      // Rerender with same tracks and totalDuration
      rerender({
        tracks,
        totalDuration: 10,
        currentFrame: 10, // Different frame (shouldn't affect composition)
        fps: 30,
        zoomScale: 1,
      });

      // Should be same reference (memoized)
      expect(result.current.compositionDuration).toBe(firstDuration);
    });

    it("should memoize viewport duration when composition and zoom don't change", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks,
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      const firstViewport = result.current.viewportDuration;

      // Rerender with different currentFrame (shouldn't affect viewport)
      rerender({
        tracks,
        totalDuration: 10,
        currentFrame: 30,
        fps: 30,
        zoomScale: 1,
      });

      expect(result.current.viewportDuration).toBe(firstViewport);
    });

    it("should memoize current time when frame and fps don't change", () => {
      const tracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks,
            totalDuration: 10,
            currentFrame: 30,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      const firstTime = result.current.currentTime;

      // Rerender with different zoom (shouldn't affect current time)
      rerender({
        tracks,
        totalDuration: 10,
        currentFrame: 30,
        fps: 30,
        zoomScale: 2,
      });

      expect(result.current.currentTime).toBe(firstTime);
    });
  });

  describe("edge cases", () => {
    it("should handle zero duration", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 0,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(0);
      expect(result.current.viewportDuration).toBe(0);
      expect(result.current.currentTime).toBe(0);
    });

    it("should handle very large durations", () => {
      const tracks = createTestTracks([{ start: 0, end: 10000 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 5000,
          currentFrame: 300000,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10000);
      expect(result.current.viewportDuration).toBe(10000);
      expect(result.current.currentTime).toBe(10000);
    });

    it("should handle items with same start and end", () => {
      const tracks = createTestTracks([{ start: 5, end: 5 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10);
    });

    it("should handle negative frame numbers gracefully", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: -30,
          fps: 30,
          zoomScale: 1,
        })
      );

      // -30 frames at 30fps = -1 second (technically valid)
      expect(result.current.currentTime).toBe(-1);
    });

    it("should handle fps of 1", () => {
      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks: [],
          totalDuration: 10,
          currentFrame: 5,
          fps: 1,
          zoomScale: 1,
        })
      );

      // 5 frames at 1fps = 5 seconds
      expect(result.current.currentTime).toBe(5);
    });

    it("should handle multiple items with overlapping ranges", () => {
      const tracks: TimelineTrack[] = [
        {
          id: "track-1",
          name: "Track 1",
          items: [
            { id: "item-1", trackId: "track-1", start: 0, end: 10 },
            { id: "item-2", trackId: "track-1", start: 5, end: 8 },
            { id: "item-3", trackId: "track-1", start: 3, end: 15 },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      // Should use the maximum end time (15)
      expect(result.current.compositionDuration).toBe(15);
    });

    it("should handle fractional time values", () => {
      const tracks = createTestTracks([{ start: 0.5, end: 10.75 }]);

      const { result } = renderHook(() =>
        useTimelineComposition({
          tracks,
          totalDuration: 10,
          currentFrame: 0,
          fps: 30,
          zoomScale: 1,
        })
      );

      expect(result.current.compositionDuration).toBe(10.75);
    });
  });

  describe("integration scenarios", () => {
    it("should handle dynamic content with zoom changes", () => {
      const initialTracks = createTestTracks([{ start: 0, end: 10 }]);

      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks: initialTracks,
            totalDuration: 10,
            currentFrame: 30,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.compositionDuration).toBe(10);
      expect(result.current.viewportDuration).toBe(10);
      expect(result.current.currentTime).toBe(1);

      // Zoom out and add content
      const extendedTracks = createTestTracks([
        { start: 0, end: 10 },
        { start: 10, end: 25 },
      ]);

      rerender({
        tracks: extendedTracks,
        totalDuration: 10,
        currentFrame: 60,
        fps: 30,
        zoomScale: 0.5,
      });

      expect(result.current.compositionDuration).toBe(25);
      expect(result.current.viewportDuration).toBe(50); // 25 * (1/0.5)
      expect(result.current.currentTime).toBe(2);
    });

    it("should handle playback with varying fps", () => {
      const { result, rerender } = renderHook(
        (props) => useTimelineComposition(props),
        {
          initialProps: {
            tracks: [],
            totalDuration: 10,
            currentFrame: 0,
            fps: 30,
            zoomScale: 1,
          },
        }
      );

      expect(result.current.currentTime).toBe(0);

      // Simulate playback at 30fps
      rerender({
        tracks: [],
        totalDuration: 10,
        currentFrame: 90,
        fps: 30,
        zoomScale: 1,
      });

      expect(result.current.currentTime).toBe(3);

      // Change to 60fps
      rerender({
        tracks: [],
        totalDuration: 10,
        currentFrame: 180,
        fps: 60,
        zoomScale: 1,
      });

      expect(result.current.currentTime).toBe(3);
    });
  });
});

