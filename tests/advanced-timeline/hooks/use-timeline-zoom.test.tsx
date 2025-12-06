import { renderHook, act } from "@testing-library/react";
import { useTimelineZoom } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-zoom";
import { ZOOM_CONSTRAINTS } from "app/reactvideoeditor/pro/components/advanced-timeline/constants";

describe("useTimelineZoom", () => {
  let mockTimelineRef: React.RefObject<HTMLDivElement | null>;
  let mockScrollContainer: HTMLDivElement;
  let mockTimeline: HTMLDivElement;

  beforeEach(() => {
    // Create mock DOM elements
    mockScrollContainer = document.createElement("div");
    mockTimeline = document.createElement("div");
    
    // Setup parent-child relationship
    mockScrollContainer.appendChild(mockTimeline);
    
    // Mock getBoundingClientRect
    mockScrollContainer.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 50,
      right: 500,
      bottom: 300,
      width: 400,
      height: 250,
      x: 100,
      y: 50,
      toJSON: () => {},
    }));
    
    // Set initial scroll position
    mockScrollContainer.scrollLeft = 0;
    
    // Create ref with mock timeline
    mockTimelineRef = {
      current: mockTimeline,
    };
  });

  it("should initialize with default zoom state", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.default);
    expect(result.current.scrollPosition).toBe(0);
  });

  it("should return all expected functions and values", () => {
    const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

    expect(typeof result.current.zoomScale).toBe("number");
    expect(typeof result.current.scrollPosition).toBe("number");
    expect(typeof result.current.setZoomScale).toBe("function");
    expect(typeof result.current.setScrollPosition).toBe("function");
    expect(typeof result.current.handleZoom).toBe("function");
    expect(typeof result.current.handleWheelZoom).toBe("function");
  });

  describe("setZoomScale", () => {
    it("should update the zoom scale", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setZoomScale(2);
      });

      expect(result.current.zoomScale).toBe(2);
    });

    it("should accept different zoom scale values", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setZoomScale(3.5);
      });

      expect(result.current.zoomScale).toBe(3.5);
    });
  });

  describe("setScrollPosition", () => {
    it("should update the scroll position", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setScrollPosition(150);
      });

      expect(result.current.scrollPosition).toBe(150);
    });

    it("should accept different scroll position values", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setScrollPosition(500);
      });

      expect(result.current.scrollPosition).toBe(500);
    });
  });

  describe("handleZoom", () => {
    it("should increase zoom when delta is positive", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.handleZoom(1, 200);
      });

      expect(result.current.zoomScale).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
    });

    it("should decrease zoom when delta is negative", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      // First set a higher zoom level
      act(() => {
        result.current.setZoomScale(2);
      });

      act(() => {
        result.current.handleZoom(-1, 200);
      });

      expect(result.current.zoomScale).toBeLessThan(2);
    });

    it("should not exceed maximum zoom level", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setZoomScale(ZOOM_CONSTRAINTS.max);
      });

      act(() => {
        result.current.handleZoom(10, 200);
      });

      expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.max);
    });

    it("should not go below minimum zoom level", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.setZoomScale(ZOOM_CONSTRAINTS.min);
      });

      act(() => {
        result.current.handleZoom(-10, 200);
      });

      expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.min);
    });

    it("should adjust scroll position relative to cursor position", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.handleZoom(1, 200);
      });

      expect(mockScrollContainer.scrollLeft).toBeGreaterThan(0);
    });

    it("should not zoom if timelineRef is null", () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useTimelineZoom(nullRef));

      const initialZoom = result.current.zoomScale;

      act(() => {
        result.current.handleZoom(1, 200);
      });

      expect(result.current.zoomScale).toBe(initialZoom);
    });

    it("should not zoom if parentElement is null", () => {
      // Create timeline without parent
      const orphanTimeline = document.createElement("div");
      const orphanRef = { current: orphanTimeline };
      
      const { result } = renderHook(() => useTimelineZoom(orphanRef));

      const initialZoom = result.current.zoomScale;

      act(() => {
        result.current.handleZoom(1, 200);
      });

      expect(result.current.zoomScale).toBe(initialZoom);
    });

    it("should not update state if zoom level doesn't change", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      // Set to max zoom
      act(() => {
        result.current.setZoomScale(ZOOM_CONSTRAINTS.max);
      });

      const initialScroll = result.current.scrollPosition;

      // Try to zoom more
      act(() => {
        result.current.handleZoom(10, 200);
      });

      // Scroll should not have changed since zoom didn't change
      expect(result.current.scrollPosition).toBe(initialScroll);
    });
  });

  describe("handleWheelZoom", () => {
    it("should zoom in when scrolling up with ctrl key", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 200,
        ctrlKey: true,
      });

      const preventDefaultSpy = jest.spyOn(wheelEvent, "preventDefault");

      act(() => {
        result.current.handleWheelZoom(wheelEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.zoomScale).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
    });

    it("should zoom out when scrolling down with ctrl key", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      // Set initial zoom higher than default
      act(() => {
        result.current.setZoomScale(2);
      });

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: 100,
        clientX: 200,
        ctrlKey: true,
      });

      const preventDefaultSpy = jest.spyOn(wheelEvent, "preventDefault");

      act(() => {
        result.current.handleWheelZoom(wheelEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.zoomScale).toBeLessThan(2);
    });

    it("should zoom in when scrolling up with meta key", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 200,
        metaKey: true,
      });

      const preventDefaultSpy = jest.spyOn(wheelEvent, "preventDefault");

      act(() => {
        result.current.handleWheelZoom(wheelEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.zoomScale).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
    });

    it("should not zoom without ctrl or meta key", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 200,
      });

      const preventDefaultSpy = jest.spyOn(wheelEvent, "preventDefault");

      act(() => {
        result.current.handleWheelZoom(wheelEvent);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.default);
    });

    it("should use wheelStep for zoom increment", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 200,
        ctrlKey: true,
      });

      act(() => {
        result.current.handleWheelZoom(wheelEvent);
      });

      // wheelStep is multiplied by step in the calculation: delta * step
      const expectedZoom = ZOOM_CONSTRAINTS.default + (ZOOM_CONSTRAINTS.wheelStep * ZOOM_CONSTRAINTS.step);
      expect(result.current.zoomScale).toBeCloseTo(expectedZoom, 5);
    });
  });

  describe("zoom calculations", () => {
    it("should calculate correct zoom factor", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      // Set initial scroll position
      mockScrollContainer.scrollLeft = 100;

      act(() => {
        result.current.handleZoom(1, 300);
      });

      // Verify zoom factor calculation through scroll adjustment
      const newZoom = result.current.zoomScale;
      expect(newZoom).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
    });

    it("should maintain cursor position during zoom", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const clientX = 300;
      mockScrollContainer.scrollLeft = 50;

      act(() => {
        result.current.handleZoom(1, clientX);
      });

      // The scroll should have been adjusted to maintain the cursor position
      expect(mockScrollContainer.scrollLeft).not.toBe(50);
    });

    it("should handle zoom at different cursor positions", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      // Zoom at left side
      act(() => {
        result.current.handleZoom(1, 150);
      });

      const scrollAtLeft = mockScrollContainer.scrollLeft;

      // Reset
      act(() => {
        result.current.setZoomScale(ZOOM_CONSTRAINTS.default);
      });
      mockScrollContainer.scrollLeft = 0;

      // Zoom at right side
      act(() => {
        result.current.handleZoom(1, 450);
      });

      const scrollAtRight = mockScrollContainer.scrollLeft;

      // Different cursor positions should result in different scroll adjustments
      expect(scrollAtLeft).not.toBe(scrollAtRight);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple rapid zoom operations", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.handleZoom(1, 200);
        result.current.handleZoom(1, 200);
        result.current.handleZoom(1, 200);
      });

      expect(result.current.zoomScale).toBeLessThanOrEqual(ZOOM_CONSTRAINTS.max);
      expect(result.current.zoomScale).toBeGreaterThan(ZOOM_CONSTRAINTS.default);
    });

    it("should handle zoom in and zoom out alternations", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.handleZoom(1, 200);
        result.current.handleZoom(-1, 200);
        result.current.handleZoom(1, 200);
      });

      expect(result.current.zoomScale).toBeGreaterThanOrEqual(ZOOM_CONSTRAINTS.min);
      expect(result.current.zoomScale).toBeLessThanOrEqual(ZOOM_CONSTRAINTS.max);
    });

    it("should handle zero delta", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      const initialZoom = result.current.zoomScale;

      act(() => {
        result.current.handleZoom(0, 200);
      });

      expect(result.current.zoomScale).toBe(initialZoom);
    });

    it("should handle very large delta values", () => {
      const { result } = renderHook(() => useTimelineZoom(mockTimelineRef));

      act(() => {
        result.current.handleZoom(1000, 200);
      });

      expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.max);

      act(() => {
        result.current.handleZoom(-1000, 200);
      });

      expect(result.current.zoomScale).toBe(ZOOM_CONSTRAINTS.min);
    });
  });
});

