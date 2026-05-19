import { AlertCircle, CheckCircle2, CircleDotDashed, Loader2 } from "lucide-react";

import type { SaveState } from "../../lib/workspace/action-types";

interface SaveStatusChipProps {
  saveState: SaveState;
}

const SAVE_STATE_CONFIG: Record<SaveState, { label: string; className: string }> = {
  idle: {
    label: "Local draft",
    className: "text-slate-500 bg-slate-100 border-slate-200",
  },
  dirty: {
    label: "Unsaved",
    className: "text-amber-700 bg-amber-50 border-amber-200",
  },
  saving: {
    label: "Saving",
    className: "text-blue-700 bg-blue-50 border-blue-200",
  },
  saved: {
    label: "Saved",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  error: {
    label: "Save failed",
    className: "text-red-700 bg-red-50 border-red-200",
  },
};

function SaveStateIcon({ saveState }: SaveStatusChipProps) {
  if (saveState === "saving") {
    return <Loader2 size={12} className="animate-spin" />;
  }

  if (saveState === "saved") {
    return <CheckCircle2 size={12} />;
  }

  if (saveState === "error") {
    return <AlertCircle size={12} />;
  }

  return <CircleDotDashed size={12} />;
}

export default function SaveStatusChip({ saveState }: SaveStatusChipProps) {
  const config = SAVE_STATE_CONFIG[saveState];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}>
      <SaveStateIcon saveState={saveState} />
      <span>{config.label}</span>
    </div>
  );
}
