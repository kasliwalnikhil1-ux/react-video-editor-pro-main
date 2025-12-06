import { renderHook, act } from "@testing-library/react";
import useZoomStore, { ZoomState } from "app/reactvideoeditor/pro/components/advanced-timeline/stores/use-zoom-store";
import { ZOOM_CONSTRAINTS } from "app/reactvideoeditor/pro/components/advanced-timeline/constants";

describe("useZoomStore", () => {
  // Reset store state before each test
  beforeEach(() => {
    const { result } = renderHook(() => useZoomStore());
    act(() => {
      result.current.setZoomState({
        scale: ZOOM_CONSTRAINTS.default,
        scroll: 0,
      });
      result.current.setTimelineRef(null);
    });
  });

  describe("initialization", () => {
    it("should initialize with default zoom state", () => {
      const { result } = renderHook(() => useZoomStore());

      expect(result.current.zoomState.scale).toBe(ZOOM_CONSTRAINTS.default);
      expect(result.current.zoomState.scroll).toBe(0);
    });

    it("should initialize with null timeline ref", () => {
      const { result } = renderHook(() => useZoomStore());

      expect(result.current.timelineRef).toBeNull();
    });
  });

  describe("setZoomState", () => {
    it("should update zoom state", () => {
      const { result } = renderHook(() => useZoomStore());
      const newZoomState: ZoomState = {
        scale: 2,
        scroll: 100,
      };

      act(() => {
        result.current.setZoomState(newZoomState);
      });

      expect(result.current.zoomState).toEqual(newZoomState);
    });

    it("should handle minimum zoom scale", () => {
      const { result } = renderHook(() => useZoomStore());
      const minZoomState: ZoomState = {
        scale: ZOOM_CONSTRAINTS.min,
        scroll: 0,
      };

      act(() => {
        result.current.setZoomState(minZoomState);
      });

      expect(result.current.zoomState.scale).toBe(ZOOM_CONSTRAINTS.min);
    });

    it("should handle maximum zoom scale", () => {
      const { result } = renderHook(() => useZoomStore());
      const maxZoomState: ZoomState = {
        scale: ZOOM_CONSTRAINTS.max,
        scroll: 0,
      };

      act(() => {
        result.current.setZoomState(maxZoomState);
      });

      expect(result.current.zoomState.scale).toBe(ZOOM_CONSTRAINTS.max);
    });

    it("should handle different scroll values", () => {
      const { result } = renderHook(() => useZoomStore());
      const scrollValues = [0, 50, 100, 500, 1000];

      scrollValues.forEach((scrollValue) => {
        act(() => {
          result.current.setZoomState({
            scale: ZOOM_CONSTRAINTS.default,
            scroll: scrollValue,
          });
        });

        expect(result.current.zoomState.scroll).toBe(scrollValue);
      });
    });

    it("should update only scale while preserving scroll", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({
          scale: ZOOM_CONSTRAINTS.default,
          scroll: 200,
        });
      });

      act(() => {
        result.current.setZoomState({
          scale: 2.5,
          scroll: 200,
        });
      });

      expect(result.current.zoomState.scale).toBe(2.5);
      expect(result.current.zoomState.scroll).toBe(200);
    });

    it("should update only scroll while preserving scale", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({
          scale: 3,
          scroll: 100,
        });
      });

      act(() => {
        result.current.setZoomState({
          scale: 3,
          scroll: 300,
        });
      });

      expect(result.current.zoomState.scale).toBe(3);
      expect(result.current.zoomState.scroll).toBe(300);
    });

    it("should handle negative scroll values", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({
          scale: ZOOM_CONSTRAINTS.default,
          scroll: -50,
        });
      });

      expect(result.current.zoomState.scroll).toBe(-50);
    });
  });

  describe("setTimelineRef", () => {
    it("should set timeline ref with valid element", () => {
      const { result } = renderHook(() => useZoomStore());
      const mockRef = { current: document.createElement("div") };

      act(() => {
        result.current.setTimelineRef(mockRef);
      });

      expect(result.current.timelineRef).toBe(mockRef);
      expect(result.current.timelineRef?.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should handle null ref", () => {
      const { result } = renderHook(() => useZoomStore());
      const mockRef = { current: null };

      act(() => {
        result.current.setTimelineRef(mockRef);
      });

      expect(result.current.timelineRef).toBe(mockRef);
      expect(result.current.timelineRef?.current).toBeNull();
    });

    it("should update timeline ref", () => {
      const { result } = renderHook(() => useZoomStore());
      const mockRef1 = { current: document.createElement("div") };
      const mockRef2 = { current: document.createElement("div") };

      act(() => {
        result.current.setTimelineRef(mockRef1);
      });

      expect(result.current.timelineRef).toBe(mockRef1);

      act(() => {
        result.current.setTimelineRef(mockRef2);
      });

      expect(result.current.timelineRef).toBe(mockRef2);
    });

    it("should clear timeline ref", () => {
      const { result } = renderHook(() => useZoomStore());
      const mockRef = { current: document.createElement("div") };

      act(() => {
        result.current.setTimelineRef(mockRef);
        result.current.setTimelineRef(null);
      });

      expect(result.current.timelineRef).toBeNull();
    });
  });

  describe("complex zoom operations", () => {
    it("should handle zoom in sequence", () => {
      const { result } = renderHook(() => useZoomStore());
      const scales = [1, 1.5, 2, 2.5, 3];

      scales.forEach((scale) => {
        act(() => {
          result.current.setZoomState({
            scale,
            scroll: result.current.zoomState.scroll,
          });
        });

        expect(result.current.zoomState.scale).toBe(scale);
      });
    });

    it("should handle zoom out sequence", () => {
      const { result } = renderHook(() => useZoomStore());
      const scales = [3, 2.5, 2, 1.5, 1, 0.5];

      scales.forEach((scale) => {
        act(() => {
          result.current.setZoomState({
            scale,
            scroll: result.current.zoomState.scroll,
          });
        });

        expect(result.current.zoomState.scale).toBe(scale);
      });
    });

    it("should maintain state consistency when updating zoom and scroll together", () => {
      const { result } = renderHook(() => useZoomStore());

      const updates = [
        { scale: 1.5, scroll: 100 },
        { scale: 2, scroll: 200 },
        { scale: 1, scroll: 50 },
      ];

      updates.forEach((update) => {
        act(() => {
          result.current.setZoomState(update);
        });

        expect(result.current.zoomState).toEqual(update);
      });
    });

    it("should handle rapid zoom updates", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setZoomState({
            scale: 1 + i * 0.1,
            scroll: i * 10,
          });
        }
      });

      expect(result.current.zoomState.scale).toBe(1.9);
      expect(result.current.zoomState.scroll).toBe(90);
    });
  });

  describe("store persistence", () => {
    it("should maintain zoom state across multiple operations", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({ scale: 2, scroll: 100 });
      });

      expect(result.current.zoomState.scale).toBe(2);
      expect(result.current.zoomState.scroll).toBe(100);

      act(() => {
        result.current.setTimelineRef({ current: document.createElement("div") });
      });

      // Zoom state should remain unchanged after setting timeline ref
      expect(result.current.zoomState.scale).toBe(2);
      expect(result.current.zoomState.scroll).toBe(100);
    });

    it("should maintain timeline ref across zoom state changes", () => {
      const { result } = renderHook(() => useZoomStore());
      const mockRef = { current: document.createElement("div") };

      act(() => {
        result.current.setTimelineRef(mockRef);
      });

      expect(result.current.timelineRef).toBe(mockRef);

      act(() => {
        result.current.setZoomState({ scale: 2, scroll: 100 });
      });

      // Timeline ref should remain unchanged after zoom state update
      expect(result.current.timelineRef).toBe(mockRef);
    });
  });

  describe("edge cases", () => {
    it("should handle zero scroll value", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({ scale: 2, scroll: 0 });
      });

      expect(result.current.zoomState.scroll).toBe(0);
    });

    it("should handle fractional scale values", () => {
      const { result } = renderHook(() => useZoomStore());
      const fractionalScales = [0.5, 1.25, 2.75, 4.99];

      fractionalScales.forEach((scale) => {
        act(() => {
          result.current.setZoomState({ scale, scroll: 0 });
        });

        expect(result.current.zoomState.scale).toBe(scale);
      });
    });

    it("should handle very large scroll values", () => {
      const { result } = renderHook(() => useZoomStore());

      act(() => {
        result.current.setZoomState({ scale: 1, scroll: 999999 });
      });

      expect(result.current.zoomState.scroll).toBe(999999);
    });
  });
});

