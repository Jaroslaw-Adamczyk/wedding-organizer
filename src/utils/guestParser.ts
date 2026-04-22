import { z } from "zod";
import type { Guest } from "../types";

const GuestSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "Guest id cannot be empty")
      .default(() => crypto.randomUUID()),
    name: z.string().trim().nullable().default(""),
    surname: z.string().trim().nullable().default(""),
  })
  .transform((data) => ({
    id: data.id,
    name: data.name || "",
    surname: data.surname || "",
  }))
  .refine((guest) => guest.name.length > 0 || guest.surname.length > 0, {
    message: "Guest name and surname cannot be empty.",
  });

const GuestArraySchema = z.array(GuestSchema).refine(
  (guests) => {
    const ids = guests.map((g) => g.id);
    return new Set(ids).size === ids.length;
  },
  { message: "Duplicate guest IDs found" },
);

const JsonPayloadSchema = z.union([
  GuestArraySchema,
  z.object({ guests: GuestArraySchema }).transform((val) => val.guests),
]);

const PARSERS = {
  json: parseJsonGuests,
  csv: parseCsvGuests,
  txt: parseTxtGuests,
} as const;

export type SupportedExtension = keyof typeof PARSERS;

const SUPPORTED_EXTENSIONS = Object.keys(PARSERS) as SupportedExtension[];

export const ACCEPT_ATTRIBUTE = SUPPORTED_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

function getExtension(fileName: string): SupportedExtension | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext && ext in PARSERS ? (ext as SupportedExtension) : undefined;
}

export async function parseGuestFile(file: File): Promise<Guest[]> {
  const ext = getExtension(file.name);

  if (!ext) {
    const supported = SUPPORTED_EXTENSIONS.join(", ").toUpperCase();
    throw new Error(`Invalid file format. Supported formats: ${supported}.`);
  }

  const fileText = await file.text();
  return PARSERS[ext](fileText);
}

function toNonEmptyLines(fileText: string): string[] {
  return fileText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function validateGuests(candidates: unknown, formatLabel: string): Guest[] {
  const result = JsonPayloadSchema.safeParse(candidates);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid ${formatLabel} format. ${errors}`);
  }

  return result.data;
}

function parseJsonGuests(fileText: string): Guest[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  return validateGuests(parsed, "JSON");
}

function parseCsvGuests(fileText: string): Guest[] {
  const guests = toNonEmptyLines(fileText).map((line) => {
    const [name = "", surname = ""] = line
      .split(",")
      .map((item) => item.trim());

    return {
      id: crypto.randomUUID(),
      name,
      surname,
    };
  });

  return validateGuests(guests, "CSV");
}

function parseTxtGuests(fileText: string): Guest[] {
  const guests = toNonEmptyLines(fileText).map((line) => {
    const [name = "", ...surnameTokens] = line.split(/\s+/);

    return {
      id: crypto.randomUUID(),
      name,
      surname: surnameTokens.join(" "),
    };
  });

  return validateGuests(guests, "TXT");
}
