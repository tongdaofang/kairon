import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import KaironNode from './nodes/KaironNode'
import type { WorkflowNodeData, WorkflowDefinition } from '../lib/workflow'
import { WorkflowEngine } from '../lib/workflow'
import type { AgentSettings } from './SettingsModal'
import './WorkflowEditor.css'

const nodeTypes = { kaironNode: KaironNode }

interface WorkflowEditorProps {
  settings: AgentSettings
}

const NODE_PALETTE = [
  { type: 'agent', label: 'Agent', icon: '🤖', desc: 'AI model call' },
  { type: 'tool', label: 'Tool', icon: '🔧', desc: 'Built-in tool' },
  { type: 'input', label: 'Input', icon: '📥', desc: 'Start data' },
  { type: 'output', label: 'Output', icon: '📤', desc: 'Result' },
  { type: 'trigger', label: 'Trigger', icon: '⚡', desc: 'Workflow start' },
]

let nodeIdCounter = 0

export default function WorkflowEditor({ settings }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as any[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any[])
  const [name, setName] = useState('Untitled Workflow')
  const [executing, setExecuting] = useState(false)
  const [results, setResults] = useState<Map<string, string> | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: any[]) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      nodeIdCounter++

      const newNode = {
        id: `node-${nodeIdCounter}`,
        type: 'kaironNode',
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeIdCounter}`,
          type,
          config: type === 'agent' ? {
            model: settings,
            systemPrompt: 'You are a helpful AI agent in a workflow.',
          } : type === 'tool' ? {
            toolName: 'web_search',
          } : type === 'input' ? {
            systemPrompt: 'Enter input data here...',
          } : undefined,
        },
      }

      setNodes((nds: any[]) => [...nds, newNode])
    },
    [reactFlowInstance, settings, setNodes]
  )

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const executeWorkflow = async () => {
    if (nodes.length === 0) return
    setExecuting(true)
    setResults(null)

    const definition: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name,
      nodes: nodes.map((n: any) => ({
        id: n.id,
        type: n.type || '',
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    }

    try {
      const engine = new WorkflowEngine(definition)
      const executionResults = await engine.execute()

      const resultMap = new Map<string, string>()
      for (const [nodeId, result] of executionResults) {
        const node = nodes.find((n: any) => n.id === nodeId)
        const wfData = node?.data as WorkflowNodeData | undefined
        resultMap.set(wfData?.label || nodeId, result.error ? `❌ ${result.error}` : result.output)
      }
      setResults(resultMap)
    } catch (error: any) {
      const errMap = new Map<string, string>()
      errMap.set('Error', String(error?.message || error))
      setResults(errMap)
    } finally {
      setExecuting(false)
    }
  }

  const clearCanvas = () => {
    setNodes([] as any[])
    setEdges([] as any[])
    setResults(null)
    nodeIdCounter = 0
  }

  return (
    <div className="workflow-editor">
      <div className="workflow-toolbar">
        <input
          className="workflow-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workflow name..."
        />
        <div className="toolbar-actions">
          <button
            className="toolbar-btn execute-btn"
            onClick={executeWorkflow}
            disabled={executing || nodes.length === 0}
          >
            {executing ? '⏳ Running...' : '▶ Run'}
          </button>
          <button className="toolbar-btn" onClick={clearCanvas}>
            🗑 Clear
          </button>
        </div>
      </div>

      <div className="workflow-body">
        <div className="node-palette">
          <div className="palette-title">Nodes</div>
          {NODE_PALETTE.map((item) => (
            <div
              key={item.type}
              className="palette-item"
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
            >
              <span className="palette-icon">{item.icon}</span>
              <div>
                <div className="palette-label">{item.label}</div>
                <div className="palette-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flow-canvas" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <MiniMap
                nodeColor={(n: any) => {
                  const d = n.data as WorkflowNodeData
                  const colors: Record<string, string> = {
                    agent: '#6c5ce7', tool: '#00cec9', input: '#55efc4',
                    output: '#fdcb6e', trigger: '#e17055',
                  }
                  return colors[d?.type] || '#6c5ce7'
                }}
                style={{ background: '#1a1a23', border: '1px solid #2a2a3a' }}
              />
              <Background color="#2a2a3a" gap={20} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {results && (
          <div className="results-panel">
            <div className="results-header">
              <span>📊 Results</span>
              <button onClick={() => setResults(null)} className="close-btn">✕</button>
            </div>
            <div className="results-body">
              {Array.from(results.entries()).map(([label, output]) => (
                <div key={label} className="result-item">
                  <div className="result-label">{label}</div>
                  <pre className="result-output">{output.slice(0, 500)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="workflow-hint">
        Drag nodes from the palette onto the canvas. Connect them by dragging between handles.
      </div>
    </div>
  )
}
