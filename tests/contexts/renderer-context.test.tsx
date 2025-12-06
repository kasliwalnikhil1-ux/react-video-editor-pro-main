import React from "react";
import { renderHook } from "@testing-library/react";
import {
  RendererProvider,
  useRenderer,
  useOptionalRenderer,
  RendererProviderProps,
} from "@/app/reactvideoeditor/pro/contexts/renderer-context";
import {
  VideoRenderer,
  RendererConfig,
  RenderParams,
  RenderResponse,
  ProgressParams,
  ProgressResponse,
} from "@/app/reactvideoeditor/pro/types/renderer";

describe("RendererContext", () => {
  // Mock VideoRenderer implementation
  const mockVideoRenderer: VideoRenderer = {
    renderVideo: jest.fn().mockResolvedValue({
      renderId: "test-render-id",
      bucketName: "test-bucket",
    } as RenderResponse),
    getProgress: jest.fn().mockResolvedValue({
      type: "progress",
      progress: 0.5,
    } as ProgressResponse),
    renderType: {
      type: "lambda",
      entryPoint: "test-entry-point",
    },
  };

  // Mock RendererConfig
  const mockRendererConfig: RendererConfig = {
    renderer: mockVideoRenderer,
    pollingInterval: 2000,
    initialDelay: 500,
  };

  const wrapper = ({ children, config }: RendererProviderProps) => (
    <RendererProvider config={config}>{children}</RendererProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useRenderer", () => {
    it("should throw error when used outside provider", () => {
      expect(() => {
        renderHook(() => useRenderer());
      }).toThrow(
        "useRenderer must be used within a RendererProvider. " +
        "Please wrap your component tree with <RendererProvider config={{renderer: yourRenderer}}>"
      );
    });

    it("should return renderer config when used within provider", () => {
      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      expect(result.current).toBe(mockRendererConfig);
      expect(result.current.renderer).toBe(mockVideoRenderer);
      expect(result.current.pollingInterval).toBe(2000);
      expect(result.current.initialDelay).toBe(500);
    });

    it("should provide access to renderer methods", () => {
      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      expect(result.current.renderer.renderVideo).toBe(mockVideoRenderer.renderVideo);
      expect(result.current.renderer.getProgress).toBe(mockVideoRenderer.getProgress);
      expect(result.current.renderer.renderType).toBe(mockVideoRenderer.renderType);
    });
  });

  describe("useOptionalRenderer", () => {
    it("should return null when used outside provider", () => {
      const { result } = renderHook(() => useOptionalRenderer());
      expect(result.current).toBeNull();
    });

    it("should return renderer config when used within provider", () => {
      const { result } = renderHook(() => useOptionalRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      expect(result.current).toBe(mockRendererConfig);
      expect(result.current?.renderer).toBe(mockVideoRenderer);
    });
  });

  describe("RendererProvider", () => {
    it("should provide renderer config to children", () => {
      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      expect(result.current).toEqual(mockRendererConfig);
    });

    it("should handle minimal renderer config", () => {
      const minimalConfig: RendererConfig = {
        renderer: {
          renderVideo: jest.fn().mockResolvedValue({ renderId: "test" }),
          getProgress: jest.fn().mockResolvedValue({ type: "progress", progress: 0 }),
        },
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: minimalConfig }),
      });

      expect(result.current.renderer).toBeDefined();
      expect(result.current.pollingInterval).toBeUndefined();
      expect(result.current.initialDelay).toBeUndefined();
    });

    it("should handle renderer without renderType", () => {
      const configWithoutRenderType: RendererConfig = {
        renderer: {
          renderVideo: jest.fn(),
          getProgress: jest.fn(),
        },
        pollingInterval: 1000,
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: configWithoutRenderType }),
      });

      expect(result.current.renderer.renderType).toBeUndefined();
      expect(result.current.pollingInterval).toBe(1000);
    });
  });

  describe("Renderer functionality", () => {
    it("should allow calling renderVideo through context", async () => {
      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      const renderParams: RenderParams = {
        id: "test-composition",
        inputProps: {
          overlays: [],
          durationInFrames: 300,
          width: 1920,
          height: 1080,
          fps: 30,
          src: "test-video.mp4",
        },
      };

      const response = await result.current.renderer.renderVideo(renderParams);

      expect(mockVideoRenderer.renderVideo).toHaveBeenCalledWith(renderParams);
      expect(response).toEqual({
        renderId: "test-render-id",
        bucketName: "test-bucket",
      });
    });

    it("should allow calling getProgress through context", async () => {
      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: mockRendererConfig }),
      });

      const progressParams: ProgressParams = {
        id: "test-render-id",
        bucketName: "test-bucket",
      };

      const response = await result.current.renderer.getProgress(progressParams);

      expect(mockVideoRenderer.getProgress).toHaveBeenCalledWith(progressParams);
      expect(response).toEqual({
        type: "progress",
        progress: 0.5,
      });
    });
  });

  describe("Error handling", () => {
    it("should handle renderer that throws errors", async () => {
      const errorRenderer: VideoRenderer = {
        renderVideo: jest.fn().mockRejectedValue(new Error("Render failed")),
        getProgress: jest.fn().mockRejectedValue(new Error("Progress failed")),
      };

      const errorConfig: RendererConfig = {
        renderer: errorRenderer,
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: errorConfig }),
      });

      await expect(
        result.current.renderer.renderVideo({ 
          id: "test", 
          inputProps: {
            overlays: [],
            durationInFrames: 100,
            width: 1280,
            height: 720,
            fps: 30,
            src: "test.mp4",
          }
        })
      ).rejects.toThrow("Render failed");

      await expect(
        result.current.renderer.getProgress({ id: "test" })
      ).rejects.toThrow("Progress failed");
    });

    it("should handle different progress response types", async () => {
      const progressResponses: ProgressResponse[] = [
        { type: "progress", progress: 0.25 },
        { type: "done", url: "https://example.com/video.mp4", size: 1024 },
        { type: "error", message: "Rendering failed" },
      ];

      for (const response of progressResponses) {
        const renderer: VideoRenderer = {
          renderVideo: jest.fn(),
          getProgress: jest.fn().mockResolvedValue(response),
        };

        const config: RendererConfig = { renderer };

        const { result } = renderHook(() => useRenderer(), {
          wrapper: ({ children }) => wrapper({ children, config }),
        });

        const progressResult = await result.current.renderer.getProgress({ id: "test" });
        expect(progressResult).toEqual(response);
      }
    });
  });

  describe("Configuration options", () => {
    it("should handle custom polling interval", () => {
      const customConfig: RendererConfig = {
        renderer: mockVideoRenderer,
        pollingInterval: 5000,
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: customConfig }),
      });

      expect(result.current.pollingInterval).toBe(5000);
    });

    it("should handle custom initial delay", () => {
      const customConfig: RendererConfig = {
        renderer: mockVideoRenderer,
        initialDelay: 2000,
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: customConfig }),
      });

      expect(result.current.initialDelay).toBe(2000);
    });

    it("should handle both polling interval and initial delay", () => {
      const customConfig: RendererConfig = {
        renderer: mockVideoRenderer,
        pollingInterval: 3000,
        initialDelay: 1500,
      };

      const { result } = renderHook(() => useRenderer(), {
        wrapper: ({ children }) => wrapper({ children, config: customConfig }),
      });

      expect(result.current.pollingInterval).toBe(3000);
      expect(result.current.initialDelay).toBe(1500);
    });
  });

  describe("Multiple providers", () => {
    it("should handle nested providers with different configs", () => {
      const outerRenderer: VideoRenderer = {
        renderVideo: jest.fn().mockResolvedValue({ renderId: "outer" }),
        getProgress: jest.fn(),
      };

      const innerRenderer: VideoRenderer = {
        renderVideo: jest.fn().mockResolvedValue({ renderId: "inner" }),
        getProgress: jest.fn(),
      };

      const outerConfig: RendererConfig = { renderer: outerRenderer };
      const innerConfig: RendererConfig = { renderer: innerRenderer };

      const NestedWrapper = ({ children }: { children: React.ReactNode }) => (
        <RendererProvider config={outerConfig}>
          <RendererProvider config={innerConfig}>
            {children}
          </RendererProvider>
        </RendererProvider>
      );

      const { result } = renderHook(() => useRenderer(), {
        wrapper: NestedWrapper,
      });

      // Should use the inner (most recent) provider
      expect(result.current.renderer).toBe(innerRenderer);
    });
  });
}); 