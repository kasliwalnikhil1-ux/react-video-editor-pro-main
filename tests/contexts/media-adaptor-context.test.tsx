import React from "react";
import { renderHook } from "@testing-library/react";
import {
  MediaAdaptorProvider,
  useMediaAdaptors,
} from "../../app/reactvideoeditor/pro/contexts/media-adaptor-context";
import {
  VideoOverlayAdaptor,
  ImageOverlayAdaptor,
  SoundOverlayAdaptor,
  TextOverlayAdaptor,
  StickerOverlayAdaptor,
  TemplateOverlayAdaptor,
  AnimationOverlayAdaptor,
} from "../../app/reactvideoeditor/pro/types/overlay-adaptors";
import {
  MediaSearchParams,
  StandardVideo,
  StandardImage,
  StandardAudio,
} from "../../app/reactvideoeditor/pro/types/media-adaptors";
import { TextOverlayTemplate } from "../../app/reactvideoeditor/pro/templates/text-overlay-templates";
import { TemplateOverlay } from "../../app/reactvideoeditor/pro/types";
import { AnimationTemplate } from "../../app/reactvideoeditor/pro/adaptors/default-animation-adaptors";

// Mock the default adaptors
jest.mock("../../app/reactvideoeditor/pro/adaptors/default-audio-adaptors", () => ({
  getDefaultAudioAdaptors: jest.fn(),
}));

jest.mock("../../app/reactvideoeditor/pro/adaptors/default-text-adaptors", () => ({
  getDefaultTextAdaptors: jest.fn(),
}));

jest.mock("../../app/reactvideoeditor/pro/adaptors/default-templates-adaptor", () => ({
  getDefaultTemplateAdaptors: jest.fn(),
}));

jest.mock("../../app/reactvideoeditor/pro/adaptors/default-animation-adaptors", () => ({
  getDefaultAnimationAdaptors: jest.fn(),
}));

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe("MediaAdaptorContext", () => {
  // Mock data
  const mockVideo: StandardVideo = {
    id: "video-1",
    type: 'video',
    width: 1920,
    height: 1080,
    thumbnail: "https://example.com/thumb.jpg",
    duration: 30,
    videoFiles: [{
      quality: 'hd',
      format: 'video/mp4',
      url: "https://example.com/video.mp4",
    }],
  };

  const mockImage: StandardImage = {
    id: "image-1",
    type: 'image',
    width: 1920,
    height: 1080,
    src: {
      original: "https://example.com/image.jpg",
      thumbnail: "https://example.com/thumb.jpg",
    },
  };

  const mockAudio: StandardAudio = {
    id: "audio-1",
    title: "Test Audio",
    artist: "Test Artist",
    duration: 60,
    file: "https://example.com/audio.mp3",
  };

  const mockTextTemplate: TextOverlayTemplate = {
    id: "text-1",
    name: "Test Text Template",
    content: "Sample Text",
    preview: "Sample Text Preview",
    category: "basic",
    styles: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#ffffff",
      backgroundColor: "transparent",
      fontFamily: "Arial",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "center",
    },
  };

  const mockAnimationTemplate: AnimationTemplate = {
    name: "Test Animation",
    preview: "Test animation preview",
    enter: () => ({ opacity: 0 }),
    exit: () => ({ opacity: 1 }),
  };

  const mockTemplateOverlay: TemplateOverlay = {
    id: "template-1",
    name: "Test Template",
    description: "Test template description",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      name: "Test User",
      avatar: "",
    },
    category: "social",
    tags: ["test"],
    duration: 30,
    overlays: [],
  };

  // Mock adaptors
  const mockVideoAdaptor: VideoOverlayAdaptor = {
    name: "test-video",
    displayName: "Test Video Adaptor",
    requiresAuth: false,
    supportedTypes: ['video'],
    search: jest.fn(),
    getVideoUrl: jest.fn(),
    getThumbnailUrl: jest.fn(),
  };

  const mockImageAdaptor: ImageOverlayAdaptor = {
    name: "test-image",
    displayName: "Test Image Adaptor",
    requiresAuth: false,
    supportedTypes: ['image'],
    search: jest.fn(),
    getImageUrl: jest.fn(),
  };

  const mockAudioAdaptor: SoundOverlayAdaptor = {
    name: "test-audio",
    displayName: "Test Audio Adaptor",
    requiresAuth: false,
    search: jest.fn(),
    getAudioUrl: jest.fn(),
  };

  const mockTextAdaptor: TextOverlayAdaptor = {
    name: "test-text",
    displayName: "Test Text Adaptor",
    requiresAuth: false,
    getTemplates: jest.fn(),
  };

  const mockStickerAdaptor: StickerOverlayAdaptor = {
    name: "test-sticker",
    displayName: "Test Sticker Adaptor",
    requiresAuth: false,
    getTemplates: jest.fn(),
    getCategories: jest.fn(),
  };

  const mockTemplateAdaptor: TemplateOverlayAdaptor = {
    name: "test-template",
    displayName: "Test Template Adaptor",
    requiresAuth: false,
    getTemplates: jest.fn(),
  };

  const mockAnimationAdaptor: AnimationOverlayAdaptor = {
    name: "test-animation",
    displayName: "Test Animation Adaptor",
    requiresAuth: false,
    getTemplates: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock default adaptors to return empty arrays by default
    const { getDefaultAudioAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-audio-adaptors");
    const { getDefaultTextAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-text-adaptors");
    const { getDefaultTemplateAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-templates-adaptor");
    const { getDefaultAnimationAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-animation-adaptors");

    (getDefaultAudioAdaptors as jest.Mock).mockReturnValue([]);
    (getDefaultTextAdaptors as jest.Mock).mockReturnValue([]);
    (getDefaultTemplateAdaptors as jest.Mock).mockReturnValue([]);
    (getDefaultAnimationAdaptors as jest.Mock).mockReturnValue([]);
    
    // Setup default mock implementations
    (mockVideoAdaptor.search as jest.Mock).mockResolvedValue({
      items: [mockVideo],
      totalCount: 1,
      hasMore: false,
    });

    (mockImageAdaptor.search as jest.Mock).mockResolvedValue({
      items: [mockImage],
      totalCount: 1,
      hasMore: false,
    });

    (mockAudioAdaptor.search as jest.Mock).mockResolvedValue({
      items: [mockAudio],
      totalCount: 1,
      hasMore: false,
    });

    (mockTextAdaptor.getTemplates as jest.Mock).mockResolvedValue({
      items: [mockTextTemplate],
      totalCount: 1,
    });

    (mockAnimationAdaptor.getTemplates as jest.Mock).mockResolvedValue({
      items: [mockAnimationTemplate],
      totalCount: 1,
    });

    (mockTemplateAdaptor.getTemplates as jest.Mock).mockResolvedValue({
      items: [mockTemplateOverlay],
      totalCount: 1,
      hasMore: false,
    });
  });

  describe("Provider and Hook", () => {
    it("should throw error when useMediaAdaptors is used outside provider", () => {
      expect(() => {
        renderHook(() => useMediaAdaptors());
      }).toThrow("useMediaAdaptors must be used within MediaAdaptorProvider");
    });

    it("should provide context value when used within provider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.videoAdaptors).toEqual([]);
      expect(result.current.imageAdaptors).toEqual([]);
      expect(typeof result.current.searchVideos).toBe("function");
      expect(typeof result.current.searchImages).toBe("function");
      expect(typeof result.current.searchAudio).toBe("function");
      expect(typeof result.current.getTextTemplates).toBe("function");
      expect(typeof result.current.getStickerTemplates).toBe("function");
      expect(typeof result.current.getTemplateOverlays).toBe("function");
      expect(typeof result.current.getAnimationTemplates).toBe("function");
    });

    it("should use provided adaptors when available", () => {
      const adaptors = {
        video: [mockVideoAdaptor],
        images: [mockImageAdaptor],
        audio: [mockAudioAdaptor],
        text: [mockTextAdaptor],
        stickers: [mockStickerAdaptor],
        templates: [mockTemplateAdaptor],
        animations: [mockAnimationAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      expect(result.current.videoAdaptors).toEqual([mockVideoAdaptor]);
      expect(result.current.imageAdaptors).toEqual([mockImageAdaptor]);
      expect(result.current.audioAdaptors).toEqual([mockAudioAdaptor]);
      expect(result.current.textAdaptors).toEqual([mockTextAdaptor]);
      expect(result.current.stickerAdaptors).toEqual([mockStickerAdaptor]);
      expect(result.current.templateAdaptors).toEqual([mockTemplateAdaptor]);
      expect(result.current.animationAdaptors).toEqual([mockAnimationAdaptor]);
    });
  });

  describe("searchVideos", () => {
    it("should return empty result when no video adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchVideos({ query: "test" });

      expect(searchResult).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should search across all video adaptors and merge results", async () => {
      const adaptors = {
        video: [mockVideoAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchParams: MediaSearchParams = { query: "test", page: 1 };
      const searchResult = await result.current.searchVideos(searchParams);

      expect(mockVideoAdaptor.search).toHaveBeenCalledWith(searchParams, undefined);
      expect(searchResult.items).toHaveLength(1);
      expect(searchResult.items[0]).toMatchObject({
        ...mockVideo,
        _source: "test-video",
        _sourceDisplayName: "Test Video Adaptor",
      });
      expect(searchResult.totalCount).toBe(1);
      expect(searchResult.hasMore).toBe(false);
      expect(searchResult.sourceResults).toHaveLength(1);
    });

    it("should handle adaptor errors gracefully", async () => {
      const errorAdaptor = {
        ...mockVideoAdaptor,
        search: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      const adaptors = {
        video: [errorAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchVideos({ query: "test" });

      expect(searchResult.items).toHaveLength(0);
      expect(searchResult.sourceResults[0].error).toBe("API Error");
    });

    it("should merge results from multiple adaptors", async () => {
      const secondVideoAdaptor = {
        ...mockVideoAdaptor,
        name: "second-video",
        displayName: "Second Video Adaptor",
        search: jest.fn().mockResolvedValue({
          items: [{ ...mockVideo, id: "video-2" }],
          totalCount: 1,
          hasMore: false,
        }),
      };

      const adaptors = {
        video: [mockVideoAdaptor, secondVideoAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchVideos({ query: "test" });

      expect(searchResult.items).toHaveLength(2);
      expect(searchResult.totalCount).toBe(2);
      expect(searchResult.sourceResults).toHaveLength(2);
    });
  });

  describe("searchImages", () => {
    it("should return empty result when no image adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchImages({ query: "test" });

      expect(searchResult).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should search across all image adaptors and merge results", async () => {
      const adaptors = {
        images: [mockImageAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchParams: MediaSearchParams = { query: "test", page: 1 };
      const searchResult = await result.current.searchImages(searchParams);

      expect(mockImageAdaptor.search).toHaveBeenCalledWith(searchParams, undefined);
      expect(searchResult.items).toHaveLength(1);
      expect(searchResult.items[0]).toMatchObject({
        ...mockImage,
        _source: "test-image",
        _sourceDisplayName: "Test Image Adaptor",
      });
    });
  });

  describe("searchAudio", () => {
    it("should return empty result when no audio adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchAudio({ query: "test" });

      expect(searchResult).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should search across all audio adaptors and merge results", async () => {
      const adaptors = {
        audio: [mockAudioAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchParams = { query: "test", page: 1 };
      const searchResult = await result.current.searchAudio(searchParams);

      expect(mockAudioAdaptor.search).toHaveBeenCalledWith(searchParams, undefined);
      expect(searchResult.items).toHaveLength(1);
      expect(searchResult.items[0]).toMatchObject({
        ...mockAudio,
        _source: "test-audio",
        _sourceDisplayName: "Test Audio Adaptor",
      });
    });
  });

  describe("getTextTemplates", () => {
    it("should return empty result when no text adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={{ text: [] }}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getTextTemplates();

      expect(templates).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should fetch text templates from all adaptors", async () => {
      const adaptors = {
        text: [mockTextAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getTextTemplates();

      expect(mockTextAdaptor.getTemplates).toHaveBeenCalledWith(undefined);
      expect(templates.items).toHaveLength(1);
      expect(templates.items[0]).toMatchObject({
        ...mockTextTemplate,
        _source: "test-text",
        _sourceDisplayName: "Test Text Adaptor",
      });
      expect(templates.hasMore).toBe(false);
    });
  });

  describe("getStickerTemplates", () => {
    it("should return empty result (not implemented)", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getStickerTemplates();

      expect(templates).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });
  });

  describe("getAnimationTemplates", () => {
    it("should return empty result when no animation adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={{ animations: [] }}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getAnimationTemplates();

      expect(templates).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should fetch animation templates from all adaptors", async () => {
      const adaptors = {
        animations: [mockAnimationAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getAnimationTemplates();

      expect(mockAnimationAdaptor.getTemplates).toHaveBeenCalledWith(undefined);
      expect(templates.items).toHaveLength(1);
      expect(templates.items[0]).toMatchObject({
        ...mockAnimationTemplate,
        _source: "test-animation",
        _sourceDisplayName: "Test Animation Adaptor",
      });
    });
  });

  describe("getTemplateOverlays", () => {
    it("should return empty result when no template adaptors are configured", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={{ templates: [] }}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getTemplateOverlays();

      expect(templates).toEqual({
        items: [],
        totalCount: 0,
        hasMore: false,
        sourceResults: [],
      });
    });

    it("should fetch template overlays from all adaptors", async () => {
      const adaptors = {
        templates: [mockTemplateAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const params = { searchQuery: "test", page: 1 };
      const templates = await result.current.getTemplateOverlays(params);

      expect(mockTemplateAdaptor.getTemplates).toHaveBeenCalledWith(params, undefined);
      expect(templates.items).toHaveLength(1);
      expect(templates.items[0]).toMatchObject({
        ...mockTemplateOverlay,
        _source: "test-template",
        _sourceDisplayName: "Test Template Adaptor",
      });
    });

    it("should handle template adaptor errors gracefully", async () => {
      const errorAdaptor = {
        ...mockTemplateAdaptor,
        getTemplates: jest.fn().mockRejectedValue(new Error("Template Error")),
      };

      const adaptors = {
        templates: [errorAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getTemplateOverlays();

      expect(templates.items).toHaveLength(0);
      expect(templates.sourceResults[0].error).toBe("Template Error");
    });
  });

  describe("Default Adaptors", () => {
    it("should use default adaptors when none are provided", () => {
      const mockDefaultAudio = [mockAudioAdaptor];
      const mockDefaultText = [mockTextAdaptor];
      const mockDefaultTemplate = [mockTemplateAdaptor];
      const mockDefaultAnimation = [mockAnimationAdaptor];

      const { getDefaultAudioAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-audio-adaptors");
      const { getDefaultTextAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-text-adaptors");
      const { getDefaultTemplateAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-templates-adaptor");
      const { getDefaultAnimationAdaptors } = require("../../app/reactvideoeditor/pro/adaptors/default-animation-adaptors");

      (getDefaultAudioAdaptors as jest.Mock).mockReturnValue(mockDefaultAudio);
      (getDefaultTextAdaptors as jest.Mock).mockReturnValue(mockDefaultText);
      (getDefaultTemplateAdaptors as jest.Mock).mockReturnValue(mockDefaultTemplate);
      (getDefaultAnimationAdaptors as jest.Mock).mockReturnValue(mockDefaultAnimation);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider>{children}</MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      expect(result.current.audioAdaptors).toEqual(mockDefaultAudio);
      expect(result.current.textAdaptors).toEqual(mockDefaultText);
      expect(result.current.templateAdaptors).toEqual(mockDefaultTemplate);
      expect(result.current.animationAdaptors).toEqual(mockDefaultAnimation);
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown errors in search functions", async () => {
      const errorAdaptor = {
        ...mockVideoAdaptor,
        search: jest.fn().mockRejectedValue("String error"),
      };

      const adaptors = {
        video: [errorAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchVideos({ query: "test" });

      expect(searchResult.sourceResults[0].error).toBe("Unknown error");
    });

    it("should handle unknown errors in template functions", async () => {
      const errorAdaptor = {
        ...mockTextAdaptor,
        getTemplates: jest.fn().mockRejectedValue("String error"),
      };

      const adaptors = {
        text: [errorAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const templates = await result.current.getTextTemplates();

      expect(templates.sourceResults[0].error).toBe("Unknown error");
    });
  });

  describe("hasMore Logic", () => {
    it("should correctly determine hasMore from multiple adaptors", async () => {
      const hasMoreAdaptor = {
        ...mockVideoAdaptor,
        name: "hasmore-video",
        search: jest.fn().mockResolvedValue({
          items: [mockVideo],
          totalCount: 1,
          hasMore: true,
        }),
      };

      const noMoreAdaptor = {
        ...mockVideoAdaptor,
        name: "nomore-video",
        search: jest.fn().mockResolvedValue({
          items: [{ ...mockVideo, id: "video-2" }],
          totalCount: 1,
          hasMore: false,
        }),
      };

      const adaptors = {
        video: [hasMoreAdaptor, noMoreAdaptor],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MediaAdaptorProvider adaptors={adaptors}>
          {children}
        </MediaAdaptorProvider>
      );

      const { result } = renderHook(() => useMediaAdaptors(), { wrapper });

      const searchResult = await result.current.searchVideos({ query: "test" });

      expect(searchResult.hasMore).toBe(true); // Should be true if any adaptor has more
    });
  });
}); 