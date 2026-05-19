import type { ReactNode } from "react";

import type { WorkspaceTheme } from "../../lib/workspace/action-types";

interface ToolbarMenuButtonProps {
  theme: WorkspaceTheme;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function ToolbarMenuButton({
  theme,
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarMenuButtonProps) {
  const stateClass = disabled
    ? "cursor-not-allowed opacity-50"
    : active
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : `${theme.hover} ${theme.text}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${stateClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
