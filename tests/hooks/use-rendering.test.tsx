import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useRendering } from "../../app/reactvideoeditor/pro/hooks/use-rendering";
import { RendererProvider } from "../../app/reactvideoeditor/pro/contexts/renderer-context";
import {
  VideoRenderer,
  RendererConfig,
  ProgressResponse,
} from "../../app/reactvideoeditor/pro/types/renderer";
import { z } from "zod";
import { CompositionProps } from "../../app/reactvideoeditor/pro/types";

describe("useRendering", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  const sampleInputProps: z.infer<typeof CompositionProps> = {
    overlays: [],
    durationInFrames: 300,
    width: 1920,
    height: 1080,
    fps: 30,
    src: "test-video.mp4",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const createWrapper = (config: RendererConfig) => {
    return ({ children }: { children: React.ReactNode }) => (
      <RendererProvider config={config}>{children}</RendererProvider>
    );
  };

  it("should start with init status", () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn(),
      getProgress: jest.fn(),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    expect(result.current.state.status).toBe("init");
  });

  it("should return renderMedia, state, and undo functions", () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn(),
      getProgress: jest.fn(),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    expect(typeof result.current.renderMedia).toBe("function");
    expect(typeof result.current.undo).toBe("function");
    expect(result.current.state).toBeDefined();
  });

  it("should handle successful render to completion", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockResolvedValue({
        renderId: "test-123",
      }),
      getProgress: jest.fn().mockResolvedValue({
        type: "done",
        url: "https://example.com/video.mp4",
        size: 1024,
      } as ProgressResponse),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(result.current.state.status).toBe("done");
    if (result.current.state.status === "done") {
      expect(result.current.state.url).toBe("https://example.com/video.mp4");
      expect(result.current.state.size).toBe(1024);
    }
  });

  it("should handle render errors", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockRejectedValue(new Error("Render failed")),
      getProgress: jest.fn(),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.error.message).toBe("Render failed");
    }
  });

  it("should handle progress error response", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockResolvedValue({
        renderId: "test-456",
      }),
      getProgress: jest.fn().mockResolvedValue({
        type: "error",
        message: "Codec error",
      } as ProgressResponse),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(result.current.state.status).toBe("error");
  });

  it("should reset state with undo", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockResolvedValue({
        renderId: "test-789",
      }),
      getProgress: jest.fn().mockResolvedValue({
        type: "done",
        url: "https://example.com/done.mp4",
        size: 2048,
      } as ProgressResponse),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(result.current.state.status).toBe("done");

    act(() => {
      result.current.undo();
    });

    expect(result.current.state.status).toBe("init");
  });

  it("should call renderVideo with correct params", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockResolvedValue({
        renderId: "test-call",
      }),
      getProgress: jest.fn().mockResolvedValue({
        type: "done",
        url: "https://example.com/video.mp4",
        size: 512,
      } as ProgressResponse),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("my-comp", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(mockRenderer.renderVideo).toHaveBeenCalledWith({
      id: "my-comp",
      inputProps: sampleInputProps,
    });
  });

  it("should include bucketName in progress call if provided", async () => {
    const mockRenderer: VideoRenderer = {
      renderVideo: jest.fn().mockResolvedValue({
        renderId: "render-with-bucket",
        bucketName: "my-bucket",
      }),
      getProgress: jest.fn().mockResolvedValue({
        type: "done",
        url: "https://example.com/video.mp4",
        size: 256,
      } as ProgressResponse),
    };

    const wrapper = createWrapper({ renderer: mockRenderer });
    const { result } = renderHook(
      () => useRendering("test-composition", sampleInputProps),
      { wrapper }
    );

    await act(async () => {
      await result.current.renderMedia();
    });

    expect(mockRenderer.getProgress).toHaveBeenCalledWith({
      id: "render-with-bucket",
      bucketName: "my-bucket",
    });
  });
});

