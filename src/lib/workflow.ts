// Kairon Workflow Engine
// Orchestrates multiple Agent nodes in a DAG (Directed Acyclic Graph)

import type { AgentSettings } from '../components/SettingsModal'
import { createRuntime } from './runtime'
import { builtinToolMap } from './tools'

// --- Types ---

export interface WorkflowNodeData {
  label: string
  type: 'agent' | 'tool' | 'input' | 'output' | 'trigger'
  config?: {
    model?: AgentSettings
    toolName?: string
    systemPrompt?: string
    inputMapping?: Record<string, string>  // map input port to node output
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowGraphNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface WorkflowDefinition {
  id: string
  name: string
  nodes: WorkflowGraphNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowExecutionResult {
  nodeId: string
  output: string
  duration: number
  error?: string
}

// --- Execution Engine ---

export class WorkflowEngine {
  private definition: WorkflowDefinition
  private results: Map<string, WorkflowExecutionResult> = new Map()

  constructor(definition: WorkflowDefinition) {
    this.definition = definition
  }

  async execute(): Promise<Map<string, WorkflowExecutionResult>> {
    this.results.clear()
    const { nodes, edges } = this.definition

    // Topological sort to determine execution order
    const order = this.topologicalSort(nodes.map(n => n.id), edges)
    
    for (const nodeId of order) {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) continue

      const nodeData = node.data as unknown as WorkflowNodeData

      // Get inputs from upstream nodes
      const upstreamEdges = edges.filter(e => e.target === nodeId)
      const inputs: Record<string, string> = {}
      
      for (const edge of upstreamEdges) {
        const upstreamResult = this.results.get(edge.source)
        if (upstreamResult) {
          const portName = edge.targetHandle || 'default'
          inputs[portName] = upstreamResult.output
        }
      }

      try {
        const startTime = Date.now()
        const output = await this.executeNode(node, nodeData, inputs)
        const duration = Date.now() - startTime

        this.results.set(nodeId, {
          nodeId,
          output,
          duration,
        })
      } catch (error) {
        this.results.set(nodeId, {
          nodeId,
          output: '',
          duration: 0,
          error: String(error),
        })
      }
    }

    return this.results
  }

  private async executeNode(
    node: WorkflowGraphNode,
    data: WorkflowNodeData,
    inputs: Record<string, string>
  ): Promise<string> {
    // data is passed directly

    switch (data.type) {
      case 'input': {
        // Input node returns its configured text content
        return data.config?.systemPrompt || ''
      }

      case 'output': {
        // Output node collects all inputs and returns as formatted result
        return Object.entries(inputs)
          .map(([port, value]) => `[${port}]\n${value}`)
          .join('\n\n')
      }

      case 'agent': {
        // Agent node runs a model with collected inputs as context
        if (!data.config?.model) {
          throw new Error('Agent node requires model configuration')
        }

        const combinedInput = Object.entries(inputs)
          .map(([port, value]) => `<${port}>\n${value}\n</${port}>`)
          .join('\n\n')

        const runtime = createRuntime({
          model: {
            provider: data.config.model.provider,
            model: data.config.model.model,
            apiKey: data.config.model.apiKey || undefined,
            baseUrl: data.config.model.baseUrl || undefined,
            temperature: data.config.model.temperature,
          },
          systemPrompt: data.config.systemPrompt || 'You are a helpful AI agent in a workflow pipeline.',
          tools: Array.from(builtinToolMap.values()),
        })

        const response = await runtime.complete({
          messages: [
            { role: 'system', content: data.config.systemPrompt || 'You are a helpful AI agent.' },
            { role: 'user', content: combinedInput || 'Process the workflow step.' },
          ],
        })

        return response
      }

      case 'tool': {
        // Tool node executes a specific tool
        const toolName = data.config?.toolName
        if (!toolName) throw new Error('Tool node requires a tool name')

        const tool = builtinToolMap.get(toolName)
        if (!tool) throw new Error(`Tool "${toolName}" not found`)

        const combinedInput = Object.entries(inputs)
          .map(([_, value]) => value)
          .join('\n')

        const result = await tool.handler({ 
          query: combinedInput,
          input: combinedInput,
        })
        
        if (!result.success) {
          throw new Error(result.error || 'Tool execution failed')
        }

        return typeof result.data === 'string' 
          ? result.data 
          : JSON.stringify(result.data, null, 2)
      }

      case 'trigger': {
        // Trigger node is a pass-through
        return Object.values(inputs).join('\n') || 'triggered'
      }

      default:
        throw new Error(`Unknown node type: ${data.type}`)
    }
  }

  private topologicalSort(
    nodes: string[],
    edges: WorkflowEdge[]
  ): string[] {
    const adj = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    for (const node of nodes) {
      adj.set(node, [])
      inDegree.set(node, 0)
    }

    for (const edge of edges) {
      const neighbors = adj.get(edge.source)
      if (neighbors) {
        neighbors.push(edge.target)
      }
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    }

    // Kahn's algorithm
    const queue: string[] = []
    const result: string[] = []

    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node)
    }

    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)

      for (const neighbor of adj.get(node) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) queue.push(neighbor)
      }
    }

    return result
  }

  getResult(nodeId: string): WorkflowExecutionResult | undefined {
    return this.results.get(nodeId)
  }
}

export function createWorkflow(def: WorkflowDefinition): WorkflowEngine {
  return new WorkflowEngine(def)
}
