import { renderHook, act } from "@testing-library/react";
import { useAspectRatio } from "../../app/reactvideoeditor/pro/hooks/use-aspect-ratio";
import { AspectRatio } from "../../app/reactvideoeditor/pro/types";

describe("useAspectRatio", () => {
  describe("initialization", () => {
    it("should initialize with default aspect ratio of 16:9", () => {
      const { result } = renderHook(() => useAspectRatio());

      expect(result.current.aspectRatio).toBe("16:9");
      expect(result.current.playerDimensions).toEqual({
        width: 640,
        height: 360,
      });
    });

    it("should initialize with custom aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("9:16"));

      expect(result.current.aspectRatio).toBe("9:16");
    });

    it("should initialize with 1:1 aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("1:1"));

      expect(result.current.aspectRatio).toBe("1:1");
    });

    it("should initialize with 4:5 aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("4:5"));

      expect(result.current.aspectRatio).toBe("4:5");
    });
  });

  describe("setAspectRatio", () => {
    it("should update aspect ratio when called", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.setAspectRatio("9:16");
      });

      expect(result.current.aspectRatio).toBe("9:16");
    });

    it("should call onRatioChange callback when aspect ratio changes", () => {
      const onRatioChange = jest.fn();
      const { result } = renderHook(() =>
        useAspectRatio("16:9", onRatioChange)
      );

      act(() => {
        result.current.setAspectRatio("1:1");
      });

      expect(onRatioChange).toHaveBeenCalledWith("1:1");
      expect(onRatioChange).toHaveBeenCalledTimes(1);
    });

    it("should not call onRatioChange if callback is not provided", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      // Should not throw error
      act(() => {
        result.current.setAspectRatio("9:16");
      });

      expect(result.current.aspectRatio).toBe("9:16");
    });

    it("should call onRatioChange multiple times for multiple changes", () => {
      const onRatioChange = jest.fn();
      const { result } = renderHook(() =>
        useAspectRatio("16:9", onRatioChange)
      );

      act(() => {
        result.current.setAspectRatio("9:16");
      });

      act(() => {
        result.current.setAspectRatio("1:1");
      });

      act(() => {
        result.current.setAspectRatio("4:5");
      });

      expect(onRatioChange).toHaveBeenCalledTimes(3);
      expect(onRatioChange).toHaveBeenNthCalledWith(1, "9:16");
      expect(onRatioChange).toHaveBeenNthCalledWith(2, "1:1");
      expect(onRatioChange).toHaveBeenNthCalledWith(3, "4:5");
    });
  });

  describe("updatePlayerDimensions", () => {
    it("should fit to height when container is wider than 16:9 ratio", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(2000, 900);
      });

      // Container is 2000x900 (ratio ~2.22), target is 16:9 (~1.78)
      // Should fit to height: height=900, width=900*(16/9)=1600
      expect(result.current.playerDimensions).toEqual({
        width: 1600,
        height: 900,
      });
    });

    it("should fit to width when container is taller than 16:9 ratio", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(800, 600);
      });

      // Container is 800x600 (ratio 1.33), target is 16:9 (~1.78)
      // Should fit to width: width=800, height=800/(16/9)=450
      expect(result.current.playerDimensions).toEqual({
        width: 800,
        height: 450,
      });
    });

    it("should calculate correct dimensions for 9:16 aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("9:16"));

      act(() => {
        result.current.updatePlayerDimensions(900, 1600);
      });

      // Container is 900x1600, perfectly matches 9:16
      expect(result.current.playerDimensions).toEqual({
        width: 900,
        height: 1600,
      });
    });

    it("should fit to width for 9:16 when container is wider", () => {
      const { result } = renderHook(() => useAspectRatio("9:16"));

      act(() => {
        result.current.updatePlayerDimensions(1000, 1600);
      });

      // Container is 1000x1600 (ratio 0.625), target is 9:16 (0.5625)
      // Should fit to height: height=1600, width=1600*(9/16)=900
      expect(result.current.playerDimensions).toEqual({
        width: 900,
        height: 1600,
      });
    });

    it("should calculate correct dimensions for 1:1 aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("1:1"));

      act(() => {
        result.current.updatePlayerDimensions(1000, 800);
      });

      // Container is 1000x800, target is 1:1
      // Should fit to smaller dimension: both should be 800
      expect(result.current.playerDimensions).toEqual({
        width: 800,
        height: 800,
      });
    });

    it("should calculate correct dimensions for 4:5 aspect ratio", () => {
      const { result } = renderHook(() => useAspectRatio("4:5"));

      act(() => {
        result.current.updatePlayerDimensions(1000, 1250);
      });

      // Container is 1000x1250 (ratio 0.8), perfectly matches 4:5 (0.8)
      expect(result.current.playerDimensions).toEqual({
        width: 1000,
        height: 1250,
      });
    });

    it("should update dimensions when aspect ratio changes", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(1600, 900);
      });

      expect(result.current.playerDimensions).toEqual({
        width: 1600,
        height: 900,
      });

      // Change aspect ratio
      act(() => {
        result.current.setAspectRatio("9:16");
      });

      // Update dimensions with same container size
      act(() => {
        result.current.updatePlayerDimensions(1600, 900);
      });

      // Now should fit to width for 9:16
      // width=1600, height=1600/(9/16)=2844.44...
      // But wait, that's bigger than container, so should fit to height instead
      // height=900, width=900*(9/16)=506.25
      expect(result.current.playerDimensions).toEqual({
        width: 506.25,
        height: 900,
      });
    });

    it("should handle very small container dimensions", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(100, 50);
      });

      expect(result.current.playerDimensions).toEqual({
        width: 88.88888888888889,
        height: 50,
      });
    });

    it("should handle very large container dimensions", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(3840, 2160);
      });

      // 3840x2160 is exactly 16:9
      expect(result.current.playerDimensions).toEqual({
        width: 3840,
        height: 2160,
      });
    });

    it("should handle edge case where container has same ratio as target", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      act(() => {
        result.current.updatePlayerDimensions(1920, 1080);
      });

      // Perfect 16:9 container
      expect(result.current.playerDimensions).toEqual({
        width: 1920,
        height: 1080,
      });
    });
  });

  describe("getAspectRatioDimensions", () => {
    it("should return standard dimensions for 16:9", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      const dimensions = result.current.getAspectRatioDimensions();

      expect(dimensions).toEqual({
        width: 1280,
        height: 720,
      });
    });

    it("should return standard dimensions for 9:16", () => {
      const { result } = renderHook(() => useAspectRatio("9:16"));

      const dimensions = result.current.getAspectRatioDimensions();

      expect(dimensions).toEqual({
        width: 1080,
        height: 1920,
      });
    });

    it("should return standard dimensions for 1:1", () => {
      const { result } = renderHook(() => useAspectRatio("1:1"));

      const dimensions = result.current.getAspectRatioDimensions();

      expect(dimensions).toEqual({
        width: 1080,
        height: 1080,
      });
    });

    it("should return standard dimensions for 4:5", () => {
      const { result } = renderHook(() => useAspectRatio("4:5"));

      const dimensions = result.current.getAspectRatioDimensions();

      expect(dimensions).toEqual({
        width: 1080,
        height: 1350,
      });
    });

    it("should update returned dimensions when aspect ratio changes", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      let dimensions = result.current.getAspectRatioDimensions();
      expect(dimensions).toEqual({ width: 1280, height: 720 });

      act(() => {
        result.current.setAspectRatio("1:1");
      });

      dimensions = result.current.getAspectRatioDimensions();
      expect(dimensions).toEqual({ width: 1080, height: 1080 });
    });
  });

  describe("integration tests", () => {
    it("should handle complete workflow of changing ratio and updating dimensions", () => {
      const onRatioChange = jest.fn();
      const { result } = renderHook(() =>
        useAspectRatio("16:9", onRatioChange)
      );

      // Initial state
      expect(result.current.aspectRatio).toBe("16:9");

      // Update player dimensions
      act(() => {
        result.current.updatePlayerDimensions(1920, 1080);
      });

      expect(result.current.playerDimensions).toEqual({
        width: 1920,
        height: 1080,
      });

      // Change aspect ratio to vertical
      act(() => {
        result.current.setAspectRatio("9:16");
      });

      expect(onRatioChange).toHaveBeenCalledWith("9:16");

      // Update dimensions for vertical video in same container
      act(() => {
        result.current.updatePlayerDimensions(1920, 1080);
      });

      // Should now fit to height with narrow width
      expect(result.current.playerDimensions).toEqual({
        width: 607.5,
        height: 1080,
      });

      // Get standard dimensions for export/rendering
      const standardDimensions = result.current.getAspectRatioDimensions();
      expect(standardDimensions).toEqual({
        width: 1080,
        height: 1920,
      });
    });

    it("should maintain state consistency across multiple operations", () => {
      const { result } = renderHook(() => useAspectRatio("16:9"));

      const ratios: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];

      ratios.forEach((ratio) => {
        act(() => {
          result.current.setAspectRatio(ratio);
        });

        expect(result.current.aspectRatio).toBe(ratio);

        const dimensions = result.current.getAspectRatioDimensions();
        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);
      });
    });
  });
});

