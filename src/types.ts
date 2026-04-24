export type TableShape = "round" | "rectangle" | "square";

export type Guest = {
  id: string;
  name: string | null;
  surname: string | null;
};

export type SeatingTable = {
  id: string;
  name: string;
  shape: TableShape;
  seatCount: number;
  rectangleActiveSides: 1 | 2 | 4;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  seats: (string | null)[];
};

export type SelectedSeat = {
  tableId: string;
  seatIndex: number;
};

export type HoverTooltip = {
  x: number;
  y: number;
  text: string;
} | null;

export type SeatPopover = {
  tableId: string;
  seatIndex: number;
  x: number;
  y: number;
} | null;
