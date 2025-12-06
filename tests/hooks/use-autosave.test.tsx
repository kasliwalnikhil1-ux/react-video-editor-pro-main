import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "../../app/reactvideoeditor/pro/hooks/use-autosave";
import {
  saveEditorState,
  loadEditorState,
} from "../../app/reactvideoeditor/pro/utils/general/indexdb-helper";

// Mock the indexdb helper functions
jest.mock("../../app/reactvideoeditor/pro/utils/general/indexdb-helper", () => ({
  saveEditorState: jest.fn(),
  loadEditorState: jest.fn(),
}));

describe("useAutosave", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it("should auto-load existing saved state on mount", async () => {
    const mockState = { overlays: [], aspectRatio: "16:9" };
    const onLoad = jest.fn();
    (loadEditorState as jest.Mock).mockResolvedValue(mockState);

    renderHook(() => useAutosave("test-project", {}, { onLoad }));

    // Wait for the effect to run
    await act(async () => {});

    expect(loadEditorState).toHaveBeenCalledWith("test-project");
    expect(onLoad).toHaveBeenCalledWith(mockState);
  });

  it("should not auto-load multiple times", async () => {
    const mockState = { overlays: [], aspectRatio: "16:9" };
    const onLoad = jest.fn();
    (loadEditorState as jest.Mock).mockResolvedValue(mockState);

    const { rerender } = renderHook(() =>
      useAutosave("test-project", {}, { onLoad })
    );

    // Wait for the first effect to run
    await act(async () => {});

    expect(loadEditorState).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledTimes(1);

    // Rerender should not trigger another load
    rerender();
    await act(async () => {});

    expect(loadEditorState).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("should handle case when onLoad is not provided but saved state exists", async () => {
    const mockState = { overlays: [], aspectRatio: "16:9" };
    (loadEditorState as jest.Mock).mockResolvedValue(mockState);

    renderHook(() => useAutosave("test-project", {}));

    // Wait for the effect to run
    await act(async () => {});

    expect(loadEditorState).toHaveBeenCalledWith("test-project");
    // Should not throw error even though onLoad is not provided
  });

  it("should handle errors when auto-loading state", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const onLoad = jest.fn();
    (loadEditorState as jest.Mock).mockRejectedValue(new Error("Load failed"));

    renderHook(() => useAutosave("test-project", {}, { onLoad }));

    // Wait for the effect to run
    await act(async () => {});

    expect(loadEditorState).toHaveBeenCalledWith("test-project");
    expect(onLoad).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Autosave] Failed to auto-load state:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("should cleanup interval timer on unmount", async () => {
    const state = { data: "test" };
    const { unmount } = renderHook(() =>
      useAutosave("test-project", state, { interval: 1000 })
    );

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledTimes(1);

    // Unmount the hook
    unmount();

    // Fast forward another second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Should not save after unmount
    expect(saveEditorState).toHaveBeenCalledTimes(1);
  });

  it("should autosave state at specified intervals when state changes", async () => {
    const initialState = { data: "initial" };
    const onSave = jest.fn();

    const { rerender } = renderHook(
      ({ state }) =>
        useAutosave("test-project", state, { interval: 1000, onSave }),
      { initialProps: { state: initialState } }
    );

    // Initial save should not happen immediately
    expect(saveEditorState).not.toHaveBeenCalled();

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", initialState);
    expect(onSave).toHaveBeenCalled();

    // Update state
    const newState = { data: "updated" };
    rerender({ state: newState });

    // Reset mock counts
    (saveEditorState as jest.Mock).mockClear();
    onSave.mockClear();

    // Fast forward another second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", newState);
    expect(onSave).toHaveBeenCalled();
  });

  it("should not autosave if state has not changed", async () => {
    const state = { data: "test" };
    const onSave = jest.fn();

    renderHook(() =>
      useAutosave("test-project", state, { interval: 1000, onSave })
    );

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledTimes(1);

    // Fast forward another second without state change
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Should not save again as state hasn't changed
    expect(saveEditorState).toHaveBeenCalledTimes(1);
  });

  it("should handle manual save and load operations", async () => {
    const state = { data: "test" };
    const savedState = { data: "saved" };
    const onLoad = jest.fn();

    (saveEditorState as jest.Mock).mockResolvedValue(true);
    (loadEditorState as jest.Mock).mockResolvedValue(savedState);

    const { result } = renderHook(() =>
      useAutosave("test-project", state, { onLoad })
    );

    // Test manual save
    await act(async () => {
      await result.current.saveState();
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", state);

    // Test manual load
    await act(async () => {
      await result.current.loadState();
    });

    expect(loadEditorState).toHaveBeenCalledWith("test-project");
    expect(onLoad).toHaveBeenCalledWith(savedState);
  });

  it("should handle errors during save and load operations", async () => {
    const state = { data: "test" };
    const saveError = new Error("Save failed");
    const loadError = new Error("Load failed");

    (saveEditorState as jest.Mock).mockRejectedValue(saveError);
    (loadEditorState as jest.Mock).mockRejectedValue(loadError);

    const { result } = renderHook(() => useAutosave("test-project", state));

    // Clear any console errors from setup
    consoleErrorSpy.mockClear();

    // Test manual save error
    await act(async () => {
      const success = await result.current.saveState();
      expect(success).toBe(false);
    });

    // Test manual load error
    await act(async () => {
      const loadedState = await result.current.loadState();
      expect(loadedState).toBeNull();
    });

    // Verify error messages
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Autosave] Manual save failed:",
      saveError
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Autosave] Manual load failed:",
      loadError
    );
    expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
  });

  it("should not start autosave if projectId is not provided", async () => {
    renderHook(() => useAutosave("", { data: "test" }, { interval: 1000 }));

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(saveEditorState).not.toHaveBeenCalled();
  });

  describe("isInitialLoadComplete", () => {
    it("should set isInitialLoadComplete to false initially", () => {
      (loadEditorState as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useAutosave("test-project", {}));

      expect(result.current.isInitialLoadComplete).toBe(false);
    });

    it("should set isInitialLoadComplete to true after successful load", async () => {
      const mockState = { overlays: [], aspectRatio: "16:9" };
      (loadEditorState as jest.Mock).mockResolvedValue(mockState);

      const { result } = renderHook(() => useAutosave("test-project", {}));

      // Initially false
      expect(result.current.isInitialLoadComplete).toBe(false);

      // Wait for the load to complete
      await act(async () => {});

      expect(result.current.isInitialLoadComplete).toBe(true);
    });

    it("should set isInitialLoadComplete to true even when load fails", async () => {
      (loadEditorState as jest.Mock).mockRejectedValue(
        new Error("Load failed")
      );

      const { result } = renderHook(() => useAutosave("test-project", {}));

      // Initially false
      expect(result.current.isInitialLoadComplete).toBe(false);

      // Wait for the load attempt
      await act(async () => {});

      // Should still be true to prevent infinite loading state
      expect(result.current.isInitialLoadComplete).toBe(true);
    });

    it("should set isInitialLoadComplete to true when no saved state exists", async () => {
      (loadEditorState as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAutosave("test-project", {}));

      // Initially false
      expect(result.current.isInitialLoadComplete).toBe(false);

      // Wait for the load to complete
      await act(async () => {});

      expect(result.current.isInitialLoadComplete).toBe(true);
    });

    it("should remain true after state changes", async () => {
      const mockState = { overlays: [], aspectRatio: "16:9" };
      (loadEditorState as jest.Mock).mockResolvedValue(mockState);

      const { result, rerender } = renderHook(
        ({ state }) => useAutosave("test-project", state, { interval: 1000 }),
        { initialProps: { state: { data: "initial" } } }
      );

      // Wait for initial load
      await act(async () => {});

      expect(result.current.isInitialLoadComplete).toBe(true);

      // Update state
      rerender({ state: { data: "updated" } });

      // Should still be true
      expect(result.current.isInitialLoadComplete).toBe(true);

      // Fast forward timer
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be true
      expect(result.current.isInitialLoadComplete).toBe(true);
    });
  });

  describe("manual save operations", () => {
    it("should return true on successful manual save", async () => {
      const state = { data: "test" };
      (saveEditorState as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAutosave("test-project", state));

      await act(async () => {});

      let success;
      await act(async () => {
        success = await result.current.saveState();
      });

      expect(success).toBe(true);
      expect(saveEditorState).toHaveBeenCalledWith("test-project", state);
    });

    it("should return false on failed manual save", async () => {
      const state = { data: "test" };
      (saveEditorState as jest.Mock).mockRejectedValue(
        new Error("Save failed")
      );

      const { result } = renderHook(() => useAutosave("test-project", state));

      await act(async () => {});

      let success;
      await act(async () => {
        success = await result.current.saveState();
      });

      expect(success).toBe(false);
    });

    it("should call onSave callback on successful manual save", async () => {
      const state = { data: "test" };
      const onSave = jest.fn();
      (saveEditorState as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() =>
        useAutosave("test-project", state, { onSave })
      );

      await act(async () => {});

      await act(async () => {
        await result.current.saveState();
      });

      expect(onSave).toHaveBeenCalled();
    });

    it("should update lastSavedState reference on manual save", async () => {
      const state = { data: "test" };
      (saveEditorState as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {});

      // Manual save
      await act(async () => {
        await result.current.saveState();
      });

      expect(saveEditorState).toHaveBeenCalledTimes(1);

      // Fast forward timer - should not save again since state hasn't changed
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be 1 because state hasn't changed since manual save
      expect(saveEditorState).toHaveBeenCalledTimes(1);
    });
  });

  describe("manual load operations", () => {
    it("should return loaded state on successful manual load", async () => {
      const savedState = { data: "saved" };
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      const { result } = renderHook(() => useAutosave("test-project", {}));

      await act(async () => {});

      let loadedState;
      await act(async () => {
        loadedState = await result.current.loadState();
      });

      expect(loadedState).toEqual(savedState);
    });

    it("should return null on failed manual load", async () => {
      (loadEditorState as jest.Mock).mockRejectedValue(
        new Error("Load failed")
      );

      const { result } = renderHook(() => useAutosave("test-project", {}));

      await act(async () => {});

      let loadedState;
      await act(async () => {
        loadedState = await result.current.loadState();
      });

      expect(loadedState).toBeNull();
    });

    it("should call onLoad callback on successful manual load", async () => {
      const savedState = { data: "saved" };
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      const { result } = renderHook(() =>
        useAutosave("test-project", {}, { onLoad })
      );

      await act(async () => {});

      // Clear the onLoad call from initial auto-load
      onLoad.mockClear();

      await act(async () => {
        await result.current.loadState();
      });

      expect(onLoad).toHaveBeenCalledWith(savedState);
    });

    it("should not call onLoad if callback not provided", async () => {
      const savedState = { data: "saved" };
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      const { result } = renderHook(() => useAutosave("test-project", {}));

      await act(async () => {});

      // Should not throw error
      await act(async () => {
        const loaded = await result.current.loadState();
        expect(loaded).toEqual(savedState);
      });
    });
  });

  describe("custom interval", () => {
    it("should respect custom interval setting", async () => {
      const state = { data: "test" };
      const customInterval = 3000;

      renderHook(() =>
        useAutosave("test-project", state, { interval: customInterval })
      );

      // Fast forward less than the custom interval
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should not have saved yet
      expect(saveEditorState).not.toHaveBeenCalled();

      // Fast forward to reach the custom interval
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Now should have saved
      expect(saveEditorState).toHaveBeenCalledTimes(1);
    });

    it("should update interval when options change", async () => {
      const state = { data: "test" };

      const { rerender } = renderHook(
        ({ interval }) => useAutosave("test-project", state, { interval }),
        { initialProps: { interval: 1000 } }
      );

      // Fast forward 1 second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledTimes(1);

      // Change interval
      rerender({ interval: 5000 });

      // Clear mock
      (saveEditorState as jest.Mock).mockClear();

      // Fast forward 2 seconds (less than new interval)
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should not have saved with new interval yet
      expect(saveEditorState).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined state", async () => {
      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", undefined, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith("test-project", undefined);
    });

    it("should handle null state", async () => {
      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", null, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith("test-project", null);
    });

    it("should handle complex nested state objects", async () => {
      const complexState = {
        overlays: [
          { id: "1", type: "text", content: "Hello" },
          { id: "2", type: "image", url: "test.jpg" },
        ],
        timeline: { duration: 1000, tracks: [] },
        settings: { volume: 0.8, quality: "high" },
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", complexState, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        complexState
      );
    });

    it("should detect state changes in nested objects", async () => {
      const initialState = { nested: { value: "initial" } };

      const { rerender } = renderHook(
        ({ state }) => useAutosave("test-project", state, { interval: 1000 }),
        { initialProps: { state: initialState } }
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledTimes(1);

      // Change nested value
      const newState = { nested: { value: "updated" } };
      rerender({ state: newState });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledTimes(2);
    });
  });
});
