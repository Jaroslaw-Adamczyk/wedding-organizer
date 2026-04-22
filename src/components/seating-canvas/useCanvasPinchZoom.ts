import { useEffect, useRef } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  MAX_SCALE,
  MIN_SCALE,
  PINCH_SENSITIVITY,
  PINCH_THROTTLE_MS,
} from "./constants";

type ScrollPosition = { x: number; y: number };

export function useCanvasPinchZoom(params: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  canvasScaleRef: RefObject<number>;
  pendingScrollRef: RefObject<ScrollPosition | null>;
  setCanvasScale: Dispatch<SetStateAction<number>>;
}): void {
  const {
    scrollContainerRef,
    canvasScaleRef,
    pendingScrollRef,
    setCanvasScale,
  } = params;

  const pinchStateRef = useRef<{
    accumulatedDeltaY: number;
    pointerX: number;
    pointerY: number;
    timerId: number | null;
    lastFlushAt: number;
  }>({
    accumulatedDeltaY: 0,
    pointerX: 0,
    pointerY: 0,
    timerId: null,
    lastFlushAt: 0,
  });

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const state = pinchStateRef.current;

    function flushPinch(): void {
      state.timerId = null;
      state.lastFlushAt = performance.now();

      const container = scrollContainerRef.current;
      if (!container) {
        state.accumulatedDeltaY = 0;
        return;
      }

      const deltaY = state.accumulatedDeltaY;
      state.accumulatedDeltaY = 0;
      if (deltaY === 0) return;

      const currentScale = canvasScaleRef.current;
      const zoomFactor = Math.exp(-deltaY * PINCH_SENSITIVITY);
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, currentScale * zoomFactor),
      );
      if (nextScale === currentScale) return;

      const rect = container.getBoundingClientRect();
      const pointerX = state.pointerX - rect.left;
      const pointerY = state.pointerY - rect.top;
      const contentX = container.scrollLeft + pointerX;
      const contentY = container.scrollTop + pointerY;
      const ratio = nextScale / currentScale;

      canvasScaleRef.current = nextScale;
      pendingScrollRef.current = {
        x: contentX * ratio - pointerX,
        y: contentY * ratio - pointerY,
      };
      setCanvasScale(nextScale);
    }

    function scheduleFlush(): void {
      if (state.timerId !== null) return;
      const elapsed = performance.now() - state.lastFlushAt;
      const wait = Math.max(0, PINCH_THROTTLE_MS - elapsed);
      state.timerId = window.setTimeout(flushPinch, wait);
    }

    function handleWheel(event: WheelEvent): void {
      if (!event.ctrlKey) return;
      event.preventDefault();

      state.accumulatedDeltaY += event.deltaY;
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      scheduleFlush();
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (state.timerId !== null) {
        clearTimeout(state.timerId);
        state.timerId = null;
      }
      state.accumulatedDeltaY = 0;
    };
  }, [
    canvasScaleRef,
    pendingScrollRef,
    pinchStateRef,
    scrollContainerRef,
    setCanvasScale,
  ]);
}
