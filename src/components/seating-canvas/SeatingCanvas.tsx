import { useEffect, useRef } from "react";
import { CanvasShapeGroup } from "./CanvasShapeGroup";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { Layer, Rect, Stage } from "react-konva";
import { SeatingCanvasGrid } from "./SeatingCanvasGrid";
import { SeatingCanvasTransformer } from "./SeatingCanvasTransformer";
import { useSeating } from "./context/seating-context";
import { HoverTooltip } from "./HoverTooltip";
import { SeatAssignPopover } from "./SeatAssignPopover";
import { SeatingTableGroup } from "./SeatingTableGroup";
import { useCanvasPinchZoom } from "./useCanvasPinchZoom";
import { useCanvasScrollPositioning } from "./useCanvasScrollPositioning";
import { materialColors } from "../../theme/colors";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

export function SeatingCanvas() {
  const {
    tables,
    canvasShapes,
    selectedTableId,
    selectedShapeId,
    selectedSeat,
    canvasScale,
    activeSeatPopover,
    setSelectedTableId,
    setSelectedShapeId,
    setSelectedSeat,
    setCanvasScale,
  } = useSeating();

  const transformerRef = useRef<KonvaTransformer | null>(null);
  const transformNodeRefs = useRef<Record<string, KonvaRect | undefined>>({});
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

  useEffect(() => {
    if (!transformerRef.current) return;
    if (selectedShapeId) {
      const selectedNode = transformNodeRefs.current[selectedShapeId];
      transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
      return;
    }
    if (!selectedTableId) {
      transformerRef.current.nodes([]);
      return;
    }
    if (selectedSeat?.tableId === selectedTableId) {
      transformerRef.current.nodes([]);
      return;
    }
    const selectedNode = transformNodeRefs.current[selectedTableId];
    transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
  }, [selectedTableId, selectedShapeId, selectedSeat, tables, canvasShapes]);

  function handleCanvasClick(event: KonvaEventObject<MouseEvent>): void {
    const clickedNode = event.target;
    const clickedOnEmptyCanvas =
      clickedNode === clickedNode.getStage() ||
      clickedNode.id() === "canvas-background";

    if (clickedOnEmptyCanvas) {
      setSelectedTableId(null);
      setSelectedShapeId(null);
      setSelectedSeat(null);
    }
  }

  function registerTransformNode(id: string, node: KonvaRect | null): void {
    transformNodeRefs.current[id] = node ?? undefined;
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

          <SeatingCanvasGrid />

          {canvasShapes.map((shape) => (
            <CanvasShapeGroup
              key={shape.id}
              shape={shape}
              onShapeTransformRef={registerTransformNode}
            />
          ))}

          {tables.map((table) => (
            <SeatingTableGroup
              key={table.id}
              table={table}
              onTableShapeRef={registerTransformNode}
            />
          ))}

          <SeatingCanvasTransformer ref={transformerRef} />
        </Layer>
      </Stage>
      <HoverTooltip />
      <SeatAssignPopover />
    </div>
  );
}
