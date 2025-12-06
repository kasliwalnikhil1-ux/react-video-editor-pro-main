import { renderHook, act } from "@testing-library/react";
import { Overlay, OverlayType } from "../../app/reactvideoeditor/pro/types";

// Create mock functions
const mockSetSelectedOverlayId = jest.fn();
const mockSetActivePanel = jest.fn();
const mockSetIsOpen = jest.fn();

// Mock the context modules
jest.mock("../../app/reactvideoeditor/pro/contexts/editor-context", () => ({
  useEditorContext: jest.fn(() => ({
    setSelectedOverlayId: mockSetSelectedOverlayId,
  })),
}));

jest.mock("../../app/reactvideoeditor/pro/contexts/sidebar-context", () => ({
  useEditorSidebar: jest.fn(() => ({
    setActivePanel: mockSetActivePanel,
    setIsOpen: mockSetIsOpen,
  })),
}));

// Now import the hook after mocks are set up
import { useOverlaySelection } from "../../app/reactvideoeditor/pro/hooks/use-overlay-section";
import { useEditorContext } from "../../app/reactvideoeditor/pro/contexts/editor-context";
import { useEditorSidebar } from "../../app/reactvideoeditor/pro/contexts/sidebar-context";

describe("useOverlaySelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when contexts are available", () => {
    it("should return handleOverlaySelect function", () => {
      const { result } = renderHook(() => useOverlaySelection());

      expect(result.current.handleOverlaySelect).toBeDefined();
      expect(typeof result.current.handleOverlaySelect).toBe("function");
    });

    it("should set selected overlay ID for TEXT overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(1);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should set selected overlay ID and panel for VIDEO overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const videoOverlay: Overlay = {
        id: 2,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 60,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(videoOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(2);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.VIDEO);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should set selected overlay ID and panel for SOUND overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const soundOverlay: Overlay = {
        id: 3,
        type: OverlayType.SOUND,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 90,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(soundOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(3);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.SOUND);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should set selected overlay ID and panel for STICKER overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const stickerOverlay: Overlay = {
        id: 4,
        type: OverlayType.STICKER,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 45,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(stickerOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(4);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.STICKER);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should set selected overlay ID and panel for IMAGE overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const imageOverlay: Overlay = {
        id: 5,
        type: OverlayType.IMAGE,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 120,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(imageOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(5);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.IMAGE);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should set selected overlay ID and panel for CAPTION overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const captionOverlay: Overlay = {
        id: 6,
        type: OverlayType.CAPTION,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 75,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(captionOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(6);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.CAPTION);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("should handle multiple overlay selections", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      const videoOverlay: Overlay = {
        id: 2,
        type: OverlayType.VIDEO,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 60,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(1);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);

      jest.clearAllMocks();

      act(() => {
        result.current.handleOverlaySelect(videoOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(2);
      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.VIDEO);
    });

    it("should always open sidebar when selecting an overlay", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const imageOverlay: Overlay = {
        id: 7,
        type: OverlayType.IMAGE,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 90,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(imageOverlay);
      });

      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
      expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe("when EditorContext is not available", () => {
    beforeEach(() => {
      // Mock useEditorContext to throw an error
      (useEditorContext as jest.Mock).mockImplementation(() => {
        throw new Error("EditorContext not available");
      });
    });

    afterEach(() => {
      // Restore the original mock
      (useEditorContext as jest.Mock).mockImplementation(() => ({
        setSelectedOverlayId: mockSetSelectedOverlayId,
      }));
    });

    it("should not throw error and return handleOverlaySelect function", () => {
      const { result } = renderHook(() => useOverlaySelection());

      expect(result.current.handleOverlaySelect).toBeDefined();
      expect(typeof result.current.handleOverlaySelect).toBe("function");
    });

    it("should not call setSelectedOverlayId when context is not available", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).not.toHaveBeenCalled();
    });

    it("should still call sidebar functions when EditorContext is unavailable but SidebarContext is available", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetActivePanel).toHaveBeenCalledWith(OverlayType.TEXT);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });
  });

  describe("when SidebarContext is not available", () => {
    beforeEach(() => {
      // Mock useEditorSidebar to throw an error
      (useEditorSidebar as jest.Mock).mockImplementation(() => {
        throw new Error("SidebarContext not available");
      });
    });

    afterEach(() => {
      // Restore the original mock
      (useEditorSidebar as jest.Mock).mockImplementation(() => ({
        setActivePanel: mockSetActivePanel,
        setIsOpen: mockSetIsOpen,
      }));
    });

    it("should not throw error and return handleOverlaySelect function", () => {
      const { result } = renderHook(() => useOverlaySelection());

      expect(result.current.handleOverlaySelect).toBeDefined();
      expect(typeof result.current.handleOverlaySelect).toBe("function");
    });

    it("should not call sidebar functions when context is not available", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetActivePanel).not.toHaveBeenCalled();
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it("should still call setSelectedOverlayId when SidebarContext is unavailable but EditorContext is available", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(1);
    });
  });

  describe("when both contexts are not available", () => {
    beforeEach(() => {
      // Mock both contexts to throw errors
      (useEditorContext as jest.Mock).mockImplementation(() => {
        throw new Error("EditorContext not available");
      });
      (useEditorSidebar as jest.Mock).mockImplementation(() => {
        throw new Error("SidebarContext not available");
      });
    });

    afterEach(() => {
      // Restore the original mocks
      (useEditorContext as jest.Mock).mockImplementation(() => ({
        setSelectedOverlayId: mockSetSelectedOverlayId,
      }));
      (useEditorSidebar as jest.Mock).mockImplementation(() => ({
        setActivePanel: mockSetActivePanel,
        setIsOpen: mockSetIsOpen,
      }));
    });

    it("should not throw error and return handleOverlaySelect function", () => {
      const { result } = renderHook(() => useOverlaySelection());

      expect(result.current.handleOverlaySelect).toBeDefined();
      expect(typeof result.current.handleOverlaySelect).toBe("function");
    });

    it("should not call any context functions when both contexts are unavailable", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 1,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).not.toHaveBeenCalled();
      expect(mockSetActivePanel).not.toHaveBeenCalled();
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it("should handle calls gracefully in remotion bundle context", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const stickerOverlay: Overlay = {
        id: 10,
        type: OverlayType.STICKER,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      // Should not throw
      expect(() => {
        act(() => {
          result.current.handleOverlaySelect(stickerOverlay);
        });
      }).not.toThrow();
    });
  });

  describe("callback stability", () => {
    it("should maintain callback reference when dependencies don't change", () => {
      const { result, rerender } = renderHook(() => useOverlaySelection());

      const firstCallback = result.current.handleOverlaySelect;

      rerender();

      const secondCallback = result.current.handleOverlaySelect;

      expect(firstCallback).toBe(secondCallback);
    });
  });

  describe("edge cases", () => {
    it("should handle overlay with id 0", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 0,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(0);
    });

    it("should handle overlay with large id", () => {
      const { result } = renderHook(() => useOverlaySelection());

      const textOverlay: Overlay = {
        id: 999999,
        type: OverlayType.TEXT,
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        rotation: 0,
        from: 0,
        durationInFrames: 30,
        row: 0,
      } as Overlay;

      act(() => {
        result.current.handleOverlaySelect(textOverlay);
      });

      expect(mockSetSelectedOverlayId).toHaveBeenCalledWith(999999);
    });
  });
});

