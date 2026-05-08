#!/usr/bin/env bash
# Kairon — One-click Installer
# Usage: curl -fsSL https://get.kairon.dev | sh

set -e

REPO="tongdaofang/kairon"
BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ██ █████  ██ █████"
echo "  ██ ██   ██ ██ ██   ██"
echo "  ██ ███████ ██ ███████"
echo "  ██ ██   ██ ██ ██   ██"
echo "  ██ ██   ██ ██ ██   ██"
echo -e "${NC}"
echo -e "${GREEN}Kairon — Your personal AI computer${NC}"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

install_docker() {
  echo -e "${YELLOW}Installing Kairon with Docker...${NC}"

  if ! command -v docker &>/dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
  fi

  # Pull and run
  docker pull ghcr.io/$REPO:latest 2>/dev/null || {
    echo "Building from source..."
    git clone --depth=1 https://github.com/$REPO.git /tmp/kairon
    cd /tmp/kairon
    docker build -t kairon .
  }

  docker run -d \
    --name kairon \
    -p 3000:3000 \
    --restart unless-stopped \
    kairon

  echo ""
  echo -e "${GREEN}✅ Kairon is running!${NC}"
  echo "   Open http://localhost:3000 in your browser"
  echo ""
  echo -e "${YELLOW}Quick start:${NC}"
  echo "  1. Open http://localhost:3000"
  echo "  2. Click ⚙️ Settings in the sidebar"
  echo "  3. Enter your OpenAI API key"
  echo "  4. Start chatting!"
}

install_npm() {
  echo -e "${YELLOW}Installing Kairon with npm...${NC}"

  if ! command -v node &>/dev/null; then
    echo "Node.js not found. Please install Node.js 18+ first:"
    echo "  https://nodejs.org"
    exit 1
  fi

  git clone --depth=1 https://github.com/$REPO.git /tmp/kairon
  cd /tmp/kairon
  npm install
  npm run build
  node server/index.js &

  echo ""
  echo -e "${GREEN}✅ Kairon is running!${NC}"
  echo "   Open http://localhost:3000"
}

# Main
echo "Select installation method:"
echo "  1) Docker (recommended) — one command, isolated"
echo "  2) npm — run directly on your machine"
echo "  3) Exit"
echo ""
read -r -p "Choose [1/2/3]: " choice

case "$choice" in
  1|"") install_docker ;;
  2) install_npm ;;
  3) echo "Bye!"; exit 0 ;;
  *) echo "Invalid choice"; exit 1 ;;
esac
