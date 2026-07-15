/**
 * OmegaRuntime.js
 * A transparent, deterministic orchestration layer for the De-Omega website prototype.
 * It combines structured heuristics with optional local model signals.
 */
export class OmegaRuntime {
  constructor({ transformer = null } = {}) {
    this.transformer = transformer;
    this.sessionId = crypto.randomUUID?.() ?? `omega-${Date.now()}`;
    this.events = [];
  }

  async analyse({ text, mode = 'strategy', useLocalAI = false }) {
    const cleanText = this.#normalise(text);
    if (cleanText.length < 18) {
      throw new Error('Add a little more mission context so the runtime has something real to grip.');
    }

    const context = this.#extractContext(cleanText);
    const base = this.#composeBrief(context, mode);
    let modelSignal = null;

    if (useLocalAI && this.transformer) {
      try {
        modelSignal = await this.transformer.analyse(cleanText);
      } catch (error) {
        modelSignal = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    const result = {
      ...base,
      signal: this.#interpretSignal(modelSignal, context),
      meta: {
        mode,
        sessionId: this.sessionId,
        generatedAt: new Date().toISOString(),
        localAI: Boolean(modelSignal && !modelSignal.error),
      },
    };

    this.events.push({ type: 'analysis', inputLength: cleanText.length, ...result.meta });
    return result;
  }

  #normalise(text) {
    return String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 1800);
  }

  #extractContext(text) {
    const lower = text.toLowerCase();
    const words = lower.match(/[a-z0-9'-]+/g) ?? [];
    const unique = new Set(words);
    const has = (...terms) => terms.some((term) => lower.includes(term));

    return {
      text,
      lower,
      wordCount: words.length,
      density: unique.size / Math.max(words.length, 1),
      hasUser: has('user', 'people', 'person', 'customer', 'client', 'community', 'human'),
      hasBuyer: has('buyer', 'paid', 'revenue', 'price', 'pilot', 'customer', 'organisation', 'company'),
      hasProblem: has('problem', 'pain', 'struggle', 'overwhelmed', 'risk', 'friction', 'need'),
      hasSolution: has('tool', 'platform', 'system', 'app', 'service', 'product', 'ai', 'automation'),
      hasMetric: /\b\d+(?:\.\d+)?%?\b/.test(text) || has('measure', 'metric', 'outcome', 'reduce', 'increase'),
      hasEthics: has('privacy', 'consent', 'ethical', 'dignity', 'safety', 'bias', 'transparent'),
      hasScopeRisk: has('everyone', 'all industries', 'everything', 'global platform', 'complete ecosystem'),
      urgency: has('urgent', 'now', 'rapid', 'immediately', 'quickly', 'asap'),
    };
  }

  #composeBrief(context, mode) {
    const modeMap = {
      strategy: this.#strategyBrief.bind(this),
      venture: this.#ventureBrief.bind(this),
      ethics: this.#ethicsBrief.bind(this),
      signal: this.#signalBrief.bind(this),
    };
    return (modeMap[mode] ?? modeMap.strategy)(context);
  }

  #strategyBrief(c) {
    const core = c.hasProblem && c.hasUser
      ? 'The opportunity has a credible human problem at its centre. The next move is not more features; it is isolating the single moment where the user experiences the highest friction.'
      : 'The direction is interesting, but the human problem and primary user are still blurred. Sharpen those before committing engineering time.';

    return {
      coreRead: core,
      leverage: c.hasBuyer
        ? 'Use a paid design-partner pilot. One committed buyer can provide evidence, workflow access and a route to repeatable revenue at the same time.'
        : 'Identify the economic beneficiary. The user may receive the value, but a different organisation may hold the budget and urgency.',
      actions: [
        'Write one sentence defining the user, painful moment and measurable outcome.',
        c.hasMetric ? 'Turn the proposed metric into a before-and-after pilot scorecard.' : 'Choose one outcome metric that can move inside 30 days.',
        c.hasBuyer ? 'Recruit three design partners and ask for a paid pilot commitment.' : 'Interview five likely users and three likely budget owners before expanding scope.',
      ],
      risk: c.hasScopeRisk
        ? 'Scope inflation is already flashing red. A universal platform is usually a tax on learning speed.'
        : 'The main risk is building around assumptions that have not been observed in a live workflow.',
      verification: 'Proceed only when at least three target users describe the same high-friction moment and one credible buyer agrees to test a narrow intervention.',
    };
  }

  #ventureBrief(c) {
    return {
      coreRead: c.hasBuyer
        ? 'This can be shaped into a venture, provided the buyer, trigger event and recurring value are explicit.'
        : 'The concept currently reads more like a useful capability than a complete business. Revenue mechanics need to enter the cockpit.',
      leverage: 'Sell the outcome as a tightly scoped service-assisted product first. That produces cash, proprietary workflow insight and reusable product requirements.',
      actions: [
        'Define a wedge offer with one buyer, one workflow and one promised result.',
        'Package a 4–6 week paid pilot with a fixed scope, success metric and decision date.',
        'Capture every repeated step as reusable IP, templates, data structures or automation.',
      ],
      risk: 'Free pilots and bespoke custom work can camouflage weak demand while consuming founder bandwidth.',
      verification: 'The venture earns its next build cycle when a customer pays, uses the system in a real workflow and asks to continue after the pilot.',
    };
  }

  #ethicsBrief(c) {
    return {
      coreRead: c.hasEthics
        ? 'The brief acknowledges human-value concerns, which is a useful start. Those concerns now need enforceable product behaviours rather than decorative principles.'
        : 'The current concept does not yet make consent, privacy, user control or failure handling visible. That is a design gap, not a future policy task.',
      leverage: 'Turn values into testable acceptance criteria: what the system may infer, what it must disclose, when it must defer and how a person can reverse its action.',
      actions: [
        'Map affected people, including non-users who may still carry risk.',
        'Define prohibited behaviours and mandatory human override points.',
        'Run a pre-mortem covering privacy leakage, automation bias, exclusion and misuse.',
      ],
      risk: 'The largest ethical failures often arrive through incentives and edge cases, not the advertised happy path.',
      verification: 'Do not scale until representative users can understand the system, challenge it, opt out and recover from an incorrect output without specialist help.',
    };
  }

  #signalBrief(c) {
    const score = [c.hasUser, c.hasProblem, c.hasSolution, c.hasBuyer, c.hasMetric].filter(Boolean).length;
    const labels = ['foggy', 'early', 'forming', 'credible', 'strong', 'command-ready'];
    return {
      coreRead: `Current strategic signal: ${labels[score]}. The brief contains ${score} of 5 core venture signals: user, problem, solution, buyer and measurable outcome.`,
      leverage: score >= 4
        ? 'Stop broadening the concept and force a real-world commitment.'
        : 'The fastest gain comes from filling the missing signal, not polishing the existing ones.',
      actions: [
        !c.hasUser ? 'Name the primary user precisely.' : 'Confirm the user through direct observation.',
        !c.hasBuyer ? 'Identify who controls the budget.' : 'Test willingness to pay.',
        !c.hasMetric ? 'Select a measurable outcome.' : 'Baseline the current outcome.',
      ],
      risk: c.urgency ? 'Urgency may tempt you to treat motion as evidence.' : 'Concept confidence may outpace market evidence.',
      verification: 'Re-score after interviews or a live pilot. Only evidence can move the signal, not enthusiasm alone.',
    };
  }

  #interpretSignal(modelSignal, context) {
    if (!modelSignal || modelSignal.error || !modelSignal.sentiment) {
      const readiness = [context.hasUser, context.hasProblem, context.hasSolution, context.hasBuyer, context.hasMetric].filter(Boolean).length;
      return {
        score: Math.max(18, readiness * 19),
        label: 'Heuristic readiness',
        detail: `${readiness}/5 core signals detected. Local model is not active.`,
      };
    }

    const rawScore = Number(modelSignal.sentiment.score ?? 0);
    const positive = String(modelSignal.sentiment.label ?? '').toUpperCase().includes('POSITIVE');
    const confidence = Math.round(rawScore * 100);
    const adjusted = positive ? Math.min(96, 50 + confidence / 2) : Math.max(12, 50 - confidence / 2);

    return {
      score: Math.round(adjusted),
      label: positive ? 'Constructive language signal' : 'Risk-heavy language signal',
      detail: `Local sentiment model confidence: ${confidence}%. This is a language signal, not a verdict on business quality.`,
    };
  }
}
