import { renderHook, act } from "@testing-library/react";
import { useVerticalResize } from "../../app/reactvideoeditor/pro/hooks/use-vertical-resize";

describe("useVerticalResize", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useVerticalResize());

      expect(result.current.bottomHeight).toBe(500);
      expect(result.current.isResizing).toBe(false);
    });

    it("should initialize with custom initial height", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 600 })
      );

      expect(result.current.bottomHeight).toBe(600);
    });

    it("should clamp initial height to maxHeight", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 1000, maxHeight: 800 })
      );

      expect(result.current.bottomHeight).toBe(800);
    });

    it("should clamp initial height to minHeight", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 100, minHeight: 200 })
      );

      expect(result.current.bottomHeight).toBe(200);
    });
  });

  describe("mouse interaction", () => {
    it("should set isResizing to true on mouse down", () => {
      const { result } = renderHook(() => useVerticalResize());

      const mouseEvent = {
        preventDefault: jest.fn(),
        clientY: 500,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mouseEvent);
      });

      expect(result.current.isResizing).toBe(true);
      expect(mouseEvent.preventDefault).toHaveBeenCalled();
    });

    it("should update height on mouse move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500 })
      );

      // Start resize
      const mouseDownEvent = {
        preventDefault: jest.fn(),
        clientY: 500,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mouseDownEvent);
      });

      // Simulate mouse move up (decreasing Y value should increase height)
      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientY: 400, // Moved up by 100px
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      // Height should increase by 100
      expect(result.current.bottomHeight).toBe(600);
    });

    it("should stop resizing on mouse up", () => {
      const { result } = renderHook(() => useVerticalResize());

      // Start resize
      act(() => {
        result.current.handleMouseDown({
          preventDefault: jest.fn(),
          clientY: 500,
        } as unknown as React.MouseEvent);
      });

      expect(result.current.isResizing).toBe(true);

      // Mouse up
      act(() => {
        document.dispatchEvent(new MouseEvent("mouseup"));
      });

      expect(result.current.isResizing).toBe(false);
    });

    it("should clamp height to maxHeight during mouse move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500, maxHeight: 600 })
      );

      act(() => {
        result.current.handleMouseDown({
          preventDefault: jest.fn(),
          clientY: 500,
        } as unknown as React.MouseEvent);
      });

      // Try to move way up (should be clamped to maxHeight)
      act(() => {
        document.dispatchEvent(new MouseEvent("mousemove", { clientY: 200 }));
      });

      expect(result.current.bottomHeight).toBe(600);
    });

    it("should clamp height to minHeight during mouse move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500, minHeight: 400 })
      );

      act(() => {
        result.current.handleMouseDown({
          preventDefault: jest.fn(),
          clientY: 500,
        } as unknown as React.MouseEvent);
      });

      // Try to move way down (should be clamped to minHeight)
      act(() => {
        document.dispatchEvent(new MouseEvent("mousemove", { clientY: 800 }));
      });

      expect(result.current.bottomHeight).toBe(400);
    });
  });

  describe("touch interaction", () => {
    it("should set isResizing to true on touch start", () => {
      const { result } = renderHook(() => useVerticalResize());

      const touchEvent = {
        preventDefault: jest.fn(),
        touches: [{ clientY: 500 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.handleTouchStart(touchEvent);
      });

      expect(result.current.isResizing).toBe(true);
      expect(touchEvent.preventDefault).toHaveBeenCalled();
    });

    it("should update height on touch move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500 })
      );

      // Start resize
      const touchStartEvent = {
        preventDefault: jest.fn(),
        touches: [{ clientY: 500 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.handleTouchStart(touchStartEvent);
      });

      // Simulate touch move up (decreasing Y value should increase height)
      const touchMoveEvent = new TouchEvent("touchmove", {
        touches: [{ clientY: 400 } as Touch],
      });

      act(() => {
        document.dispatchEvent(touchMoveEvent);
      });

      // Height should increase by 100
      expect(result.current.bottomHeight).toBe(600);
    });

    it("should stop resizing on touch end", () => {
      const { result } = renderHook(() => useVerticalResize());

      // Start resize
      act(() => {
        result.current.handleTouchStart({
          preventDefault: jest.fn(),
          touches: [{ clientY: 500 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.isResizing).toBe(true);

      // Touch end
      act(() => {
        document.dispatchEvent(new TouchEvent("touchend"));
      });

      expect(result.current.isResizing).toBe(false);
    });

    it("should clamp height to maxHeight during touch move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500, maxHeight: 600 })
      );

      act(() => {
        result.current.handleTouchStart({
          preventDefault: jest.fn(),
          touches: [{ clientY: 500 }],
        } as unknown as React.TouchEvent);
      });

      // Try to move way up (should be clamped to maxHeight)
      act(() => {
        document.dispatchEvent(
          new TouchEvent("touchmove", {
            touches: [{ clientY: 200 } as Touch],
          })
        );
      });

      expect(result.current.bottomHeight).toBe(600);
    });

    it("should clamp height to minHeight during touch move", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500, minHeight: 400 })
      );

      act(() => {
        result.current.handleTouchStart({
          preventDefault: jest.fn(),
          touches: [{ clientY: 500 }],
        } as unknown as React.TouchEvent);
      });

      // Try to move way down (should be clamped to minHeight)
      act(() => {
        document.dispatchEvent(
          new TouchEvent("touchmove", {
            touches: [{ clientY: 800 } as Touch],
          })
        );
      });

      expect(result.current.bottomHeight).toBe(400);
    });

    it("should handle touch start without touches array", () => {
      const { result } = renderHook(() => useVerticalResize());

      const touchEvent = {
        preventDefault: jest.fn(),
        touches: [],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.handleTouchStart(touchEvent);
      });

      // Should not set isResizing if no touches
      expect(result.current.isResizing).toBe(false);
    });
  });

  describe("programmatic height control", () => {
    it("should reset height to initial value", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ initialHeight: 500 })
      );

      // Change height
      act(() => {
        result.current.setHeight(700);
      });

      expect(result.current.bottomHeight).toBe(700);

      // Reset
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.bottomHeight).toBe(500);
    });

    it("should set height programmatically", () => {
      const { result } = renderHook(() => useVerticalResize());

      act(() => {
        result.current.setHeight(750);
      });

      expect(result.current.bottomHeight).toBe(750);
    });

    it("should clamp programmatically set height to maxHeight", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ maxHeight: 600 })
      );

      act(() => {
        result.current.setHeight(800);
      });

      expect(result.current.bottomHeight).toBe(600);
    });

    it("should clamp programmatically set height to minHeight", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ minHeight: 400 })
      );

      act(() => {
        result.current.setHeight(300);
      });

      expect(result.current.bottomHeight).toBe(400);
    });
  });

  describe("localStorage persistence", () => {
    it("should save height to localStorage", () => {
      const { result } = renderHook(() =>
        useVerticalResize({ storageKey: "test-height" })
      );

      act(() => {
        result.current.setHeight(650);
      });

      expect(localStorage.getItem("test-height")).toBe("650");
    });

    it("should load height from localStorage on initialization", () => {
      localStorage.setItem("test-height", "700");

      const { result } = renderHook(() =>
        useVerticalResize({ storageKey: "test-height", minHeight: 200 })
      );

      expect(result.current.bottomHeight).toBe(700);
    });

    it("should clamp saved height to current maxHeight", () => {
      localStorage.setItem("test-height", "900");

      const { result } = renderHook(() =>
        useVerticalResize({ storageKey: "test-height", maxHeight: 600 })
      );

      expect(result.current.bottomHeight).toBe(600);
    });
  });

  describe("dynamic maxHeight", () => {
    it("should clamp height when maxHeight decreases", () => {
      const { result, rerender } = renderHook(
        ({ maxHeight }) => useVerticalResize({ maxHeight }),
        { initialProps: { maxHeight: 800 } }
      );

      act(() => {
        result.current.setHeight(750);
      });

      expect(result.current.bottomHeight).toBe(750);

      // Decrease maxHeight
      rerender({ maxHeight: 600 });

      expect(result.current.bottomHeight).toBe(600);
    });

    it("should not increase height when maxHeight increases", () => {
      const { result, rerender } = renderHook(
        ({ maxHeight }) => useVerticalResize({ maxHeight }),
        { initialProps: { maxHeight: 600 } }
      );

      act(() => {
        result.current.setHeight(500);
      });

      expect(result.current.bottomHeight).toBe(500);

      // Increase maxHeight
      rerender({ maxHeight: 800 });

      // Height should remain unchanged
      expect(result.current.bottomHeight).toBe(500);
    });
  });
});
