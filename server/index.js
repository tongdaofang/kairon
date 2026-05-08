// Kairon Server — API proxy & static file serving
// Run with: node server/index.js
// Or via Docker: docker run -p 3000:3000 kairon

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')
const PORT = parseInt(process.env.PORT || '3000', 10)

// MIME types for static files
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain',
}

// Serve static files
function serveStatic(reqUrl, res) {
  let filePath = path.join(DIST, reqUrl === '/' ? 'index.html' : reqUrl)

  // SPA fallback: serve index.html for non-file requests
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html')
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  try {
    const content = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not Found')
  }
}

// Proxy API calls to LLM providers
async function proxyAPI(req, res) {
  let body = ''
  req.on('data', chunk => (body += chunk))
  req.on('end', async () => {
    try {
      const { url, method, headers: reqHeaders, data } = JSON.parse(body)
      
      // Block dangerous URLs
      const parsed = new URL(url)
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0') {
        // Allow local Ollama
        if (!url.includes('ollama') && !url.includes('11434')) {
          res.writeHead(403)
          res.end(JSON.stringify({ error: 'Forbidden' }))
          return
        }
      }

      const response = await fetch(url, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(reqHeaders || {}),
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseText = await response.text()
      res.writeHead(response.status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(responseText)
    } catch (error) {
      res.writeHead(500)
      res.end(JSON.stringify({ error: error.message }))
    }
  })
}

// Health check
function healthCheck(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'ok',
    version: '0.1.0',
    name: 'Kairon',
  }))
}

// Request handler
const server = http.createServer((req, res) => {
  // CORS headers for everything
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  switch (pathname) {
    case '/api/health':
      healthCheck(res)
      break
    case '/api/proxy':
      if (req.method === 'POST') {
        proxyAPI(req, res)
      } else {
        res.writeHead(405)
        res.end('Method Not Allowed')
      }
      break
    default:
      serveStatic(pathname, res)
  }
})

server.listen(PORT, () => {
  console.log(`⚡ Kairon server running at http://localhost:${PORT}`)
  console.log(`   Serving ${DIST}`)
})
