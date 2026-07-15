# De-Omega-Point Deployment Guide

## Important distinction

The project contains two different website forms:

1. **Source project**: edit this in VS Code and run it with Vite.
2. **Production website**: upload the contents of `dist/` to your web host.

Do not upload only `index.html`. The `assets/`, worker, manifest and service-worker files must remain beside it.

## Run locally

### macOS
Double-click `start-local.command`, or run:

```bash
npm install
npm run dev
```

### Windows
Double-click `start-local.bat`, or run:

```powershell
npm install
npm run dev
```

Then open the local address printed by Vite, normally `http://localhost:5173`.

Opening the source `index.html` directly with a `file://` address is not supported because browser modules, Web Workers and Transformers.js require an HTTP server.

## Build for production

```bash
npm run build
```

This generates the deployable site inside `dist/`.

## Upload to hosting

Upload **everything inside `dist/`**, preserving this structure:

```text
index.html
assets/
manifest.webmanifest
robots.txt
sw.js
```

The generated HTML uses relative links, so the build works at a domain root or within a subdirectory.

## Quick local test of the production build

```bash
npm run preview
```

Open the address printed by Vite.
