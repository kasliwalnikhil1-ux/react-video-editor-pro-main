import { renderHook, act } from "@testing-library/react";
import { useTimelineDragAndDrop } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-drag-and-drop";
import { TimelineTrack, TimelineItem } from "app/reactvideoeditor/pro/components/advanced-timeline/types";
import { TIMELINE_CONSTANTS } from "app/reactvideoeditor/pro/components/advanced-timeline/constants";
import useTimelineStore from "app/reactvideoeditor/pro/components/advanced-timeline/stores/use-timeline-store";

// Mock the timeline store
jest.mock("app/reactvideoeditor/pro/components/advanced-timeline/stores/use-timeline-store");

// Helper to create a mock timeline ref
const createMockTimelineRef = (width = 1000, height = 500) => ({
  current: {
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      width,
      height,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })),
    scrollTop: 0,
  } as unknown as HTMLDivElement,
});

// Helper to create test tracks
const createTestTracks = (): TimelineTrack[] => [
  {
    id: "track-1",
    name: "Track 1",
    items: [
      { 
        id: "item-1", 
        trackId: "track-1", 
        start: 0, 
        end: 2,
        type: "video",
        label: "Item 1"
      },
      { 
        id: "item-2", 
        trackId: "track-1", 
        start: 5, 
        end: 7,
        type: "video",
        label: "Item 2"
      },
    ],
  },
  {
    id: "track-2",
    name: "Track 2",
    items: [
      { 
        id: "item-3", 
        trackId: "track-2", 
        start: 1, 
        end: 3,
        type: "audio",
        label: "Item 3"
      },
    ],
  },
];

// Helper to create a magnetic track
const createMagneticTrack = (): TimelineTrack => ({
  id: "magnetic-track",
  name: "Magnetic Track",
  magnetic: true,
  items: [
    { 
      id: "mag-1", 
      trackId: "magnetic-track", 
      start: 0, 
      end: 2,
      type: "text",
      label: "Mag 1"
    },
    { 
      id: "mag-2", 
      trackId: "magnetic-track", 
      start: 2, 
      end: 5,
      type: "text",
      label: "Mag 2"
    },
  ],
});

describe("useTimelineDragAndDrop", () => {
  let mockTimelineRef: ReturnType<typeof createMockTimelineRef>;
  let mockOnItemMove: jest.Mock;
  let mockOnItemResize: jest.Mock;
  let mockOnInsertTrackAt: jest.Mock;
  let mockSetDraggedItem: jest.Mock;
  let mockSetGhostElement: jest.Mock;
  let mockSetFloatingGhost: jest.Mock;
  let mockSetIsValidDrop: jest.Mock;
  let mockSetDragInfo: jest.Mock;
  let mockGetDragInfo: jest.Mock;
  let mockResetDragState: jest.Mock;
  let mockSetIsDragging: jest.Mock;
  let mockSetInsertionIndex: jest.Mock;
  let mockSetMagneticPreview: jest.Mock;
  let mockSetCurrentDragPosition: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimelineRef = createMockTimelineRef();
    mockOnItemMove = jest.fn();
    mockOnItemResize = jest.fn();
    mockOnInsertTrackAt = jest.fn(() => "new-track-id");
    mockSetDraggedItem = jest.fn();
    mockSetGhostElement = jest.fn();
    mockSetFloatingGhost = jest.fn();
    mockSetIsValidDrop = jest.fn();
    mockSetDragInfo = jest.fn();
    mockGetDragInfo = jest.fn(() => null);
    mockResetDragState = jest.fn();
    mockSetIsDragging = jest.fn();
    mockSetInsertionIndex = jest.fn();
    mockSetMagneticPreview = jest.fn();
    mockSetCurrentDragPosition = jest.fn();

    // Setup mock store
    (useTimelineStore as unknown as jest.Mock).mockReturnValue({
      setDraggedItem: mockSetDraggedItem,
      setGhostElement: mockSetGhostElement,
      setFloatingGhost: mockSetFloatingGhost,
      setIsValidDrop: mockSetIsValidDrop,
      setDragInfo: mockSetDragInfo,
      getDragInfo: mockGetDragInfo,
      resetDragState: mockResetDragState,
      setIsDragging: mockSetIsDragging,
      setInsertionIndex: mockSetInsertionIndex,
      setMagneticPreview: mockSetMagneticPreview,
      setCurrentDragPosition: mockSetCurrentDragPosition,
    });

    (useTimelineStore.getState as jest.Mock) = jest.fn(() => ({
      ghostElement: null,
      insertionIndex: null,
      isValidDrop: true,
    }));
  });

  describe("initialization", () => {
    it("should return handler functions", () => {
      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks: createTestTracks(),
          timelineRef: mockTimelineRef,
        })
      );

      expect(typeof result.current.handleDragStart).toBe("function");
      expect(typeof result.current.handleDrag).toBe("function");
      expect(typeof result.current.handleDragEnd).toBe("function");
    });
  });

  describe("drag start - move action", () => {
    it("should initialize drag state for move action", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "move");
      });

      expect(mockSetDraggedItem).toHaveBeenCalledWith(item);
      expect(mockSetIsDragging).toHaveBeenCalledWith(true);
      expect(mockSetDragInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: item.id,
          action: "move",
          startX: 100,
          startY: 50,
          startPosition: item.start,
          startDuration: item.end - item.start,
        })
      );
    });

    it("should create ghost element at initial position", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "move");
      });

      expect(mockSetGhostElement).toHaveBeenCalled();
      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      expect(ghostElements).toHaveLength(1);
      expect(ghostElements[0]).toHaveProperty("left");
      expect(ghostElements[0]).toHaveProperty("width");
      expect(ghostElements[0]).toHaveProperty("top");
    });

    it("should handle multi-item drag start", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];
      const selectedItemIds = ["item-1", "item-2"];

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          selectedItemIds,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "move");
      });

      expect(mockSetDragInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedItemsSnapshot: expect.arrayContaining([
            expect.objectContaining({ id: "item-1" }),
            expect.objectContaining({ id: "item-2" }),
          ]),
        })
      );

      // Should create ghosts for both items
      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      expect(ghostElements).toHaveLength(2);
    });

    it("should not start drag if timeline ref is not available", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];
      const nullRef = { current: null };

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: nullRef,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "move");
      });

      expect(mockSetDragInfo).not.toHaveBeenCalled();
    });

    it("should not start drag if item track is not found", () => {
      const tracks = createTestTracks();
      const invalidItem = { 
        id: "invalid", 
        trackId: "non-existent-track", 
        start: 0, 
        end: 2,
        type: "video",
        label: "Invalid"
      };

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragStart(invalidItem, 100, 50, "move");
      });

      expect(mockSetDragInfo).not.toHaveBeenCalled();
    });
  });

  describe("drag start - resize actions", () => {
    it("should initialize drag state for resize-start action", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "resize-start");
      });

      expect(mockSetDragInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "resize-start",
        })
      );
    });

    it("should initialize drag state for resize-end action", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragStart(item, 100, 50, "resize-end");
      });

      expect(mockSetDragInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "resize-end",
        })
      );
    });
  });

  describe("drag - move action", () => {
    it("should update ghost position during move", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(200, 50); // Drag 100px to the right
      });

      expect(mockSetGhostElement).toHaveBeenCalled();
    });

    it("should validate drop position during move", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(200, 50);
      });

      expect(mockSetIsValidDrop).toHaveBeenCalled();
    });

    it("should not update if no drag info exists", () => {
      mockGetDragInfo.mockReturnValue(null);

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks: createTestTracks(),
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(200, 50);
      });

      expect(mockSetGhostElement).not.toHaveBeenCalled();
    });

    it("should clamp position to timeline boundaries", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Drag beyond timeline end
      act(() => {
        result.current.handleDrag(2000, 50);
      });

      const dragInfoCall = mockSetDragInfo.mock.calls[0][0];
      expect(dragInfoCall.currentStart).toBeLessThanOrEqual(10);
    });
  });

  describe("drag - resize-start action", () => {
    it("should update item duration when resizing from start", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-start",
        startX: 0,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Drag start handle to the right (shrink item)
      act(() => {
        result.current.handleDrag(50, 50);
      });

      expect(mockSetGhostElement).toHaveBeenCalled();
      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Width should be smaller
      expect(ghostElements[0].width).toBeLessThan(20); // Original was 20% (2/10 * 100)
    });

    it("should enforce minimum item duration during resize-start", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-start",
        startX: 0,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Try to resize beyond minimum (drag start handle past end)
      act(() => {
        result.current.handleDrag(1000, 50);
      });

      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Should maintain minimum width (0.1 seconds = 1% of 10s)
      expect(ghostElements[0].width).toBeGreaterThanOrEqual(1);
    });

    it("should not change track during resize-start", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-start",
        startX: 0,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      const trackHeight = TIMELINE_CONSTANTS.TRACK_HEIGHT;

      // Try to drag vertically (should be ignored)
      act(() => {
        result.current.handleDrag(50, 50 + trackHeight * 2);
      });

      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Should stay on track 0
      expect(ghostElements[0].top).toBe(0);
    });
  });

  describe("drag - resize-end action", () => {
    it("should update item duration when resizing from end", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-end",
        startX: 200,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Drag end handle to the right (expand item)
      act(() => {
        result.current.handleDrag(300, 50);
      });

      expect(mockSetGhostElement).toHaveBeenCalled();
      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Width should be larger
      expect(ghostElements[0].width).toBeGreaterThan(20);
    });

    it("should keep start position fixed during resize-end", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-end",
        startX: 200,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(300, 50);
      });

      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Left position should stay at 0
      expect(ghostElements[0].left).toBe(0);
    });
  });

  describe("drag - magnetic tracks", () => {
    it("should calculate magnetic insertion position", () => {
      const tracks = [createMagneticTrack()];
      const newItem: TimelineItem = { 
        id: "new-item", 
        trackId: "magnetic-track", 
        start: 0, 
        end: 1,
        type: "text",
        label: "New Item"
      };

      mockGetDragInfo.mockReturnValue({
        id: newItem.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 1,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: newItem.id,
            originalStart: 0,
            originalDuration: 1,
            originalRow: 0,
            type: "text",
            label: "New Item",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(200, 50);
      });

      expect(mockSetMagneticPreview).toHaveBeenCalled();
    });

    it("should prevent multi-item drag on magnetic tracks", () => {
      const tracks = [createMagneticTrack()];
      const items = tracks[0].items;

      mockGetDragInfo.mockReturnValue({
        id: items[0].id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: items[0].id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "text",
            label: "Mag 1",
          },
          {
            id: items[1].id,
            originalStart: 2,
            originalDuration: 3,
            originalRow: 0,
            type: "text",
            label: "Mag 2",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDrag(200, 50);
      });

      // Should mark as invalid drop for multi-drag on magnetic track
      expect(mockSetIsValidDrop).toHaveBeenCalledWith(false);
    });
  });

  describe("drag end", () => {
    it("should call onItemMove with final position", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
        currentStart: 3,
        currentDuration: 2,
      });

      (useTimelineStore.getState as jest.Mock).mockReturnValue({
        ghostElement: [
          {
            id: "ghost",
            left: 30, // 30% = 3 seconds
            width: 20, // 20% = 2 seconds
            top: 0,
          },
        ],
        isValidDrop: true,
        insertionIndex: null,
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          onItemMove: mockOnItemMove,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockOnItemMove).toHaveBeenCalledWith(
        item.id,
        expect.any(Number),
        expect.any(Number),
        tracks[0].id
      );
      expect(mockResetDragState).toHaveBeenCalled();
    });

    it("should call onItemResize for resize actions", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "resize-end",
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      (useTimelineStore.getState as jest.Mock).mockReturnValue({
        ghostElement: [
          {
            id: "ghost",
            left: 0,
            width: 30, // Expanded to 30% = 3 seconds
            top: 0,
          },
        ],
        isValidDrop: true,
        insertionIndex: null,
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          onItemResize: mockOnItemResize,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockOnItemResize).toHaveBeenCalled();
      expect(mockResetDragState).toHaveBeenCalled();
    });

    it("should not apply changes if drop is invalid", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      (useTimelineStore.getState as jest.Mock).mockReturnValue({
        ghostElement: [{ id: "ghost", left: 30, width: 20, top: 0 }],
        isValidDrop: false, // Invalid drop
        insertionIndex: null,
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          onItemMove: mockOnItemMove,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockOnItemMove).not.toHaveBeenCalled();
      expect(mockResetDragState).toHaveBeenCalled();
    });

    it("should handle track insertion when dropping between tracks", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
        currentStart: 3,
        currentDuration: 2,
      });

      (useTimelineStore.getState as jest.Mock).mockReturnValue({
        ghostElement: null, // No ghost means we're inserting
        isValidDrop: true,
        insertionIndex: 1,
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          onItemMove: mockOnItemMove,
          onInsertTrackAt: mockOnInsertTrackAt,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockOnInsertTrackAt).toHaveBeenCalledWith(1);
      expect(mockOnItemMove).toHaveBeenCalledWith(
        item.id,
        expect.any(Number),
        expect.any(Number),
        "new-track-id"
      );
    });

    it("should handle multi-item move", () => {
      const tracks = createTestTracks();
      const selectedItems = [tracks[0].items[0], tracks[0].items[1]];

      mockGetDragInfo.mockReturnValue({
        id: selectedItems[0].id,
        action: "move",
        selectedItemsSnapshot: selectedItems.map((item) => ({
          id: item.id,
          originalStart: item.start,
          originalDuration: item.end - item.start,
          originalRow: 0,
          type: item.type,
          label: item.label,
        })),
      });

      (useTimelineStore.getState as jest.Mock).mockReturnValue({
        ghostElement: [
          { id: "ghost-1", left: 30, width: 20, top: 0 },
          { id: "ghost-2", left: 50, width: 20, top: 0 },
        ],
        isValidDrop: true,
        insertionIndex: null,
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
          onItemMove: mockOnItemMove,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      // Should call onItemMove for both items
      expect(mockOnItemMove).toHaveBeenCalledTimes(2);
    });

    it("should reset drag state when no drag info exists", () => {
      mockGetDragInfo.mockReturnValue(null);

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks: createTestTracks(),
          timelineRef: mockTimelineRef,
        })
      );

      act(() => {
        result.current.handleDragEnd();
      });

      expect(mockOnItemMove).not.toHaveBeenCalled();
      expect(mockOnItemResize).not.toHaveBeenCalled();
    });
  });

  describe("source duration validation", () => {
    it("should enforce source duration limits for video items", () => {
      const tracks = createTestTracks();
      const videoItem: TimelineItem = {
        id: "video-1",
        trackId: "track-1",
        start: 0,
        end: 5,
        type: "video",
        label: "Video",
        mediaSrcDuration: 10,
        mediaStart: 0,
      };

      tracks[0].items = [videoItem];

      mockGetDragInfo.mockReturnValue({
        id: videoItem.id,
        action: "resize-end",
        startX: 500,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: videoItem.id,
            originalStart: 0,
            originalDuration: 5,
            originalRow: 0,
            type: "video",
            label: "Video",
            mediaSrcDuration: 10,
            mediaStart: 0,
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 20,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Try to resize beyond source duration (15 seconds when only 10 available)
      act(() => {
        result.current.handleDrag(2000, 50);
      });

      // Should be clamped to source duration
      const dragInfoCall = mockSetDragInfo.mock.calls[0][0];
      expect(dragInfoCall.currentDuration).toBeLessThanOrEqual(10);
    });

    it("should handle mediaStart offset in duration validation", () => {
      const tracks = createTestTracks();
      const videoItem: TimelineItem = {
        id: "video-1",
        trackId: "track-1",
        start: 0,
        end: 5,
        type: "video",
        label: "Video",
        mediaSrcDuration: 10,
        mediaStart: 3, // Already 3 seconds into the source
      };

      tracks[0].items = [videoItem];

      mockGetDragInfo.mockReturnValue({
        id: videoItem.id,
        action: "resize-end",
        startX: 500,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: videoItem.id,
            originalStart: 0,
            originalDuration: 5,
            originalRow: 0,
            type: "video",
            label: "Video",
            mediaSrcDuration: 10,
            mediaStart: 3,
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 20,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Try to resize to 10 seconds (should be clamped to 7 since we start at 3)
      act(() => {
        result.current.handleDrag(1500, 50);
      });

      const dragInfoCall = mockSetDragInfo.mock.calls[0][0];
      // Max duration should be 7 (10 - 3)
      expect(dragInfoCall.currentDuration).toBeLessThanOrEqual(7);
    });
  });

  describe("edge cases", () => {
    it("should handle empty tracks array", () => {
      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks: [],
          timelineRef: mockTimelineRef,
        })
      );

      expect(result.current.handleDragStart).toBeDefined();
      expect(result.current.handleDrag).toBeDefined();
      expect(result.current.handleDragEnd).toBeDefined();
    });

    it("should throttle drag updates", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Multiple rapid calls
      act(() => {
        result.current.handleDrag(105, 50);
        result.current.handleDrag(110, 50);
        result.current.handleDrag(115, 50);
      });

      // Should not update for every call due to throttling
      expect(mockSetGhostElement.mock.calls.length).toBeLessThan(3);
    });

    it("should handle track boundary constraints", () => {
      const tracks = createTestTracks();
      const item = tracks[0].items[0];

      mockGetDragInfo.mockReturnValue({
        id: item.id,
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 2,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: item.id,
            originalStart: 0,
            originalDuration: 2,
            originalRow: 0,
            type: "video",
            label: "Item 1",
          },
        ],
      });

      const { result } = renderHook(() =>
        useTimelineDragAndDrop({
          totalDuration: 10,
          tracks,
          timelineRef: mockTimelineRef,
        })
      );

      // Try to drag above top track
      act(() => {
        result.current.handleDrag(100, -100);
      });

      const ghostElements = mockSetGhostElement.mock.calls[0][0];
      // Should clamp to track 0
      expect(ghostElements[0].top).toBeGreaterThanOrEqual(0);
    });
  });
});

