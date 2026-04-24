import type { Guest } from "../types";

export function getInitials(guest: Pick<Guest, "name" | "surname">): string {
  return `${guest.name?.charAt(0) ?? ""}${guest.surname?.charAt(0) ?? ""}`.toUpperCase();
}
