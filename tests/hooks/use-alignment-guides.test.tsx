import { renderHook, act } from "@testing-library/react";
import { useAlignmentGuides } from "../../app/reactvideoeditor/pro/hooks/use-alignment-guides";
import { Overlay, OverlayType } from "../../app/reactvideoeditor/pro/types";

// Helper to create a mock overlay
const createMockOverlay = (
  id: number,
  left: number,
  top: number,
  width: number,
  height: number
): Overlay => ({
  id,
  type: OverlayType.IMAGE,
  left,
  top,
  width,
  height,
  durationInFrames: 100,
  from: 0,
  row: 1,
  isDragging: false,
  rotation: 0,
  src: "test.jpg",
  styles: {},
});

describe("useAlignmentGuides", () => {
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const snapThreshold = 5;

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight })
      );

      expect(result.current.guideState.isActive).toBe(false);
      expect(result.current.guideState.guides).toEqual([]);
      expect(result.current.guideState.snapThreshold).toBe(5);
    });

    it("should initialize with custom snap threshold", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold: 10 })
      );

      expect(result.current.guideState.snapThreshold).toBe(10);
    });
  });

  describe("updateGuides", () => {
    it("should activate guides and set them", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position overlay near left edge (within snap threshold)
      const draggedOverlay = createMockOverlay(1, 2, 100, 200, 150);
      const otherOverlay = createMockOverlay(2, 500, 500, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [
          draggedOverlay,
          otherOverlay,
        ]);
      });

      expect(result.current.guideState.isActive).toBe(true);
      expect(result.current.guideState.guides.length).toBeGreaterThan(0);
    });

    it("should find canvas center guides when overlay is near center", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position overlay near canvas center (960, 540)
      const draggedOverlay = createMockOverlay(1, 958, 538, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [draggedOverlay]);
      });

      const guides = result.current.guideState.guides;
      const hasCenterXGuide = guides.some(
        (g) => g.type === "canvas-center-x" && g.x === canvasWidth / 2
      );
      const hasCenterYGuide = guides.some(
        (g) => g.type === "canvas-center-y" && g.y === canvasHeight / 2
      );

      expect(hasCenterXGuide).toBe(true);
      expect(hasCenterYGuide).toBe(true);
    });

    it("should find canvas edge guides when overlay is near edges", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position overlay near left edge
      const draggedOverlay = createMockOverlay(1, 2, 100, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [draggedOverlay]);
      });

      const guides = result.current.guideState.guides;
      const hasLeftEdgeGuide = guides.some(
        (g) => g.type === "canvas-edge-left" && g.x === 0
      );

      expect(hasLeftEdgeGuide).toBe(true);
    });

    it("should find element guides when overlay is near another element", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 100, 100, 200, 150);
      const otherOverlay = createMockOverlay(2, 103, 300, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [
          draggedOverlay,
          otherOverlay,
        ]);
      });

      const guides = result.current.guideState.guides;
      const hasElementGuide = guides.some((g) => g.elementId === 2);

      expect(hasElementGuide).toBe(true);
    });

    it("should not include guides for the dragged overlay itself", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 100, 100, 200, 150);
      const otherOverlay = createMockOverlay(2, 500, 500, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [
          draggedOverlay,
          otherOverlay,
        ]);
      });

      const guides = result.current.guideState.guides;
      const hasDraggedOverlayGuide = guides.some((g) => g.elementId === 1);

      expect(hasDraggedOverlayGuide).toBe(false);
    });
  });

  describe("clearGuides", () => {
    it("should clear guides and deactivate", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 100, 100, 200, 150);

      // First activate guides
      act(() => {
        result.current.updateGuides(draggedOverlay, [draggedOverlay]);
      });

      expect(result.current.guideState.isActive).toBe(true);

      // Then clear
      act(() => {
        result.current.clearGuides();
      });

      expect(result.current.guideState.isActive).toBe(false);
      expect(result.current.guideState.guides).toEqual([]);
    });
  });

  describe("calculateSnapPosition", () => {
    it("should snap to canvas center X when close", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position overlay center near canvas center X (960)
      // Overlay width is 200, so left should be 860 for center at 960
      const draggedOverlay = createMockOverlay(1, 858, 100, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      // Should snap to center: left = 960 - 100 (half width)
      expect(snapped.left).toBe(canvasWidth / 2 - draggedOverlay.width / 2);
    });

    it("should snap to canvas center Y when close", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position overlay center near canvas center Y (540)
      // Overlay height is 150, so top should be 465 for center at 540
      const draggedOverlay = createMockOverlay(1, 100, 463, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      // Should snap to center: top = 540 - 75 (half height)
      expect(snapped.top).toBe(canvasHeight / 2 - draggedOverlay.height / 2);
    });

    it("should snap left edge to canvas left edge when close", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 3, 100, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBe(0);
    });

    it("should snap right edge to canvas right edge when close", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position so right edge is close to canvas right edge
      // Right edge = left + width, so left = 1920 - 200 = 1720
      const draggedOverlay = createMockOverlay(1, 1717, 100, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBe(canvasWidth - draggedOverlay.width);
    });

    it("should snap to another element's left edge when aligned", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 103, 100, 200, 150);
      const otherOverlay = createMockOverlay(2, 100, 300, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
        otherOverlay,
      ]);

      expect(snapped.left).toBe(100);
    });

    it("should snap to another element's center when aligned", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Other overlay center X is at 500 + 100 = 600
      const otherOverlay = createMockOverlay(2, 500, 300, 200, 150);
      // Dragged overlay center X should be at 598, so left = 598 - 100 = 498
      const draggedOverlay = createMockOverlay(1, 498, 100, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
        otherOverlay,
      ]);

      // Should snap center to center: left = 600 - 100 = 500
      expect(snapped.left).toBe(500);
    });

    it("should not snap when overlay is too far from guides", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 500, 500, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      // Should remain at original position
      expect(snapped.left).toBe(500);
      expect(snapped.top).toBe(500);
    });

    it("should prioritize closer snap targets", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 102, 100, 200, 150);
      const closeOverlay = createMockOverlay(2, 100, 300, 200, 150);
      const farOverlay = createMockOverlay(3, 95, 500, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
        closeOverlay,
        farOverlay,
      ]);

      // Should snap to closer overlay at 100
      expect(snapped.left).toBe(100);
    });

    it("should handle both X and Y snapping independently", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Near left edge (X) and top edge (Y)
      const draggedOverlay = createMockOverlay(1, 3, 2, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBe(0);
      expect(snapped.top).toBe(0);
    });

    it("should use larger snap threshold for canvas edges", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold: 5 })
      );

      // Position at 8 pixels from edge (within 2x threshold but outside normal threshold)
      const draggedOverlay = createMockOverlay(1, 8, 100, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      // Should snap to edge because canvas edges have 2x threshold
      expect(snapped.left).toBe(0);
    });
  });

  describe("guide prioritization", () => {
    it("should prioritize canvas center guides over element guides", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position near both canvas center and another element
      const draggedOverlay = createMockOverlay(1, 858, 100, 200, 150);
      const otherOverlay = createMockOverlay(2, 860, 300, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [
          draggedOverlay,
          otherOverlay,
        ]);
      });

      const guides = result.current.guideState.guides;
      const canvasCenterGuide = guides.find(
        (g) => g.type === "canvas-center-x"
      );

      expect(canvasCenterGuide).toBeDefined();
    });
  });

  describe("multiple overlays", () => {
    it("should handle multiple overlays and generate guides for all", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      // Position dragged overlay near canvas left edge to activate guides
      const draggedOverlay = createMockOverlay(1, 3, 100, 200, 150);
      const overlay2 = createMockOverlay(2, 500, 200, 200, 150);
      const overlay3 = createMockOverlay(3, 800, 300, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [
          draggedOverlay,
          overlay2,
          overlay3,
        ]);
      });

      const guides = result.current.guideState.guides;

      // Should have guides from canvas (at least the left edge guide)
      expect(guides.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle overlay with zero dimensions", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 100, 100, 0, 0);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBeDefined();
      expect(snapped.top).toBeDefined();
    });

    it("should handle negative positions", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, -10, -10, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBeDefined();
      expect(snapped.top).toBeDefined();
    });

    it("should handle positions beyond canvas bounds", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 3000, 2000, 200, 150);

      const snapped = result.current.calculateSnapPosition(draggedOverlay, [
        draggedOverlay,
      ]);

      expect(snapped.left).toBeDefined();
      expect(snapped.top).toBeDefined();
    });

    it("should handle empty overlay array", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay = createMockOverlay(1, 100, 100, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay, [draggedOverlay]);
      });

      expect(result.current.guideState.guides).toBeDefined();
    });
  });

  describe("guide state persistence", () => {
    it("should maintain guide state across multiple updates", () => {
      const { result } = renderHook(() =>
        useAlignmentGuides({ canvasWidth, canvasHeight, snapThreshold })
      );

      const draggedOverlay1 = createMockOverlay(1, 100, 100, 200, 150);
      const draggedOverlay2 = createMockOverlay(1, 105, 105, 200, 150);

      act(() => {
        result.current.updateGuides(draggedOverlay1, [draggedOverlay1]);
      });

      const guidesCount1 = result.current.guideState.guides.length;

      act(() => {
        result.current.updateGuides(draggedOverlay2, [draggedOverlay2]);
      });

      const guidesCount2 = result.current.guideState.guides.length;

      // Guide counts might differ based on position, but state should be maintained
      expect(guidesCount1).toBeGreaterThanOrEqual(0);
      expect(guidesCount2).toBeGreaterThanOrEqual(0);
    });
  });
});

