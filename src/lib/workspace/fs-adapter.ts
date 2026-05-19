import type { WorkspaceArtifactKind, WorkspaceCapability } from "./action-types";
import { detectWorkspaceCapability } from "./fs-capabilities";
import { LOCAL_WORKSPACE_FILE_EXTENSIONS } from "./top-left-toolbar-config";

interface WorkspacePickerAcceptDefinition {
  description: string;
  accept: Record<string, string[]>;
}

interface OpenWorkspacePickerOptions {
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  types?: WorkspacePickerAcceptDefinition[];
}

interface SaveWorkspacePickerOptions {
  suggestedName?: string;
  types?: WorkspacePickerAcceptDefinition[];
}

interface BrowserWritableFileStream {
  write: (content: string) => Promise<void>;
  close: () => Promise<void>;
}

interface BrowserFileHandle {
  kind: "file";
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<BrowserWritableFileStream>;
}

interface BrowserDirectoryHandle {
  kind: "directory";
  name: string;
  values: () => AsyncIterable<BrowserHandle>;
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<BrowserDirectoryHandle>;
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<BrowserFileHandle>;
}

type BrowserHandle = BrowserFileHandle | BrowserDirectoryHandle;

const FILE_PICKER_ACCEPT: WorkspacePickerAcceptDefinition = {
  description: "BA workspace files",
  accept: {
    "text/plain": [".mmd", ".md", ".txt", ".json"],
    "application/json": [".json"],
  },
};

interface BrowserWorkspaceWindow extends Window {
  showDirectoryPicker?: () => Promise<BrowserDirectoryHandle>;
  showOpenFilePicker?: (options?: OpenWorkspacePickerOptions) => Promise<BrowserFileHandle[]>;
  showSaveFilePicker?: (options?: SaveWorkspacePickerOptions) => Promise<BrowserFileHandle>;
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export interface WorkspaceFileEntry {
  name: string;
  path: string;
  kind: WorkspaceArtifactKind;
  handle?: BrowserFileHandle;
  lastModified?: number;
}

export interface WorkspaceFolderHandle {
  name: string;
  directoryHandle: BrowserDirectoryHandle;
  files: WorkspaceFileEntry[];
}

export interface OpenWorkspaceFileResult {
  file: WorkspaceFileEntry;
  content: string;
}

export interface SaveWorkspaceFileResult {
  file: WorkspaceFileEntry;
}

export interface WorkspaceFileSystemAdapter {
  getCapability: () => WorkspaceCapability;
  openFolder: () => Promise<WorkspaceFolderHandle | null>;
  openFile: () => Promise<OpenWorkspaceFileResult | null>;
  readFile: (file: WorkspaceFileEntry) => Promise<string>;
  saveFileAs: (defaultName: string, content: string) => Promise<SaveWorkspaceFileResult | null>;
  saveToFile: (file: WorkspaceFileEntry, content: string) => Promise<SaveWorkspaceFileResult>;
  createFile: (
    workspace: WorkspaceFolderHandle,
    relativePath: string,
    content: string,
    kind: WorkspaceArtifactKind
  ) => Promise<SaveWorkspaceFileResult>;
  refreshWorkspace: (workspace: WorkspaceFolderHandle) => Promise<WorkspaceFileEntry[]>;
  revealPath: (path: string) => Promise<void>;
}

function getBrowserWindow(): BrowserWorkspaceWindow | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window as BrowserWorkspaceWindow;
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+/g, "/");
}

function getFileExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

export function getWorkspaceArtifactKind(name: string): WorkspaceArtifactKind {
  const extension = getFileExtension(name);

  if (extension === ".mmd") {
    return "diagram";
  }

  if (name.includes("requirements")) {
    return "requirements-note";
  }

  if (name.includes("brief")) {
    return "ba-brief";
  }

  if (extension === ".md" || extension === ".txt") {
    return "requirements-note";
  }

  if (extension === ".json") {
    return "json";
  }

  return "other";
}

function isSupportedWorkspaceFile(name: string): boolean {
  return LOCAL_WORKSPACE_FILE_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension));
}

async function listWorkspaceFiles(
  directoryHandle: BrowserDirectoryHandle,
  prefix = "",
  depth = 0
): Promise<WorkspaceFileEntry[]> {
  const files: WorkspaceFileEntry[] = [];

  for await (const handle of directoryHandle.values()) {
    const currentPath = normalizeWorkspacePath(prefix ? `${prefix}/${handle.name}` : handle.name);

    if (handle.kind === "file" && isSupportedWorkspaceFile(handle.name)) {
      const file = await handle.getFile();
      files.push({
        name: handle.name,
        path: currentPath,
        kind: getWorkspaceArtifactKind(handle.name),
        handle,
        lastModified: file.lastModified,
      });
      continue;
    }

    if (handle.kind === "directory" && depth < 2) {
      const nestedFiles = await listWorkspaceFiles(handle, currentPath, depth + 1);
      files.push(...nestedFiles);
    }
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function writeToHandle(handle: BrowserFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function getFileHandleForPath(
  directoryHandle: BrowserDirectoryHandle,
  relativePath: string
): Promise<BrowserFileHandle> {
  const parts = normalizeWorkspacePath(relativePath).split("/");
  const fileName = parts.pop();

  if (!fileName) {
    throw new Error("A file name is required.");
  }

  let currentDirectory = directoryHandle;

  for (const part of parts) {
    currentDirectory = await currentDirectory.getDirectoryHandle(part, { create: true });
  }

  return currentDirectory.getFileHandle(fileName, { create: true });
}

export const browserWorkspaceFileSystem: WorkspaceFileSystemAdapter = {
  getCapability() {
    return detectWorkspaceCapability();
  },

  async openFolder() {
    const browserWindow = getBrowserWindow();

    if (!browserWindow?.showDirectoryPicker) {
      return null;
    }

    try {
      const directoryHandle = await browserWindow.showDirectoryPicker();
      const files = await listWorkspaceFiles(directoryHandle);

      return {
        name: directoryHandle.name,
        directoryHandle,
        files,
      };
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }

      throw error;
    }
  },

  async openFile() {
    const browserWindow = getBrowserWindow();

    if (!browserWindow?.showOpenFilePicker) {
      return null;
    }

    try {
      const [handle] = await browserWindow.showOpenFilePicker({
        excludeAcceptAllOption: false,
        multiple: false,
        types: [FILE_PICKER_ACCEPT],
      });

      if (!handle) {
        return null;
      }

      const file = await handle.getFile();
      const content = await file.text();

      return {
        file: {
          name: handle.name,
          path: handle.name,
          kind: getWorkspaceArtifactKind(handle.name),
          handle,
          lastModified: file.lastModified,
        },
        content,
      };
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }

      throw error;
    }
  },

  async readFile(file) {
    if (!file.handle) {
      throw new Error("The selected workspace file is not attached to a readable handle.");
    }

    const browserFile = await file.handle.getFile();
    return browserFile.text();
  },

  async saveFileAs(defaultName, content) {
    const browserWindow = getBrowserWindow();

    if (!browserWindow?.showSaveFilePicker) {
      return null;
    }

    try {
      const handle = await browserWindow.showSaveFilePicker({
        suggestedName: defaultName,
        types: [FILE_PICKER_ACCEPT],
      });

      await writeToHandle(handle, content);
      const savedFile = await handle.getFile();

      return {
        file: {
          name: handle.name,
          path: handle.name,
          kind: getWorkspaceArtifactKind(handle.name),
          handle,
          lastModified: savedFile.lastModified,
        },
      };
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }

      throw error;
    }
  },

  async saveToFile(file, content) {
    if (!file.handle) {
      throw new Error("Pick or create a local file before saving to it.");
    }

    await writeToHandle(file.handle, content);
    const savedFile = await file.handle.getFile();

    return {
      file: {
        ...file,
        lastModified: savedFile.lastModified,
      },
    };
  },

  async createFile(workspace, relativePath, content, kind) {
    const fileHandle = await getFileHandleForPath(workspace.directoryHandle, relativePath);
    await writeToHandle(fileHandle, content);
    const createdFile = await fileHandle.getFile();

    return {
      file: {
        name: fileHandle.name,
        path: normalizeWorkspacePath(relativePath),
        kind,
        handle: fileHandle,
        lastModified: createdFile.lastModified,
      },
    };
  },

  async refreshWorkspace(workspace) {
    return listWorkspaceFiles(workspace.directoryHandle);
  },

  async revealPath(path) {
    throw new Error(`Reveal is not available in browser mode for ${path}.`);
  },
};
