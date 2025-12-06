import { renderHook } from "@testing-library/react";
import { useTimelineHistory } from "app/reactvideoeditor/pro/components/advanced-timeline/hooks/use-timeline-history";
import { TimelineTrack } from "app/reactvideoeditor/pro/components/advanced-timeline/types";

describe("useTimelineHistory", () => {
  it("should return undo, redo, and clear functions", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(typeof result.current.undo).toBe("function");
    expect(typeof result.current.redo).toBe("function");
    expect(typeof result.current.clearHistory).toBe("function");
    expect(typeof result.current.startBatch).toBe("function");
    expect(typeof result.current.commitBatch).toBe("function");
  });

  it("should return canUndo and canRedo flags", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(typeof result.current.canUndo).toBe("boolean");
    expect(typeof result.current.canRedo).toBe("boolean");
  });

  it("should not crash when calling undo with no history", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(() => result.current.undo()).not.toThrow();
  });

  it("should not crash when calling redo with no history", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(() => result.current.redo()).not.toThrow();
  });

  it("should not crash when calling clearHistory", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(() => result.current.clearHistory()).not.toThrow();
  });

  it("should not crash when calling startBatch", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(() => result.current.startBatch()).not.toThrow();
  });

  it("should not crash when calling commitBatch", () => {
    const tracks: TimelineTrack[] = [];
    const setTracks = jest.fn();

    const { result } = renderHook(() =>
      useTimelineHistory(tracks, setTracks)
    );

    expect(() => result.current.commitBatch()).not.toThrow();
  });
});
