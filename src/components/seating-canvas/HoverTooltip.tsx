import type { HoverTooltip as HoverTooltipType } from "../../types";

type HoverTooltipProps = {
  tooltip: HoverTooltipType;
};

export function HoverTooltip({ tooltip }: HoverTooltipProps) {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none fixed z-20 rounded-md bg-inverse-surface px-2 py-1 text-xs text-inverse-on-surface shadow-sm"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      {tooltip.text}
    </div>
  );
}
