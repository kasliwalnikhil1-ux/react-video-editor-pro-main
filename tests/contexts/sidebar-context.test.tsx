import React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  SidebarProvider,
  useEditorSidebar,
} from "@/app/reactvideoeditor/pro/contexts/sidebar-context";
import { OverlayType } from "@/app/reactvideoeditor/pro/types";
import * as UISidebar from "@/app/reactvideoeditor/pro/components/ui/sidebar";

// Mock the UI sidebar hook
jest.mock("@/app/reactvideoeditor/pro/components/ui/sidebar", () => ({
  useSidebar: jest.fn(() => ({
    setOpen: jest.fn(),
  })),
}));

describe("SidebarContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider>{children}</SidebarProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useEditorSidebar());
    }).toThrow("useEditorSidebar must be used within a SidebarProvider");
  });

  it("should initialize with VIDEO as default active panel", () => {
    const { result } = renderHook(() => useEditorSidebar(), { wrapper });
    expect(result.current.activePanel).toBe(OverlayType.VIDEO);
  });

  describe("Panel Management", () => {
    it("should change active panel", () => {
      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });

      expect(result.current.activePanel).toBe(OverlayType.IMAGE);
    });

    it("should handle multiple panel changes", () => {
      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      // Change to IMAGE
      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);

      // Change to TEXT
      act(() => {
        result.current.setActivePanel(OverlayType.TEXT);
      });
      expect(result.current.activePanel).toBe(OverlayType.TEXT);

      // Change back to VIDEO (default)
      act(() => {
        result.current.setActivePanel(OverlayType.VIDEO);
      });
      expect(result.current.activePanel).toBe(OverlayType.VIDEO);
    });
  });

  describe("Sidebar Visibility", () => {
    it("should call UI sidebar setOpen", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(mockSetOpen).toHaveBeenCalledWith(true);

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    it("should handle rapid visibility toggles", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      act(() => {
        result.current.setIsOpen(true);
        result.current.setIsOpen(false);
        result.current.setIsOpen(true);
      });

      expect(mockSetOpen).toHaveBeenCalledTimes(3);
      expect(mockSetOpen.mock.calls).toEqual([[true], [false], [true]]);
    });
  });

  describe("Context Integration", () => {
    it("should maintain panel state while toggling visibility", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      // Set initial panel
      act(() => {
        result.current.setActivePanel(OverlayType.IMAGE);
      });

      // Toggle visibility
      act(() => {
        result.current.setIsOpen(false);
      });

      // Panel should remain unchanged
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);

      // Toggle visibility again
      act(() => {
        result.current.setIsOpen(true);
      });

      // Panel should still be unchanged
      expect(result.current.activePanel).toBe(OverlayType.IMAGE);
    });

    it("should handle panel change while sidebar is closed", () => {
      const mockSetOpen = jest.fn();
      (UISidebar.useSidebar as jest.Mock).mockImplementation(() => ({
        setOpen: mockSetOpen,
      }));

      const { result } = renderHook(() => useEditorSidebar(), { wrapper });

      // Close sidebar
      act(() => {
        result.current.setIsOpen(false);
      });

      // Change panel while closed
      act(() => {
        result.current.setActivePanel(OverlayType.TEXT);
      });

      expect(result.current.activePanel).toBe(OverlayType.TEXT);
      expect(mockSetOpen).toHaveBeenLastCalledWith(false);
    });
  });
});
