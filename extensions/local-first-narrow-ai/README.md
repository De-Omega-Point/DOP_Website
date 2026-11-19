# Local First Narrow AI (LFNA) · browser extension beta 0.1

A browser-popup specialist workflow demonstrator for De-Omega-Point. This is **rules-based** and **not yet a trained AI model**. It deliberately offers zero cloud calls and zero page-reading permissions.

## Load for testing

- Chrome or Edge: open `chrome://extensions` / `edge://extensions`, enable developer mode, choose **Load unpacked**, select this folder.
- Firefox: open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `manifest.json` from this folder. Temporary add-ons are removed when Firefox restarts.

Click the LFNA toolbar icon. Use **fictional data only** during beta evaluation.

## Workflows

1. iCare: deterministic formatting of rough notes into ten established headings. Text without a reliable classification remains in the review panel. Input is not persisted.
2. Privacy: limited pattern detection for emails, phone numbers and dates. This is not comprehensive personal-data detection and does not establish privacy compliance.

## Explicit non-goals in beta

- No browser tab reading, web scanning, website interaction, cloud sync, networking, extension storage or background processes.
- No claim of AI inference, autonomous training, automatic clinical accuracy, security certification or data protection compliance.
- No user/client record ingestion until privacy and security assessment.

## Performance and safety

Only executes when the user opens the popup and clicks **Process locally**. Closes/relinquishes memory with popup lifecycle. No model loaded. Data is handled transiently in memory and may remain available via a user-triggered clipboard copy.

## Next phases

1. Define versioned task packs (prompt, schema, examples, allowed vocabulary, evaluation tests); introduce an editable review panel.
2. Add a locally packaged quantised model only if evaluation demonstrates rule-based limitations. Benchmark CPU/WASM and optional WebGPU for each supported browser.
3. Use human-reviewed, consented, de-identified examples for evaluation, then consider fine-tuning outside the extension only when justified.

## Release gates

- Verify no external network requests under real-world testing.
- Confirm text never persists beyond intended lifecycle and survives no unexpected surfaces.
- Evaluate 100+ fictional/de-identified examples; **zero invented facts** as mandatory safety requirement, plus classification metrics, user review burden and accessibility.
- Test Firefox, Chrome and Edge, including keyboard navigation and low-resource devices.

Code provenance: this folder is an experimental extension. The website's existing `src/OmegaRuntime.js` remains unchanged.
