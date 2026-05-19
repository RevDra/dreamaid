import type { Edge, Node } from "reactflow";

import type { User } from "../api";

export interface WorkspaceParseError {
  line: number;
  message: string;
  lineText: string;
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
  };
}
