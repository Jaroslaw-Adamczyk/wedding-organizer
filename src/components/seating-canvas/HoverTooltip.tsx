import { useSeating } from "./context/seating-context";
import { Tooltip } from "../ui/tooltip";

export function HoverTooltip() {
  const { setHoverTooltip, hoverTooltip } = useSeating();

  if (!hoverTooltip) return null;

  return (
    <Tooltip
      label={hoverTooltip.text}
      open
      side="top"
      delayDuration={400}
      onOpenChange={(next) => {
        if (!next) setHoverTooltip(null);
      }}
    >
      <span
        className="pointer-events-none fixed h-px w-px"
        style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
        aria-hidden
      />
    </Tooltip>
  );
}
