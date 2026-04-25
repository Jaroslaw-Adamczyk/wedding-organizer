import * as Accordion from "@radix-ui/react-accordion";
import { TableDetails } from "./TableDetails";
import { AccordionSection } from "./AccordionSection";
import { useSeating } from "../seating-canvas/context/seating-context";
import { GuestsList } from "./GuestsList";

export function Sidebar() {
  const { selectedTable } = useSeating();

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
        <AccordionSection value="tables" title="Table details">
          <TableDetails />
        </AccordionSection>

        <AccordionSection
          value="guests"
          title={
            <div className="flex items-baseline gap-2">
              Guests{" "}
              {selectedTable ? (
                <div className="text-xs text-gray-500">
                  {" "}
                  {selectedTable.name}
                </div>
              ) : (
                ""
              )}
            </div>
          }
        >
          <GuestsList />
        </AccordionSection>
      </Accordion.Root>
    </aside>
  );
}
