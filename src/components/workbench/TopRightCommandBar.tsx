import { LogIn, LogOut, Moon, PanelBottom, PanelLeft, PanelRight, Save, Share2, Sparkles, Sun, Upload } from "lucide-react";

import type { User } from "../../lib/api";
import type { SaveState, WorkspaceTheme } from "../../lib/workspace/action-types";
import SaveStatusChip from "./SaveStatusChip";

interface TopRightCommandBarProps {
  theme: WorkspaceTheme;
  isDarkMode: boolean;
  currentUser: User | null;
  saveState: SaveState;
  canSave: boolean;
  canShare: boolean;
  canExport: boolean;
  isSidebarOpen: boolean;
  isTerminalOpen: boolean;
  isRightPanelOpen: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleRightPanel: () => void;
  onSave: () => void;
  onShare: () => void;
  onExport: () => void;
}

function actionButtonClass(theme: WorkspaceTheme, options?: { active?: boolean; disabled?: boolean }) {
  if (options?.disabled) {
    return `opacity-50 cursor-not-allowed ${theme.textMuted}`;
  }

  if (options?.active) {
    return "bg-blue-600 text-white hover:bg-blue-700";
  }

  return `text-slate-700 hover:text-blue-600 ${theme.hover}`;
}

export default function TopRightCommandBar({
  theme,
  isDarkMode,
  currentUser,
  saveState,
  canSave,
  canShare,
  canExport,
  isSidebarOpen,
  isTerminalOpen,
  isRightPanelOpen,
  onOpenAuth,
  onLogout,
  onToggleTheme,
  onToggleSidebar,
  onToggleTerminal,
  onToggleRightPanel,
  onSave,
  onShare,
  onExport,
}: TopRightCommandBarProps) {
  const isSaving = saveState === "saving";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:block">
        <SaveStatusChip saveState={saveState} />
      </div>

      <div className={`flex items-center gap-1 rounded-xl border ${theme.searchBorder} ${theme.searchBg} p-1 shadow-sm`}>
        <button
          onClick={onSave}
          disabled={!canSave || isSaving}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${actionButtonClass(theme, { active: canSave, disabled: !canSave || isSaving })}`}
          title={canSave ? "Save diagram" : "Cloud save currently supports Mermaid diagrams only"}
        >
          <Save size={14} />
          <span className="hidden xl:inline">{isSaving ? "Saving..." : "Save"}</span>
        </button>

        <button
          onClick={onShare}
          disabled={!canShare || isSaving}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${actionButtonClass(theme, { disabled: !canShare || isSaving })}`}
          title={canShare ? "Share diagram" : "Save the diagram before sharing"}
        >
          <Share2 size={14} />
          <span className="hidden xl:inline">Share</span>
        </button>

        <button
          onClick={onExport}
          disabled={!canExport || isSaving}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${actionButtonClass(theme, { disabled: !canExport || isSaving })}`}
          title={canExport ? "Export diagram" : "Save the diagram before exporting"}
        >
          <Upload size={14} />
          <span className="hidden xl:inline">Export</span>
        </button>

        <button
          disabled
          className={`hidden 2xl:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${actionButtonClass(theme, { disabled: true })}`}
          title="Agent actions will land in this command area next"
        >
          <Sparkles size={14} />
          <span>Agents soon</span>
        </button>
      </div>

      <div className={`flex items-center gap-1 rounded-xl border ${theme.searchBorder} ${theme.searchBg} p-1 shadow-sm`}>
        {currentUser ? (
          <div className="hidden xl:flex items-center gap-2 px-2">
            <span className={`max-w-[180px] truncate text-xs ${theme.textMuted}`}>{currentUser.email}</span>
          </div>
        ) : null}

        {currentUser ? (
          <button onClick={onLogout} className={`rounded-lg p-1.5 transition ${theme.hover}`} title="Logout">
            <LogOut size={15} />
          </button>
        ) : (
          <button onClick={onOpenAuth} className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${theme.hover}`} title="Login / Register">
            <LogIn size={15} />
            <span className="hidden xl:inline">Sign in</span>
          </button>
        )}

        <button onClick={onToggleTheme} className={`rounded-lg p-1.5 transition ${theme.hover}`} title="Toggle Theme">
          {isDarkMode ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-slate-600" />}
        </button>

        <button
          onClick={onToggleSidebar}
          className={`rounded-lg p-1.5 transition ${isSidebarOpen ? (isDarkMode ? "bg-[#333333] text-white" : "bg-[#e4e4e4] text-black") : theme.hover}`}
          title="Toggle Primary Side Bar"
        >
          <PanelLeft size={15} />
        </button>

        <button
          onClick={onToggleTerminal}
          className={`rounded-lg p-1.5 transition ${isTerminalOpen ? (isDarkMode ? "bg-[#333333] text-white" : "bg-[#e4e4e4] text-black") : theme.hover}`}
          title="Toggle Terminal"
        >
          <PanelBottom size={15} />
        </button>

        <button
          onClick={onToggleRightPanel}
          className={`rounded-lg p-1.5 transition ${isRightPanelOpen ? (isDarkMode ? "bg-[#333333] text-white" : "bg-[#e4e4e4] text-black") : theme.hover}`}
          title="Toggle Right Panel"
        >
          <PanelRight size={15} />
        </button>
      </div>
    </div>
  );
}
