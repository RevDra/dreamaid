import { FolderOpen, HardDrive, LaptopMinimalCheck } from "lucide-react";

import type { WorkspaceCapability, WorkspaceSource, WorkspaceTheme } from "../../lib/workspace/action-types";
import { getWorkspaceCapabilityLabel } from "../../lib/workspace/fs-capabilities";

interface WorkspaceFolderChipProps {
  theme: WorkspaceTheme;
  workspaceRoot: string | null;
  currentFilePath: string | null;
  source: WorkspaceSource;
  capability: WorkspaceCapability;
}

function capabilityIcon(capability: WorkspaceCapability) {
  if (capability === "local-full") {
    return <HardDrive size={12} />;
  }

  if (capability === "browser-limited") {
    return <LaptopMinimalCheck size={12} />;
  }

  return <FolderOpen size={12} />;
}

export default function WorkspaceFolderChip({
  theme,
  workspaceRoot,
  currentFilePath,
  source,
  capability,
}: WorkspaceFolderChipProps) {
  const rootLabel =
    workspaceRoot ?? (source === "remote" ? "Cloud workspace" : source === "local" ? "Local workspace" : "Browser draft");

  return (
    <div className={`hidden min-w-0 items-center gap-2 rounded-xl border px-3 py-1.5 shadow-sm xl:flex ${theme.searchBg} ${theme.searchBorder}`}>
      <span className={theme.textMuted}>{capabilityIcon(capability)}</span>
      <div className="min-w-0">
        <div className={`truncate text-xs font-semibold ${theme.text}`}>{rootLabel}</div>
        <div className={`truncate text-[10px] ${theme.textMuted}`}>{currentFilePath ?? getWorkspaceCapabilityLabel(capability)}</div>
      </div>
    </div>
  );
}
