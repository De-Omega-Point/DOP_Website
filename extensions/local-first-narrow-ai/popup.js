/* LFNA 0.1: deliberately deterministic; no model or network dependency. */
"use strict";
const HEADINGS = ["CLIENT NAME","CLIENT SUPPORT","BEHAVIOUR","MEDICAL","HEALTH","COMMUNITY PARTICIPATION","COMMUNICATION","ACTIVE SUPPORT","GOAL","OBSERVATION"];
const RULES = [
  ["MEDICAL",/\b(medication|medications|medicine|prescribed|glucose|blood sugar|insulin|blood pressure|temperature|administered)\b/i],
  ["GOAL",/\b(goal|target|objective|progress towards)\b/i],
  ["OBSERVATION",/\b(observation|observed|noted unusual)\b/i],
  ["BEHAVIOUR",/\b(refused|declined|distress|aggress|agitat|self.injur|anxious)\b/i],
  ["COMMUNITY PARTICIPATION",/\b(community|outing|shopping|went to work|attended work|visited|excursion)\b/i],
  ["COMMUNICATION",/\b(conversation|conversed|discussed|communicated|spoke|talked|requested|asked)\b/i],
  ["ACTIVE SUPPORT",/\b(support worker|\bSW\b|assisted|prompted|encouraged|prepared|supported)\b/i],
  ["HEALTH",/\b(pain|appetite|hydration|sleep|slept|nap|wellbeing|well.being|fatigue)\b/i],
  ["CLIENT SUPPORT",/\b(shower|shave|breakfast|brekkie|lunch|dinner|evening tea|teeth|pads|clothing|bedtime|hygiene)\b/i]
];
const byId=id=>document.getElementById(id);
function cleanLine(line){return line.replace(/^\s*(?:[-*•]\s*)?/,"").trim();}
function formatICare(input){
 const groups=Object.fromEntries(HEADINGS.map(h=>[h,[]]));
 const unmatched=[];let selected=null;
 const lines=input.split(/\r?\n/).map(cleanLine).filter(Boolean);
 for (const line of lines){
  const name=line.match(/^CLIENT NAME\s*[:\-]\s*(.+)$/i);
  if(name){groups["CLIENT NAME"].push(name[1].trim());selected=null;continue;}
  const explicit=line.match(/^(CLIENT SUPPORT|BEHAVIOUR|MEDICAL|HEALTH|COMMUNITY PARTICIPATION|COMMUNICATION|ACTIVE SUPPORT|GOAL|OBSERVATION)\s*[:\-]\s*(.*)$/i);
  if(explicit){selected=explicit[1].toUpperCase();if(explicit[2].trim())groups[selected].push(explicit[2].trim());continue;}
  const heading=HEADINGS.find(h=>h===line.toUpperCase());
  if(heading){selected=heading;continue;}
  if(selected){groups[selected].push(line);continue;}
  const match=RULES.find(([,pattern])=>pattern.test(line));
  if(match){groups[match[0]].push(line);}else{unmatched.push(line);}
 }
 const output=HEADINGS.map(h=>h+"\n"+(groups[h].length?groups[h].map(x=>"- "+x).join("\n"):"")).join("\n\n");
 const review=(groups["CLIENT NAME"].length===0?"Client name not provided.\n":"")+
 (unmatched.length?"Needs review: "+unmatched.length+" line(s) not confidently classified:\n"+unmatched.map(s=>"• "+s).join("\n"):"");
 return {output,review:review||"Check every heading and verify against the original notes before copying."};
}
function scanPrivacy(input){
 const patterns=[["Possible email",/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
 ["Possible Australian phone number",/(?<!\d)(?:\+61\s?|0)[2-478](?:[\s-]?\d){8}(?!\d)/g],
 ["Possible date of birth / date",/\b(?:\d{1,2}[\/.-]){2}\d{2,4}\b/g]];
 const found=[];
 for(const [label,rx] of patterns){const matches=[...input.matchAll(rx)];if(matches.length)found.push(label+": "+matches.length);}
 return {output:found.length?found.join("\n"):"No predefined patterns detected.",review:"This is a limited pattern check, not a comprehensive privacy assessment. Names, identifiers, addresses and context may still be sensitive."};
}
byId("run").addEventListener("click",()=>{
 const input=byId("input").value.trim();
 if(!input){byId("review").textContent="Enter text to process.";return;}
 const result=byId("task").value==="icare"?formatICare(input):scanPrivacy(input);
 byId("output").value=result.output;byId("review").textContent=result.review;
});
byId("clear").addEventListener("click",()=>{byId("input").value="";byId("output").value="";byId("review").textContent="";});
byId("copy").addEventListener("click",async()=>{
 const value=byId("output").value;
 if(!value)return;
 try{await navigator.clipboard.writeText(value);byId("review").textContent+="\nCopied to clipboard.";}
 catch{byId("review").textContent+="\nCopy was blocked by this browser; select and copy the output manually.";}
});
byId("task").addEventListener("change",()=>{byId("output").value="";byId("review").textContent="";});
