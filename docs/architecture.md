# De-Omega-Point Website Architecture

## Purpose

A cinematic, deployable brand platform that also demonstrates a real in-browser AI capability rather than presenting AI as decorative copy.

## Runtime layers

1. **UI layer**: `src/main.js` controls navigation, animation, accessibility, the Omega Console and contact workflow.
2. **Orchestration layer**: `src/OmegaRuntime.js` converts a mission brief into a structured strategic output using transparent rules.
3. **Model adapter**: `src/transformer.js` handles worker lifecycle, progress events and model requests.
4. **Inference worker**: `src/omega.worker.js` loads Transformers.js and runs quantised sentiment analysis away from the main thread.

## Why this split

- The site remains useful before a model is downloaded.
- Local AI is optional and privacy-forward.
- The deterministic runtime stays inspectable and testable.
- The model can later be replaced by embeddings, classification, summarisation or a compact instruction model without rewriting the whole interface.

## Recommended next technical increments

- Replace the mailto contact workflow with a protected serverless endpoint.
- Add a CMS for systems, research notes and partner updates.
- Add analytics with consent and a privacy-respecting provider.
- Upgrade Omega Console to a dedicated task model and local knowledge pack.
- Add authentication only when a protected workspace has a validated user need.
