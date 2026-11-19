/* LFNA 0.2 | On-device rules engine and locally saved user workflows. */
"use strict";
const el = id => document.getElementById(id);
const KEY = "lfnaWorkflowsV1";
const MAX_WORKFLOWS = 30;
let workflows = [], selectedId = null;

function getStored() {
  if (typeof browser !== "undefined" && browser.storage?.local) return browser.storage.local.get(KEY);
  return new Promise((resolve,reject)=>chrome.storage.local.get(KEY, data => {
    const e=chrome.runtime.lastError; e ? reject(new Error(e.message)) : resolve(data);
  }));
}
function saveStored(items) {
  const data = {[KEY]:items};
  if (typeof browser !== "undefined" && browser.storage?.local) return browser.storage.local.set(data);
  return new Promise((resolve,reject)=>chrome.storage.local.set(data,()=>{
    const e=chrome.runtime.lastError; e ? reject(new Error(e.message)) : resolve();
  }));
}
function message(text) {el("review").textContent=text;}
function normalise(s) {
  return s.replace(/\r\n?/g,"\n").split("\n").map(line=>line.trim().replace(/[ \t]+/g," "));
}
function clean(s) {
  return normalise(s).join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function format(s, style) {
  const lines = normalise(s).map(line=>line.replace(/^(?:-\s*\[[ xX]\]|[-*•]|\d+[.)]|\[[ xX]\])\s*/,"").trim()).filter(Boolean);
  return lines.map((line,i)=>{
    if(style==="numbered")return (i+1)+". "+line;
    if(style==="checklist")return "- [ ] "+line;
    if(style==="bullets")return "- "+line;
    return line;
  }).join("\n");
}
function checkPrivacy(s) {
  const checks = [
    ["Possible email addresses",/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
    ["Possible Australian phone numbers",/(?<!\d)(?:\+61\s?|0)[2-478](?:[\s-]?\d){8}(?!\d)/g],
    ["Possible dates",/\b(?:\d{1,2}[\/.-]){2}\d{2,4}\b/g]
  ];
  const flags = checks.map(([label,re])=>{const found=s.match(re);return found?label+": "+found.length:null;}).filter(Boolean);
  return {output: flags.join("\n") || "No predefined patterns detected.",
    review: "This checks only a few text patterns. It cannot reliably identify all names, addresses, IDs or other private information."};
}
function parseReplacements(s) {
  return s.split(/\r?\n/).map(line=>{
    const p=line.indexOf("=>");
    if(p<1)return null;
    const from=line.slice(0,p).trim(),to=line.slice(p+2).trim();
    return from ? {from,to} : null;
  }).filter(Boolean).slice(0,20);
}
function processText(s, task) {
  if(task==="clean")return {output:clean(s),review:"Verify that the cleaned text preserves your meaning."};
  if(task==="checklist")return {output:format(s,"checklist"),review:"Review the checklist for missing or duplicated items."};
  if(task==="privacy")return checkPrivacy(s);
  if(!task.startsWith("custom:"))return {output:"",review:"Unknown workflow."};
  const w=workflows.find(item=>item.id===task.slice(7));
  if(!w)return {output:"",review:"Workflow unavailable."};
  let value=clean(s);
  for(const rule of w.replacements){
    if(rule.from) value=value.split(rule.from).join(rule.to);
  }
  return {output:(w.title ? w.title+"\n\n" : "")+format(value,w.format),
    review:"Output generated using saved formatting and literal replacements. Review any changed words before use."};
}
function renderOptions() {
  const group=el("custom-options");
  group.replaceChildren();
  for(const w of workflows){
    const opt=document.createElement("option");
    opt.value="custom:"+w.id;
    opt.textContent=w.name;
    group.appendChild(opt);
  }
}
function resetStudio() {
  selectedId=null;
  el("workflow-name").value="";
  el("workflow-format").value="bullets";
  el("workflow-title").value="";
  el("workflow-replacements").value="";
  el("delete-workflow").disabled=true;
}
function selectStudio(id) {
  const w=workflows.find(item=>item.id===id);
  if(!w)return;
  selectedId=id;
  el("workflow-name").value=w.name;
  el("workflow-format").value=w.format;
  el("workflow-title").value=w.title;
  el("workflow-replacements").value=w.replacements.map(r=>r.from+" => "+r.to).join("\n");
  el("delete-workflow").disabled=false;
}
el("task").addEventListener("change",()=>{
  el("output").value="";message("");
  const task=el("task").value;
  if(task.startsWith("custom:"))selectStudio(task.slice(7));
});
el("studio-toggle").addEventListener("click",()=>{
  const box=el("studio");
  box.hidden=!box.hidden;
  if(!box.hidden && el("task").value.startsWith("custom:"))selectStudio(el("task").value.slice(7));
});
el("new-workflow").addEventListener("click",()=>{resetStudio();message("New workflow ready to configure.");});
el("save-workflow").addEventListener("click",async()=>{
  const name=el("workflow-name").value.trim();
  if(!name){message("Enter a name for this workflow.");return;}
  if(!selectedId && workflows.length>=MAX_WORKFLOWS){message("You have reached the 30-workflow limit for this beta.");return;}
  const recipe={
    id:selectedId || crypto.randomUUID(),
    name,
    format:el("workflow-format").value,
    title:el("workflow-title").value.trim(),
    replacements:parseReplacements(el("workflow-replacements").value)
  };
  const next=workflows.filter(w=>w.id!==recipe.id).concat(recipe);
  try{
    await saveStored(next);
    workflows=next;selectedId=recipe.id;renderOptions();
    el("task").value="custom:"+recipe.id;
    el("delete-workflow").disabled=false;
    message("Saved locally. Click Process locally to test your workflow.");
  }catch(error){message("Saving failed: "+error.message);}
});
el("delete-workflow").addEventListener("click",async()=>{
  if(!selectedId)return;
  const next=workflows.filter(w=>w.id!==selectedId);
  try{
    await saveStored(next);
    workflows=next;resetStudio();renderOptions();
    el("task").value="clean";
    message("Workflow deleted from this browser.");
  }catch(error){message("Deletion failed: "+error.message);}
});
el("run").addEventListener("click",()=>{
  const raw=el("input").value.trim();
  if(!raw){message("Enter text to process.");return;}
  const result=processText(raw,el("task").value);
  el("output").value=result.output;
  message(result.review);
});
el("clear").addEventListener("click",()=>{
  el("input").value="";el("output").value="";message("");
});
el("copy").addEventListener("click",async()=>{
  if(!el("output").value)return;
  try{
    await navigator.clipboard.writeText(el("output").value);
    message("Copied to clipboard. Review your destination before pasting.");
  }catch(error){message("Clipboard copy blocked. Select the output and copy manually.");}
});
(async()=>{
  try{
    const data=await getStored();
    if(Array.isArray(data[KEY])){
      workflows=data[KEY].filter(w=>
        w && typeof w.id==="string" && typeof w.name==="string" &&
        typeof w.title==="string" && Array.isArray(w.replacements) &&
        ["plain","bullets","numbered","checklist"].includes(w.format)
      ).slice(0,MAX_WORKFLOWS).map(w=>({
        id:w.id,name:w.name,title:w.title,format:w.format,
        replacements:w.replacements.filter(r=>r&&typeof r.from==="string"&&r.from.length&&typeof r.to==="string").slice(0,20)
      }));
    }
    renderOptions();
  }catch(error){message("Saved workflows could not be loaded: "+error.message);}
})();
