# DOP_Website

**De-Omega-Point Command Website**

A cinematic, responsive website and browser-based Omega Console for De-Omega-Point, built with Vite, Transformers.js and the custom `OmegaRuntime.js` orchestration layer.

## Core capabilities

- Cinematic De-Omega-Point command-ship interface
- Responsive desktop and mobile layouts
- Interactive Omega Console
- Local, optional Transformers.js inference in a Web Worker
- Strategic, venture, ethics and signal-analysis modes
- Progressive Web App shell and offline caching
- Keyboard-accessible command palette
- Reduced-motion and accessibility support
- Automated continuous integration and GitHub Pages deployment

## Technology

- Vite 7
- JavaScript ES modules
- `@huggingface/transformers`
- Web Workers
- CSS custom properties and responsive layouts
- GitHub Actions

## Local development

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite.

## Production verification

```bash
npm run build
npm run preview
```

The deployable website is generated in `dist/`.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site whenever code is pushed to `main`.

After creating the repository:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push the `main` branch.
4. Watch the deployment under **Actions**.

Expected Pages address:

```text
https://de-omega-point.github.io/DOP_Website/
```

The Vite configuration uses relative asset paths, allowing the application to work under the `/DOP_Website/` repository path and on conventional static hosts.

## Alternative hosting

The same project can be deployed to Netlify, Vercel, Cloudflare Pages or a standard static web server.

- Build command: `npm run build`
- Output directory: `dist`

## Important notes

- Do not open the source `index.html` directly. Run Vite during development.
- Do not upload `index.html` by itself. Deploy the complete `dist/` output.
- The first optional local-AI activation downloads a quantised model from Hugging Face.
- Never place API keys or confidential data in browser-side JavaScript.
- Replace `contact@de-omega-point.com` in `src/main.js` if the contact destination changes.

## Repository structure

```text
DOP_Website/
├── .github/workflows/       CI and GitHub Pages deployment
├── docs/                    Architecture documentation
├── public/                  Static assets, manifest and service worker
├── src/                     Application, styles and runtime modules
├── index.html               Vite document entry
├── package.json             Project metadata and scripts
└── vite.config.js           Build configuration
```

## Documentation

- [Deployment guide](./DEPLOYMENT.md)
- [Architecture](./docs/architecture.md)
- [Security policy](./SECURITY.md)
- [Contribution guide](./CONTRIBUTING.md)

## Brand

**DE-OMEGA-POINT**  
*Engineering Humanity Forward.*

Forward, Always.
