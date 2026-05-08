import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { WorkflowNodeData } from '../../lib/workflow'

const NODE_ICONS: Record<string, string> = {
  agent: '🤖',
  tool: '🔧',
  input: '📥',
  output: '📤',
  trigger: '⚡',
}

const NODE_COLORS: Record<string, string> = {
  agent: '#6c5ce7',
  tool: '#00cec9',
  input: '#55efc4',
  output: '#fdcb6e',
  trigger: '#e17055',
}

function KaironNode({ data, selected }: NodeProps) {
  const d = data as unknown as WorkflowNodeData
  const color = NODE_COLORS[d.type] || NODE_COLORS.agent
  const icon = NODE_ICONS[d.type] || '⚡'

  return (
    <div className={`kairon-node ${selected ? 'selected' : ''}`} style={{ borderColor: color }}>
      <Handle type="target" position={Position.Left} className="node-handle" />

      <div className="node-header" style={{ background: color }}>
        <span className="node-icon">{icon}</span>
        <span className="node-label">{d.label}</span>
      </div>

      <div className="node-body">
        {d.type === 'agent' && d.config?.model && (
          <div className="node-detail">{d.config.model.provider} / {d.config.model.model}</div>
        )}
        {d.type === 'tool' && d.config?.toolName && (
          <div className="node-detail">{d.config.toolName}</div>
        )}
        {d.type === 'output' && (
          <div className="node-detail">Receives from upstream nodes</div>
        )}
        {d.type === 'input' && d.config?.systemPrompt && (
          <div className="node-detail">{d.config.systemPrompt.slice(0, 30)}...</div>
        )}
        {d.type === 'trigger' && (
          <div className="node-detail">Starts the workflow</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  )
}

export default memo(KaironNode)
