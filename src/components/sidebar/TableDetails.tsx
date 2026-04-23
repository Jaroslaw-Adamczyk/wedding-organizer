import { useState } from "react";
import { useSeating } from "../../context/seating-context";
import type { TableShape } from "../../types";
import { Button } from "../ui/button";
import { Select, type SelectOption } from "../ui/select";

const inputClass =
  "rounded-lg border border-outline bg-surface px-2 py-1.5 text-on-surface outline-none focus:border-primary";

const labelClass = "grid gap-1 text-sm text-on-surface-variant";

const SHAPE_OPTIONS = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "rectangle", label: "Rectangle" },
] as const satisfies ReadonlyArray<SelectOption<TableShape>>;

type ActiveSidesKey = "1" | "2" | "4";

const ACTIVE_SIDES_OPTIONS = [
  { value: "4", label: "4 sides" },
  { value: "2", label: "2 sides (top & bottom)" },
  { value: "1", label: "1 side (top only)" },
] as const satisfies ReadonlyArray<SelectOption<ActiveSidesKey>>;

const ACTIVE_SIDES_TO_NUMBER = {
  "1": 1,
  "2": 2,
  "4": 4,
} as const satisfies Record<ActiveSidesKey, 1 | 2 | 4>;

const ACTIVE_SIDES_TO_STRING = {
  1: "1",
  2: "2",
  4: "4",
} as const satisfies Record<1 | 2 | 4, ActiveSidesKey>;

export function TableDetails() {
  const {
    selectedTable,
    updateTable,
    addTable,
    duplicateTable,
    deleteTable,
    resizeTableSeats,
  } = useSeating();

  const selectedTableId = selectedTable?.id ?? null;
  const [seatCountInput, setSeatCountInput] = useState(
    () => selectedTable?.seatCount ?? 0,
  );
  const [syncedTableId, setSyncedTableId] = useState(selectedTableId);

  if (syncedTableId !== selectedTableId) {
    setSyncedTableId(selectedTableId);
    setSeatCountInput(selectedTable?.seatCount ?? 0);
  }

  if (!selectedTable)
    return (
      <p className="mt-2 text-sm text-on-surface-variant">
        Select a table to edit.
      </p>
    );

  return (
    <div className="grid gap-2">
      <Button variant="primary" size="sm" onClick={addTable}>
        Add Table
      </Button>

      <div className="mt-3 grid gap-2">
        <label className={labelClass}>Table name</label>
        <input
          className={inputClass}
          value={selectedTable.name}
          onChange={(event) =>
            updateTable(selectedTable.id, (table) => ({
              ...table,
              name: event.target.value,
            }))
          }
        />

        <label className={labelClass} htmlFor="shape-select">
          Shape
        </label>
        <Select
          id="shape-select"
          ariaLabel="Table shape"
          value={selectedTable.shape}
          onValueChange={(shape) =>
            updateTable(selectedTable.id, (table) => ({
              ...table,
              shape,
              ...(shape === "round"
                ? {
                    width: Math.max(table.width, table.height),
                    height: Math.max(table.width, table.height),
                  }
                : {}),
            }))
          }
          options={SHAPE_OPTIONS}
        />

        <label className={labelClass} htmlFor="seat-count-input">
          Seats
        </label>

        <input
          id="seat-count-input"
          className={inputClass}
          type="number"
          value={seatCountInput}
          onChange={(event) => {
            const next = event.target.value;
            const parsed = Number.parseInt(next);
            setSeatCountInput(parsed);
            if (next === "" || isNaN(parsed))
              return resizeTableSeats(selectedTable.id, 0);

            resizeTableSeats(selectedTable.id, parsed);
          }}
        />

        {selectedTable.shape === "rectangle" && (
          <>
            <label className={labelClass} htmlFor="active-sides-select">
              Active sides
              <Select
                id="active-sides-select"
                ariaLabel="Active sides"
                value={
                  ACTIVE_SIDES_TO_STRING[selectedTable.rectangleActiveSides]
                }
                onValueChange={(key) =>
                  updateTable(selectedTable.id, (table) => ({
                    ...table,
                    rectangleActiveSides: ACTIVE_SIDES_TO_NUMBER[key],
                  }))
                }
                options={ACTIVE_SIDES_OPTIONS}
              />
            </label>
          </>
        )}

        <div className="mt-1 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => duplicateTable(selectedTable)}
          >
            Duplicate
          </Button>
          <Button
            tone="destructive"
            size="sm"
            onClick={() => deleteTable(selectedTable.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
