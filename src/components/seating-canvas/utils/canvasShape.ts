import { MIN_CANVAS_SHAPE_DIMENSION } from "../constants";

export function clampShapeDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_CANVAS_SHAPE_DIMENSION;
  return Math.max(MIN_CANVAS_SHAPE_DIMENSION, value);
}
