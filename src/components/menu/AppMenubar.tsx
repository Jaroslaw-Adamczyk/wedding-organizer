import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Menubar from "@radix-ui/react-menubar";
import { useRef } from "react";
import { useSeating } from "../seating-canvas/context/seating-context";
import {
  formatGuestListCsv,
  formatGuestListTxt,
  formatTableAssignmentsCsv,
  formatTableAssignmentsTxt,
  type GuestExportFormat,
  type GuestExportScope,
} from "../../utils/guestExport";
import { cn } from "../../utils/cn";
import { formatCanvasJson, parseCanvasFile } from "../../utils/canvasExport";

const EXPORT_ACTIONS: Array<{
  label: string;
  format: GuestExportFormat;
  scope: GuestExportScope;
}> = [
  { label: "Export guest list as TXT", format: "txt", scope: "guests" },
  { label: "Export guest list as CSV", format: "csv", scope: "guests" },
  { label: "Export tables as TXT", format: "txt", scope: "tables" },
  { label: "Export tables as CSV", format: "csv", scope: "tables" },
];

export function AppMenubar() {
  const { guests, tables, canvasShapes, guestLookup, importCanvas } =
    useSeating();
  const canvasImportInputRef = useRef<HTMLInputElement | null>(null);
  const isExportDisabled = guests.length === 0;

  function getExportContent(
    format: GuestExportFormat,
    scope: GuestExportScope,
  ): string {
    if (scope === "guests") {
      return format === "csv"
        ? formatGuestListCsv(guests)
        : formatGuestListTxt(guests);
    }

    return format === "csv"
      ? formatTableAssignmentsCsv(tables, guestLookup)
      : formatTableAssignmentsTxt(tables, guestLookup);
  }

  function downloadFile(options: {
    content: string;
    fileName: string;
    mimeType: string;
  }) {
    const blob = new Blob([options.content], { type: options.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = options.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveCanvas() {
    downloadFile({
      content: formatCanvasJson({ guests, tables, canvasShapes }),
      fileName: "wedding-canvas.json",
      mimeType: "application/json;charset=utf-8",
    });
  }

  async function handleCanvasImportChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      importCanvas(await parseCanvasFile(file));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unknown canvas import error.",
      );
    }
  }

  function handleExport(format: GuestExportFormat, scope: GuestExportScope) {
    const content = getExportContent(format, scope);
    const fileName = `wedding-${scope}.${format}`;
    const mimeType =
      format === "csv" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8";
    const blobContent = format === "csv" ? `\uFEFF${content}` : content;

    downloadFile({ content: blobContent, fileName, mimeType });
  }

  return (
    <>
      <input
        ref={canvasImportInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleCanvasImportChange}
      />
      <Menubar.Root className="flex items-center gap-1 rounded-xl border border-outline-variant bg-surface/90 p-1.5 text-on-surface shadow-sm backdrop-blur">
        <Menubar.Menu>
          <Menubar.Trigger className="flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-on-surface-variant outline-none transition-colors hover:bg-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:bg-surface-variant">
            File
            <ChevronDownIcon className="h-4 w-4" aria-hidden />
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              align="start"
              sideOffset={8}
              className="z-50 min-w-52 rounded-xl border border-outline-variant bg-surface p-1.5 text-on-surface shadow-md"
            >
              <Menubar.Item
                onSelect={() => canvasImportInputRef.current?.click()}
                className={cn(
                  "flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                  "focus:bg-secondary-container focus:text-on-secondary-container data-highlighted:bg-secondary-container data-highlighted:text-on-secondary-container",
                )}
              >
                Import canvas from JSON
              </Menubar.Item>
              <Menubar.Item
                onSelect={handleSaveCanvas}
                className={cn(
                  "flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                  "focus:bg-secondary-container focus:text-on-secondary-container data-highlighted:bg-secondary-container data-highlighted:text-on-secondary-container",
                )}
              >
                Save canvas as JSON
              </Menubar.Item>
              <Menubar.Separator className="my-1 h-px bg-outline-variant" />
              {EXPORT_ACTIONS.map((action, index) => (
                <Menubar.Item
                  key={`${action.format}-${action.scope}`}
                  disabled={isExportDisabled}
                  onSelect={() => handleExport(action.format, action.scope)}
                  className={cn(
                    "flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                    "focus:bg-secondary-container focus:text-on-secondary-container data-highlighted:bg-secondary-container data-highlighted:text-on-secondary-container",
                    "data-disabled:pointer-events-none data-disabled:text-on-surface-variant/40",
                    index === 2 && "mt-1",
                  )}
                >
                  {action.label}
                </Menubar.Item>
              ))}
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </>
  );
}
