import { renderHook, act } from "@testing-library/react";
import { useTimelineHandlers } from "app/reactvideoeditor/pro/components/core/timeline-section/hooks/use-timeline-handlers";
import { Overlay, OverlayType } from "app/reactvideoeditor/pro/types";
import { TimelineTrack } from "app/reactvideoeditor/pro/components/advanced-timeline/types";
import { FPS } from "app/constants";
import React from "react";

// Mock the dependencies
jest.mock("app/reactvideoeditor/pro/components/core/timeline-section/hooks/use-timeline-transforms", () => ({
  useTimelineTransforms: () => ({
    transformTracksToOverlays: jest.fn((tracks: any[]) => {
      // Simple mock transformation - use local FPS value (30)
      const mockFPS = 30;
      const overlays: any[] = [];
      tracks.forEach((track, trackIndex) => {
        track.items.forEach((item: any) => {
          if (item.data) {
            overlays.push({
              ...(item.data),
              from: Math.round(item.start * mockFPS),
              durationInFrames: Math.round((item.end - item.start) * mockFPS),
              row: trackIndex,
            });
          }
        });
      });
      return overlays;
    }),
  }),
}));

jest.mock("app/reactvideoeditor/pro/contexts/media-adaptor-context", () => ({
  useMediaAdaptors: () => ({
    videoAdaptors: [
      {
        name: "test-video-source",
        getVideoUrl: jest.fn((video, quality) => "https://example.com/video.mp4"),
      },
    ],
    imageAdaptors: [
      {
        name: "test-image-source",
        getImageUrl: jest.fn((image, size) => "https://example.com/image.jpg"),
      },
    ],
  }),
}));

jest.mock("app/reactvideoeditor/pro/hooks/use-aspect-ratio", () => ({
  useAspectRatio: () => ({
    getAspectRatioDimensions: jest.fn(() => ({ width: 1920, height: 1080 })),
  }),
}));

jest.mock("app/reactvideoeditor/pro/utils/asset-sizing", () => ({
  calculateIntelligentAssetSize: jest.fn((asset, canvas) => ({ width: 1280, height: 720 })),
  getAssetDimensions: jest.fn((asset) => 
    asset.width && asset.height ? { width: asset.width, height: asset.height } : null
  ),
}));

describe("useTimelineHandlers", () => {
  let mockOverlays: Overlay[];
  let mockPlayerRef: React.RefObject<any>;
  let mockSetSelectedOverlayId: jest.Mock;
  let mockSetSelectedOverlayIds: jest.Mock;
  let mockDeleteOverlay: jest.Mock;
  let mockDuplicateOverlay: jest.Mock;
  let mockSplitOverlay: jest.Mock;
  let mockHandleOverlayChange: jest.Mock;
  let mockSetOverlays: jest.Mock;
  let mockSetActivePanel: jest.Mock;
  let mockSetIsOpen: jest.Mock;

  beforeEach(() => {
    // Create sample overlays
    mockOverlays = [
      {
        id: 0,
        type: OverlayType.TEXT,
        content: "Test Text",
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
        videoStartTime: 0,
        mediaSrcDuration: 10,
        styles: {
          opacity: 1,
          zIndex: 100,
          objectFit: "contain",
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
        row: 2,
        isDragging: false,
        styles: {
          opacity: 1,
          zIndex: 100,
          objectFit: "contain",
        },
      },
    ] as Overlay[];

    // Create mock functions
    mockPlayerRef = { current: { seekTo: jest.fn() } };
    mockSetSelectedOverlayId = jest.fn();
    mockSetSelectedOverlayIds = jest.fn();
    mockDeleteOverlay = jest.fn();
    mockDuplicateOverlay = jest.fn();
    mockSplitOverlay = jest.fn();
    mockHandleOverlayChange = jest.fn();
    mockSetOverlays = jest.fn();
    mockSetActivePanel = jest.fn();
    mockSetIsOpen = jest.fn();

    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with all handler functions", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(result.current.handleTracksChange).toBeDefined();
      expect(result.current.handleTimelineFrameChange).toBeDefined();
      expect(result.current.handleItemSelect).toBeDefined();
      expect(result.current.handleSelectedItemsChange).toBeDefined();
      expect(result.current.handleDeleteItems).toBeDefined();
      expect(result.current.handleDuplicateItems).toBeDefined();
      expect(result.current.handleSplitItems).toBeDefined();
      expect(result.current.handleItemMove).toBeDefined();
      expect(result.current.handleItemResize).toBeDefined();
      expect(result.current.handleNewItemDrop).toBeDefined();
      expect(result.current.isUpdatingFromTimelineRef).toBeDefined();
    });
  });

  describe("handleTracksChange", () => {
    it("should transform tracks to overlays and update state", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      const newTracks: TimelineTrack[] = [
        {
          id: "track-0",
          name: "Track 1",
          items: [
            {
              id: "0",
              trackId: "track-0",
              start: 0,
              end: 3,
              label: "Test Text",
              type: "text",
              color: "#3b82f6",
              data: mockOverlays[0],
            },
          ],
          magnetic: false,
          visible: true,
          muted: false,
        },
      ];

      act(() => {
        result.current.handleTracksChange(newTracks);
      });

      expect(mockSetOverlays).toHaveBeenCalled();
      expect(result.current.isUpdatingFromTimelineRef.current).toBe(true);
    });

    it("should set updating flag and reset it after delay", async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      const newTracks: TimelineTrack[] = [];

      act(() => {
        result.current.handleTracksChange(newTracks);
      });

      expect(result.current.isUpdatingFromTimelineRef.current).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isUpdatingFromTimelineRef.current).toBe(false);

      jest.useRealTimers();
    });
  });

  describe("handleTimelineFrameChange", () => {
    it("should seek player to the specified frame", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleTimelineFrameChange(60);
      });

      expect(mockPlayerRef.current.seekTo).toHaveBeenCalledWith(60);
    });

    it("should handle null player ref gracefully", () => {
      const nullPlayerRef = { current: null };
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: nullPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleTimelineFrameChange(60);
        });
      }).not.toThrow();
    });
  });

  describe("handleItemSelect", () => {
    it("should select item and set appropriate sidebar panel", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleItemSelect("0");
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(0);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
    });

    it("should set VIDEO panel for video overlays", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleItemSelect("1");
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(1);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.VIDEO);
    });

    it("should set IMAGE panel for image overlays", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleItemSelect("2");
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(2);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.IMAGE);
    });
  });

  describe("handleSelectedItemsChange", () => {
    it("should handle multiselect and set sidebar for first item", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleSelectedItemsChange(["0", "1", "2"]);
      });

      expect(mockSetSelectedOverlayIds).toHaveBeenCalledWith([0, 1, 2]);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
    });

    it("should handle empty selection", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleSelectedItemsChange([]);
      });

      expect(mockSetSelectedOverlayIds).toHaveBeenCalledWith([]);
      expect(mockSetActivePanel).not.toHaveBeenCalled();
    });
  });

  describe("handleDeleteItems", () => {
    it("should delete all selected items", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleDeleteItems(["0", "1"]);
      });

      expect(mockDeleteOverlay).toHaveBeenCalledTimes(2);
      expect(mockDeleteOverlay).toHaveBeenCalledWith(0);
      expect(mockDeleteOverlay).toHaveBeenCalledWith(1);
    });

    it("should handle single item deletion", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleDeleteItems(["2"]);
      });

      expect(mockDeleteOverlay).toHaveBeenCalledTimes(1);
      expect(mockDeleteOverlay).toHaveBeenCalledWith(2);
    });
  });

  describe("handleDuplicateItems", () => {
    it("should duplicate all selected items", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleDuplicateItems(["0", "1"]);
      });

      expect(mockDuplicateOverlay).toHaveBeenCalledTimes(2);
      expect(mockDuplicateOverlay).toHaveBeenCalledWith(0);
      expect(mockDuplicateOverlay).toHaveBeenCalledWith(1);
    });
  });

  describe("handleSplitItems", () => {
    it("should split item at the correct frame", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      // Split at 2 seconds (60 frames at 30 FPS)
      act(() => {
        result.current.handleSplitItems("0", 2);
      });

      expect(mockSplitOverlay).toHaveBeenCalledWith(0, 60);
    });

    it("should round split frame correctly", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      // Split at 2.5 seconds (75 frames at 30 FPS)
      act(() => {
        result.current.handleSplitItems("1", 2.5);
      });

      expect(mockSplitOverlay).toHaveBeenCalledWith(1, 75);
    });
  });

  describe("handleItemMove", () => {
    it("should update overlay position and track", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleItemMove("0", 2, 5, "track-1");
      });

      expect(mockHandleOverlayChange).toHaveBeenCalledWith({
        ...mockOverlays[0],
        from: 60, // 2 seconds * 30 FPS
        durationInFrames: 90, // (5 - 2) seconds * 30 FPS
        row: 1,
      });
    });

    it("should skip move when updating flag is set", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      // Set the updating flag
      act(() => {
        result.current.isUpdatingFromTimelineRef.current = true;
      });

      act(() => {
        result.current.handleItemMove("0", 2, 5, "track-1");
      });

      expect(mockHandleOverlayChange).not.toHaveBeenCalled();
    });

    it("should handle overlay not found gracefully", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleItemMove("999", 2, 5, "track-1");
        });
      }).not.toThrow();

      expect(mockHandleOverlayChange).not.toHaveBeenCalled();
    });
  });

  describe("handleItemResize", () => {
    it("should update overlay duration and position", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleItemResize("0", 1, 4);
      });

      expect(mockHandleOverlayChange).toHaveBeenCalledWith({
        ...mockOverlays[0],
        from: 30, // 1 second * 30 FPS
        durationInFrames: 90, // (4 - 1) seconds * 30 FPS
      });
    });

    it("should skip resize when updating flag is set", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      // Set the updating flag
      act(() => {
        result.current.isUpdatingFromTimelineRef.current = true;
      });

      act(() => {
        result.current.handleItemResize("0", 1, 4);
      });

      expect(mockHandleOverlayChange).not.toHaveBeenCalled();
    });

    it("should handle overlay not found gracefully", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleItemResize("999", 1, 4);
        });
      }).not.toThrow();

      expect(mockHandleOverlayChange).not.toHaveBeenCalled();
    });
  });

  describe("handleNewItemDrop", () => {
    describe("video drops", () => {
      it("should create video overlay from local media", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("video", 0, 0, {
            duration: 10,
            label: "Test Video",
            data: {
              _isLocalMedia: true,
              src: "https://example.com/video.mp4",
              thumbnail: "https://example.com/thumb.jpg",
              width: 1920,
              height: 1080,
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.VIDEO);
        expect(newOverlay.src).toBe("https://example.com/video.mp4");
        expect(newOverlay.durationInFrames).toBe(300); // 10 seconds * 30 FPS
        expect(newOverlay.mediaSrcDuration).toBe(10);
        expect(mockSetSelectedOverlayId).toHaveBeenCalled();
        expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.VIDEO);
      });

      it("should create video overlay from external source using adaptor", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("video", 0, 0, {
            duration: 10,
            label: "Test Video",
            data: {
              _source: "test-video-source",
              thumbnail: "https://example.com/thumb.jpg",
              width: 1920,
              height: 1080,
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.VIDEO);
        expect(newOverlay.src).toBe("https://example.com/video.mp4");
      });
    });

    describe("image drops", () => {
      it("should create image overlay from local media", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("image", 0, 0, {
            duration: 5,
            label: "Test Image",
            data: {
              _isLocalMedia: true,
              src: "https://example.com/image.jpg",
              width: 1920,
              height: 1080,
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.IMAGE);
        expect(newOverlay.src).toBe("https://example.com/image.jpg");
        expect(newOverlay.durationInFrames).toBe(150); // 5 seconds default
        expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.IMAGE);
      });

      it("should create image overlay from external source", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("image", 0, 0, {
            duration: 5,
            label: "Test Image",
            data: {
              _source: "test-image-source",
              src: "https://example.com/fallback.jpg",
              width: 1920,
              height: 1080,
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.IMAGE);
        expect(newOverlay.src).toBe("https://example.com/image.jpg");
      });
    });

    describe("audio drops", () => {
      it("should create audio overlay", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("audio", 0, 0, {
            duration: 120,
            label: "Test Audio",
            data: {
              src: "https://example.com/audio.mp3",
              title: "My Audio",
              name: "audio-file.mp3",
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.SOUND);
        expect(newOverlay.src).toBe("https://example.com/audio.mp3");
        expect(newOverlay.content).toBe("My Audio");
        expect(newOverlay.durationInFrames).toBe(3600); // 120 seconds * 30 FPS
        expect(newOverlay.mediaSrcDuration).toBe(120);
        expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.SOUND);
      });
    });

    describe("text drops", () => {
      it("should create text overlay from template", () => {
        const { result } = renderHook(() =>
          useTimelineHandlers({
            overlays: mockOverlays,
            playerRef: mockPlayerRef,
            setSelectedOverlayId: mockSetSelectedOverlayId,
            setSelectedOverlayIds: mockSetSelectedOverlayIds,
            deleteOverlay: mockDeleteOverlay,
            duplicateOverlay: mockDuplicateOverlay,
            splitOverlay: mockSplitOverlay,
            handleOverlayChange: mockHandleOverlayChange,
            setOverlays: mockSetOverlays,
            setActivePanel: mockSetActivePanel,
            setIsOpen: mockSetIsOpen,
          })
        );

        act(() => {
          result.current.handleNewItemDrop("text", 0, 0, {
            duration: 3,
            label: "Test Text",
            data: {
              content: "Hello World",
              styles: {
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ffffff",
                backgroundColor: "transparent",
                fontFamily: "Arial",
                fontStyle: "normal",
                textDecoration: "none",
                textAlign: "center" as "center",
              },
            },
          });
        });

        expect(mockSetOverlays).toHaveBeenCalled();
        const overlaysArg = mockSetOverlays.mock.calls[0][0];
        const newOverlay = overlaysArg[overlaysArg.length - 1];

        expect(newOverlay.type).toBe(OverlayType.TEXT);
        expect(newOverlay.content).toBe("Hello World");
        expect(newOverlay.durationInFrames).toBe(90); // 3 seconds * 30 FPS
        expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
      });
    });

    it("should handle unsupported item types gracefully", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleNewItemDrop("unsupported", 0, 0, {
            duration: 3,
            data: {},
          });
        });
      }).not.toThrow();

      expect(mockSetOverlays).not.toHaveBeenCalled();
    });

    it("should handle missing item data gracefully", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleNewItemDrop("video", 0, 0);
        });
      }).not.toThrow();

      expect(mockSetOverlays).not.toHaveBeenCalled();
    });

    it("should assign correct new ID to dropped item", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleNewItemDrop("text", 0, 0, {
          duration: 3,
          data: {
            content: "Hello World",
            styles: {
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              backgroundColor: "transparent",
              fontFamily: "Arial",
              fontStyle: "normal",
              textDecoration: "none",
              textAlign: "center" as "center",
            },
          },
        });
      });

      const overlaysArg = mockSetOverlays.mock.calls[0][0];
      const newOverlay = overlaysArg[overlaysArg.length - 1];

      // New ID should be max existing ID + 1
      expect(newOverlay.id).toBe(3); // mockOverlays has IDs 0, 1, 2
      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(3);
    });

    it("should handle drop on different tracks", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      act(() => {
        result.current.handleNewItemDrop("text", 2, 5, {
          duration: 3,
          data: {
            content: "Track 2 Text",
            styles: {
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              backgroundColor: "transparent",
              fontFamily: "Arial",
              fontStyle: "normal",
              textDecoration: "none",
              textAlign: "center" as "center",
            },
          },
        });
      });

      const overlaysArg = mockSetOverlays.mock.calls[0][0];
      const newOverlay = overlaysArg[overlaysArg.length - 1];

      expect(newOverlay.row).toBe(2);
      expect(newOverlay.from).toBe(150); // 5 seconds * 30 FPS
    });
  });

  describe("edge cases", () => {
    it("should handle empty overlays array", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: [],
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(result.current).toBeDefined();
      expect(() => {
        act(() => {
          result.current.handleItemSelect("0");
        });
      }).not.toThrow();
    });

    it("should handle rapid successive calls", () => {
      const { result } = renderHook(() =>
        useTimelineHandlers({
          overlays: mockOverlays,
          playerRef: mockPlayerRef,
          setSelectedOverlayId: mockSetSelectedOverlayId,
          setSelectedOverlayIds: mockSetSelectedOverlayIds,
          deleteOverlay: mockDeleteOverlay,
          duplicateOverlay: mockDuplicateOverlay,
          splitOverlay: mockSplitOverlay,
          handleOverlayChange: mockHandleOverlayChange,
          setOverlays: mockSetOverlays,
          setActivePanel: mockSetActivePanel,
          setIsOpen: mockSetIsOpen,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleItemSelect("0");
          result.current.handleItemSelect("1");
          result.current.handleItemSelect("2");
          result.current.handleTimelineFrameChange(30);
          result.current.handleTimelineFrameChange(60);
        });
      }).not.toThrow();
    });
  });
});

