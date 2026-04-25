import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import { useRef } from "react";
import { Circle, Group, Rect } from "react-konva";
import { materialColors } from "../../theme/colors";
import type { CanvasShape } from "../../types";
import { useSeating } from "./context/seating-context";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { clampShapeDimension } from "./utils/canvasShape";

type CanvasShapeGroupProps = {
  shape: CanvasShape;
  onShapeTransformRef: (shapeId: string, node: KonvaRect | null) => void;
};

export function CanvasShapeGroup({
  shape,
  onShapeTransformRef,
}: CanvasShapeGroupProps) {
  const {
    updateCanvasShape,
    setSelectedTableId,
    setSelectedShapeId,
    setSelectedSeat,
    selectedShapeId,
  } = useSeating();
  const previousPositionRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );

  const selected = shape.id === selectedShapeId;
  const w = shape.width;
  const h = shape.kind === "circle" ? shape.width : shape.height;

  function handleTransform(
    s: CanvasShape,
    event: KonvaEventObject<Event>,
  ): void {
    const node = event.target;
    const scaleX = Math.abs(node.scaleX());
    const scaleY = Math.abs(node.scaleY());
    const rotation = node.rotation();

    node.scaleX(1);
    node.scaleY(1);
    node.x(0);
    node.y(0);

    const isResizing =
      Math.abs(scaleX - 1) > 0.01 || Math.abs(scaleY - 1) > 0.01;

    updateCanvasShape(s.id, (current) => {
      if (current.kind === "circle") {
        const diameter = isResizing
          ? clampShapeDimension(
              Math.max(node.width() * scaleX, node.height() * scaleY),
            )
          : current.width;
        return { ...current, width: diameter, height: diameter, rotation };
      }

      return {
        ...current,
        width: isResizing
          ? clampShapeDimension(node.width() * scaleX)
          : current.width,
        height: isResizing
          ? clampShapeDimension(node.height() * scaleY)
          : current.height,
        rotation,
      };
    });
  }

  function handleDragStart(s: CanvasShape): void {
    previousPositionRef.current[s.id] = { x: s.x, y: s.y };
  }

  function handleDragEnd(
    s: CanvasShape,
    event: KonvaEventObject<DragEvent>,
  ): void {
    const newPosition = event.target.position();
    const outOfCanvas =
      newPosition.x < 100 ||
      newPosition.y < 100 ||
      newPosition.x > CANVAS_WIDTH - 100 ||
      newPosition.y > CANVAS_HEIGHT - 100;

    if (outOfCanvas) {
      const previous = previousPositionRef.current[s.id] ?? {
        x: s.x,
        y: s.y,
      };
      event.target.position(previous);
      updateCanvasShape(s.id, (current) => ({ ...current, ...previous }));
      return;
    }

    updateCanvasShape(s.id, (current) => ({
      ...current,
      x: newPosition.x,
      y: newPosition.y,
    }));
  }

  return (
    <Group
      x={shape.x}
      y={shape.y}
      draggable
      onDragStart={() => handleDragStart(shape)}
      onDragEnd={(event) => handleDragEnd(shape, event)}
      onClick={() => {
        setSelectedShapeId(shape.id);
        setSelectedTableId(null);
        setSelectedSeat(null);
      }}
    >
      <Group rotation={shape.rotation}>
        {shape.kind === "circle" ? (
          <Circle
            radius={w / 2}
            fill={
              selected
                ? materialColors.primaryContainer
                : materialColors.surfaceContainer
            }
            stroke={materialColors.outline}
            strokeWidth={1}
            opacity={0.92}
          />
        ) : (
          <Rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            cornerRadius={4}
            fill={
              selected
                ? materialColors.primaryContainer
                : materialColors.surfaceContainer
            }
            stroke={materialColors.outline}
            strokeWidth={1}
            opacity={0.92}
          />
        )}
      </Group>

      <Rect
        ref={(node) => {
          onShapeTransformRef(shape.id, node);
        }}
        x={0}
        y={0}
        offsetX={w / 2}
        offsetY={h / 2}
        width={w}
        height={h}
        rotation={shape.rotation}
        fillEnabled={false}
        strokeEnabled={false}
        onTransform={(event) => handleTransform(shape, event)}
        onTransformEnd={(event) => handleTransform(shape, event)}
      />
    </Group>
  );
}
