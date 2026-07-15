#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install the current LTS version from nodejs.org."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
