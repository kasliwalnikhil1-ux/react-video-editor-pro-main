import { renderHook, act } from "@testing-library/react";
import { useTimelineSettings } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-settings";

describe("useTimelineSettings", () => {
  describe("initialization", () => {
    it("should initialize with autoRemoveEmptyTracks from props", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: true,
        })
      );

      expect(result.current.isAutoRemoveEnabled).toBe(true);
    });

    it("should initialize with false when autoRemoveEmptyTracks is false", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current.isAutoRemoveEnabled).toBe(false);
    });

    it("should initialize splitting mode as false by default", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current.isSplittingEnabled).toBe(false);
    });

    it("should handle falsy autoRemoveEmptyTracks values", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: undefined as any,
        })
      );

      expect(result.current.isAutoRemoveEnabled).toBe(false);
    });
  });

  describe("handleToggleAutoRemoveEmptyTracks", () => {
    it("should toggle auto remove setting to true", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(true);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
    });

    it("should toggle auto remove setting to false", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: true,
        })
      );

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(false);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(false);
    });

    it("should call onAutoRemoveEmptyTracksChange callback when toggling", () => {
      const onAutoRemoveEmptyTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
          onAutoRemoveEmptyTracksChange,
        })
      );

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(true);
      });

      expect(onAutoRemoveEmptyTracksChange).toHaveBeenCalledWith(true);
      expect(onAutoRemoveEmptyTracksChange).toHaveBeenCalledTimes(1);
    });

    it("should not throw error when callback is not provided", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleToggleAutoRemoveEmptyTracks(true);
        });
      }).not.toThrow();
    });

    it("should maintain stable function reference on re-renders", () => {
      const { result, rerender } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      const firstReference = result.current.handleToggleAutoRemoveEmptyTracks;
      rerender();
      const secondReference = result.current.handleToggleAutoRemoveEmptyTracks;

      expect(firstReference).toBe(secondReference);
    });

    it("should update function reference when callback changes", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onAutoRemoveEmptyTracksChange }) =>
          useTimelineSettings({
            autoRemoveEmptyTracks: false,
            onAutoRemoveEmptyTracksChange,
          }),
        {
          initialProps: { onAutoRemoveEmptyTracksChange: callback1 },
        }
      );

      const firstReference = result.current.handleToggleAutoRemoveEmptyTracks;

      rerender({ onAutoRemoveEmptyTracksChange: callback2 });

      const secondReference = result.current.handleToggleAutoRemoveEmptyTracks;

      expect(firstReference).not.toBe(secondReference);
    });
  });

  describe("handleToggleSplitting", () => {
    it("should toggle splitting mode to true", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current.isSplittingEnabled).toBe(false);

      act(() => {
        result.current.handleToggleSplitting(true);
      });

      expect(result.current.isSplittingEnabled).toBe(true);
    });

    it("should toggle splitting mode to false", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleToggleSplitting(true);
      });

      act(() => {
        result.current.handleToggleSplitting(false);
      });

      expect(result.current.isSplittingEnabled).toBe(false);
    });

    it("should maintain stable function reference on re-renders", () => {
      const { result, rerender } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      const firstReference = result.current.handleToggleSplitting;
      rerender();
      const secondReference = result.current.handleToggleSplitting;

      expect(firstReference).toBe(secondReference);
    });

    it("should not affect auto remove setting when toggling splitting", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: true,
        })
      );

      expect(result.current.isAutoRemoveEnabled).toBe(true);

      act(() => {
        result.current.handleToggleSplitting(true);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
    });
  });

  describe("prop updates", () => {
    it("should update isAutoRemoveEnabled when autoRemoveEmptyTracks prop changes", () => {
      const { result, rerender } = renderHook(
        ({ autoRemoveEmptyTracks }) =>
          useTimelineSettings({ autoRemoveEmptyTracks }),
        {
          initialProps: { autoRemoveEmptyTracks: false },
        }
      );

      expect(result.current.isAutoRemoveEnabled).toBe(false);

      rerender({ autoRemoveEmptyTracks: true });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
    });

    it("should update from true to false when prop changes", () => {
      const { result, rerender } = renderHook(
        ({ autoRemoveEmptyTracks }) =>
          useTimelineSettings({ autoRemoveEmptyTracks }),
        {
          initialProps: { autoRemoveEmptyTracks: true },
        }
      );

      expect(result.current.isAutoRemoveEnabled).toBe(true);

      rerender({ autoRemoveEmptyTracks: false });

      expect(result.current.isAutoRemoveEnabled).toBe(false);
    });

    it("should not trigger callback when prop changes directly", () => {
      const onAutoRemoveEmptyTracksChange = jest.fn();

      const { rerender } = renderHook(
        ({ autoRemoveEmptyTracks }) =>
          useTimelineSettings({
            autoRemoveEmptyTracks,
            onAutoRemoveEmptyTracksChange,
          }),
        {
          initialProps: { autoRemoveEmptyTracks: false },
        }
      );

      rerender({ autoRemoveEmptyTracks: true });

      expect(onAutoRemoveEmptyTracksChange).not.toHaveBeenCalled();
    });
  });

  describe("return values", () => {
    it("should return all expected properties", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(result.current).toHaveProperty("isAutoRemoveEnabled");
      expect(result.current).toHaveProperty("isSplittingEnabled");
      expect(result.current).toHaveProperty("handleToggleAutoRemoveEmptyTracks");
      expect(result.current).toHaveProperty("handleToggleSplitting");
    });

    it("should return functions for toggle handlers", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(typeof result.current.handleToggleAutoRemoveEmptyTracks).toBe("function");
      expect(typeof result.current.handleToggleSplitting).toBe("function");
    });

    it("should return booleans for state flags", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      expect(typeof result.current.isAutoRemoveEnabled).toBe("boolean");
      expect(typeof result.current.isSplittingEnabled).toBe("boolean");
    });
  });

  describe("multiple toggles", () => {
    it("should handle multiple rapid toggles of auto remove", () => {
      const onAutoRemoveEmptyTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
          onAutoRemoveEmptyTracksChange,
        })
      );

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(true);
        result.current.handleToggleAutoRemoveEmptyTracks(false);
        result.current.handleToggleAutoRemoveEmptyTracks(true);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
      expect(onAutoRemoveEmptyTracksChange).toHaveBeenCalledTimes(3);
      expect(onAutoRemoveEmptyTracksChange).toHaveBeenNthCalledWith(1, true);
      expect(onAutoRemoveEmptyTracksChange).toHaveBeenNthCalledWith(2, false);
      expect(onAutoRemoveEmptyTracksChange).toHaveBeenNthCalledWith(3, true);
    });

    it("should handle multiple rapid toggles of splitting mode", () => {
      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
        })
      );

      act(() => {
        result.current.handleToggleSplitting(true);
        result.current.handleToggleSplitting(false);
        result.current.handleToggleSplitting(true);
      });

      expect(result.current.isSplittingEnabled).toBe(true);
    });
  });

  describe("independent state management", () => {
    it("should manage auto remove and splitting independently", () => {
      const onAutoRemoveEmptyTracksChange = jest.fn();

      const { result } = renderHook(() =>
        useTimelineSettings({
          autoRemoveEmptyTracks: false,
          onAutoRemoveEmptyTracksChange,
        })
      );

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(true);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
      expect(result.current.isSplittingEnabled).toBe(false);

      act(() => {
        result.current.handleToggleSplitting(true);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(true);
      expect(result.current.isSplittingEnabled).toBe(true);

      act(() => {
        result.current.handleToggleAutoRemoveEmptyTracks(false);
      });

      expect(result.current.isAutoRemoveEnabled).toBe(false);
      expect(result.current.isSplittingEnabled).toBe(true);
    });
  });
});

