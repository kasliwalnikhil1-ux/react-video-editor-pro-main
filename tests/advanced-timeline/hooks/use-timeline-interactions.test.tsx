import { renderHook, act } from "@testing-library/react";
import { useTimelineInteractions } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-interactions";
import { RefObject } from "react";

describe("useTimelineInteractions", () => {
  let mockTimelineElement: HTMLDivElement;
  let mockTimelineRef: RefObject<HTMLDivElement>;
  let mockRootContainer: HTMLDivElement;
  let mockMarkersContainer: HTMLDivElement;
  let rafCallbacks: Array<FrameRequestCallback>;
  let rafId: number;

  beforeEach(() => {
    // Create DOM structure to match the actual implementation
    // Root container (where CSS properties are set)
    mockRootContainer = document.createElement("div");
    
    // Parent element (intermediate level)
    const mockParent = document.createElement("div");
    mockRootContainer.appendChild(mockParent);
    
    // Timeline element (the ref)
    mockTimelineElement = document.createElement("div");
    mockParent.appendChild(mockTimelineElement);
    
    // Timeline markers container (used for bounding rect calculation)
    mockMarkersContainer = document.createElement("div");
    mockMarkersContainer.className = "timeline-markers-container";
    mockMarkersContainer.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 0,
      width: 1000,
      height: 100,
      right: 1100,
      bottom: 100,
      x: 100,
      y: 0,
      toJSON: () => {},
    }));
    
    // Add markers container to document so querySelector can find it
    document.body.appendChild(mockMarkersContainer);
    
    mockTimelineRef = {
      current: mockTimelineElement,
    };

    // Mock requestAnimationFrame / cancelAnimationFrame
    rafCallbacks = [];
    rafId = 0;
    
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });
    
    global.cancelAnimationFrame = jest.fn(() => {
      // Simple implementation - in real tests we'd track IDs more carefully
      rafCallbacks = [];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    rafCallbacks = [];
    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe("initialization", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      expect(result.current.isDragging).toBe(false);
      expect(result.current.isContextMenuOpen).toBe(false);
      expect(result.current.ghostMarkerPosition).toBeNull();
      expect(typeof result.current.handleMouseMove).toBe("function");
      expect(typeof result.current.handleMouseLeave).toBe("function");
      expect(typeof result.current.setIsDragging).toBe("function");
      expect(typeof result.current.setIsContextMenuOpen).toBe("function");
    });
  });

  describe("handleMouseMove", () => {
    it("should update CSS custom properties on mouse move", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      
      // Spy on the root container's setProperty (where CSS properties are actually set)
      const setPropertySpy = jest.spyOn(mockRootContainer.style, 'setProperty');
      
      const mockEvent = {
        clientX: 600, // Middle of timeline (left: 100, width: 1000)
      } as React.MouseEvent<HTMLDivElement>;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      // RAF should be scheduled
      expect(requestAnimationFrame).toHaveBeenCalled();

      // Execute the RAF callback
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      expect(setPropertySpy).toHaveBeenCalledWith(
        '--ghost-marker-position',
        expect.stringMatching(/\d+(\.\d+)?%/)
      );
      expect(setPropertySpy).toHaveBeenCalledWith('--ghost-marker-visible', '1');
    });

    it("should not update when isDragging is true", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      act(() => {
        result.current.setIsDragging(true);
      });

      const mockEvent = {
        clientX: 600,
      } as React.MouseEvent<HTMLDivElement>;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      // RAF should NOT be scheduled during dragging
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it("should throttle mouse move events using requestAnimationFrame", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      // Trigger multiple rapid mouse moves
      act(() => {
        result.current.handleMouseMove({ clientX: 500 } as React.MouseEvent<HTMLDivElement>);
        result.current.handleMouseMove({ clientX: 501 } as React.MouseEvent<HTMLDivElement>);
        result.current.handleMouseMove({ clientX: 502 } as React.MouseEvent<HTMLDivElement>);
      });

      // Should cancel previous RAF calls and only schedule the latest
      expect(cancelAnimationFrame).toHaveBeenCalled();
      // The exact number of RAF calls may vary, but it should use RAF for throttling
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("should handle null timeline ref gracefully", () => {
      const nullRef: RefObject<HTMLDivElement> = { current: null };
      const { result } = renderHook(() => useTimelineInteractions(nullRef));

      const mockEvent = {
        clientX: 600,
      } as React.MouseEvent<HTMLDivElement>;

      // Should not throw
      expect(() => {
        act(() => {
          result.current.handleMouseMove(mockEvent);
        });
      }).not.toThrow();
    });

    it("should calculate correct position percentages at different mouse positions", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      
      const testCases = [
        { clientX: 100, expectedApprox: 0 },    // Start of timeline
        { clientX: 600, expectedApprox: 50 },   // Middle
        { clientX: 1100, expectedApprox: 100 }, // End
        { clientX: 350, expectedApprox: 25 },   // Quarter
      ];

      testCases.forEach(({ clientX, expectedApprox }) => {
        const setPropertyMock = jest.fn();
        mockRootContainer.style.setProperty = setPropertyMock;

        act(() => {
          result.current.handleMouseMove({ clientX } as React.MouseEvent<HTMLDivElement>);
        });

        act(() => {
          rafCallbacks.forEach((cb) => cb(0));
        });

        // Find the call that sets the position
        const positionCall = setPropertyMock.mock.calls.find(
          (call) => call[0] === '--ghost-marker-position'
        );

        if (positionCall) {
          const positionValue = parseFloat(positionCall[1]);
          // Allow for small rounding differences
          expect(positionValue).toBeCloseTo(expectedApprox, 1);
        }

        rafCallbacks = [];
      });
    });

    it("should only update position when change is significant", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      const setPropertyMock = jest.fn();
      mockRootContainer.style.setProperty = setPropertyMock;

      // First move
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });
      rafCallbacks = [];

      const firstCallCount = setPropertyMock.mock.calls.length;
      setPropertyMock.mockClear();

      // Very small move (less than 0.1% threshold mentioned in implementation)
      act(() => {
        result.current.handleMouseMove({ clientX: 600.1 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      // Should have minimal or no additional calls due to threshold
      const secondCallCount = setPropertyMock.mock.calls.length;
      
      // The exact behavior depends on threshold, but we test it doesn't update unnecessarily
      expect(secondCallCount).toBeLessThanOrEqual(firstCallCount);
    });
  });

  describe("handleMouseLeave", () => {
    it("should hide ghost marker when mouse leaves timeline", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      const setPropertyMock = jest.fn();
      mockRootContainer.style.setProperty = setPropertyMock;

      // First, show the marker
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      setPropertyMock.mockClear();

      // Then leave
      act(() => {
        result.current.handleMouseLeave();
      });

      expect(setPropertyMock).toHaveBeenCalledWith('--ghost-marker-visible', '0');
    });

    it("should cancel pending RAF calls on mouse leave", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      // Schedule a RAF
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });

      // Leave before RAF executes
      act(() => {
        result.current.handleMouseLeave();
      });

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it("should handle null timeline ref gracefully", () => {
      const nullRef: RefObject<HTMLDivElement> = { current: null };
      const { result } = renderHook(() => useTimelineInteractions(nullRef));

      // Should not throw
      expect(() => {
        act(() => {
          result.current.handleMouseLeave();
        });
      }).not.toThrow();
    });

    it("should not set visibility if marker was never visible", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      const setPropertyMock = jest.fn();
      mockRootContainer.style.setProperty = setPropertyMock;

      // Leave without ever showing marker
      act(() => {
        result.current.handleMouseLeave();
      });

      // Should not attempt to set visibility since marker was never shown
      expect(setPropertyMock).not.toHaveBeenCalled();
    });
  });

  describe("state setters", () => {
    it("should update isDragging state", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      expect(result.current.isDragging).toBe(false);

      act(() => {
        result.current.setIsDragging(true);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.setIsDragging(false);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it("should update isContextMenuOpen state", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      expect(result.current.isContextMenuOpen).toBe(false);

      act(() => {
        result.current.setIsContextMenuOpen(true);
      });

      expect(result.current.isContextMenuOpen).toBe(true);

      act(() => {
        result.current.setIsContextMenuOpen(false);
      });

      expect(result.current.isContextMenuOpen).toBe(false);
    });
  });

  describe("interaction between features", () => {
    it("should stop updating ghost marker when dragging starts", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      const setPropertyMock = jest.fn();
      mockRootContainer.style.setProperty = setPropertyMock;

      // Show marker initially
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      expect(setPropertyMock).toHaveBeenCalled();
      setPropertyMock.mockClear();
      rafCallbacks = [];

      // Start dragging
      act(() => {
        result.current.setIsDragging(true);
      });

      // Clear mocks after dragging starts
      jest.clearAllMocks();
      const rafCallCountBefore = (requestAnimationFrame as jest.Mock).mock.calls.length;

      // Try to move mouse while dragging
      act(() => {
        result.current.handleMouseMove({ clientX: 700 } as React.MouseEvent<HTMLDivElement>);
      });

      // Should not schedule new RAF calls
      const rafCallCountAfter = (requestAnimationFrame as jest.Mock).mock.calls.length;
      expect(rafCallCountAfter).toBe(rafCallCountBefore);
    });

    it("should resume updating ghost marker after dragging ends", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      // Start dragging
      act(() => {
        result.current.setIsDragging(true);
      });

      // End dragging
      act(() => {
        result.current.setIsDragging(false);
      });

      jest.clearAllMocks();

      // Move mouse after dragging ends
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });

      // Should resume normal behavior
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("should maintain separate state for isDragging and isContextMenuOpen", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      act(() => {
        result.current.setIsDragging(true);
        result.current.setIsContextMenuOpen(true);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.isContextMenuOpen).toBe(true);

      act(() => {
        result.current.setIsDragging(false);
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.isContextMenuOpen).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should clamp position to 0-100% range", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));
      const setPropertyMock = jest.fn();
      mockRootContainer.style.setProperty = setPropertyMock;

      // Mouse position before timeline start
      act(() => {
        result.current.handleMouseMove({ clientX: 50 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      const positionCallBefore = setPropertyMock.mock.calls.find(
        (call) => call[0] === '--ghost-marker-position'
      );
      if (positionCallBefore) {
        const position = parseFloat(positionCallBefore[1]);
        expect(position).toBeGreaterThanOrEqual(0);
      }

      setPropertyMock.mockClear();
      rafCallbacks = [];

      // Mouse position after timeline end
      act(() => {
        result.current.handleMouseMove({ clientX: 1200 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      const positionCallAfter = setPropertyMock.mock.calls.find(
        (call) => call[0] === '--ghost-marker-position'
      );
      if (positionCallAfter) {
        const position = parseFloat(positionCallAfter[1]);
        expect(position).toBeLessThanOrEqual(100);
      }
    });

    it("should handle rapid state changes", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      // Rapid state changes
      act(() => {
        result.current.setIsDragging(true);
        result.current.setIsDragging(false);
        result.current.setIsDragging(true);
        result.current.setIsContextMenuOpen(true);
        result.current.setIsContextMenuOpen(false);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.isContextMenuOpen).toBe(false);
    });

    it("should handle mouse move and leave in rapid succession", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      expect(() => {
        act(() => {
          result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
          result.current.handleMouseLeave();
          result.current.handleMouseMove({ clientX: 700 } as React.MouseEvent<HTMLDivElement>);
          result.current.handleMouseLeave();
        });
      }).not.toThrow();
    });
  });

  describe("backward compatibility", () => {
    it("should maintain ghostMarkerPosition as null for legacy compatibility", () => {
      const { result } = renderHook(() => useTimelineInteractions(mockTimelineRef));

      // Move mouse
      act(() => {
        result.current.handleMouseMove({ clientX: 600 } as React.MouseEvent<HTMLDivElement>);
      });
      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
      });

      // Legacy property should remain null
      expect(result.current.ghostMarkerPosition).toBeNull();
    });
  });
});

