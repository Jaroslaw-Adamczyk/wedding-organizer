import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { guests as initialGuests } from "../data/guests";
import type { Guest, HoverTooltip, SeatingTable, SelectedSeat } from "../types";
import {
  buildTable,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampSeatCount,
  createInitialTables,
  DEFAULT_TABLE_SEATS,
  DEFAULT_TABLE_SHAPE,
} from "../utils/seating";

const NEW_TABLE_BASE_X = CANVAS_WIDTH / 2;
const NEW_TABLE_BASE_Y = CANVAS_HEIGHT / 2;
const STACK_OFFSET = 30;
const STACK_WRAP = 300;
import { SeatingContext, type SeatingContextValue } from "./seating-context";

export function SeatingProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [tables, setTables] = useState<SeatingTable[]>(createInitialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    "table-1",
  );
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip>(null);
  const [tableCounter, setTableCounter] = useState(2);
  const [canvasScale, setCanvasScale] = useState(1);

  const copiedTableRef = useRef<SeatingTable | null>(null);
  const pasteCountRef = useRef(0);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const guestLookup = useMemo(
    () =>
      guests.reduce<Record<string, Guest>>(
        (acc, guest) => ({ ...acc, [guest.id]: guest }),
        {},
      ),
    [guests],
  );

  const assignedGuestIds = useMemo(
    () =>
      new Set(
        tables
          .flatMap((table) => table.seats)
          .filter((guestId): guestId is string => guestId !== null),
      ),
    [tables],
  );

  const updateTable = useCallback(
    (tableId: string, updater: (table: SeatingTable) => SeatingTable): void => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableId ? updater(table) : table,
        ),
      );
    },
    [],
  );

  const addTable = useCallback((): void => {
    setTables((prev) => {
      const stagger = ((tableCounter - 1) * STACK_OFFSET) % STACK_WRAP;
      const newId = `table-${tableCounter}`;
      const newTable = buildTable(
        newId,
        `Table ${tableCounter}`,
        DEFAULT_TABLE_SHAPE,
        DEFAULT_TABLE_SEATS,
        NEW_TABLE_BASE_X + stagger,
        NEW_TABLE_BASE_Y + stagger,
      );

      setSelectedTableId(newId);
      setSelectedSeat(null);
      setTableCounter((value) => value + 1);
      return [...prev, newTable];
    });
  }, [tableCounter]);

  const duplicateTable = useCallback(
    (
      table: SeatingTable,
      offset: { dx: number; dy: number } = {
        dx: STACK_OFFSET,
        dy: STACK_OFFSET,
      },
    ): void => {
      setTables((prev) => {
        const newId = `table-${tableCounter}`;
        const copy = buildTable(
          newId,
          `Table ${tableCounter}`,
          table.shape,
          table.seatCount,
          table.x + offset.dx,
          table.y + offset.dy,
        );
        copy.rectangleActiveSides = table.rectangleActiveSides;
        copy.width = table.width;
        copy.height = table.height;

        setSelectedTableId(newId);
        setSelectedSeat(null);
        setTableCounter((value) => value + 1);
        return [...prev, copy];
      });
    },
    [tableCounter],
  );

  const deleteTable = useCallback((tableId: string): void => {
    setTables((prev) => prev.filter((table) => table.id !== tableId));
    setSelectedTableId((prevSelected) => {
      if (prevSelected !== tableId) return prevSelected;
      setSelectedSeat(null);
      return null;
    });
  }, []);

  const resizeTableSeats = useCallback(
    (tableId: string, nextSeatCount: number): void => {
      const safeCount = clampSeatCount(nextSeatCount);
      updateTable(tableId, (table) => {
        const nextSeats = new Array<string | null>(safeCount).fill(null);
        for (let i = 0; i < Math.min(table.seats.length, safeCount); i += 1) {
          nextSeats[i] = table.seats[i];
        }
        return {
          ...table,
          seatCount: safeCount,
          seats: nextSeats,
        };
      });

      setSelectedSeat((prev) =>
        prev?.tableId === tableId && prev.seatIndex >= safeCount ? null : prev,
      );
    },
    [updateTable],
  );

  const assignGuestToSeat = useCallback(
    (
      targetTableId: string,
      seatIndex: number,
      guestId: string | null,
    ): void => {
      setTables((prevTables) => {
        const tablesWithoutGuest = prevTables.map((table) => ({
          ...table,
          seats: table.seats.map((value) => (value === guestId ? null : value)),
        }));

        return tablesWithoutGuest.map((table) => {
          if (table.id !== targetTableId) {
            return table;
          }
          const nextSeats = [...table.seats];
          nextSeats[seatIndex] = guestId;
          return { ...table, seats: nextSeats };
        });
      });
    },
    [],
  );

  const revokeGuestFromAnySeat = useCallback((guestId: string): void => {
    setTables((prevTables) =>
      prevTables.map((table) => ({
        ...table,
        seats: table.seats.map((value) => (value === guestId ? null : value)),
      })),
    );
  }, []);

  const importGuests = useCallback((nextGuests: Guest[]): void => {
    const nextGuestIds = new Set(nextGuests.map((guest) => guest.id));

    setGuests(nextGuests);
    setTables((prevTables) =>
      prevTables.map((table) => ({
        ...table,
        seats: table.seats.map((guestId) =>
          guestId !== null && nextGuestIds.has(guestId) ? guestId : null,
        ),
      })),
    );
  }, []);

  const addGuest = useCallback((guest: Guest): void => {
    setGuests((prevGuests) => [...prevGuests, guest]);
  }, []);
  const removeGuest = useCallback((guestId: string): void => {
    setGuests((prevGuests) =>
      prevGuests.filter((guest) => guest.id !== guestId),
    );
  }, []);

  const selectedTableRef = useRef<SeatingTable | null>(null);
  useEffect(() => {
    selectedTableRef.current = selectedTable;
  }, [selectedTable]);

  useEffect(() => {
    function handleTableShortcuts(event: KeyboardEvent): void {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable === true;
      if (isTypingTarget) return;

      const key = event.key;
      const lowerKey = key.toLowerCase();
      const usingModifier = event.ctrlKey || event.metaKey;
      const current = selectedTableRef.current;

      if (key === "Escape") {
        setSelectedTableId(null);
        setSelectedSeat(null);
        event.preventDefault();
        return;
      }

      if (lowerKey === "backspace" || key === "Delete") {
        if (!current) return;
        deleteTable(current.id);
        event.preventDefault();
        return;
      }

      if (!usingModifier) {
        let dx = 0;
        let dy = 0;
        if (key === "ArrowUp") dy = -1;
        else if (key === "ArrowDown") dy = 1;
        else if (key === "ArrowLeft") dx = -1;
        else if (key === "ArrowRight") dx = 1;

        if (dx !== 0 || dy !== 0) {
          if (!current) return;
          const step = event.shiftKey ? 20 : 5;
          updateTable(current.id, (table) => ({
            ...table,
            x: table.x + dx * step,
            y: table.y + dy * step,
          }));
          event.preventDefault();
          return;
        }
      }

      if (!usingModifier) return;

      if (lowerKey === "c") {
        if (!current) return;
        copiedTableRef.current = current;
        pasteCountRef.current = 0;
        event.preventDefault();
        return;
      }

      if (lowerKey === "v" || lowerKey === "d") {
        const clipboard = copiedTableRef.current;
        if (clipboard) {
          pasteCountRef.current += 1;
          const distance = pasteCountRef.current * STACK_OFFSET;
          duplicateTable(clipboard, { dx: distance, dy: distance });
          event.preventDefault();
          return;
        }
        if (!current) return;
        duplicateTable(current);
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", handleTableShortcuts);
    return () => window.removeEventListener("keydown", handleTableShortcuts);
  }, [duplicateTable, deleteTable, updateTable]);

  const value = useMemo<SeatingContextValue>(
    () => ({
      guests,
      tables,
      selectedTableId,
      selectedSeat,
      hoverTooltip,
      canvasScale,
      selectedTable,
      assignedGuestIds,
      guestLookup,
      setSelectedTableId,
      setSelectedSeat,
      setHoverTooltip,
      setCanvasScale,
      updateTable,
      addTable,
      duplicateTable,
      deleteTable,
      resizeTableSeats,
      assignGuestToSeat,
      revokeGuestFromAnySeat,
      importGuests,
      addGuest,
      removeGuest,
    }),
    [
      guests,
      tables,
      selectedTableId,
      selectedSeat,
      hoverTooltip,
      canvasScale,
      selectedTable,
      assignedGuestIds,
      guestLookup,
      updateTable,
      addTable,
      duplicateTable,
      deleteTable,
      resizeTableSeats,
      assignGuestToSeat,
      revokeGuestFromAnySeat,
      importGuests,
      addGuest,
      removeGuest,
    ],
  );

  return (
    <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>
  );
}
