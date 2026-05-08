// Kairon Built-in Tools
import type { ToolDefinition, ToolResult } from './runtime'

// File operations — these run in the Tauri webview and call the Rust backend via invoke
const fileRead: ToolDefinition = {
  name: 'file_read',
  description: 'Read the contents of a file from the local filesystem',
  handler: async (args): Promise<ToolResult> => {
    try {
      const path = args.path as string
      if (!path) return { success: false, error: 'path is required' }

      // Try Tauri API first, fall back to fetch for web mode
      try {
        const { readTextFile } = await import('@tauri-apps/plugin-fs')
        const content = await readTextFile(path)
        return { success: true, data: content }
      } catch {
        // Fallback to fetch-based file reading
        const res = await fetch(`file://${path}`)
        return { success: true, data: await res.text() }
      }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  },
}

const fileWrite: ToolDefinition = {
  name: 'file_write',
  description: 'Write content to a file on the local filesystem',
  handler: async (args): Promise<ToolResult> => {
    try {
      const path = args.path as string
      const content = args.content as string
      if (!path || content === undefined) return { success: false, error: 'path and content are required' }

      try {
        const { writeTextFile } = await import('@tauri-apps/plugin-fs')
        await writeTextFile(path, content)
        return { success: true, data: `Written ${content.length} bytes to ${path}` }
      } catch {
        return { success: false, error: 'File write not available in web mode' }
      }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  },
}

// Web search (DuckDuckGo instant answer API — no key required)
const webSearch: ToolDefinition = {
  name: 'web_search',
  description: 'Search the web for current information',
  handler: async (args): Promise<ToolResult> => {
    try {
      const query = args.query as string
      if (!query) return { success: false, error: 'query is required' }
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Kairon/0.1.0' }
      })
      const data = await res.json()
      return { success: true, data }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  },
}

// Web page fetcher
const webFetch: ToolDefinition = {
  name: 'web_fetch',
  description: 'Fetch and extract content from a URL',
  handler: async (args): Promise<ToolResult> => {
    try {
      const url = args.url as string
      if (!url) return { success: false, error: 'url is required' }
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kairon/0.1.0)' }
      })
      if (!res.ok) return { success: false, error: `HTTP ${res.status}` }
      const text = await res.text()
      return { success: true, data: text.slice(0, 10000) }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  },
}

// Code execution (sandboxed using new Function)
const codeExecute: ToolDefinition = {
  name: 'code_execute',
  description: 'Execute JavaScript code in a sandbox',
  handler: async (args): Promise<ToolResult> => {
    try {
      const code = args.code as string
      if (!code) return { success: false, error: 'code is required' }

      const fn = new Function(`"use strict"; return (async () => { ${code} })()`)
      const result = await fn()
      return { success: true, data: String(result) }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  },
}

export const builtinTools: ToolDefinition[] = [
  fileRead,
  fileWrite,
  webSearch,
  webFetch,
  codeExecute,
]

export const builtinToolMap = new Map(builtinTools.map(t => [t.name, t]))
