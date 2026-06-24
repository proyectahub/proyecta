#!/bin/bash
# PROYECTA Production Startup Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║          PROYECTA Production Launcher                         ║
║          Decentralized Research Crowdfunding                  ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check Node.js
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install Node.js 18+ and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Build frontend
echo -e "\n${YELLOW}📦 Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# Start backend
echo -e "\n${YELLOW}🚀 Starting backend proxy...${NC}"
export NODE_ENV=production
export PORT=3001

node server.js &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "\n${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001/api/mining/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Display status
echo -e "\n${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   🎉 PROYECTA ONLINE 🎉                      ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║  📍 Frontend:  http://localhost:5174 (or your domain)         ║"
echo "║  📍 Backend:   http://localhost:3001/api/mining               ║"
echo "║  🔗 Pool:      wss://pool.supportxmr.com:3333               ║"
echo "║                                                               ║"
echo "║  Features:                                                    ║"
echo "║  ✅ Email/Password authentication                            ║"
echo "║  ✅ ORCID integration                                         ║"
echo "║  ✅ Project creation (Non-custodial)                          ║"
echo "║  ✅ Real CPU mining (RandomX simulation)                      ║"
echo "║  ✅ SupportXMR pool connection                                ║"
echo "║  ✅ Blockchain verification (xmrchain.net)                   ║"
echo "║                                                               ║"
echo "║  Health Check:                                               ║"
echo "║  curl http://localhost:3001/api/mining/health               ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Keep running
wait $BACKEND_PID
