import { renderHook } from "@testing-library/react";
import { useTimelineShortcuts } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-shortcuts";
import { ZOOM_CONSTRAINTS } from "app/reactvideoeditor/pro/components/advanced-timeline/constants";

// Mock react-hotkeys-hook
jest.mock("react-hotkeys-hook", () => ({
  useHotkeys: jest.fn((keys, callback, options?) => {
    // Store the callback for testing
    if (!(global as any).hotkeyCallbacks) {
      (global as any).hotkeyCallbacks = {};
    }
    (global as any).hotkeyCallbacks[keys] = { callback, options };
  }),
}));

describe("useTimelineShortcuts", () => {
  let mockHandlePlayPause: jest.Mock;
  let mockUndo: jest.Mock;
  let mockRedo: jest.Mock;
  let mockSetZoomScale: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    mockHandlePlayPause = jest.fn();
    mockUndo = jest.fn();
    mockRedo = jest.fn();
    mockSetZoomScale = jest.fn();

    // Reset hotkey callbacks
    (global as any).hotkeyCallbacks = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): any => ({
    preventDefault: jest.fn(),
    target: document.createElement("div"),
    ...overrides,
  });

  describe("initialization", () => {
    it("should register all keyboard shortcuts without errors", () => {
      const { result } = renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      expect(result.current).toBeUndefined(); // Hook returns nothing
    });

    it("should work with all props set to initial values", () => {
      expect(() => {
        renderHook(() =>
          useTimelineShortcuts({
            handlePlayPause: mockHandlePlayPause,
            undo: mockUndo,
            redo: mockRedo,
            canUndo: false,
            canRedo: false,
            zoomScale: ZOOM_CONSTRAINTS.default,
            setZoomScale: mockSetZoomScale,
          })
        );
      }).not.toThrow();
    });
  });

  describe("Space key - Play/Pause", () => {
    it("should call handlePlayPause when space is pressed", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandlePlayPause).toHaveBeenCalledTimes(1);
    });

    it("should not trigger play/pause when typing in INPUT element", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const inputElement = document.createElement("input");
      const mockEvent = createMockKeyboardEvent({ target: inputElement as any });
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandlePlayPause).not.toHaveBeenCalled();
    });

    it("should not trigger play/pause when typing in TEXTAREA element", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const textareaElement = document.createElement("textarea");
      const mockEvent = createMockKeyboardEvent({ target: textareaElement as any });
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandlePlayPause).not.toHaveBeenCalled();
    });

    it("should not trigger play/pause when in contentEditable element", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const editableDiv = document.createElement("div");
      (editableDiv as any).isContentEditable = true;
      const mockEvent = createMockKeyboardEvent({ target: editableDiv as any });
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandlePlayPause).not.toHaveBeenCalled();
    });

    it("should not trigger play/pause when target is inside contenteditable element", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const editableParent = document.createElement("div");
      editableParent.setAttribute("contenteditable", "true");
      const childElement = document.createElement("span");
      editableParent.appendChild(childElement);
      
      (childElement as any).closest = jest.fn((selector) => {
        if (selector === '[contenteditable="true"]') return editableParent;
        return null;
      });

      const mockEvent = createMockKeyboardEvent({ target: childElement as any });
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockHandlePlayPause).not.toHaveBeenCalled();
    });

    it("should trigger play/pause on regular elements", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const regularDiv = document.createElement("div");
      (regularDiv as any).closest = jest.fn(() => null);
      const mockEvent = createMockKeyboardEvent({ target: regularDiv as any });
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandlePlayPause).toHaveBeenCalledTimes(1);
    });
  });

  describe("Undo shortcuts - Cmd/Ctrl + Z", () => {
    it("should call undo when canUndo is true", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      
      undoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it("should not call undo when canUndo is false", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: false,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      
      undoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUndo).not.toHaveBeenCalled();
    });

    it("should prevent default behavior even when undo is disabled", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: false,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      
      undoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Redo shortcuts - Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y", () => {
    it("should call redo when canRedo is true", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const redoCallback = (global as any).hotkeyCallbacks["meta+shift+z, ctrl+shift+z, meta+y, ctrl+y"];
      
      redoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRedo).toHaveBeenCalledTimes(1);
    });

    it("should not call redo when canRedo is false", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: false,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const redoCallback = (global as any).hotkeyCallbacks["meta+shift+z, ctrl+shift+z, meta+y, ctrl+y"];
      
      redoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRedo).not.toHaveBeenCalled();
    });

    it("should prevent default behavior even when redo is disabled", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: false,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const redoCallback = (global as any).hotkeyCallbacks["meta+shift+z, ctrl+shift+z, meta+y, ctrl+y"];
      
      redoCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Zoom in shortcuts - Alt + Plus/=", () => {
    it("should increase zoom scale within max limit", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomScale).toHaveBeenCalledWith(1 + ZOOM_CONSTRAINTS.step);
    });

    it("should not exceed maximum zoom level", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: ZOOM_CONSTRAINTS.max,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.max);
    });

    it("should clamp zoom to max when attempting to exceed it", () => {
      const nearMaxZoom = ZOOM_CONSTRAINTS.max - 0.05;
      
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: nearMaxZoom,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.max);
    });

    it("should zoom in by correct step amount", () => {
      const initialZoom = 2;
      
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: initialZoom,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      const expectedZoom = Math.min(
        initialZoom + ZOOM_CONSTRAINTS.step,
        ZOOM_CONSTRAINTS.max
      );
      expect(mockSetZoomScale).toHaveBeenCalledWith(expectedZoom);
    });
  });

  describe("Zoom out shortcuts - Alt + Minus/-", () => {
    it("should decrease zoom scale within min limit", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      zoomOutCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomScale).toHaveBeenCalledWith(1 - ZOOM_CONSTRAINTS.step);
    });

    it("should not go below minimum zoom level", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: ZOOM_CONSTRAINTS.min,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      zoomOutCallback.callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.min);
    });

    it("should clamp zoom to min when attempting to go below it", () => {
      const nearMinZoom = ZOOM_CONSTRAINTS.min + 0.05;
      
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: nearMinZoom,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      zoomOutCallback.callback(mockEvent);

      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.min);
    });

    it("should zoom out by correct step amount", () => {
      const initialZoom = 2;
      
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: initialZoom,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      zoomOutCallback.callback(mockEvent);

      const expectedZoom = Math.max(
        initialZoom - ZOOM_CONSTRAINTS.step,
        ZOOM_CONSTRAINTS.min
      );
      expect(mockSetZoomScale).toHaveBeenCalledWith(expectedZoom);
    });

    it("should have keydown and preventDefault options enabled", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      expect(zoomOutCallback.options).toEqual({
        keydown: true,
        preventDefault: true,
      });
    });
  });

  describe("edge cases and integration", () => {
    it("should handle multiple rapid keyboard shortcuts", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      const undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      const redoCallback = (global as any).hotkeyCallbacks["meta+shift+z, ctrl+shift+z, meta+y, ctrl+y"];
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      spaceCallback.callback(mockEvent);
      undoCallback.callback(mockEvent);
      redoCallback.callback(mockEvent);
      zoomInCallback.callback(mockEvent);
      zoomOutCallback.callback(mockEvent);

      expect(mockHandlePlayPause).toHaveBeenCalledTimes(1);
      expect(mockUndo).toHaveBeenCalledTimes(1);
      expect(mockRedo).toHaveBeenCalledTimes(1);
      expect(mockSetZoomScale).toHaveBeenCalledTimes(2); // zoom in + zoom out
    });

    it("should work correctly when all permissions are disabled", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: false,
          canRedo: false,
          zoomScale: 1,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      
      // All shortcuts except play/pause and zoom should be disabled
      const undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      const redoCallback = (global as any).hotkeyCallbacks["meta+shift+z, ctrl+shift+z, meta+y, ctrl+y"];
      
      undoCallback.callback(mockEvent);
      redoCallback.callback(mockEvent);

      expect(mockUndo).not.toHaveBeenCalled();
      expect(mockRedo).not.toHaveBeenCalled();
    });

    it("should handle zoom at boundary values correctly", () => {
      const { rerender } = renderHook(
        ({ zoomScale }) =>
          useTimelineShortcuts({
            handlePlayPause: mockHandlePlayPause,
            undo: mockUndo,
            redo: mockRedo,
            canUndo: true,
            canRedo: true,
            zoomScale,
            setZoomScale: mockSetZoomScale,
          }),
        { initialProps: { zoomScale: ZOOM_CONSTRAINTS.min } }
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomOutCallback = (global as any).hotkeyCallbacks["alt+-, alt+minus"];
      
      // Try to zoom out below minimum
      zoomOutCallback.callback(mockEvent);
      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.min);

      mockSetZoomScale.mockClear();

      // Rerender with max zoom
      rerender({ zoomScale: ZOOM_CONSTRAINTS.max });

      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      // Try to zoom in above maximum
      zoomInCallback.callback(mockEvent);
      expect(mockSetZoomScale).toHaveBeenCalledWith(ZOOM_CONSTRAINTS.max);
    });

    it("should update correctly when props change", () => {
      const { rerender } = renderHook(
        ({ canUndo, canRedo }) =>
          useTimelineShortcuts({
            handlePlayPause: mockHandlePlayPause,
            undo: mockUndo,
            redo: mockRedo,
            canUndo,
            canRedo,
            zoomScale: 1,
            setZoomScale: mockSetZoomScale,
          }),
        { initialProps: { canUndo: false, canRedo: false } }
      );

      const mockEvent = createMockKeyboardEvent();
      let undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      
      undoCallback.callback(mockEvent);
      expect(mockUndo).not.toHaveBeenCalled();

      // Enable undo and rerender (which re-registers hotkeys)
      rerender({ canUndo: true, canRedo: false });
      
      // Get the updated callback after rerender
      undoCallback = (global as any).hotkeyCallbacks["meta+z, ctrl+z"];
      undoCallback.callback(mockEvent);
      expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it("should work with default zoom scale", () => {
      renderHook(() =>
        useTimelineShortcuts({
          handlePlayPause: mockHandlePlayPause,
          undo: mockUndo,
          redo: mockRedo,
          canUndo: true,
          canRedo: true,
          zoomScale: ZOOM_CONSTRAINTS.default,
          setZoomScale: mockSetZoomScale,
        })
      );

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      expect(mockSetZoomScale).toHaveBeenCalledWith(
        ZOOM_CONSTRAINTS.default + ZOOM_CONSTRAINTS.step
      );
    });
  });

  describe("callback stability", () => {
    it("should handle callback reference changes gracefully", () => {
      const firstHandlePlayPause = jest.fn();
      const { rerender } = renderHook(
        ({ handlePlayPause }) =>
          useTimelineShortcuts({
            handlePlayPause,
            undo: mockUndo,
            redo: mockRedo,
            canUndo: true,
            canRedo: true,
            zoomScale: 1,
            setZoomScale: mockSetZoomScale,
          }),
        { initialProps: { handlePlayPause: firstHandlePlayPause } }
      );

      const secondHandlePlayPause = jest.fn();
      rerender({ handlePlayPause: secondHandlePlayPause });

      const mockEvent = createMockKeyboardEvent();
      const spaceCallback = (global as any).hotkeyCallbacks["space"];
      
      spaceCallback.callback(mockEvent);

      // The most recent callback should be used
      expect(secondHandlePlayPause).toHaveBeenCalled();
      expect(firstHandlePlayPause).not.toHaveBeenCalled();
    });

    it("should handle setZoomScale reference changes gracefully", () => {
      const firstSetZoomScale = jest.fn();
      const { rerender } = renderHook(
        ({ setZoomScale }) =>
          useTimelineShortcuts({
            handlePlayPause: mockHandlePlayPause,
            undo: mockUndo,
            redo: mockRedo,
            canUndo: true,
            canRedo: true,
            zoomScale: 1,
            setZoomScale,
          }),
        { initialProps: { setZoomScale: firstSetZoomScale } }
      );

      const secondSetZoomScale = jest.fn();
      rerender({ setZoomScale: secondSetZoomScale });

      const mockEvent = createMockKeyboardEvent();
      const zoomInCallback = (global as any).hotkeyCallbacks["alt+=, alt+plus"];
      
      zoomInCallback.callback(mockEvent);

      // The most recent callback should be used
      expect(secondSetZoomScale).toHaveBeenCalled();
      expect(firstSetZoomScale).not.toHaveBeenCalled();
    });
  });
});

