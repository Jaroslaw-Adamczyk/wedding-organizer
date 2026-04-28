import { z } from "zod";
import type { CanvasShape, Guest, SeatingTable } from "../types";
import { GuestSchema } from "./guestParser";

export type CanvasExportPayload = {
  schemaVersion: 1;
  exportedAt: string;
  guests: Guest[];
  tables: SeatingTable[];
  assignments: Array<{
    guestId: string;
    tableId: string;
    tableName: string;
    seatIndex: number;
  }>;
  shapes: CanvasShape[];
};

export function formatCanvasJson(options: {
  guests: Guest[];
  tables: SeatingTable[];
  canvasShapes: CanvasShape[];
}): string {
  const payload: CanvasExportPayload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    guests: options.guests,
    tables: options.tables,
    assignments: options.tables.flatMap((table) =>
      table.seats.flatMap((guestId, seatIndex) =>
        guestId
          ? [
              {
                guestId,
                tableId: table.id,
                tableName: table.name,
                seatIndex,
              },
            ]
          : [],
      ),
    ),
    shapes: options.canvasShapes,
  };

  return JSON.stringify(payload, null, 2);
}

const TableSchema = z
  .object({
    id: z.string().trim().min(1, "Table id cannot be empty"),
    name: z.string().trim().min(1, "Table name cannot be empty"),
    shape: z.union([z.literal("round"), z.literal("rectangle"), z.literal("square")]),
    seatCount: z.number().int().nonnegative(),
    rectangleActiveSides: z.union([z.literal(1), z.literal(2), z.literal(4)]),
    width: z.number(),
    height: z.number(),
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
    seats: z.array(z.string().nullable()),
  })
  .refine((table) => table.seats.length === table.seatCount, {
    message: "Table seat count must match the number of seats.",
  });

const CanvasShapeSchema = z.object({
  id: z.string().trim().min(1, "Shape id cannot be empty"),
  kind: z.union([z.literal("rectangle"), z.literal("circle"), z.literal("text")]),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
});

const CanvasExportPayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    exportedAt: z.string(),
    guests: z.array(GuestSchema),
    tables: z.array(TableSchema),
    assignments: z
      .array(
        z.object({
          guestId: z.string(),
          tableId: z.string(),
          tableName: z.string(),
          seatIndex: z.number().int().nonnegative(),
        }),
      )
      .optional(),
    shapes: z.array(CanvasShapeSchema),
  })
  .refine(
    (payload) => {
      const guestIds = payload.guests.map((guest) => guest.id);
      const tableIds = payload.tables.map((table) => table.id);
      const shapeIds = payload.shapes.map((shape) => shape.id);

      return (
        new Set(guestIds).size === guestIds.length &&
        new Set(tableIds).size === tableIds.length &&
        new Set(shapeIds).size === shapeIds.length
      );
    },
    { message: "Canvas JSON contains duplicate IDs." },
  )
  .refine(
    (payload) => {
      const guestIds = new Set(payload.guests.map((guest) => guest.id));
      return payload.tables.every((table) =>
        table.seats.every((guestId) => guestId === null || guestIds.has(guestId)),
      );
    },
    { message: "Canvas JSON contains table seats assigned to unknown guests." },
  );

export function parseCanvasJson(fileText: string): CanvasExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error("Invalid canvas JSON format.");
  }

  const result = CanvasExportPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid canvas JSON. ${errors}`);
  }

  return {
    ...result.data,
    assignments: result.data.assignments ?? [],
  };
}

export async function parseCanvasFile(file: File): Promise<CanvasExportPayload> {
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Invalid file format. Select a JSON canvas export.");
  }

  return parseCanvasJson(await file.text());
}

