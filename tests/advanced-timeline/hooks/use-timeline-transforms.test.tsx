import { renderHook } from "@testing-library/react";
import { useTimelineTransforms } from "app/reactvideoeditor/pro/components/core/timeline-section/hooks/use-timeline-transforms";
import { Overlay, OverlayType } from "app/reactvideoeditor/pro/types";
import { TimelineTrack } from "app/reactvideoeditor/pro/components/advanced-timeline/types";

describe("useTimelineTransforms", () => {
  describe("transformOverlaysToTracks", () => {
    it("should transform empty overlays array to single empty track", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const tracks = result.current.transformOverlaysToTracks([]);
      
      expect(tracks).toHaveLength(1);
      expect(tracks[0]).toEqual({
        id: "track-0",
        name: "Track 1",
        items: [],
        magnetic: false,
        visible: true,
        muted: false,
      });
    });

    it("should transform text overlay to timeline track", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const textOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Hello World",
        left: 100,
        top: 100,
        width: 500,
        height: 180,
        durationInFrames: 90,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
          zIndex: 1,
        },
      };

      const tracks = result.current.transformOverlaysToTracks([textOverlay]);
      
      expect(tracks).toHaveLength(1);
      expect(tracks[0].items).toHaveLength(1);
      expect(tracks[0].items[0]).toEqual({
        id: "0",
        trackId: "track-0",
        start: 0,
        end: 3, // 90 frames / 30 FPS = 3 seconds
        label: "Hello World",
        type: "text",
        color: "#3b82f6",
        data: textOverlay,
      });
    });

    it("should transform video overlay with media timing properties", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const videoOverlay: Overlay = {
        id: 1,
        type: OverlayType.VIDEO,
        content: "https://example.com/video-thumb.jpg",
        src: "https://example.com/video.mp4",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        durationInFrames: 150,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        videoStartTime: 2,
        mediaSrcDuration: 10,
        styles: {
          opacity: 1,
          zIndex: 100,
          objectFit: "contain",
        },
      };

      const tracks = result.current.transformOverlaysToTracks([videoOverlay]);
      
      expect(tracks[0].items[0]).toMatchObject({
        id: "1",
        type: "video",
        color: "#8b5cf6",
        mediaStart: 2,
        mediaSrcDuration: 10,
        mediaEnd: 7, // 2 + (150 / 30) = 7
      });
    });

    it("should transform audio overlay with media timing properties", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const audioOverlay: Overlay = {
        id: 2,
        type: OverlayType.SOUND,
        content: "Background Music",
        src: "https://example.com/audio.mp3",
        left: 0,
        top: 0,
        width: 1920,
        height: 100,
        durationInFrames: 180,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        startFromSound: 60, // 60 frames = 2 seconds
        mediaSrcDuration: 120,
        styles: {
          opacity: 1,
          volume: 0.8,
        },
      };

      const tracks = result.current.transformOverlaysToTracks([audioOverlay]);
      
      expect(tracks[0].items[0]).toMatchObject({
        id: "2",
        type: "audio",
        color: "#f59e0b",
        mediaStart: 2, // 60 frames / 30 FPS = 2 seconds
        mediaEnd: 8, // 2 + (180 / 30) = 8
        mediaSrcDuration: 120,
      });
    });

    it("should transform image overlay", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const imageOverlay: Overlay = {
        id: 3,
        type: OverlayType.IMAGE,
        content: "https://example.com/image.jpg",
        src: "https://example.com/image.jpg",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        durationInFrames: 150,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          opacity: 1,
          zIndex: 100,
          objectFit: "contain",
        },
      };

      const tracks = result.current.transformOverlaysToTracks([imageOverlay]);
      
      expect(tracks[0].items[0]).toMatchObject({
        id: "3",
        type: "image",
        color: "#10b981",
        label: "https://example.com/image.jpg",
      });
    });

    it("should group overlays by row into separate tracks", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "Track 0 Text",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.TEXT,
          content: "Track 1 Text",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 1,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 2,
          type: OverlayType.TEXT,
          content: "Track 2 Text",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 2,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(overlays);
      
      expect(tracks).toHaveLength(3);
      expect(tracks[0].id).toBe("track-0");
      expect(tracks[0].items[0].label).toBe("Track 0 Text");
      expect(tracks[1].id).toBe("track-1");
      expect(tracks[1].items[0].label).toBe("Track 1 Text");
      expect(tracks[2].id).toBe("track-2");
      expect(tracks[2].items[0].label).toBe("Track 2 Text");
    });

    it("should handle multiple overlays on the same track", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "First",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.TEXT,
          content: "Second",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 90,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(overlays);
      
      expect(tracks).toHaveLength(1);
      expect(tracks[0].items).toHaveLength(2);
      expect(tracks[0].items[0].label).toBe("First");
      expect(tracks[0].items[0].start).toBe(0);
      expect(tracks[0].items[1].label).toBe("Second");
      expect(tracks[0].items[1].start).toBe(3); // 90 frames / 30 FPS
    });

    it("should create empty tracks for gaps in row numbers", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "Track 0",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.TEXT,
          content: "Track 3",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 3, // Skip rows 1 and 2
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(overlays);
      
      expect(tracks).toHaveLength(4); // tracks 0, 1, 2, 3
      expect(tracks[0].items).toHaveLength(1);
      expect(tracks[1].items).toHaveLength(0);
      expect(tracks[2].items).toHaveLength(0);
      expect(tracks[3].items).toHaveLength(1);
    });

    it("should convert frames to seconds correctly", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Test",
        left: 0,
        top: 0,
        width: 500,
        height: 180,
        durationInFrames: 150, // 5 seconds at 30 FPS
        from: 60, // 2 seconds at 30 FPS
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
        },
      };

      const tracks = result.current.transformOverlaysToTracks([overlay]);
      
      expect(tracks[0].items[0].start).toBe(2);
      expect(tracks[0].items[0].end).toBe(7); // 2 + 5
    });

    it("should handle overlays with different types correctly", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.CAPTION,
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          captions: [],
        },
        {
          id: 1,
          type: OverlayType.STICKER,
          content: "star",
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 1,
          isDragging: false,
          category: "Shapes",
          styles: {
            opacity: 1,
          },
        },
        {
          id: 2,
          type: OverlayType.SHAPE,
          content: "rectangle",
          left: 0,
          top: 0,
          width: 200,
          height: 100,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 2,
          isDragging: false,
          styles: {
            opacity: 1,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(overlays);
      
      expect(tracks[0].items[0]).toMatchObject({
        type: "caption",
        color: "#ef4444",
        label: "Caption",
      });
      expect(tracks[1].items[0]).toMatchObject({
        type: "sticker",
        color: "#ec4899",
        label: "star",
      });
      expect(tracks[2].items[0]).toMatchObject({
        type: "shape",
        color: "#6b7280",
        label: "rectangle",
      });
    });

    it("should use default labels when content is missing", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.IMAGE,
          content: "",
          src: "https://example.com/image.jpg",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 1,
          isDragging: false,
          styles: {
            opacity: 1,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(overlays);
      
      expect(tracks[0].items[0].label).toBe("Text");
      expect(tracks[1].items[0].label).toBe("Image");
    });
  });

  describe("transformTracksToOverlays", () => {
    it("should transform empty tracks to empty overlays array", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect(overlays).toEqual([]);
    });

    it("should transform timeline track back to overlay", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Hello World",
        left: 100,
        top: 100,
        width: 500,
        height: 180,
        durationInFrames: 90,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
          zIndex: 1,
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 0,
              end: 3,
              label: "Hello World",
              type: "text",
              color: "#3b82f6",
              data: originalOverlay,
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect(overlays).toHaveLength(1);
      expect(overlays[0]).toEqual(originalOverlay);
    });

    it("should update overlay position and duration from timeline item", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Test",
        left: 100,
        top: 100,
        width: 500,
        height: 180,
        durationInFrames: 90,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 2, // Changed from 0
              end: 7, // Changed duration to 5 seconds
              label: "Test",
              type: "text",
              color: "#3b82f6",
              data: originalOverlay,
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect(overlays[0].from).toBe(60); // 2 seconds * 30 FPS
      expect(overlays[0].durationInFrames).toBe(150); // 5 seconds * 30 FPS
    });

    it("should update row when track changes", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Test",
        left: 100,
        top: 100,
        width: 500,
        height: 180,
        durationInFrames: 90,
        from: 0,
        rotation: 0,
        row: 0, // Original row
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [],
          magnetic: false,
          visible: true,
          muted: false,
        },
        {
          id: "track-1",
          name: "Track 2",
          items: [],
          magnetic: false,
          visible: true,
          muted: false,
        },
        {
          id: "track-2",
          name: "Track 3",
          items: [
            {
              id: "0",
              trackId: "track-2", // Moved to track 2
              start: 0,
              end: 3,
              label: "Test",
              type: "text",
              color: "#3b82f6",
              data: originalOverlay,
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect(overlays[0].row).toBe(2); // Updated to track 2
    });

    it("should preserve video overlay media timing", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const videoOverlay: Overlay = {
        id: 1,
        type: OverlayType.VIDEO,
        content: "https://example.com/video-thumb.jpg",
        src: "https://example.com/video.mp4",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        durationInFrames: 150,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        videoStartTime: 2,
        mediaSrcDuration: 10,
        styles: {
          opacity: 1,
          zIndex: 100,
          objectFit: "contain",
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "1",
              trackId: "track-0",
              start: 0,
              end: 5,
              label: "Video",
              type: "video",
              color: "#8b5cf6",
              data: videoOverlay,
              mediaStart: 3, // Changed from 2
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect((overlays[0] as any).videoStartTime).toBe(3); // Updated to 3
    });

    it("should preserve audio overlay media timing", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const audioOverlay: Overlay = {
        id: 2,
        type: OverlayType.SOUND,
        content: "Background Music",
        src: "https://example.com/audio.mp3",
        left: 0,
        top: 0,
        width: 1920,
        height: 100,
        durationInFrames: 180,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        startFromSound: 60,
        mediaSrcDuration: 120,
        styles: {
          opacity: 1,
          volume: 0.8,
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "2",
              trackId: "track-0",
              start: 0,
              end: 6,
              label: "Audio",
              type: "audio",
              color: "#f59e0b",
              data: audioOverlay,
              mediaStart: 3, // 3 seconds
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      // mediaStart (3 seconds) should be converted to frames for startFromSound
      expect((overlays[0] as any).startFromSound).toBe(90); // 3 * 30 FPS
    });

    it("should handle multiple tracks with multiple items", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const overlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "Text 1",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.TEXT,
          content: "Text 2",
          left: 0,
          top: 0,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 90,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
          },
        },
        {
          id: 2,
          type: OverlayType.IMAGE,
          content: "https://example.com/image.jpg",
          src: "https://example.com/image.jpg",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 1,
          isDragging: false,
          styles: {
            opacity: 1,
          },
        },
      ];

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 0,
              end: 3,
              label: "Text 1",
              type: "text",
              color: "#3b82f6",
              data: overlays[0],
            },
            {
              id: "1",
              trackId: "track-0",
              start: 3,
              end: 6,
              label: "Text 2",
              type: "text",
              color: "#3b82f6",
              data: overlays[1],
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
        {
          id: "track-1",
          name: "Track 2",
          items: [
            {
              id: "2",
              trackId: "track-1",
              start: 0,
              end: 3,
              label: "Image",
              type: "image",
              color: "#10b981",
              data: overlays[2],
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const resultOverlays = result.current.transformTracksToOverlays(tracks);
      
      expect(resultOverlays).toHaveLength(3);
      expect(resultOverlays[0].id).toBe(0);
      expect(resultOverlays[0].row).toBe(0);
      expect(resultOverlays[1].id).toBe(1);
      expect(resultOverlays[1].row).toBe(0);
      expect(resultOverlays[2].id).toBe(2);
      expect(resultOverlays[2].row).toBe(1);
    });

    it("should skip items without data", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 0,
              end: 3,
              label: "Invalid Item",
              type: "text",
              color: "#3b82f6",
              // No data property
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      expect(overlays).toEqual([]);
    });

    it("should correctly round frame calculations", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        content: "Test",
        left: 0,
        top: 0,
        width: 500,
        height: 180,
        durationInFrames: 90,
        from: 0,
        rotation: 0,
        row: 0,
        isDragging: false,
        styles: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          fontFamily: "Arial",
          fontStyle: "normal",
          textDecoration: "none",
          opacity: 1,
        },
      };

      const tracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 1.5, // 1.5 seconds
              end: 4.7, // 3.2 seconds duration
              label: "Test",
              type: "text",
              color: "#3b82f6",
              data: originalOverlay,
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      const overlays = result.current.transformTracksToOverlays(tracks);
      
      // 1.5 * 30 = 45, 3.2 * 30 = 96
      expect(overlays[0].from).toBe(45);
      expect(overlays[0].durationInFrames).toBe(96);
    });
  });

  describe("bidirectional transformation", () => {
    it("should maintain data integrity through round-trip transformation", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.TEXT,
          content: "Hello World",
          left: 100,
          top: 100,
          width: 500,
          height: 180,
          durationInFrames: 90,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          styles: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "transparent",
            fontFamily: "Arial",
            fontStyle: "normal",
            textDecoration: "none",
            opacity: 1,
            zIndex: 1,
          },
        },
        {
          id: 1,
          type: OverlayType.VIDEO,
          content: "https://example.com/video-thumb.jpg",
          src: "https://example.com/video.mp4",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          durationInFrames: 150,
          from: 90,
          rotation: 0,
          row: 1,
          isDragging: false,
          videoStartTime: 2,
          mediaSrcDuration: 10,
          styles: {
            opacity: 1,
            zIndex: 100,
            objectFit: "contain",
          },
        },
      ];

      // Transform overlays -> tracks -> overlays
      const tracks = result.current.transformOverlaysToTracks(originalOverlays);
      const resultOverlays = result.current.transformTracksToOverlays(tracks);
      
      expect(resultOverlays).toEqual(originalOverlays);
    });

    it("should handle audio overlays in round-trip transformation", () => {
      const { result } = renderHook(() => useTimelineTransforms());
      
      const originalOverlays: Overlay[] = [
        {
          id: 0,
          type: OverlayType.SOUND,
          content: "Background Music",
          src: "https://example.com/audio.mp3",
          left: 0,
          top: 0,
          width: 1920,
          height: 100,
          durationInFrames: 180,
          from: 0,
          rotation: 0,
          row: 0,
          isDragging: false,
          startFromSound: 60,
          mediaSrcDuration: 120,
          styles: {
            opacity: 1,
            volume: 0.8,
          },
        },
      ];

      const tracks = result.current.transformOverlaysToTracks(originalOverlays);
      const resultOverlays = result.current.transformTracksToOverlays(tracks);
      
      expect(resultOverlays).toEqual(originalOverlays);
    });
  });
});

