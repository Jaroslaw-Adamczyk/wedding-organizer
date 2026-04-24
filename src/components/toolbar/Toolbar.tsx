import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { useSeating } from "../seating-canvas/context/seating-context";
import { cn } from "../../utils/cn";
import TablePlusIcon from "../../assets/icons/table-plus.svg?react";

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
  destructive,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <ToolbarPrimitive.Button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-md transition-colors p-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            disabled
              ? "cursor-not-allowed text-on-surface-variant/30"
              : destructive
                ? "text-error hover:bg-error/10 active:bg-error/20"
                : "text-on-surface-variant hover:bg-surface-variant active:bg-surface-variant/80",
          )}
        >
          {children}
        </ToolbarPrimitive.Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="left"
          sideOffset={6}
          className="z-50 rounded-md bg-inverse-surface px-2.5 py-1.5 text-xs text-inverse-on-surface shadow-md"
        >
          {label}
          <Tooltip.Arrow className="fill-inverse-surface" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const Toolbar = () => {
  const { selectedTable, addTable, duplicateTable, deleteTable } = useSeating();
  const hasSelection = selectedTable !== null;

  return (
    <Tooltip.Provider delayDuration={400}>
      <ToolbarPrimitive.Root className=" flex flex-col items-center gap-0.5 rounded-xl border border-outline-variant bg-surface/90 p-1.5 shadow-sm backdrop-blur">
        <ToolbarButton label="Add table" onClick={addTable}>
          <TablePlusIcon className="h-8 w-8" />
        </ToolbarButton>

        <ToolbarButton
          label="Delete table"
          disabled={!hasSelection}
          onClick={() => selectedTable && deleteTable(selectedTable.id)}
        >
          <TrashIcon className="h-6 w-6" />
        </ToolbarButton>

        <ToolbarButton
          label="Duplicate table"
          disabled={!hasSelection}
          onClick={() => selectedTable && duplicateTable(selectedTable)}
        >
          <DocumentDuplicateIcon className="h-6 w-6" />
        </ToolbarButton>

        <ToolbarPrimitive.Separator className="my-1 w-5 h-px bg-outline-variant" />
      </ToolbarPrimitive.Root>
    </Tooltip.Provider>
  );
};
