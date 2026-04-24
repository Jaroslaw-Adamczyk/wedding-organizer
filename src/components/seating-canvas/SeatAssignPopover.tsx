import { useEffect, useRef, useState } from "react";
import { useSeating } from "./context/seating-context";
import { cn } from "../../utils/cn";
import type { SeatPopover } from "../../types";

const POPOVER_WIDTH = 220;
const POPOVER_MAX_HEIGHT = 260;
const OFFSET_Y = 10;

export function SeatAssignPopover() {
  const { activeSeatPopover } = useSeating();

  if (!activeSeatPopover) return null;

  const popoverKey = `${activeSeatPopover.tableId}-${activeSeatPopover.seatIndex}`;

  return (
    <SeatAssignPopoverInner key={popoverKey} popover={activeSeatPopover} />
  );
}

function SeatAssignPopoverInner({
  popover,
}: {
  popover: NonNullable<SeatPopover>;
}) {
  const {
    setActiveSeatPopover,
    guests,
    assignedGuestIds,
    tables,
    assignGuestToSeat,
  } = useSeating();

  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setActiveSeatPopover(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveSeatPopover(null);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setActiveSeatPopover]);

  const { tableId, seatIndex, x, y } = popover;

  const currentGuestId =
    tables.find((t) => t.id === tableId)?.seats[seatIndex] ?? null;

  const filtered = guests.filter((guest) => {
    const fullName = `${guest.name ?? ""} ${guest.surname ?? ""}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) &&
      (!assignedGuestIds.has(guest.id) || guest.id === currentGuestId)
    );
  });

  function handleSelect(guestId: string | null) {
    assignGuestToSeat(tableId, seatIndex, guestId);
    setActiveSeatPopover(null);
  }

  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;
  const left = Math.min(x - POPOVER_WIDTH / 2, vpWidth - POPOVER_WIDTH - 8);
  const top =
    y + OFFSET_Y + POPOVER_MAX_HEIGHT > vpHeight
      ? y - OFFSET_Y - POPOVER_MAX_HEIGHT
      : y + OFFSET_Y;

  return (
    <div
      ref={popoverRef}
      style={{ left, top, width: POPOVER_WIDTH }}
      className="fixed z-1000 flex flex-col overflow-hidden rounded-[10px] border border-outline-variant bg-white shadow-[0_4px_24px_rgba(0,0,0,0.13)]"
    >
      <div className="border-b border-outline-variant px-2 pb-1 pt-2">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guest…"
          className="w-full border-none bg-transparent text-[13px] text-on-surface outline-none placeholder:text-on-surface-variant/60"
        />
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: POPOVER_MAX_HEIGHT - 42 }}
      >
        {currentGuestId && (
          <button
            onClick={() => handleSelect(null)}
            className="block w-full cursor-pointer px-3 py-2 text-left text-[13px] text-error transition-colors hover:bg-error/10"
          >
            <span className="opacity-70">✕</span>&nbsp;Remove guest
          </button>
        )}

        {filtered.length === 0 && (
          <p className="px-3 py-2.5 text-center text-xs text-on-surface-variant">
            No guests found
          </p>
        )}

        {filtered.map((guest) => {
          const isAssigned = guest.id === currentGuestId;
          return (
            <button
              key={guest.id}
              onClick={() => handleSelect(guest.id)}
              className={cn(
                "block w-full cursor-pointer px-3 py-2 text-left text-[13px] transition-colors",
                isAssigned
                  ? "bg-primary-container text-primary hover:bg-primary-container/80"
                  : "text-on-surface hover:bg-surface-variant",
              )}
            >
              {isAssigned && <span className="mr-1">✓</span>}
              {guest.name} {guest.surname}
            </button>
          );
        })}
      </div>
    </div>
  );
}
