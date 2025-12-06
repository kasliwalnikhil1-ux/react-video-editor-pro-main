import {
  transformOverlayForAspectRatio,
  transformOverlaysForAspectRatio,
  shouldTransformOverlays,
  getDimensionsForAspectRatio,
  CanvasDimensions,
} from "../../app/reactvideoeditor/pro/utils/aspect-ratio-transform";
import { Overlay, OverlayType } from "../../app/reactvideoeditor/pro/types";

describe("aspect-ratio-transform", () => {
  describe("getDimensionsForAspectRatio", () => {
    it("should return correct dimensions for 16:9", () => {
      expect(getDimensionsForAspectRatio("16:9")).toEqual({
        width: 1280,
        height: 720,
      });
    });

    it("should return correct dimensions for 9:16", () => {
      expect(getDimensionsForAspectRatio("9:16")).toEqual({
        width: 1080,
        height: 1920,
      });
    });

    it("should return correct dimensions for 1:1", () => {
      expect(getDimensionsForAspectRatio("1:1")).toEqual({
        width: 1080,
        height: 1080,
      });
    });

    it("should return correct dimensions for 4:5", () => {
      expect(getDimensionsForAspectRatio("4:5")).toEqual({
        width: 1080,
        height: 1350,
      });
    });
  });

  describe("shouldTransformOverlays", () => {
    it("should return false when dimensions are the same", () => {
      const dimensions: CanvasDimensions = { width: 1280, height: 720 };
      expect(shouldTransformOverlays(dimensions, dimensions)).toBe(false);
    });

    it("should return true when dimensions are different", () => {
      const oldDimensions: CanvasDimensions = { width: 1280, height: 720 };
      const newDimensions: CanvasDimensions = { width: 1080, height: 1920 };
      expect(shouldTransformOverlays(oldDimensions, newDimensions)).toBe(true);
    });

    it("should return false for very small changes (within tolerance)", () => {
      const oldDimensions: CanvasDimensions = { width: 1280, height: 720 };
      const newDimensions: CanvasDimensions = { width: 1280.5, height: 720.5 };
      expect(shouldTransformOverlays(oldDimensions, newDimensions)).toBe(false);
    });
  });

  describe("transformOverlayForAspectRatio", () => {
    it("should scale overlay proportionally from 16:9 to 9:16", () => {
      const overlay: Overlay = {
        id: 1,
        type: OverlayType.IMAGE,
        left: 640, // Center X of 1280
        top: 360, // Center Y of 720
        width: 400,
        height: 300,
        durationInFrames: 90,
        from: 0,
        row: 0,
        isDragging: false,
        rotation: 0,
        src: "test.jpg",
        styles: {},
      };

      const oldDimensions: CanvasDimensions = { width: 1280, height: 720 };
      const newDimensions: CanvasDimensions = { width: 1080, height: 1920 };

      const transformed = transformOverlayForAspectRatio(
        overlay,
        oldDimensions,
        newDimensions
      );

      // Expected scale: 1080/1280 = 0.84375 for X, 1920/720 = 2.6667 for Y
      expect(transformed.left).toBe(540); // 640 * 0.84375 = 540
      expect(transformed.top).toBe(960); // 360 * 2.6667 = 960
      expect(transformed.width).toBe(338); // 400 * 0.84375 = 337.5 → 338
      expect(transformed.height).toBe(800); // 300 * 2.6667 = 800
    });

    it("should scale overlay proportionally from 9:16 to 1:1", () => {
      const overlay: Overlay = {
        id: 2,
        type: OverlayType.TEXT,
        left: 540,
        top: 960,
        width: 300,
        height: 200,
        durationInFrames: 60,
        from: 0,
        row: 0,
        isDragging: false,
        rotation: 0,
        content: "Test",
        styles: { fontSize: "16px", fontWeight: "normal", color: "#000", backgroundColor: "transparent", fontFamily: "Arial", fontStyle: "normal", textDecoration: "none" },
      };

      const oldDimensions: CanvasDimensions = { width: 1080, height: 1920 };
      const newDimensions: CanvasDimensions = { width: 1080, height: 1080 };

      const transformed = transformOverlayForAspectRatio(
        overlay,
        oldDimensions,
        newDimensions
      );

      // X should stay the same (width unchanged), Y should scale by 1080/1920 = 0.5625
      expect(transformed.left).toBe(540);
      expect(transformed.top).toBe(540); // 960 * 0.5625 = 540
      expect(transformed.width).toBe(300);
      expect(transformed.height).toBe(113); // 200 * 0.5625 = 112.5 → 113
    });

    it("should maintain overlay properties other than position/size", () => {
      const overlay: Overlay = {
        id: 3,
        type: OverlayType.VIDEO,
        left: 100,
        top: 100,
        width: 200,
        height: 200,
        durationInFrames: 120,
        from: 30,
        row: 2,
        isDragging: false,
        rotation: 45,
        content: "test.mp4",
        src: "test.mp4",
        styles: { opacity: 0.8 },
      };

      const oldDimensions: CanvasDimensions = { width: 1280, height: 720 };
      const newDimensions: CanvasDimensions = { width: 1080, height: 1920 };

      const transformed = transformOverlayForAspectRatio(
        overlay,
        oldDimensions,
        newDimensions
      );

      // Non-positional properties should be preserved
      expect(transformed.id).toBe(3);
      expect(transformed.type).toBe(OverlayType.VIDEO);
      expect(transformed.durationInFrames).toBe(120);
      expect(transformed.from).toBe(30);
      expect(transformed.row).toBe(2);
      expect(transformed.rotation).toBe(45);
      expect(transformed.styles).toEqual({ opacity: 0.8 });
    });
  });

  describe("transformOverlaysForAspectRatio", () => {
    it("should transform all overlays in an array", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          type: OverlayType.IMAGE,
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          durationInFrames: 90,
          from: 0,
          row: 0,
          isDragging: false,
          rotation: 0,
          src: "test.jpg",
          styles: {},
        },
        {
          id: 2,
          type: OverlayType.TEXT,
          left: 500,
          top: 300,
          width: 300,
          height: 100,
          durationInFrames: 60,
          from: 0,
          row: 1,
          isDragging: false,
          rotation: 0,
          content: "Test",
          styles: { fontSize: "16px", fontWeight: "normal", color: "#000", backgroundColor: "transparent", fontFamily: "Arial", fontStyle: "normal", textDecoration: "none" },
        },
      ];

      const oldDimensions: CanvasDimensions = { width: 1280, height: 720 };
      const newDimensions: CanvasDimensions = { width: 1080, height: 1920 };

      const transformed = transformOverlaysForAspectRatio(
        overlays,
        oldDimensions,
        newDimensions
      );

      expect(transformed).toHaveLength(2);
      expect(transformed[0].id).toBe(1);
      expect(transformed[1].id).toBe(2);
      
      // Verify both were transformed
      expect(transformed[0].left).not.toBe(overlays[0].left);
      expect(transformed[1].left).not.toBe(overlays[1].left);
    });

    it("should return same overlays if dimensions unchanged", () => {
      const overlays: Overlay[] = [
        {
          id: 1,
          type: OverlayType.IMAGE,
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          durationInFrames: 90,
          from: 0,
          row: 0,
          isDragging: false,
          rotation: 0,
          src: "test.jpg",
          styles: {},
        },
      ];

      const dimensions: CanvasDimensions = { width: 1280, height: 720 };

      const transformed = transformOverlaysForAspectRatio(
        overlays,
        dimensions,
        dimensions
      );

      expect(transformed).toBe(overlays); // Should return same reference
    });
  });
});

