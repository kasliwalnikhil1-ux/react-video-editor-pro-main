import { renderHook, act } from "@testing-library/react";
import { useTimelineTracks } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-tracks";
import { TimelineTrack, TimelineItem } from "app/reactvideoeditor/pro/components/advanced-timeline/types";

describe("useTimelineTracks", () => {
  // Helper to create a basic track
  const createTrack = (id: string, items: TimelineItem[] = [], magnetic: boolean = false): TimelineTrack => ({
    id,
    name: `Track ${id}`,
    items,
    magnetic,
    visible: true,
    muted: false,
  });

  // Helper to create a basic item
  const createItem = (id: string, trackId: string, start: number, end: number, type: string = "video"): TimelineItem => ({
    id,
    trackId,
    start,
    end,
    label: `Item ${id}`,
    type,
  });

  describe("initialization", () => {
    it("should initialize with provided tracks", () => {
      const initialTracks = [createTrack("track-1")];
      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks,
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current.tracks).toEqual(initialTracks);
    });

    it("should update tracks when initialTracks prop changes", () => {
      const initialTracks = [createTrack("track-1")];
      const { result, rerender } = renderHook(
        ({ tracks }) =>
          useTimelineTracks({
            initialTracks: tracks,
            autoRemoveEmptyTracks: false,
          }),
        { initialProps: { tracks: initialTracks } }
      );

      expect(result.current.tracks).toEqual(initialTracks);

      const newTracks = [createTrack("track-1"), createTrack("track-2")];
      rerender({ tracks: newTracks });

      expect(result.current.tracks).toEqual(newTracks);
    });

    it("should return all expected methods and properties", () => {
      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: [],
          autoRemoveEmptyTracks: false,
        })
      );

      expect(typeof result.current.tracks).toBe("object");
      expect(typeof result.current.setTracks).toBe("function");
      expect(typeof result.current.removeEmptyTracks).toBe("function");
      expect(typeof result.current.handleItemMove).toBe("function");
      expect(typeof result.current.handleItemResize).toBe("function");
      expect(typeof result.current.handleItemsDelete).toBe("function");
      expect(typeof result.current.handleInsertTrackAt).toBe("function");
      expect(typeof result.current.handleInsertMultipleTracksAt).toBe("function");
      expect(typeof result.current.handleCreateTracksWithItems).toBe("function");
      expect(typeof result.current.handleTrackReorder).toBe("function");
      expect(typeof result.current.handleTrackDelete).toBe("function");
      expect(typeof result.current.handleToggleMagnetic).toBe("function");
      expect(typeof result.current.addNewItem).toBe("function");
    });
  });

  describe("removeEmptyTracks", () => {
    it("should remove empty tracks when autoRemoveEmptyTracks is true", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [
        createTrack("track-1", [item1]),
        createTrack("track-2", []),
        createTrack("track-3", []),
      ];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: true,
        })
      );

      const filtered = result.current.removeEmptyTracks(tracks);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("track-1");
    });

    it("should keep empty tracks when autoRemoveEmptyTracks is false", () => {
      const tracks = [createTrack("track-1", []), createTrack("track-2", [])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      const filtered = result.current.removeEmptyTracks(tracks);
      expect(filtered).toHaveLength(2);
    });

    it("should always keep at least one track even when all are empty", () => {
      const tracks = [createTrack("track-1", [])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: true,
        })
      );

      const filtered = result.current.removeEmptyTracks(tracks);
      expect(filtered).toHaveLength(1);
    });

    it("should create a new track if all tracks are empty and none exist", () => {
      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: [],
          autoRemoveEmptyTracks: true,
        })
      );

      const filtered = result.current.removeEmptyTracks([]);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].items).toHaveLength(0);
    });
  });

  describe("handleInsertTrackAt", () => {
    it("should insert a new track at the specified index", () => {
      const tracks = [createTrack("track-1"), createTrack("track-2")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      let newTrackId: string;
      act(() => {
        newTrackId = result.current.handleInsertTrackAt(1);
      });

      expect(result.current.tracks).toHaveLength(3);
      expect(result.current.tracks[1].id).toBe(newTrackId!);
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should clamp index to valid range", () => {
      const tracks = [createTrack("track-1")];
      
      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleInsertTrackAt(-1); // Should clamp to 0
      });

      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[0].items).toHaveLength(0);

      act(() => {
        result.current.handleInsertTrackAt(999); // Should clamp to end
      });

      expect(result.current.tracks).toHaveLength(3);
    });
  });

  describe("handleInsertMultipleTracksAt", () => {
    it("should insert multiple tracks at the specified index", () => {
      const tracks = [createTrack("track-1")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      let newTrackIds: string[];
      act(() => {
        newTrackIds = result.current.handleInsertMultipleTracksAt(0, 3);
      });

      expect(result.current.tracks).toHaveLength(4);
      expect(newTrackIds!).toHaveLength(3);
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should return empty array when count is 0", () => {
      const tracks = [createTrack("track-1")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      let newTrackIds: string[];
      act(() => {
        newTrackIds = result.current.handleInsertMultipleTracksAt(0, 0);
      });

      expect(result.current.tracks).toHaveLength(1);
      expect(newTrackIds!).toHaveLength(0);
    });
  });

  describe("handleTrackReorder", () => {
    it("should reorder tracks correctly", () => {
      const tracks = [
        createTrack("track-1"),
        createTrack("track-2"),
        createTrack("track-3"),
      ];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleTrackReorder(0, 2);
      });

      expect(result.current.tracks[0].id).toBe("track-2");
      expect(result.current.tracks[1].id).toBe("track-3");
      expect(result.current.tracks[2].id).toBe("track-1");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should not reorder when indices are invalid", () => {
      const tracks = [createTrack("track-1"), createTrack("track-2")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleTrackReorder(-1, 1);
      });

      expect(result.current.tracks[0].id).toBe("track-1");
      expect(result.current.tracks[1].id).toBe("track-2");
    });

    it("should not reorder when fromIndex equals toIndex", () => {
      const tracks = [createTrack("track-1"), createTrack("track-2")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleTrackReorder(1, 1);
      });

      expect(result.current.tracks).toEqual(tracks);
      expect(onTracksChange).not.toHaveBeenCalled();
    });
  });

  describe("handleTrackDelete", () => {
    it("should delete a track by id", () => {
      const tracks = [createTrack("track-1"), createTrack("track-2")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleTrackDelete("track-1");
      });

      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].id).toBe("track-2");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should always keep at least one track", () => {
      const tracks = [createTrack("track-1")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleTrackDelete("track-1");
      });

      expect(result.current.tracks).toHaveLength(1);
    });

    it("should clear selection for items in deleted track", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-2", 0, 5);
      const tracks = [
        createTrack("track-1", [item1]),
        createTrack("track-2", [item2]),
      ];
      const onSelectedItemsChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          selectedItemIds: ["item-1", "item-2"],
          onSelectedItemsChange,
        })
      );

      act(() => {
        result.current.handleTrackDelete("track-1");
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith(["item-2"]);
    });
  });

  describe("handleToggleMagnetic", () => {
    it("should toggle magnetic property on a track", () => {
      const tracks = [createTrack("track-1", [], false)];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleToggleMagnetic("track-1");
      });

      expect(result.current.tracks[0].magnetic).toBe(true);
      expect(onTracksChange).toHaveBeenCalled();

      act(() => {
        result.current.handleToggleMagnetic("track-1");
      });

      expect(result.current.tracks[0].magnetic).toBe(false);
    });

    it("should close gaps when enabling magnetic mode", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 10, 15);
      const tracks = [createTrack("track-1", [item1, item2], false)];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleToggleMagnetic("track-1");
      });

      expect(result.current.tracks[0].magnetic).toBe(true);
      // Gap should be closed - second item should now start at 5
      expect(result.current.tracks[0].items[1].start).toBe(5);
      expect(result.current.tracks[0].items[1].end).toBe(10);
    });
  });

  describe("handleItemMove", () => {
    it("should move an item to a new position on the same track", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1])];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleItemMove("item-1", 10, 15, "track-1");
      });

      expect(result.current.tracks[0].items[0].start).toBe(10);
      expect(result.current.tracks[0].items[0].end).toBe(15);
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should move an item to a different track", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1]), createTrack("track-2", [])];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleItemMove("item-1", 10, 15, "track-2");
      });

      expect(result.current.tracks[0].items).toHaveLength(0);
      expect(result.current.tracks[1].items).toHaveLength(1);
      expect(result.current.tracks[1].items[0].id).toBe("item-1");
      expect(result.current.tracks[1].items[0].start).toBe(10);
      expect(result.current.tracks[1].items[0].end).toBe(15);
      expect(result.current.tracks[1].items[0].trackId).toBe("track-2");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should handle magnetic track insertion when moving to magnetic track", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-2", 0, 5);
      const item3 = createItem("item-3", "track-2", 5, 10);
      const tracks = [
        createTrack("track-1", [item1]),
        createTrack("track-2", [item2, item3], true), // Magnetic track
      ];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        // Move item-1 to track-2 at position 2 (should be inserted between item2 and item3)
        result.current.handleItemMove("item-1", 2, 7, "track-2");
      });

      // In magnetic mode, items should be repositioned
      expect(result.current.tracks[1].items).toHaveLength(3);
      expect(result.current.tracks[1].magnetic).toBe(true);
    });

    it("should close gaps in source magnetic track after item is moved", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 5, 10);
      const tracks = [
        createTrack("track-1", [item1, item2], true), // Magnetic track
        createTrack("track-2", []),
      ];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleItemMove("item-1", 20, 25, "track-2");
      });

      // Source track should have gap closed
      expect(result.current.tracks[0].items).toHaveLength(1);
      expect(result.current.tracks[0].items[0].start).toBe(0);
      expect(result.current.tracks[0].items[0].end).toBe(5);
    });

    it("should remove empty tracks when autoRemoveEmptyTracks is enabled", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1]), createTrack("track-2", [])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: true,
        })
      );

      act(() => {
        result.current.handleItemMove("item-1", 10, 15, "track-2");
      });

      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].id).toBe("track-2");
    });
  });

  describe("handleItemResize", () => {
    it("should resize an item", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1])];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleItemResize("item-1", 0, 10);
      });

      expect(result.current.tracks[0].items[0].start).toBe(0);
      expect(result.current.tracks[0].items[0].end).toBe(10);
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should handle resize with mediaStart for video items", () => {
      const videoItem: TimelineItem = {
        ...createItem("item-1", "track-1", 5, 10, "video"),
        mediaStart: 2,
        mediaSrcDuration: 20,
      };
      const tracks = [createTrack("track-1", [videoItem])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        // Resize from the left (move start from 5 to 3, which is -2 delta)
        result.current.handleItemResize("item-1", 3, 10);
      });

      // mediaStart should be adjusted: original mediaStart (2) + delta (-2) = 0
      expect(result.current.tracks[0].items[0].mediaStart).toBe(0);
      expect(result.current.tracks[0].items[0].start).toBe(3);
    });

    it("should not allow mediaStart to go negative", () => {
      const videoItem: TimelineItem = {
        ...createItem("item-1", "track-1", 5, 10, "video"),
        mediaStart: 1,
        mediaSrcDuration: 20,
      };
      const tracks = [createTrack("track-1", [videoItem])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        // Try to move start back by 5 seconds (would make mediaStart negative)
        result.current.handleItemResize("item-1", 0, 10);
      });

      // mediaStart should be clamped to 0
      expect(result.current.tracks[0].items[0].mediaStart).toBe(0);
    });

    it("should validate resize against source duration for video items", () => {
      const videoItem: TimelineItem = {
        ...createItem("item-1", "track-1", 0, 5, "video"),
        mediaStart: 0,
        mediaSrcDuration: 10, // Source is only 10 seconds long
      };
      const tracks = [createTrack("track-1", [videoItem])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        // Try to resize to 15 seconds (exceeds source duration)
        result.current.handleItemResize("item-1", 0, 15);
      });

      // Should be clamped to source duration (10 seconds)
      expect(result.current.tracks[0].items[0].end).toBe(10);
    });

    it("should close gaps in magnetic tracks after resize", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 10, 15);
      const tracks = [createTrack("track-1", [item1, item2], true)];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleItemResize("item-1", 0, 3);
      });

      // Gap should be closed after resize
      expect(result.current.tracks[0].items[0].end).toBe(3);
      expect(result.current.tracks[0].items[1].start).toBe(3);
      expect(result.current.tracks[0].items[1].end).toBe(8);
    });
  });

  describe("handleItemsDelete", () => {
    it("should delete items by id", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 5, 10);
      const tracks = [createTrack("track-1", [item1, item2])];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleItemsDelete(["item-1"]);
      });

      expect(result.current.tracks[0].items).toHaveLength(1);
      expect(result.current.tracks[0].items[0].id).toBe("item-2");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should delete multiple items at once", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 5, 10);
      const item3 = createItem("item-3", "track-1", 10, 15);
      const tracks = [createTrack("track-1", [item1, item2, item3])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleItemsDelete(["item-1", "item-3"]);
      });

      expect(result.current.tracks[0].items).toHaveLength(1);
      expect(result.current.tracks[0].items[0].id).toBe("item-2");
    });

    it("should close gaps in magnetic tracks after deletion", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 5, 10);
      const item3 = createItem("item-3", "track-1", 10, 15);
      const tracks = [createTrack("track-1", [item1, item2, item3], true)];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleItemsDelete(["item-2"]);
      });

      // Gap should be closed
      expect(result.current.tracks[0].items).toHaveLength(2);
      expect(result.current.tracks[0].items[1].start).toBe(5);
      expect(result.current.tracks[0].items[1].end).toBe(10);
    });

    it("should remove empty tracks when autoRemoveEmptyTracks is enabled", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1]), createTrack("track-2", [])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: true,
        })
      );

      act(() => {
        result.current.handleItemsDelete(["item-1"]);
      });

      // Both tracks should be gone, but one empty track should remain
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].items).toHaveLength(0);
    });
  });

  describe("handleCreateTracksWithItems", () => {
    it("should create multiple tracks with items atomically", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const item2 = createItem("item-2", "track-1", 5, 10);
      const tracks = [createTrack("track-1", [item1, item2])];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: true,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleCreateTracksWithItems(0, [
          {
            trackId: "new-track-1",
            items: [{ itemId: "item-1", start: 0, end: 5 }],
          },
          {
            trackId: "new-track-2",
            items: [{ itemId: "item-2", start: 0, end: 5 }],
          },
        ]);
      });

      // Should have created 2 new tracks, original track should be removed (auto-remove)
      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[0].id).toBe("new-track-1");
      expect(result.current.tracks[1].id).toBe("new-track-2");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should update item positions when creating tracks", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1])];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleCreateTracksWithItems(1, [
          {
            trackId: "new-track-1",
            items: [{ itemId: "item-1", start: 10, end: 15 }],
          },
        ]);
      });

      expect(result.current.tracks[1].items[0].start).toBe(10);
      expect(result.current.tracks[1].items[0].end).toBe(15);
    });
  });

  describe("addNewItem", () => {
    it("should add a new item to a track", () => {
      const tracks = [createTrack("track-1")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.addNewItem(
          {
            type: "video",
            label: "New Video",
            duration: 5,
            preferredTrackId: "track-1",
            preferredStartTime: 0,
          },
          0,
          30
        );
      });

      expect(result.current.tracks[0].items).toHaveLength(1);
      expect(result.current.tracks[0].items[0].type).toBe("video");
      expect(result.current.tracks[0].items[0].label).toBe("New Video");
      expect(onTracksChange).toHaveBeenCalled();
    });

    it("should add item to magnetic track with proper insertion", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1], true)];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.addNewItem(
          {
            type: "video",
            duration: 3,
            preferredTrackId: "track-1",
            preferredStartTime: 2, // Insert in middle
          },
          60,
          30
        );
      });

      expect(result.current.tracks[0].items.length).toBeGreaterThan(1);
    });

    it("should not crash when adding item fails", () => {
      const tracks = [createTrack("track-1")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      // Missing required data
      expect(() => {
        act(() => {
          result.current.addNewItem({} as any, 0, 30);
        });
      }).not.toThrow();
    });
  });

  describe("callbacks", () => {
    it("should call onTracksChange when tracks are modified", () => {
      const tracks = [createTrack("track-1")];
      const onTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          onTracksChange,
        })
      );

      act(() => {
        result.current.handleInsertTrackAt(0);
      });

      expect(onTracksChange).toHaveBeenCalledTimes(1);
    });

    it("should call onSelectedItemsChange when deleting track with selected items", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1]), createTrack("track-2", [])];
      const onSelectedItemsChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
          selectedItemIds: ["item-1"],
          onSelectedItemsChange,
        })
      );

      act(() => {
        result.current.handleTrackDelete("track-1");
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith([]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty initial tracks", () => {
      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: [],
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current.tracks).toEqual([]);
    });

    it("should handle operations on non-existent items gracefully", () => {
      const tracks = [createTrack("track-1")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleItemMove("non-existent", 0, 5, "track-1");
        });
      }).not.toThrow();
    });

    it("should handle operations on non-existent tracks gracefully", () => {
      const tracks = [createTrack("track-1")];

      const { result } = renderHook(() =>
        useTimelineTracks({
          initialTracks: tracks,
          autoRemoveEmptyTracks: false,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleTrackDelete("non-existent");
        });
      }).not.toThrow();
    });

    it("should update autoRemoveEmptyTracks when prop changes", () => {
      const item1 = createItem("item-1", "track-1", 0, 5);
      const tracks = [createTrack("track-1", [item1]), createTrack("track-2", [])];

      const { result, rerender } = renderHook(
        ({ autoRemove }) =>
          useTimelineTracks({
            initialTracks: tracks,
            autoRemoveEmptyTracks: autoRemove,
          }),
        { initialProps: { autoRemove: false } }
      );

      expect(result.current.tracks).toHaveLength(2);

      // Change to auto-remove enabled
      rerender({ autoRemove: true });

      act(() => {
        result.current.handleItemsDelete(["item-1"]);
      });

      // Should now remove empty tracks
      expect(result.current.tracks).toHaveLength(1);
    });
  });
});

