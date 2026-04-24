import { Theme } from "@radix-ui/themes";
import { SeatingCanvas } from "./components/seating-canvas/SeatingCanvas";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Slider } from "./components/ui/slider";
import { SeatingProvider } from "./components/seating-canvas/context/SeatingContext";
import { useSeating } from "./components/seating-canvas/context/seating-context";
import { Toolbar } from "./components/toolbar/Toolbar";

function CanvasScaleControl() {
  const { canvasScale, setCanvasScale } = useSeating();
  return (
    <div className="fixed flex gap-2 items-center bottom-6 right-6 z-30 rounded-xl border border-outline-variant bg-surface/90 p-3 text-on-surface shadow-sm backdrop-blur">
      <Slider
        aria-label="Canvas scale"
        min={0.5}
        max={2}
        step={0.05}
        value={[canvasScale]}
        onValueChange={([value]) => {
          if (value !== undefined) {
            setCanvasScale(value);
          }
        }}
        className="w-48"
      />

      <span className="tabular-nums text-on-surface-variant">
        {Math.round(canvasScale * 100)}%
      </span>
    </div>
  );
}

function App() {
  return (
    <Theme>
      <SeatingProvider>
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[400px_1fr]">
          <Sidebar />

          <section className="relative h-screen overflow-hidden">
            <SeatingCanvas />
            <div className="absolute top-1/2 right-8 -translate-y-1/2 z-30">
              <Toolbar />
            </div>
          </section>
        </div>

        <CanvasScaleControl />
      </SeatingProvider>
    </Theme>
  );
}

export default App;
