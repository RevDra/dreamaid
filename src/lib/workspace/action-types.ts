export type CommandCategory = "workspace" | "canvas" | "automation";
export type CommandStatus = "default" | "success" | "warning" | "danger";
export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
export type AgentState = "idle" | "ready" | "running" | "error";

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
