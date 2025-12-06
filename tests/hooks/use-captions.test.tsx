import { renderHook, act } from "@testing-library/react";
import { Caption, CaptionOverlay, OverlayType } from "../../app/reactvideoeditor/pro/types";


// Import the ParseSRTResult type for proper typing
interface ParseSRTResult {
  success: boolean;
  captions?: Caption[];
  errors?: Array<{
    type: 'validation' | 'format' | 'timing' | 'encoding';
    message: string;
    line?: number;
    details?: string;
  }>;
  totalCaptions?: number;
}

// Create mock functions
const mockSetOverlays = jest.fn();
const mockSetSelectedOverlayId = jest.fn();
const mockAddAtPlayhead = jest.fn((currentFrame, overlays) => ({
  from: 0,
  row: 0,
  updatedOverlays: overlays,
}));

// Mock the context and hooks modules
jest.mock("../../app/reactvideoeditor/pro/contexts/editor-context", () => ({
  useEditorContext: jest.fn(() => ({
    overlays: [],
    currentFrame: 0,
    setOverlays: mockSetOverlays,
    setSelectedOverlayId: mockSetSelectedOverlayId,
  })),
}));

jest.mock("../../app/reactvideoeditor/pro/hooks/use-timeline-positioning", () => ({
  useTimelinePositioning: jest.fn(() => ({
    addAtPlayhead: mockAddAtPlayhead,
  })),
}));

// Now import the hook after mocks are set up
import { useCaptions } from "../../app/reactvideoeditor/pro/hooks/use-captions";

describe("useCaptions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddAtPlayhead.mockReturnValue({
      from: 0,
      row: 0,
      updatedOverlays: [],
    });
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("parseTimeString", () => {
    it("should correctly parse valid SRT timestamp", () => {
      const { result } = renderHook(() => useCaptions());

      const time = result.current.parseTimeString("00:00:01,500");
      expect(time).toBe(1500);
    });

    it("should parse timestamps with hours", () => {
      const { result } = renderHook(() => useCaptions());

      const time = result.current.parseTimeString("01:30:45,250");
      expect(time).toBe((1 * 3600 + 30 * 60 + 45) * 1000 + 250);
    });

    it("should parse zero timestamp", () => {
      const { result } = renderHook(() => useCaptions());

      const time = result.current.parseTimeString("00:00:00,000");
      expect(time).toBe(0);
    });

    it("should throw error for invalid format", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("invalid")).toThrow();
    });

    it("should throw error for missing milliseconds", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("00:00:01")).toThrow();
    });

    it("should throw error for non-numeric components", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("aa:bb:cc,ddd")).toThrow();
    });

    it("should throw error for invalid minutes (>= 60)", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("00:60:00,000")).toThrow();
    });

    it("should throw error for invalid seconds (>= 60)", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("00:00:60,000")).toThrow();
    });

    it("should throw error for invalid milliseconds (>= 1000)", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("00:00:00,1000")).toThrow();
    });

    it("should throw error for negative values", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => result.current.parseTimeString("-01:00:00,000")).toThrow();
    });
  });

  describe("cleanSRTText", () => {
    it("should remove HTML tags", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText("<b>Hello</b> world");
      expect(cleaned).toBe("Hello world");
    });

    it("should remove curly brace formatting", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText("{\\an8}Top center text");
      expect(cleaned).toBe("Top center text");
    });

    it("should remove multiple HTML tags", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText(
        "<i><b>Hello</b></i> <u>world</u>"
      );
      expect(cleaned).toBe("Hello world");
    });

    it("should trim whitespace", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText("  Hello world  ");
      expect(cleaned).toBe("Hello world");
    });

    it("should handle empty string", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText("");
      expect(cleaned).toBe("");
    });

    it("should handle text without tags", () => {
      const { result } = renderHook(() => useCaptions());

      const cleaned = result.current.cleanSRTText("Plain text");
      expect(cleaned).toBe("Plain text");
    });
  });

  describe("distributeWordTiming", () => {
    it("should distribute words evenly across duration", () => {
      const { result } = renderHook(() => useCaptions());

      const words = ["Hello", "world", "test"];
      const wordTiming = result.current.distributeWordTiming(words, 0, 3000);

      expect(wordTiming).toHaveLength(3);
      expect(wordTiming[0]).toMatchObject({
        word: "Hello",
        startMs: 0,
        endMs: 1000,
        confidence: 0.95,
      });
      expect(wordTiming[1]).toMatchObject({
        word: "world",
        startMs: 1000,
        endMs: 2000,
        confidence: 0.95,
      });
      expect(wordTiming[2]).toMatchObject({
        word: "test",
        startMs: 2000,
        endMs: 3000,
        confidence: 0.95,
      });
    });

    it("should handle single word", () => {
      const { result } = renderHook(() => useCaptions());

      const words = ["Hello"];
      const wordTiming = result.current.distributeWordTiming(words, 0, 1000);

      expect(wordTiming).toHaveLength(1);
      expect(wordTiming[0]).toMatchObject({
        word: "Hello",
        startMs: 0,
        endMs: 1000,
        confidence: 0.95,
      });
    });

    it("should handle empty word array", () => {
      const { result } = renderHook(() => useCaptions());

      const wordTiming = result.current.distributeWordTiming([], 0, 1000);
      expect(wordTiming).toHaveLength(0);
    });

    it("should trim whitespace from words", () => {
      const { result } = renderHook(() => useCaptions());

      const words = ["  Hello  ", "  world  "];
      const wordTiming = result.current.distributeWordTiming(words, 0, 2000);

      expect(wordTiming[0].word).toBe("Hello");
      expect(wordTiming[1].word).toBe("world");
    });

    it("should handle non-zero start time", () => {
      const { result } = renderHook(() => useCaptions());

      const words = ["Hello", "world"];
      const wordTiming = result.current.distributeWordTiming(words, 5000, 7000);

      expect(wordTiming[0]).toMatchObject({
        word: "Hello",
        startMs: 5000,
        endMs: 6000,
      });
      expect(wordTiming[1]).toMatchObject({
        word: "world",
        startMs: 6000,
        endMs: 7000,
      });
    });
  });

  describe("parseSRT", () => {
    it("should successfully parse valid SRT content", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:04,000 --> 00:00:06,000
This is a test`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions).toHaveLength(2);
      expect(parseResult!.captions![0]).toMatchObject({
        text: "Hello world",
        startMs: 1000,
        endMs: 3000,
      });
      expect(parseResult!.captions![1]).toMatchObject({
        text: "This is a test",
        startMs: 4000,
        endMs: 6000,
      });
    });

    it("should handle multi-line subtitle text", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
First line
Second line
Third line`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions![0].text).toContain("First line");
      expect(parseResult!.captions![0].text).toContain("Second line");
    });

    it("should sort captions by start time", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `2
00:00:04,000 --> 00:00:06,000
Second

1
00:00:01,000 --> 00:00:03,000
First`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions![0].text).toBe("First");
      expect(parseResult!.captions![1].text).toBe("Second");
    });

    it("should fail on empty content", async () => {
      const { result } = renderHook(() => useCaptions());

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT("");
      });

      expect(parseResult!.success).toBe(false);
      expect(parseResult!.errors).toBeDefined();
      expect(parseResult!.errors![0].type).toBe("validation");
    });

    it("should fail on content without timestamps", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
Some text without timestamps`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(false);
      expect(parseResult!.errors).toBeDefined();
      expect(parseResult!.errors![0].type).toBe("validation");
    });

    it("should detect timing overlaps", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:05,000
First caption

2
00:00:03,000 --> 00:00:06,000
Overlapping caption`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.errors).toBeDefined();
      const overlapError = parseResult!.errors!.find(
        (e) => e.type === "timing" && e.message.includes("overlap")
      );
      expect(overlapError).toBeDefined();
    });

    it("should reject start time >= end time", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:05,000 --> 00:00:03,000
Invalid timing`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(false);
      expect(parseResult!.errors).toBeDefined();
    });

    it("should clean HTML tags from text", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
<b>Bold text</b> and <i>italic</i>`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions![0].text).toBe("Bold text and italic");
    });

    it("should include word timing in captions", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:00,000 --> 00:00:02,000
Hello world`;

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions![0].words).toHaveLength(2);
      expect(parseResult!.captions![0].words[0].word).toBe("Hello");
      expect(parseResult!.captions![0].words[1].word).toBe("world");
    });

    it("should update hook state during parsing", async () => {
      const { result } = renderHook(() => useCaptions());

      expect(result.current.isProcessing).toBe(false);

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Test`;

      await act(async () => {
        await result.current.parseSRT(srtContent);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.lastParseResult).toBeDefined();
    });
  });

  describe("generateFromText", () => {
    it("should generate captions from plain text", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "Hello world. This is a test.",
        });
      });

      expect(captions!).toHaveLength(2);
      expect(captions![0].text).toBe("Hello world");
      expect(captions![1].text).toBe("This is a test");
    });

    it("should respect wordsPerMinute parameter", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "Hello world.",
          wordsPerMinute: 120,
        });
      });

      const expectedDuration = (2 * 60 * 1000) / 120; // 2 words at 120 wpm
      expect(captions![0].endMs).toBeCloseTo(expectedDuration, -2);
    });

    it("should add gaps between sentences", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "First. Second.",
          sentenceGapMs: 1000,
        });
      });

      expect(captions![1].startMs - captions![0].endMs).toBe(1000);
    });

    it("should handle different sentence delimiters", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "Question? Exclamation! Statement.",
        });
      });

      expect(captions!).toHaveLength(3);
      expect(captions![0].text).toBe("Question");
      expect(captions![1].text).toBe("Exclamation");
      expect(captions![2].text).toBe("Statement");
    });

    it("should throw error for empty text", async () => {
      const { result } = renderHook(() => useCaptions());

      await expect(
        act(async () => {
          await result.current.generateFromText({ text: "" });
        })
      ).rejects.toThrow("Text cannot be empty");
    });

    it("should throw error for text with no valid sentences", async () => {
      const { result } = renderHook(() => useCaptions());

      await expect(
        act(async () => {
          await result.current.generateFromText({ text: "..." });
        })
      ).rejects.toThrow("No valid sentences found in text");
    });

    it("should include word timing for each caption", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "Hello world.",
        });
      });

      expect(captions![0].words).toHaveLength(2);
      expect(captions![0].words[0].word).toBe("Hello");
      expect(captions![0].words[1].word).toBe("world");
    });

    it("should set confidence to 0.99 for generated captions", async () => {
      const { result } = renderHook(() => useCaptions());

      let captions: Caption[];
      await act(async () => {
        captions = await result.current.generateFromText({
          text: "Test sentence.",
        });
      });

      expect(captions![0].confidence).toBe(0.99);
    });

    it("should update hook state after generation", async () => {
      const { result } = renderHook(() => useCaptions());

      await act(async () => {
        await result.current.generateFromText({ text: "Test sentence." });
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.lastParseResult).toBeDefined();
      expect(result.current.lastParseResult!.success).toBe(true);
    });
  });

  describe("createCaptionOverlay", () => {
    it("should create overlay with correct properties", () => {
      const { result } = renderHook(() => useCaptions());

      const captions: Caption[] = [
        {
          text: "Test",
          startMs: 0,
          endMs: 2000,
          timestampMs: null,
          confidence: 0.95,
          words: [],
        },
      ];

      let overlay: CaptionOverlay;
      act(() => {
        overlay = result.current.createCaptionOverlay(captions);
      });

      expect(overlay!.type).toBe(OverlayType.CAPTION);
      expect(overlay!.captions).toEqual(captions);
      expect(mockSetOverlays).toHaveBeenCalled();
      expect(mockSetSelectedOverlayId).toHaveBeenCalled();
    });

    it("should calculate duration based on last caption end time", () => {
      const { result } = renderHook(() => useCaptions());

      const captions: Caption[] = [
        {
          text: "First",
          startMs: 0,
          endMs: 2000,
          timestampMs: null,
          confidence: 0.95,
          words: [],
        },
        {
          text: "Second",
          startMs: 2000,
          endMs: 5000,
          timestampMs: null,
          confidence: 0.95,
          words: [],
        },
      ];

      let overlay: CaptionOverlay;
      act(() => {
        overlay = result.current.createCaptionOverlay(captions);
      });

      // 5000ms = 5 seconds * 30 fps = 150 frames
      expect(overlay!.durationInFrames).toBe(150);
    });

    it("should throw error for empty captions array", () => {
      const { result } = renderHook(() => useCaptions());

      expect(() => {
        act(() => {
          result.current.createCaptionOverlay([]);
        });
      }).toThrow("Cannot create overlay with empty captions");
    });

    it("should set default positioning properties", () => {
      const { result } = renderHook(() => useCaptions());

      const captions: Caption[] = [
        {
          text: "Test",
          startMs: 0,
          endMs: 1000,
          timestampMs: null,
          confidence: 0.95,
          words: [],
        },
      ];

      let overlay: CaptionOverlay;
      act(() => {
        overlay = result.current.createCaptionOverlay(captions);
      });

      expect(overlay!.left).toBe(230);
      expect(overlay!.top).toBe(414);
      expect(overlay!.width).toBe(833);
      expect(overlay!.height).toBe(269);
      expect(overlay!.rotation).toBe(0);
    });

    it("should use addAtPlayhead for positioning", () => {
      const { result } = renderHook(() => useCaptions());

      const captions: Caption[] = [
        {
          text: "Test",
          startMs: 0,
          endMs: 1000,
          timestampMs: null,
          confidence: 0.95,
          words: [],
        },
      ];

      act(() => {
        result.current.createCaptionOverlay(captions);
      });

      expect(mockAddAtPlayhead).toHaveBeenCalledWith(0, [], "top");
    });
  });

  describe("handleFileUpload", () => {
    it("should successfully parse valid SRT file", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Test caption`;

      const file = new File([srtContent], "test.srt", {
        type: "text/plain",
      });

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.handleFileUpload(file);
      });

      expect(parseResult!.success).toBe(true);
      expect(parseResult!.captions).toBeDefined();
    });

    it("should reject non-SRT file extension", async () => {
      const { result } = renderHook(() => useCaptions());

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      await expect(
        act(async () => {
          await result.current.handleFileUpload(file);
        })
      ).rejects.toThrow("File must have .srt extension");
    });

    it("should reject files larger than 1MB", async () => {
      const { result } = renderHook(() => useCaptions());

      // Create a large buffer (> 1MB)
      const largeContent = "x".repeat(1024 * 1024 + 1);
      const file = new File([largeContent], "large.srt", {
        type: "text/plain",
      });

      await expect(
        act(async () => {
          await result.current.handleFileUpload(file);
        })
      ).rejects.toThrow("File size too large");
    });

    it("should throw error if no file provided", async () => {
      const { result } = renderHook(() => useCaptions());

      await expect(
        act(async () => {
          await result.current.handleFileUpload(null as any);
        })
      ).rejects.toThrow("No file provided");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", async () => {
      const { result } = renderHook(() => useCaptions());

      // First, set some state by parsing
      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Test`;

      await act(async () => {
        await result.current.parseSRT(srtContent);
      });

      expect(result.current.lastParseResult).toBeDefined();

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastParseResult).toBeNull();
    });

    it("should allow parsing after reset", async () => {
      const { result } = renderHook(() => useCaptions());

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Test`;

      // Parse, reset, parse again
      await act(async () => {
        await result.current.parseSRT(srtContent);
      });

      act(() => {
        result.current.reset();
      });

      let parseResult: ParseSRTResult | undefined;
      await act(async () => {
        parseResult = await result.current.parseSRT(srtContent);
      });

      expect(parseResult!.success).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should set error state for content that passes validation but fails parsing", async () => {
      const { result } = renderHook(() => useCaptions());

      // Content with proper structure but invalid data that will fail during parsing
      const invalidSRT = `1
00:00:01,000 --> 00:00:03,000

2
00:00:04,000 --> 00:00:06,000
`;

      let parseResult;
      await act(async () => {
        parseResult = await result.current.parseSRT(invalidSRT);
      });

      // This should fail because there's no text
      expect(parseResult!.success).toBe(false);
    });

   
  });
});
