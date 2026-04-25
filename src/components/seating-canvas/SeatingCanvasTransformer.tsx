import { useMemo, type Ref } from "react";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { Transformer } from "react-konva";
import { useSeating } from "./context/seating-context";
import { MIN_CANVAS_SHAPE_DIMENSION, MIN_TABLE_DIMENSION } from "./constants";

type SeatingCanvasTransformerProps = {
  ref?: Ref<KonvaTransformer> | null;
};

export function SeatingCanvasTransformer({ ref }: SeatingCanvasTransformerProps) {
  const { canvasShapes, selectedShapeId, selectedTable } = useSeating();

  const selectedShape = useMemo(
    () => canvasShapes.find((s) => s.id === selectedShapeId) ?? null,
    [canvasShapes, selectedShapeId],
  );

  const minResizeDimension = selectedShapeId
    ? MIN_CANVAS_SHAPE_DIMENSION
    : MIN_TABLE_DIMENSION;

  const transformerAnchors = useMemo(() => {
    if (selectedShape) {
      return selectedShape.kind === "circle"
        ? ["top-left", "top-right", "bottom-left", "bottom-right"]
        : [
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ];
    }
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
  }, [selectedShape, selectedTable]);

  return (
    <Transformer
      ref={ref}
      rotateEnabled={true}
      enabledAnchors={transformerAnchors}
      boundBoxFunc={(oldBox, newBox) => {
        if (
          Math.abs(newBox.width) < minResizeDimension ||
          Math.abs(newBox.height) < minResizeDimension
        ) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
