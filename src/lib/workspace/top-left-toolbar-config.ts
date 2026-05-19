import type { WorkspaceArtifactKind } from "./action-types";

export const LOCAL_WORKSPACE_FILE_EXTENSIONS = [".mmd", ".md", ".json"] as const;

export interface ArtifactTemplate {
  id: WorkspaceArtifactKind;
  label: string;
  description: string;
  defaultFileName: string;
  title: string;
  content: string;
}

export const ARTIFACT_TEMPLATES: ArtifactTemplate[] = [
  {
    id: "diagram",
    label: "New diagram",
    description: "Start a fresh Mermaid-based BA process map.",
    defaultFileName: "diagram.mmd",
    title: "Untitled",
    content:
      'graph TD;\n    Customer["Customer"] %% shape:actor x:100 y:100 w:80 h:80 rot:0\n    Analyst["Business Analyst"] %% shape:rectangle x:320 y:220 w:140 h:50 rot:0\n\n    Customer -->|Request| Analyst;\n',
  },
  {
    id: "requirements-note",
    label: "New requirements note",
    description: "Capture BA notes, assumptions, and open questions.",
    defaultFileName: "requirements-note.md",
    title: "Requirements note",
    content:
      "# Requirements note\n\n## Problem\n-\n\n## Stakeholders\n-\n\n## Current observations\n-\n\n## Open questions\n-\n",
  },
  {
    id: "ba-brief",
    label: "New BA brief",
    description: "Summarize goals, scope, and process changes for review.",
    defaultFileName: "ba-brief.md",
    title: "BA brief",
    content:
      "# BA brief\n\n## Objective\n-\n\n## In scope\n-\n\n## Out of scope\n-\n\n## Workflow changes\n-\n\n## Risks\n-\n",
  },
];

export interface QuickInsertAction {
  id: "insert-actor" | "insert-process" | "insert-decision" | "insert-note";
  label: string;
  shapeType: string;
}

export const QUICK_INSERT_ACTIONS: QuickInsertAction[] = [
  { id: "insert-actor", label: "Actor", shapeType: "actor" },
  { id: "insert-process", label: "Process", shapeType: "process" },
  { id: "insert-decision", label: "Decision", shapeType: "diamond" },
  { id: "insert-note", label: "Note", shapeType: "note" },
];
