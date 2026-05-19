import { Eraser, Palette, PenTool, Play, Wand2 } from "lucide-react";

interface CanvasActionBarProps {
  isDrawingMode: boolean;
  canEditCanvas?: boolean;
  canSyncCodeToDiagram?: boolean;
  isDrawingSettingsOpen?: boolean;
  isDrawingSettingsVisible?: boolean;
  onSyncCodeToDiagram: () => void;
  onAutoLayout: () => void;
  onToggleDrawingMode: () => void;
  onToggleDrawingSettings?: () => void;
}

export default function CanvasActionBar({
  isDrawingMode,
  canEditCanvas = true,
  canSyncCodeToDiagram = true,
  isDrawingSettingsOpen = false,
  isDrawingSettingsVisible = false,
  onSyncCodeToDiagram,
  onAutoLayout,
  onToggleDrawingMode,
  onToggleDrawingSettings,
}: CanvasActionBarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-lg border border-slate-200 text-slate-700">
      <button
        onClick={onSyncCodeToDiagram}
        disabled={!canSyncCodeToDiagram}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium shadow-sm transition ${
          canSyncCodeToDiagram ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
        title={canSyncCodeToDiagram ? "Manual Sync Text to Diagram" : "Sync is only available for Mermaid diagrams"}
      >
        <Play size={14} /> <span className="hidden xl:inline">Sync Code to Visual</span>
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <button
        onClick={onAutoLayout}
        disabled={!canEditCanvas}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition ${
          canEditCanvas ? "text-slate-700 hover:bg-blue-50 hover:text-blue-600" : "cursor-not-allowed text-slate-400"
        }`}
        title={canEditCanvas ? "Auto Layout Diagram" : "Canvas actions are only available for Mermaid diagrams"}
      >
        <Wand2 size={14} /> <span className="hidden xl:inline">Auto Layout</span>
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <button
        onClick={onToggleDrawingMode}
        disabled={!canEditCanvas}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition ${
          !canEditCanvas
            ? "cursor-not-allowed text-slate-400"
            : isDrawingMode
              ? "bg-purple-100 text-purple-700"
              : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
        }`}
        title={canEditCanvas ? "Art Mode (Freehand Drawing)" : "Canvas actions are only available for Mermaid diagrams"}
      >
        {isDrawingMode ? <Eraser size={14} /> : <PenTool size={14} />} <span className="hidden xl:inline">{isDrawingMode ? "Exit Art Mode" : "Art Mode"}</span>
      </button>

      {isDrawingSettingsVisible ? (
        <>
          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <button
            onClick={onToggleDrawingSettings}
            disabled={!canEditCanvas}
            className={`rounded-full p-1 transition ${
              !canEditCanvas
                ? "cursor-not-allowed text-slate-400"
                : isDrawingSettingsOpen
                  ? "bg-slate-200 text-slate-800"
                  : "text-slate-500 hover:bg-slate-100"
            }`}
            title={canEditCanvas ? "Drawing Settings" : "Canvas actions are only available for Mermaid diagrams"}
          >
            <Palette size={16} />
          </button>
        </>
      ) : null}
    </div>
  );
}
