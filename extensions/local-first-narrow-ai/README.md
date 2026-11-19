# Local First Narrow AI (LFNA) · Beta 0.3

A general-purpose, privacy-first browser extension from De-Omega-Point for everyday browser users. This is a **rules-based prototype, not a generative AI model**. Care-specific workflows are outside the current launch scope.

## What's included

### Home
- Choose Clean text, Make a checklist, Check possible private information, or one of My Workflows.
- Paste text manually, process locally, review and optionally copy the result.
- No page-reading features or automatic website interaction.

### LFNA Studio
A **dedicated tab in the extension popup** where users can:
1. Name a new workflow or select an existing one.
2. Set output format (plain, dot points, numbered, checklist) and an optional title.
3. Add literal, case-sensitive word replacements (up to 20).
4. Paste sample text and preview the unsaved configuration.
5. Save, edit, delete, and use workflows directly on Home.

Up to 30 named workflow recipes are saved in extension-local storage on the user's device.

### Settings
- Shows current processing, access and model state.
- Shows local workflow count.
- Allows all saved workflows to be deleted after the user explicitly ticks a confirmation checkbox.

## Test the extension

- **Chrome or Edge:** Open the extensions management page, turn on Developer mode, choose Load unpacked, and select this folder.
- **Firefox:** Open about:debugging#/runtime/this-firefox, choose Load Temporary Add-on, and select manifest.json. Firefox temporary add-ons are removed on restart.
- Choose the LFNA Studio tab to create a named recipe and preview it with fictional text.
- Save, select Use on Home, paste sample text, process it, then close/reopen the extension to check persistence.

## Privacy and limitations

- The storage permission is the **only** requested extension permission, used to save workflow configuration.
- No host permissions, content scripts, background processing, network requests, or cloud APIs.
- Pasted input and generated output are transient; only saved recipes persist by default. User-requested copying exposes text to the system clipboard.
- Word replacements may change meaning; **human review is required**.
- Privacy pattern checks cover only limited patterns (e.g., email, AU phone and dates). They are **not comprehensive privacy screening**.
- Studio does **not** yet train a model or execute arbitrary natural-language prompts.

## Remaining release gates

1. Install and test on Firefox, Chrome and Edge, including keyboard navigation and local persistence.
2. Security/privacy review, accessibility and performance benchmarking, including no unexpected network traffic.
3. Integrate and evaluate optional on-device narrow models for rewriting, summarising, extraction and prompt-driven workflows; clearly distinguish real model inference from rules.
4. Add export/import, model management, support and licensing if user validation justifies them.
5. Complete browser-store policy checks, commerce integration and paid pilot testing.

## Status

Developed on the feature/local-first-narrow-ai branch of DOP_Website; not released to the browser stores and not ready for sale. The main site's src/OmegaRuntime.js was not altered.
