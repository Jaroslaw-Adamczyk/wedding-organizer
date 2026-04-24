import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useMemo, useState } from "react";
import { useSeating } from "../seating-canvas/context/seating-context";
import { Button } from "../ui/button";
import { GuestImport } from "./GuestImport";
import LinkSlashIcon from "@heroicons/react/20/solid/LinkSlashIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";
import { cn } from "../../utils/cn";
import { NewGuestDialog } from "./NewGuestDialog";
import { Tooltip } from "../ui/tooltip";

type GuestFilter = "all" | "seated" | "not-seated";

export function GuestsList() {
  const {
    guests,
    assignedGuestIds,
    revokeGuestFromAnySeat,
    addGuest,
    removeGuest,
  } = useSeating();
  const [filter, setFilter] = useState<GuestFilter>("all");

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const isAssigned = assignedGuestIds.has(guest.id);

      if (filter === "seated") return isAssigned;
      if (filter === "not-seated") return !isAssigned;

      return true;
    });
  }, [assignedGuestIds, filter, guests]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <GuestImport />
        <NewGuestDialog onAddGuest={addGuest}>
          <Button variant="outline" size="sm">
            Add guest
          </Button>
        </NewGuestDialog>
      </div>

      <FilterGuest value={filter} onValueChange={setFilter} />

      <ul className="m-0 grid list-none gap-1.5 p-0">
        {filteredGuests.length === 0 ? (
          <li className="rounded-lg border border-dashed border-outline-variant px-2 py-3 text-center text-sm text-on-surface-variant">
            No guests match this filter.
          </li>
        ) : (
          <>
            {filteredGuests.map((guest) => {
              const isAssigned = assignedGuestIds.has(guest.id);
              return (
                <GuestItem
                  key={guest.id}
                  isAssigned={isAssigned}
                  onRevoke={() => revokeGuestFromAnySeat(guest.id)}
                  onRemove={() => removeGuest(guest.id)}
                >
                  {guest.name} {guest.surname}
                </GuestItem>
              );
            })}
          </>
        )}
      </ul>
    </div>
  );
}

function FilterGuest(props: {
  value: GuestFilter;
  onValueChange: (value: GuestFilter) => void;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={props.value}
      aria-label="Filter guests by seating status"
      className="inline-flex w-full rounded-lg border border-outline-variant bg-surface p-1"
      onValueChange={(value) => {
        if (value) {
          props.onValueChange(value as GuestFilter);
        }
      }}
    >
      <ToggleGroup.Item
        value="all"
        className="flex-1 rounded-md px-2 py-1.5 text-sm text-on-surface outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container"
      >
        All
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="seated"
        className="flex-1 rounded-md px-2 py-1.5 text-sm text-on-surface outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container"
      >
        Seated
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="not-seated"
        className="flex-1 rounded-md px-2 py-1.5 text-sm text-on-surface outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container"
      >
        Not seated
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}

const GuestItem = ({
  children,
  isAssigned,
  onRevoke,
  onRemove,
  onAdd,
}: {
  children: React.ReactNode;
  isAssigned: boolean;
  onRevoke?: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
}) => {
  return (
    <li
      className={cn(
        "group flex items-center justify-between rounded-lg border px-2 py-1.5 text-sm",
        isAssigned
          ? "border-outline-variant bg-surface-variant text-on-surface-variant"
          : "border-outline-variant bg-surface text-on-surface",
        onAdd && "cursor-pointer hover:bg-primary/60  justify-center",
      )}
      onClick={onAdd}
    >
      <span>{children}</span>

      <div className="flex items-center gap-2">
        {isAssigned && onRevoke && (
          <Tooltip label="Revoke guest from seat">
            <Button
              variant="outline"
              tone="neutral"
              size="xs"
              onClick={onRevoke}
              trailingIcon={<LinkSlashIcon className="h-4 w-4" />}
              className="opacity-0 group-hover:opacity-100"
            />
          </Tooltip>
        )}
        {onRemove && (
          <Tooltip label="Permanently delete guest from guest list">
            <Button
              variant="outline"
              tone="destructive"
              size="xs"
              onClick={onRemove}
              trailingIcon={<TrashIcon className="h-4 w-4" />}
              className="opacity-0 group-hover:opacity-100"
            />
          </Tooltip>
        )}
      </div>
    </li>
  );
};
