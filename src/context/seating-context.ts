import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Guest, HoverTooltip, SeatingTable, SelectedSeat } from "../types";

export type SeatingContextValue = {
  guests: Guest[];
  tables: SeatingTable[];
  selectedTableId: string | null;
  selectedSeat: SelectedSeat | null;
  hoverTooltip: HoverTooltip;
  canvasScale: number;
  selectedTable: SeatingTable | null;
  assignedGuestIds: Set<string>;
  guestLookup: Record<string, Guest>;
  setSelectedTableId: Dispatch<SetStateAction<string | null>>;
  setSelectedSeat: Dispatch<SetStateAction<SelectedSeat | null>>;
  setHoverTooltip: Dispatch<SetStateAction<HoverTooltip>>;
  setCanvasScale: Dispatch<SetStateAction<number>>;
  updateTable: (
    tableId: string,
    updater: (table: SeatingTable) => SeatingTable,
  ) => void;
  addTable: () => void;
  duplicateTable: (
    table: SeatingTable,
    offset?: { dx: number; dy: number },
  ) => void;
  deleteTable: (tableId: string) => void;
  resizeTableSeats: (tableId: string, nextSeatCount: number) => void;
  assignGuestToSeat: (
    tableId: string,
    seatIndex: number,
    guestId: string | null,
  ) => void;
  revokeGuestFromAnySeat: (guestId: string) => void;
  importGuests: (nextGuests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  removeGuest: (guestId: string) => void;
};

export const SeatingContext = createContext<SeatingContextValue | null>(null);

export function useSeating(): SeatingContextValue {
  const ctx = useContext(SeatingContext);
  if (!ctx) {
    throw new Error("useSeating must be used within a SeatingProvider");
  }
  return ctx;
}
