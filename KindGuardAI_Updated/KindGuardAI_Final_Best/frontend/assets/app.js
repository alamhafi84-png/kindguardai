/* KindGuard AI - front end. No build step, no dependencies.
   Chats and progress are saved in this browser (localStorage) only. Nothing is sent to a server for storage. */
(() => {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const ICONS = {
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  sparkles: '<path d="M11 3l1.8 4.7L17.5 9.5l-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8L11 3z"/><path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  chat: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M8 17h11"/>',
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  clip: '<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7L9.2 17.2a1.7 1.7 0 0 1-2.4-2.4L14 7.6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  type: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5"/><path d="M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  play: '<path d="M8 5l11 7-11 7V5z"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  flame: '<path d="M12 3c1 3.2 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.3 2-4.2 0 2 1 3 2 3 0-3-1-5 1-8.8z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  cards: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
};
const icon = (n, size = 18) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* tiny markdown for AI answers (escapes first, so it is safe) */
function md(src) {
  const blocks = [];
  const inline = s => s.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  const t = esc(src).replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, c) => { blocks.push(c.replace(/\n$/, "")); return `\u0000${blocks.length - 1}\u0000`; });
  const out = []; let list = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const l of t.split("\n")) {
    let m;
    if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    close();
    if (!l.trim()) continue;
    if (/^\u0000\d+\u0000$/.test(l.trim())) { out.push(l.trim()); continue; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { out.push(`<h4>${inline(m[1])}</h4>`); continue; }
    out.push(`<p>${inline(l)}</p>`);
  }
  close();
  return out.join("").replace(/\u0000(\d+)\u0000/g, (_, i) => `<pre><code>${blocks[i]}</code></pre>`);
}

async function api(path, body, isForm = false) {
  let r;
  try {
    r = await fetch(path, { method: "POST", headers: isForm ? undefined : { "Content-Type": "application/json" }, body: isForm ? body : JSON.stringify(body) });
  } catch { throw new Error("Can't reach the KindGuard server. Run START_KINDGUARD.bat and keep its window open."); }
  let d = {};
  try { d = await r.json(); } catch { /* not json */ }
  if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "That didn't work. Check your input and try again.");
  return d;
}

/* ---------- on-device storage (try/catch: private windows and full disks must never break the app) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const K = { chats: "kg.chats.v1", stats: "kg.stats.v1", set: "kg.settings.v1", profile: "kg.profile.v1", planner: "kg.planner.v2", study: "kg.study.v1", cards: "kg.cards.v1" };
const settings = Object.assign({ save: true, ephemeral: false, mode: "student" }, store.get(K.set, {}));
if (!["student", "general"].includes(settings.mode)) settings.mode = "student";
const isStudent = () => settings.mode !== "general";
/* Profile + AI context. In Ephemeral Mode these live in memory only and nothing is written to localStorage. */
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const STYLES = ["Visual", "Auditory", "Reading & writing", "Hands-on"];
const ENERGIES = ["Low", "Medium", "High"];
store.del("kg.planner.v1"); // old scripted planner format
if (settings.ephemeral) { store.del(K.profile); store.del(K.planner); store.del(K.study); store.del(K.cards); }
const profile = Object.assign({ name: "", grade: "", style: "", energy: "" }, settings.ephemeral ? {} : store.get(K.profile, {}));
if (!GRADES.includes(profile.grade)) profile.grade = "";
if (!STYLES.includes(profile.style)) profile.style = "";
if (!ENERGIES.includes(profile.energy)) profile.energy = "";
const saveProfile = () => { if (settings.ephemeral) store.del(K.profile); else store.set(K.profile, profile); };
// In General mode the AI is not given any study profile.
const aiContext = () => (isStudent() ? { grade: profile.grade, style: profile.style, energy: profile.energy } : {});
/* Study log (Student mode): one entry per day, used for the streak. In memory only when Ephemeral Mode is on. */
const study = Object.assign({ days: {} }, settings.ephemeral ? {} : store.get(K.study, {}));
const saveStudy = () => { if (settings.ephemeral) store.del(K.study); else store.set(K.study, study); };
let chatsDB = store.get(K.chats, { list: [], active: null });
if (!Array.isArray(chatsDB.list)) chatsDB = { list: [], active: null };

const defStats = () => ({ checks: { low: 0, medium: 0, high: 0 }, rewrites: 0, scans: 0, stories: 0, perfect: 0, decisions: 0, breaths: 0, grounding: 0, cards: 0, points: 0, moods: [], days: [], badges: [], challengeDay: "" });
const stats = (() => { const s = store.get(K.stats, {}); const d = defStats(); return Object.assign(d, s, { checks: Object.assign(d.checks, s.checks || {}) }); })();
const saveStats = () => store.set(K.stats, stats);
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function streak() {
  let n = 0; const d = new Date(); const set = new Set(stats.days);
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

const LEVEL_STEPS = [["Seedling", 0], ["Sprout", 40], ["Helper", 100], ["Defender", 200], ["Guardian", 350]];
function levelInfo() {
  let i = 0; LEVEL_STEPS.forEach(([, p], j) => { if (stats.points >= p) i = j; });
  const next = LEVEL_STEPS[i + 1];
  return { name: LEVEL_STEPS[i][0], i, next: next ? next[1] : null, nextName: next ? next[0] : null, from: LEVEL_STEPS[i][1] };
}
const BADGES = [
  { id: "first", name: "First check", desc: "Check your first message", icon: "shield", ok: s => totalChecks() >= 1 },
  { id: "rewriter", name: "Kind rewriter", desc: "Turn a hurtful message into a kind one", icon: "sparkles", ok: s => s.rewrites >= 1 },
  { id: "robot", name: "Robot ally", desc: "Scan a screenshot or file", icon: "scan", ok: s => s.scans >= 1 },
  { id: "story", name: "Story finisher", desc: "Finish an interactive story", icon: "book", ok: s => s.stories >= 1 },
  { id: "upstander", name: "Upstander", desc: "Make the best choice in every chapter", icon: "flag", ok: s => s.perfect >= 1 },
  { id: "calm", name: "Calm breather", desc: "Finish a breathing exercise", icon: "heart", ok: s => s.breaths >= 1 },
  { id: "grounded", name: "Grounded", desc: "Finish the 5-4-3-2-1 exercise", icon: "target", ok: s => s.grounding >= 1 },
  { id: "card", name: "Kindness maker", desc: "Make a kindness card", icon: "heart", ok: s => s.cards >= 1 },
  { id: "streak", name: "3-day streak", desc: "Use KindGuard 3 days in a row", icon: "trophy", ok: s => streak() >= 3 },
];
const totalChecks = () => stats.checks.low + stats.checks.medium + stats.checks.high;
function flash(text) {
  let host = $("#flashHost"); if (!host) { host = document.createElement("div"); host.id = "flashHost"; host.setAttribute("role", "status"); document.body.appendChild(host); }
  const n = document.createElement("div"); n.className = "flash"; n.textContent = text; host.appendChild(n);
  setTimeout(() => n.remove(), 3400);
}
function checkBadges() {
  BADGES.forEach(b => { if (!stats.badges.includes(b.id) && b.ok(stats)) { stats.badges.push(b.id); flash(`Badge unlocked: ${b.name}`); } });
}
function award(points, { silent = false } = {}) {
  const t = dayKey(); if (!stats.days.includes(t)) { stats.days.push(t); stats.days = stats.days.slice(-90); }
  const before = levelInfo().i; stats.points += points; checkBadges(); saveStats();
  if (!silent && points) flash(`+${points} kindness points`);
  if (levelInfo().i > before) flash(`Level up: ${levelInfo().name}`);
}
function countCheck(level) { if (stats.checks[level] !== undefined) stats.checks[level]++; award(2, { silent: true }); }

/* ---------- in-memory UI state ---------- */
const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const state = {
  status: "checking", model: "gemini-3.1-flash-lite",
  chat: { id: newId(), msgs: [], busy: false, attach: null },
  stream: null, pendingSend: null,
  scan: { files: [], busy: false, report: null },
  story: { tab: "stories", cur: null, loading: false, error: "" },
  lab: { i: 0, picked: null, done: 0, ai: null, loading: false },
  calm: { mood: null, timer: null, phase: 0, left: 0, cycles: 0, on: false, g: -1, kind: { items: [], loading: false, error: "", tone: "cheer" } },
  confirm: null,
};
let demoTimer = null, spotOff = null, lastRoute = null;

const downloadBlob = (name, blob) => { const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); };

/* ---------- navigation ---------- */
const NAV = [
  { id: "home", label: "Home", icon: "home" },
  { id: "chat", label: "KindGuard Chat", icon: "chat", badge: "AI" },
  { id: "scan", label: "Safety Scanner", icon: "scan" },
  { id: "stories", label: "Story Mode", icon: "book" },
  { id: "calm", label: "Calm Corner", icon: "heart" },
  { id: "journey", label: "My Journey", icon: "trophy" },
];
// Only shown (and usable) in Student mode
const STUDY_NAV = [
  { id: "planner", label: "Quiz Planner", icon: "target" },
  { id: "focus", label: "Focus Timer", icon: "timer" },
  { id: "cards", label: "Flashcards", icon: "cards", badge: "AI" },
];
const STUDENT_ONLY = new Set(STUDY_NAV.map(n => n.id));
const label = id => ({ home: "Home", chat: "Chat", scan: "Safety Scanner", planner: "Quiz Planner", focus: "Focus Timer", cards: "Flashcards", stories: "Story Mode", calm: "Calm Corner", journey: "My Journey" }[id]);

function buildChrome() {
  $("#logo").innerHTML = icon("shield", 22);
  $("#menu").innerHTML = icon("menu", 18);
  $("#newChatSide").innerHTML = `${icon("plus", 17)}<span>New chat</span>`;
  $(".top")?.insertAdjacentHTML("beforeend", accountBtn());
  $(".top .pill")?.insertAdjacentHTML("beforebegin", modeSwitchHTML() + '<div class="chipbox" id="chipbox"></div>');
  buildMenu();
  renderNav(false);
  $("#privacy").innerHTML = `<span class="ptxt">${icon("lock", 14)}<span id="privTxt"></span></span><label class="switch" title="Save chats on this device"><input type="checkbox" id="saveToggle" role="switch" aria-label="Save chats on this device"><i></i></label>`;
  $("#saveToggle").checked = settings.save;
  $("#saveToggle").onchange = e => {
    settings.save = e.target.checked; store.set(K.set, settings); paintPrivacy();
    if (settings.save) persistChat(); else flash("Saving is off. Saved chats stay until you delete them.");
    paintRecent();
  };
  paintPrivacy();
}
function paintPrivacy() { const t = $("#privTxt"); if (t) t.textContent = settings.save ? "Chats saved on this device only" : "Chat saving is off"; }
const go = id => { location.hash = "#/" + id; };
const currentId = () => { const id = location.hash.replace(/^#\//, ""); return PAGES[id] ? id : "home"; };

function route() {
  clearInterval(demoTimer); stopBreath(true); spotOff?.(); spotOff = null; closeMenu();
  const id = currentId();
  document.body.classList.toggle("landing", id === "home");
  $$("#nav a").forEach(a => { if (a.dataset.id === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  $("#crumb").textContent = label(id);
  document.title = id === "home" ? "KindGuard AI · Pause. Think kinder. Send smarter." : `${label(id)} · KindGuard AI`;
  const v = $("#view");
  v.className = "page" + (id === "home" ? " wide" : id === "chat" ? " chatpage" : "") + (id !== lastRoute ? " enter" : "");
  moveNavInd(lastRoute === null || lastRoute === "home");
  lastRoute = id;
  const page = STUDENT_ONLY.has(id) && !isStudent() ? LOCKED_PAGE : PAGES[id];
  v.innerHTML = page.html();
  page.mount?.();
  if (id !== "chat") window.scrollTo(0, 0);
  document.body.classList.remove("nav-open");
  paintRecent(); paintChips();
}

const STATUS = {
  connected: ["ok", "Online", "Gemini connected", () => state.model],
  missing_key: ["warn", "Key missing", "API key missing", () => "Add it to backend/.env"],
  invalid_key: ["bad", "Key rejected", "API key rejected", () => "Check GEMINI_API_KEY in backend/.env"],
  model_not_found: ["bad", "Model error", "Model not found", () => "Check GEMINI_MODEL in backend/.env"],
  unreachable: ["warn", "No Gemini", "Can't reach Gemini", () => "Check your internet connection"],
  offline: ["warn", "Offline", "Backend offline", () => "Start KindGuard to connect"],
  checking: ["warn", "Checking", "Checking…", () => "Looking for the KindGuard server"],
};
function paintStatus() {
  const [tone, pill, title, sub] = STATUS[state.status] || STATUS.offline;
  $$(".pill").forEach(p => { p.dataset.s = tone; $(".pillText", p).textContent = pill; });
  $("#conn").dataset.s = tone; $("#connTitle").textContent = title; $("#connSub").textContent = sub();
  const m = $("#statModel"); if (m) m.textContent = state.model;
}
async function health() {
  try { const d = await (await fetch("/api/health")).json(); state.status = d.status || (d.gemini_configured ? "connected" : "missing_key"); state.model = d.model || state.model; }
  catch { state.status = "offline"; }
  paintStatus();
}

const pageHead = (eyebrow, title, text) => `<header class="ph"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${text}</p></header>`;
async function copyText(btn, text) {
  try { await navigator.clipboard.writeText(text); const o = btn.innerHTML; btn.innerHTML = `${icon("check", 14)} Copied`; setTimeout(() => (btn.innerHTML = o), 1400); }
  catch { btn.textContent = "Press Ctrl+C"; }
}
const LEVELS = { low: ["Low concern", "Looks safe"], medium: ["Worth a pause", "Be careful"], high: ["High concern", "Not safe"] };
const supportHTML = () => `<div class="support"><b>You're not alone</b><p>If you're feeling really low or unsafe, please tell a parent, teacher or another adult you trust today. You can also reach a free helpline:</p>
  <ul><li><strong>Tele-MANAS 14416</strong> · free mental-health support, 24×7 (India)</li><li><strong>Childline 1098</strong> · for children and teens, 24×7 (India)</li></ul>
  <p class="small muted">Somewhere else? Ask an adult to help you find your local helpline.</p><a class="btn sm" href="#/calm">${icon("heart", 14)} Try a calming exercise</a></div>`;
function verdictHTML(s) {
  const r = LEVELS[s.level] ? s.level : "medium";
  const cats = (s.categories || []).map(c => `<span class="tag">${esc(c)}</span>`).join("");
  const acts = (s.actions || []).length ? `<ul class="v-actions">${s.actions.map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : "";
  const distress = (s.categories || []).some(c => /distress/i.test(c));
  return `<div class="verdict" data-r="${r}"><div class="v-top"><div class="meter" aria-hidden="true"><i></i><i></i><i></i></div><span class="v-label">${LEVELS[r][0]}</span><span class="v-sub">${LEVELS[r][1]}</span></div>
    ${s.headline ? `<p class="v-head">${esc(s.headline)}</p>` : ""}${cats ? `<div class="tags">${cats}</div>` : ""}${acts}
    ${r === "high" && !distress ? `<div class="notice warn">${icon("shield", 16)}<span>If you feel unsafe or threatened, tell a parent, teacher or another adult you trust right away.</span></div>` : ""}
    ${distress ? supportHTML() : ""}
    ${s.unconfirmed ? `<div class="notice warn"><span>Gemini couldn't check this, so this comes from the built-in scan only.</span></div>` : ""}</div>`;
}
const PAGES = {};


/* ===================== HOME (landing) ===================== */
const DEMOS = [
  { tab: "Hurtful message", msg: "You're stupid and nobody wants you here.", s: { level: "high", headline: "This message insults and excludes you.", categories: ["insult", "exclusion"], actions: ["Don't reply while you're upset.", "Save a screenshot.", "Tell a trusted adult."] } },
  { tab: "Normal disagreement", msg: "I disagree with your plan. I think it's too risky.", s: { level: "low", headline: "A normal disagreement about an idea.", categories: [], actions: ["Reply with your reasons.", "No action needed."] } },
  { tab: "Suspicious link", msg: "Free skin! Log in before midnight: skin-claim.example", s: { level: "medium", headline: "This looks like a login scam.", categories: ["scam", "privacy"], actions: ["Don't open the link or log in.", "Tell your friend if it came from their account."] } },
];
const DEMO_EXTRA = [
  { kind: "Toxic message", rewrite: "I'm really upset about what happened. Can we talk about it once we've both calmed down?" },
  { kind: "Original message", rewrite: "I see it differently, and I'm worried it's too risky. Can we go through the risks together?" },
  { kind: "Scam message", rewrite: "That looks like a phishing link, so I won't log in. Did your account get hacked? Let's tell a trusted adult." },
];
DEMOS.forEach((d, i) => Object.assign(d, DEMO_EXTRA[i]));
const SAFE_VERDICT = { level: "low", headline: "Clear, calm and kind.", categories: [], actions: ["Send it when you're ready."] };
const headlineHTML = (() => {
  return [["Pause."], ["Think kinder.", "l"], ["Send smarter.", ""]].map(([t, c], line) =>
    `<span${c ? ` class="${c}"` : ""}>${t.split(" ").map((w, j) => `<span class="w" style="--d:${(line * 0.16 + j * 0.07).toFixed(2)}s">${w}</span>`).join(" ")}</span>`).join("");
})();
const FEATURES = [
  ["chat", "chat", "KindGuard Chat", "Ask anything, check a message, get coaching, or make words kinder. It also replies in Hindi, Hinglish and more."],
  ["scan", "scan", "Safety Scanner", "A friendly robot reads screenshots, PDFs and text, then explains what's unsafe and what to do."],
  ["stories", "book", "Story Mode", "Interactive stories where every choice changes what happens next. Made fresh by AI each time."],
  ["calm", "heart", "Calm Corner", "Mood check-ins, breathing and grounding exercises, and a studio for making kindness cards."],
  ["journey", "trophy", "My Journey", "Earn kindness points and badges, and see your own progress. It's saved only on your device."],
];
const SAFEGUARDS = [
  ["Input guard", "Text that tries to override the AI's rules is treated as content to analyze, never as a command."],
  ["Output filter", "Every rewrite and kind message is scanned for insults and stereotypes before you ever see it."],
  ["Gemini safety filters", "Sexual and dangerous content is blocked. Hurtful messages can still be read so they can be explained."],
  ["Fair and private", "KindGuard never identifies people from faces and never guesses traits like religion, caste or gender."],
  ["Humans in the loop", "For threats, scams or distress it points to a trusted adult and free helplines. AI is the helper, not the judge."],
  ["You control your data", "Chats are saved only in your browser. Turn saving off, download, or delete everything any time."],
];
PAGES.home = {
  html: () => `
  <div class="spot" id="spot" aria-hidden="true"></div>
  <div class="scrollbar" id="scrollBar" aria-hidden="true"></div>
  <header class="l-top"><div class="wrap">
    <a class="brand" href="#/home" aria-label="KindGuard AI home"><div class="logo">${icon("shield", 22)}</div><div><b>KindGuard <em>AI</em></b><span>digital safety companion</span></div></a>
    <nav class="l-links" aria-label="Page sections"><a href="#how" data-scroll="how">How it works</a><a href="#features" data-scroll="features">Features</a><a href="#levels" data-scroll="levels">Verdicts</a><a href="#safeguards" data-scroll="safeguards">Responsible AI</a><a href="#/planner">Quiz Planner</a></nav>
    <div class="pill" role="status"><i class="dot"></i><span class="pillText">Checking</span></div>
    <a class="btn primary sm" href="#/chat">Open KindGuard</a>
    ${accountBtn()}
  </div></header>

  <section class="l-hero"><i class="orb o1" aria-hidden="true"></i><i class="orb o2" aria-hidden="true"></i><div class="wrap">
    <div>
      <div class="eyebrow">Student safety copilot</div>
      <h1 aria-label="Pause. Think kinder. Send smarter.">${headlineHTML}</h1>
      <p class="lead">One AI companion that spots cyberbullying, scams and signs of distress, explains why in plain words, and helps students respond with kindness. Paste a message, upload a screenshot, or share your screen.</p>
      <div class="row"><a class="btn primary lg" href="#/chat">${icon("chat", 17)} Start chatting</a><a class="btn lg" href="#/scan">${icon("scan", 16)} Scan a screenshot</a></div>
      <div class="trust"><span>${icon("lock", 15)} Chats stay on your device</span><span>${icon("check", 15)} Uploads never stored</span><span>${icon("chat", 15)} Plain-language answers</span></div>
    </div>
    <div class="demo-wrap">
    <div class="ba" role="group" aria-label="Before and after"><span id="baL" class="on">Original</span><label class="switch" title="Show the KindGuard safe rewrite"><input type="checkbox" id="baToggle" role="switch" aria-label="Show KindGuard safe rewrite"><i></i></label><span id="baR">KindGuard rewrite</span></div>
    <div class="demo float" aria-label="Example of a KindGuard check">
      <div class="demo-bar" role="group" aria-label="Choose an example">${DEMOS.map((d, i) => `<button class="chip" type="button" data-demo="${i}" aria-pressed="${i === 0}">${d.tab}</button>`).join("")}<span class="tagline">Example</span></div>
      <div id="demoBody" aria-live="polite"></div>
    </div>
    </div>
  </div></section>

  <section class="sec" id="how"><div class="wrap">
    <h2>Show it. Get a straight answer.</h2><p class="sub">No menus to learn. You show KindGuard what's going on and it works out what you need.</p>
    <div class="grid3">
      <div class="step"><div class="n">1</div><h3>Show it or ask it</h3><p>Type a question, paste a message, upload a screenshot, or share your screen. Homework, tech, feelings: anything goes.</p></div>
      <div class="step"><div class="n">2</div><h3>See the verdict</h3><p>You get a clear level (low concern, worth a pause or high concern) and the reasons in plain words.</p></div>
      <div class="step"><div class="n">3</div><h3>Do the kind thing</h3><p>Get calmer ways to say it, next steps, and a nudge to involve a trusted adult when it really matters.</p></div>
    </div>
  </div></section>

  <section class="sec" id="features"><div class="wrap">
    <h2>Everything a student needs, in one place.</h2><p class="sub">Detect harm, understand it, respond with empathy, and learn from it.</p>
    <div class="grid3">${FEATURES.map(([id, ic, t, d]) => `<a class="lcard" href="#/${id}"><div class="ico">${icon(ic, 19)}</div><h3>${t}</h3><p>${d}</p><span class="go">Open ${icon("arrow", 15)}</span></a>`).join("")}
      <div class="lcard" style="cursor:default"><div class="ico">${icon("type", 19)}</div><h3>Kind rewrites</h3><p>Hurtful draft? Get Calm, Empathetic and Direct-but-kind versions that keep your point.</p></div></div>
  </div></section>

  <section class="sec" id="levels"><div class="wrap">
    <h2>Three verdicts. Always explained.</h2><p class="sub">KindGuard tells ordinary disagreement apart from harmful behavior, so not everything gets flagged.</p>
    <div class="grid3">
      ${[["low", "Low concern", "Looks safe", "Normal chat, honest disagreement or friendly banter.", "You can carry on."], ["medium", "Worth a pause", "Be careful", "Something feels off: pressure, a suspicious link, or words that could hurt.", "Slow down and think before replying."], ["high", "High concern", "Not safe", "Threats, targeted harassment, scams or signs someone could get hurt.", "Don't engage. Save it and tell a trusted adult."]].map(([r, t, sub, what, act]) => `<div class="lvl" data-r="${r}"><div class="v-top"><div class="meter" aria-hidden="true"><i></i><i></i><i></i></div></div><div><h3>${t}</h3><span class="when">${sub}</span></div><p>${what}</p><p><strong style="color:var(--text)">${act}</strong></p></div>`).join("")}
    </div>
  </div></section>

  <section class="sec" id="safeguards"><div class="wrap">
    <h2>Responsible AI, built in.</h2><p class="sub">Safeguards that work before, during and after the AI answers.</p>
    <div class="grid3">${SAFEGUARDS.map(([t, d]) => `<div class="way"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
  </div></section>

  <section class="sec"><div class="wrap">
    <h2>Safe by design.</h2><p class="sub">Built for students first: simple language, minimal data, and a human always in the loop.</p>
    <div class="stats">
      <div><small>Input guard</small><b>On</b><span>prompt-injection filter</span></div>
      <div><small>AI engine</small><b>Gemini</b><span id="statModel">${esc(state.model)}</span></div>
      <div><small>Data handling</small><b>On-device</b><span>chats saved in your browser only</span></div>
      <div><small>Student age</small><b>11–18</b><span>plain-language guidance</span></div>
    </div>
  </div></section>

  <section class="cta"><div class="wrap"><h2>Ready when you are.</h2><p>Ask a question, check a message, or show your screen.</p><a class="btn primary lg" href="#/chat">${icon("chat", 17)} Start chatting</a></div></section>
  <footer class="l-foot"><div class="wrap"><span>KindGuard AI · AI is the helper, not the judge.</span><span>Important situations should still involve a trusted adult.</span></div></footer>`,
  mount() {
    paintStatus();
    let i = 0, rewrite = false;
    const paint = () => {
      const body = $("#demoBody"); if (!body) return;
      const d = DEMOS[i];
      body.innerHTML = rewrite
        ? `<div class="bubble-in safe"><small>KindGuard safe rewrite</small>${esc(d.rewrite)}</div>${verdictHTML(SAFE_VERDICT)}`
        : `<div class="bubble-in"><small>${esc(d.kind)}</small>${esc(d.msg)}</div>${verdictHTML(d.s)}`;
      $$("[data-demo]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.demo === i));
      $("#baL")?.classList.toggle("on", !rewrite); $("#baR")?.classList.toggle("on", rewrite);
    };
    // 0.3s fade out, swap, 0.3s fade in
    const swap = async fn => {
      const b = $("#demoBody");
      if (!b) return;
      if (reduceMotion || !b.animate) { fn(); return; }
      try {
        await b.animate({ opacity: [1, 0] }, { duration: 300, easing: "ease", fill: "forwards" }).finished;
        fn();
        await b.animate({ opacity: [0, 1] }, { duration: 300, easing: "ease" }).finished;
      } catch { /* animation cancelled by navigation */ }
      b.getAnimations?.().forEach(a => a.cancel());
    };
    paint();
    $$("[data-demo]").forEach(b => b.onclick = () => { clearInterval(demoTimer); swap(() => { i = +b.dataset.demo; paint(); }); });
    $("#baToggle").onchange = e => { clearInterval(demoTimer); swap(() => { rewrite = e.target.checked; paint(); }); };
    if (!reduceMotion) demoTimer = setInterval(() => swap(() => { i = (i + 1) % DEMOS.length; paint(); }), 5200);
    $$("[data-scroll]").forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); });

    // Spotlight that eases toward the cursor (skipped on touch screens and for reduced motion)
    const spot = $("#spot");
    if (spot && !reduceMotion && window.matchMedia?.("(hover: hover)").matches) {
      let tx = innerWidth * 0.3, ty = 220, x = tx, y = ty, raf = 0;
      const loop = () => {
        x += (tx - x) * 0.12; y += (ty - y) * 0.12;
        spot.style.setProperty("--mx", x + "px"); spot.style.setProperty("--my", y + "px");
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
      };
      const move = e => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); };
      window.addEventListener("pointermove", move, { passive: true });
      spotOff = () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
    }
    const fxOff = landingFX(), prevOff = spotOff;
    spotOff = () => { prevOff?.(); fxOff(); };
  },
};


/* ===================== CHAT + SAVED HISTORY ===================== */
const MAX_FILE = 8_000_000;
async function shrinkImage(file, maxSide = 1800) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size < 1_500_000) return file;
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .85));
    return blob ? new File([blob], "image.jpg", { type: "image/jpeg" }) : file;
  } catch { return file; }
}
async function makeThumb(file) {
  if (!file?.type?.startsWith("image/")) return "";
  try {
    const bmp = await createImageBitmap(file); const k = Math.min(1, 160 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", .6);
  } catch { return ""; }
}
function toast(text) {
  const f = $(".foot"); if (!f) return flash(text);
  $(".toast", f)?.remove();
  const t = document.createElement("div"); t.className = "toast notice warn"; t.setAttribute("role", "status"); t.textContent = text; f.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

/* ---------- saved conversations ---------- */
const chatTitle = msgs => { const u = msgs.find(m => m.role === "user"); const t = (u?.text || u?.att?.name || "New chat").replace(/\s+/g, " ").trim(); return t.length > 42 ? t.slice(0, 40) + "…" : t || "New chat"; };
const serialMsgs = msgs => msgs.filter(m => !m.pending).map(m => m.role === "user"
  ? { role: "user", text: m.text || "", att: m.att ? { name: m.att.name, url: m.att.thumb || "" } : null }
  : { role: "bot", text: m.text || "", safety: m.safety || null, rewrites: m.rewrites || [], error: !!m.error, guard: !!m.guard });
function persistChat() {
  if (!settings.save) return;
  const ch = state.chat; const msgs = serialMsgs(ch.msgs); if (!msgs.length) return;
  const rec = { id: ch.id, title: chatTitle(msgs), updated: Date.now(), msgs: msgs.slice(-120) };
  chatsDB.list = [rec, ...chatsDB.list.filter(c => c.id !== ch.id)].slice(0, 40); chatsDB.active = ch.id;
  if (!store.set(K.chats, chatsDB)) { chatsDB.list = chatsDB.list.slice(0, Math.max(1, chatsDB.list.length >> 1)); store.set(K.chats, chatsDB); }
  paintRecent();
}
function paintRecent() {
  const box = $("#recent"); if (!box) return;
  if (!settings.save) { box.innerHTML = `<p class="rc-empty">Chat saving is off.</p>`; return; }
  const list = chatsDB.list.slice(0, 8);
  if (!list.length) { box.innerHTML = `<p class="rc-empty">Your chats will appear here.</p>`; return; }
  box.innerHTML = list.map(c => `<div class="rc ${c.id === state.chat.id ? "on" : ""}"><button class="rc-open" type="button" data-open="${esc(c.id)}" title="${esc(c.title)}">${esc(c.title)}</button><button class="rc-del" type="button" data-del="${esc(c.id)}" aria-label="Delete chat: ${esc(c.title)}">${icon("x", 13)}</button></div>`).join("");
}
function openChat(id) {
  if (state.chat.busy) return flash("Wait for the reply to finish first.");
  const rec = chatsDB.list.find(c => c.id === id); if (!rec) return;
  releaseUrls(); state.chat = { id: rec.id, msgs: rec.msgs.map(m => ({ ...m, att: m.att ? { name: m.att.name, url: m.att.url, thumb: m.att.url } : null })), busy: false, attach: null };
  chatsDB.active = id; store.set(K.chats, chatsDB);
  if (currentId() !== "chat") go("chat"); else route();
}
function deleteChat(id) {
  chatsDB.list = chatsDB.list.filter(c => c.id !== id); if (chatsDB.active === id) chatsDB.active = null; store.set(K.chats, chatsDB);
  if (state.chat.id === id) { if (state.chat.busy) { flash("Wait for the reply to finish first."); return; } resetChat(); if (currentId() === "chat") renderMsgs(); }
  paintRecent();
}
function chatAsText(msgs, title) {
  const lines = [`KindGuard AI chat: ${title}`, `Saved ${new Date().toLocaleString()}`, ""];
  msgs.filter(m => !m.pending).forEach(m => {
    if (m.role === "user") lines.push(`You: ${m.text}${m.att ? ` [attached: ${m.att.name}]` : ""}`);
    else lines.push(`KindGuard: ${m.safety ? `[${LEVELS[m.safety.level][0]} - ${LEVELS[m.safety.level][1]}: ${m.safety.headline}] ` : ""}${m.text}`);
    lines.push("");
  });
  return lines.join("\n");
}
function releaseUrls() { state.chat.msgs.forEach(m => { const u = m.att?.url; if (u && u.startsWith("blob:")) URL.revokeObjectURL(u); }); }

/* ---------- chat UI ---------- */
const STARTERS = [
  { ico: "shield", t: "Check a message", d: "Is it safe, or worth a pause?", act: "fill", v: "Is this message okay? \"" },
  { ico: "image", t: "Upload a screenshot", d: "Chat, post, email or file", act: "file" },
  { ico: "monitor", t: "Share my screen", d: "Check what's on it", act: "screen" },
  { ico: "chat", t: "Ask anything", d: "Why does a computer need RAM?", act: "send", v: "Why does a computer need RAM?" },
];
const CHIPS = ["A friend stopped replying to me", "Help me say this more kindly", "Explain this in 5 easy points", "How do I spot a phishing email?"];

function msgHTML(m, i) {
  if (m.role === "user") {
    const a = m.att; const media = a ? (a.url ? `<img class="att-img" src="${a.url}" alt="Attached image">` : `<span class="fname">${icon("book", 14)} ${esc(a.name)}</span>`) : "";
    return `<div class="m user">${media}${esc(m.text)}</div>`;
  }
  if (m.pending) return `<div class="m bot"><span class="typing"><i></i><i></i><i></i></span></div>`;
  const kind = m.safety && m.safety.level !== "low" && !m.rewrites?.length ? `<div class="row" style="margin-top:12px"><button class="btn sm" data-kind="${i}" type="button">${icon("sparkles", 14)} Make it kinder</button></div>` : "";
  const vers = (m.rewrites || []).length ? `<div class="versions">${m.rewrites.map((v, j) => `<div class="ver"><div class="row spread"><span class="lab">${esc(v.label)}</span><button class="btn sm" data-copy="${i}:${j}" type="button">${icon("copy", 14)} Copy</button></div><p>${esc(v.text)}</p></div>`).join("")}</div>` : "";
  return `<div class="m bot ${m.error ? "error" : ""}">${m.safety ? verdictHTML(m.safety) : ""}<div class="rich">${md(m.text)}</div>${vers}${kind}${m.guard ? '<small class="g">Input guard: instruction-like text was treated as content, not as a command.</small>' : ""}</div>`;
}
function renderMsgs() {
  const box = $("#msgs"); if (!box) return;
  const ch = state.chat;
  if (!ch.msgs.length) {
    box.innerHTML = `<div class="empty"><div><h2>What would you like to check or ask?</h2><p>Type a question, add a screenshot, or share your screen.</p></div>
      <div class="starters">${STARTERS.map((s, i) => `<button class="starter" type="button" data-st="${i}"><span class="ico">${icon(s.ico, 17)}</span><span><b>${s.t}</b><span>${s.d}</span></span></button>`).join("")}</div>
      <div class="chips">${CHIPS.map(c => `<button class="chip" type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`;
    return;
  }
  box.innerHTML = ch.msgs.map(msgHTML).join(""); box.scrollTop = box.scrollHeight;
}

function paintDock() {
  const on = !!state.stream;
  $("#dock")?.toggleAttribute("hidden", !on);
  $("#btnScreen")?.classList.toggle("on", on);
  $("#nav .live")?.toggleAttribute("hidden", !on);
}
function stopScreen() {
  state.stream?.getTracks().forEach(t => t.stop()); state.stream = null;
  const v = $("#preview"); if (v) v.srcObject = null;
  paintDock();
}
async function startScreen() {
  if (state.stream) return;
  if (!navigator.mediaDevices?.getDisplayMedia) return toast("This browser can't share screens. Use Chrome or Edge on a computer.");
  try {
    state.stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    state.stream.getVideoTracks()[0].addEventListener("ended", stopScreen);
    const v = $("#preview"); if (v) v.srcObject = state.stream;
    paintDock();
  } catch { toast("Screen sharing was cancelled or blocked by the browser."); }
}
async function captureFrame() {
  const v = $("#preview");
  if (!state.stream || !v?.videoWidth) { toast("The preview isn't ready yet. Try again in a second."); return null; }
  const k = Math.min(1, 1920 / v.videoWidth), c = document.createElement("canvas");
  c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
  c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .82));
  return blob ? new File([blob], "screen.jpg", { type: "image/jpeg" }) : null;
}

const fileOK = f => f.type.startsWith("image/") || f.type === "application/pdf" || f.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(f.name || "");
function setAttach(f) {
  if (!f) return;
  if (!fileOK(f)) return toast("Use an image, a PDF or a text file.");
  if (!f.type.startsWith("image/") && f.size > MAX_FILE) return toast("That file is over 8 MB.");
  clearAttach(); f._url = f.type.startsWith("image/") ? URL.createObjectURL(f) : ""; state.chat.attach = f; paintAttach();
}
function clearAttach() { const a = state.chat.attach; if (a?._url) URL.revokeObjectURL(a._url); state.chat.attach = null; paintAttach(); }
function paintAttach() {
  const el = $("#attach"); if (!el) return; const f = state.chat.attach;
  el.hidden = !f;
  el.innerHTML = f ? `${f.type.startsWith("image/") ? `<img src="${f._url}" alt="">` : icon("book", 22)}<span class="nm">${esc(f.name || "pasted image")}</span><button class="ibtn" id="rmAttach" type="button" aria-label="Remove attachment">${icon("x", 16)}</button>` : "";
  if (f) $("#rmAttach").onclick = clearAttach;
}

async function send(textArg, fileArg) {
  const ch = state.chat, ta = $("#cin"); if (ch.busy) return;
  const text = (textArg ?? ta?.value ?? "").trim(); const file = fileArg ?? ch.attach;
  if (!text && !file) return;
  const history = ch.msgs.filter(m => !m.pending && !m.error).slice(-12).map(m => m.role === "user"
    ? { role: "user", content: (m.text || "") + (m.att ? ` [attached: ${m.att.name}]` : "") }
    : { role: "assistant", content: (m.safety ? `[Verdict: ${LEVELS[m.safety.level][0]}. ${m.safety.headline}] ` : "") + m.text });
  const att = file ? { name: file.name || "image", url: file.type.startsWith("image/") ? (file._url || URL.createObjectURL(file)) : "", thumb: "" } : null;
  const pending = { role: "bot", pending: true };
  const userMsg = { role: "user", text, att };
  ch.msgs.push(userMsg, pending); ch.busy = true;
  if (ta) { ta.value = ""; ta.style.height = ""; }
  if (file === ch.attach) { ch.attach = null; paintAttach(); }
  const sb = $("#csend"); if (sb) sb.disabled = true; renderMsgs();
  if (file) makeThumb(file).then(t => { if (att) att.thumb = t; persistChat(); });
  persistChat();
  try {
    const fd = new FormData(); fd.append("message", text); fd.append("history", JSON.stringify(history));
    if (file) { const f = await shrinkImage(file); fd.append("file", f, f.name || "upload"); }
    const d = await api("/api/chat", fd, true);
    Object.assign(pending, { pending: false, text: d.reply || "No response.", safety: d.safety || null, rewrites: d.rewrites || [], error: !!d.error, guard: !!d.guard_flagged });
    if (pending.safety) countCheck(pending.safety.level);
    if (pending.rewrites.length) { stats.rewrites++; award(10); }
  } catch (err) { Object.assign(pending, { pending: false, text: err.message, error: true }); }
  ch.busy = false; persistChat();
  if (state.chat === ch) { renderMsgs(); const sb2 = $("#csend"); if (sb2) sb2.disabled = false; }
}
function resetChat() { releaseUrls(); clearAttach(); state.chat = { id: newId(), msgs: [], busy: false, attach: null }; chatsDB.active = null; store.set(K.chats, chatsDB); }
function newChat(silent) {
  if (state.chat.busy && !silent) return flash("Wait for the reply to finish first.");
  resetChat();
  if (currentId() !== "chat") go("chat"); else { renderMsgs(); $("#cin")?.focus(); paintRecent(); }
}
function startChatWith(text) { state.pendingSend = text; newChat(true); if (currentId() === "chat") { const t = state.pendingSend; state.pendingSend = null; send(t); } }

PAGES.chat = {
  html: () => `<section class="chat-wrap" id="chatWrap">
    <div class="chat-bar"><div><b>KindGuard Chat</b><span>Ask anything. Add a screenshot or share your screen.</span></div>
      <div class="row"><button class="btn sm" id="dlChat" type="button" title="Download this chat as a text file">${icon("download", 14)} Download</button><button class="btn sm" id="newChat" type="button">${icon("plus", 14)} New chat</button></div></div>
    <div class="msgs" id="msgs" aria-live="polite"></div>
    <div class="foot">
      <div class="attach" id="attach" hidden></div>
      <div class="dock" id="dock" hidden>
        <video id="preview" autoplay muted playsinline></video>
        <div><b><i></i> Sharing your screen</b><span class="t">Nothing is sent until you press a button. Snapshots aren't stored.</span>
          <div class="row"><button class="btn primary sm" id="dkCheck" type="button">${icon("shield", 14)} Capture &amp; check</button><button class="btn sm" id="dkAdd" type="button">Add to message</button><button class="btn danger sm" id="dkStop" type="button">Stop</button></div></div>
      </div>
      <div class="composer">
        <button class="ibtn" id="btnAttach" type="button" aria-label="Attach a screenshot or file" title="Attach a screenshot or file">${icon("clip", 20)}</button>
        <button class="ibtn" id="btnScreen" type="button" aria-label="Share your screen" title="Share your screen">${icon("monitor", 20)}</button>
        <textarea id="cin" rows="1" maxlength="6000" placeholder="Ask anything, paste a message to check, or add a screenshot…" aria-label="Your message"></textarea>
        <button class="ibtn send" id="csend" type="button" aria-label="Send">${icon("up", 20)}</button>
      </div>
      <p class="hint">Enter to send · Shift+Enter for a new line · KindGuard can make mistakes, so involve a trusted adult for serious things.</p>
    </div>
    <input type="file" id="fileIn" hidden accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,.txt,.md,.csv">
  </section>`,
  mount() {
    const ta = $("#cin"), wrap = $("#chatWrap");
    renderMsgs(); paintAttach(); paintDock();
    if (state.stream) $("#preview").srcObject = state.stream;
    $("#newChat").onclick = () => newChat();
    $("#dlChat").onclick = () => { const ch = state.chat; if (!ch.msgs.length) return toast("Nothing to download yet."); downloadBlob("kindguard-chat.txt", new Blob([chatAsText(ch.msgs, chatTitle(ch.msgs))], { type: "text/plain" })); };
    $("#csend").onclick = () => send();
    $("#csend").disabled = state.chat.busy;
    ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } };
    ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 150) + "px"; };
    $("#btnAttach").onclick = () => $("#fileIn").click();
    $("#fileIn").onchange = e => { setAttach(e.target.files[0]); e.target.value = ""; ta.focus(); };
    $("#btnScreen").onclick = () => (state.stream ? stopScreen() : startScreen());
    $("#dkStop").onclick = stopScreen;
    $("#dkAdd").onclick = async () => { const f = await captureFrame(); if (f) { setAttach(f); ta.focus(); } };
    $("#dkCheck").onclick = async () => { const f = await captureFrame(); if (f) send(ta.value.trim() || "Check what's on my screen. Is anything unsafe?", f); };
    ["dragenter", "dragover"].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); if (ev === "drop" || e.target === wrap) wrap.classList.remove("over"); }));
    wrap.addEventListener("drop", e => setAttach(e.dataTransfer.files[0]));
    $("#msgs").onclick = e => {
      const st = e.target.closest("[data-st]"), chip = e.target.closest("[data-chip]"), cp = e.target.closest("[data-copy]"), kd = e.target.closest("[data-kind]");
      if (st) { const s = STARTERS[+st.dataset.st]; if (s.act === "fill") { ta.value = s.v; ta.focus(); } else if (s.act === "file") $("#fileIn").click(); else if (s.act === "screen") startScreen(); else send(s.v); }
      else if (chip) { const t = chip.dataset.chip; if (/^Help me say|^Explain this/.test(t)) { ta.value = t + ": "; ta.focus(); } else send(t); }
      else if (cp) { const [mi, vi] = cp.dataset.copy.split(":").map(Number); copyText(cp, state.chat.msgs[mi].rewrites[vi].text); }
      else if (kd) send("Please rewrite that more kindly.");
    };
    ta.focus();
    if (state.pendingSend) { const t = state.pendingSend; state.pendingSend = null; send(t); }
  },
};
document.addEventListener("paste", e => {
  const f = [...(e.clipboardData?.files || [])][0]; if (!f) return;
  if (currentId() === "chat") { e.preventDefault(); setAttach(f); } else if (currentId() === "scan") { e.preventDefault(); addScanFiles([f]); }
});


/* ===================== SAFETY SCANNER (robot + file upload) ===================== */
const MOUTH = { idle: "M48 63 Q60 69 72 63", scanning: "M50 64 L70 64", safe: "M45 60 Q60 74 75 60", warn: "M50 65 L70 65", alert: "M49 68 Q60 58 71 68" };
const robotSVG = (state = "idle", size = 120) => `<svg class="robot" data-state="${state}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Kai the safety robot">
  <line x1="60" y1="9" x2="60" y2="22" class="r-line"/><circle class="r-ant" cx="60" cy="7" r="5"/>
  <rect class="r-ear" x="12" y="40" width="9" height="22" rx="4.5"/><rect class="r-ear" x="99" y="40" width="9" height="22" rx="4.5"/>
  <rect class="r-head" x="22" y="22" width="76" height="60" rx="18"/>
  <rect class="r-face" x="31" y="31" width="58" height="42" rx="12"/>
  <circle class="r-eye" cx="46" cy="50" r="6"/><circle class="r-eye" cx="74" cy="50" r="6"/>
  <path class="r-mouth" d="${MOUTH[state]}"/>
  <rect class="r-scan" x="31" y="31" width="58" height="3" rx="1.5"/>
  <rect class="r-body" x="34" y="86" width="52" height="28" rx="10"/><circle class="r-ant" cx="60" cy="100" r="4"/>
</svg>`;
function setRobot(st) { const r = $(".robot"); if (!r) return; r.dataset.state = st; $(".r-mouth", r).setAttribute("d", MOUTH[st] || MOUTH.idle); }

function addScanFiles(list) {
  const S = state.scan; let msg = "";
  for (const f of list) {
    if (!fileOK(f)) { msg = "Use images, PDFs or text files."; continue; }
    if (!f.type.startsWith("image/") && f.size > MAX_FILE) { msg = "A file was over 8 MB."; continue; }
    if (S.files.length >= 3) { msg = "Up to 3 files at a time."; break; }
    f._url = f.type.startsWith("image/") ? URL.createObjectURL(f) : ""; S.files.push(f);
  }
  paintScanFiles(); if (msg) scanNote(msg);
}
const scanNote = t => { const n = $("#snote"); if (n) { n.textContent = t; n.hidden = !t; } };
function paintScanFiles() {
  const box = $("#sfiles"); if (!box) return;
  box.innerHTML = state.scan.files.map((f, i) => `<div class="sf">${f._url ? `<img src="${f._url}" alt="">` : icon("book", 20)}<span class="nm">${esc(f.name || "pasted image")}</span><button class="ibtn" type="button" data-rm="${i}" aria-label="Remove ${esc(f.name || "image")}">${icon("x", 15)}</button></div>`).join("");
  $$("[data-rm]", box).forEach(b => b.onclick = () => { const [f] = state.scan.files.splice(+b.dataset.rm, 1); if (f?._url) URL.revokeObjectURL(f._url); paintScanFiles(); });
}
function reportText(r) {
  const L = LEVELS[r.level] || LEVELS.medium;
  const lines = ["KindGuard Safety Report", `Date: ${new Date().toLocaleString()}`, `Result: ${L[0]} (${L[1]})`, r.headline, ""];
  if (r.seen) lines.push(`What was checked: ${r.seen}`);
  if (r.text_found) lines.push("", "Text found:", r.text_found);
  if ((r.findings || []).length) { lines.push("", "Findings:"); r.findings.forEach(f => lines.push(`- ${f.type}: ${f.detail}`)); }
  if (r.why) lines.push("", `Why: ${r.why}`);
  if ((r.privacy_exposed || []).length) lines.push("", `Personal details visible: ${r.privacy_exposed.join(", ")}`);
  if ((r.actions || []).length) { lines.push("", "Suggested next steps:"); r.actions.forEach(a => lines.push(`- ${a}`)); }
  lines.push("", "Made by KindGuard AI. AI can make mistakes, so please look at the original yourself.");
  return lines.join("\n");
}
function reportHTML(r) {
  const cats = [...new Set((r.findings || []).map(f => f.type).filter(Boolean))];
  const finds = (r.findings || []).length ? `<div><h4 class="rh">Findings</h4><ul class="finds">${r.findings.map(f => `<li>${f.type ? `<span class="tag">${esc(f.type)}</span> ` : ""}${esc(f.detail)}</li>`).join("")}</ul></div>` : "";
  const priv = (r.privacy_exposed || []).length ? `<div class="notice warn">${icon("lock", 16)}<span><strong>Personal details visible:</strong> ${r.privacy_exposed.map(esc).join(", ")}. Think before sharing this with anyone.</span></div>` : "";
  return `<div class="report">
    ${verdictHTML({ level: r.level, headline: r.headline, categories: cats, actions: r.actions, unconfirmed: r.unconfirmed })}
    ${r.seen ? `<div><h4 class="rh">What Kai saw</h4><p class="muted">${esc(r.seen)}</p></div>` : ""}
    ${finds}${r.why ? `<div><h4 class="rh">Why</h4><p class="muted">${esc(r.why)}</p></div>` : ""}${priv}
    ${r.text_found ? `<details class="tf"><summary>Text Kai found</summary><blockquote>${esc(r.text_found)}</blockquote></details>` : ""}
    ${r.guard_flagged ? `<div class="notice">${icon("lock", 15)}<span>Input guard: instruction-like text was treated as content to analyze.</span></div>` : ""}
    <div class="row"><button class="btn sm" data-sc="copy" type="button">${icon("copy", 14)} Copy report for a trusted adult</button><button class="btn sm" data-sc="chat" type="button">${icon("chat", 14)} Talk about it</button><button class="btn sm" data-sc="again" type="button">Scan something else</button></div></div>`;
}
function paintScanOut() {
  const out = $("#sout"); if (!out) return; const S = state.scan;
  if (S.busy) { out.innerHTML = `<div class="empty-state"><span class="typing"><i></i><i></i><i></i></span><b>Kai is scanning…</b><span>Reading your files and checking for anything unsafe.</span></div>`; return; }
  if (!S.report) { out.innerHTML = `<div class="empty-state"><span class="ico-d">${icon("scan", 34)}</span><b>Your report appears here</b><span>Add a screenshot, PDF or text, then press Scan. Files are read once and never stored.</span></div>`; return; }
  if (S.report.error) { out.innerHTML = `<p class="err">${esc(S.report.error)}</p>`; return; }
  out.innerHTML = reportHTML(S.report);
  $$("[data-sc]", out).forEach(b => b.onclick = () => {
    const a = b.dataset.sc, r = S.report;
    if (a === "copy") copyText(b, reportText(r));
    else if (a === "chat") startChatWith(`I scanned something with the Safety Scanner. Result: ${LEVELS[r.level][0]} (${LEVELS[r.level][1]}). ${r.headline} Can you help me decide what to do next?`);
    else clearScan();
  });
}
function clearScan() { const S = state.scan; S.files.forEach(f => f._url && URL.revokeObjectURL(f._url)); S.files = []; S.report = null; const t = $("#stext"); if (t) t.value = ""; paintScanFiles(); paintScanOut(); scanNote(""); setRobot("idle"); }
async function runScan() {
  const S = state.scan; if (S.busy) return;
  const text = ($("#stext")?.value || "").trim();
  if (!text && !S.files.length) { scanNote("Add a screenshot, a file or some text first."); return; }
  scanNote(""); S.busy = true; S.report = null; setRobot("scanning"); paintScanOut(); $("#sgo").disabled = true; $("#sdrop")?.classList.add("scanning");
  try {
    const fd = new FormData(); fd.append("text", text);
    for (const f of S.files) { const s = await shrinkImage(f); fd.append("files", s, s.name || f.name || "upload"); }
    const r = await api("/api/scan", fd, true);
    S.report = r; countCheck(r.level); stats.scans++; award(5);
    setRobot(r.level === "low" ? "safe" : r.level === "medium" ? "warn" : "alert");
  } catch (err) { S.report = { error: err.message }; setRobot("idle"); }
  S.busy = false; $("#sdrop")?.classList.remove("scanning"); const g = $("#sgo"); if (g) g.disabled = false; paintScanOut();
}
PAGES.scan = {
  html: () => `${pageHead("Safety Scanner", "Let Kai check it for you.", "Drop in screenshots, PDFs or text. Kai the safety robot reads them, spots bullying, scams, misinformation and signs someone needs help, and tells you what to do.")}
  <div class="scan-grid">
    <section class="panel stack">
      <div class="robot-row">${robotSVG("idle", 96)}<div><b>Kai, your safety robot</b><span id="kaiSay">Show me something and I'll tell you if it looks safe.</span></div></div>
      <div class="drop" id="sdrop" tabindex="0" role="button" aria-label="Choose or drop files to scan"><div class="beam" aria-hidden="true"></div>${icon("upload", 30)}<b>Drop up to 3 files, paste an image, or click to browse</b><span>PNG, JPG, WebP, PDF or text · up to 8 MB each</span></div>
      <input type="file" id="sfile" hidden multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,.txt,.md,.csv">
      <div class="sfiles" id="sfiles"></div>
      <textarea class="field" id="stext" rows="3" maxlength="6000" placeholder="Or paste a message to check (optional)" aria-label="Text to scan"></textarea>
      <p class="notice warn" id="snote" hidden role="alert"></p>
      <div class="row"><button class="btn primary" id="sgo" type="button">${icon("scan", 16)} Scan now</button><button class="btn" id="sclear" type="button">Clear</button></div>
    </section>
    <section class="panel" id="sout" aria-live="polite"></section>
  </div>`,
  mount() {
    const S = state.scan, drop = $("#sdrop"), input = $("#sfile");
    paintScanFiles(); paintScanOut();
    if (S.report && !S.report.error) setRobot(S.report.level === "low" ? "safe" : S.report.level === "medium" ? "warn" : "alert");
    drop.onclick = () => input.click();
    drop.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } };
    input.onchange = () => { addScanFiles([...input.files]); input.value = ""; };
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => addScanFiles([...e.dataTransfer.files]));
    $("#sgo").onclick = runScan; $("#sclear").onclick = clearScan;
  },
};


/* ===================== STORY MODE (+ quick decisions) ===================== */
const STORIES = [
  { id: "chat", title: "The Group Chat", topic: "cyberbullying", blurb: "A classmate becomes the joke of the class chat. What do you do?",
    chapters: [
      { scene: "Maya's embarrassing photo lands in the class group chat. Within a minute there are laughing emojis and jokes. Your thumb hovers over the keyboard.", choices: [
        { text: "Add a laughing emoji so you fit in.", verdict: "risky", feedback: "Reactions count as joining in. Maya sees every one of them, and the pile-on feels huge to the person it's aimed at." },
        { text: "Message the person who posted it: \"Not cool, please take it down.\"", verdict: "good", feedback: "A private message lets them back down without an audience. You've also shown Maya that someone noticed." },
        { text: "Mute the chat and say nothing.", verdict: "mixed", feedback: "Stepping away is understandable, but the photo stays up and silence can look like approval." } ] },
      { scene: "The photo is gone, but now people are making jokes about Maya in a different chat. Someone tags you: \"You saw it too, right? Hilarious.\"", choices: [
        { text: "Reply \"haha yeah\" to avoid drama.", verdict: "risky", feedback: "Agreeing keeps you safe for a minute, but it joins you to the teasing and makes it easier for it to continue." },
        { text: "Reply: \"I didn't think it was funny. Let's drop it.\" Then check in on Maya privately.", verdict: "good", feedback: "One calm, clear sentence is often enough. Others who were uncomfortable may speak up too." },
        { text: "Leave the chat quietly.", verdict: "mixed", feedback: "That protects you, but the teasing carries on. Pair it with a message to Maya or an adult." } ] },
      { scene: "The next day, your teacher asks if anyone knows why Maya seems upset. The room goes quiet and people look at their desks.", choices: [
        { text: "Say you don't know anything.", verdict: "risky", feedback: "It keeps you out of trouble, but Maya is still dealing with it alone and the group chat stays unsafe." },
        { text: "Stay after class and tell the teacher what happened, and that you have screenshots.", verdict: "good", feedback: "Telling an adult isn't snitching. It's how this stops, and you can do it privately." },
        { text: "Hint to Maya that she should talk to someone.", verdict: "mixed", feedback: "That's kind, but she may not feel able to. Backing her up with an adult makes a real difference." } ] },
    ],
    endings: { great: "Maya knows she has someone on her side, and the teacher steps in quietly. The group chat gets rules, and the jokes stop. You didn't have to be loud to be brave.", ok: "Things calm down, though the teasing lingers for a while. Some of your choices helped Maya, and a few left her on her own. Next time, one private message goes a long way.", rough: "The jokes carried on and Maya felt very alone. It isn't too late: a kind message to her and a chat with a trusted adult can still turn this around." },
    takeaway: "You don't have to fight the crowd. A private message and a trusted adult can change everything." },
  { id: "scam", title: "Too Good To Be True", topic: "scams and privacy", blurb: "A free gaming prize, a friendly message, and a login page. Spot the trap.",
    chapters: [
      { scene: "A message from your friend Arjun's account says: \"OMG free skin! Claim before midnight!\" and has a link. It looks just like him, emojis and all.", choices: [
        { text: "Tap the link quickly before it expires.", verdict: "risky", feedback: "Countdowns are how scams rush you. Accounts get hacked, and the hacker messages everyone on the friends list." },
        { text: "Don't click. Message Arjun another way: \"Did you really send this?\"", verdict: "good", feedback: "Checking through a different route is the smartest move. If his account was hacked, he needs to know." },
        { text: "Ask in the group chat if anyone has tried it.", verdict: "mixed", feedback: "Asking is good, but the live link might tempt someone else. Describe it instead of forwarding it." } ] },
      { scene: "Arjun replies: \"Not me! I got locked out.\" Meanwhile, a different stranger messages you: \"I'm from game support. Send your password so I can fix your account.\"", choices: [
        { text: "Send the password. They said they're support.", verdict: "risky", feedback: "Real support never asks for your password. Anyone who does is trying to take over your account." },
        { text: "Ignore them, block and report the account.", verdict: "good", feedback: "Blocking and reporting protects you and helps the platform shut the scammer down." },
        { text: "Ask them to prove who they are.", verdict: "mixed", feedback: "It's smart to doubt them, but talking to a scammer gives them chances to pressure you." } ] },
      { scene: "You realize you tapped a link earlier in the week and used the same password everywhere. Your phone buzzes: \"New login from an unknown device.\"", choices: [
        { text: "Hope it goes away and say nothing.", verdict: "risky", feedback: "A takeover spreads fast, especially with reused passwords. The sooner you act, the less damage is done." },
        { text: "Change your passwords right now, turn on two-step login, and tell a parent.", verdict: "good", feedback: "Fast action, unique passwords and a trusted adult is exactly what security experts recommend." },
        { text: "Change only the game password.", verdict: "mixed", feedback: "A good start, but any account that used the same password is still at risk." } ] },
    ],
    endings: { great: "Your accounts stay yours, Arjun gets his back, and you've spotted a scam you'll recognize forever. You even warned your class.", ok: "You avoided the worst, but a few risky moments left gaps. Unique passwords and a quick \"is this really you?\" make you much safer.", rough: "The scammer got in, and it's a hassle to clean up. The good news: it's fixable. Change passwords, turn on two-step login and ask an adult to help." },
    takeaway: "Urgency and \"free\" are the red flags. Slow down, check another way, and never share a password." },
];
const TOPIC_CHIPS = ["a group chat turns on a classmate", "a gaming giveaway that's too good to be true", "a rumour spreads about your school", "an online friend asks you to keep a secret", "someone is left out of a class group"];
const VPOINTS = { good: 10, mixed: 5, risky: 0 };
const VLABEL = { good: "Strong choice", mixed: "Okay, but there's more you can do", risky: "This could backfire" };
const STORY_TIER = p => (p >= 24 ? "great" : p >= 12 ? "ok" : "rough");
const TIER_LABEL = { great: "Upstander", ok: "On the right track", rough: "Room to grow" };

function storyStartBuiltin(id) {
  const def = STORIES.find(s => s.id === id), c0 = def.chapters[0];
  state.story.cur = { src: "builtin", def, title: def.title, topic: def.topic, ch: 0, scene: c0.scene, choices: c0.choices, picked: null, turns: [], points: 0, final: null, counted: false };
  state.story.error = ""; route();
}
async function storyStartAI(topic) {
  const S = state.story; if (S.loading) return;
  S.loading = true; S.error = ""; route();
  try {
    const d = await api("/api/story", { topic, turns: [] });
    S.cur = { src: "ai", title: d.title, topic: d.topic || topic, ch: 0, scene: d.scene, choices: d.choices, picked: null, turns: [], points: 0, final: null, counted: false };
  } catch (e) { S.error = e.message; }
  S.loading = false; route();
}
function storyChoose(i) {
  const c = state.story.cur; if (c.picked != null) return;
  const ch = c.choices[i]; c.picked = i; c.turns.push({ scene: c.scene, choice: ch.text, verdict: ch.verdict }); c.points += VPOINTS[ch.verdict] ?? 0; route();
}
async function storyNext() {
  const S = state.story, c = S.cur; if (S.loading) return;
  if (c.src === "builtin") {
    if (c.ch < 2) { c.ch++; const n = c.def.chapters[c.ch]; c.scene = n.scene; c.choices = n.choices; c.picked = null; }
    else c.final = { ending: c.def.endings[STORY_TIER(c.points)], takeaway: c.def.takeaway };
  } else {
    S.loading = true; S.error = ""; route();
    try {
      const d = await api("/api/story", { topic: c.topic, turns: c.turns.map(t => ({ scene: t.scene, choice: t.choice, verdict: t.verdict })) });
      if (d.final) c.final = { ending: d.ending, takeaway: d.takeaway };
      else { c.ch++; c.scene = d.scene; c.choices = d.choices; c.picked = null; }
    } catch (e) { S.error = e.message; }
    S.loading = false;
  }
  if (c.final && !c.counted) {
    c.counted = true; stats.stories++; if (c.points >= 30) stats.perfect++; award(10 + c.points);
  }
  route();
}
function storyHTML() {
  const S = state.story, c = S.cur;
  const err = S.error ? `<p class="notice warn" role="alert">${esc(S.error)}${c ? "" : " The built-in stories still work without AI."}</p>` : "";
  if (!c) {
    return `${err}<div class="grid2">${STORIES.map(s => `<div class="lcard"><div class="ico">${icon("book", 19)}</div><h3>${s.title}</h3><p>${s.blurb}</p><button class="btn sm" style="margin-top:16px" type="button" data-play="${s.id}">${icon("play", 14)} Play</button></div>`).join("")}
      <div class="lcard" style="grid-column:1/-1"><div class="ico">${icon("sparkles", 19)}</div><h3>Make a new story with AI</h3><p>Every chapter reacts to your last choice, so no two stories are the same. Pick a topic or write your own.</p>
        <div class="row" style="margin:14px 0">${TOPIC_CHIPS.map(t => `<button class="chip" type="button" data-topic="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        <div class="row"><input class="field" id="stTopic" maxlength="80" placeholder="Or type a topic, like online gaming or sharing photos" style="flex:1;min-width:220px" aria-label="Story topic"><button class="btn primary" id="stGo" type="button" ${S.loading ? "disabled" : ""}>${icon("sparkles", 15)} ${S.loading ? "Writing your story…" : "Create my story"}</button></div></div></div>`;
  }
  if (c.final) {
    const tier = STORY_TIER(c.points);
    return `${err}<div class="panel story"><div class="eyebrow">${esc(c.title)} · The end</div><div class="sc-badge" data-t="${tier}"><b>${TIER_LABEL[tier]}</b><span>Kindness score ${c.points} / 30</span></div>
      <p class="story-text">${esc(c.final.ending)}</p>${c.final.takeaway ? `<div class="takeaway"><small>Remember</small><b>${esc(c.final.takeaway)}</b></div>` : ""}
      <div class="row" style="margin-top:20px"><button class="btn primary" data-st-act="again" type="button">Play another story</button><button class="btn" data-st-act="chat" type="button">${icon("chat", 15)} Talk about it</button></div></div>`;
  }
  const picked = c.picked != null ? c.choices[c.picked] : null;
  return `${err}<div class="panel story"><div class="row spread"><span class="eyebrow">${esc(c.title)}</span><span class="counter">Chapter ${c.ch + 1} of 3</span></div>
    <div class="prog" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i < c.ch ? "done" : i === c.ch ? "now" : ""}"></i>`).join("")}</div>
    <p class="story-text">${esc(c.scene)}</p>
    <div class="opts" role="group" aria-label="Your choices">${c.choices.map((o, i) => `<button class="opt ${c.picked === i ? "picked" : ""}" data-v="${o.verdict}" data-pick="${i}" type="button" ${picked ? "disabled" : ""}><span class="k">${"ABC"[i]}</span><span>${esc(o.text)}</span></button>`).join("")}</div>
    ${picked ? `<div class="fb" data-v="${picked.verdict}" aria-live="polite" style="margin-top:14px"><div class="verdict-t">${VLABEL[picked.verdict]}</div><p>${esc(picked.feedback)}</p>
      <div><button class="btn primary" id="stNext" type="button" ${S.loading ? "disabled" : ""}>${S.loading ? "Writing the next chapter…" : c.ch < 2 ? `Next chapter ${icon("arrow", 15)}` : `See the ending ${icon("arrow", 15)}`}</button></div></div>` : ""}</div>`;
}

/* ---- quick decisions (the old Decision Lab) ---- */
const V = { good: "Strong choice", mixed: "Okay, but there's more you can do", risky: "This could backfire" };
const SCENARIOS = [
  { title: "The group-chat pile-on", situation: "Someone posts an embarrassing photo of a classmate in your class group chat. Everyone is laughing and adding jokes.", options: [
    { text: "React with 😂 so you fit in.", verdict: "risky", outcome: "The person in the photo sees every reaction and feels more alone.", why: "Reactions count as joining in. A pile-on feels much bigger to the person it's aimed at than to the people typing.", tip: "If a joke is at someone's expense, skip the reaction. Not joining is already a choice." },
    { text: "Message the poster privately: “Not cool, please take it down.” Then check in with your classmate.", verdict: "good", outcome: "The poster may delete it, and your classmate knows someone is on their side.", why: "A private message gives the poster a way to back down without an audience, and a check-in tells the target they aren't alone.", tip: "Screenshot it first so an adult has evidence if it keeps going." },
    { text: "Say nothing and mute the chat.", verdict: "mixed", outcome: "You stay out of it, but the photo stays up and the jokes continue.", why: "Stepping away is understandable. Silence can also look like approval to the people in the chat.", tip: "Muting plus one private message to the classmate keeps you safe and still helps." },
  ] },
  { title: "“Share your password to keep my streak”", situation: "Your best friend asks for your password so they can keep your shared game streak going while you're away.", options: [
    { text: "Share it. They're your best friend.", verdict: "risky", outcome: "Your friend may mean well, but your account is now exposed if their device or chats are ever compromised.", why: "Passwords are the one thing nobody else needs, however close you are. Friends can also be hacked or lose their phone.", tip: "Never share passwords. Offer another way instead." },
    { text: "Say no kindly and offer to log in and keep the streak yourself.", verdict: "good", outcome: "Your friend gets what they actually wanted and your account stays yours.", why: "You protected your account without hurting the friendship by solving the real problem.", tip: "“I don't share passwords with anyone, but I'll keep it going tonight!”" },
    { text: "Share a password you use everywhere else.", verdict: "mixed", outcome: "It feels safe, but one leak could open every account that uses the same password.", why: "Reused passwords turn one slip into many. And you'd still be handing over access.", tip: "Use a different password for every important account, and keep them private." },
  ] },
  { title: "“You won a free skin!”", situation: "A message from a friend's account says: “Claim your free skin before midnight!” and links to a page that asks you to log in with your game account.", options: [
    { text: "Tap the link and log in quickly before it expires.", verdict: "risky", outcome: "If the page is fake, someone now has your login and may lock you out.", why: "Urgency is how scams work. A friend's account can be hacked and used to send links to everyone they know.", tip: "Never log in through a link in a message. Open the official app yourself." },
    { text: "Don't click. Tell your friend their account may be hacked, then delete the message.", verdict: "good", outcome: "Your friend can secure their account and fewer people get fooled.", why: "You avoided the trap and helped stop it from spreading.", tip: "Contact your friend another way. The hacker controls that chat." },
    { text: "Forward it to your group chat to ask if it's real.", verdict: "mixed", outcome: "Someone might click it before the warning lands.", why: "Asking is a good instinct, but forwarding the live link puts it in front of more people.", tip: "Describe it instead of forwarding it, or send a screenshot with the link hidden." },
  ] },
  { title: "The 11 p.m. reply", situation: "Your friend cancelled on you again. You type: “You're so annoying, no wonder nobody likes you.” Your thumb is over Send.", options: [
    { text: "Send it. They need to hear it.", verdict: "risky", outcome: "They'll probably remember the insult longer than the cancelled plan, and the screenshot can travel.", why: "Strong feelings are real, but this message attacks the person instead of explaining what hurt.", tip: "Wait. Messages last longer than moods do." },
    { text: "Wait until morning, then say: “I felt really let down when you cancelled again. Can we talk?”", verdict: "good", outcome: "Your friend hears the actual problem and has room to respond.", why: "You kept your point and dropped the insult. That's what a kind rewrite does.", tip: "Try writing the angry version in your notes, then not sending it." },
    { text: "Send nothing and stop talking to them.", verdict: "mixed", outcome: "You avoid a fight, but the hurt stays unspoken and the friendship cools.", why: "Pausing is smart. Going silent forever leaves your friend guessing.", tip: "Pause first, then say one honest sentence about how you feel." },
  ] },
  { title: "“Share before it's deleted!”", situation: "A post says your school is closing tomorrow because of an emergency. It has thousands of shares and ends with “Send to everyone you know.”", options: [
    { text: "Share it. Better safe than sorry.", verdict: "risky", outcome: "If it's false, it can cause panic and spread faster than the correction.", why: "Pressure to share is a common sign of misinformation. Lots of shares doesn't mean it's true.", tip: "Check before you forward. Being first matters less than being right." },
    { text: "Check the school's official website or ask a teacher, then decide.", verdict: "good", outcome: "You get the real answer in a minute and avoid spreading a rumor.", why: "Going to the source is the strongest fact-check there is.", tip: "Look for the original source, the date, and whether trusted outlets report it too." },
    { text: "Ask in the group chat whether anyone knows if it's true.", verdict: "mixed", outcome: "You may just collect more guesses.", why: "Asking is better than sharing, but friends usually know no more than you do.", tip: "Ask someone who would actually know: the school or a teacher." },
  ] },
  { title: "The friend who wants it secret", situation: "Someone you met in a game says you seem really mature for your age. They ask you to move to a private chat app and not tell anyone.", options: [
    { text: "Move to the private app. They seem nice.", verdict: "risky", outcome: "You lose the protections of the game's moderation and they gain more private access to you.", why: "Asking you to keep things secret and move somewhere private are classic warning signs, however friendly someone is.", tip: "Secrets with people you only know online are a red flag." },
    { text: "Stop replying, screenshot the chat, block them, and tell a parent or teacher.", verdict: "good", outcome: "You're safe, an adult can help, and the account can be reported.", why: "Telling an adult isn't snitching. It's what helps keep you and other players safe.", tip: "Use the game's report button too. Save the screenshots." },
    { text: "Keep playing together but don't move to the app.", verdict: "mixed", outcome: "It may feel safe, but the person is still in contact and may keep pushing.", why: "Saying no to the app was smart. Staying in contact still leaves you open to pressure.", tip: "If someone makes you uncomfortable, you don't owe them more conversation." },
  ] },
];
const LAB_TOPICS = ["Any topic", "group chats", "scams and links", "privacy", "misinformation", "online friends", "gaming chat"];
function labScenario() { return state.lab.ai || SCENARIOS[state.lab.i % SCENARIOS.length]; }

function labHTML() {
  const L = state.lab, s = labScenario(), picked = L.picked, o = picked != null ? s.options[picked] : null;
  return `<div class="lab"><section class="panel">
      <div class="row spread"><span class="eyebrow">${L.ai ? "Fresh scenario" : `Scenario ${(L.i % SCENARIOS.length) + 1} of ${SCENARIOS.length}`}</span><span class="counter">${L.done} completed this visit</span></div>
      <h2 class="sit">${esc(s.title)}</h2><p class="muted" style="margin-top:8px;font-size:15px;max-width:720px">${esc(s.situation)}</p>
      <div class="opts" role="group" aria-label="Your choices">${s.options.map((op, i) => `<button class="opt ${picked === i ? "picked" : ""}" data-v="${op.verdict}" data-i="${i}" type="button" ${picked != null ? "disabled" : ""}><span class="k">${"ABC"[i]}</span><span>${esc(op.text)}</span></button>`).join("")}</div>
    </section>
    ${o ? `<section class="fb" data-v="${o.verdict}" aria-live="polite"><div class="verdict-t">${V[o.verdict]}</div><div><h4>What probably happens</h4><p>${esc(o.outcome)}</p></div><div><h4>Why</h4><p>${esc(o.why)}</p></div><div><h4>Try this</h4><p>${esc(o.tip)}</p></div></section>` : ""}
    <div class="row">
      <button class="btn primary" id="labNext" type="button" ${picked == null ? "disabled" : ""}>Next scenario ${icon("arrow", 15)}</button>
      <select class="field" id="labTopic" style="width:auto" aria-label="Topic for a new scenario">${LAB_TOPICS.map(t => `<option>${t}</option>`).join("")}</select>
      <button class="btn" id="labAI" type="button" ${L.loading ? "disabled" : ""}>${icon("sparkles", 15)} ${L.loading ? "Writing…" : "New AI scenario"}</button>
    </div><p class="muted small" id="labMsg" aria-live="polite"></p></div>`;
}
PAGES.stories = {
  html: () => `${pageHead("Story Mode", "Choose. See what happens.", "Interactive stories about kindness, privacy and staying safe online. Your choices change the story, and you get gentle feedback, never blame.")}
    <div class="seg" role="group" aria-label="Mode" style="margin-bottom:18px"><button type="button" data-stab="stories" aria-pressed="${state.story.tab === "stories"}">Stories</button><button type="button" data-stab="lab" aria-pressed="${state.story.tab === "lab"}">Quick decisions</button></div>
    ${state.story.tab === "stories" ? storyHTML() : labHTML()}`,
  mount() {
    const S = state.story, L = state.lab;
    $$("[data-stab]").forEach(b => b.onclick = () => { S.tab = b.dataset.stab; route(); });
    if (S.tab === "stories") {
      $$("[data-play]").forEach(b => b.onclick = () => storyStartBuiltin(b.dataset.play));
      $$("[data-topic]").forEach(b => b.onclick = () => storyStartAI(b.dataset.topic));
      $("#stGo")?.addEventListener("click", () => storyStartAI(($("#stTopic").value || "").trim()));
      $$("[data-pick]").forEach(b => b.onclick = () => storyChoose(+b.dataset.pick));
      $("#stNext")?.addEventListener("click", storyNext);
      $$("[data-st-act]").forEach(b => b.onclick = () => {
        if (b.dataset.stAct === "again") { S.cur = null; route(); }
        else startChatWith(`I just finished a KindGuard story called "${S.cur.title}". What can I learn from it?`);
      });
    } else {
      $$(".opt").forEach(b => b.onclick = () => { L.picked = +b.dataset.i; L.done++; stats.decisions++; award(labScenario().options[L.picked].verdict === "good" ? 5 : 2); route(); });
      $("#labNext").onclick = () => { L.i++; L.ai = null; L.picked = null; route(); };
      $("#labAI").onclick = async () => {
        const topic = $("#labTopic").value; L.loading = true; route();
        try {
          const d = await api("/api/scenario", { topic: topic === "Any topic" ? "" : topic });
          L.ai = { title: d.title, situation: d.situation, options: d.options.map(o => ({ ...o })).sort(() => Math.random() - .5) }; L.picked = null;
        } catch (err) { L.loading = false; route(); const m = $("#labMsg"); m.textContent = err.message; m.classList.add("err"); return; }
        L.loading = false; route();
      };
    }
  },
};


/* ===================== CALM CORNER ===================== */
const MOODS = [
  { k: "great", e: "😄", t: "Great", msg: "Love that. Maybe pass the good energy on: send a kind message to someone today." },
  { k: "okay", e: "🙂", t: "Okay", msg: "Okay is okay. A small kind act can turn an okay day into a good one." },
  { k: "meh", e: "😐", t: "Meh", msg: "Meh days happen. Some water, a short walk or a breathing break can help." },
  { k: "sad", e: "😔", t: "Sad", msg: "I'm sorry you're feeling low. You don't have to carry it alone: consider telling someone you trust. A slow breath can help right now.", help: true },
  { k: "stressed", e: "😣", t: "Stressed", msg: "That sounds heavy. Let's slow down together. Try the breathing exercise below, then break one worry into one tiny step.", help: true },
];
const CHALLENGES = ["Say thank you to someone who usually goes unnoticed.", "Send a kind message to a friend you haven't talked to in a while.", "Invite someone who's sitting alone to join you.", "Give a genuine compliment about someone's effort, not their looks.", "Before you reply to a message today, take one slow breath.", "Say something kind about a classmate in the group chat.", "Thank a teacher for something specific.", "Apologize for something small you've been putting off.", "Listen to someone without interrupting.", "Cheer for a friend's win, big or small.", "Mute or leave a chat that makes you feel bad.", "Write down three things you're grateful for."];
const todaysChallenge = () => CHALLENGES[Math.floor(Date.now() / 86400000) % CHALLENGES.length];
const KIND_EX = ["My friend is stressed about exams", "A classmate lost the match", "A new student sits alone", "I was rude to my friend"];
const KIND_TONES = [["cheer", "Cheer them up"], ["sorry", "Say sorry"], ["thanks", "Say thanks"], ["include", "Include someone"]];
const PHASES = [{ n: "Breathe in", s: 4 }, { n: "Hold", s: 4 }, { n: "Breathe out", s: 6 }];
const GROUND = [[5, "things you can see"], [4, "things you can touch"], [3, "things you can hear"], [2, "things you can smell"], [1, "thing you can taste, or take one slow breath"]];

/* ---- breathing ---- */
function paintBreath() {
  const C = state.calm, circle = $("#bCircle"); if (!circle) return;
  const ph = PHASES[C.phase];
  $("#bPhase").textContent = C.on ? ph.n : "Ready?";
  $("#bCount").textContent = C.on ? `${C.left}` : "Press start";
  $("#bCycles").textContent = `Cycles: ${C.cycles}`;
  $("#bGo").textContent = C.on ? "Stop" : "Start";
  circle.style.transitionDuration = C.on ? `${ph.s}s` : ".4s";
  circle.classList.toggle("big", C.on && C.phase <= 1);
}
function startBreath() {
  const C = state.calm; if (C.on) return;
  Object.assign(C, { on: true, phase: 0, left: PHASES[0].s, cycles: 0 }); paintBreath();
  C.timer = setInterval(() => {
    C.left--;
    if (C.left <= 0) { C.phase = (C.phase + 1) % PHASES.length; if (C.phase === 0) C.cycles++; C.left = PHASES[C.phase].s; }
    paintBreath();
  }, 1000);
}
function stopBreath(silent) {
  const C = state.calm; if (!C.on && !C.timer) return;
  clearInterval(C.timer); C.timer = null; const done = C.cycles >= 2; C.on = false; C.phase = 0;
  if (!silent) paintBreath();
  if (done) { stats.breaths++; award(5); }
  C.cycles = done ? 0 : C.cycles;
}

/* ---- kindness card (generative visual, drawn on a canvas, downloaded as a PNG) ---- */
function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/), lines = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
function makeCard(text) {
  const c = document.createElement("canvas"); c.width = c.height = 1080; const ctx = c.getContext?.("2d");
  if (!ctx) return flash("Cards can't be made in this browser.");
  const g = ctx.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, "#0b0f10"); g.addColorStop(1, "#1d2b0b"); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "rgba(197,242,75,.10)"; ctx.beginPath(); ctx.arc(930, 150, 260, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(140, 960, 200, 0, 7); ctx.fill();
  ctx.fillStyle = "#c5f24b"; ctx.font = "700 40px 'Space Grotesk', system-ui, sans-serif"; ctx.fillText("A kind word for you", 90, 150);
  ctx.fillStyle = "#f3f6f4"; let size = 68; ctx.font = `600 ${size}px 'Space Grotesk', system-ui, sans-serif`; let lines = wrapLines(ctx, text, 900);
  while (lines.length * size * 1.3 > 640 && size > 36) { size -= 4; ctx.font = `600 ${size}px 'Space Grotesk', system-ui, sans-serif`; lines = wrapLines(ctx, text, 900); }
  const top = 540 - (lines.length * size * 1.3) / 2; lines.forEach((l, i) => ctx.fillText(l, 90, top + (i + 1) * size * 1.3));
  ctx.fillStyle = "#8e99a0"; ctx.font = "500 32px Inter, system-ui, sans-serif"; ctx.fillText("Made with KindGuard AI", 90, 990);
  c.toBlob(b => { if (!b) return flash("Couldn't make the card."); downloadBlob("kindness-card.png", b); stats.cards++; award(10); }, "image/png");
}
async function genKind() {
  const K2 = state.calm.kind, sit = ($("#kSit")?.value || "").trim(); if (K2.loading) return;
  if (!sit) { K2.error = "Tell me who you'd like to be kind to, and what's going on."; paintKind(); return; }
  K2.loading = true; K2.error = ""; paintKind();
  try { const d = await api("/api/kind", { situation: sit, tone: K2.tone }); K2.items = d.messages; }
  catch (e) { K2.error = e.message; K2.items = []; }
  K2.loading = false; paintKind();
}
function paintKind() {
  const K2 = state.calm.kind, out = $("#kOut"); if (!out) return;
  out.innerHTML = K2.error ? `<p class="notice warn" role="alert">${esc(K2.error)}</p>` : K2.loading ? `<span class="typing"><i></i><i></i><i></i></span>` :
    K2.items.map((t, i) => `<div class="ver"><p>${esc(t)}</p><div class="row" style="margin-top:10px"><button class="btn sm" data-kc="${i}" type="button">${icon("copy", 14)} Copy</button><button class="btn sm" data-km="${i}" type="button">${icon("image", 14)} Make a card</button></div></div>`).join("");
  $$("[data-kc]", out).forEach(b => b.onclick = () => copyText(b, K2.items[+b.dataset.kc]));
  $$("[data-km]", out).forEach(b => b.onclick = () => makeCard(K2.items[+b.dataset.km]));
  const go2 = $("#kGo"); if (go2) { go2.disabled = K2.loading; }
}

function moodHTML() {
  const C = state.calm, m = MOODS.find(x => x.k === C.mood);
  return `<div class="moods" role="group" aria-label="How are you feeling?">${MOODS.map(x => `<button class="mood" type="button" data-mood="${x.k}" aria-pressed="${C.mood === x.k}"><span aria-hidden="true">${x.e}</span>${x.t}</button>`).join("")}</div>
    ${m ? `<div class="mood-msg"><p>${esc(m.msg)}</p><div class="row"><button class="btn sm" data-mt="${m.k}" type="button">${icon("chat", 14)} Talk to EmpathyBot</button>${m.help ? `<button class="btn sm" data-mb type="button">Try breathing</button>` : ""}</div></div>` : ""}`;
}
PAGES.calm = {
  html: () => {
    const C = state.calm, done = stats.challengeDay === dayKey();
    return `${pageHead("Calm Corner", "Take a moment. You've got this.", "Check in with how you feel, slow your breathing, and spread some kindness. Everything here is private to you.")}
    <section class="challenge"><div><small>Today's kindness challenge</small><b>${esc(todaysChallenge())}</b></div><button class="btn sm ${done ? "" : "primary"}" id="chDone" type="button" ${done ? "disabled" : ""}>${done ? `${icon("check", 14)} Done today` : "I did it"}</button></section>
    <div class="calm-grid">
      <section class="panel"><h3 class="ct">How are you feeling?</h3><div id="moodBox">${moodHTML()}</div></section>
      <section class="panel" id="breathBox"><h3 class="ct">Breathing: 4 · 4 · 6</h3>
        <div class="breath"><div class="b-circle" id="bCircle"></div><div class="b-text"><b id="bPhase">Ready?</b><span id="bCount">Press start</span></div></div>
        <div class="row spread"><button class="btn primary" id="bGo" type="button">Start</button><span class="counter" id="bCycles">Cycles: 0</span></div><p class="muted small" style="margin-top:10px">Do at least 2 cycles, then press Stop to earn points.</p></section>
      <section class="panel"><h3 class="ct">Grounding: 5-4-3-2-1</h3><div id="gBox"></div></section>
      <section class="panel wide"><h3 class="ct">Kindness Studio</h3><p class="muted" style="margin-bottom:14px">Not sure what to say? Describe the situation and get three kind messages, then turn one into a card to share.</p>
        <div class="row" style="margin-bottom:12px">${KIND_EX.map(t => `<button class="chip" type="button" data-kex="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        <div class="row"><input class="field" id="kSit" maxlength="200" placeholder="Who is it for, and what's going on?" style="flex:1;min-width:220px" aria-label="Situation" value=""><select class="field" id="kTone" style="width:auto" aria-label="Kind of message">${KIND_TONES.map(([k, t]) => `<option value="${k}" ${C.kind.tone === k ? "selected" : ""}>${t}</option>`).join("")}</select><button class="btn primary" id="kGo" type="button">${icon("sparkles", 15)} Write kind messages</button></div>
        <div class="versions" id="kOut" aria-live="polite" style="margin-top:14px"></div></section>
    </div>`;
  },
  mount() {
    const C = state.calm;
    paintBreath(); paintKind(); paintGround();
    $("#chDone")?.addEventListener("click", () => { stats.challengeDay = dayKey(); award(5); route(); });
    const moodWire = () => {
      $$("[data-mood]").forEach(b => b.onclick = () => { C.mood = b.dataset.mood; stats.moods.push({ d: dayKey(), m: C.mood }); stats.moods = stats.moods.slice(-60); award(2, { silent: true }); $("#moodBox").innerHTML = moodHTML(); moodWire(); });
      $$("[data-mt]").forEach(b => b.onclick = () => { const m = MOODS.find(x => x.k === b.dataset.mt); startChatWith(`I'm feeling ${m.t.toLowerCase()} today. Can you help me?`); });
      $$("[data-mb]").forEach(b => b.onclick = () => { $("#breathBox").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); });
    };
    moodWire();
    $("#bGo").onclick = () => (C.on ? stopBreath() : startBreath());
    $$("[data-kex]").forEach(b => b.onclick = () => { $("#kSit").value = b.dataset.kex; $("#kSit").focus(); });
    $("#kTone").onchange = e => { C.kind.tone = e.target.value; };
    $("#kGo").onclick = genKind;
  },
};
function paintGround() {
  const C = state.calm, box = $("#gBox"); if (!box) return;
  if (C.g < 0) { box.innerHTML = `<p class="muted">A quick exercise to calm racing thoughts by noticing the world around you.</p><button class="btn primary" id="gStart" type="button" style="margin-top:12px">Start</button>`; $("#gStart").onclick = () => { C.g = 0; paintGround(); }; return; }
  if (C.g >= GROUND.length) { box.innerHTML = `<div class="g-done"><b>Well done.</b><p class="muted">Notice how your body feels now. You can repeat this any time.</p><button class="btn" id="gAgain" type="button" style="margin-top:12px">Again</button></div>`; $("#gAgain").onclick = () => { C.g = 0; paintGround(); }; return; }
  const [n, t] = GROUND[C.g];
  box.innerHTML = `<div class="g-step"><span class="g-n">${n}</span><b>${t}</b></div><div class="row" style="margin-top:14px"><button class="btn primary" id="gNext" type="button">${C.g === GROUND.length - 1 ? "Finish" : "Next"}</button><button class="btn" id="gStop" type="button">Stop</button></div>`;
  $("#gNext").onclick = () => { C.g++; if (C.g >= GROUND.length) { stats.grounding++; award(5); } paintGround(); };
  $("#gStop").onclick = () => { C.g = -1; paintGround(); };
}


/* ===================== MY JOURNEY ===================== */
function weekStrip() {
  const set = new Set(stats.days), out = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ on: set.has(dayKey(d)), l: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2) }); }
  return out;
}
function confirmRow(key, text, yesLabel) {
  return state.confirm === key
    ? `<div class="confirm" role="alertdialog" aria-label="Confirm"><span>${text}</span><button class="btn sm danger" data-yes="${key}" type="button">${yesLabel}</button><button class="btn sm" data-no type="button">Cancel</button></div>` : "";
}
PAGES.journey = {
  html: () => {
    const lv = levelInfo(), total = totalChecks(), pct = lv.next ? Math.round(((stats.points - lv.from) / (lv.next - lv.from)) * 100) : 100;
    const bars = ["low", "medium", "high"].map(k => { const n = stats.checks[k], p = total ? Math.round((n / total) * 100) : 0; return `<div class="bar" data-r="${k}"><span class="bl">${LEVELS[k][0]}</span><div class="bt"><i style="width:${p}%"></i></div><span class="bn">${n}</span></div>`; }).join("");
    const moods = stats.moods.slice(-7).map(x => `<span class="md" title="${esc(x.d)}">${MOODS.find(m => m.k === x.m)?.e || ""}</span>`).join("");
    const tiles = [["Messages checked", total], ["Kind rewrites", stats.rewrites], ["Files scanned", stats.scans], ["Stories finished", stats.stories], ["Calm sessions", stats.breaths + stats.grounding], ["Cards made", stats.cards]];
    return `${pageHead("My Journey", "Your kindness, in numbers.", "Everything here is stored only in this browser. It's your progress, and nobody else can see it.")}
    <section class="panel lvl-card"><div class="lv-badge">${icon("trophy", 26)}</div><div class="lv-body"><small>Your level</small><b>${lv.name}</b><div class="lv-bar" aria-label="Progress to next level"><i style="width:${pct}%"></i></div><span class="muted small">${stats.points} kindness points${lv.next ? ` · ${lv.next - stats.points} to ${lv.nextName}` : " · top level reached"}</span></div>
      <div class="lv-streak"><b>${streak()}</b><span>day streak</span><div class="week">${weekStrip().map(d => `<i class="${d.on ? "on" : ""}" title="${d.l}"></i>`).join("")}</div></div></section>
    <div class="jtiles">${tiles.map(([l, n]) => `<div class="jt"><b>${n}</b><span>${l}</span></div>`).join("")}</div>
    <div class="grid2" style="margin-top:14px">
      <section class="panel"><h3 class="ct">What you've checked</h3>${total ? bars : `<p class="muted">Nothing yet. <a href="#/chat" style="color:var(--lime)">Check a message</a> or <a href="#/scan" style="color:var(--lime)">scan a screenshot</a> to see your results here.</p>`}</section>
      <section class="panel"><h3 class="ct">Recent moods</h3>${moods ? `<div class="mdrow">${moods}</div>` : `<p class="muted">Check in on the <a href="#/calm" style="color:var(--lime)">Calm Corner</a> to track how you feel.</p>`}</section>
    </div>
    <h3 class="ct" style="margin:28px 0 12px">Badges · ${stats.badges.length} of ${BADGES.length}</h3>
    <div class="badges">${BADGES.map(b => { const on = stats.badges.includes(b.id); return `<div class="bd ${on ? "on" : ""}"><span class="bi">${icon(b.icon, 20)}</span><b>${b.name}</b><span>${b.desc}</span></div>`; }).join("")}</div>
    <h3 class="ct" style="margin:28px 0 12px">Your data</h3>
    <section class="panel stack"><p class="muted">Saved chats: <strong>${chatsDB.list.length}</strong>. Saving is <strong>${settings.save ? "on" : "off"}</strong> (change it with the switch in the sidebar).</p>
      <div class="row"><button class="btn sm" id="jExport" type="button">${icon("download", 14)} Download my chats</button><button class="btn sm danger" id="jDelChats" type="button">${icon("trash", 14)} Delete all chats</button><button class="btn sm danger" id="jReset" type="button">Reset my progress</button></div>
      ${confirmRow("chats", "Delete all saved chats? This can't be undone.", "Yes, delete")}${confirmRow("progress", "Reset points, badges and stats? This can't be undone.", "Yes, reset")}</section>`;
  },
  mount() {
    $("#jExport").onclick = () => {
      if (!chatsDB.list.length) return flash("No saved chats to download yet.");
      downloadBlob("kindguard-chats.json", new Blob([JSON.stringify(chatsDB.list, null, 2)], { type: "application/json" }));
    };
    $("#jDelChats").onclick = () => { state.confirm = "chats"; route(); };
    $("#jReset").onclick = () => { state.confirm = "progress"; route(); };
    $$("[data-no]").forEach(b => b.onclick = () => { state.confirm = null; route(); });
    $$("[data-yes]").forEach(b => b.onclick = () => {
      if (b.dataset.yes === "chats") { chatsDB = { list: [], active: null }; store.set(K.chats, chatsDB); if (!state.chat.busy) resetChat(); flash("All saved chats deleted."); }
      else { Object.assign(stats, defStats()); saveStats(); flash("Progress reset."); }
      state.confirm = null; route();
    });
  },
};

/* ===================== MOTION ENGINE ===================== */
// Sliding sidebar indicator
function moveNavInd(instant) {
  const nav = $("#nav"); if (!nav) return;
  let ind = $(".nav-ind", nav);
  if (!ind) { ind = document.createElement("i"); ind.className = "nav-ind"; ind.setAttribute("aria-hidden", "true"); nav.appendChild(ind); }
  const a = $("#nav a[aria-current=page]");
  if (!a || !a.offsetHeight) { ind.style.opacity = 0; return; }
  if (instant) ind.style.transition = "none";
  ind.style.opacity = 1; ind.style.height = a.offsetHeight - 16 + "px"; ind.style.transform = `translateY(${a.offsetTop + 8}px)`;
  if (instant) { ind.offsetHeight; ind.style.transition = ""; }
}
window.addEventListener("resize", () => moveNavInd(true));

// FLIP: measure, change the DOM, then animate every surviving child from where it was to where it is now.
// (This is what Framer Motion's `layout` prop does.)
function flip(list, change) {
  if (!list) { change(); return; }
  const first = new Map([...list.children].map(el => [el, el.getBoundingClientRect().top]));
  change();
  if (reduceMotion) return;
  [...list.children].forEach(el => {
    const f = first.get(el); if (f === undefined) return;
    const d = f - el.getBoundingClientRect().top;
    if (Math.abs(d) > 1) el.animate([{ transform: `translateY(${d}px)` }, { transform: "translateY(0)" }], { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" });
  });
}
// Exit animation, then FLIP the siblings into the gap (what AnimatePresence + layout do together)
function exitThenRemove(el, list, after) {
  const done = () => { flip(list, () => el.remove()); after?.(); };
  if (!el) return after?.();
  if (reduceMotion || !el.animate) { el.remove(); after?.(); return; }
  el.style.pointerEvents = "none";
  el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-32px) scale(.94)" }], { duration: 300, easing: "ease-in", fill: "forwards" }).finished.then(done, done);
}
function pulseEl(el, color = "197,242,75") {
  if (reduceMotion || !el?.animate) return;
  el.animate([{ boxShadow: `0 0 0 0 rgba(${color},.55)` }, { boxShadow: `0 0 0 10px rgba(${color},0)` }], { duration: 600, easing: "ease-out" });
}
function burst(el) { // confetti
  if (reduceMotion || !el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("i"); p.className = "confetti";
    const ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 140, sz = 5 + Math.random() * 5;
    p.style.cssText = `left:${cx}px;top:${cy}px;width:${sz}px;height:${sz * (i % 2 ? 1 : 0.5)}px;background:${["#c5f24b", "#eaffa6", "#8da6ff", "#5fe08a"][i % 4]}`;
    document.body.appendChild(p);
    const end = () => p.remove();
    p.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 50}px) rotate(${Math.random() * 600}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }).finished.then(end, end);
  }
}

// Landing-page effects. Returns a cleanup function.
function landingFX() {
  const offs = [], hover = !!window.matchMedia?.("(hover: hover)").matches;
  const bar = $("#scrollBar");
  if (bar) {
    const on = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(scrollY / h, 1) : 0})`; };
    window.addEventListener("scroll", on, { passive: true }); on(); offs.push(() => window.removeEventListener("scroll", on));
  }
  if (reduceMotion) return () => offs.forEach(f => f());

  // scroll-reveal with per-row stagger
  if ("IntersectionObserver" in window) {
    const els = $$(".sec h2, .sec .sub, .grid3 > *, .stats, .cta .wrap > *");
    els.forEach(e => { e.classList.add("rv"); e.style.setProperty("--rv", Math.min([...e.parentElement.children].indexOf(e) % 3 + (e.matches(".grid3 > *") ? 0 : 0), 5) * 0.1 + "s"); });
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    els.forEach(e => io.observe(e)); offs.push(() => io.disconnect());
  }
  if (!hover) return () => offs.forEach(f => f());

  // cursor-following glow inside cards
  const view = $("#view");
  const glow = e => {
    const c = e.target.closest?.(".lcard,.step,.way,.lvl"); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty("--cx", e.clientX - r.left + "px"); c.style.setProperty("--cy", e.clientY - r.top + "px");
  };
  view.addEventListener("pointermove", glow, { passive: true }); offs.push(() => view.removeEventListener("pointermove", glow));

  // 3D tilt on the demo card
  const wrap = $(".demo-wrap");
  if (wrap) {
    const mv = e => { const r = wrap.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; wrap.style.transform = `perspective(1000px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`; };
    const lv = () => (wrap.style.transform = "");
    wrap.addEventListener("pointermove", mv); wrap.addEventListener("pointerleave", lv);
    offs.push(() => { wrap.removeEventListener("pointermove", mv); wrap.removeEventListener("pointerleave", lv); });
  }
  // magnetic primary buttons
  $$(".btn.primary.lg").forEach(b => {
    const mv = e => { const r = b.getBoundingClientRect(); b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px"); b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px"); };
    const lv = () => { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); };
    b.addEventListener("pointermove", mv); b.addEventListener("pointerleave", lv);
    offs.push(() => { b.removeEventListener("pointermove", mv); b.removeEventListener("pointerleave", lv); });
  });
  return () => offs.forEach(f => f());
}

/* ===================== ACCOUNT MENU (mock; no sign-in is set up) ===================== */
const initials = () => (profile.name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2) || "G").toUpperCase();
const accountBtn = () => `<button class="acct-btn" type="button" data-acct aria-haspopup="true" aria-expanded="false" aria-label="Account menu"><span data-initials>${esc(initials())}</span></button>`;
const paintProfile = () => {
  $$("[data-initials]").forEach(e => (e.textContent = initials()));
  const n = $("#amName"); if (n) n.textContent = profile.name.trim() || "Guest student";
  $$("[data-acct]").forEach(b => b.classList.toggle("eph", !!settings.ephemeral));
  const t = $("#amEphTxt"); if (t) t.textContent = settings.ephemeral ? "On: context stays in memory only" : "Off: context is saved on this device";
};
function buildMenu() {
  const opt = (list, cur, none) => `<option value="">${none}</option>` + list.map(v => `<option${v === cur ? " selected" : ""}>${esc(v)}</option>`).join("");
  const row = (id, ic, t) => `<button class="am-row" type="button" role="menuitem" data-am="${id}" aria-expanded="false">${icon(ic, 17)}<span>${t}</span>${icon("chev", 15).replace('class="ic"', 'class="ic chev"')}</button>`;
  const m = document.createElement("div");
  m.className = "acct-menu"; m.id = "acctMenu"; m.hidden = true; m.setAttribute("role", "menu"); m.setAttribute("aria-label", "Account");
  m.innerHTML = `
    <div class="am-who"><span class="acct-btn static" data-initials>${esc(initials())}</span><div><b id="amName"></b><span>Stored on this device only</span></div></div>
    <div class="am-mode"><span>Mode</span>${modeSwitchHTML()}</div>
    ${row("profile", "user", "Edit Profile")}
    <div class="am-panel" data-ampanel="profile" hidden><label>Display name<input class="field" id="amNameIn" maxlength="30" placeholder="e.g. Aarav" autocomplete="off" value="${esc(profile.name)}"></label><span class="am-note">Only used for the initials above. It is never sent to the AI.</span></div>
    ${row("privacy", "lock", "Privacy &amp; Safety")}
    <div class="am-panel" data-ampanel="privacy" hidden>
      <ul><li>Chats and progress stay in this browser.</li><li>Uploads are analysed and never stored.</li><li>Only your grade level, learning style and energy are shared with the AI.</li><li>For anything serious, tell a trusted adult.</li></ul>
      <a class="btn sm" href="#/journey">Open data controls</a>
    </div>
    ${row("ai", "sparkles", "AI Context")}
    <div class="am-panel" data-ampanel="ai" hidden>
      <label>Grade level<select class="field" id="amGrade">${opt(GRADES, profile.grade, "Not set")}</select></label>
      <label>Learning style<select class="field" id="amStyle">${opt(STYLES, profile.style, "Not set")}</select></label>
      <label>Energy right now<select class="field" id="amEnergy">${opt(ENERGIES, profile.energy, "Not set")}</select></label>
      <span class="am-note">KindGuard uses this to pitch help at your level and keep plans realistic.</span>
    </div>
    <div class="am-eph"><div><b>Ephemeral Mode</b><span id="amEphTxt"></span></div><label class="switch"><input type="checkbox" id="amEph" role="switch" aria-label="Ephemeral Mode: don't save my context"${settings.ephemeral ? " checked" : ""}><i></i></label></div>`;
  document.body.appendChild(m);
  paintProfile(); paintMode();

  $$(".am-row", m).forEach(b => b.onclick = () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    $$(".am-row", m).forEach(x => x.setAttribute("aria-expanded", "false"));
    $$(".am-panel", m).forEach(x => (x.hidden = true));
    if (open) {
      b.setAttribute("aria-expanded", "true");
      const pnl = $(`[data-ampanel="${b.dataset.am}"]`, m); pnl.hidden = false;
      if (!reduceMotion) pnl.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease" });
    }
  });
  $("#amNameIn").oninput = e => { profile.name = e.target.value.slice(0, 30); saveProfile(); paintProfile(); };
  $("#amGrade").onchange = e => { profile.grade = e.target.value; saveProfile(); };
  $("#amStyle").onchange = e => { profile.style = e.target.value; saveProfile(); };
  $("#amEnergy").onchange = e => { profile.energy = e.target.value; saveProfile(); };
  $("#amEph").onchange = e => {
    settings.ephemeral = e.target.checked; store.set(K.set, settings);
    if (settings.ephemeral) { store.del(K.profile); store.del(K.planner); store.del(K.study); store.del(K.cards); flash("Ephemeral Mode on. Your context won't be saved."); }
    else { saveProfile(); savePlanner(); saveStudy(); saveDeck(); flash("Ephemeral Mode off. Context is saved on this device."); }
    paintProfile();
  };
  m.addEventListener("keydown", e => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { const rows = $$(".am-row", m), k = rows.indexOf(document.activeElement); if (k >= 0) { e.preventDefault(); rows[(k + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length].focus(); } } });
}
let acctOpener = null;
function openMenu(btn) {
  const m = $("#acctMenu"); if (!m) return;
  const r = btn.getBoundingClientRect();
  m.style.top = r.bottom + 10 + "px"; m.style.right = Math.max(12, innerWidth - r.right) + "px";
  m.hidden = false; acctOpener = btn; btn.setAttribute("aria-expanded", "true");
  if (!reduceMotion) $$(".am-who,.am-row,.am-eph", m).forEach((el, i) => el.animate([{ opacity: 0, transform: "translateX(10px)" }, { opacity: 1, transform: "none" }], { duration: 350, delay: 70 + i * 55, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }));
  if (!reduceMotion) m.animate([{ opacity: 0, transform: "translateY(-8px) scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" });
}
function closeMenu(returnFocus) {
  const m = $("#acctMenu"); if (!m || m.hidden) return;
  m.hidden = true; $$("[data-acct]").forEach(b => b.setAttribute("aria-expanded", "false"));
  if (returnFocus) acctOpener?.focus();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-acct]");
  if (b) { const m = $("#acctMenu"); if (m && !m.hidden && acctOpener === b) closeMenu(); else { closeMenu(); openMenu(b); } return; }
  if (!e.target.closest("#acctMenu")) closeMenu();
  else if (e.target.closest("#acctMenu a")) closeMenu();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(true); });
window.addEventListener("resize", () => closeMenu());


/* ===================== QUIZ PLANNER (AI-led: the coach asks one question at a time, then returns a JSON plan) ===================== */
const PL_GREETING = "Hi! I'm your study coach. I'll ask a few quick questions, one at a time, and build your quiz plan as we go.\n\nWhat subject or topic is your quiz on?";
const PL = { msgs: [], label: "Subject", items: [], busy: false, built: false, plan: null, gen: 0 };
const savePlanner = () => {
  if (settings.ephemeral) { store.del(K.planner); return; }
  store.set(K.planner, { msgs: PL.msgs, label: PL.label, items: PL.items, built: PL.built, plan: PL.plan });
};
(() => {
  if (settings.ephemeral) return;
  const sv = store.get(K.planner, null);
  if (sv && Array.isArray(sv.msgs) && Array.isArray(sv.items)) Object.assign(PL, { msgs: sv.msgs.slice(0, 60), label: String(sv.label || "Detail").slice(0, 24), items: sv.items.slice(0, 40), built: !!sv.built, plan: sv.plan || null });
})();
const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
const answerCount = () => PL.items.filter(i => i.kind === "answer").length;

function plBubble(role, text, kind, animate) {
  const box = $("#plMsgs"); if (!box) return null;
  const d = document.createElement("div");
  d.className = "pl-b " + (role === "me" ? "me" : "ai") + (kind === "typing" ? " typing" : "");
  if (kind === "typing") { // pulsing core instead of bouncing dots
    d.setAttribute("aria-label", "Coach is thinking");
    d.innerHTML = `<span class="core" aria-hidden="true"><i></i><i></i><b></b></span><span class="thinking">${esc(text || "Thinking")}…</span>`;
  } else if (animate && role !== "me" && !reduceMotion) { // words fade in one by one
    let k = 0;
    text.split(/(\s+)/).forEach(t => {
      if (!t) return;
      if (/^\s+$/.test(t)) d.appendChild(document.createTextNode(t));
      else { const w = document.createElement("span"); w.className = "w2"; w.style.animationDelay = Math.min(k++ * 0.035, 1.3) + "s"; w.textContent = t; d.appendChild(w); }
    });
  } else d.textContent = text;
  box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
}
function plSay(role, text) { PL.msgs.push({ role, text }); return plBubble(role, text, undefined, true); }

function itemControls(item) {
  const b = (act, ic, label) => `<button class="pl-edit" type="button" data-act="${act}" aria-label="${label} ${esc(item.label)}">${icon(ic, 15)}</button>`;
  return `<div class="pl-act">${item.kind === "session" ? b("up", "up", "Move up") + b("down", "down", "Move down") : ""}${b("edit", "edit", "Edit")}${item.kind === "session" ? b("del", "trash", "Delete") : ""}</div>`;
}
function renderItem(item, delay = 0) {
  const list = $("#plList"); if (!list) return;
  $("#plEmpty")?.setAttribute("hidden", "");
  const li = document.createElement("li");
  li.className = "pl-item" + (item.kind === "session" ? " session" : ""); li.dataset.id = item.id; li.style.setProperty("--d", delay + "s");
  li.innerHTML = `<div class="pl-ic">${icon(item.kind === "session" ? "check" : "target", 15)}</div><div class="pl-tx"><small>${esc(item.label)}</small><span>${esc(item.value)}</span></div>${itemControls(item)}`;
  list.appendChild(li); list.scrollTop = list.scrollHeight;
}
function addItem(it, delay = 0) { const item = { id: newId(), kind: "answer", ...it }; PL.items.push(item); renderItem(item, delay); return item; }
function removeItem(id) {
  PL.items = PL.items.filter(i => i.id !== id);
  const li = $(`.pl-item[data-id="${id}"]`);
  exitThenRemove(li, $("#plList"), () => { if (!PL.items.length) $("#plEmpty")?.removeAttribute("hidden"); paintComposer(); });
}
function moveItem(id, dir) {
  const sessions = PL.items.filter(i => i.kind === "session");
  const k = sessions.findIndex(i => i.id === id), a = sessions[k], o = sessions[k + dir];
  if (!a || !o) return;
  if (a.day != null && o.day != null) { // the two sessions trade days
    [a.day, o.day] = [o.day, a.day];
    a.label = `Day ${a.day} · ${a.topic}`; o.label = `Day ${o.day} · ${o.topic}`;
  }
  const ia = PL.items.indexOf(a), io = PL.items.indexOf(o);
  [PL.items[ia], PL.items[io]] = [PL.items[io], PL.items[ia]];
  const list = $("#plList"), la = $(`.pl-item[data-id="${a.id}"]`), lo = $(`.pl-item[data-id="${o.id}"]`);
  flip(list, () => {
    list.insertBefore(...(dir < 0 ? [la, lo] : [lo, la]));
    la.querySelector("small").textContent = a.label; lo.querySelector("small").textContent = o.label;
  });
  pulseEl(la); savePlanner();
}
function editItem(li) {
  const item = PL.items.find(i => i.id === li.dataset.id);
  if (!item || li.querySelector("input")) return;
  const span = li.querySelector(".pl-tx span");
  const inp = document.createElement("input");
  inp.className = "field"; inp.value = item.value; inp.maxLength = 200; inp.setAttribute("aria-label", "Edit " + item.label);
  span.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const finish = save => {
    if (done) return; done = true;
    const changed = save && inp.value.trim() && inp.value.trim() !== item.value;
    if (save && inp.value.trim()) { item.value = inp.value.trim(); savePlanner(); }
    const sp = document.createElement("span"); sp.textContent = item.value; inp.replaceWith(sp);
    if (changed) pulseEl(li);
  };
  inp.onkeydown = e => { if (e.key === "Enter") finish(true); else if (e.key === "Escape") { e.stopPropagation(); finish(false); } };
  inp.onblur = () => finish(true);
}

function setCount(txt) {
  const c = $("#plCount"); if (!c || c.textContent === txt) return;
  c.textContent = txt;
  if (!reduceMotion) c.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease" });
}
function paintComposer() {
  const inp = $("#plInput"); if (!inp) return;
  inp.disabled = $("#plSend").disabled = PL.busy || PL.built;
  inp.placeholder = PL.built ? "Plan ready. Use the buttons on each day to tweak it." : "Type your answer…";
  const q = $("#plQuick"), want = !PL.busy && !PL.built && answerCount() >= 3;
  if (want && !q.firstChild) { q.innerHTML = `<button class="btn primary sm" type="button" data-build>${icon("sparkles", 15)} Build my plan now</button>`; if (!reduceMotion) q.firstChild.animate([{ opacity: 0, transform: "translateY(8px) scale(.9)" }, { opacity: 1, transform: "none" }], { duration: 350, easing: "cubic-bezier(.2,.9,.3,1.3)" }); }
  else if (!want) q.innerHTML = "";
  setCount(PL.plan ? `${PL.plan.subject} · ${PL.plan.days} days` : `${answerCount()} answered`);
  const prog = $("#plProg"); if (prog) prog.style.width = (PL.built ? 100 : Math.min(answerCount() * 16, 90)) + "%";
  $(".pl-card")?.classList.toggle("busy", PL.busy);
  if (!PL.busy && !PL.built) inp.focus({ preventScroll: true });
}

const plHist = () => PL.msgs.map(m => ({ role: m.role === "me" ? "user" : "assistant", content: m.text }));

function showPlan(plan) {
  PL.plan = plan; PL.built = true;
  plSay("ai", "Here's your plan. Move days with the arrows, edit them with the pencil, or delete what you don't need.");
  [...plan.schedule].sort((x, y) => x.day - y.day).forEach((r, k) =>
    addItem({ kind: "session", day: r.day, topic: r.topic, label: `Day ${r.day} · ${r.topic}`, value: `${r.activity}${r.duration ? " · " + r.duration : ""}` }, Math.min(0.2 + k * 0.07, 1.5)));
  award(3, { silent: true }); saveStats(); logStudy(); PL.busy = false; savePlanner(); paintComposer();
  burst($("#plCount"));
  $(".pl-card")?.animate?.([{ boxShadow: "0 0 0 0 rgba(197,242,75,0)" }, { boxShadow: "0 0 0 3px rgba(197,242,75,.45),0 0 70px rgba(197,242,75,.25)" }, { boxShadow: "0 30px 80px rgba(0,0,0,.35)" }], { duration: 1400, easing: "ease-out" });
}
function localPlan() { // used only if Gemini can't be reached
  const subject = (PL.items.find(i => i.kind === "answer")?.value || "Your quiz").slice(0, 60);
  const steps = [["Recall the basics", "Write down everything you know, no notes"], ["Fill the gaps", "Study the tricky parts, then explain them aloud"], ["Practice quiz", "Test yourself and check misses"], ["Mixed review", "Timed mixed questions"], ["Light review", "Redo misses and rest well"]];
  return { subject, days: 5, schedule: steps.map(([topic, activity], i) => ({ day: i + 1, topic, activity, duration: "30 mins" })) };
}

async function plSend(text, { finalize = false } = {}) {
  if (PL.busy || PL.built) return;
  const g = PL.gen, label = PL.label || "Detail";
  const history = plHist();
  let mine = null, item = null;
  if (text) { mine = plSay("me", text); item = addItem({ label, value: text }); }
  PL.busy = true; paintComposer();
  const typing = plBubble("ai", finalize ? "Building your plan" : "Thinking", "typing");
  const undo = () => { if (!text) return; PL.msgs.pop(); mine?.remove(); removeItem(item.id); };
  let r;
  try {
    r = await api("/api/ai", { message: text || "Please finish my plan now.", mode: "planner", context: aiContext(), history, finalize });
  } catch (err) {
    if (g !== PL.gen) return;
    typing?.remove();
    if (finalize) { showPlan(localPlan()); plBubble("ai", "Gemini isn't available right now, so I made a simple schedule instead.", undefined, true); return; }
    undo(); if (text) { const i = $("#plInput"); if (i) i.value = text; }
    PL.busy = false; paintComposer();
    plBubble("ai", err.message || "I couldn't reach the coach. Try again.", undefined, true)?.classList.add("err"); return;
  }
  if (g !== PL.gen) return;
  typing?.remove();
  if (r.support || r.guarded) { undo(); PL.busy = false; paintComposer(); plBubble("ai", r.text, undefined, true); return; }
  if (r.plan) { showPlan(r.plan); return; }
  PL.label = r.label || "Detail";
  plSay("ai", r.text);
  PL.busy = false; savePlanner(); paintComposer();
}

PAGES.planner = {
  html: () => `
  ${pageHead("Quiz Planner", "Plan your quiz, one question at a time.", "Your study coach asks a few quick questions. Your plan builds on the right as you answer.")}
  <div class="pl-card">
    <section class="pl-chat" aria-label="Study coach chat">
      <div class="pl-head"><span class="pl-av">${icon("sparkles", 16)}</span>Study Coach<button class="btn sm" id="plReset" type="button" style="margin-left:auto">Start over</button></div>
      <div class="pl-msgs" id="plMsgs" role="log" aria-live="polite"></div>
      <div class="pl-quick" id="plQuick"></div>
      <form class="pl-in" id="plForm" autocomplete="off"><input class="field" id="plInput" maxlength="200" aria-label="Your answer"><button class="btn primary" id="plSend" type="submit" aria-label="Send">${icon("up", 16)}</button></form>
    </section>
    <section class="pl-prev" aria-label="Live quiz plan preview">
      <div class="pl-head">${icon("target", 16)}Your quiz plan<span class="pl-count" id="plCount"></span></div>
      <div class="pl-prog" aria-hidden="true"><i id="plProg"></i></div>
      <div class="pl-empty" id="plEmpty"><p>Answer the coach and your plan appears here.</p><div class="pl-skel" aria-hidden="true"><i></i><i></i><i></i></div></div>
      <ol class="pl-list" id="plList" aria-live="polite"></ol>
    </section>
  </div>
  <p class="am-note" style="margin-top:14px">${settings.ephemeral ? "Ephemeral Mode is on: this plan is not saved." : "Your plan is saved on this device only."} Your AI Context (grade, learning style, energy) is shared with the coach.</p>`,
  mount() {
    PL.msgs.forEach(m => plBubble(m.role, m.text));
    PL.items.forEach((it, k) => renderItem(it, Math.min(k * 0.08, 1.2)));
    $("#plForm").onsubmit = e => { e.preventDefault(); const v = $("#plInput").value.trim(); $("#plInput").value = ""; if (v) plSend(v.slice(0, 200)); };
    $("#plQuick").onclick = e => { if (e.target.closest("[data-build]")) plSend("", { finalize: true }); };
    $("#plList").onclick = e => {
      const btn = e.target.closest("[data-act]"); if (!btn) return;
      const li = btn.closest(".pl-item"), id = li.dataset.id, act = btn.dataset.act;
      if (act === "edit") editItem(li); else if (act === "up") moveItem(id, -1); else if (act === "down") moveItem(id, 1); else if (act === "del") { removeItem(id); savePlanner(); }
    };
    $("#plReset").onclick = () => {
      PL.gen++; Object.assign(PL, { msgs: [], label: "Subject", items: [], busy: false, built: false, plan: null }); store.del(K.planner); route();
    };
    paintComposer();
    if (!PL.msgs.length) {
      const g = PL.gen; PL.busy = true; paintComposer();
      const typing = plBubble("ai", "Waking up", "typing");
      wait(900).then(() => {
        if (g !== PL.gen) return;
        typing?.remove(); plSay("ai", PL_GREETING);
        PL.busy = false; savePlanner(); paintComposer();
      });
    }
  },
};


/* ===================== STUDENT / GENERAL MODE ===================== */
const modeSwitchHTML = () => `<div class="modesw" role="radiogroup" aria-label="Mode" data-m="${settings.mode}"><i class="modethumb" aria-hidden="true"></i>
  <button type="button" role="radio" data-mode="student" aria-checked="${isStudent()}" title="Study tools, plus an AI that knows your grade">${icon("book", 14)}Student</button>
  <button type="button" role="radio" data-mode="general" aria-checked="${!isStudent()}" title="Everyday safety only, no study tools">${icon("shield", 14)}General</button></div>`;

function renderNav(animate) {
  const nav = $("#nav"); if (!nav) return;
  const wasLive = !!$("#nav .live") && !$("#nav .live").hidden;
  const link = (n, i) => `<a href="#/${n.id}" data-id="${n.id}"${animate ? ` class="nav-in" style="--nd:${(i * 0.05).toFixed(2)}s"` : ""}>${icon(n.icon, 18)}<span>${n.label}</span>${n.badge ? `<i class="badge">${n.badge}</i>` : ""}${n.id === "chat" ? '<i class="live" hidden title="Sharing your screen"></i>' : ""}</a>`;
  nav.innerHTML = NAV.map(link).join("") + (isStudent() ? `<div class="nav-grp${animate ? " nav-in" : ""}" style="--nd:.3s">Study</div>` + STUDY_NAV.map((n, i) => link(n, i + 6)).join("") : "");
  $("#nav .live")?.toggleAttribute("hidden", !wasLive);
  const id = currentId();
  $$("#nav a").forEach(a => { if (a.dataset.id === id) a.setAttribute("aria-current", "page"); });
  moveNavInd(true);
}
function paintMode() {
  $$(".modesw").forEach(sw => { sw.dataset.m = settings.mode; $$("[data-mode]", sw).forEach(b => b.setAttribute("aria-checked", b.dataset.mode === settings.mode)); });
  const row = $('[data-am="ai"]'), pnl = $('[data-ampanel="ai"]');
  row?.toggleAttribute("hidden", !isStudent());
  if (!isStudent()) { pnl?.setAttribute("hidden", ""); row?.setAttribute("aria-expanded", "false"); }
  paintChips();
}
function setMode(m) {
  if (m === settings.mode || !["student", "general"].includes(m)) return;
  settings.mode = m; store.set(K.set, settings);
  paintMode(); renderNav(true);
  if (STUDENT_ONLY.has(currentId())) { lastRoute = null; route(); }
  flash(m === "student" ? "Student mode on: study tools unlocked." : "General mode on: everyday safety only.");
}
document.addEventListener("click", e => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });

const LOCKED_PAGE = {
  html: () => `<div class="locked"><div class="lk">${icon("lock", 26)}</div><h2>${esc(label(currentId()))} is a Student mode feature</h2><p>Switch to Student mode to use the Quiz Planner, Focus Timer and Flashcards. General mode keeps things to everyday safety.</p><button class="btn primary lg" id="lkSwitch" type="button">Switch to Student mode</button></div>`,
  mount() { $("#lkSwitch").onclick = () => setMode("student"); },
};

/* ---- study log + header chips ---- */
function studyStreak() {
  let n = 0; const d = new Date();
  if (!study.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (study.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function logStudy({ sessions = 0, minutes = 0, cards = 0 } = {}) {
  const k = dayKey(), d = study.days[k] || (study.days[k] = { sessions: 0, minutes: 0, cards: 0 });
  d.sessions += sessions; d.minutes += minutes; d.cards += cards;
  const keys = Object.keys(study.days).sort(); while (keys.length > 90) delete study.days[keys.shift()];
  saveStudy(); paintChips();
}
function paintChips() {
  const box = $("#chipbox"); if (!box) return;
  const n = studyStreak(), showTimer = isStudent() && FT.running && currentId() !== "focus";
  const h = isStudent() ? (showTimer ? `<a class="hchip run" href="#/focus" title="Focus timer running">${icon("timer", 14)}<span id="ftChipT"></span></a>` : "") + (n > 0 ? `<span class="hchip" title="Days in a row you studied">${icon("flame", 14)}${n} day${n > 1 ? "s" : ""}</span>` : "") : "";
  if (box.dataset.h !== h) { box.innerHTML = h; box.dataset.h = h; }
  const t = $("#ftChipT"); if (t) t.textContent = fmt(FT.left);
}

/* ---- Focus Timer ---- */
const fmt = sec => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
const suggestedFocus = () => ({ Low: 15, Medium: 25, High: 45 }[profile.energy] || 0);
const FT = { phase: "focus", focusMin: suggestedFocus() || 25, total: 0, left: 0, running: false, endAt: 0, label: "", touched: false };
FT.total = FT.left = FT.focusMin * 60;
let ftTimer = null;
function ftSet(phase, mins) {
  clearInterval(ftTimer); Object.assign(FT, { phase, total: mins * 60, left: mins * 60, running: false }); ftPaint();
}
function ftStart() { FT.running = true; FT.endAt = Date.now() + FT.left * 1000; clearInterval(ftTimer); ftTimer = setInterval(ftTick, 250); ftPaint(); paintChips(); }
function ftPause() { FT.left = Math.max(0, Math.ceil((FT.endAt - Date.now()) / 1000)); FT.running = false; clearInterval(ftTimer); ftPaint(); paintChips(); }
function ftTick() { const l = Math.max(0, Math.ceil((FT.endAt - Date.now()) / 1000)); if (l !== FT.left) { FT.left = l; ftPaint(); } if (l <= 0) ftDone(); }
function ftDone() {
  clearInterval(ftTimer); FT.running = false;
  if (FT.phase === "focus") {
    logStudy({ sessions: 1, minutes: Math.round(FT.total / 60) }); award(2, { silent: true }); burst($("#ftTime"));
    flash(`Focus block done${FT.label ? ": " + FT.label : ""}! Take a short break.`);
    ftSet("break", FT.focusMin >= 45 ? 10 : 5);
  } else { flash("Break's over. Ready for another block?"); ftSet("focus", FT.focusMin); }
  ftStats(); paintChips();
}
function ftStats() {
  const d = study.days[dayKey()] || { sessions: 0, minutes: 0 };
  if ($("#ftS1")) { $("#ftS1").textContent = d.sessions; $("#ftS2").textContent = d.minutes; $("#ftS3").textContent = studyStreak(); }
}
function ftPaint() {
  const card = $(".ft-card");
  if (card) {
    card.dataset.phase = FT.phase; card.classList.toggle("running", FT.running);
    $("#ftTime").textContent = fmt(FT.left); $("#ftPhase").textContent = FT.phase === "focus" ? "Focus" : "Break";
    $("#ftArc").style.strokeDashoffset = (603.2 * (1 - FT.left / FT.total)).toFixed(1);
    $("#ftToggle").innerHTML = FT.running ? "Pause" : `${icon("play", 16)} ${FT.left < FT.total ? "Resume" : "Start"}`;
    $("#ftReset").disabled = !FT.running && FT.left === FT.total;
    $("#ftSkip").hidden = FT.phase !== "break";
    $$("#ftPresets .chip").forEach(c => { c.setAttribute("aria-pressed", +c.dataset.min === FT.focusMin); c.disabled = FT.running; });
    if (FT.running && currentId() === "focus") document.title = `${fmt(FT.left)} · ${FT.phase === "focus" ? "Focus" : "Break"} · KindGuard AI`;
  }
  const t = $("#ftChipT"); if (t) t.textContent = fmt(FT.left);
}
PAGES.focus = {
  html: () => `
  ${pageHead("Focus Timer", "One focused block at a time.", "Pick a length, name your task and start. Short breaks keep your brain fresh.")}
  <div class="ft-card" data-phase="focus">
    <div class="ft-ring"><svg viewBox="0 0 220 220" aria-hidden="true"><circle class="bg" cx="110" cy="110" r="96"/><circle class="fg" id="ftArc" cx="110" cy="110" r="96"/></svg>
      <div class="ft-time" role="timer" aria-live="off"><b id="ftTime">25:00</b><span id="ftPhase">Focus</span></div></div>
    <div class="ft-side">
      <div><div class="ft-presets" id="ftPresets" role="group" aria-label="Focus length">${[15, 25, 45].map(m => `<button class="chip" type="button" data-min="${m}" aria-pressed="false">${m} min${m === suggestedFocus() ? "<small>suggested</small>" : ""}</button>`).join("")}</div>
        <p class="am-note" style="margin-top:8px">${suggestedFocus() ? `Suggested for your energy (${esc(profile.energy)}).` : "Set your energy in AI Context to get a suggestion."}</p></div>
      <input class="field" id="ftLabel" maxlength="60" placeholder="What are you working on?" aria-label="What are you working on?">
      <div class="ft-btns"><button class="btn primary lg" id="ftToggle" type="button"></button><button class="btn" id="ftReset" type="button">Reset</button><button class="btn" id="ftSkip" type="button" hidden>Skip break</button></div>
      <div class="ft-stats"><div><b id="ftS1">0</b><span>Blocks today</span></div><div><b id="ftS2">0</b><span>Minutes today</span></div><div><b id="ftS3">0</b><span>Day streak</span></div></div>
    </div>
  </div>`,
  mount() {
    $("#ftLabel").value = FT.label; $("#ftLabel").oninput = e => (FT.label = e.target.value.slice(0, 60));
    $("#ftPresets").onclick = e => { const c = e.target.closest("[data-min]"); if (c && !FT.running) { FT.touched = true; FT.focusMin = +c.dataset.min; ftSet("focus", FT.focusMin); } };
    $("#ftToggle").onclick = () => (FT.running ? ftPause() : ftStart());
    $("#ftReset").onclick = () => ftSet(FT.phase, Math.round(FT.total / 60));
    $("#ftSkip").onclick = () => ftSet("focus", FT.focusMin);
    // an idle timer follows the energy suggestion until the student picks a length themselves
    if (!FT.running && !FT.touched && FT.phase === "focus" && FT.left === FT.total && suggestedFocus() && FT.focusMin !== suggestedFocus()) { FT.focusMin = suggestedFocus(); ftSet("focus", FT.focusMin); }
    ftPaint(); ftStats(); paintChips();
  },
};

/* ---- Flashcards (AI-made decks with a 3D flip) ---- */
const FC = { view: "setup", topic: "", cards: [], queue: [], known: 0, again: 0, flipped: false, count: 8, err: "", saved: null };
const saveDeck = () => { if (settings.ephemeral) store.del(K.cards); else if (FC.cards.length) store.set(K.cards, { topic: FC.topic, cards: FC.cards }); };
(() => { if (!settings.ephemeral) { const d = store.get(K.cards, null); if (d && Array.isArray(d.cards) && d.cards.length) FC.saved = { topic: String(d.topic || "Saved deck").slice(0, 60), cards: d.cards.slice(0, 12) }; } })();

function fcRender() {
  const root = $("#fcRoot"); if (!root) return;
  const planSubject = PL.plan?.subject;
  if (FC.view === "make") {
    root.innerHTML = `<div class="fc-make"><span class="core" aria-hidden="true"><i></i><i></i><b></b></span><span class="thinking">Writing your cards…</span></div>`;
  } else if (FC.view === "setup") {
    root.innerHTML = `<form class="fc-setup" id="fcForm" autocomplete="off">
      <label>Topic<input class="field" id="fcTopic" maxlength="60" placeholder="e.g. Photosynthesis, fractions, World War II" value="${esc(FC.topic)}"></label>
      ${planSubject ? `<div class="fc-row"><span class="am-note">From your quiz plan:</span><button class="chip" type="button" data-topic="${esc(planSubject)}">${esc(planSubject)}</button></div>` : ""}
      <div><div class="am-note" style="margin-bottom:6px">Number of cards</div><div class="fc-row" id="fcCount">${[6, 8, 10].map(n => `<button class="chip" type="button" data-n="${n}" aria-pressed="${n === FC.count}">${n}</button>`).join("")}</div></div>
      <div class="fc-row"><button class="btn primary" type="submit">${icon("sparkles", 15)} Make flashcards</button>${FC.saved ? `<button class="btn" type="button" data-resume>Resume “${esc(FC.saved.topic)}”</button>` : ""}</div>
      ${FC.err ? `<p class="am-note" style="color:var(--red)" role="alert">${esc(FC.err)}</p>` : ""}</form>`;
    $("#fcForm").onsubmit = e => { e.preventDefault(); const t = $("#fcTopic").value.trim(); if (t) fcGenerate(t); else $("#fcTopic").focus(); };
    $("#fcCount").onclick = e => { const b = e.target.closest("[data-n]"); if (b) { FC.count = +b.dataset.n; $$("#fcCount .chip").forEach(c => c.setAttribute("aria-pressed", +c.dataset.n === FC.count)); } };
    root.querySelector("[data-topic]")?.addEventListener("click", e => { $("#fcTopic").value = e.currentTarget.dataset.topic; });
    root.querySelector("[data-resume]")?.addEventListener("click", () => { FC.topic = FC.saved.topic; FC.cards = FC.saved.cards; fcStart(); });
  } else if (FC.view === "study") {
    const c = FC.cards[FC.queue[0]], total = FC.cards.length;
    root.innerHTML = `<div class="fc-stage" id="fcStage"><div class="fc-top"><div class="pl-prog" aria-hidden="true"><i style="width:${(FC.known / total) * 100}%"></i></div><span>${FC.known} / ${total} known</span></div>
      <button class="fc${FC.flipped ? " flipped" : ""}" id="fcCard" type="button" aria-label="Flip card"><div class="fc-in"><div class="fc-face front"><small>QUESTION</small><p>${esc(c.q)}</p></div><div class="fc-face back"><small>ANSWER</small><p>${esc(c.a)}</p></div></div></button>
      <p class="fc-hint">Tap the card or press Space to flip. ← Again, → Got it.</p>
      <div class="fc-actions"><button class="btn" type="button" data-fc="again">Again</button><button class="btn" type="button" data-fc="flip">Flip</button><button class="btn primary" type="button" data-fc="got">Got it</button></div></div>`;
    $("#fcCard").onclick = () => { FC.flipped = !FC.flipped; $("#fcCard").classList.toggle("flipped", FC.flipped); };
    root.onclick = e => { const b = e.target.closest("[data-fc]"); if (!b) return; if (b.dataset.fc === "flip") $("#fcCard").click(); else fcAdvance(b.dataset.fc === "got"); };
    root.onkeydown = e => { if (e.key === "ArrowRight") fcAdvance(true); else if (e.key === "ArrowLeft") fcAdvance(false); };
  } else {
    root.innerHTML = `<div class="fc-done"><h2>Deck complete!</h2><p>You knew all ${FC.cards.length} cards${FC.again ? `, after ${FC.again} retr${FC.again > 1 ? "ies" : "y"}` : " on the first try"}. Nice work.</p>
      <div class="fc-row" style="justify-content:center"><button class="btn primary" type="button" data-again>Study again</button><button class="btn" type="button" data-new>New deck</button></div></div>`;
    root.onclick = e => { if (e.target.closest("[data-again]")) fcStart(); else if (e.target.closest("[data-new]")) { FC.view = "setup"; FC.err = ""; fcRender(); } };
  }
  if (!reduceMotion && root.firstElementChild?.animate) root.firstElementChild.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "cubic-bezier(.2,.7,.2,1)" });
}
function fcStart() { Object.assign(FC, { view: "study", queue: FC.cards.map((_, i) => i), known: 0, again: 0, flipped: false }); fcRender(); $("#fcCard")?.focus({ preventScroll: true }); }
async function fcAdvance(got) {
  if (FC.view !== "study" || FC.busy) return;
  FC.busy = true;
  const idx = FC.queue.shift(); if (got) FC.known++; else { FC.again++; FC.queue.push(idx); }
  const stage = $("#fcStage");
  if (!reduceMotion && stage?.animate) {
    try { await stage.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${got ? 70 : -70}px) rotate(${got ? 5 : -5}deg)` }], { duration: 280, easing: "ease-in", fill: "forwards" }).finished; } catch { /* navigated away */ }
  }
  FC.busy = false;
  if (!FC.queue.length) {
    FC.view = "done"; logStudy({ cards: FC.cards.length }); award(2, { silent: true }); fcRender(); burst($(".fc-done h2")); return;
  }
  FC.flipped = false; fcRender(); $("#fcCard")?.focus({ preventScroll: true });
}
async function fcGenerate(topic) {
  Object.assign(FC, { view: "make", err: "", topic }); fcRender();
  try {
    const r = await api("/api/ai", { message: topic, mode: "flashcards", count: FC.count, context: aiContext() });
    if (!r.cards) throw new Error(r.text || "I couldn't make cards for that. Try another topic.");
    FC.topic = r.topic || topic; FC.cards = r.cards; saveDeck(); FC.saved = { topic: FC.topic, cards: FC.cards }; fcStart();
  } catch (e) { FC.view = "setup"; FC.err = e.message || "Couldn't make cards. Please try again."; fcRender(); }
}
PAGES.cards = {
  html: () => `${pageHead("Flashcards", "Turn any topic into a deck.", "Tell the AI what you're studying. Flip each card, mark what you know, and missed cards come back until you've got them all.")}<div id="fcRoot"></div>`,
  mount() { if (FC.view === "make" && !FC.cards.length) FC.view = "setup"; fcRender(); },
};


/* ---------- boot ---------- */
buildChrome();
(() => { // restore the last open chat after a reload
  const rec = settings.save && chatsDB.active ? chatsDB.list.find(c => c.id === chatsDB.active) : null;
  if (rec) state.chat = { id: rec.id, msgs: rec.msgs.map(m => ({ ...m, att: m.att ? { name: m.att.name, url: m.att.url, thumb: m.att.url } : null })), busy: false, attach: null };
})();
$("#newChatSide").onclick = () => newChat();
$("#recent").onclick = e => {
  const o = e.target.closest("[data-open]"), d = e.target.closest("[data-del]");
  if (o) openChat(o.dataset.open); else if (d) deleteChat(d.dataset.del);
};
$("#menu").onclick = () => document.body.classList.toggle("nav-open");
$("#scrim").onclick = () => document.body.classList.remove("nav-open");
window.addEventListener("hashchange", route);
window.addEventListener("beforeunload", () => { stopScreen(); stopBreath(true); });
paintStatus(); route(); health(); setInterval(health, 30000);
})();
