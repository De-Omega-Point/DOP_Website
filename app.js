const nav=document.getElementById('siteNav');
const menuButton=document.getElementById('menuButton');
const mobilePanel=document.getElementById('mobilePanel');
document.getElementById('year').textContent=new Date().getFullYear();
window.addEventListener('scroll',()=>nav.classList.toggle('compact',window.scrollY>20),{passive:true});
menuButton.addEventListener('click',()=>{const open=mobilePanel.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'✕':'☰';});
mobilePanel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobilePanel.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='☰';}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.reveal:not(.visible)').forEach(el=>observer.observe(el));
const sections=[...document.querySelectorAll('section[id],div[id]')];
const links=[...document.querySelectorAll('.nav-links a')];
const activate=()=>{let current='home';for(const s of sections){if(window.scrollY>=s.offsetTop-180)current=s.id;}links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));};
window.addEventListener('scroll',activate,{passive:true});activate();

async function applyOfficialBrandLogo(){
  try{
    const response=await fetch('assets/dop-logo.b64',{cache:'force-cache'});
    if(!response.ok)throw new Error(`Logo request failed: ${response.status}`);
    const encoded=(await response.text()).trim();
    const source=`data:image/webp;base64,${encoded}`;

    document.querySelectorAll('svg.brand-mark').forEach(mark=>{
      const image=document.createElement('img');
      image.className=mark.getAttribute('class')||'brand-mark';
      image.src=source;
      image.alt=mark.getAttribute('aria-label')||'De-Omega-Point official Omega head circuit logo';
      image.width=192;
      image.height=192;
      image.decoding='async';
      mark.replaceWith(image);
    });

    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon);}
    icon.type='image/webp';
    icon.href=source;

    let touchIcon=document.querySelector('link[rel="apple-touch-icon"]');
    if(!touchIcon){touchIcon=document.createElement('link');touchIcon.rel='apple-touch-icon';document.head.append(touchIcon);}
    touchIcon.href=source;
  }catch(error){
    console.error('Official De-Omega-Point logo could not be loaded.',error);
  }
}

applyOfficialBrandLogo();
