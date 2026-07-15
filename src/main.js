import './styles.css';
import { TransformerBridge } from './transformer.js';
import { OmegaRuntime } from './OmegaRuntime.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const aiStatus = $('[data-ai-status]');
const modelLabel = $('[data-model-label]');
const outputStatus = $('[data-output-status]');
const activateButton = $('[data-activate-ai]');
const runButton = $('[data-run-analysis]');

let localAIActive = false;
let selectedMode = 'strategy';

const transformer = new TransformerBridge({
  onProgress(progress) {
    const percent = Number.isFinite(progress.progress) ? `${Math.round(progress.progress)}%` : '';
    aiStatus.textContent = `${String(progress.status || 'LOADING').toUpperCase()} ${percent}`.trim();
    activateButton.textContent = percent ? `Loading local AI ${percent}` : 'Loading local AI…';
  },
});

const runtime = new OmegaRuntime({ transformer });

setupHeader();
setupCommandMenu();
setupReveals();
setupStarfield();
setupConsole();
setupContact();
setupRuntimeClock();
setupServiceWorker();

$('[data-year]').textContent = new Date().getFullYear();

function setupHeader() {
  const header = $('[data-header]');
  const update = () => header.classList.toggle('scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupCommandMenu() {
  const dialog = $('[data-command-dialog]');
  const openButton = $('[data-command-open]');
  const search = $('[data-command-search]');
  const items = $$('[data-command-item]');

  const open = () => {
    if (!dialog.open) dialog.showModal();
    search.value = '';
    items.forEach((item) => item.hidden = false);
    requestAnimationFrame(() => search.focus());
  };

  openButton.addEventListener('click', open);
  document.addEventListener('keydown', (event) => {
    const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (shortcut) {
      event.preventDefault();
      open();
    }
  });

  search.addEventListener('input', () => {
    const query = search.value.toLowerCase().trim();
    items.forEach((item) => item.hidden = !item.textContent.toLowerCase().includes(query));
  });

  items.forEach((item) => item.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function setupReveals() {
  const elements = $$('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function setupStarfield() {
  const canvas = $('#starfield');
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [];
  let frame;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(160, Math.floor(window.innerWidth / 9)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.15 + 0.15,
      alpha: Math.random() * 0.55 + 0.12,
      speed: Math.random() * 0.08 + 0.01,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const star of stars) {
      star.y += reducedMotion ? 0 : star.speed;
      if (star.y > window.innerHeight) star.y = 0;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(177, 255, 210, ${star.alpha})`;
      context.fill();
    }
    frame = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else draw();
  });
}

function setupConsole() {
  const input = $('#omega-input');
  const characterCount = $('[data-character-count]');
  const exampleButton = $('[data-example]');
  const modeButtons = $$('.mode-button');
  const copyButton = $('[data-copy-output]');

  input.addEventListener('input', () => characterCount.textContent = input.value.length);

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedMode = button.dataset.mode;
      modeButtons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-checked', String(active));
      });
    });
  });

  exampleButton.addEventListener('click', () => {
    input.value = 'We want to create Qivo, a private AI communication assistant for people who become overwhelmed during high-pressure conversations. The first buyer could be schools, employers or support organisations. We need a narrow MVP, measurable outcome and a path to paid pilots within 60 days.';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });

  activateButton.addEventListener('click', async () => {
    if (localAIActive) return;
    setBusy(activateButton, true);
    aiStatus.textContent = 'INITIALISING';
    modelLabel.textContent = 'LOADING LOCAL MODEL';

    try {
      await transformer.initialise();
      localAIActive = true;
      aiStatus.textContent = 'ACTIVE';
      modelLabel.textContent = 'TRANSFORMERS.JS ACTIVE';
      activateButton.textContent = 'Local AI active';
      activateButton.disabled = true;
    } catch (error) {
      aiStatus.textContent = 'FALLBACK';
      modelLabel.textContent = 'HEURISTIC CORE';
      activateButton.textContent = 'Retry local AI';
      showConsoleError(error.message);
    } finally {
      setBusy(activateButton, false);
    }
  });

  runButton.addEventListener('click', async () => {
    setBusy(runButton, true);
    outputStatus.textContent = 'PROCESSING';

    try {
      const result = await runtime.analyse({
        text: input.value,
        mode: selectedMode,
        useLocalAI: localAIActive,
      });
      renderOutput(result);
    } catch (error) {
      showConsoleError(error.message);
    } finally {
      setBusy(runButton, false);
    }
  });

  copyButton.addEventListener('click', async () => {
    const text = buildOutputText();
    await navigator.clipboard.writeText(text);
    const original = copyButton.textContent;
    copyButton.textContent = 'Copied to clipboard';
    setTimeout(() => copyButton.textContent = original, 1400);
  });
}

function renderOutput(result) {
  $('[data-output-empty]').hidden = true;
  $('[data-output-content]').hidden = false;
  $('[data-core-read]').textContent = result.coreRead;
  $('[data-leverage]').textContent = result.leverage;
  $('[data-risk]').textContent = result.risk;
  $('[data-verification]').textContent = result.verification;

  const actions = $('[data-actions]');
  actions.replaceChildren(...result.actions.map((action) => {
    const item = document.createElement('li');
    item.textContent = action;
    return item;
  }));

  $('[data-signal-meter]').style.width = `${result.signal.score}%`;
  $('[data-signal-text]').textContent = `${result.signal.label}: ${result.signal.detail}`;
  outputStatus.textContent = 'BRIEF GENERATED';
  modelLabel.textContent = result.meta.localAI ? 'TRANSFORMERS.JS ACTIVE' : 'HEURISTIC CORE';
}

function showConsoleError(message) {
  $('[data-output-empty]').hidden = false;
  $('[data-output-content]').hidden = true;
  const empty = $('[data-output-empty]');
  $('h3', empty).textContent = 'Runtime requires more signal.';
  $('p', empty).textContent = message;
  outputStatus.textContent = 'INPUT REQUIRED';
}

function buildOutputText() {
  const section = $('[data-output-content]');
  const read = (selector) => $(selector, section)?.textContent?.trim() ?? '';
  const actions = $$('[data-actions] li', section).map((item, index) => `${index + 1}. ${item.textContent.trim()}`).join('\n');
  return [
    'DE-OMEGA-POINT · OMEGA COMMAND BRIEF',
    '',
    `CORE READ\n${read('[data-core-read]')}`,
    `LEVERAGE POINT\n${read('[data-leverage]')}`,
    `NEXT ACTIONS\n${actions}`,
    `PRIMARY WATCHOUT\n${read('[data-risk]')}`,
    `VERIFICATION GATE\n${read('[data-verification]')}`,
    `MODEL SIGNAL\n${read('[data-signal-text]')}`,
  ].join('\n\n');
}

function setBusy(button, busy) {
  button.disabled = busy;
  button.setAttribute('aria-busy', String(busy));
}

function setupContact() {
  const form = $('[data-contact-form]');
  const note = $('[data-contact-note]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const subject = encodeURIComponent(`De-Omega-Point mission enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMission brief:\n${message}`);

    note.textContent = 'Transmission prepared. Opening your email client…';
    window.location.href = `mailto:contact@de-omega-point.com?subject=${subject}&body=${body}`;
  });
}

function setupRuntimeClock() {
  const clock = $('[data-runtime-clock]');
  const tick = () => clock.textContent = new Intl.DateTimeFormat('en-AU', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
  tick();
  setInterval(tick, 1000);
}

function setupServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
