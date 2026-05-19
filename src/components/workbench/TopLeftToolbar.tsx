import { ChevronRight, FilePlus2, FolderOpen, LayoutGrid, Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import type {
  RecentWorkspaceEntry,
  TopLeftToolbarActionId,
  WorkspaceCapability,
  WorkspaceTheme,
} from "../../lib/workspace/action-types";
import { getWorkspaceCapabilityHint } from "../../lib/workspace/fs-capabilities";
import type { WorkspaceFileEntry } from "../../lib/workspace/fs-adapter";
import { ARTIFACT_TEMPLATES, QUICK_INSERT_ACTIONS } from "../../lib/workspace/top-left-toolbar-config";
import ToolbarMenuButton from "./ToolbarMenuButton";
import WorkspaceFolderChip from "./WorkspaceFolderChip";

interface TopLeftToolbarProps {
  theme: WorkspaceTheme;
  workspaceRoot: string | null;
  currentFilePath: string | null;
  currentSource: "draft" | "local" | "remote";
  workspaceCapability: WorkspaceCapability;
  workspaceFiles: WorkspaceFileEntry[];
  recentWorkspaces: RecentWorkspaceEntry[];
  hasRestorableDraft: boolean;
  isSidebarOpen: boolean;
  isTerminalOpen: boolean;
  isRightPanelOpen: boolean;
  canSaveToLocalFile: boolean;
  canSaveAsLocalFile: boolean;
  canRefreshWorkspace: boolean;
  onAction: (actionId: TopLeftToolbarActionId) => void;
  onOpenWorkspaceFile: (file: WorkspaceFileEntry) => void;
  onOpenRecentWorkspace: (entry: RecentWorkspaceEntry) => void;
}

type MenuId = "workspace" | "file" | "view" | "quick-ba" | null;

interface MenuSectionProps {
  title: string;
  children: ReactNode;
}

function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

interface MenuActionButtonProps {
  label: string;
  description?: string;
  disabled?: boolean;
  onClick: () => void;
}

function MenuActionButton({ label, description, disabled = false, onClick }: MenuActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start justify-between rounded-lg px-2 py-1.5 text-left text-xs transition ${
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        {description ? <div className="mt-0.5 text-[11px] text-slate-500">{description}</div> : null}
      </div>
      {!disabled ? <ChevronRight size={12} className="mt-0.5 shrink-0 text-slate-400" /> : null}
    </button>
  );
}

function formatRecentTimestamp(updatedAt: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(updatedAt);
}

export default function TopLeftToolbar({
  theme,
  workspaceRoot,
  currentFilePath,
  currentSource,
  workspaceCapability,
  workspaceFiles,
  recentWorkspaces,
  hasRestorableDraft,
  isSidebarOpen,
  isTerminalOpen,
  isRightPanelOpen,
  canSaveToLocalFile,
  canSaveAsLocalFile,
  canRefreshWorkspace,
  onAction,
  onOpenWorkspaceFile,
  onOpenRecentWorkspace,
}: TopLeftToolbarProps) {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openMenu]);

  const workspaceHint = getWorkspaceCapabilityHint(workspaceCapability);
  const visibleWorkspaceFiles = useMemo(() => workspaceFiles.slice(0, 6), [workspaceFiles]);
  const visibleRecentWorkspaces = useMemo(() => recentWorkspaces.slice(0, 5), [recentWorkspaces]);

  const toggleMenu = (menu: MenuId) => setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  const runAction = (actionId: TopLeftToolbarActionId) => {
    setOpenMenu(null);
    onAction(actionId);
  };

  return (
    <div ref={containerRef} className="relative flex min-w-0 items-center gap-2">
      <WorkspaceFolderChip
        theme={theme}
        workspaceRoot={workspaceRoot}
        currentFilePath={currentFilePath}
        source={currentSource}
        capability={workspaceCapability}
      />

      <div className={`relative flex items-center gap-1 rounded-xl border p-1 shadow-sm ${theme.searchBg} ${theme.searchBorder}`}>
        <ToolbarMenuButton theme={theme} label="Workspace" icon={<FolderOpen size={14} />} active={openMenu === "workspace"} onClick={() => toggleMenu("workspace")} />
        <ToolbarMenuButton theme={theme} label="File" icon={<FilePlus2 size={14} />} active={openMenu === "file"} onClick={() => toggleMenu("file")} />
        <ToolbarMenuButton theme={theme} label="View" icon={<LayoutGrid size={14} />} active={openMenu === "view"} onClick={() => toggleMenu("view")} />
        <ToolbarMenuButton theme={theme} label="Quick BA" icon={<Sparkles size={14} />} active={openMenu === "quick-ba"} onClick={() => toggleMenu("quick-ba")} />
      </div>

      {openMenu ? (
        <div className={`absolute left-0 top-full z-[120] mt-2 w-[340px] rounded-2xl border p-3 shadow-2xl ${theme.searchBg} ${theme.searchBorder} ${theme.text}`}>
          {openMenu === "workspace" ? (
            <div className="flex flex-col gap-3">
              <MenuSection title="Workspace">
                <MenuActionButton
                  label="Open folder"
                  description={workspaceHint}
                  disabled={workspaceCapability === "unavailable"}
                  onClick={() => runAction("open-folder")}
                />
                <MenuActionButton
                  label="Refresh workspace"
                  description={workspaceRoot ? "Rescan supported BA files in the current folder." : "Open a local folder first."}
                  disabled={!canRefreshWorkspace}
                  onClick={() => runAction("refresh-workspace")}
                />
                <MenuActionButton
                  label="Restore local draft"
                  description="Recover the latest browser draft snapshot for this workbench."
                  disabled={!hasRestorableDraft}
                  onClick={() => runAction("restore-local-draft")}
                />
              </MenuSection>

              <MenuSection title="Recent workspaces">
                {visibleRecentWorkspaces.length > 0 ? (
                  visibleRecentWorkspaces.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenRecentWorkspace(entry);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-blue-50 hover:text-blue-700"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{entry.title}</div>
                        <div className="truncate text-[11px] text-slate-500">{entry.workspaceRoot ?? entry.currentFilePath ?? entry.source}</div>
                      </div>
                      <span className="shrink-0 pl-2 text-[10px] text-slate-400">{formatRecentTimestamp(entry.updatedAt)}</span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-lg px-2 py-2 text-xs text-slate-500">Recent workspace picks will appear here after you open or save local artifacts.</div>
                )}
              </MenuSection>
            </div>
          ) : null}

          {openMenu === "file" ? (
            <div className="flex flex-col gap-3">
              <MenuSection title="New artifact">
                {ARTIFACT_TEMPLATES.map((template) => (
                  <MenuActionButton
                    key={template.id}
                    label={template.label}
                    description={template.description}
                    onClick={() => runAction(template.id === "diagram" ? "new-diagram" : template.id === "requirements-note" ? "new-requirements-note" : "new-ba-brief")}
                  />
                ))}
              </MenuSection>

              <MenuSection title="Local file">
                <MenuActionButton
                  label="Open local file"
                  description="Pick a Mermaid, Markdown, or JSON artifact from disk."
                  disabled={workspaceCapability === "unavailable"}
                  onClick={() => runAction("open-local-file")}
                />
                <MenuActionButton
                  label="Save to current local file"
                  description="Overwrite the active local file handle."
                  disabled={!canSaveToLocalFile}
                  onClick={() => runAction("save-local-file")}
                />
                <MenuActionButton
                  label="Save as local file"
                  description="Create a new local artifact copy from the current editor content."
                  disabled={!canSaveAsLocalFile}
                  onClick={() => runAction("save-local-file-as")}
                />
                <MenuActionButton
                  label="Reveal current artifact"
                  description="Reserved for the future desktop runtime."
                  disabled
                  onClick={() => runAction("reveal-current-file")}
                />
              </MenuSection>

              <MenuSection title="Workspace files">
                {visibleWorkspaceFiles.length > 0 ? (
                  visibleWorkspaceFiles.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenWorkspaceFile(file);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-blue-50 hover:text-blue-700"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{file.name}</div>
                        <div className="truncate text-[11px] text-slate-500">{file.path}</div>
                      </div>
                      <span className="shrink-0 pl-2 text-[10px] uppercase tracking-wide text-slate-400">{file.kind}</span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-lg px-2 py-2 text-xs text-slate-500">Open a folder to browse supported BA files from the workspace.</div>
                )}
              </MenuSection>
            </div>
          ) : null}

          {openMenu === "view" ? (
            <div className="flex flex-col gap-3">
              <MenuSection title="Panels">
                <MenuActionButton
                  label={isSidebarOpen ? "Hide explorer" : "Show explorer"}
                  description="Toggle the primary workspace sidebar."
                  onClick={() => runAction("toggle-explorer")}
                />
                <MenuActionButton
                  label={isTerminalOpen ? "Hide problems" : "Show problems"}
                  description="Open or close the problems/terminal panel."
                  onClick={() => runAction("toggle-problems")}
                />
                <MenuActionButton
                  label={isRightPanelOpen ? "Hide shapes library" : "Show shapes library"}
                  description="Toggle the right-side shapes palette."
                  onClick={() => runAction("toggle-shapes")}
                />
              </MenuSection>
            </div>
          ) : null}

          {openMenu === "quick-ba" ? (
            <div className="flex flex-col gap-3">
              <MenuSection title="Insert">
                {QUICK_INSERT_ACTIONS.map((action) => (
                  <MenuActionButton
                    key={action.id}
                    label={`Insert ${action.label}`}
                    description={`Drop a ${action.label.toLowerCase()} node near the center of the canvas.`}
                    onClick={() => runAction(action.id)}
                  />
                ))}
              </MenuSection>

              <MenuSection title="Future hooks">
                <div className="rounded-lg px-2 py-2 text-xs text-slate-500">
                  Workspace analysis and agent-assisted BA review will plug into this menu next without changing the top bar layout.
                </div>
              </MenuSection>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
