import type { ReactNode } from "react";

import { FileCode } from "lucide-react";

import type { WorkspaceTheme } from "../../lib/workspace/action-types";

interface WorkspaceTopBarProps {
  theme: WorkspaceTheme;
  isDarkMode: boolean;
  diagramTitle: string;
  isTitleEditable?: boolean;
  onDiagramTitleChange: (value: string) => void;
  leftContent?: ReactNode;
  rightContent: ReactNode;
  workspaceLabel?: string;
  documentHint?: string;
}

export default function WorkspaceTopBar({
  theme,
  isDarkMode,
  diagramTitle,
  isTitleEditable = true,
  onDiagramTitleChange,
  leftContent,
  rightContent,
  workspaceLabel = "BA workbench",
  documentHint = "Process map",
}: WorkspaceTopBarProps) {
  return (
    <div className={`flex items-center justify-between h-12 gap-3 px-3 ${theme.toolbar} border-b ${theme.border} text-sm select-none shrink-0`}>
      <div className="min-w-0 shrink-0">{leftContent}</div>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className={`flex h-9 w-full max-w-xl items-center gap-3 rounded-xl border px-3 ${theme.searchBg} ${theme.searchBorder}`}>
          <FileCode size={15} className={theme.textMuted} />
          <input
            value={diagramTitle}
            onChange={(event) => onDiagramTitleChange(event.target.value)}
            readOnly={!isTitleEditable}
            className={`min-w-0 flex-1 bg-transparent text-sm font-medium outline-none ${theme.text}`}
            placeholder="Untitled diagram"
            aria-label="Diagram title"
          />
          <div className="hidden items-center gap-2 lg:flex">
            <span className={`text-[11px] ${theme.textMuted}`}>{workspaceLabel}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
              {documentHint}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0">{rightContent}</div>
    </div>
  );
}
