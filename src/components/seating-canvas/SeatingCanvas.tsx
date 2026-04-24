import { useEffect, useMemo, useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import { useSeating } from "./context/seating-context";
import { HoverTooltip } from "./HoverTooltip";
import { SeatAssignPopover } from "./SeatAssignPopover";
import { SeatingTableGroup } from "./SeatingTableGroup";
import { useCanvasPinchZoom } from "./useCanvasPinchZoom";
import { useCanvasScrollPositioning } from "./useCanvasScrollPositioning";
import { materialColors } from "../../theme/colors";
import { CANVAS_HEIGHT, CANVAS_WIDTH, MIN_TABLE_DIMENSION } from "./constants";

export function SeatingCanvas() {
  const {
    tables,
    selectedTableId,
    selectedSeat,
    canvasScale,
    selectedTable,
    activeSeatPopover,
    setSelectedTableId,
    setSelectedSeat,
    setCanvasScale,
  } = useSeating();

  const transformerRef = useRef<KonvaTransformer | null>(null);
  const tableShapeRefs = useRef<Record<string, KonvaRect | undefined>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasScaleRef = useRef(canvasScale);
  const pendingScrollRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    canvasScaleRef.current = canvasScale;
  }, [canvasScale]);

  useCanvasScrollPositioning(scrollContainerRef, pendingScrollRef, canvasScale);
  useCanvasPinchZoom({
    scrollContainerRef,
    canvasScaleRef,
    pendingScrollRef,
    setCanvasScale,
    disabled: !!activeSeatPopover,
  });

  const transformerAnchors = useMemo(() => {
    if (!selectedTable) {
      return ["top-left", "top-right", "bottom-left", "bottom-right"];
    }
    if (selectedTable.shape === "round" || selectedTable.shape === "square") {
      return ["top-left", "top-right", "bottom-left", "bottom-right"];
    }

    return [
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "middle-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ];
  }, [selectedTable]);

  useEffect(() => {
    if (!transformerRef.current) return;
    if (!selectedTableId) {
      transformerRef.current.nodes([]);
      return;
    }
    if (selectedSeat?.tableId === selectedTableId) {
      transformerRef.current.nodes([]);
      return;
    }
    const selectedNode = tableShapeRefs.current[selectedTableId];
    transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
  }, [selectedTableId, selectedSeat, tables]);

  function handleCanvasClick(event: KonvaEventObject<MouseEvent>): void {
    const clickedNode = event.target;
    const clickedOnEmptyCanvas =
      clickedNode === clickedNode.getStage() ||
      clickedNode.id() === "canvas-background";

    if (clickedOnEmptyCanvas) {
      setSelectedTableId(null);
      setSelectedSeat(null);
    }
  }

  function handleTableShapeRef(tableId: string, node: KonvaRect | null): void {
    tableShapeRefs.current[tableId] = node ?? undefined;
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`h-full w-full bg-surface-variant ${activeSeatPopover ? "overflow-hidden" : "overflow-auto"}`}
    >
      <Stage
        width={CANVAS_WIDTH * canvasScale}
        height={CANVAS_HEIGHT * canvasScale}
        onClick={handleCanvasClick}
        scaleX={canvasScale}
        scaleY={canvasScale}
      >
        <Layer>
          <Rect
            id="canvas-background"
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill={materialColors.surface}
          />

          {/* Subtle background grid */}
          {Array.from({ length: Math.floor(CANVAS_WIDTH / 40) + 1 }, (_, i) => (
            <Line
              key={`vgrid-${i}`}
              points={[i * 40, 0, i * 40, CANVAS_HEIGHT]}
              stroke={materialColors.outlineVariant}
              strokeWidth={0.5}
              opacity={0.35}
              listening={false}
            />
          ))}
          {Array.from({ length: Math.floor(CANVAS_HEIGHT / 40) + 1 }, (_, i) => (
            <Line
              key={`hgrid-${i}`}
              points={[0, i * 40, CANVAS_WIDTH, i * 40]}
              stroke={materialColors.outlineVariant}
              strokeWidth={0.5}
              opacity={0.35}
              listening={false}
            />
          ))}

          {tables.map((table) => (
            <SeatingTableGroup
              key={table.id}
              table={table}
              onTableShapeRef={handleTableShapeRef}
            />
          ))}

          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={transformerAnchors}
            boundBoxFunc={(oldBox, newBox) => {
              if (
                Math.abs(newBox.width) < MIN_TABLE_DIMENSION ||
                Math.abs(newBox.height) < MIN_TABLE_DIMENSION
              ) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      <HoverTooltip />
      <SeatAssignPopover />
    </div>
  );
}
