/* LFNA 0.3 | Local-first text workflows and integrated Studio navigation. */
"use strict";
const el = id => document.getElementById(id);
const STORAGE_KEY = "lfnaWorkflowsV1";
const MAX_WORKFLOWS = 30;
const FORMATS = ["bullets", "numbered", "checklist", "plain"];
let workflows = [];
let selectedId = null;

function getStored() {
  if (typeof browser !== "undefined" && browser.storage?.local) {
    return browser.storage.local.get(STORAGE_KEY);
  }
  return new Promise((resolve, reject) => chrome.storage.local.get(STORAGE_KEY, data => {
    const error = chrome.runtime.lastError;
    error ? reject(new Error(error.message)) : resolve(data);
  }));
}
function setStored(items) {
  const payload = {[STORAGE_KEY]:items};
  if (typeof browser !== "undefined" && browser.storage?.local) {
    return browser.storage.local.set(payload);
  }
  return new Promise((resolve, reject) => chrome.storage.local.set(payload, () => {
    const error = chrome.runtime.lastError;
    error ? reject(new Error(error.message)) : resolve();
  }));
}
function status(tab, text) {
  el(tab + "-status").textContent = text;
}
function switchTab(tab, focus = false) {
  for (const name of ["home", "studio", "settings"]) {
    const active = name === tab;
    const button = el("tab-" + name);
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    el("panel-" + name).hidden = !active;
  }
  if (focus) el("tab-" + tab).focus();
}
for (const name of ["home", "studio", "settings"]) {
  const button = el("tab-" + name);
  button.addEventListener("click", () => switchTab(name));
  button.addEventListener("keydown", event => {
    const order = ["home", "studio", "settings"];
    const index = order.indexOf(name);
    const next = event.key === "ArrowRight" ? order[(index+1)%3]
      : event.key === "ArrowLeft" ? order[(index+2)%3]
      : event.key === "Home" ? order[0]
      : event.key === "End" ? order[2] : null;
    if (next) { event.preventDefault(); switchTab(next, true); }
  });
}
el("open-studio").addEventListener("click", () => switchTab("studio", true));

function normalise(text) {
  return text.replace(/\r\n?/g, "\n").split("\n").map(s => s.trim().replace(/[ \t]+/g, " "));
}
function clean(text) {
  return normalise(text).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function format(text, style) {
  const lines = normalise(text)
    .map(line => line.replace(/^(?:-\s*\[[ xX]\]|[-*•]|\d+[.)]|\[[ xX]\])\s*/, "").trim())
    .filter(Boolean);
  return lines.map((line, index) => {
    if (style === "numbered") return (index + 1) + ". " + line;
    if (style === "checklist") return "- [ ] " + line;
    if (style === "bullets") return "- " + line;
    return line;
  }).join("\n");
}
function checkPrivacy(text) {
  const tests = [
    ["Possible email addresses", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
    ["Possible Australian phone numbers", /(?<!\d)(?:\+61\s?|0)[2-478](?:[\s-]?\d){8}(?!\d)/g],
    ["Possible dates", /\b(?:\d{1,2}[\/.-]){2}\d{2,4}\b/g]
  ];
  const found = tests.map(([label, pattern]) => {
    const result = text.match(pattern);
    return result ? label + ": " + result.length : null;
  }).filter(Boolean);
  return {
    output: found.join("\n") || "No predefined patterns detected.",
    review: "Only a few patterns are checked. Names, addresses, identifiers and context may also be sensitive."
  };
}
function applyRecipe(text, recipe) {
  let value = clean(text);
  for (const replacement of recipe.replacements) {
    value = value.split(replacement.from).join(replacement.to);
  }
  return (recipe.title ? recipe.title + "\n\n" : "") + format(value, recipe.format);
}
function processText(text, task) {
  if (task === "clean") return {output:clean(text), review:"Review the result before copying."};
  if (task === "checklist") return {output:format(text, "checklist"), review:"Check for missing or duplicated items."};
  if (task === "privacy") return checkPrivacy(text);
  if (!task.startsWith("custom:")) return {output:"",review:"Unknown workflow."};
  const recipe = workflows.find(w => w.id === task.slice(7));
  if (!recipe) return {output:"",review:"Saved workflow not available."};
  return {output:applyRecipe(text, recipe), review:"Processed locally using your saved rules. Verify meaning and content."};
}
function parseReplacements(raw) {
  const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (lines.length > 20) throw new Error("Maximum 20 replacements per workflow.");
  return lines.map((line, index) => {
    const split = line.indexOf("=>");
    if (split < 1) throw new Error("Replacement line " + (index+1) + " must use old => new.");
    const from = line.slice(0, split).trim();
    const to = line.slice(split+2).trim();
    if (!from) throw new Error("Replacement line " + (index+1) + " needs a source word.");
    return {from, to};
  });
}
function draftRecipe() {
  return {
    id: selectedId || (crypto.randomUUID ? crypto.randomUUID() : "lfna-" + Date.now()),
    name: el("workflow-name").value.trim(),
    format: el("workflow-format").value,
    title: el("workflow-title").value.trim(),
    replacements: parseReplacements(el("workflow-replacements").value)
  };
}
function renderSaved() {
  const selectedHome = el("task").value;
  const group = el("custom-options");
  group.replaceChildren();
  const studioSelect = el("studio-workflows");
  studioSelect.replaceChildren();
  const newOption = document.createElement("option");
  newOption.value = "";
  newOption.textContent = "+ New workflow";
  studioSelect.appendChild(newOption);
  for (const recipe of workflows) {
    const homeOption = document.createElement("option");
    homeOption.value = "custom:" + recipe.id;
    homeOption.textContent = recipe.name;
    group.appendChild(homeOption);
    const studioOption = document.createElement("option");
    studioOption.value = recipe.id;
    studioOption.textContent = recipe.name;
    studioSelect.appendChild(studioOption);
  }
  if ([...el("task").options].some(option => option.value === selectedHome)) el("task").value = selectedHome;
  else el("task").value = "clean";
  studioSelect.value = selectedId || "";
  el("delete-workflow").disabled = !selectedId;
  el("use-workflow").disabled = !selectedId;
  el("saved-count").textContent = workflows.length + " of " + MAX_WORKFLOWS;
  el("clear-workflows").disabled = !el("confirm-clear").checked || !workflows.length;
}
function resetStudio() {
  selectedId = null;
  el("workflow-name").value = "";
  el("workflow-format").value = "bullets";
  el("workflow-title").value = "";
  el("workflow-replacements").value = "";
  el("studio-preview").value = "";
  renderSaved();
}
function selectStudio(id) {
  const recipe = workflows.find(w => w.id === id);
  if (!recipe) {resetStudio();return;}
  selectedId = recipe.id;
  el("workflow-name").value = recipe.name;
  el("workflow-format").value = recipe.format;
  el("workflow-title").value = recipe.title;
  el("workflow-replacements").value = recipe.replacements.map(r => r.from + " => " + r.to).join("\n");
  el("studio-preview").value = "";
  renderSaved();
}
el("studio-workflows").addEventListener("change", () => {
  const id = el("studio-workflows").value;
  if (id) selectStudio(id);
  else resetStudio();
  status("studio", "");
});
el("new-workflow").addEventListener("click", () => {
  resetStudio();
  status("studio", "New workflow. Choose your format and test it below.");
  el("workflow-name").focus();
});
el("preview-workflow").addEventListener("click", () => {
  const sample = el("studio-sample").value.trim();
  if (!sample) {status("studio", "Add sample text to test your workflow.");return;}
  try {
    const recipe = draftRecipe();
    el("studio-preview").value = applyRecipe(sample, recipe);
    status("studio", "Preview generated locally. Review any word replacements.");
  } catch (error) {
    el("studio-preview").value = "";
    status("studio", error.message);
  }
});
el("save-workflow").addEventListener("click", async () => {
  try {
    const recipe = draftRecipe();
    if (!recipe.name) {status("studio", "Name the workflow before saving.");return;}
    if (!FORMATS.includes(recipe.format)) throw new Error("Unsupported format.");
    if (!selectedId && workflows.length >= MAX_WORKFLOWS) {
      status("studio", "This beta supports up to 30 saved workflows.");return;
    }
    const next = workflows.filter(w => w.id !== recipe.id).concat(recipe);
    await setStored(next);
    workflows = next;
    selectedId = recipe.id;
    renderSaved();
    status("studio", "Saved on this device. You can now use it on Home.");
  } catch (error) {status("studio", "Save failed: " + error.message);}
});
el("use-workflow").addEventListener("click", () => {
  if (!selectedId) return;
  el("task").value = "custom:" + selectedId;
  el("output").value = "";
  status("home", "Your workflow is selected. Enter text to process locally.");
  switchTab("home", true);
});
el("delete-workflow").addEventListener("click", async () => {
  if (!selectedId) return;
  const next = workflows.filter(w => w.id !== selectedId);
  try {
    await setStored(next);
    workflows = next;
    resetStudio();
    status("studio", "Workflow deleted from this device.");
  } catch (error) {status("studio", "Delete failed: " + error.message);}
});
el("task").addEventListener("change", () => {
  el("output").value = "";
  status("home", "");
});
el("run").addEventListener("click", () => {
  const input = el("input").value.trim();
  if (!input) {status("home", "Enter some text to process.");return;}
  const result = processText(input, el("task").value);
  el("output").value = result.output;
  status("home", result.review);
});
el("clear").addEventListener("click", () => {
  el("input").value = "";
  el("output").value = "";
  status("home", "");
});
el("copy").addEventListener("click", async () => {
  if (!el("output").value) return;
  try {
    await navigator.clipboard.writeText(el("output").value);
    status("home", "Copied. Check the destination before pasting.");
  } catch {status("home", "Clipboard copy blocked. Select and copy the output manually.");}
});
el("confirm-clear").addEventListener("change", () => {
  el("clear-workflows").disabled = !el("confirm-clear").checked || !workflows.length;
});
el("clear-workflows").addEventListener("click", async () => {
  if (!el("confirm-clear").checked || !workflows.length) return;
  try {
    await setStored([]);
    workflows = [];
    el("confirm-clear").checked = false;
    resetStudio();
    status("settings", "All saved workflows deleted from this device.");
  } catch (error) {status("settings", "Delete failed: " + error.message);}
});
(async () => {
  try {
    const data = await getStored();
    if (Array.isArray(data[STORAGE_KEY])) {
      workflows = data[STORAGE_KEY].filter(w =>
        w && typeof w.id === "string" && typeof w.name === "string" &&
        typeof w.title === "string" && FORMATS.includes(w.format) &&
        Array.isArray(w.replacements)
      ).slice(0, MAX_WORKFLOWS).map(w => ({
        id:w.id, name:w.name.slice(0,60), title:w.title.slice(0,100), format:w.format,
        replacements:w.replacements.filter(r => r && typeof r.from === "string" &&
          r.from && typeof r.to === "string").slice(0,20)
      }));
    }
    renderSaved();
  } catch (error) {status("settings", "Saved workflow settings unavailable: " + error.message);}
})();
