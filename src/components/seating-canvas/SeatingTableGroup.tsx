import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import { Circle, Group, Rect, Text } from "react-konva";
import { materialColors } from "../../theme/colors";
import type { Guest, SeatingTable, SelectedSeat } from "../../types";
import {
  getInitials,
  getSeatPositions,
  getTableDimensions,
} from "../../utils/seating";

type SeatingTableGroupProps = {
  table: SeatingTable;
  selectedTableId: string | null;
  selectedSeat: SelectedSeat | null;
  guestLookup: Record<string, Guest>;
  onTableShapeRef: (tableId: string, node: KonvaRect | null) => void;
  onDragStart: (table: SeatingTable) => void;
  onDragEnd: (table: SeatingTable, event: KonvaEventObject<DragEvent>) => void;
  onSelectTable: (tableId: string) => void;
  onSelectSeat: (tableId: string, seatIndex: number) => void;
  onTableTransform: (
    table: SeatingTable,
    event: KonvaEventObject<Event>,
  ) => void;
  onInlineRename: (table: SeatingTable) => void;
  onSeatHover: (event: KonvaEventObject<MouseEvent>, text: string) => void;
  onSeatLeave: () => void;
};

export function SeatingTableGroup({
  table,
  selectedTableId,
  selectedSeat,
  guestLookup,
  onTableShapeRef,
  onDragStart,
  onDragEnd,
  onSelectTable,
  onSelectSeat,
  onTableTransform,
  onInlineRename,
  onSeatHover,
  onSeatLeave,
}: SeatingTableGroupProps) {
  const selected = table.id === selectedTableId;
  const seatPositions = getSeatPositions(table);
  const tableDims = getTableDimensions(table);

  return (
    <Group
      x={table.x}
      y={table.y}
      draggable
      onDragStart={() => onDragStart(table)}
      onDragEnd={(event) => onDragEnd(table, event)}
      onClick={() => onSelectTable(table.id)}
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
          />
        )}

        {seatPositions.map((position, seatIndex) => {
          const guestId = table.seats[seatIndex];
          const guest = guestId ? guestLookup[guestId] : undefined;
          const initials = guest ? getInitials(guest) : `S${seatIndex + 1}`;
          const isSeatSelected =
            selectedSeat?.tableId === table.id &&
            selectedSeat.seatIndex === seatIndex;

          return (
            <Group
              key={`${table.id}-seat-${seatIndex}`}
              x={position.x}
              y={position.y}
              onMouseEnter={(event) => {
                if (!guest) return;
                onSeatHover(event, `${guest.name} ${guest.surname}`);
              }}
              onMouseLeave={onSeatLeave}
              onClick={(event) => {
                event.cancelBubble = true;
                onSelectSeat(table.id, seatIndex);
              }}
            >
              <Circle
                radius={20}
                fill={
                  guest
                    ? materialColors.secondaryContainer
                    : materialColors.surface
                }
                stroke={
                  isSeatSelected
                    ? materialColors.primary
                    : materialColors.outline
                }
                strokeWidth={isSeatSelected ? 3 : 1}
              />
              <Group rotation={-table.rotation}>
                <Text
                  text={initials}
                  x={-18}
                  y={-7}
                  width={36}
                  align="center"
                  fontSize={11}
                  fill={
                    guest
                      ? materialColors.onSecondaryContainer
                      : materialColors.onSurfaceVariant
                  }
                />
              </Group>
            </Group>
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
        onDblClick={() => onInlineRename(table)}
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
        onTransform={(event) => onTableTransform(table, event)}
        onTransformEnd={(event) => onTableTransform(table, event)}
      />
    </Group>
  );
}
