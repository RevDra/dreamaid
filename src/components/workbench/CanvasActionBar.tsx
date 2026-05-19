import { Eraser, PenTool, Play, Wand2 } from "lucide-react";

interface CanvasActionBarProps {
  isDrawingMode: boolean;
  onSyncCodeToDiagram: () => void;
  onAutoLayout: () => void;
  onToggleDrawingMode: () => void;
}

export default function CanvasActionBar({
  isDrawingMode,
  onSyncCodeToDiagram,
  onAutoLayout,
  onToggleDrawingMode,
}: CanvasActionBarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-lg border border-slate-200 text-slate-700">
      <button onClick={onSyncCodeToDiagram} className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition shadow-sm" title="Manual Sync Text to Diagram">
        <Play size={14} /> <span className="hidden xl:inline">Sync Code to Visual</span>
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <button onClick={onAutoLayout} className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Auto Layout Diagram">
        <Wand2 size={14} /> <span className="hidden xl:inline">Auto Layout</span>
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      <button
        onClick={onToggleDrawingMode}
        className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full transition ${isDrawingMode ? "bg-purple-100 text-purple-700" : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"}`}
        title="Art Mode (Freehand Drawing)"
      >
        {isDrawingMode ? <Eraser size={14} /> : <PenTool size={14} />} <span className="hidden xl:inline">{isDrawingMode ? "Exit Art Mode" : "Art Mode"}</span>
      </button>
    </div>
  );
}
