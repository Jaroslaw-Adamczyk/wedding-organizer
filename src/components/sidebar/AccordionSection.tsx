import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { ReactNode } from "react";

type AccordionSectionProps = {
  value: string;
  title: ReactNode;
  children: ReactNode;
};

export function AccordionSection({
  value,
  title,
  children,
}: AccordionSectionProps) {
  return (
    <Accordion.Item
      value={value}
      className="overflow-hidden rounded-xl border border-outline-variant bg-surface"
    >
      <Accordion.Header className="m-0 px-3 py-3">
        <Accordion.Trigger className="group flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-base font-semibold text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          {title}
          <ChevronDownIcon
            aria-hidden
            className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden px-3 pb-3 text-sm">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
}
