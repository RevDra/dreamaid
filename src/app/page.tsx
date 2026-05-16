"use client";

import React, { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  NodeChange,
  EdgeChange,
  Edge,
  Viewport,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { 
  Play, PlusCircle, Link as LinkIcon, Save, Download,
  PanelLeft, PanelBottom, PanelRight, Search, Folder,
  FileCode, File, ChevronDown, ChevronRight, Menu,
  MoreHorizontal, Sun, Moon, Database, Cloud, FileText,
  Hexagon, Triangle, Type, Circle
} from "lucide-react";

// --- LOGIC: CHUYỂN TEXT SANG CẤU TRÚC NODE/EDGE ---
const parseMermaid = (code: string) => {
  const nodesMap = new Map<string, Node>();
  const edges: Edge[] = [];
  const lines = code.split('\n');

  // Regex hỗ trợ các mẫu: A --> B, A[Text] --> B[Text], A -->|Label| B
  const edgeRegex = /([a-zA-Z0-9_]+)(?:\[(.*?)\])?\s*(-+>)\s*(?:\|(.*?)\|)?\s*([a-zA-Z0-9_]+)(?:\[(.*?)\])?/;
  const nodeRegex = /^\s*([a-zA-Z0-9_]+)\[(.*?)\]\s*$/;

  lines.forEach((line, index) => {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('graph') || cleanLine.startsWith('flowchart')) return;

    const edgeMatch = cleanLine.match(edgeRegex);
    if (edgeMatch) {
      const [_, sourceId, sourceLabel, arrow, edgeLabel, targetId, targetLabel] = edgeMatch;

      // Xử lý Source Node
      if (!nodesMap.has(sourceId)) {
        nodesMap.set(sourceId, { id: sourceId, position: { x: 0, y: 0 }, data: { label: sourceLabel || sourceId } });
      } else if (sourceLabel) {
        nodesMap.get(sourceId)!.data.label = sourceLabel;
      }

      // Xử lý Target Node
      if (!nodesMap.has(targetId)) {
        nodesMap.set(targetId, { id: targetId, position: { x: 0, y: 0 }, data: { label: targetLabel || targetId } });
      } else if (targetLabel) {
        nodesMap.get(targetId)!.data.label = targetLabel;
      }

      // Tạo Edge
      edges.push({
        id: `e${sourceId}-${targetId}-${index}`,
        source: sourceId,
        target: targetId,
        label: edgeLabel || undefined,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      });
    } else {
      // Xử lý Node đứng độc lập
      const nodeMatch = cleanLine.match(nodeRegex);
      if (nodeMatch) {
        const [_, nodeId, label] = nodeMatch;
        if (!nodesMap.has(nodeId)) {
          nodesMap.set(nodeId, { id: nodeId, position: { x: 0, y: 0 }, data: { label } });
        } else {
          nodesMap.get(nodeId)!.data.label = label;
        }
      }
    }
  });

  return { nodes: Array.from(nodesMap.values()), edges };
};

// --- LOGIC: AUTO-LAYOUT BẰNG DAGRE ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const nodeWidth = 172; // Chiều rộng ước tính của node
  const nodeHeight = 36; // Chiều cao ước tính của node

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Tính toán lại tọa độ để node nằm ở giữa (center)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const SHAPE_CATEGORIES = ["Scratchpad", "General", "Misc", "Basic", "Arrows", "Flowchart", "Entity Relation", "UML"];

export default function IDEPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  const [openShapeMenus, setOpenShapeMenus] = useState<Record<string, boolean>>({ "General": true, "Flowchart": true });
  const [explorerWidth, setExplorerWidth] = useState<number>(256);
  const [editorWidth, setEditorWidth] = useState<number>(500);
  
  const [isDraggingExplorer, setIsDraggingExplorer] = useState(false);
  const [isDraggingEditor, setIsDraggingEditor] = useState(false);

  const [code, setCode] = useState<string>("graph TD;\n    A[Start: Nhận yêu cầu] -->|Tiến hành| B[Process: Phân tích];");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // --- SỰ KIỆN: ĐỒNG BỘ CODE SANG CANVAS ---
  const handleSync = useCallback(() => {
    try {
      const parsedData = parseMermaid(code);
      const layoutedData = getLayoutedElements(parsedData.nodes, parsedData.edges);
      setNodes([...layoutedData.nodes]);
      setEdges([...layoutedData.edges]);
    } catch (error) {
      console.error("Lỗi parse Mermaid:", error);
      alert("Cú pháp Mermaid không hợp lệ. Vui lòng kiểm tra lại.");
    }
  }, [code]);

  // Render lần đầu tiên
  useEffect(() => {
    handleSync();
  }, []);

  const toggleShapeMenu = (category: string) => setOpenShapeMenus(prev => ({ ...prev, [category]: !prev[category] }));

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingExplorer) {
      setExplorerWidth(Math.max(150, Math.min(e.clientX, 500)));
    } else if (isDraggingEditor) {
      const offset = isSidebarOpen ? explorerWidth : 0;
      const rightPanelOffset = isRightPanelOpen ? 256 : 0;
      setEditorWidth(Math.max(200, Math.min(e.clientX - offset, window.innerWidth - 300 - rightPanelOffset)));
    }
  }, [isDraggingExplorer, isDraggingEditor, isSidebarOpen, explorerWidth, isRightPanelOpen]);

  const handleMouseUp = useCallback(() => { setIsDraggingExplorer(false); setIsDraggingEditor(false); }, []);

  useEffect(() => {
    if (isDraggingExplorer || isDraggingEditor) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "auto";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "auto";
    };
  }, [isDraggingExplorer, isDraggingEditor, handleMouseMove, handleMouseUp]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const handleEditorChange = (value: string | undefined) => { if (value) setCode(value); };
  const handleMove = useCallback((event: any, viewport: Viewport) => { setZoomLevel(viewport.zoom); }, []);

  const theme = isDarkMode
    ? { bgMain: "bg-[#1e1e1e]", text: "text-[#cccccc]", textMuted: "text-slate-400", border: "border-[#2b2b2b]", toolbar: "bg-[#181818]", hover: "hover:bg-[#333333]", searchBg: "bg-[#2b2b2b]", searchBorder: "border-[#3c3c3c]", itemHover: "hover:bg-[#2a2d2e]", itemActive: "bg-[#37373d]", editorTabTop: "border-blue-500", shapeBorder: "border-[#4b4b4b]", shapeFill: "bg-[#252526]" }
    : { bgMain: "bg-white", text: "text-slate-800", textMuted: "text-slate-500", border: "border-slate-300", toolbar: "bg-[#f3f3f3]", hover: "hover:bg-[#e4e4e4]", searchBg: "bg-white", searchBorder: "border-slate-300", itemHover: "hover:bg-slate-100", itemActive: "bg-[#e4e6f1] text-blue-700", editorTabTop: "border-blue-600", shapeBorder: "border-slate-300", shapeFill: "bg-white" };

  const renderShapeItems = (category: string) => {
    const defaultPlaceholder = [...Array(4)].map((_, i) => (<div key={i} className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`}><div className={`w-4 h-4 border-2 border-dashed ${theme.shapeBorder}`}></div></div>));
    if (category === "General") {
      return (
        <>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Rectangle"><div className={`w-6 h-4 border-2 ${theme.shapeBorder} ${theme.shapeFill}`}></div></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Rounded Rectangle"><div className={`w-6 h-4 border-2 rounded-sm ${theme.shapeBorder} ${theme.shapeFill}`}></div></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Ellipse"><Circle size={18} className={theme.textMuted} /></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Text"><Type size={18} className={theme.textMuted} /></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Diamond"><div className={`w-4 h-4 border-2 rotate-45 ${theme.shapeBorder} ${theme.shapeFill}`}></div></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Database"><Database size={18} className={theme.textMuted} /></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Hexagon"><Hexagon size={18} className={theme.textMuted} /></div>
          <div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Cloud"><Cloud size={18} className={theme.textMuted} /></div>
        </>
      );
    }
    if (category === "Flowchart") return (<><div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Document"><FileText size={18} className={theme.textMuted} /></div><div className={`aspect-square rounded ${theme.shapeBorder} border ${theme.shapeFill} hover:border-blue-500 cursor-grab flex items-center justify-center`} title="Triangle"><Triangle size={18} className={theme.textMuted} /></div>{defaultPlaceholder}</>);
    if (category === "Scratchpad") return <div className={`col-span-4 p-2 text-center text-[11px] italic ${theme.textMuted}`}>Kéo thả ảnh hoặc khối vào đây</div>;
    return defaultPlaceholder;
  };

  return (
    <div className={`flex flex-col h-screen w-full ${theme.bgMain} ${theme.text} font-sans overflow-hidden transition-colors duration-200`}>
      <div className={`flex items-center justify-between h-10 px-3 ${theme.toolbar} border-b ${theme.border} text-sm select-none shrink-0`}>
        <div className="flex items-center gap-4">
          <Menu size={16} className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`} />
          <div className="hidden md:flex gap-3 text-[13px]">{['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Help'].map(item => (<span key={item} className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`}>{item}</span>))}</div>
        </div>
        <div className={`flex-1 max-w-md mx-4 ${theme.searchBg} rounded-md h-6 flex items-center px-2 justify-center border ${theme.searchBorder} cursor-pointer ${theme.hover} transition`}><Search size={14} className={`mr-2 ${theme.textMuted}`} /><span className={`text-xs ${theme.textMuted}`}>ba-ide-mvp</span></div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1 mr-2 rounded transition ${theme.hover}`} title="Toggle Theme">{isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-600" />}</button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-1 rounded transition ${isSidebarOpen ? (isDarkMode ? 'bg-[#333333] text-white' : 'bg-[#e4e4e4] text-black') : theme.hover}`} title="Toggle Primary Side Bar"><PanelLeft size={16} /></button>
          <button className={`p-1 ${theme.hover} rounded transition`}><PanelBottom size={16} /></button>
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className={`p-1 rounded transition ${isRightPanelOpen ? (isDarkMode ? 'bg-[#333333] text-white' : 'bg-[#e4e4e4] text-black') : theme.hover}`} title="Toggle Right Panel"><PanelRight size={16} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div style={{ width: explorerWidth }} className={`flex flex-col shrink-0 overflow-y-auto ${theme.bgMain}`}>
            <div className={`flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}><span>Explorer</span><MoreHorizontal size={14} className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`} /></div>
            <div className="flex flex-col text-[13px] mt-1">
              <div className={`flex items-center gap-1 px-2 py-1 cursor-pointer ${theme.itemHover} transition`}><ChevronDown size={14} /> <Folder size={14} className="text-blue-400" /> <span className="font-semibold">BA_WORKSPACE</span></div>
              <div className={`flex items-center gap-1 pl-6 pr-2 py-1 cursor-pointer ${theme.itemActive} ${isDarkMode ? 'border-l-2 border-blue-500' : ''}`}><FileCode size={14} className="text-yellow-400" /> <span className={isDarkMode ? 'text-white' : 'font-medium'}>diagram.mmd</span></div>
              <div className={`flex items-center gap-1 pl-6 pr-2 py-1 cursor-pointer ${theme.itemHover} transition ${theme.textMuted}`}><File size={14} /> <span>requirements.md</span></div>
            </div>
          </div>
        )}
        {isSidebarOpen && <div className={`w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-10 ${theme.border} border-l`} onMouseDown={() => setIsDraggingExplorer(true)} />}

        <div className="flex flex-1 overflow-hidden">
          <div style={{ width: editorWidth }} className="flex flex-col shrink-0 min-w-[200px]">
            <div className={`flex items-center h-9 ${theme.bgMain} border-b ${theme.border} overflow-x-auto shrink-0`}><div className={`flex items-center gap-2 px-4 py-2 ${theme.bgMain} border-t-2 ${theme.editorTabTop} text-[13px] cursor-pointer`}><FileCode size={14} className="text-yellow-400" /> <span className={isDarkMode ? 'text-white' : 'text-black'}>diagram.mmd</span></div></div>
            <div className={`flex-1 ${theme.bgMain}`}>
              <Editor height="100%" defaultLanguage="markdown" theme={isDarkMode ? "vs-dark" : "light"} value={code} onChange={handleEditorChange} options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", padding: { top: 16 } }} />
            </div>
          </div>
          <div className={`w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-10 ${theme.border} border-l`} onMouseDown={() => setIsDraggingEditor(true)} />

          <div className="flex-1 relative bg-slate-50 min-w-[200px] flex flex-col">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-lg border border-slate-200 text-slate-700">
              <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Add Node"><PlusCircle size={18} /></button>
              <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Add Edge"><LinkIcon size={18} /></button>
              <div className="w-px h-5 bg-slate-300 mx-1"></div>
              {/* NÚT SYNC KÍCH HOẠT CHUYỂN ĐỔI */}
              <button onClick={handleSync} className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition shadow-sm" title="Sync Code">
                <Play size={14} /> <span className="hidden xl:inline">Sync</span>
              </button>
            </div>
            <div className={`absolute top-4 left-4 z-10 px-2 py-1 text-xs font-medium rounded-md shadow border ${theme.border} ${theme.bgMain} ${theme.text}`}>{(zoomLevel * 100).toFixed(0)}%</div>
            <div className="flex-1 w-full h-full">
              <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onMove={handleMove} fitView>
                <Background color="#cbd5e1" gap={16} />
                <Controls className="bg-white border-slate-200 fill-slate-600 mb-4 mr-4 shadow-sm rounded-md" />
                <MiniMap nodeColor="#94a3b8" maskColor="rgba(248, 250, 252, 0.7)" className="shadow-sm rounded-md border border-slate-200" />
              </ReactFlow>
            </div>
          </div>
        </div>

        {isRightPanelOpen && (
          <div className={`w-64 border-l ${theme.border} flex flex-col shrink-0 overflow-y-auto ${theme.bgMain} pb-10`}>
            <div className={`flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider ${theme.textMuted} border-b ${theme.border}`}><span>Shapes Library</span></div>
            {SHAPE_CATEGORIES.map((category) => {
              const isOpen = openShapeMenus[category];
              return (
                <div key={category} className="flex flex-col">
                  <div onClick={() => toggleShapeMenu(category)} className={`flex items-center gap-2 px-2 py-2 cursor-pointer ${theme.itemHover} border-b ${theme.border} select-none`}>
                    {isOpen ? <ChevronDown size={16} className={theme.textMuted} /> : <ChevronRight size={16} className={theme.textMuted} />} <span className="text-[13px] font-semibold">{category}</span>
                  </div>
                  {isOpen && <div className={`grid grid-cols-4 gap-2 p-3 border-b ${theme.border}`}>{renderShapeItems(category)}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
