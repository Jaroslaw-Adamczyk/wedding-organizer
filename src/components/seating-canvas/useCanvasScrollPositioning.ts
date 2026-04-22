import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

type ScrollPosition = { x: number; y: number };

export function useCanvasScrollPositioning(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  pendingScrollRef: RefObject<ScrollPosition | null>,
  canvasScale: number,
): void {
  const previousScaleRef = useRef(canvasScale);

  function getVisibleCanvasCenter(
    container: HTMLDivElement,
    scale: number,
  ): ScrollPosition {
    const viewportCenterX = container.scrollLeft + container.clientWidth / 2;
    const viewportCenterY = container.scrollTop + container.clientHeight / 2;
    return {
      x: viewportCenterX / scale,
      y: viewportCenterY / scale,
    };
  }

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
  }, [scrollContainerRef]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const previousScale = previousScaleRef.current;
    const pending = pendingScrollRef.current;

    if (pending) {
      container.scrollLeft = pending.x;
      container.scrollTop = pending.y;
      pendingScrollRef.current = null;
      previousScaleRef.current = canvasScale;
      return;
    }
    console.log("canvasScale", canvasScale);
    console.log("previousScale", previousScale);
    if (canvasScale !== previousScale) {
      const center = getVisibleCanvasCenter(container, previousScale);
      container.scrollLeft = center.x * canvasScale - container.clientWidth / 2;
      container.scrollTop = center.y * canvasScale - container.clientHeight / 2;
    }

    previousScaleRef.current = canvasScale;
  }, [canvasScale, pendingScrollRef, scrollContainerRef]);
}
