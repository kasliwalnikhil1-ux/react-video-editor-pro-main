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

describe("Background Color Persistence", () => {
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

  describe("Autosave with backgroundColor", () => {
    it("should save backgroundColor as part of the state", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "#ff0000",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      // Fast forward 1 second to trigger autosave
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith("test-project", state);
      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "#ff0000" })
      );
    });

    it("should save updated backgroundColor when it changes", async () => {
      const initialState = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "white",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      const { rerender } = renderHook(
        ({ state }) => useAutosave("test-project", state, { interval: 1000 }),
        { initialProps: { state: initialState } }
      );

      // Fast forward 1 second to trigger autosave
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "white" })
      );

      // Update backgroundColor
      const updatedState = {
        ...initialState,
        backgroundColor: "#00ff00",
      };
      rerender({ state: updatedState });

      // Clear mock
      (saveEditorState as jest.Mock).mockClear();

      // Fast forward another second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "#00ff00" })
      );
    });

    it("should save gradient backgroundColor values", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          backgroundColor: "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)",
        })
      );
    });

    it("should save rgba backgroundColor values", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          backgroundColor: "rgba(255, 0, 0, 0.5)",
        })
      );
    });
  });

  describe("Autosave load with backgroundColor", () => {
    it("should restore backgroundColor when loading from autosave", async () => {
      const savedState = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "#ff0000",
      };
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      renderHook(() => useAutosave("test-project", {}, { onLoad }));

      // Wait for the effect to run
      await act(async () => {});

      expect(loadEditorState).toHaveBeenCalledWith("test-project");
      expect(onLoad).toHaveBeenCalledWith(
        expect.objectContaining({ backgroundColor: "#ff0000" })
      );
    });

    it("should handle missing backgroundColor in saved state", async () => {
      const savedState = {
        overlays: [],
        aspectRatio: "16:9",
        // backgroundColor is missing
      };
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      renderHook(() => useAutosave("test-project", {}, { onLoad }));

      // Wait for the effect to run
      await act(async () => {});

      expect(loadEditorState).toHaveBeenCalledWith("test-project");
      expect(onLoad).toHaveBeenCalledWith(savedState);
      // Should not throw error if backgroundColor is missing
    });

    it("should restore gradient backgroundColor from autosave", async () => {
      const savedState = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)",
      };
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      renderHook(() => useAutosave("test-project", {}, { onLoad }));

      await act(async () => {});

      expect(onLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundColor: "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)",
        })
      );
    });

    it("should restore rgba backgroundColor from autosave", async () => {
      const savedState = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
      };
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(savedState);

      renderHook(() => useAutosave("test-project", {}, { onLoad }));

      await act(async () => {});

      expect(onLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundColor: "rgba(255, 0, 0, 0.5)",
        })
      );
    });
  });

  describe("Full save and restore cycle", () => {
    it("should preserve backgroundColor across save and load operations", async () => {
      const originalState = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "#ff00ff",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);
      (loadEditorState as jest.Mock).mockResolvedValue(originalState);

      const { result } = renderHook(() =>
        useAutosave("test-project", originalState)
      );

      // Wait for initial load attempt
      await act(async () => {});

      // Manual save
      await act(async () => {
        await result.current.saveState();
      });

      expect(saveEditorState).toHaveBeenCalledWith("test-project", originalState);

      // Manual load
      const onLoad = jest.fn();
      (loadEditorState as jest.Mock).mockResolvedValue(originalState);

      const { result: loadResult } = renderHook(() =>
        useAutosave("test-project", {}, { onLoad })
      );

      await act(async () => {
        await loadResult.current.loadState();
      });

      expect(onLoad).toHaveBeenCalledWith(
        expect.objectContaining({ backgroundColor: "#ff00ff" })
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string backgroundColor", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "" })
      );
    });

    it("should handle transparent backgroundColor", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "transparent",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "transparent" })
      );
    });

    it("should handle named color backgroundColor", async () => {
      const state = {
        overlays: [],
        aspectRatio: "16:9",
        backgroundColor: "rebeccapurple",
      };

      (saveEditorState as jest.Mock).mockResolvedValue(true);

      renderHook(() =>
        useAutosave("test-project", state, { interval: 1000 })
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(saveEditorState).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({ backgroundColor: "rebeccapurple" })
      );
    });
  });
});
