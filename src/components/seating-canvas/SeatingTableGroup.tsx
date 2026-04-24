import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import { Circle, Group, Rect, Text } from "react-konva";
import { materialColors } from "../../theme/colors";
import type { SeatingTable } from "../../types";
import { useSeating } from "./context/seating-context";
import { SeatGroup } from "./SeatGroup";
import { useRef } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import {
  clampTableDimension,
  getSeatPositions,
  getTableDimensions,
} from "./utils/buildTable";

type SeatingTableGroupProps = {
  table: SeatingTable;
  onTableShapeRef: (tableId: string, node: KonvaRect | null) => void;
};

export function SeatingTableGroup({
  table,
  onTableShapeRef,
}: SeatingTableGroupProps) {
  const { updateTable, setSelectedTableId, setSelectedSeat, selectedTableId } =
    useSeating();
  const previousPositionRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );

  const selected = table.id === selectedTableId;
  const seatPositions = getSeatPositions(table);
  const tableDims = getTableDimensions(table);

  function handleTableTransform(
    table: SeatingTable,
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

    updateTable(table.id, (current) => {
      if (current.shape === "round" || current.shape === "square") {
        const diameter = isResizing
          ? clampTableDimension(
              Math.max(node.width() * scaleX, node.height() * scaleY),
            )
          : current.width;
        return { ...current, width: diameter, height: diameter, rotation };
      }

      return {
        ...current,
        width: isResizing
          ? clampTableDimension(node.width() * scaleX)
          : current.width,
        height: isResizing
          ? clampTableDimension(node.height() * scaleY)
          : current.height,
        rotation,
      };
    });
  }

  function handleInlineTableRename(table: SeatingTable): void {
    const nextName = window.prompt("Rename table", table.name)?.trim();
    if (!nextName) return;
    updateTable(table.id, (current) => ({ ...current, name: nextName }));
  }

  function handleDragStart(table: SeatingTable): void {
    previousPositionRef.current[table.id] = { x: table.x, y: table.y };
  }

  function handleDragEnd(
    table: SeatingTable,
    event: KonvaEventObject<DragEvent>,
  ): void {
    const newPosition = event.target.position();
    const outOfCanvas =
      newPosition.x < 100 ||
      newPosition.y < 100 ||
      newPosition.x > CANVAS_WIDTH - 100 ||
      newPosition.y > CANVAS_HEIGHT - 100;

    if (outOfCanvas) {
      const previous = previousPositionRef.current[table.id] ?? {
        x: table.x,
        y: table.y,
      };
      event.target.position(previous);
      updateTable(table.id, (current) => ({ ...current, ...previous }));
      return;
    }

    updateTable(table.id, (current) => ({
      ...current,
      x: newPosition.x,
      y: newPosition.y,
    }));
  }

  return (
    <Group
      x={table.x}
      y={table.y}
      draggable
      onDragStart={() => handleDragStart(table)}
      onDragEnd={(event) => handleDragEnd(table, event)}
      onClick={() => {
        setSelectedTableId(table.id);
        setSelectedSeat(null);
      }}
    >
      <Group rotation={table.rotation}>
        {table.shape === "round" ? (
          <Circle
            radius={tableDims.width / 2}
            fill={
              selected
                ? materialColors.primaryContainer
                : materialColors.surfaceVariant
            }
            stroke={materialColors.outline}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.15}
            shadowOffsetX={2}
            shadowOffsetY={3}
          />
        ) : (
          <Rect
            x={-tableDims.width / 2}
            y={-tableDims.height / 2}
            width={tableDims.width}
            height={tableDims.height}
            cornerRadius={14}
            fill={
              selected
                ? materialColors.primaryContainer
                : materialColors.surfaceVariant
            }
            stroke={materialColors.outline}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.15}
            shadowOffsetX={2}
            shadowOffsetY={3}
          />
        )}

        {seatPositions.map((position, seatIndex) => {
          return (
            <SeatGroup
              key={`${table.id}-seat-${seatIndex}`}
              table={table}
              position={position}
              seatIndex={seatIndex}
            />
          );
        })}
      </Group>

      <Text
        text={table.name}
        x={-60}
        y={-10}
        width={120}
        align="center"
        fontStyle="bold"
        fill={materialColors.onSurface}
        onDblClick={() => handleInlineTableRename(table)}
      />

      <Rect
        ref={(node) => {
          onTableShapeRef(table.id, node);
        }}
        x={0}
        y={0}
        offsetX={tableDims.width / 2}
        offsetY={tableDims.height / 2}
        width={tableDims.width}
        height={tableDims.height}
        rotation={table.rotation}
        fillEnabled={false}
        strokeEnabled={false}
        onTransform={(event) => handleTableTransform(table, event)}
        onTransformEnd={(event) => handleTableTransform(table, event)}
      />
    </Group>
  );
}
