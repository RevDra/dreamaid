export type CommandCategory = "workspace" | "canvas" | "automation";
export type CommandStatus = "default" | "success" | "warning" | "danger";
export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
export type AgentState = "idle" | "ready" | "running" | "error";
export type WorkspaceCapability = "unavailable" | "browser-limited" | "local-full";
export type WorkspaceSource = "draft" | "local" | "remote";
export type WorkspaceArtifactKind = "diagram" | "requirements-note" | "ba-brief" | "json" | "other";
export type TopLeftToolbarActionId =
  | "open-folder"
  | "refresh-workspace"
  | "restore-local-draft"
  | "new-diagram"
  | "new-requirements-note"
  | "new-ba-brief"
  | "open-local-file"
  | "save-local-file"
  | "save-local-file-as"
  | "toggle-explorer"
  | "toggle-problems"
  | "toggle-shapes"
  | "insert-actor"
  | "insert-process"
  | "insert-decision"
  | "insert-note"
  | "reveal-current-file";

export interface CommandAction {
  id: string;
  label: string;
  category: CommandCategory;
  shortcut?: string;
  disabled?: boolean;
  active?: boolean;
  status?: CommandStatus;
}

export interface CommandGroup {
  id: string;
  label: string;
  category: CommandCategory;
  actions: CommandAction[];
}

export interface RecentWorkspaceEntry {
  key: string;
  diagramId: string | null;
  title: string;
  source: WorkspaceSource;
  updatedAt: number;
  workspaceRoot?: string | null;
  currentFilePath?: string | null;
}

export interface TopLeftToolbarAction {
  id: TopLeftToolbarActionId;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface TopLeftToolbarGroup {
  id: string;
  label: string;
  actions: TopLeftToolbarAction[];
}

export interface WorkspaceTheme {
  bgMain: string;
  text: string;
  textMuted: string;
  border: string;
  toolbar: string;
  hover: string;
  searchBg: string;
  searchBorder: string;
  itemHover: string;
  itemActive: string;
  editorTabTop: string;
  shapeBorder: string;
  shapeFill: string;
}
