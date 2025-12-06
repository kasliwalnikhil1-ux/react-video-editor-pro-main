import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ZOOM_CONSTRAINTS } from "../constants";

export type ZoomState = {
  scale: number;
  scroll: number;
};

interface ZoomStore {
  zoomState: ZoomState;
  timelineRef: React.RefObject<HTMLDivElement | null> | null;
  setZoomState: (zoomState: ZoomState) => void;
  setTimelineRef: (timelineRef: React.RefObject<HTMLDivElement | null>) => void;
}

const useZoomStore = create<ZoomStore>()(
  persist(
    (set) => ({
      zoomState: {
        scale: ZOOM_CONSTRAINTS.default,
        scroll: 0,
      },
      timelineRef: null,
      setZoomState: (zoomState: ZoomState) => {
        set({ zoomState });
      },
      setTimelineRef: (timelineRef: React.RefObject<HTMLDivElement | null>) => {
        set({ timelineRef });
      },
    }),
    {
      name: "advanced-timeline-zoom-store",
      partialize: (state) => ({ zoomState: state.zoomState }),
    }
  )
);

export default useZoomStore;