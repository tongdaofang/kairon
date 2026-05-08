<div align="center">
  <br/>
  <pre>
    ██ █████  ██ █████
    ██ ██   ██ ██ ██   ██
    ██ ███████ ██ ███████
    ██ ██   ██ ██ ██   ██
    ██ ██   ██ ██ ██   ██
  </pre>
  <h1>Kairon</h1>
  <p><strong>Your personal AI computer.</strong></p>
  <p>Open-source AI Agent desktop OS. Self-hosted. Extensible. Yours.</p>
  <br/>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#roadmap">Roadmap</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/version-0.1.0--alpha-6c5ce7" alt="version"/>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="license"/>
    <img src="https://img.shields.io/badge/built%20with-Tauri%20%2B%20React-purple" alt="tech"/>
  </p>

  <br/>
</div>

---

## ⚡ What is Kairon?

**Kairon** (from Greek *Kairos* — the right/critical moment) is an **open-source AI Agent operating system** that runs on your desktop.

Not another framework. Not another library. A complete, portable AI computer that you own.

```bash
# One command to get started
curl -fsSL https://get.kairon.dev | sh
```

### Why Kairon?

| vs | Frameworks (LangChain, AutoGen...) | SaaS (ChatGPT, Claude...) | **Kairon** |
|----|------------------------------------|---------------------------|------------|
| **开箱即用** | ❌ 需要写代码 | ✅ 但闭源收费 | ✅ **开源免费** |
| **本地模型** | 自行折腾 | ❌ 不支持 | ✅ **一键集成 Ollama** |
| **插件生态** | 各玩各的 | 无 | ✅ **标准化插件市场** |
| **数据主权** | ✅ 在你手里 | ❌ 在云端 | ✅ **全在你本地** |
| **多 Agent** | 代码配置 | ❌ 单一 | ✅ **可视化编排** |

---

## ✨ Features

### 🖥️ Agent Desktop
Web + 桌面双端。内置聊天界面，支持 Markdown、代码高亮、多会话管理。

### 🤖 Multi-Model
接入 OpenAI、Claude、DeepSeek、Google Gemini，以及通过 **Ollama** 运行本地模型（Llama、Qwen、DeepSeek 本地版）。

```ts
// One config to rule them all
const runtime = createRuntime({
  model: {
    provider: 'ollama',
    model: 'llama3.2',
    baseUrl: 'http://localhost:11434'
  }
})
```

### 🔧 Built-in Tool System
| Tool | Description |
|------|-------------|
| 📁 **File Ops** | Read, write, search local files |
| ▶️ **Code Exec** | Run JS/Python in a sandbox |
| 🌐 **Browser** | Automate web interactions |
| 🔍 **Search** | Real-time web search |
| 📄 **Web Fetch** | Extract content from URLs |

### 🔌 Plugin System (Coming in v0.2)
Like VSCode — anyone can write and publish plugins.

### 🎯 Agent Orchestration (Coming in v0.2)
Visual drag-and-drop workflow editor. Chain agents together.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- (For desktop app) Tauri dependencies

### Try the Web App

```bash
git clone https://github.com/YOUR_USERNAME/kairon.git
cd kairon
npm install
npm run dev
```

### One-Click Install (Coming Soon)

```bash
# Linux / macOS
curl -fsSL https://get.kairon.dev | sh

# Docker
docker run -d -p 3000:3000 kairon/server
```

---

## 🧠 Agent Runtime

Kairon ships with a lightweight, framework-agnostic Agent Runtime:

```ts
import { createRuntime, builtinTools } from 'kairon'

const agent = createRuntime({
  model: { provider: 'openai', model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY },
  systemPrompt: 'You are a helpful AI assistant with access to tools.',
  tools: builtinTools,
})

const response = await agent.complete({
  messages: [{ role: 'user', content: 'Search the web for latest AI news' }],
  onChunk: (text) => process.stdout.write(text),
})
```

---

## 🗺️ Roadmap

### v0.1 (Current — MVP)
- [x] Project skeleton (Tauri + React + Rust)
- [x] Chat UI with session management
- [x] Agent Runtime (OpenAI, Ollama)
- [x] Built-in tools (file, web, code)
- [ ] One-click installer
- [ ] Claude & DeepSeek adapters
- [ ] Plugin system MVP

### v0.2 (Growth)
- [ ] Visual agent workflow editor
- [ ] Plugin marketplace
- [ ] Memory & context management
- [ ] Browser automation tool
- [ ] Linux/macOS/Windows desktop packages

### v0.3 (Scale)
- [ ] Multi-agent orchestration
- [ ] Team collaboration
- [ ] Enterprise auth & permissions
- [ ] VS Code extension

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| **Desktop** | [Tauri](https://tauri.app) + React + TypeScript |
| **Backend** | Rust (Tauri core) |
| **UI** | React, CSS Modules |
| **Agent Runtime** | TypeScript (framework-agnostic) |
| **Build** | Vite |

---

## 🤝 Contributing

Kairon is in its early stages and we'd love your help!

- 🐛 **Found a bug?** Open an issue
- 💡 **Have an idea?** Start a discussion
- 🔧 **Want to contribute?** Check our [contributing guide](CONTRIBUTING.md)

---

## 📜 License

MIT — because open source should stay open.

---

<div align="center">
  <sub>Built with ⚡ by the Kairon team.</sub>
  <br/>
  <sub>Kairon is Greek for "the right moment" — this is ours.</sub>
</div>
