import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { guests as initialGuests } from "../../../data/guests";
import type {
  CanvasShape,
  CanvasShapeKind,
  Guest,
  HoverTooltip,
  SeatingTable,
  SelectedSeat,
  SeatPopover,
} from "../../../types";

const NEW_TABLE_BASE_X = CANVAS_WIDTH / 2;
const NEW_TABLE_BASE_Y = CANVAS_HEIGHT / 2;
const STACK_OFFSET = 30;
const STACK_WRAP = 300;
import { SeatingContext, type SeatingContextValue } from "./seating-context";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_CIRCLE_SHAPE_DIAMETER,
  DEFAULT_RECT_SHAPE,
  DEFAULT_TABLE_SEATS,
  DEFAULT_TABLE_SHAPE,
} from "../constants";
import {
  buildTable,
  clampSeatCount,
  createInitialTables,
} from "../utils/buildTable";

export function SeatingProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [tables, setTables] = useState<SeatingTable[]>(createInitialTables);
  const [canvasShapes, setCanvasShapes] = useState<CanvasShape[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    "table-1",
  );
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip>(null);
  const [activeSeatPopover, setActiveSeatPopover] = useState<SeatPopover>(null);
  const [tableCounter, setTableCounter] = useState(1);
  const [shapeCounter, setShapeCounter] = useState(1);
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
      setSelectedShapeId(null);
      setSelectedSeat(null);
      setTableCounter((value) => value + 1);
      return [...prev, newTable];
    });
  }, [tableCounter]);

  const addCanvasShape = useCallback(
    (kind: CanvasShapeKind): void => {
      setCanvasShapes((prev) => {
        const stagger = ((shapeCounter - 1) * STACK_OFFSET) % STACK_WRAP;
        const newId = `shape-${shapeCounter}`;
        const base = {
          id: newId,
          kind,
          x: NEW_TABLE_BASE_X + stagger,
          y: NEW_TABLE_BASE_Y + stagger,
          rotation: 0,
        } as const;
        const newShape: CanvasShape =
          kind === "circle"
            ? {
                ...base,
                width: DEFAULT_CIRCLE_SHAPE_DIAMETER,
                height: DEFAULT_CIRCLE_SHAPE_DIAMETER,
              }
            : {
                ...base,
                width: DEFAULT_RECT_SHAPE.width,
                height: DEFAULT_RECT_SHAPE.height,
              };

        setSelectedShapeId(newId);
        setSelectedTableId(null);
        setSelectedSeat(null);
        setShapeCounter((value) => value + 1);
        return [...prev, newShape];
      });
    },
    [shapeCounter],
  );

  const updateCanvasShape = useCallback(
    (shapeId: string, updater: (shape: CanvasShape) => CanvasShape): void => {
      setCanvasShapes((prev) =>
        prev.map((shape) => (shape.id === shapeId ? updater(shape) : shape)),
      );
    },
    [],
  );

  const deleteCanvasShape = useCallback((shapeId: string): void => {
    setCanvasShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
    setSelectedShapeId((prevSelected) =>
      prevSelected === shapeId ? null : prevSelected,
    );
  }, []);

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
        setSelectedShapeId(null);
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
  const selectedShapeIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedTableRef.current = selectedTable;
  }, [selectedTable]);
  useEffect(() => {
    selectedShapeIdRef.current = selectedShapeId;
  }, [selectedShapeId]);

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
        setSelectedShapeId(null);
        setSelectedSeat(null);
        event.preventDefault();
        return;
      }

      if (lowerKey === "backspace" || key === "Delete") {
        const shapeId = selectedShapeIdRef.current;
        if (shapeId) {
          deleteCanvasShape(shapeId);
          event.preventDefault();
          return;
        }
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
          const step = event.shiftKey ? 20 : 5;
          const shapeId = selectedShapeIdRef.current;
          if (shapeId) {
            updateCanvasShape(shapeId, (s) => ({
              ...s,
              x: s.x + dx * step,
              y: s.y + dy * step,
            }));
            event.preventDefault();
            return;
          }
          if (!current) return;
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
  }, [
    duplicateTable,
    deleteTable,
    deleteCanvasShape,
    updateTable,
    updateCanvasShape,
  ]);

  const value = useMemo<SeatingContextValue>(
    () => ({
      guests,
      tables,
      canvasShapes,
      selectedTableId,
      selectedShapeId,
      selectedSeat,
      hoverTooltip,
      canvasScale,
      selectedTable,
      assignedGuestIds,
      guestLookup,
      setSelectedTableId,
      setSelectedShapeId,
      setSelectedSeat,
      setHoverTooltip,
      activeSeatPopover,
      setActiveSeatPopover,
      setCanvasScale,
      updateTable,
      addTable,
      addCanvasShape,
      updateCanvasShape,
      deleteCanvasShape,
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
      canvasShapes,
      selectedTableId,
      selectedShapeId,
      selectedSeat,
      hoverTooltip,
      activeSeatPopover,
      canvasScale,
      selectedTable,
      assignedGuestIds,
      guestLookup,
      updateTable,
      addTable,
      addCanvasShape,
      updateCanvasShape,
      deleteCanvasShape,
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
