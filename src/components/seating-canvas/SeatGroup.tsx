import type { KonvaEventObject } from "konva/lib/Node";
import { Circle, Group, Text } from "react-konva";
import { useSeating } from "./context/seating-context";
import { materialColors } from "../../theme/colors";
import type { SeatingTable } from "../../types";
import { getInitials } from "../../utils/getInitials";

type SeatGroupProps = {
  table: SeatingTable;
  position: { x: number; y: number };
  seatIndex: number;
};

export function SeatGroup({ table, position, seatIndex }: SeatGroupProps) {
  const {
    setHoverTooltip,
    setSelectedTableId,
    setSelectedSeat,
    guestLookup,
    selectedSeat,
  } = useSeating();

  const guestId = table.seats[seatIndex];
  const guest = guestId ? guestLookup[guestId] : undefined;
  const initials = guest ? getInitials(guest) : `S${seatIndex + 1}`;
  const isSeatSelected =
    selectedSeat?.tableId === table.id && selectedSeat.seatIndex === seatIndex;

  function handleSeatHover(
    event: KonvaEventObject<MouseEvent>,
    text: string,
  ): void {
    const seatNode = event.currentTarget;
    const stage = seatNode.getStage();
    if (!stage) {
      setHoverTooltip({ x: event.evt.clientX, y: event.evt.clientY, text });
      return;
    }
    const box = seatNode.getClientRect();
    const scale = stage.scaleX();
    const { left, top } = stage.container().getBoundingClientRect();
    const xPos = left + (box.x + box.width / 2) * scale;
    const yPos = top + box.y * scale;
    setHoverTooltip({ x: xPos, y: yPos, text });
  }

  function handleSeatDoubleClick(seatIndex: number): void {
    console.log("seat double clicked", seatIndex);
  }

  return (
    <Group
      x={position.x}
      y={position.y}
      onMouseEnter={(event) => {
        if (!guest) return;
        handleSeatHover(event, `${guest.name} ${guest.surname}`);
      }}
      onMouseLeave={() => setHoverTooltip(null)}
      onClick={(event) => {
        event.cancelBubble = true;
        setSelectedTableId(table.id);
        setSelectedSeat({ tableId: table.id, seatIndex });
      }}
    >
      <Circle
        radius={20}
        fill={
          guest ? materialColors.secondaryContainer : materialColors.surface
        }
        stroke={
          isSeatSelected ? materialColors.primary : materialColors.outline
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
          onDblClick={() => handleSeatDoubleClick(seatIndex)}
        />
      </Group>
    </Group>
  );
}
