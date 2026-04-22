import { useEffect, useMemo, useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { Layer, Rect, Stage, Transformer } from "react-konva";
import { useSeating } from "../../context/seating-context";
import { HoverTooltip } from "./HoverTooltip";
import { SeatingTableGroup } from "./SeatingTableGroup";
import { useCanvasPinchZoom } from "./useCanvasPinchZoom";
import { useCanvasScrollPositioning } from "./useCanvasScrollPositioning";
import { materialColors } from "../../theme/colors";
import type { SeatingTable } from "../../types";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MIN_TABLE_DIMENSION,
  clampTableDimension,
} from "../../utils/seating";

export function SeatingCanvas() {
  const {
    tables,
    selectedTableId,
    selectedSeat,
    hoverTooltip,
    canvasScale,
    selectedTable,
    guestLookup,
    setSelectedTableId,
    setSelectedSeat,
    setHoverTooltip,
    setCanvasScale,
    updateTable,
  } = useSeating();

  const previousPositionRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );
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
  });

  const transformerAnchors = useMemo(() => {
    if (!selectedTable) {
      return ["top-left", "top-right", "bottom-left", "bottom-right"];
    }
    if (selectedTable.shape === "round") {
      return ["top-left", "top-right", "bottom-left", "bottom-right"];
    }
    if (selectedTable.rectangleResizeMode === "x") {
      return ["middle-left", "middle-right"];
    }
    if (selectedTable.rectangleResizeMode === "y") {
      return ["top-center", "bottom-center"];
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

  function handleDragStart(table: SeatingTable): void {
    previousPositionRef.current[table.id] = { x: table.x, y: table.y };
  }

  function handleDragEnd(
    table: SeatingTable,
    event: KonvaEventObject<DragEvent>,
  ): void {
    const newPosition = event.target.position();
    const outOfCanvas =
      newPosition.x < 100 ||
      newPosition.y < 100 ||
      newPosition.x > CANVAS_WIDTH - 100 ||
      newPosition.y > CANVAS_HEIGHT - 100;

    if (outOfCanvas) {
      const previous = previousPositionRef.current[table.id] ?? {
        x: table.x,
        y: table.y,
      };
      event.target.position(previous);
      updateTable(table.id, (current) => ({ ...current, ...previous }));
      return;
    }

    updateTable(table.id, (current) => ({
      ...current,
      x: newPosition.x,
      y: newPosition.y,
    }));
  }

  function handleTableTransform(
    table: SeatingTable,
    event: KonvaEventObject<Event>,
  ): void {
    const node = event.target;
    const scaleX = Math.abs(node.scaleX());
    const scaleY = Math.abs(node.scaleY());
    const proposedWidth = clampTableDimension(node.width() * scaleX);
    const proposedHeight = clampTableDimension(node.height() * scaleY);

    node.scaleX(1);
    node.scaleY(1);

    updateTable(table.id, (current) => {
      if (current.shape === "round") {
        const diameter = clampTableDimension(
          Math.max(proposedWidth, proposedHeight),
        );
        return { ...current, width: diameter, height: diameter };
      }

      if (current.rectangleResizeMode === "x") {
        return {
          ...current,
          width: proposedWidth,
        };
      }

      if (current.rectangleResizeMode === "y") {
        return {
          ...current,
          height: proposedHeight,
        };
      }

      return {
        ...current,
        width: proposedWidth,
        height: proposedHeight,
      };
    });
  }

  function handleInlineTableRename(table: SeatingTable): void {
    const nextName = window.prompt("Rename table", table.name)?.trim();
    if (!nextName) return;
    updateTable(table.id, (current) => ({ ...current, name: nextName }));
  }

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

  function handleSeatHover(
    event: KonvaEventObject<MouseEvent>,
    text: string,
  ): void {
    setHoverTooltip({
      x: event.evt.clientX + 10,
      y: event.evt.clientY + 10,
      text,
    });
  }

  function handleTableShapeRef(tableId: string, node: KonvaRect | null): void {
    tableShapeRefs.current[tableId] = node ?? undefined;
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-auto bg-surface-variant"
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

            {tables.map((table) => (
              <SeatingTableGroup
                key={table.id}
                table={table}
                selectedTableId={selectedTableId}
                selectedSeat={selectedSeat}
                guestLookup={guestLookup}
                onTableShapeRef={handleTableShapeRef}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onSelectTable={(tableId) => {
                  setSelectedTableId(tableId);
                  setSelectedSeat(null);
                }}
                onSelectSeat={(tableId, seatIndex) => {
                  setSelectedTableId(tableId);
                  setSelectedSeat({ tableId, seatIndex });
                }}
                onTableTransform={handleTableTransform}
                onInlineRename={handleInlineTableRename}
                onSeatHover={handleSeatHover}
                onSeatLeave={() => setHoverTooltip(null)}
              />
            ))}

            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
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
      </div>

      <HoverTooltip tooltip={hoverTooltip} />
    </>
  );
}
