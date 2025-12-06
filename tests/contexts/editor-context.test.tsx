import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  EditorProvider,
  useEditorContext,
} from "../../app/reactvideoeditor/pro/contexts/editor-context";
import {
  AspectRatio,
  CaptionStyles,
  OverlayType,
  TextOverlay,
} from "../../app/reactvideoeditor/pro/types";

describe("EditorContext", () => {
  // Mock values for the context provider
  const mockPlayerRef = { current: { currentTime: 0 } };
  const defaultOverlay: TextOverlay = {
    id: 1,
    type: OverlayType.TEXT,
    content: "Test",
    durationInFrames: 100,
    from: 0,
    height: 50,
    width: 300,
    row: 0,
    left: 100,
    top: 100,
    isDragging: false,
    rotation: 0,
    styles: {
      fontSize: "16px",
      fontWeight: "normal",
      color: "#000000",
      backgroundColor: "transparent",
      fontFamily: "Arial",
      fontStyle: "normal",
      textDecoration: "none",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      textAlign: "center",
    },
  };

  const mockContextValue = {
    // Overlay Management
    overlays: [defaultOverlay],
    selectedOverlayId: null,
    setSelectedOverlayId: jest.fn(),
    selectedOverlayIds: [],
    setSelectedOverlayIds: jest.fn(),
    changeOverlay: jest.fn(),
    setOverlays: jest.fn(),

    // Player State
    isPlaying: false,
    currentFrame: 0,
    playerRef: mockPlayerRef,
    playbackRate: 1,
    setPlaybackRate: jest.fn(),

    // Player Controls
    togglePlayPause: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    formatTime: jest.fn(),
    handleTimelineClick: jest.fn(),

    // Overlay Operations
    handleOverlayChange: jest.fn(),
    addOverlay: jest.fn(),
    deleteOverlay: jest.fn(),
    duplicateOverlay: jest.fn(),
    splitOverlay: jest.fn(),

    // Video Dimensions and Aspect Ratio
    aspectRatio: "16:9" as AspectRatio,
    setAspectRatio: jest.fn(),
    playerDimensions: { width: 1920, height: 1080 },
    updatePlayerDimensions: jest.fn(),
    getAspectRatioDimensions: jest.fn(),

    // Video Properties
    durationInFrames: 300,
    durationInSeconds: 10,
    renderMedia: jest.fn(),
    state: {},
    renderState: {},

    // Timeline
    deleteOverlaysByRow: jest.fn(),

    // Style Management
    updateOverlayStyles: jest.fn(),

    // Project Management
    resetOverlays: jest.fn(),
    saveProject: jest.fn(),

    // Loading state
    isInitialLoadComplete: true,

    // Render type
    renderType: "ssr" as const,

    // FPS
    fps: 30,

    // API Configuration
    baseUrl: "http://localhost:3000",

    // Configuration
    initialRows: 5,
    maxRows: 8,
    zoomConstraints: {
      min: 0.2,
      max: 10,
      step: 0.1,
      default: 1,
    },
    snappingConfig: {
      thresholdFrames: 1,
      enableVerticalSnapping: true,
    },
    disableMobileLayout: false,
    disableVideoKeyframes: false,
    enablePushOnDrag: false,
    videoWidth: 1280,
    videoHeight: 720,

    // Alignment Guides
    showAlignmentGuides: true,
    setShowAlignmentGuides: jest.fn(),

    // Settings
    backgroundColor: "white",
    setBackgroundColor: jest.fn(),

    // Timeline Height Settings
    trackHeight: 60,
    setTrackHeight: jest.fn(),
    timelineItemHeight: 40,
    setTimelineItemHeight: jest.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <EditorProvider value={mockContextValue}>{children}</EditorProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useEditorContext());
    }).toThrow("useEditorContext must be used within an EditorProvider");
  });

  it("should provide context values when used within provider", () => {
    const { result } = renderHook(() => useEditorContext(), { wrapper });
    expect(result.current).toEqual(mockContextValue);
  });

  describe("Overlay Management", () => {
    it("should handle overlay selection", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setSelectedOverlayId(1);
      });

      expect(mockContextValue.setSelectedOverlayId).toHaveBeenCalledWith(1);
    });

    it("should handle multi-overlay selection", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setSelectedOverlayIds([1, 2, 3]);
      });

      expect(mockContextValue.setSelectedOverlayIds).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("should handle overlay changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const updatedOverlay = { ...defaultOverlay, content: "Updated" };

      act(() => {
        result.current.changeOverlay(1, updatedOverlay);
      });

      expect(mockContextValue.changeOverlay).toHaveBeenCalledWith(
        1,
        updatedOverlay
      );
    });

    it("should handle overlay addition", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.addOverlay(defaultOverlay);
      });

      expect(mockContextValue.addOverlay).toHaveBeenCalledWith(defaultOverlay);
    });

    it("should handle overlay deletion", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.deleteOverlay(1);
      });

      expect(mockContextValue.deleteOverlay).toHaveBeenCalledWith(1);
    });

    it("should handle overlay duplication", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.duplicateOverlay(1);
      });

      expect(mockContextValue.duplicateOverlay).toHaveBeenCalledWith(1);
    });

    it("should handle overlay splitting", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.splitOverlay(1, 50);
      });

      expect(mockContextValue.splitOverlay).toHaveBeenCalledWith(1, 50);
    });
  });

  describe("Player Controls", () => {
    it("should handle playback rate changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setPlaybackRate(2);
      });

      expect(mockContextValue.setPlaybackRate).toHaveBeenCalledWith(2);
    });

    it("should handle play/pause toggle", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.togglePlayPause();
      });

      expect(mockContextValue.togglePlayPause).toHaveBeenCalled();
    });

    it("should handle play action", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.play();
      });

      expect(mockContextValue.play).toHaveBeenCalled();
    });

    it("should handle pause action", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.pause();
      });

      expect(mockContextValue.pause).toHaveBeenCalled();
    });

    it("should handle seek to frame", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.seekTo(100);
      });

      expect(mockContextValue.seekTo).toHaveBeenCalledWith(100);
    });
  });

  describe("Video Dimensions", () => {
    it("should handle aspect ratio changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setAspectRatio("4:3" as AspectRatio);
      });

      expect(mockContextValue.setAspectRatio).toHaveBeenCalledWith("4:3");
    });

    it("should handle player dimension updates", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.updatePlayerDimensions(1280, 720);
      });

      expect(mockContextValue.updatePlayerDimensions).toHaveBeenCalledWith(
        1280,
        720
      );
    });

    it("should get aspect ratio dimensions", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.getAspectRatioDimensions();
      });

      expect(mockContextValue.getAspectRatioDimensions).toHaveBeenCalled();
    });
  });

  describe("Timeline Management", () => {
    it("should handle deleting overlays by row", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.deleteOverlaysByRow(2);
      });

      expect(mockContextValue.deleteOverlaysByRow).toHaveBeenCalledWith(2);
    });

    it("should handle timeline click", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const mockEvent = { clientX: 100 } as React.MouseEvent<HTMLDivElement>;

      act(() => {
        result.current.handleTimelineClick(mockEvent);
      });

      expect(mockContextValue.handleTimelineClick).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("Style Management", () => {
    it("should handle overlay style updates", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const newStyles: Partial<CaptionStyles> = { fontSize: "18px", color: "#ff0000" };

      act(() => {
        result.current.updateOverlayStyles(1, newStyles);
      });

      expect(mockContextValue.updateOverlayStyles).toHaveBeenCalledWith(
        1,
        newStyles
      );
    });
  });

  describe("Project Management", () => {
    it("should handle project saving", async () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      await act(async () => {
        await result.current.saveProject?.();
      });

      expect(mockContextValue.saveProject).toHaveBeenCalled();
    });

    it("should handle overlay reset", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.resetOverlays();
      });

      expect(mockContextValue.resetOverlays).toHaveBeenCalled();
    });

    it("should handle media rendering", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.renderMedia();
      });

      expect(mockContextValue.renderMedia).toHaveBeenCalled();
    });
  });

  describe("Settings Management", () => {
    it("should handle alignment guides toggle", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setShowAlignmentGuides(false);
      });

      expect(mockContextValue.setShowAlignmentGuides).toHaveBeenCalledWith(false);
    });

    it("should handle background color changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setBackgroundColor("#000000");
      });

      expect(mockContextValue.setBackgroundColor).toHaveBeenCalledWith("#000000");
    });

    it("should handle track height changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setTrackHeight(80);
      });

      expect(mockContextValue.setTrackHeight).toHaveBeenCalledWith(80);
    });

    it("should handle timeline item height changes", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.setTimelineItemHeight(50);
      });

      expect(mockContextValue.setTimelineItemHeight).toHaveBeenCalledWith(50);
    });
  });

  describe("Configuration Properties", () => {
    it("should provide correct configuration values", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.fps).toBe(30);
      expect(result.current.renderType).toBe("ssr");
      expect(result.current.initialRows).toBe(5);
      expect(result.current.maxRows).toBe(8);
      expect(result.current.videoWidth).toBe(1280);
      expect(result.current.videoHeight).toBe(720);
      expect(result.current.disableMobileLayout).toBe(false);
      expect(result.current.disableVideoKeyframes).toBe(false);
      expect(result.current.enablePushOnDrag).toBe(false);
      expect(result.current.isInitialLoadComplete).toBe(true);
    });

    it("should provide correct zoom constraints", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.zoomConstraints).toEqual({
        min: 0.2,
        max: 10,
        step: 0.1,
        default: 1,
      });
    });

    it("should provide correct snapping configuration", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.snappingConfig).toEqual({
        thresholdFrames: 1,
        enableVerticalSnapping: true,
      });
    });
  });

  describe("State Properties", () => {
    it("should provide state and render state objects", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.state).toEqual({});
      expect(result.current.renderState).toEqual({});
    });

    it("should provide duration properties", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.durationInFrames).toBe(300);
      expect(result.current.durationInSeconds).toBe(10);
    });

    it("should provide player dimensions", () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.playerDimensions).toEqual({
        width: 1920,
        height: 1080,
      });
    });
  });
});
