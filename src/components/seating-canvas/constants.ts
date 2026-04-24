import type { TableShape } from "../../types";

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2;
export const PINCH_SENSITIVITY = 0.01;
export const PINCH_THROTTLE_MS = 20;
export const CANVAS_WIDTH = 3840;
export const CANVAS_HEIGHT = 2000;
export const DEFAULT_TABLE_SHAPE: TableShape = "round";
export const DEFAULT_TABLE_SEATS = 10;
export const MIN_TABLE_DIMENSION = 60;

export const TABLE_DIMENSIONS: Record<
  TableShape,
  { width: number; height: number }
> = {
  round: { width: 130, height: 130 },
  rectangle: { width: 180, height: 100 },
  square: { width: 180, height: 180 },
};
