import type { Guest, SeatingTable, TableShape } from "../types";

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

export function buildTable(
  id: string,
  name: string,
  shape: TableShape,
  seatCount: number,
  x: number,
  y: number,
): SeatingTable {
  const baseDimensions = TABLE_DIMENSIONS[shape];
  return {
    id,
    name,
    shape,
    seatCount,
    rectangleActiveSides: 4,
    width: baseDimensions.width,
    height: baseDimensions.height,
    x,
    y,
    rotation: 0,
    seats: new Array(seatCount).fill(null),
  };
}

export function createInitialTables(): SeatingTable[] {
  return [
    buildTable(
      "table-1",
      "Table 1",
      DEFAULT_TABLE_SHAPE,
      DEFAULT_TABLE_SEATS,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
    ),
  ];
}

export function getInitials(guest: Pick<Guest, "name" | "surname">): string {
  return `${guest.name?.charAt(0) ?? ""}${guest.surname?.charAt(0) ?? ""}`.toUpperCase();
}

export function clampSeatCount(value: number): number {
  if (value < 0) return 0;
  return Math.floor(value);
}

export function clampTableDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_TABLE_DIMENSION;
  return Math.max(MIN_TABLE_DIMENSION, Math.floor(value));
}

export function getTableDimensions(table: SeatingTable): {
  width: number;
  height: number;
} {
  if (table.shape === "round") {
    const diameter = Math.max(table.width, table.height);
    return { width: diameter, height: diameter };
  }
  return { width: table.width, height: table.height };
}

export function getSeatPositions(
  table: SeatingTable,
): { x: number; y: number }[] {
  const dimensions = getTableDimensions(table);

  if (table.shape === "round") {
    const radius = dimensions.width / 2 + 31;
    return table.seats.map((_, index) => {
      const angle = (Math.PI * 2 * index) / table.seatCount - Math.PI / 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }

  const width = dimensions.width;
  const height = dimensions.height;
  const activeSides =
    table.rectangleActiveSides === 4
      ? [0, 1, 2, 3]
      : table.rectangleActiveSides === 2
        ? [0, 2]
        : [0];
  const seatsPerSide = [0, 0, 0, 0];

  for (let index = 0; index < table.seatCount; index += 1) {
    const side = activeSides[index % activeSides.length];
    seatsPerSide[side] += 1;
  }

  return table.seats.map((_, index) => {
    const side = activeSides[index % activeSides.length];
    const orderOnSide = Math.floor(index / activeSides.length);
    const countOnThisSide = seatsPerSide[side];
    const spacing = (orderOnSide + 1) / (countOnThisSide + 1);

    if (side === 0)
      return { x: -width / 2 + spacing * width, y: -height / 2 - 35 };
    if (side === 1)
      return { x: width / 2 + 35, y: -height / 2 + spacing * height };
    if (side === 2)
      return { x: width / 2 - spacing * width, y: height / 2 + 35 };
    return { x: -width / 2 - 35, y: height / 2 - spacing * height };
  });
}
