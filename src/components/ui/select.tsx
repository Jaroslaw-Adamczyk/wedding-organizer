import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { ReactNode } from "react";

export type SelectOption<T extends string> = {
  value: T;
  label: ReactNode;
};

export type SelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  ariaLabel: string;
  id?: string;
};

export function Select<T extends string>({
  id,
  value,
  onValueChange,
  options,
  ariaLabel,
}: SelectProps<T>) {
  return (
    <div id={id}>
      <SelectPrimitive.Root
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
      >
        <SelectPrimitive.Trigger
          className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-outline bg-surface px-2 py-1.5 text-left text-sm text-on-surface outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={ariaLabel}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon
            aria-hidden
            className="shrink-0 text-on-surface-variant"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-md"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm text-on-surface outline-none data-highlighted:bg-secondary-container data-highlighted:text-on-secondary-container data-[state=checked]:font-medium"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
