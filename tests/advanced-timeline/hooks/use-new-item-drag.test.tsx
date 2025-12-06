import { renderHook, act } from "@testing-library/react";
import { TIMELINE_CONSTANTS } from "app/reactvideoeditor/pro/components/advanced-timeline/constants";
import {
  useNewItemDrag,
  setCurrentNewItemDragType,
  setCurrentNewItemDragData,
  getCurrentNewItemDragType,
  getCurrentNewItemDragData,
} from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-new-item-drag";
import { TimelineTrack } from "app/reactvideoeditor/pro/components/advanced-timeline/types";
import useTimelineStore from "app/reactvideoeditor/pro/components/advanced-timeline/stores/use-timeline-store";

// Mock the timeline store
jest.mock("app/reactvideoeditor/pro/components/advanced-timeline/stores/use-timeline-store");

// Helper to create a mock timeline ref
const createMockTimelineRef = (width = 1000, height = 500) => ({
  current: {
    getBoundingClientRect: jest.fn(() => ({
      left: 100,
      top: 50,
      width,
      height,
      right: 100 + width,
      bottom: 50 + height,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    })),
    contains: jest.fn(() => false),
  } as unknown as HTMLDivElement,
});

// Helper to create a mock drag event
const createMockDragEvent = (
  clientX: number,
  clientY: number,
  options: {
    types?: string[];
    data?: Record<string, string>;
  } = {}
): React.DragEvent => {
  const dataTransfer = {
    types: options.types || ["application/json"],
    getData: jest.fn((type: string) => options.data?.[type] || ""),
    setData: jest.fn(),
    clearData: jest.fn(),
  };

  return {
    clientX,
    clientY,
    dataTransfer,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    relatedTarget: null,
  } as unknown as React.DragEvent;
};

// Helper to create test tracks
const createTestTracks = (): TimelineTrack[] => [
  {
    id: "track-1",
    name: "Track 1",
    items: [
      { id: "item-1", trackId: "track-1", start: 0, end: 2 },
      { id: "item-2", trackId: "track-1", start: 5, end: 7 },
    ],
  },
  {
    id: "track-2",
    name: "Track 2",
    items: [
      { id: "item-3", trackId: "track-2", start: 1, end: 3 },
      { id: "item-4", trackId: "track-2", start: 8, end: 10 },
    ],
  },
];

describe("useNewItemDrag", () => {
  let mockTimelineRef: ReturnType<typeof createMockTimelineRef>;
  let mockOnNewItemDrop: jest.Mock;
  let mockSetGhostElement: jest.Mock;
  let mockSetNewItemDragState: jest.Mock;
  let mockSetIsValidDrop: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimelineRef = createMockTimelineRef();
    mockOnNewItemDrop = jest.fn();
    mockSetGhostElement = jest.fn();
    mockSetNewItemDragState = jest.fn();
    mockSetIsValidDrop = jest.fn();

    // Setup mock store
    (useTimelineStore as unknown as jest.Mock).mockReturnValue({
      setGhostElement: mockSetGhostElement,
      setNewItemDragState: mockSetNewItemDragState,
      setIsValidDrop: mockSetIsValidDrop,
      ghostElement: null,
    });

    // Clear global state
    setCurrentNewItemDragType(null);
    setCurrentNewItemDragData(null);
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: [],
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      expect(result.current.newItemDragState.isDragging).toBe(false);
      expect(result.current.newItemDragState.itemType).toBeNull();
      expect(result.current.newItemDragState.ghostElement).toBeNull();
      expect(result.current.newItemIsValidDrop).toBe(true);
    });

    it("should return handler functions", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: [],
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      expect(typeof result.current.handleNewItemDragOver).toBe("function");
      expect(typeof result.current.handleNewItemDragEnd).toBe("function");
      expect(typeof result.current.handleNewItemDragLeave).toBe("function");
      expect(typeof result.current.handleNewItemDrop).toBe("function");
      expect(typeof result.current.clearNewItemDragState).toBe("function");
    });
  });

  describe("global state management", () => {
    it("should set and get current drag type", () => {
      setCurrentNewItemDragType("video");
      expect(getCurrentNewItemDragType()).toBe("video");

      setCurrentNewItemDragType(null);
      expect(getCurrentNewItemDragType()).toBeNull();
    });

    it("should set and get current drag data", () => {
      const data = { duration: 5, label: "Test Video" };
      setCurrentNewItemDragData(data);
      expect(getCurrentNewItemDragData()).toEqual(data);

      setCurrentNewItemDragData(null);
      expect(getCurrentNewItemDragData()).toBeNull();
    });
  });

  describe("drag over handling", () => {
    it("should handle drag over and update ghost element", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(
        600, // clientX (500 relative to timeline)
        100  // clientY (50 relative to timeline)
      );

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(mockSetGhostElement).toHaveBeenCalled();
      expect(mockSetNewItemDragState).toHaveBeenCalled();
    });

    it("should calculate correct position based on mouse coordinates", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Mouse at middle of timeline (600px from screen left = 500px relative to timeline)
      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should call setGhostElement with position around 50% (500/1000)
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall).toHaveLength(1);
      expect(ghostCall[0].left).toBeCloseTo(50, 0);
    });

    it("should calculate correct track index", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Mouse in second track (MARKERS_HEIGHT + TRACK_HEIGHT + 10)
      const yPosition = 50 + TIMELINE_CONSTANTS.MARKERS_HEIGHT + TIMELINE_CONSTANTS.TRACK_HEIGHT + 10;
      const dragEvent = createMockDragEvent(600, yPosition);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should position ghost in second track
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall[0].top).toBeGreaterThan(0);
    });

    it("should use custom duration from drag data", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 3 });
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Width should be (3 seconds / 10 seconds) * 100 = 30%
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall[0].width).toBeCloseTo(30, 0);
    });

    it("should not update for non-drag events", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Create event without proper drag types
      const dragEvent = createMockDragEvent(600, 100, { types: ["text/plain"] });

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      expect(mockSetGhostElement).not.toHaveBeenCalled();
    });

    it("should throttle updates for small position changes", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent1 = createMockDragEvent(600, 100);
      const dragEvent2 = createMockDragEvent(601, 100); // Only 1px difference

      act(() => {
        result.current.handleNewItemDragOver(dragEvent1);
      });

      mockSetGhostElement.mockClear();

      act(() => {
        result.current.handleNewItemDragOver(dragEvent2);
      });

      // Should not update for very small position changes
      expect(mockSetGhostElement).not.toHaveBeenCalled();
    });
  });

  describe("collision detection", () => {
    it("should detect overlaps with existing items", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 2 });
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Try to place item at 0-2 seconds (overlaps with item-1 which is at 0-2)
      const dragEvent = createMockDragEvent(
        100, // 0% position
        50 + TIMELINE_CONSTANTS.MARKERS_HEIGHT + 10 // First track
      );

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should mark as invalid drop
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(false);
    });

    it("should allow drop in empty space", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 1 });
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Place item at 3-4 seconds (empty space in track 1)
      const dragEvent = createMockDragEvent(
        400, // 30% position = 3 seconds
        50 + TIMELINE_CONSTANTS.MARKERS_HEIGHT + 10 // First track
      );

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should mark as valid drop
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(true);
    });

    it("should detect partial overlaps", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 3 });
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Place item at 0.5-3.5 seconds (partially overlaps with item-1 at 0-2)
      const dragEvent = createMockDragEvent(
        150, // 5% position = 0.5 seconds
        50 + TIMELINE_CONSTANTS.MARKERS_HEIGHT + 10 // First track
      );

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should mark as invalid drop due to partial overlap
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(false);
    });
  });

  describe("drag end handling", () => {
    it("should clear state on drag end", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      act(() => {
        result.current.handleNewItemDragEnd();
      });

      expect(mockSetGhostElement).toHaveBeenCalledWith(null);
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(true);
      expect(getCurrentNewItemDragType()).toBeNull();
      expect(getCurrentNewItemDragData()).toBeNull();
      expect(mockSetNewItemDragState).toHaveBeenCalledWith({
        isDragging: false,
        itemType: null,
        ghostElement: null,
      });
    });
  });

  describe("drag leave handling", () => {
    it("should clear ghost when leaving timeline", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Mock timeline doesn't contain the related target
      mockTimelineRef.current!.contains = jest.fn(() => false);

      const dragEvent = createMockDragEvent(0, 0);

      act(() => {
        result.current.handleNewItemDragLeave(dragEvent);
      });

      expect(mockSetGhostElement).toHaveBeenCalledWith(null);
    });

    it("should not clear ghost when moving within timeline", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Mock timeline contains the related target
      mockTimelineRef.current!.contains = jest.fn(() => true);

      const dragEvent = createMockDragEvent(0, 0);

      act(() => {
        result.current.handleNewItemDragLeave(dragEvent);
      });

      expect(mockSetGhostElement).not.toHaveBeenCalled();
    });
  });

  describe("drop handling", () => {
    it("should call onNewItemDrop when dropping in valid position", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      act(() => {
        result.current.handleNewItemDrop(
          "video",
          0, // Track index
          3, // Start time (empty space)
          { duration: 1, label: "New Video" }
        );
      });

      expect(mockOnNewItemDrop).toHaveBeenCalledWith(
        "video",
        0,
        3,
        { duration: 1, label: "New Video" }
      );
    });

    it("should not drop if position has overlap", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      act(() => {
        result.current.handleNewItemDrop(
          "video",
          0, // Track index
          0, // Start time (overlaps with item-1)
          { duration: 2 }
        );
      });

      // Should not call onNewItemDrop due to overlap
      expect(mockOnNewItemDrop).not.toHaveBeenCalled();
      // Should still clear state
      expect(mockSetGhostElement).toHaveBeenCalledWith(null);
    });

    it("should clear state after drop", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      act(() => {
        result.current.handleNewItemDrop(
          "video",
          0,
          3,
          { duration: 1 }
        );
      });

      expect(mockSetGhostElement).toHaveBeenCalledWith(null);
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(true);
      expect(getCurrentNewItemDragType()).toBeNull();
    });
  });

  describe("clear state functionality", () => {
    it("should clear all drag state", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 5 });
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      act(() => {
        result.current.clearNewItemDragState();
      });

      expect(mockSetGhostElement).toHaveBeenCalledWith(null);
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(true);
      expect(getCurrentNewItemDragType()).toBeNull();
      expect(getCurrentNewItemDragData()).toBeNull();
      expect(mockSetNewItemDragState).toHaveBeenCalledWith({
        isDragging: false,
        itemType: null,
        ghostElement: null,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle null timeline ref gracefully", () => {
      setCurrentNewItemDragType("video");
      
      const nullRef = { current: null };
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: nullRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should not crash or update state
      expect(mockSetGhostElement).not.toHaveBeenCalled();
    });

    it("should handle empty tracks array", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: [],
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should still work with empty tracks
      expect(mockSetGhostElement).toHaveBeenCalled();
    });

    it("should clamp position to timeline boundaries", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Mouse way beyond timeline right edge
      const dragEvent = createMockDragEvent(2000, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should clamp to 100%
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall[0].left).toBeLessThanOrEqual(100);
    });

    it("should handle invalid drag data gracefully", () => {
      setCurrentNewItemDragType("video");
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Drag event with invalid JSON
      const dragEvent = createMockDragEvent(600, 100, {
        data: { "application/json": "invalid json{" }
      });

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should use default values and not crash
      expect(mockSetGhostElement).toHaveBeenCalled();
    });

    it("should handle overlap detection with invalid track index", () => {
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      // Try to drop at invalid track index
      act(() => {
        result.current.handleNewItemDrop(
          "video",
          -1, // Invalid track index
          5,
          { duration: 1 }
        );
      });

      // Should not drop due to invalid track
      expect(mockOnNewItemDrop).not.toHaveBeenCalled();
    });
  });

  describe("width calculation", () => {
    it("should constrain width within reasonable bounds", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 100 }); // Very long duration
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should constrain width to max 50%
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall[0].width).toBeLessThanOrEqual(50);
    });

    it("should ensure minimum width", () => {
      setCurrentNewItemDragType("video");
      setCurrentNewItemDragData({ duration: 0.001 }); // Very short duration
      
      const { result } = renderHook(() =>
        useNewItemDrag({
          timelineRef: mockTimelineRef,
          totalDuration: 10,
          tracks: createTestTracks(),
          onNewItemDrop: mockOnNewItemDrop,
        })
      );

      const dragEvent = createMockDragEvent(600, 100);

      act(() => {
        result.current.handleNewItemDragOver(dragEvent);
      });

      // Should ensure minimum width of 1%
      const ghostCall = mockSetGhostElement.mock.calls[0][0];
      expect(ghostCall[0].width).toBeGreaterThanOrEqual(1);
    });
  });
});

