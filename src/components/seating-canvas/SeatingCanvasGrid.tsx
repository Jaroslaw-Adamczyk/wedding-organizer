import { Line } from "react-konva";
import { materialColors } from "../../theme/colors";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

const GRID_STEP = 40;

export function SeatingCanvasGrid() {
  return (
    <>
      {Array.from(
        { length: Math.floor(CANVAS_WIDTH / GRID_STEP) + 1 },
        (_, i) => (
          <Line
            key={`vgrid-${i}`}
            points={[i * GRID_STEP, 0, i * GRID_STEP, CANVAS_HEIGHT]}
            stroke={materialColors.outlineVariant}
            strokeWidth={0.5}
            opacity={0.35}
            listening={false}
          />
        ),
      )}
      {Array.from(
        { length: Math.floor(CANVAS_HEIGHT / GRID_STEP) + 1 },
        (_, i) => (
          <Line
            key={`hgrid-${i}`}
            points={[0, i * GRID_STEP, CANVAS_WIDTH, i * GRID_STEP]}
            stroke={materialColors.outlineVariant}
            strokeWidth={0.5}
            opacity={0.35}
            listening={false}
          />
        ),
      )}
    </>
  );
}
