# LFNA | General-Purpose Browser Extension Beta 0.2

This is the De-Omega-Point privacy-first productivity extension for **everyday browser users**. The care-specific use case is not in the launch scope.

## Current capabilities
- Clean text formatting
- Convert lines into checklists
- Flag certain email, Australian phone and date patterns (not comprehensive privacy protection)
- LFNA Studio: create, edit, delete and save named user workflows with an output format, optional heading and literal case-sensitive word replacements
- All text processing runs locally when the user presses Process locally

**Important:** This is a deterministic rules engine, not a generative AI model. Natural-language prompt authoring will only be activated once a working on-device model is integrated.

## Browser testing
- Chrome / Edge: open the extensions management page, turn on Developer mode, choose Load unpacked and select this directory.
- Firefox: open about:debugging#/runtime/this-firefox, choose Load Temporary Add-on and select manifest.json. Firefox removes temporary installations on restart.
- Use fictional, non-sensitive sample text while testing.

## Privacy and permissions
- Requires extension storage permission only to save user-created workflow configurations locally.
- No host permissions, content scripts, background execution, website reading, network requests or cloud services.
- Text inputs and outputs are transient, except for user-requested copying to the system clipboard. Workflow settings are persistent.
- Users must review outputs, particularly when using replacements.

## Next technical gates
1. Test on Chrome, Edge and Firefox and confirm settings persistence and no unexpected network requests.
2. Test with diverse datasets and minimise user-visible errors and performance overhead.
3. Add explicit on-device model support for rewriting, summarising, extraction and user-supplied prompts; do not describe these as functional before they are built.
4. Add export/import, reviewable task-pack examples, and secure licensing.
5. Separate public commercial delivery from internal engineering and run privacy/security checks.

Not published to browser stores or ready for sale. The existing website OmegaRuntime.js is unchanged.
