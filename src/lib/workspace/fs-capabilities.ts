import type { WorkspaceCapability } from "./action-types";

interface BrowserWorkspaceWindow extends Window {
  showDirectoryPicker?: () => Promise<unknown>;
  showOpenFilePicker?: (options?: unknown) => Promise<unknown>;
  showSaveFilePicker?: (options?: unknown) => Promise<unknown>;
}

export function detectWorkspaceCapability(): WorkspaceCapability {
  if (typeof window === "undefined") {
    return "unavailable";
  }

  const browserWindow = window as BrowserWorkspaceWindow;

  if (browserWindow.showDirectoryPicker && browserWindow.showOpenFilePicker && browserWindow.showSaveFilePicker) {
    return "browser-limited";
  }

  return "unavailable";
}

export function getWorkspaceCapabilityLabel(capability: WorkspaceCapability): string {
  if (capability === "browser-limited") {
    return "Browser local";
  }

  if (capability === "local-full") {
    return "Native local";
  }

  return "Preview only";
}

export function getWorkspaceCapabilityHint(capability: WorkspaceCapability): string {
  if (capability === "browser-limited") {
    return "Open folders and save local files directly in supported browsers.";
  }

  if (capability === "local-full") {
    return "Native desktop workspace features are available.";
  }

  return "Local folder actions are disabled in this browser preview.";
}
