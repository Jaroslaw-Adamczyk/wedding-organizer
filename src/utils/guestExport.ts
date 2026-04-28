import type { Guest, SeatingTable } from "../types";

export type GuestExportFormat = "txt" | "csv";
export type GuestExportScope = "guests" | "tables";

function formatGuestName(guest: Guest): string {
  return [guest.name, guest.surname].filter(Boolean).join(" ").trim();
}

function escapeCsvValue(value: string | null): string {
  const normalized = value ?? "";
  if (!/[",\r\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replaceAll('"', '""')}"`;
}

function formatCsvRow(values: Array<string | null>): string {
  return values.map(escapeCsvValue).join(",");
}

function getAssignedGuests(
  table: SeatingTable,
  guestLookup: Record<string, Guest>,
): Array<{ guest: Guest; seatIndex: number }> {
  return table.seats.flatMap((guestId, seatIndex) => {
    if (!guestId) {
      return [];
    }

    const guest = guestLookup[guestId];
    return guest ? [{ guest, seatIndex }] : [];
  });
}

export function formatGuestListTxt(guests: Guest[]): string {
  return guests.map(formatGuestName).filter(Boolean).join("\n");
}

export function formatGuestListCsv(guests: Guest[]): string {
  const rows = [
    formatCsvRow(["Name", "Surname"]),
    ...guests.map((guest) => formatCsvRow([guest.name, guest.surname])),
  ];

  return rows.join("\n");
}

export function formatTableAssignmentsTxt(
  tables: SeatingTable[],
  guestLookup: Record<string, Guest>,
): string {
  const tableSections = tables
    .map((table) => {
      const assignedGuests = getAssignedGuests(table, guestLookup);
      if (assignedGuests.length === 0) {
        return null;
      }

      return [
        `${table.name}:`,
        ...assignedGuests.map(({ guest }) => formatGuestName(guest)),
      ].join("\n");
    })
    .filter((section): section is string => section !== null);

  return tableSections.length > 0
    ? tableSections.join("\n\n")
    : "No guests assigned to tables.";
}

export function formatTableAssignmentsCsv(
  tables: SeatingTable[],
  guestLookup: Record<string, Guest>,
): string {
  const rows = [formatCsvRow(["Table", "Seat", "Name", "Surname"])];

  tables.forEach((table) => {
    getAssignedGuests(table, guestLookup).forEach(({ guest, seatIndex }) => {
      rows.push(
        formatCsvRow([
          table.name,
          String(seatIndex + 1),
          guest.name,
          guest.surname,
        ]),
      );
    });
  });

  return rows.join("\n");
}

