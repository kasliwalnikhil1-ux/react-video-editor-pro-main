import { renderHook, act } from "@testing-library/react";
import useTimelineStore, {
  GhostInstanceData,
  FloatingGhostData,
  DragInfoState,
  NewItemDragState,
} from "app/reactvideoeditor/pro/components/advanced-timeline/stores/use-timeline-store";

// Mock timeline item type
const createMockTimelineItem = (id: string, start = 0, duration = 5, row = 0) => ({
  id,
  start,
  duration,
  row,
  type: "video",
  label: `Item ${id}`,
});

describe("useTimelineStore", () => {
  // Reset store state before each test
  beforeEach(() => {
    const { result } = renderHook(() => useTimelineStore());
    act(() => {
      result.current.clearAllState();
    });
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useTimelineStore());

      expect(result.current.ghostMarkerPosition).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.isPlayheadDragging).toBe(false);
      expect(result.current.isContextMenuOpen).toBe(false);
      expect(result.current.timelineRef).toBeNull();
      expect(result.current.draggedItem).toBeNull();
      expect(result.current.ghostElement).toBeNull();
      expect(result.current.floatingGhost).toBeNull();
      expect(result.current.isValidDrop).toBe(true);
      expect(result.current.dragInfo).toBeNull();
      expect(result.current.insertionIndex).toBeNull();
      expect(result.current.magneticPreview).toBeNull();
      expect(result.current.currentDragPosition).toBeNull();
    });

    it("should initialize newItemDragState with default values", () => {
      const { result } = renderHook(() => useTimelineStore());

      expect(result.current.newItemDragState).toEqual({
        isDragging: false,
        itemType: null,
        ghostElement: null,
      });
    });

    it("should initialize livePreviewUpdates as empty Map", () => {
      const { result } = renderHook(() => useTimelineStore());

      expect(result.current.livePreviewUpdates).toBeInstanceOf(Map);
      expect(result.current.livePreviewUpdates.size).toBe(0);
    });
  });

  describe("setGhostMarkerPosition", () => {
    it("should set ghost marker position", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setGhostMarkerPosition(100);
      });

      expect(result.current.ghostMarkerPosition).toBe(100);
    });

    it("should clear ghost marker position", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setGhostMarkerPosition(100);
        result.current.setGhostMarkerPosition(null);
      });

      expect(result.current.ghostMarkerPosition).toBeNull();
    });

    it("should handle different position values", () => {
      const { result } = renderHook(() => useTimelineStore());

      const positions = [0, 50, 100, 500, 1000];
      positions.forEach((pos) => {
        act(() => {
          result.current.setGhostMarkerPosition(pos);
        });
        expect(result.current.ghostMarkerPosition).toBe(pos);
      });
    });
  });

  describe("setIsDragging", () => {
    it("should set isDragging to true", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsDragging(true);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it("should set isDragging to false", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsDragging(true);
        result.current.setIsDragging(false);
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe("setIsPlayheadDragging", () => {
    it("should set isPlayheadDragging to true", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsPlayheadDragging(true);
      });

      expect(result.current.isPlayheadDragging).toBe(true);
    });

    it("should set isPlayheadDragging to false", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsPlayheadDragging(true);
        result.current.setIsPlayheadDragging(false);
      });

      expect(result.current.isPlayheadDragging).toBe(false);
    });

    it("should not affect isDragging state", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsDragging(true);
        result.current.setIsPlayheadDragging(true);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.isPlayheadDragging).toBe(true);
    });
  });

  describe("setIsContextMenuOpen", () => {
    it("should set context menu open state", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsContextMenuOpen(true);
      });

      expect(result.current.isContextMenuOpen).toBe(true);
    });

    it("should close context menu", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setIsContextMenuOpen(true);
        result.current.setIsContextMenuOpen(false);
      });

      expect(result.current.isContextMenuOpen).toBe(false);
    });
  });

  describe("setTimelineRef", () => {
    it("should set timeline ref", () => {
      const { result } = renderHook(() => useTimelineStore());
      const mockRef = { current: document.createElement("div") };

      act(() => {
        result.current.setTimelineRef(mockRef);
      });

      expect(result.current.timelineRef).toBe(mockRef);
    });

    it("should handle null ref", () => {
      const { result } = renderHook(() => useTimelineStore());
      const mockRef = { current: null };

      act(() => {
        result.current.setTimelineRef(mockRef);
      });

      expect(result.current.timelineRef).toBe(mockRef);
    });
  });

  describe("drag and drop operations", () => {
    describe("setDraggedItem", () => {
      it("should set dragged item", () => {
        const { result } = renderHook(() => useTimelineStore());
        const item = createMockTimelineItem("item-1");

        act(() => {
          result.current.setDraggedItem(item);
        });

        expect(result.current.draggedItem).toEqual(item);
      });

      it("should clear dragged item", () => {
        const { result } = renderHook(() => useTimelineStore());
        const item = createMockTimelineItem("item-1");

        act(() => {
          result.current.setDraggedItem(item);
          result.current.setDraggedItem(null);
        });

        expect(result.current.draggedItem).toBeNull();
      });
    });

    describe("setGhostElement", () => {
      it("should set ghost element", () => {
        const { result } = renderHook(() => useTimelineStore());
        const ghostData: GhostInstanceData[] = [
          { id: "item-1", left: 100, width: 200, top: 50 },
        ];

        act(() => {
          result.current.setGhostElement(ghostData);
        });

        expect(result.current.ghostElement).toEqual(ghostData);
      });

      it("should handle multiple ghost elements", () => {
        const { result } = renderHook(() => useTimelineStore());
        const ghostData: GhostInstanceData[] = [
          { id: "item-1", left: 100, width: 200, top: 50 },
          { id: "item-2", left: 350, width: 150, top: 100 },
        ];

        act(() => {
          result.current.setGhostElement(ghostData);
        });

        expect(result.current.ghostElement).toHaveLength(2);
        expect(result.current.ghostElement).toEqual(ghostData);
      });

      it("should clear ghost element", () => {
        const { result } = renderHook(() => useTimelineStore());
        const ghostData: GhostInstanceData[] = [
          { id: "item-1", left: 100, width: 200, top: 50 },
        ];

        act(() => {
          result.current.setGhostElement(ghostData);
          result.current.setGhostElement(null);
        });

        expect(result.current.ghostElement).toBeNull();
      });
    });

    describe("setFloatingGhost", () => {
      it("should set floating ghost data", () => {
        const { result } = renderHook(() => useTimelineStore());
        const floatingGhost: FloatingGhostData = {
          position: { x: 100, y: 50 },
          width: 200,
          isValid: true,
          itemData: { type: "video", label: "Video Clip" },
        };

        act(() => {
          result.current.setFloatingGhost(floatingGhost);
        });

        expect(result.current.floatingGhost).toEqual(floatingGhost);
      });

      it("should set floating ghost with invalid drop", () => {
        const { result } = renderHook(() => useTimelineStore());
        const floatingGhost: FloatingGhostData = {
          position: { x: 100, y: 50 },
          width: 200,
          isValid: false,
        };

        act(() => {
          result.current.setFloatingGhost(floatingGhost);
        });

        expect(result.current.floatingGhost?.isValid).toBe(false);
      });

      it("should clear floating ghost", () => {
        const { result } = renderHook(() => useTimelineStore());
        const floatingGhost: FloatingGhostData = {
          position: { x: 100, y: 50 },
          width: 200,
          isValid: true,
        };

        act(() => {
          result.current.setFloatingGhost(floatingGhost);
          result.current.setFloatingGhost(null);
        });

        expect(result.current.floatingGhost).toBeNull();
      });
    });

    describe("setIsValidDrop", () => {
      it("should set valid drop to true", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.setIsValidDrop(true);
        });

        expect(result.current.isValidDrop).toBe(true);
      });

      it("should set valid drop to false", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.setIsValidDrop(false);
        });

        expect(result.current.isValidDrop).toBe(false);
      });
    });

    describe("setDragInfo", () => {
      it("should set drag info", () => {
        const { result } = renderHook(() => useTimelineStore());
        const dragInfo: DragInfoState = {
          id: "item-1",
          action: "move",
          startX: 100,
          startY: 50,
          startPosition: 0,
          startDuration: 5,
          startRow: 0,
          isValidDrop: true,
          selectedItemsSnapshot: [],
        };

        act(() => {
          result.current.setDragInfo(dragInfo);
        });

        expect(result.current.dragInfo).toEqual(dragInfo);
      });

      it("should set drag info for resize operation", () => {
        const { result } = renderHook(() => useTimelineStore());
        const dragInfo: DragInfoState = {
          id: "item-1",
          action: "resize-end",
          startX: 300,
          startY: 50,
          startPosition: 0,
          startDuration: 5,
          startRow: 0,
          isValidDrop: true,
          selectedItemsSnapshot: [],
        };

        act(() => {
          result.current.setDragInfo(dragInfo);
        });

        expect(result.current.dragInfo?.action).toBe("resize-end");
      });

      it("should clear drag info", () => {
        const { result } = renderHook(() => useTimelineStore());
        const dragInfo: DragInfoState = {
          id: "item-1",
          action: "move",
          startX: 100,
          startY: 50,
          startPosition: 0,
          startDuration: 5,
          startRow: 0,
          isValidDrop: true,
          selectedItemsSnapshot: [],
        };

        act(() => {
          result.current.setDragInfo(dragInfo);
          result.current.setDragInfo(null);
        });

        expect(result.current.dragInfo).toBeNull();
      });
    });

    describe("getDragInfo", () => {
      it("should get current drag info", () => {
        const { result } = renderHook(() => useTimelineStore());
        const dragInfo: DragInfoState = {
          id: "item-1",
          action: "move",
          startX: 100,
          startY: 50,
          startPosition: 0,
          startDuration: 5,
          startRow: 0,
          isValidDrop: true,
          selectedItemsSnapshot: [],
        };

        act(() => {
          result.current.setDragInfo(dragInfo);
        });

        const retrievedDragInfo = result.current.getDragInfo();
        expect(retrievedDragInfo).toEqual(dragInfo);
      });

      it("should return null when no drag info is set", () => {
        const { result } = renderHook(() => useTimelineStore());

        const dragInfo = result.current.getDragInfo();
        expect(dragInfo).toBeNull();
      });
    });
  });

  describe("new item drag operations", () => {
    it("should set new item drag state", () => {
      const { result } = renderHook(() => useTimelineStore());
      const newItemDragState: NewItemDragState = {
        isDragging: true,
        itemType: "video",
        ghostElement: { left: 100, width: 200, top: 50 },
        itemData: { type: "video", label: "New Video", duration: 5 },
      };

      act(() => {
        result.current.setNewItemDragState(newItemDragState);
      });

      expect(result.current.newItemDragState).toEqual(newItemDragState);
    });

    it("should clear new item drag state", () => {
      const { result } = renderHook(() => useTimelineStore());
      const newItemDragState: NewItemDragState = {
        isDragging: true,
        itemType: "video",
        ghostElement: { left: 100, width: 200, top: 50 },
      };

      act(() => {
        result.current.setNewItemDragState(newItemDragState);
        result.current.setNewItemDragState({
          isDragging: false,
          itemType: null,
          ghostElement: null,
        });
      });

      expect(result.current.newItemDragState.isDragging).toBe(false);
      expect(result.current.newItemDragState.itemType).toBeNull();
    });
  });

  describe("live preview operations", () => {
    describe("setLivePreviewUpdates", () => {
      it("should set live preview updates", () => {
        const { result } = renderHook(() => useTimelineStore());
        const updates = new Map<string, Partial<any>>();
        updates.set("item-1", { start: 10, duration: 5 });

        act(() => {
          result.current.setLivePreviewUpdates(updates);
        });

        expect(result.current.livePreviewUpdates.size).toBe(1);
        expect(result.current.livePreviewUpdates.get("item-1")).toEqual({
          start: 10,
          duration: 5,
        });
      });

      it("should handle multiple preview updates", () => {
        const { result } = renderHook(() => useTimelineStore());
        const updates = new Map<string, Partial<any>>();
        updates.set("item-1", { start: 10, duration: 5 });
        updates.set("item-2", { start: 20, duration: 3 });

        act(() => {
          result.current.setLivePreviewUpdates(updates);
        });

        expect(result.current.livePreviewUpdates.size).toBe(2);
      });

      it("should clear all preview updates", () => {
        const { result } = renderHook(() => useTimelineStore());
        const updates = new Map<string, Partial<any>>();
        updates.set("item-1", { start: 10, duration: 5 });

        act(() => {
          result.current.setLivePreviewUpdates(updates);
          result.current.setLivePreviewUpdates(new Map());
        });

        expect(result.current.livePreviewUpdates.size).toBe(0);
      });
    });

    describe("updateLivePreview", () => {
      it("should add live preview for an item", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.updateLivePreview("item-1", { start: 10, duration: 5 });
        });

        expect(result.current.livePreviewUpdates.get("item-1")).toEqual({
          start: 10,
          duration: 5,
        });
      });

      it("should update existing live preview", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.updateLivePreview("item-1", { start: 10 });
          result.current.updateLivePreview("item-1", { duration: 8 });
        });

        expect(result.current.livePreviewUpdates.get("item-1")).toEqual({
          start: 10,
          duration: 8,
        });
      });

      it("should remove live preview for specific item", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.updateLivePreview("item-1", { start: 10, duration: 5 });
          result.current.updateLivePreview("item-1", null);
        });

        expect(result.current.livePreviewUpdates.has("item-1")).toBe(false);
      });

      it("should clear all live previews", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.updateLivePreview("item-1", { start: 10 });
          result.current.updateLivePreview("item-2", { start: 20 });
          result.current.updateLivePreview(null, null);
        });

        expect(result.current.livePreviewUpdates.size).toBe(0);
      });

      it("should handle multiple items independently", () => {
        const { result } = renderHook(() => useTimelineStore());

        act(() => {
          result.current.updateLivePreview("item-1", { start: 10 });
          result.current.updateLivePreview("item-2", { start: 20 });
        });

        expect(result.current.livePreviewUpdates.size).toBe(2);
        expect(result.current.livePreviewUpdates.get("item-1")).toEqual({ start: 10 });
        expect(result.current.livePreviewUpdates.get("item-2")).toEqual({ start: 20 });
      });
    });
  });

  describe("insertion indicator", () => {
    it("should set insertion index", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setInsertionIndex(2);
      });

      expect(result.current.insertionIndex).toBe(2);
    });

    it("should clear insertion index", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setInsertionIndex(2);
        result.current.setInsertionIndex(null);
      });

      expect(result.current.insertionIndex).toBeNull();
    });

    it("should get insertion index", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setInsertionIndex(3);
      });

      const index = result.current.getInsertionIndex();
      expect(index).toBe(3);
    });

    it("should handle zero insertion index", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setInsertionIndex(0);
      });

      expect(result.current.insertionIndex).toBe(0);
    });
  });

  describe("magnetic preview", () => {
    it("should set magnetic preview", () => {
      const { result } = renderHook(() => useTimelineStore());
      const preview = {
        trackId: "track-1",
        previewItems: [
          { id: "item-1", start: 0, end: 5, duration: 5 },
          { id: "item-2", start: 5, end: 10, duration: 5 },
        ],
      };

      act(() => {
        result.current.setMagneticPreview(preview);
      });

      expect(result.current.magneticPreview).toEqual(preview);
    });

    it("should clear magnetic preview", () => {
      const { result } = renderHook(() => useTimelineStore());
      const preview = {
        trackId: "track-1",
        previewItems: [{ id: "item-1", start: 0, end: 5, duration: 5 }],
      };

      act(() => {
        result.current.setMagneticPreview(preview);
        result.current.setMagneticPreview(null);
      });

      expect(result.current.magneticPreview).toBeNull();
    });

    it("should handle empty preview items", () => {
      const { result } = renderHook(() => useTimelineStore());
      const preview = {
        trackId: "track-1",
        previewItems: [],
      };

      act(() => {
        result.current.setMagneticPreview(preview);
      });

      expect(result.current.magneticPreview?.previewItems).toHaveLength(0);
    });
  });

  describe("current drag position", () => {
    it("should set current drag position", () => {
      const { result } = renderHook(() => useTimelineStore());
      const position = { start: 10, end: 15, trackIndex: 2 };

      act(() => {
        result.current.setCurrentDragPosition(position);
      });

      expect(result.current.currentDragPosition).toEqual(position);
    });

    it("should clear current drag position", () => {
      const { result } = renderHook(() => useTimelineStore());
      const position = { start: 10, end: 15, trackIndex: 2 };

      act(() => {
        result.current.setCurrentDragPosition(position);
        result.current.setCurrentDragPosition(null);
      });

      expect(result.current.currentDragPosition).toBeNull();
    });

    it("should handle different track indices", () => {
      const { result } = renderHook(() => useTimelineStore());
      const positions = [
        { start: 0, end: 5, trackIndex: 0 },
        { start: 5, end: 10, trackIndex: 1 },
        { start: 10, end: 15, trackIndex: 2 },
      ];

      positions.forEach((pos) => {
        act(() => {
          result.current.setCurrentDragPosition(pos);
        });
        expect(result.current.currentDragPosition).toEqual(pos);
      });
    });
  });

  describe("resetDragState", () => {
    it("should reset all drag-related state", () => {
      const { result } = renderHook(() => useTimelineStore());
      const item = createMockTimelineItem("item-1");
      const ghostData: GhostInstanceData[] = [
        { id: "item-1", left: 100, width: 200, top: 50 },
      ];
      const dragInfo: DragInfoState = {
        id: "item-1",
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [],
      };

      act(() => {
        result.current.setDraggedItem(item);
        result.current.setGhostElement(ghostData);
        result.current.setIsValidDrop(true);
        result.current.setDragInfo(dragInfo);
        result.current.setIsDragging(true);
        result.current.setInsertionIndex(2);
        result.current.setMagneticPreview({
          trackId: "track-1",
          previewItems: [],
        });
        result.current.setCurrentDragPosition({ start: 0, end: 5, trackIndex: 0 });
        result.current.resetDragState();
      });

      expect(result.current.draggedItem).toBeNull();
      expect(result.current.ghostElement).toBeNull();
      expect(result.current.floatingGhost).toBeNull();
      expect(result.current.isValidDrop).toBe(false);
      expect(result.current.dragInfo).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.insertionIndex).toBeNull();
      expect(result.current.magneticPreview).toBeNull();
      expect(result.current.currentDragPosition).toBeNull();
    });

    it("should not affect non-drag state", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setGhostMarkerPosition(100);
        result.current.setIsPlayheadDragging(true);
        result.current.setIsContextMenuOpen(true);
        result.current.resetDragState();
      });

      expect(result.current.ghostMarkerPosition).toBe(100);
      expect(result.current.isPlayheadDragging).toBe(true);
      expect(result.current.isContextMenuOpen).toBe(true);
    });
  });

  describe("clearAllState", () => {
    it("should clear all state to initial values", () => {
      const { result } = renderHook(() => useTimelineStore());
      const item = createMockTimelineItem("item-1");

      act(() => {
        result.current.setGhostMarkerPosition(100);
        result.current.setIsDragging(true);
        result.current.setIsContextMenuOpen(true);
        result.current.setDraggedItem(item);
        result.current.updateLivePreview("item-1", { start: 10 });
        result.current.setInsertionIndex(2);
        result.current.clearAllState();
      });

      expect(result.current.ghostMarkerPosition).toBeNull();
      expect(result.current.isDragging).toBe(false);
      expect(result.current.isContextMenuOpen).toBe(false);
      expect(result.current.draggedItem).toBeNull();
      expect(result.current.ghostElement).toBeNull();
      expect(result.current.floatingGhost).toBeNull();
      expect(result.current.isValidDrop).toBe(true);
      expect(result.current.dragInfo).toBeNull();
      expect(result.current.newItemDragState).toEqual({
        isDragging: false,
        itemType: null,
        ghostElement: null,
      });
      expect(result.current.livePreviewUpdates.size).toBe(0);
      expect(result.current.insertionIndex).toBeNull();
    });
  });

  describe("complex drag scenarios", () => {
    it("should handle complete drag operation lifecycle", () => {
      const { result } = renderHook(() => useTimelineStore());
      const item = createMockTimelineItem("item-1");
      const dragInfo: DragInfoState = {
        id: "item-1",
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          {
            id: "item-1",
            originalStart: 0,
            originalDuration: 5,
            originalRow: 0,
          },
        ],
      };

      // Start drag
      act(() => {
        result.current.setDraggedItem(item);
        result.current.setIsDragging(true);
        result.current.setDragInfo(dragInfo);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.draggedItem).toEqual(item);

      // Update during drag
      act(() => {
        result.current.updateLivePreview("item-1", { start: 10 });
        result.current.setIsValidDrop(true);
      });

      expect(result.current.livePreviewUpdates.get("item-1")).toEqual({ start: 10 });

      // Complete drag
      act(() => {
        result.current.resetDragState();
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedItem).toBeNull();
    });

    it("should handle multi-item selection drag", () => {
      const { result } = renderHook(() => useTimelineStore());
      const dragInfo: DragInfoState = {
        id: "item-1",
        action: "move",
        startX: 100,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [
          { id: "item-1", originalStart: 0, originalDuration: 5, originalRow: 0 },
          { id: "item-2", originalStart: 10, originalDuration: 3, originalRow: 1 },
          { id: "item-3", originalStart: 15, originalDuration: 4, originalRow: 0 },
        ],
      };

      act(() => {
        result.current.setDragInfo(dragInfo);
      });

      expect(result.current.dragInfo?.selectedItemsSnapshot).toHaveLength(3);
    });

    it("should handle resize operations", () => {
      const { result } = renderHook(() => useTimelineStore());
      const dragInfo: DragInfoState = {
        id: "item-1",
        action: "resize-end",
        startX: 300,
        startY: 50,
        startPosition: 0,
        startDuration: 5,
        startRow: 0,
        isValidDrop: true,
        selectedItemsSnapshot: [],
        currentDuration: 8,
      };

      act(() => {
        result.current.setDragInfo(dragInfo);
        result.current.updateLivePreview("item-1", { duration: 8 });
      });

      expect(result.current.dragInfo?.action).toBe("resize-end");
      expect(result.current.dragInfo?.currentDuration).toBe(8);
      expect(result.current.livePreviewUpdates.get("item-1")).toEqual({ duration: 8 });
    });
  });

  describe("store persistence", () => {
    it("should maintain state across multiple operations", () => {
      const { result } = renderHook(() => useTimelineStore());

      act(() => {
        result.current.setGhostMarkerPosition(50);
      });

      expect(result.current.ghostMarkerPosition).toBe(50);

      act(() => {
        result.current.setIsDragging(true);
      });

      expect(result.current.ghostMarkerPosition).toBe(50);
      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.updateLivePreview("item-1", { start: 10 });
      });

      expect(result.current.ghostMarkerPosition).toBe(50);
      expect(result.current.isDragging).toBe(true);
      expect(result.current.livePreviewUpdates.get("item-1")).toEqual({ start: 10 });
    });
  });
});

