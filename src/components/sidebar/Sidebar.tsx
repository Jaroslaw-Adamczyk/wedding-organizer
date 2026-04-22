import * as Accordion from "@radix-ui/react-accordion";
import { TableDetails } from "./TableDetails";
import { AccordionSection } from "./AccordionSection";
import { GuestImport } from "./GuestImport";
import { useSeating } from "../../context/seating-context";
import { Select } from "../ui/select";

const EMPTY_SEAT_VALUE = "__empty__";

export function Sidebar() {
  const {
    guests,
    tables,
    selectedSeat,
    assignedGuestIds,
    assignGuestToSeat,
    removeGuestFromAnySeat,
  } = useSeating();

  return (
    <aside className="overflow-auto h-screen border-b border-outline-variant bg-surface-container p-4 xl:border-r xl:border-b-0">
      <h1 className="m-0 text-2xl font-semibold text-on-surface">
        Wedding Seating
      </h1>
      <p className="mb-4 mt-1 text-sm text-on-surface-variant">
        Shape, seat count, and guest assignment.
      </p>

      <Accordion.Root
        type="multiple"
        defaultValue={["tables", "seat", "guests"]}
        className="grid gap-3"
      >
        <AccordionSection value="tables" title="Tables">
          <TableDetails />
        </AccordionSection>

        <AccordionSection value="seat" title="Seat Assignment">
          {selectedSeat ? (
            <div className="grid gap-2">
              <p className="text-sm text-on-surface">
                <strong>
                  {
                    tables.find((table) => table.id === selectedSeat.tableId)
                      ?.name
                  }
                </strong>{" "}
                - Seat {selectedSeat.seatIndex + 1}
              </p>
              <Select
                ariaLabel="Guest for selected seat"
                value={
                  tables.find((table) => table.id === selectedSeat.tableId)
                    ?.seats[selectedSeat.seatIndex] ?? EMPTY_SEAT_VALUE
                }
                onValueChange={(value) =>
                  assignGuestToSeat(
                    selectedSeat.tableId,
                    selectedSeat.seatIndex,
                    value === EMPTY_SEAT_VALUE ? null : value,
                  )
                }
                options={[
                  { value: EMPTY_SEAT_VALUE, label: "-- Empty seat --" },
                  ...guests.map((guest) => ({
                    value: guest.id,
                    label: `${guest.name} ${guest.surname}`,
                  })),
                ]}
              />
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Select a seat on the canvas.
            </p>
          )}
        </AccordionSection>

        <AccordionSection value="guests" title="Guests">
          <GuestImport />

          <ul className="m-0 grid list-none gap-1.5 p-0">
            {guests.map((guest) => {
              const isAssigned = assignedGuestIds.has(guest.id);
              return (
                <li
                  key={guest.id}
                  className={`group flex items-center justify-between rounded-lg border px-2 py-1.5 text-sm ${
                    isAssigned
                      ? "border-outline-variant bg-surface-variant text-on-surface-variant"
                      : "border-outline-variant bg-surface text-on-surface"
                  }`}
                >
                  <span>
                    {guest.name} {guest.surname}
                  </span>
                  {isAssigned ? (
                    <button
                      type="button"
                      className="h-5 w-5 rounded-full border border-outline-variant bg-surface p-0 text-xs leading-5 text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:bg-error-container hover:text-on-error-container"
                      onClick={() => removeGuestFromAnySeat(guest.id)}
                    >
                      x
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AccordionSection>
      </Accordion.Root>
    </aside>
  );
}
