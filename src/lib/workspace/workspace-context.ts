import type { Edge, Node } from "reactflow";

import type { User } from "../api";
import type { WorkspaceArtifactKind, WorkspaceCapability, WorkspaceSource } from "./action-types";

export interface WorkspaceParseError {
  line: number;
  message: string;
  lineText: string;
}

export interface WorkspaceFileSummary {
  name: string;
  path: string;
  kind: WorkspaceArtifactKind;
}

export interface WorkspaceSnapshot {
  diagramId: string | null;
  diagramTitle: string;
  code: string;
  nodes: Node[];
  edges: Edge[];
  currentUser: User | null;
  isDrawingMode: boolean;
  hasUnsavedChanges: boolean;
  zoomLevel: number;
  parseError: WorkspaceParseError | null;
  source: WorkspaceSource;
  artifactKind: WorkspaceArtifactKind;
  workspaceRoot: string | null;
  currentFilePath: string | null;
  workspaceCapability: WorkspaceCapability;
  workspaceFiles: WorkspaceFileSummary[];
  updatedAt: number;
}

export interface BuildWorkspaceSnapshotInput {
  diagramId: string | null;
  diagramTitle: string;
  code: string;
  nodes: Node[];
  edges: Edge[];
  currentUser: User | null;
  isDrawingMode: boolean;
  hasUnsavedChanges: boolean;
  zoomLevel: number;
  parseError: WorkspaceParseError | null;
  source: WorkspaceSource;
  artifactKind: WorkspaceArtifactKind;
  workspaceRoot: string | null;
  currentFilePath: string | null;
  workspaceCapability: WorkspaceCapability;
  workspaceFiles: WorkspaceFileSummary[];
  updatedAt: number;
}

export function buildWorkspaceSnapshot(input: BuildWorkspaceSnapshotInput): WorkspaceSnapshot {
  return {
    diagramId: input.diagramId,
    diagramTitle: input.diagramTitle,
    code: input.code,
    nodes: input.nodes,
    edges: input.edges,
    currentUser: input.currentUser,
    isDrawingMode: input.isDrawingMode,
    hasUnsavedChanges: input.hasUnsavedChanges,
    zoomLevel: input.zoomLevel,
    parseError: input.parseError,
    source: input.source,
    artifactKind: input.artifactKind,
    workspaceRoot: input.workspaceRoot,
    currentFilePath: input.currentFilePath,
    workspaceCapability: input.workspaceCapability,
    workspaceFiles: input.workspaceFiles,
    updatedAt: input.updatedAt,
  };
}
