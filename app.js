// Cosa si mangia? — app della cucina di famiglia
import { firebaseConfig as CFG } from './config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const ZXING = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } },
  del(k) { try { localStorage.removeItem(k) } catch (e) { } }
};
const COLORS = ['#d8432a', '#2f6fe0', '#d39100', '#13917f'];
const MEALS = [['c', 'Colazione'], ['p', 'Pranzo'], ['s', 'Cena']];
const LUOGHI = [['frigo', 'Frigo'], ['dispensa', 'Dispensa'], ['freezer', 'Freezer']];
const LUOGO_L = { frigo: 'Frigo', dispensa: 'Dispensa', freezer: 'Freezer' };
const UNITS = ['pz', 'g', 'kg', 'ml', 'l', 'conf', 'cucchiai', 'spicchi', 'fette', 'qb'];
const STAPLES = ['sale', 'pepe', 'acqua', 'sale fino', 'sale grosso'];
const TABS = ['settimana', 'dispensa', 'ricette', 'spesa'];
const FRIGO_KW = ['latte', 'yogurt', 'formagg', 'mozzarell', 'burro', 'uova', 'uovo', 'prosciutt', 'salam', 'carne', 'pollo', 'pesce', 'panna', 'ricott', 'parmigian', 'grana', 'insalat', 'zucchin', 'affettat', 'wurstel', 'tofu', 'mascarpone', 'speck', 'pancett', 'tacchin', 'manzo', 'maiale', 'salmone', 'stracchino', 'philadelphia', 'pesto', 'lievito di birra', 'macinat', 'salsicc', 'frutta', 'verdur', 'carot', 'spinaci', 'limon', 'mortadell', 'bresaola', 'fiordilatte', 'scamorz', 'gorgonzol', 'asiago'];
const FREEZER_KW = ['surgel', 'gelato', 'bastoncini', 'ghiaccio', 'congelat', 'frozen'];
const CATS = [['carbo', 'Carboidrati'], ['verdura', 'Verdura'], ['frutta', 'Frutta'], ['proteine', 'Proteine'], ['latticini', 'Latticini'], ['condimenti', 'Condimenti'], ['dolci', 'Dolci e snack'], ['bevande', 'Bevande'], ['altro', 'Altro']];
const CAT_L = Object.fromEntries(CATS);
const CAT_S = { carbo: 'Carbo', condimenti: 'Condim.', dolci: 'Dolci' };
const CAT_KW = {
  carbo: ['pasta', 'spaghett', 'penne', 'fusill', 'rigaton', 'maccheron', 'tagliatell', 'lasagn', 'tortellin', 'raviol', 'gnocch', 'riso', 'pane', 'panin', 'farina', 'cous cous', 'couscous', 'orzo', 'farro', 'patat', 'cracker', 'grissin', 'fette biscottate', 'piadin', 'pizza', 'polenta', 'cereali', 'avena', 'fiocchi d avena', 'quinoa', 'pangrattato', 'tramezzin', 'focacc', 'spatzle', 'noodles', 'udon', 'ramen', 'tortill'],
  verdura: ['carot', 'zucchin', 'pomodor', 'insalat', 'lattuga', 'spinac', 'cipoll', 'aglio', 'peperon', 'melanzan', 'broccol', 'cavol', 'cavolfior', 'finocch', 'sedan', 'piselli', 'fagiolini', 'funghi', 'zucca', 'porr', 'radicchi', 'rucola', 'cetriol', 'asparag', 'carciof', 'verdur', 'minestrone', 'basilic', 'prezzemol', 'verza', 'bietol', 'cime di rapa', 'mais', 'olive'],
  frutta: ['mela', 'mele', 'banan', 'aranc', 'pera', 'pere', 'fragol', 'uva', 'kiwi', 'limon', 'mandarin', 'clementin', 'pesca', 'pesche', 'albicocc', 'ciliegi', 'anguri', 'melon', 'ananas', 'frutta', 'prugn', 'mirtill', 'lampon', 'avocado', 'pompelm', 'cachi', 'fichi', 'noci', 'mandorl', 'nocciol'],
  proteine: ['carne', 'pollo', 'petto di pollo', 'manzo', 'maiale', 'vitell', 'tacchin', 'salsicc', 'macinat', 'hamburger', 'bistecc', 'cotolett', 'arrost', 'prosciutt', 'salam', 'speck', 'bresaol', 'mortadell', 'wurstel', 'pancett', 'affettat', 'pesce', 'salmon', 'tonno', 'merluzz', 'orata', 'branzin', 'gamber', 'calamar', 'cozze', 'vongol', 'sgombr', 'uova', 'uovo', 'legum', 'fagiol', 'ceci', 'lenticchi', 'tofu', 'seitan', 'bastoncini di pesce'],
  latticini: ['latte', 'yogurt', 'formagg', 'mozzarell', 'burro', 'panna', 'ricott', 'parmigian', 'grana', 'stracchin', 'mascarpon', 'scamorz', 'gorgonzol', 'asiago', 'philadelphia', 'fiordilatte', 'emmental', 'pecorin', 'provol', 'feta', 'kefir', 'burrata', 'crescenza', 'fontina'],
  condimenti: ['olio', 'aceto', 'sale', 'pepe', 'zucchero', 'passata', 'pelati', 'polpa di pomodoro', 'concentrato', 'sugo', 'pesto', 'maionese', 'ketchup', 'senape', 'spezie', 'origano', 'rosmarin', 'dado', 'brodo', 'salsa', 'lievito', 'curry', 'paprika', 'cannella', 'noce moscata', 'besciamella', 'ragu', 'sugo pronto'],
  dolci: ['biscott', 'cioccolat', 'merendin', 'nutella', 'marmellat', 'confettur', 'crostat', 'torta', 'gelato', 'caramell', 'patatine', 'snack', 'wafer', 'miele', 'brioche', 'cornett', 'budino', 'pandoro', 'panettone', 'crema spalmabile'],
  bevande: ['te', 'acqua', 'succo', 'birra', 'vino', 'coca', 'aranciata', 'bibita', 'caffe', 'tisana', 'the', 'spremuta', 'latte di soia', 'bevanda', 'prosecco', 'spritz']
};
function guessCat(name) {
  const n = ' ' + norm(name); let best = 'altro', len = 0;
  for (const [c, keys] of Object.entries(CAT_KW)) for (const k of keys) if (k.length > len && n.includes(' ' + k)) { best = c; len = k.length }
  return best
}
const catOf = d => CAT_L[d.cat] ? d.cat : guessCat(d.name);

const S = { members: null, pres: {}, menu: {}, disp: [], ric: [], spesa: [], week: 0, me: LS.get('me', null), tab: TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'settimana', luogo: 'tutto', stats: {}, abit: {}, rico: {}, spese: [], sel: null, fold: LS.get('fold', []), q: '', rq: '', onlyCan: false, note: '', phase: 'start', err: '', cfg: null, fam: '', asked: false };
let F = null; // { fs, db, fam }
let FBX = null; // { app, fs, db, authMod, auth }

const members = () => S.members || [1, 2, 3, 4].map((n, i) => ({ id: 'm' + n, name: 'Persona ' + n, color: COLORS[i] }));
const ini = n => (String(n).trim()[0] || '?').toUpperCase();
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymd(new Date());
const dt = k => new Date(k + 'T12:00:00');
const dayFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'short' });
const shortFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
const numFmt = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });
const wdFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
const wdLong = new Intl.DateTimeFormat('it-IT', { weekday: 'long' });
const longFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' });
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const zero = d => typeof d.qty === 'number' && d.qty <= 0;
const IC = {
  cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  rec: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v8h14v-8"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  hist: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  rep: '<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>'
};
const round = x => Math.round(x * 100) / 100;
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const randCode = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return [...a].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('') };
function weekDays(off) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off * 7); return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x }) }
const daysTo = s => Math.round((dt(s) - dt(today())) / 864e5);
const scadTxt = s => { const d = daysTo(s); return d < 0 ? 'scaduto' : d === 0 ? 'oggi' : d === 1 ? 'domani' : `tra ${d} gg` };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const stem = w => w.length >= 4 ? w.slice(0, -1) : w;
function same(a, b) { a = norm(a); b = norm(b); if (!a || !b) return false; if (a === b) return true; const A = a.split(' ').map(stem), B = b.split(' ').map(stem); const [s, l] = A.length <= B.length ? [A, B] : [B, A]; return s.every(w => l.includes(w)) }
function guessLuogo(n) { n = norm(n); if (FREEZER_KW.some(k => n.includes(k))) return 'freezer'; if (FRIGO_KW.some(k => n.includes(k))) return 'frigo'; return 'dispensa' }
const UMAP = { g: 'g', gr: 'g', grammi: 'g', grammo: 'g', kg: 'kg', chili: 'kg', ml: 'ml', l: 'l', lt: 'l', litro: 'l', litri: 'l', pz: 'pz', pezzi: 'pz', conf: 'conf', confezione: 'conf', confezioni: 'conf', cucchiaio: 'cucchiai', cucchiai: 'cucchiai', cucchiaino: 'cucchiai', cucchiaini: 'cucchiai', spicchio: 'spicchi', spicchi: 'spicchi', fetta: 'fette', fette: 'fette' };
function parseLine(s) {
  s = String(s).trim().replace(/^[-*•]\s*/, ''); if (!s) return null; let q = null, u = 'pz', n = s;
  if (/\s*q\.?\s?b\.?$/i.test(n)) return { n: n.replace(/\s*q\.?\s?b\.?$/i, '').trim(), q: null, u: 'qb' };
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+\.?)?\s+(.+)$/) || s.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)\.?\s*()$/);
  if (m) { q = parseFloat(m[1].replace(',', '.')); const uu = UMAP[(m[2] || '').replace('.', '').toLowerCase()]; if (uu) { u = uu; n = (m[3] || '').replace(/^di\s+/i, '').trim() } else { n = ((m[2] || '') + ' ' + (m[3] || '')).trim() } }
  return n ? { n, q, u } : null
}
const lineOf = i => i.u === 'qb' ? `${i.n} q.b.` : `${i.q != null ? numFmt.format(i.q) + ' ' : ''}${i.u && i.u !== 'pz' ? i.u + ' ' : ''}${i.n}`;
function fmtQ(q, u) { if (u === 'qb') return 'q.b.'; if (q == null || q === '') return ''; let v = +q; if (u === 'g' || u === 'ml') v = v >= 50 ? Math.round(v / 5) * 5 : Math.round(v); return numFmt.format(v) + ' ' + (u || 'pz') }
const BASE = { kg: ['g', 1000], g: ['g', 1], l: ['ml', 1000], ml: ['ml', 1] };
const toBase = (q, u) => { const b = BASE[u]; return b ? [q * b[1], b[0]] : [q, u || 'pz'] };
const stepFor = u => u === 'g' || u === 'ml' ? 100 : u === 'kg' || u === 'l' ? .5 : 1;
const haveItem = n => S.disp.find(d => same(d.name, n) && !(typeof d.qty === 'number' && d.qty <= 0));
function match(r) { const ing = (r.ingr || []).filter(i => !STAPLES.includes(norm(i.n))); const miss = ing.filter(i => !haveItem(i.n)); return { tot: ing.length, ok: ing.length - miss.length, miss } }
/* Prodotti "per livello": si tiene solo il livello della confezione aperta (piena / metà / poco) e quante confezioni ci sono */
const LEVEL_KW = ['marmellat', 'confettur', 'miele', 'nutella', 'crema spalmabile', 'burro di arachidi', 'olio', 'aceto', 'sale', 'pepe', 'zucchero', 'caffe', 'te', 'the', 'tisan', 'camomill', 'infus', 'spezie', 'origano', 'rosmarin', 'paprika', 'curry', 'cannella', 'noce moscata', 'peperoncino', 'maionese', 'ketchup', 'senape', 'salsa', 'dado', 'lievito', 'cacao', 'bicarbonato', 'farina', 'pangrattato', 'sciroppo', 'cereali', 'fette biscottate', 'biscott', 'cracker', 'grissin', 'detersiv'];
function guessTrack(name) { const n = ' ' + norm(name) + ' '; const toks = norm(name).split(' '); return LEVEL_KW.some(k => k.includes(' ') ? n.includes(' ' + k) : k.length < 4 ? toks.includes(k) : toks.some(t => t.startsWith(k))) ? 'livello' : '' }
const LEVELS = [['pieno', 'Piena'], ['meta', 'Metà'], ['poco', 'Poco']];
const isLv = d => d && d.track === 'livello';
const lvBar = d => { const n = d.lvl === 'poco' ? 1 : d.lvl === 'meta' ? 2 : 3; return `<span class="lv l${n}" aria-label="${LEVELS.find(x => x[0] === (d.lvl || 'pieno'))[1]}"><i></i><i></i><i></i></span>` };
const lvText = d => { const q = typeof d.qty === 'number' ? d.qty : 1; const l = d.lvl === 'poco' ? 'quasi finita' : d.lvl === 'meta' ? 'a metà' : ''; return q > 1 ? `${numFmt.format(q)} conf${l ? ', una ' + l : ''}` : l ? cap(l) : 'Piena' };
function setLevel(d, lvl, quiet) {
  d = S.disp.find(x => x.id === d.id) || d; const q = typeof d.qty === 'number' ? d.qty : 1;
  logA(`ha segnato ${d.name}: ${lvl === 'finito' ? (q > 1 ? 'confezione finita, aperta la successiva' : 'finito') : lvl === 'poco' ? 'quasi finito' : lvl === 'meta' ? 'a metà' : 'pieno'}`);
  if (lvl === 'finito') {
    if (q > 1) { save('dispensa', d.id, { ...d, qty: round(q - 1), lvl: 'pieno' }); if (!quiet) toast(`${d.name}: aperta una nuova confezione`); return }
    save('dispensa', d.id, { ...d, qty: 0, lvl: 'pieno' }); addToSpesa([{ name: d.name, qty: null, unit: 'conf' }]); if (!quiet) toast(`${d.name} finito, messo in spesa`); return
  }
  save('dispensa', d.id, { ...d, lvl });
  if (lvl === 'poco' && q <= 1 && !S.spesa.some(x => !x.done && same(x.name, d.name))) { addToSpesa([{ name: d.name, qty: null, unit: 'conf' }]); if (!quiet) toast(`${d.name} quasi finito: aggiunto alla spesa`) }
}
// dopo aver cucinato: un tocco per dire com'è rimasto ciò che si misura "per livello"
function levelAsk(ids) {
  ids = [...new Set(ids)].filter(id => S.disp.some(d => d.id === id)); if (!ids.length) return;
  const rowL = d => `<div class="la" data-id="${d.id}"><b>${esc(d.name)}</b><div class="segc">${[...LEVELS, ['finito', 'Finita']].map(([k, l]) => `<button type="button" data-lv="${k}" class="${(d.lvl || 'pieno') === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>`;
  modal(`<h2>Com'è rimasto?</h2><p class="sub">Un tocco per ognuno, solo se è cambiato. Quando scrivi Poco o Finita lo metto in spesa.</p><div id="las">${ids.map(id => rowL(S.disp.find(d => d.id === id))).join('')}</div><div class="acts"><button class="bp" data-act="close">Fatto</button></div>`, m => {
    m.querySelector('#las').addEventListener('click', e => { const b = e.target.closest('[data-lv]'); if (!b) return; const r = b.closest('.la'); const d = S.disp.find(x => x.id === r.dataset.id); if (!d) return; setLevel(d, b.dataset.lv); const nd = S.disp.find(x => x.id === d.id); r.outerHTML = rowL(nd) })
  })
}
function ingStatus(i, f) {
  if (STAPLES.includes(norm(i.n))) return { st: 'y' }; const it = haveItem(i.n); const q = i.q == null ? null : i.q * f;
  if (!it) return { st: 'n', need: { q, u: i.u || 'pz' } };
  if (isLv(it)) return it.lvl === 'poco' && (it.qty ?? 1) <= 1 ? { st: 'p', need: { q: null, u: 'conf' }, it } : { st: 'y', it };
  if (q != null && i.u !== 'qb' && typeof it.qty === 'number') { const [a, ba] = toBase(q, i.u), [b, bb] = toBase(it.qty, it.unit); if (ba === bb && b < a) { const k = BASE[i.u] ? BASE[i.u][1] : 1; return { st: 'p', need: { q: (a - b) / k, u: i.u }, it } } }
  return { st: 'y', it }
}
const dowOf = k => (dt(k).getDay() + 6) % 7; // 0 = lunedì
const WD = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], WDL = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
function habit(mid, k, mk) { const h = (S.abit || {})[mid]; return !(h && h[dowOf(k) + mk] === false) }
function pres(date, mid) { return S.pres[date + '_' + mid] || { date, mid, c: habit(mid, date, 'c'), p: habit(mid, date, 'p'), s: habit(mid, date, 's'), imp: [] } }
const COURSES = [['', 'Portata'], ['antipasto', 'Antipasto'], ['primo', 'Primo'], ['secondo', 'Secondo'], ['contorno', 'Contorno'], ['unico', 'Piatto unico'], ['dolce', 'Dolce']];
const COURSE_L = Object.fromEntries(COURSES); const COURSE_ORDER = ['antipasto', 'primo', 'unico', 'secondo', 'contorno', 'dolce', ''];
const ricoKey = (k, mk) => dowOf(k) + mk;
function ricoItems(k, mk) { if (k < today()) return null; const t = (S.rico || {})[ricoKey(k, mk)]; return t && Array.isArray(t.items) && t.items.length ? t.items : null }
const isRico = (k, mk) => !(S.menu[k] || {})[mk] && !!ricoItems(k, mk);
function mealItems(k, mk) { const v = (S.menu[k] || {})[mk]; if (!v) return (ricoItems(k, mk) || []).map(x => ({ ...x, picks: [] })); if (Array.isArray(v.items)) return v.items; if (v.t || v.rid) return [{ id: 'x0', t: v.t || '', rid: v.rid || '' }]; return [] }
const itemName = it => { if (it.rid) { const r = S.ric.find(x => x.id === it.rid); if (r) return r.name } return it.t || '' };
function menuLabel(k, mk) { return mealItems(k, mk).map(itemName).filter(Boolean).join(', ') }
// "pane e latte" / "spätzle o gnocchi al ragù" / "primo: pasta o riso" -> piatti (sicuri o a scelta)
function parseMenuText(t) {
  const out = [];
  String(t).split(/\n|;/).map(x => x.trim()).filter(Boolean).forEach(line => {
    let course = ''; const cm = line.match(/^(antipasto|antipasti|primo|primi|secondo|secondi|contorno|contorni|piatto unico|dolce|dolci)\s*[:\-–]\s*/i);
    if (cm) { const w = cm[1].toLowerCase(); course = w.startsWith('antip') ? 'antipasto' : w.startsWith('prim') ? 'primo' : w.startsWith('second') ? 'secondo' : w.startsWith('contorn') ? 'contorno' : w.startsWith('piatto') ? 'unico' : 'dolce'; line = line.slice(cm[0].length) }
    const parts = line.split(/\s+(?:oppure|o)\s+|\s*\/\s*|\s*\|\s*/i).map(x => x.trim()).filter(Boolean);
    parts.forEach(p => out.push({ id: rid(), t: p.charAt(0).toUpperCase() + p.slice(1), rid: '', alt: parts.length > 1, course, picks: [] }))
  });
  return out
}
function linkRecipes(items) { return items.map(it => { if (it.rid || !it.t) return it; const r = S.ric.find(x => norm(x.name) === norm(it.t)); return r ? { ...it, rid: r.id } : it }) }
async function addDish(k, mk, item) {
  let cur = mealItems(k, mk);
  if (!S.menu[k] && F) { try { const g = await F.fs.getDoc(dref('menu', k)); const v = g.exists() && g.data()[mk]; if (v) cur = Array.isArray(v.items) ? v.items : (v.t || v.rid) ? [{ id: 'x0', t: v.t || '', rid: v.rid || '' }] : [] } catch (e) { } }
  setMenu(k, mk, { ...mealVal(k, mk), items: [...cur, item] })
}
function mealVal(k, mk) { const v = (S.menu[k] || {})[mk]; if (!v) { const t = ricoItems(k, mk); return t ? { items: t.map(x => ({ ...x, picks: [] })) } : {} } if (Array.isArray(v.items)) return { ...v }; return { items: mealItems(k, mk) } }
function suggestFor(text, chosen) {
  const toks = norm(text).split(' ').filter(w => w.length >= 2);
  return S.disp.filter(d => !zero(d) && !chosen.includes(d.id) && norm(d.name).split(' ').filter(w => w.length >= 2).some(w => w.length >= 4 ? toks.some(t => t.startsWith(stem(w)) || stem(t) === stem(w)) : toks.includes(w))).slice(0, 4)
}
function defQty(d, n) { const q = typeof d.qty === 'number' ? d.qty : null; const u = d.unit || 'pz'; const v = u === 'g' ? 80 * n : u === 'ml' ? 100 * n : u === 'kg' ? .08 * n : u === 'l' ? .1 * n : 1; return round(q != null ? Math.min(q, v) : v) }
function consume(d, q, u) { if (!d || typeof d.qty !== 'number' || q == null || u === 'qb') return null; const [a, ba] = toBase(q, u || d.unit), [b, bb] = toBase(d.qty, d.unit); if (ba !== bb) return null; const k = BASE[d.unit] ? BASE[d.unit][1] : 1; return round(Math.max(0, b - a) / k) }
function cookMeal(k, mk) {
  const v = mealVal(k, mk); const items = v.items || []; const n = members().filter(m => pres(k, m.id)[mk] !== false).length || 1;
  const groups = {}; items.forEach(it => { if (it.alt) { const c = it.course || ''; (groups[c] = groups[c] || []).push(it) } });
  const skipped = Object.values(groups).filter(g => !g.some(x => (x.picks || []).length)).length;
  const prev = new Map();
  const ask = [];
  const apply = (id, q, u) => { const d = S.disp.find(x => x.id === id); if (isLv(d)) { ask.push(id); return } const nq = consume(d, q, u); if (nq == null) return; if (!prev.has(id)) prev.set(id, d.qty); save('dispensa', id, { ...d, qty: nq }) };
  items.filter(it => !it.alt || (it.picks || []).length).forEach(it => {
    (it.ingr || []).forEach(g => { const d = S.disp.find(x => x.id === g.id) || haveItem(g.name); if (d) apply(d.id, g.q, g.u) });
    const r = it.rid && S.ric.find(x => x.id === it.rid);
    if (r) { const f = n / (+r.porz || 4); (r.ingr || []).forEach(i => { if (STAPLES.includes(norm(i.n))) return; const d = haveItem(i.n); if (!d) return; if (isLv(d)) { ask.push(d.id); return } if (i.q != null) apply(d.id, i.q * f, i.u) }) }
  });
  const used = [...prev].map(([id, q]) => ({ id, q }));
  setMenu(k, mk, { ...v, items, cooked: { at: Date.now(), used, by: S.me || '' } }); logA(`ha cucinato ${MEALS.find(x => x[0] === mk)[1].toLowerCase()}: ${listTxt(items.filter(it => !it.alt || (it.picks || []).length).map(itemName))}${used.length ? ` (${used.length} ingredienti scalati)` : ''}`);
  if (ask.length) levelAsk(ask);
  toast(used.length ? `Scalati ${used.length} ${used.length === 1 ? 'ingrediente' : 'ingredienti'} dalla dispensa${skipped ? '. Le alternative che nessuno ha scelto non le ho contate' : ''}` : ask.length ? 'Dimmi com\'è rimasto quello che misuri per livello' : 'Nessun ingrediente da scalare: aggiungili ai piatti con Modifica')
}
function leftoverModal(k, mk) {
  const items = (mealVal(k, mk).items || []).filter(it => !it.alt || (it.picks || []).length);
  const scad = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return ymd(d) })();
  modal(`<h2>Avanzi</h2><p class="sub">Cosa è avanzato? Lo metto in frigo con scadenza tra 3 giorni, così lo vedi tra le cose da usare presto e lo puoi rimettere nel menù.</p>
  <div id="lo">${items.map((it, i) => `<div class="la"><label class="ck"><input type="checkbox" data-i="${i}"> ${esc(itemName(it))}</label><div class="stepper sm2"><button type="button" class="ib" data-m="${i}">−</button><input type="number" min="1" value="1" data-q="${i}" aria-label="Porzioni"><button type="button" class="ib" data-p="${i}">+</button><span class="sub" style="margin:0">porzioni</span></div></div>`).join('')}</div>
  <div class="acts"><button class="bg" data-act="close">Niente</button><button class="bp" id="lok">Metti in frigo</button></div>`, m => {
    m.querySelector('#lo').addEventListener('click', e => { const b = e.target.closest('[data-m],[data-p]'); if (!b) return; const i = b.dataset.m ?? b.dataset.p; const q = m.querySelector(`[data-q="${i}"]`); q.value = Math.max(1, (parseInt(q.value) || 1) + (b.dataset.m != null ? -1 : 1)); m.querySelector(`[data-i="${i}"]`).checked = true });
    m.querySelector('#lok').onclick = () => { let c = 0; m.querySelectorAll('[data-i]').forEach(cb => { if (!cb.checked) return; const it = items[+cb.dataset.i]; const q = parseInt(m.querySelector(`[data-q="${cb.dataset.i}"]`).value) || 1; save('dispensa', null, { name: 'avanzi: ' + itemName(it).toLowerCase(), qty: q, unit: 'pz', luogo: 'frigo', cat: 'altro', scad, avanzo: true, trackSet: true }); c++ }); close(); if (c) toast(c === 1 ? 'Avanzo in frigo, da usare entro 3 giorni' : `${c} avanzi in frigo`) }
  })
}
function undoCook(k, mk) { const v = mealVal(k, mk); ((v.cooked && v.cooked.used) || []).forEach(u => { const d = S.disp.find(x => x.id === u.id); if (d) save('dispensa', d.id, { ...d, qty: u.q }) }); delete v.cooked; setMenu(k, mk, v); toast('Ingredienti rimessi in dispensa') }
function togglePick(k, mk, i) {
  if (!S.me) { whoModal(); return }
  const items = mealItems(k, mk).map(x => ({ ...x, picks: [...(x.picks || [])] })); const it = items[i]; if (!it) return;
  const j = it.picks.indexOf(S.me);
  if (j >= 0) it.picks.splice(j, 1);
  else { items.forEach(o => { if (o !== it && o.alt && (o.course || '') === (it.course || '')) { const q = o.picks.indexOf(S.me); if (q >= 0) o.picks.splice(q, 1) } }); it.picks.push(S.me) }
  setMenu(k, mk, { ...mealVal(k, mk), items })
}
const gkey = () => LS.get('gkey', '');
const eurF = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }); const eur = v => eurF.format(v || 0);

/* ---------- Firebase ---------- */
async function ensureFirebase() {
  if (FBX) return FBX;
  const [appMod, authMod, fs] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
  const app = appMod.initializeApp(S.cfg);
  let db; try { db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }) } catch (e) { db = fs.getFirestore(app) }
  const auth = authMod.getAuth(app);
  await authMod.signInAnonymously(auth);
  FBX = { app, fs, db, auth };
  return FBX
}
const col = n => F.fs.collection(F.db, 'famiglie', F.fam, n);
const dref = (n, id) => F.fs.doc(F.db, 'famiglie', F.fam, n, id);
const famRef = () => F.fs.doc(F.db, 'famiglie', F.fam);
function fbMsg(e) {
  const c = (e && e.code) || '';
  if (/operation-not-allowed|admin-restricted/.test(c)) return 'In Firebase non è attivo l\'accesso anonimo: Authentication → Metodo di accesso → Anonimo → Attiva.';
  if (/permission-denied/.test(c)) return 'Firebase ha rifiutato l\'accesso: controlla di aver pubblicato le regole del file firestore.rules.';
  if (/api-key|invalid-api-key/.test(c)) return 'La configurazione di Firebase non è valida: ricopiala dalla console.';
  if (/unauthorized-domain/.test(c)) return 'Aggiungi questo sito in Firebase → Authentication → Impostazioni → Domini autorizzati.';
  if (/network|unavailable/.test(c)) return 'Nessuna connessione: riprova quando sei online.';
  return 'Errore: ' + (e && (e.message || e.code) || e)
}
function werr(e) { console.warn(e); if (e && e.code === 'resource-exhausted') toast('Limite gratuito di Firebase raggiunto per oggi'); else { S.note = fbMsg(e); render() } }
function dberr(e) { console.warn(e); S.note = fbMsg(e); render() }

/* ---------- writes ---------- */
const KEY = { dispensa: 'disp', ricette: 'ric', spesa: 'spesa', spese: 'spese' };
function save(c, id, data) { const arr = S[KEY[c]]; id = id || rid(); const v = { ...data }; delete v.id; const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { id, ...v }; else arr.push({ id, ...v }); render(); if (F) F.fs.setDoc(dref(c, id), v).catch(werr); return id }
function del(c, id) { S[KEY[c]] = S[KEY[c]].filter(x => x.id !== id); render(); if (F) F.fs.deleteDoc(dref(c, id)).catch(werr) }
function setPres(date, mid, patch) { const k = date + '_' + mid; const v = { ...pres(date, mid), ...patch, date, mid }; S.pres[k] = v; render(); if (F) F.fs.setDoc(dref('presenze', k), v).catch(werr) }
function setMenu(k, mk, val) { const cur = { ...(S.menu[k] || {}), date: k }; if (val) cur[mk] = val; else delete cur[mk]; S.menu[k] = cur; render(); if (F) F.fs.setDoc(dref('menu', k), { date: k, [mk]: val || F.fs.deleteField() }, { mergeFields: ['date', mk] }).catch(werr) }
const meName = () => (members().find(m => m.id === S.me) || {}).name || 'Qualcuno';
const listTxt = a => a.length > 5 ? a.slice(0, 5).join(', ') + ` e altri ${a.length - 5}` : a.join(', ');
function logA(text) { if (!F || !text) return; const k = today(); F.fs.setDoc(dref('attivita', k), { date: k, e: F.fs.arrayUnion({ t: Date.now(), w: meName(), x: text }) }, { merge: true }).catch(() => { }) }
function speseModal(mo) {
  mo = mo || today().slice(0, 7); const [y, mn] = mo.split('-').map(Number); const shift = d => { const t = new Date(y, mn - 1 + d, 1); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}` };
  const L = S.spese.filter(x => x.month === mo).sort((a, b) => (b.date || '').localeCompare(a.date || '')); const tot = L.reduce((a, x) => a + (x.total || 0), 0);
  const prevTot = S.spese.filter(x => x.month === shift(-1)).reduce((a, x) => a + (x.total || 0), 0);
  const bycat = {}; let known = 0; L.forEach(x => (x.items || []).forEach(i => { bycat[i.cat || 'altro'] = (bycat[i.cat || 'altro'] || 0) + i.price; known += i.price }));
  if (tot - known > 0.5) bycat._ = tot - known;
  const rows = Object.entries(bycat).sort((a, b) => b[1] - a[1]); const max = rows.length ? rows[0][1] : 1;
  const mname = cap(new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(y, mn - 1, 1)));
  modal(`<div class="mhead"><button class="ib" data-mo="${shift(-1)}" aria-label="Mese prima">‹</button><h2>${mname}</h2><button class="ib" data-mo="${shift(1)}" aria-label="Mese dopo">›</button></div>
  <p class="bigtot">${eur(tot)}</p><p class="sub" style="text-align:center">${L.length} ${L.length === 1 ? 'scontrino' : 'scontrini'}${prevTot ? ` · il mese prima ${eur(prevTot)}` : ''}</p>
  ${rows.length ? `<h3>Per reparto</h3><div class="bars">${rows.map(([c, v]) => `<div class="br"><span>${c === '_' ? 'Non dettagliato' : CAT_L[c] || 'Altro'}</span><span class="bt"><i style="width:${Math.max(3, Math.round(v / max * 100))}%"></i></span><b>${eur(v)}</b></div>`).join('')}</div>` : ''}
  <h3>Scontrini</h3>${L.length ? `<div class="card">${L.map(x => `<div class="ri"><span class="rn"><b>${esc(x.shop || 'Spesa')}</b><small>${esc(dayFmt.format(dt(x.date)))}${(x.items || []).length ? ' · ' + x.items.length + ' prodotti' : ''}</small></span><span class="rq">${eur(x.total)}</span><button class="x" data-sdel="${x.id}" aria-label="Elimina">×</button></div>`).join('')}</div>` : '<p class="sub">Nessuno scontrino questo mese.</p>'}
  <h3>Aggiungi a mano</h3><form id="sf" class="row"><input name="t" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Importo €" required><input name="s" placeholder="Negozio" autocomplete="off"><button class="bp">Aggiungi</button></form>`, m => {
    m.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => speseModal(b.dataset.mo));
    m.querySelectorAll('[data-sdel]').forEach(b => { let armed = false; b.onclick = () => { if (!armed) { armed = true; b.textContent = '?'; return } del('spese', b.dataset.sdel); speseModal(mo) } });
    m.querySelector('#sf').onsubmit = e => { e.preventDefault(); const t = parseFloat(E(e.target, 't').value); if (!(t > 0)) return; const sh = E(e.target, 's').value.trim(); const dte = mo === today().slice(0, 7) ? today() : mo + '-01'; save('spese', null, { date: dte, month: mo, total: round(t), shop: sh, items: [], by: S.me || '' }); logA(`ha registrato una spesa di ${eur(t)}${sh ? ' da ' + sh : ''}`); speseModal(mo) }
  })
}
async function activityModal() {
  modal(`<h2>Attività recenti</h2><p class="sub">Chi ha fatto cosa negli ultimi 7 giorni.</p><div id="act"><p class="load">Carico…</p></div>`, async m => {
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return ymd(d) });
    let docs = []; try { docs = await Promise.all(days.map(k => F ? F.fs.getDoc(dref('attivita', k)).then(g => g.exists() ? g.data() : null).catch(() => null) : null)) } catch (e) { }
    const el = m.querySelector('#act'); if (!el) return;
    const tf = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });
    const html = docs.map((d, i) => d && (d.e || []).length ? `<h3>${i === 0 ? 'Oggi' : i === 1 ? 'Ieri' : esc(cap(dayFmt.format(dt(days[i]))))}</h3><ul class="actl">${[...d.e].sort((a, b) => b.t - a.t).map(e => `<li><span class="t">${tf.format(new Date(e.t))}</span><span><b>${esc(e.w)}</b> ${esc(e.x)}</span></li>`).join('')}</ul>` : '').join('');
    el.innerHTML = html || '<p class="sub">Ancora nessuna attività.</p>'
  })
}
function bumpStats(items) {
  if (!items.length) return; const upd = {};
  items.forEach(x => { const k = norm(x.name).replace(/ /g, '_'); if (!k) return; const prevN = (S.stats[k] && S.stats[k].n) || 0; S.stats[k] = { n: prevN + 1, name: x.name, unit: x.unit || 'pz', last: Date.now() }; upd[k] = { n: F ? F.fs.increment(1) : prevN + 1, name: x.name, unit: x.unit || 'pz', last: Date.now() } });
  if (F) F.fs.setDoc(dref('stats', 'acquisti'), { counts: upd }, { merge: true }).catch(werr)
}
function addToSpesa(items, quiet) {
  const nuovi = items.filter(x => !S.spesa.some(s => !s.done && same(s.name, x.name))); bumpStats(nuovi); if (!quiet && nuovi.length) logA('ha messo in spesa: ' + listTxt(nuovi.map(x => x.name)));
  items.forEach(x => {
    const u = x.unit || 'pz'; const ex = S.spesa.find(s => !s.done && same(s.name, x.name) && (s.unit || 'pz') === u);
    if (ex) { const qty = ex.qty == null || x.qty == null ? (ex.qty ?? x.qty ?? null) : round(ex.qty + x.qty); const from = [...new Set([ex.from, x.from].filter(Boolean).join(', ').split(', '))].join(', '); save('spesa', ex.id, { ...ex, qty, from }) }
    else save('spesa', null, { name: x.name, qty: x.qty ?? null, unit: u, done: false, ts: Date.now(), from: x.from || '', by: S.me || '' })
  })
}
const SHELF = [['latte fresco', 5], ['latte', 5], ['yogurt', 14], ['mozzarell', 4], ['fiordilatte', 4], ['burrata', 3], ['ricott', 5], ['stracchin', 5], ['crescenza', 5], ['mascarpon', 7], ['panna', 7], ['burro', 30], ['formagg', 14], ['parmigian', 30], ['grana', 30], ['uova', 21], ['uovo', 21], ['macinat', 2], ['pollo', 2], ['tacchin', 2], ['salsicc', 3], ['hamburger', 2], ['carne', 3], ['manzo', 3], ['maiale', 3], ['vitell', 3], ['pesce', 2], ['salmon', 2], ['prosciutto cotto', 4], ['prosciutt', 5], ['affettat', 4], ['mortadell', 4], ['bresaol', 5], ['salam', 10], ['wurstel', 10], ['insalat', 4], ['lattuga', 4], ['rucola', 3], ['spinac', 4], ['zucchin', 7], ['pomodor', 6], ['peperon', 7], ['melanzan', 6], ['carot', 14], ['funghi', 4], ['broccol', 5], ['fragol', 3], ['mirtill', 5], ['lampon', 3], ['verdur', 6], ['frutta', 7], ['pane', 3], ['avanzi', 3], ['pesto', 7], ['sugo', 5], ['gnocchi freschi', 5], ['pasta fresca', 5], ['tortellin', 7]];
function shelfDays(name, luogo) {
  if (luogo === 'freezer') return 90;
  const n = ' ' + norm(name); let best = null, len = 0; for (const [k, d] of SHELF) if (k.length > len && n.includes(' ' + k)) { best = d; len = k.length }
  if (best == null && luogo === 'frigo' && ['verdura', 'frutta'].includes(guessCat(name))) best = guessCat(name) === 'verdura' ? 6 : 7;
  if (best == null) return null;
  if (luogo === 'dispensa' && !/\bpane\b/.test(norm(name)) && guessCat(name) !== 'frutta') return null;
  return best
}
const plusDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d) };
function mergeDisp(x) {
  if (!x.scad && !S.disp.some(d => same(d.name, x.name))) { const sd = shelfDays(x.name, x.luogo || guessLuogo(x.name)); if (sd && !guessTrack(x.name)) { x = { ...x, scad: plusDays(sd), scadStima: true } } }
  const lvEx = S.disp.find(d => isLv(d) && same(d.name, x.name));
  if (lvEx) { const add = x.unit === 'conf' || x.unit === 'pz' ? (x.qty || 1) : 1; const was = zero(lvEx) ? 0 : (lvEx.qty ?? 1); save('dispensa', lvEx.id, { ...lvEx, qty: round(was + add), lvl: was ? lvEx.lvl || 'pieno' : 'pieno', scad: x.scad || lvEx.scad || '' }); return }
  if (!S.disp.some(d => same(d.name, x.name)) && guessTrack(x.name)) { save('dispensa', null, { name: x.name, qty: x.unit === 'conf' || x.unit === 'pz' ? (x.qty || 1) : 1, unit: 'conf', track: 'livello', lvl: 'pieno', luogo: x.luogo || guessLuogo(x.name), cat: CAT_L[x.cat] ? x.cat : guessCat(x.name), scad: x.scad || '' }); return }
  const u = x.unit || 'pz'; const ex = S.disp.find(d => same(d.name, x.name) && (d.unit || 'pz') === u && (!x.luogo || d.luogo === x.luogo));
  if (ex) { const qty = ex.qty == null || x.qty == null ? (x.qty ?? ex.qty ?? null) : round(Math.max(0, ex.qty) + x.qty); save('dispensa', ex.id, { ...ex, qty, scad: x.scad || ex.scad || '' }) }
  else save('dispensa', null, { name: x.name, qty: x.qty ?? null, unit: u, luogo: x.luogo || guessLuogo(x.name), cat: CAT_L[x.cat] ? x.cat : guessCat(x.name), scad: x.scad || '', scadStima: !!x.scadStima })
}

/* ---------- render ---------- */
function render() {
  const ready = S.phase === 'ready';
  const me = members().find(m => m.id === S.me);
  $('#who').hidden = !ready; document.querySelector('.gear').hidden = !ready;
  $('#who').innerHTML = me ? `<span class="av on" style="--c:${me.color};width:34px;height:34px">${esc(ini(me.name))}</span>${esc(me.name)}` : 'Chi sei?';
  $('#nav').hidden = !ready; $('#v-setup').hidden = ready;
  TABS.forEach(t => { $('#v-' + t).hidden = !ready || t !== S.tab });
  $('#note').innerHTML = S.note ? `<p class="note">${esc(S.note)}</p>` : '';
  if (!ready) return renderSetup();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === S.tab));
  const n = S.spesa.filter(x => !x.done).length; $('#bdg').hidden = !n; $('#bdg').textContent = n;
  const ex = S.disp.filter(d => d.scad && !zero(d) && daysTo(d.scad) <= 2).length; $('#bdgd').hidden = !ex; $('#bdgd').textContent = ex;
  $('#aib').hidden = !gkey();
  ({ settimana: renderSett, dispensa: renderDisp, ricette: renderRic, spesa: renderSpesa })[S.tab]()
}

function renderSetup() {
  const el = $('#v-setup'); const p = S.phase;
  if (p === 'config') {
    el.innerHTML = `<div class="setup"><h2>Prima configurazione</h2><p>I dati stanno su Firebase, gratis, così tutta la famiglia vede le stesse cose. Lo fai una volta sola, ci vogliono circa 5 minuti.</p>
    <ol><li>Apri <a href="https://console.firebase.google.com" target="_blank" rel="noopener">console.firebase.google.com</a> e crea un progetto (Google Analytics non serve).</li>
    <li><b>Build → Firestore Database → Crea database</b>, in modalità produzione, server in Europa.</li>
    <li>Nella scheda <b>Regole</b> incolla il contenuto del file <code>firestore.rules</code> del repository e premi Pubblica.</li>
    <li><b>Build → Authentication → Inizia → Metodo di accesso</b>: attiva <b>Anonimo</b>.</li>
    <li><b>Impostazioni progetto → Le tue app →</b> icona <b>&lt;/&gt;</b>: registra l'app e copia qui sotto il blocco <code>firebaseConfig</code>.</li></ol>
    <textarea id="cfgin" rows="8" placeholder="const firebaseConfig = {&#10;  apiKey: &quot;...&quot;,&#10;  authDomain: &quot;...&quot;,&#10;  projectId: &quot;...&quot;,&#10;  ...&#10;};"></textarea>
    <p class="err" id="cfgerr"></p><button class="bp wide" id="cfgok">Collega</button>
    <p class="hint">Se qualcuno ti ha mandato un link di invito, apri quello: salti questo passaggio.</p></div>`;
    $('#cfgok').onclick = () => { const c = parseCfg($('#cfgin').value); if (!c) { $('#cfgerr').textContent = 'Non riconosco la configurazione: copia tutto il blocco tra le graffe { }.'; return } LS.set('fbcfg', c); S.cfg = c; S.phase = S.fam ? 'connecting' : 'family'; if (S.fam) connect(); else render() };
  } else if (p === 'family') {
    el.innerHTML = `<div class="setup"><h2>La vostra famiglia</h2><p>Crea la famiglia da un telefono, poi dalle impostazioni manda il link di invito agli altri.</p>
    <button class="bp wide" id="mk">Crea la famiglia</button><p class="or">oppure</p>
    <label for="code"><b>Hai un codice o un link di invito?</b></label><input id="code" placeholder="Incolla qui il link o il codice" autocomplete="off"><button class="bg wide" id="join">Entra</button><p class="err" id="ferr"></p>
    <p class="hint"><a href="#" id="chcfg">Cambia la configurazione di Firebase</a></p></div>`;
    $('#mk').onclick = async e => { e.target.disabled = true; $('#ferr').textContent = 'Creo la famiglia…'; try { const X = await ensureFirebase(); const code = randCode(); await X.fs.setDoc(X.fs.doc(X.db, 'famiglie', code), { members: members(), created: Date.now() }); LS.set('fam', code); S.fam = code; S.created = true; connect() } catch (err) { console.warn(err); e.target.disabled = false; $('#ferr').textContent = fbMsg(err) } };
    $('#join').onclick = async () => { let v = $('#code').value.trim(); const m = v.match(/[?&]f=([a-z0-9]+)/i); if (m) v = m[1]; const cm = $('#code').value.match(/[?&]c=([^&\s]+)/); if (cm) { const c = decCfg(cm[1]); if (c) { LS.set('fbcfg', c); S.cfg = c } } if (!/^[a-z0-9]{12,}$/i.test(v)) { $('#ferr').textContent = 'Il codice non sembra giusto.'; return } $('#ferr').textContent = 'Controllo…'; try { const X = await ensureFirebase(); const g = await X.fs.getDoc(X.fs.doc(X.db, 'famiglie', v)); if (!g.exists()) { $('#ferr').textContent = 'Non trovo nessuna famiglia con questo codice.'; return } LS.set('fam', v); S.fam = v; connect() } catch (err) { $('#ferr').textContent = fbMsg(err) } };
    $('#chcfg').onclick = e => { e.preventDefault(); LS.del('fbcfg'); location.reload() };
  } else if (p === 'error') {
    el.innerHTML = `<div class="setup"><h2>Non riesco a collegarmi</h2><p class="err">${esc(S.err)}</p><button class="bp wide" id="retry">Riprova</button><p class="hint"><a href="#" id="chcfg">Cambia la configurazione di Firebase</a></p></div>`;
    $('#retry').onclick = () => location.reload();
    $('#chcfg').onclick = e => { e.preventDefault(); LS.del('fbcfg'); LS.del('fam'); location.reload() };
  } else el.innerHTML = '<div class="setup"><p class="load">Collegamento…</p></div>';
}
function parseCfg(t) {
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a < 0 || b < a) return null;
  let s = t.slice(a, b + 1).replace(/\/\/.*$/gm, '').replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*}/g, '}');
  try { const c = JSON.parse(s); return c.apiKey && c.projectId ? c : null } catch (e) { return null }
}
const encCfg = c => btoa(unescape(encodeURIComponent(JSON.stringify(c)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decCfg = s => { try { s = decodeURIComponent(s).replace(/-/g, '+').replace(/_/g, '/'); const c = JSON.parse(decodeURIComponent(escape(atob(s)))); return c.apiKey ? c : null } catch (e) { return null } };
const inviteLink = () => `${location.origin}${location.pathname}?f=${S.fam}${CFG && CFG.apiKey ? '' : '&c=' + encCfg(S.cfg)}`;

function menuBlock(k, mk, items, M) {
  const L = items.map((it, i) => ({ ...it, i }));
  const groups = COURSE_ORDER.map(c => [c, L.filter(x => (x.course || '') === c)]).filter(g => g[1].length);
  return `<div class="menu">${groups.map(([c, G]) => {
    const fix = G.filter(x => !x.alt), alt = G.filter(x => x.alt);
    const dish = x => `<button class="dish" ${x.rid ? `data-act="ropen" data-id="${x.rid}"` : `data-act="menu" data-d="${k}" data-meal="${mk}"`}>${esc(itemName(x))}${x.rid ? '<small>ricetta</small>' : ''}</button>${(x.ingr || []).length ? `<span class="dig">${x.ingr.map(g => esc(g.name) + (g.lv ? '' : g.q != null ? ' ' + fmtQ(g.q, g.u) : '')).join(' · ')}</span>` : ''}`;
    const chip = x => { const p = (x.picks || []).filter(id => M.some(m => m.id === id)); return `<button class="alt${p.includes(S.me) ? ' on' : ''}" data-act="pick" data-d="${k}" data-meal="${mk}" data-i="${x.i}" aria-pressed="${p.includes(S.me)}"><span>${esc(itemName(x))}</span>${p.length ? `<span class="pk">${p.map(id => { const m = M.find(z => z.id === id); return `<i style="background:${m.color}" title="${esc(m.name)}">${esc(ini(m.name))}</i>` }).join('')}</span>` : ''}</button>` };
    return `<div class="crsg">${c ? `<div class="crs">${COURSE_L[c]}</div>` : ''}${fix.map(dish).join('')}${alt.length ? `<div class="alts"><span class="altl">${fix.length ? 'Oppure, a scelta' : 'A scelta'} <small>tocca il tuo preferito</small></span>${alt.map(chip).join('')}</div>` : ''}</div>`
  }).join('')}</div>${cookBar(k, mk, items)}`
}
function cookBar(k, mk, items) {
  const v = (S.menu[k] || {})[mk] || {}; if (k > today()) return '';
  if (v.cooked) return `<div class="cook done"><span>✓ Cucinato${(v.cooked.used || []).length ? ', ingredienti scalati' : ''}</span><span><button class="lnk" data-act="leftover" data-d="${k}" data-meal="${mk}">Avanzi?</button><button class="lnk" data-act="uncook" data-d="${k}" data-meal="${mk}">Annulla</button></span></div>`;
  if (!items.some(it => (it.ingr || []).length || it.rid)) return k === today() || k < today() ? `<button class="cook" data-act="cook" data-d="${k}" data-meal="${mk}">Cucinato</button>` : '';
  return `<button class="cook" data-act="cook" data-d="${k}" data-meal="${mk}">Cucinato: scala gli ingredienti dalla dispensa</button>`
}
function renderSett() {
  const ds = weekDays(S.week), M = members(), t = today();
  if (!S.sel || !ds.some(d => ymd(d) === S.sel)) S.sel = S.week === 0 ? t : ymd(ds[0]);
  const k = S.sel, d = dt(k), tom = (() => { const x = new Date(); x.setDate(x.getDate() + 1); return ymd(x) })();
  const now = new Date(), hr = now.getHours() + now.getMinutes() / 60;
  const nextMk = k === t ? (hr < 10 ? 'c' : hr < 14.5 ? 'p' : hr < 22 ? 's' : null) : null;
  const soon = k === t ? S.disp.filter(x => x.scad && daysTo(x.scad) <= 2 && !zero(x)).sort((a, b) => a.scad.localeCompare(b.scad)).slice(0, 3) : [];
  let h = `<div class="strip"><button class="ib" data-act="wk" data-v="-1" aria-label="Settimana prima">‹</button><div class="days">${ds.map(x => {
    const kk = ymd(x); const has = ['p', 's'].some(mk => menuLabel(kk, mk)); const imp = M.some(m => (pres(kk, m.id).imp || []).length);
    return `<button class="dp${kk === k ? ' on' : ''}${kk === t ? ' td' : ''}${kk < t ? ' past' : ''}" data-act="sel" data-d="${kk}" aria-label="${esc(dayFmt.format(x))}"><span class="w">${esc(wdFmt.format(x).replace('.', ''))}</span><span class="n">${x.getDate()}</span><span class="dots">${has ? '<i></i>' : ''}${imp ? '<i class="d2"></i>' : ''}</span></button>`
  }).join('')}</div><button class="ib" data-act="wk" data-v="1" aria-label="Settimana dopo">›</button></div>`;
  h += `<div class="dhead"><h2>${k === t ? 'Oggi' : k === tom ? 'Domani' : esc(cap(wdLong.format(d)))}</h2><span>${esc(longFmt.format(d))}</span>${S.week !== 0 ? '<button class="lnk" data-act="wk0">Torna a oggi</button>' : ''}</div>`;
  if (soon.length) h += `<button class="alert" data-act="tab" data-v="dispensa"><b>Da usare presto</b>${soon.map(x => `${esc(x.name)} <small>(${scadTxt(x.scad)})</small>`).join(', ')}</button>`;
  h += MEALS.map(([mk, ml]) => {
    const home = M.filter(m => pres(k, m.id)[mk] !== false); const items = mealItems(k, mk);
    return `<section class="mc${mk === nextMk ? ' next' : ''}${k < t ? ' past' : ''}"><header><span class="mt2">${ml}</span>${mk === nextMk ? '<span class="badge">Prossimo</span>' : ''}${isRico(k, mk) ? `<span class="badge rico" title="Si ripete ogni ${WDL[dowOf(k)]}">${IC.rep}ogni ${WD[dowOf(k)].toLowerCase()}</span>` : ''}<span class="cnt">${home.length ? home.length + ' a casa' : 'nessuno a casa'}</span>${items.length ? `<button class="lnk" data-act="menu" data-d="${k}" data-meal="${mk}">Modifica</button>` : ''}</header>
    ${items.length ? menuBlock(k, mk, items, M) : `<div class="mline"><button class="madd" data-act="menu" data-d="${k}" data-meal="${mk}">+ Cosa si mangia?</button>${mk === nextMk && gkey() ? '<button class="lnk" data-act="ai">Idee</button>' : ''}</div>`}
    <div class="avs">${M.map(m => { const on = pres(k, m.id)[mk] !== false; return `<button class="av${on ? ' on' : ''}" style="--c:${m.color}" data-act="tog" data-d="${k}" data-m="${m.id}" data-meal="${mk}" aria-pressed="${on}" aria-label="${esc(m.name)}: ${on ? 'a casa' : 'fuori'}"><span>${esc(ini(m.name))}</span><small>${esc(m.name)}</small></button>` }).join('')}</div></section>`
  }).join('');
  const imps = M.flatMap(m => (pres(k, m.id).imp || []).map((x, i) => ({ ...x, m, i }))).sort((a, b) => (a.ora || '99').localeCompare(b.ora || '99'));
  h += `<section class="mc"><header><span class="mt2">Impegni</span><button class="lnk" data-act="imp" data-d="${k}" style="margin-left:auto">+ Aggiungi</button></header>${imps.length ? `<ul class="imps">${imps.map(x => `<li><i style="background:${x.m.color}"></i>${x.ora ? `<span class="t">${esc(x.ora)}</span>` : ''}<span><b>${esc(x.m.name)}</b> · ${esc(x.testo)}</span><button class="x" data-act="delimp" data-d="${k}" data-m="${x.m.id}" data-i="${x.i}" aria-label="Elimina impegno">×</button></li>`).join('')}</ul>` : '<p class="sub" style="margin:2px 0 0">Nessun impegno. Chi esce a mangiare può segnarlo qui.</p>'}</section>`;
  $('#sett').innerHTML = h
}

function renderDisp() {
  const q = norm(S.q); const inL = d => S.luogo === 'tutto' || d.luogo === S.luogo;
  const all = S.disp.filter(d => inL(d) && (!q || norm(d.name).includes(q)));
  const cnt = l => S.disp.filter(d => (l === 'tutto' || d.luogo === l) && !zero(d)).length;
  $('#lgs').innerHTML = [['tutto', 'Tutto'], ...LUOGHI].map(([k, l]) => `<button class="${S.luogo === k ? 'on' : ''}" data-act="luogo" data-v="${k}">${l} <small>${cnt(k)}</small></button>`).join('');
  const by = (a, b) => String(a.name).localeCompare(b.name, 'it');
  const live = all.filter(d => !zero(d)), fin = all.filter(zero).sort(by);
  const soon = live.filter(d => d.scad && daysTo(d.scad) <= 3).sort((a, b) => a.scad.localeCompare(b.scad));
  const row = (d, showCat) => {
    const dd = d.scad ? daysTo(d.scad) : null; const bits = [isLv(d) && d.lvl && d.lvl !== 'pieno' ? lvText(d) : '', S.luogo === 'tutto' ? LUOGO_L[d.luogo] : '', showCat ? CAT_L[catOf(d)] : ''].filter(Boolean).map(esc);
    if (d.scad) bits.push(`<span class="sc${dd < 0 ? ' bad' : dd <= 3 ? ' warn' : ''}">${dd < 0 ? (d.scadStima ? 'forse scaduto' : 'scaduto') : (d.scadStima ? 'scade circa ' : 'scade ') + scadTxt(d.scad)}</span>`);
    return `<button class="ri" data-act="dedit" data-id="${d.id}"><span class="rn"><b>${esc(d.name)}</b>${bits.length ? `<small>${bits.join(' · ')}</small>` : ''}</span><span class="rq">${isLv(d) ? `${lvBar(d)}${(d.qty ?? 1) > 1 ? ' ×' + numFmt.format(d.qty) : ''}` : d.unit === 'qb' || d.qty == null ? '' : fmtQ(d.qty, d.unit)}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`
  };
  const sec = (id, title, n, body, cls = '') => { const closed = !q && S.fold.includes(id); return `<section class="grp ${cls}${closed ? ' closed' : ''}"><h3 data-act="fold" data-v="${id}">${title} <small>${n}</small>${IC.chev}</h3><div class="card">${body}</div></section>` };
  let h = '';
  const mig = S.disp.filter(d => !isLv(d) && !d.trackSet && !zero(d) && guessTrack(d.name));
  if (mig.length && !q) h += `<div class="alert mig"><b>Da contare per livello?</b> ${mig.slice(0, 4).map(d => esc(d.name)).join(', ')}${mig.length > 4 ? '…' : ''} si usano poco alla volta: invece della quantità basta segnare se sono piene, a metà o quasi finite.<span class="migb"><button class="sm" data-act="migno">No grazie</button><button class="sm on" data-act="migok">Sì, converti</button></span></div>`;
  if (!S.disp.length) h = `<div class="emptyc"><b>La dispensa è vuota</b><p>Tocca + per aggiungere: fotografa un prodotto o lo scontrino, oppure scrivi tutto in una volta.</p><button class="bp" data-act="dplus">Aggiungi</button></div>`;
  else if (!all.length) h = `<div class="emptyc">${q ? 'Nessun risultato.' : 'Qui non c\'è niente.'}</div>`;
  else {
    const soonIds = new Set(soon.map(d => d.id));
    if (soon.length) h += sec('scad', 'In scadenza', soon.length, soon.map(d => row(d, true)).join(''), 'warn');
    h += CATS.map(([k, l]) => [k, l, live.filter(d => !soonIds.has(d.id) && catOf(d) === k).sort(by)]).filter(x => x[2].length).map(([k, l, L]) => sec(k, l, L.length, L.map(d => row(d, false)).join(''))).join('');
    if (fin.length) h += sec('fin', 'Finiti', fin.length, fin.map(d => `<div class="ri fin"><button class="rn" data-act="dedit" data-id="${d.id}"><b>${esc(d.name)}</b></button><button class="sm" data-act="d2spesa" data-id="${d.id}">In spesa</button><button class="x" data-act="ddel" data-id="${d.id}" aria-label="Togli ${esc(d.name)}">×</button></div>`).join(''));
  }
  $('#dlist').innerHTML = h
}

function renderRic() {
  const q = norm(S.rq); const L = S.ric.map(r => ({ r, m: match(r) })).filter(({ r, m }) => (!q || norm(r.name).includes(q) || (r.ingr || []).some(i => norm(i.n).includes(q)) || norm((r.tags || []).join(' ')).includes(q)) && (!S.onlyCan || !m.miss.length)).sort((a, b) => (a.m.miss.length - b.m.miss.length) || String(a.r.name).localeCompare(b.r.name, 'it'));
  $('#rlist').innerHTML = L.length ? L.map(({ r, m }) => `<li class="rc"><button data-act="ropen" data-id="${r.id}"><b>${esc(r.name)}</b><span class="meta">${r.tempo ? esc(r.tempo) + ' min · ' : ''}${esc(r.porz || 4)} porzioni${(r.tags || []).length ? ' · ' + esc(r.tags.join(', ')) : ''}</span><span class="bar"><i style="width:${m.tot ? Math.round(m.ok / m.tot * 100) : 100}%"></i></span><span class="mt">${m.miss.length ? `Hai ${m.ok} ingredienti su ${m.tot}. Mancano: ${m.miss.slice(0, 4).map(i => esc(i.n)).join(', ')}${m.miss.length > 4 ? '…' : ''}` : 'Hai tutto per farla'}</span></button></li>`).join('')
    : `<li class="empty">${S.ric.length ? 'Nessuna ricetta trovata.' : 'Nessuna ricetta ancora. Scrivi le vostre preferite con "Nuova".' + (gkey() ? ' Oppure tocca "Idee" per farti proporre qualcosa con quello che avete.' : ' Con una chiave Gemini (dalle impostazioni) l\'app può anche proporvele.')}</li>`
}

const AISLE = ['verdura', 'frutta', 'carbo', 'proteine', 'latticini', 'condimenti', 'dolci', 'bevande', 'altro'];
function renderSpesa() {
  const open = S.spesa.filter(x => !x.done), done = S.spesa.filter(x => x.done);
  const row = x => `<li class="sp${x.done ? ' done' : ''}"><label><input type="checkbox" data-sp="${x.id}" ${x.done ? 'checked' : ''}><span><b>${esc(x.name)}</b> <span class="q">${fmtQ(x.qty, x.unit)}</span>${x.from ? `<small>per ${esc(x.from)}</small>` : ''}</span></label><button class="x" data-act="spdel" data-id="${x.id}" aria-label="Togli ${esc(x.name)}">×</button></li>`;
  // proposte: finiti in dispensa + cose che comprate spesso
  const inList = n => S.spesa.some(x => !x.done && same(x.name, n));
  const fin = S.disp.filter(d => zero(d) && !inList(d.name)).map(d => ({ name: d.name, unit: d.unit === 'conf' || d.unit === 'pz' ? d.unit : 'pz', why: 'finito' }));
  const freq = Object.values(S.stats || {}).filter(v => v && v.n >= 2 && v.name && !inList(v.name) && !fin.some(f => same(f.name, v.name)) && !S.disp.some(d => same(d.name, v.name) && !zero(d) && !(isLv(d) && d.lvl === 'poco'))).sort((a, b) => b.n - a.n).slice(0, 8).map(v => ({ name: v.name, unit: v.unit, why: 'spesso' }));
  const sugg = [...fin, ...freq].slice(0, 10);
  let h = sugg.length ? `<li class="sugg"><span>${fin.length ? 'Finiti o comprati spesso' : 'Comprati spesso'}</span><div>${sugg.map((x, i) => `<button class="igs${x.why === 'finito' ? ' fin' : ''}" data-act="spq" data-i="${i}">+ ${esc(x.name)}</button>`).join('')}</div></li>` : '';
  S._sugg = sugg;
  if (!S.spesa.length) h += '<li class="empty">La lista è vuota. Aggiungi a mano, dalle ricette con "Metti in spesa", o tocca le proposte qui sopra.</li>';
  const groups = AISLE.map(c => [c, open.filter(x => catOf(x) === c).sort((a, b) => (a.ts || 0) - (b.ts || 0))]).filter(g => g[1].length);
  h += groups.map(([c, L]) => `<li class="sph">${CAT_L[c]} <small>${L.length}</small></li>${L.map(row).join('')}`).join('');
  if (done.length) h += `<li class="sph">Nel carrello <small>${done.length}</small></li>${done.map(row).join('')}`;
  $('#slist').innerHTML = h;
  const mo = today().slice(0, 7), ms = S.spese.filter(x => x.month === mo);
  $('#spm').innerHTML = `<button class="spm" data-act="spese"><span><small>Spese di ${esc(new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date()))}</small><b>${eur(ms.reduce((a, x) => a + (x.total || 0), 0))}</b></span><span class="sub" style="margin:0">${ms.length ? ms.length + (ms.length === 1 ? ' scontrino' : ' scontrini') : 'Fotografa gli scontrini per tenerne il conto'}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
  $('#spf').innerHTML = done.length ? `<button class="bp" data-act="sp2disp">Metti in dispensa i presi (${done.length})</button><button class="bg" data-act="spclear">Togli i presi</button>` : ''
}

/* ---------- modals ---------- */
// Le finestre aggiungono un passo nella cronologia: il tasto "indietro" del telefono le chiude invece di uscire dall'app
let modalPushed = false, ignorePop = false;
function modal(html, mount) {
  const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="sx" data-act="close" aria-label="Chiudi">×</button>${html}</div>`;
  if (!modalPushed) { history.pushState({ modal: 1 }, '', location.hash || '#' + S.tab); modalPushed = true }
  m.hidden = false; m.scrollTop = 0; mount && mount(m)
}
function hideModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = '' }
function close() {
  hideModal();
  if (modalPushed) setTimeout(() => { if ($('#modal').hidden && modalPushed) { modalPushed = false; ignorePop = true; history.back() } }, 0)
}
addEventListener('popstate', () => {
  if (ignorePop) { ignorePop = false; return }
  if (modalPushed) { modalPushed = false; hideModal(); return }
  const t = location.hash.slice(1) || 'settimana'; if (TABS.includes(t) && t !== S.tab) { S.tab = t; render(); window.scrollTo(0, 0) }
});
const E = (f, n) => f.elements[n];
const acts = (label = 'Salva') => `<div class="acts"><button type="button" class="bg" data-act="close">Annulla</button><button class="bp">${label}</button></div>`;

function dispModal(d) {
  const isNew = !d; d = d || { name: '', qty: 1, unit: 'pz', luogo: S.luogo !== 'tutto' ? S.luogo : '', scad: '' };
  modal(`<h2>${isNew ? 'Aggiungi in casa' : esc(d.name)}</h2><form id="f">
  <label>Nome<input name="name" required value="${esc(d.name)}" autocomplete="off" placeholder="Es. latte, pasta, uova"></label>
  <label>Come lo conti</label><div class="segc" id="trk"><label><input type="radio" name="trk" value=""${isLv(d) ? '' : ' checked'}><span>Quantità esatta</span></label><label><input type="radio" name="trk" value="livello"${isLv(d) ? ' checked' : ''}><span>Per livello</span></label></div>
  <p class="hint" id="trkh" style="margin:-4px 2px 0">${isLv(d) ? 'Per le cose che usi poco alla volta: segni solo se è piena, a metà o quasi finita.' : 'Pezzi, grammi, litri: si scala da solo quando cucini.'}</p>
  <div id="qx"><label>Quantità</label><div class="stepper"><button type="button" class="ib" id="mn" aria-label="Meno">−</button><input name="qty" type="number" inputmode="decimal" step="any" min="0" value="${isLv(d) ? '' : d.qty ?? ''}" aria-label="Quantità"><button type="button" class="ib" id="pl" aria-label="Più">+</button><select name="unit" aria-label="Unità">${UNITS.map(u => `<option${u === (isLv(d) ? 'pz' : d.unit || 'pz') ? ' selected' : ''}>${u}</option>`).join('')}</select></div></div>
  <div id="lx"><label>Quanto ne resta</label><div class="segc lvsel">${LEVELS.map(([k, l]) => `<label><input type="radio" name="lvl" value="${k}"${(d.lvl || 'pieno') === k ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <label style="margin-top:10px">Confezioni in casa <small>compresa quella aperta</small></label><div class="stepper"><button type="button" class="ib" id="cmn" aria-label="Meno">−</button><input name="conf" type="number" inputmode="numeric" step="1" min="0" value="${isLv(d) ? d.qty ?? 1 : 1}" aria-label="Confezioni"><button type="button" class="ib" id="cpl" aria-label="Più">+</button></div></div>
  <label>Dove</label><div class="segc">${LUOGHI.map(([k, l]) => `<label><input type="radio" name="luogo" value="${k}"${k === d.luogo ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <div class="row"><label>Categoria<select name="cat"><option value="">Automatica</option>${CATS.map(([k, l]) => `<option value="${k}"${k === d.cat ? ' selected' : ''}>${l}</option>`).join('')}</select></label><label>Scadenza <small id="sst">${d.scadStima ? 'stimata' : ''}</small><input name="scad" type="date" value="${esc(d.scad || '')}"></label></div>
  <div class="acts">${isNew ? '' : '<button type="button" class="bd" id="del">Elimina</button><button type="button" class="bg" id="fin">Finito</button>'}${isNew ? '<button class="bg" value="more">Salva e un altro</button>' : ''}<button class="bp" value="ok">Salva</button></div></form>`, m => {
    const f = m.querySelector('#f'); const qi = E(f, 'qty'); let touched = !!d.luogo, trkTouched = !isNew;
    const curTrk = () => (f.querySelector('input[name=trk]:checked') || {}).value || '';
    const showTrk = () => { const lv = curTrk() === 'livello'; m.querySelector('#qx').hidden = lv; m.querySelector('#lx').hidden = !lv; m.querySelector('#trkh').textContent = lv ? 'Per le cose che usi poco alla volta: segni solo se è piena, a metà o quasi finita. Quando è quasi finita va in spesa da sola.' : 'Pezzi, grammi, litri: si scala da solo quando cucini.' };
    f.querySelectorAll('input[name=trk]').forEach(r => r.onchange = () => { trkTouched = true; showTrk() }); showTrk();
    const ci = E(f, 'conf'); m.querySelector('#cmn').onclick = () => ci.value = Math.max(0, (parseInt(ci.value) || 0) - 1); m.querySelector('#cpl').onclick = () => ci.value = (parseInt(ci.value) || 0) + 1;
    const step = v => { const q = Math.max(0, round((parseFloat(qi.value) || 0) + v * stepFor(E(f, 'unit').value))); qi.value = q };
    m.querySelector('#mn').onclick = () => step(-1); m.querySelector('#pl').onclick = () => step(1);
    f.querySelectorAll('input[name=luogo]').forEach(r => r.onchange = () => touched = true);
    let scadAuto = isNew || !!d.scadStima;
    const est = () => { if (!scadAuto) return; const lr = f.querySelector('input[name=luogo]:checked'); const sd = shelfDays(E(f, 'name').value, lr ? lr.value : guessLuogo(E(f, 'name').value)); E(f, 'scad').value = sd && curTrk() !== 'livello' ? plusDays(sd) : ''; m.querySelector('#sst').textContent = E(f, 'scad').value ? 'stimata, puoi cambiarla' : '' };
    E(f, 'scad').oninput = () => { scadAuto = false; m.querySelector('#sst').textContent = '' };
    f.querySelectorAll('input[name=luogo]').forEach(r => r.addEventListener('change', est));
    E(f, 'name').addEventListener('input', () => setTimeout(est, 0));
    E(f, 'name').oninput = () => { const nm = E(f, 'name').value; if (!trkTouched) { const t = guessTrack(nm); f.querySelectorAll('input[name=trk]').forEach(r => r.checked = r.value === t); showTrk() } if (touched) return; const g = guessLuogo(nm); f.querySelectorAll('input[name=luogo]').forEach(r => r.checked = r.value === g) };
    f.onsubmit = e => {
      e.preventDefault(); const name = E(f, 'name').value.trim(); if (!name) return; const qs = qi.value; const lr = f.querySelector('input[name=luogo]:checked'); const luogo = lr ? lr.value : guessLuogo(name);
      const lv = curTrk() === 'livello'; const base = { ...(isNew ? {} : d), name, luogo, cat: E(f, 'cat').value || guessCat(name), scad: E(f, 'scad').value || '', scadStima: scadAuto && !!E(f, 'scad').value };
      const nl = (f.querySelector('input[name=lvl]:checked') || {}).value || 'pieno'; const nc = parseInt(ci.value); const confs = isNaN(nc) ? 1 : Math.max(0, nc);
      const rec = lv ? { ...base, track: 'livello', trackSet: true, unit: 'conf', qty: confs, lvl: nl } : { ...base, track: '', trackSet: true, lvl: '', qty: qs === '' ? null : parseFloat(qs), unit: E(f, 'unit').value };
      const id = save('dispensa', isNew ? null : d.id, rec); if (isNew) logA('ha aggiunto in dispensa: ' + name);
      if (lv && nl === 'poco' && confs <= 1 && (isNew || d.lvl !== 'poco') && !S.spesa.some(x => !x.done && same(x.name, name))) { addToSpesa([{ name, qty: null, unit: 'conf' }]); toast(name + ' quasi finito: aggiunto alla spesa') }
      if (e.submitter && e.submitter.value === 'more') { toast(name + ' aggiunto'); dispModal(); const r2 = $('#f').querySelector(`input[name=luogo][value=${luogo}]`); if (r2 && lr) r2.checked = true } else close()
    };
    const x = m.querySelector('#del'); if (x) { let armed = false; x.onclick = () => { if (!armed) { armed = true; x.textContent = 'Sicuro?'; return } del('dispensa', d.id); logA('ha tolto dalla dispensa: ' + d.name); close() } }
    const fb = m.querySelector('#fin'); if (fb) fb.onclick = () => { close(); if (isLv(d)) { setLevel(d, 'finito'); return } save('dispensa', d.id, { ...d, qty: 0 }); addToSpesa([{ name: d.name, qty: null, unit: d.unit === 'qb' ? 'pz' : d.unit }]); toast(d.name + ' finito, messo in spesa') }
  })
}
function addSheet() {
  const it = (act, t, sub, ic) => `<button class="act" data-act="${act}"><span class="ai">${ic}</span><span><b>${t}</b><small>${sub}</small></span></button>`;
  modal(`<h2>Aggiungi in casa</h2><div class="acts-l">${it('photo', 'Foto di un prodotto', 'Codice a barre, frutta e verdura', IC.cam)}${it('scan', 'Scontrino', 'Tutta la spesa in una volta', IC.rec)}${it('dadd', 'Scrivi a mano', 'Un prodotto, con quantità e scadenza', IC.pen)}${it('dbulk', 'Più cose insieme', 'Una per riga, es. "2 l latte"', IC.list)}</div><div class="acts-l">${it('keepdisp', 'Manda l\'elenco a Keep', 'Tutto quello che c\'è in casa', IC.share)}</div>`)
}
function bulkModal() {
  modal(`<h2>Aggiungi più cose</h2><p class="sub">Una per riga. Se c'è già, la quantità si somma.</p><form id="f"><label>Cosa c'è<textarea name="t" rows="8" placeholder="2 l latte&#10;500 g pasta&#10;6 uova&#10;mozzarella"></textarea></label>
  <label>Dove<select name="l"><option value="">Lo decide l'app per ognuna</option>${LUOGHI.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>${acts('Aggiungi')}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const L = E(f, 't').value.split('\n').map(parseLine).filter(Boolean); const l = E(f, 'l').value; logA('ha aggiunto in dispensa: ' + listTxt(L.map(x => x.n))); L.forEach(x => mergeDisp({ name: x.n, qty: x.u === 'qb' ? null : (x.q ?? 1), unit: x.u, luogo: l })); close(); toast(`${L.length} cose aggiunte`) }
  })
}

function impModal(k) {
  const me = S.me || members()[0].id;
  modal(`<h2>Nuovo impegno</h2><p class="sub" style="text-transform:capitalize">${esc(dayFmt.format(dt(k)))}</p><form id="f">
  <label>Chi<select name="who">${members().map(m => `<option value="${m.id}"${m.id === me ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
  <div class="row"><label>Ora<input type="time" name="ora"></label><label class="grow">Cosa<input name="testo" required placeholder="Palestra, cena fuori, turno…" autocomplete="off"></label></div>
  <fieldset><legend>Mangia a casa a</legend><div class="chk">${MEALS.map(([mk, ml]) => `<label><input type="checkbox" name="${mk}"> ${ml}</label>`).join('')}</div></fieldset>${acts()}</form>`, m => {
    const f = m.querySelector('#f'); const sync = () => { const p = pres(k, E(f, 'who').value); MEALS.forEach(([mk]) => E(f, mk).checked = p[mk] !== false) }; sync(); E(f, 'who').onchange = sync;
    f.onsubmit = e => { e.preventDefault(); const mid = E(f, 'who').value, p = pres(k, mid); setPres(k, mid, { imp: [...(p.imp || []), { ora: E(f, 'ora').value, testo: E(f, 'testo').value.trim() }], c: E(f, 'c').checked, p: E(f, 'p').checked, s: E(f, 's').checked }); logA(`ha aggiunto un impegno per ${(members().find(x => x.id === mid) || {}).name} il ${dayFmt.format(dt(k))}: ${E(f, 'testo').value.trim()}`); close() }
  })
}

function ingRow(it) {
  const ch = (it.ingr || []).map(g => g.id); const sug = it.t ? suggestFor(it.t, ch) : [];
  return `<div class="ingw">${(it.ingr || []).map((g, j) => `<span class="ig" data-j="${j}"><b>${esc(g.name)}</b>${g.lv ? '<small class="upo">un po\'</small>' : `<input class="iq" type="number" step="any" min="0" inputmode="decimal" value="${g.q ?? ''}" aria-label="Quantità di ${esc(g.name)}"><small>${esc(g.u || '')}</small>`}<button type="button" class="igx" data-igdel="${j}" aria-label="Togli ${esc(g.name)}">×</button></span>`).join('')}${sug.map(d => `<button type="button" class="igs" data-igadd="${d.id}">+ ${esc(d.name)}</button>`).join('')}<button type="button" class="igs more" data-igpick>+ Ingrediente dalla dispensa</button></div><div class="igp" hidden><input class="igq" placeholder="Cerca in dispensa…" autocomplete="off"><div class="igl"></div></div>`
}
function menuModal(k, mk) {
  let items = mealItems(k, mk).map(x => ({ id: x.id && x.id !== 'x0' ? x.id : rid(), t: x.t || itemName(x), rid: x.rid || '', alt: !!x.alt, course: x.course || '', picks: [...(x.picks || [])], ingr: (x.ingr || []).map(g => ({ ...g })) }));
  const ml = MEALS.find(x => x[0] === mk)[1]; const n = members().filter(m => pres(k, m.id)[mk] !== false).length;
  const R = S.ric.map(r => ({ r, m: match(r) })).sort((a, b) => a.m.miss.length - b.m.miss.length);
  modal(`<h2>${ml}</h2><p class="sub"><span style="text-transform:capitalize">${esc(dayFmt.format(dt(k)))}</span> · ${n} a casa</p>
  <label for="mt">Scrivi il menù <small>una portata per riga, "o" tra le alternative</small></label>
  <textarea id="mt" rows="3" placeholder="Pane e latte&#10;Spätzle o gnocchi al ragù&#10;Dolce: tiramisù"></textarea>
  <button class="bg wide" id="mparse" type="button" style="margin-top:8px">Aggiungi al menù</button>
  ${S.disp.some(d => d.avanzo && !zero(d)) ? `<h3>Avanzi in frigo</h3><div class="quick">${S.disp.filter(d => d.avanzo && !zero(d)).map(d => `<button type="button" class="igs" data-lo="${d.id}">+ ${esc(d.name.replace(/^avanzi:\s*/, ''))}</button>`).join('')}</div>` : ''}
  <div id="dl"></div>
  <p><button class="lnk" id="madd" type="button">+ Aggiungi un piatto</button></p>
  ${R.length ? `<h3>Dalle vostre ricette</h3><ul class="pick">${R.map(({ r, m }) => `<li><button data-pick="${r.id}"><b>${esc(r.name)}</b><small>${m.miss.length ? 'mancano ' + m.miss.length : 'hai tutto'}</small></button></li>`).join('')}</ul>` : ''}
  <div id="lastw"></div>
  <label class="ck"><input type="checkbox" id="rico"${(S.rico || {})[ricoKey(k, mk)] ? ' checked' : ''}> Ripeti ogni ${WDL[dowOf(k)]}</label>
  <div class="acts"><button type="button" class="bd" id="clr">Svuota</button><button type="button" class="bg" data-act="close">Annulla</button><button class="bp" id="ok">Salva</button></div>`, m => {
    const dl = m.querySelector('#dl');
    (async () => { const pk = (() => { const d = dt(k); d.setDate(d.getDate() - 7); return ymd(d) })(); let v = (S.menu[pk] || {})[mk];
      if (!v && F) { try { const g = await F.fs.getDoc(dref('menu', pk)); v = g.exists() && g.data()[mk] } catch (e) { } }
      const li = v ? (Array.isArray(v.items) ? v.items : (v.t || v.rid) ? [{ t: v.t, rid: v.rid }] : []) : []; const box = m.querySelector('#lastw');
      if (li.length && box) { box.innerHTML = `<h3>Come ${WDL[dowOf(k)]} scorso</h3><button type="button" class="igs" id="lw">+ ${esc(listTxt(li.map(itemName)))}</button>`; box.querySelector('#lw').onclick = () => { items.push(...li.map(x => ({ id: rid(), t: x.t || itemName(x), rid: x.rid || '', alt: !!x.alt, course: x.course || '', picks: [], ingr: (x.ingr || []).map(g => ({ ...g })) }))); box.innerHTML = ''; draw() } } })();
    const draw = () => {
      dl.innerHTML = items.length ? `<h3>Il menù</h3>${items.map((it, i) => `<div class="dr" data-i="${i}"><input class="dt" value="${esc(it.t)}" placeholder="Nome del piatto" aria-label="Piatto"><button type="button" class="x" data-del aria-label="Togli">×</button>
        <div class="segc mini"><button type="button" data-alt="0" class="${it.alt ? '' : 'on'}">Sicuro</button><button type="button" data-alt="1" class="${it.alt ? 'on' : ''}">A scelta</button></div>
        <select class="dc" aria-label="Portata">${COURSES.map(([c, l]) => `<option value="${c}"${c === it.course ? ' selected' : ''}>${l}</option>`).join('')}</select>${it.rid ? '<small class="rl">collegato alla ricetta: gli ingredienti li prende da lì</small>' : ingRow(it)}</div>`).join('')}` : '';
      m.querySelector('#clr').hidden = !items.length
    };
    const pickList = (r, q) => { const it = items[+r.dataset.i]; const ch = (it.ingr || []).map(g => g.id); const L = S.disp.filter(d => !zero(d) && !ch.includes(d.id) && (!q || norm(d.name).includes(norm(q)))).sort((a, b) => String(a.name).localeCompare(b.name, 'it')).slice(0, 8); r.querySelector('.igl').innerHTML = L.length ? L.map(d => `<button type="button" class="igo" data-igadd="${d.id}"><span>${esc(d.name)}</span><small>${esc(LUOGO_L[d.luogo] || '')}${isLv(d) ? ' · ' + esc(lvText(d)) : d.qty != null ? ' · ' + fmtQ(d.qty, d.unit) : ''}</small></button>`).join('') : '<p class="sub" style="margin:6px 0">Niente in dispensa con questo nome.</p>' };
    dl.addEventListener('input', e => { const r = e.target.closest('.dr'); if (!r) return; const it = items[+r.dataset.i];
      if (e.target.classList.contains('iq')) { const g = it.ingr[+e.target.closest('.ig').dataset.j]; g.q = e.target.value === '' ? null : parseFloat(e.target.value); return }
      if (e.target.classList.contains('igq')) { pickList(r, e.target.value); return } });
    dl.addEventListener('input', e => { const r = e.target.closest('.dr'); if (r && e.target.classList.contains('dt')) { const it = items[+r.dataset.i]; it.t = e.target.value; if (it.rid && norm(it.t) !== norm(itemName({ rid: it.rid }))) it.rid = ''; const w = r.querySelector('.ingw'); if (w && !it.rid) { const tmp = document.createElement('div'); tmp.innerHTML = ingRow(it); w.replaceWith(tmp.firstElementChild) } } });
    dl.addEventListener('change', e => { const r = e.target.closest('.dr'); if (!r) return; if (e.target.classList.contains('dc')) items[+r.dataset.i].course = e.target.value;  });
    dl.addEventListener('click', e => { const r = e.target.closest('.dr'); if (!r) return; const i = +r.dataset.i; const it = items[i];
      const ad = e.target.closest('[data-igadd]'); if (ad) { const d = S.disp.find(x => x.id === ad.dataset.igadd); if (d) { it.ingr = [...(it.ingr || []), isLv(d) ? { id: d.id, name: d.name, q: null, u: '', lv: true } : { id: d.id, name: d.name, q: defQty(d, n || 1), u: d.unit || 'pz' }]; draw() } return }
      const gd = e.target.closest('[data-igdel]'); if (gd) { it.ingr.splice(+gd.dataset.igdel, 1); draw(); return }
      if (e.target.closest('[data-igpick]')) { const p = r.querySelector('.igp'); p.hidden = !p.hidden; if (!p.hidden) { pickList(r, ''); p.querySelector('.igq').focus() } return }
      if (e.target.closest('[data-del]')) { items.splice(i, 1); draw() } else { const b = e.target.closest('[data-alt]'); if (b) { items[i].alt = b.dataset.alt === '1'; draw() } } });
    m.querySelector('#mparse').onclick = () => { const ta = m.querySelector('#mt'); const add = parseMenuText(ta.value); if (!add.length) { ta.focus(); return } items.push(...add); ta.value = ''; draw(); const a = add.filter(x => x.alt).length; const f = add.length - a; toast(a ? `${f ? f + (f === 1 ? ' sicuro, ' : ' sicuri, ') : ''}${a} a scelta` : `${add.length} ${add.length === 1 ? 'piatto aggiunto' : 'piatti aggiunti'}`) };
    m.querySelector('#madd').onclick = () => { items.push({ id: rid(), t: '', rid: '', alt: false, course: '', picks: [] }); draw(); const ins = dl.querySelectorAll('.dt'); ins[ins.length - 1].focus() };
    m.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const r = S.ric.find(x => x.id === b.dataset.pick); if (!r) return; items.push({ id: rid(), t: r.name, rid: r.id, alt: false, course: '', picks: [] }); draw(); toast(r.name + ' aggiunta') });
    m.querySelectorAll('[data-lo]').forEach(b => b.onclick = () => { const d = S.disp.find(x => x.id === b.dataset.lo); if (!d) return; items.push({ id: rid(), t: cap(d.name.replace(/^avanzi:\s*/, '')) + ' (avanzi)', rid: '', alt: false, course: '', picks: [], ingr: [{ id: d.id, name: d.name, q: Math.min(d.qty || 1, Math.max(1, n || 1)), u: 'pz' }] }); b.remove(); draw() });
    m.querySelector('#clr').onclick = () => { items = []; draw() };
    m.querySelector('#ok').onclick = () => {
      const pend = parseMenuText(m.querySelector('#mt').value); items.push(...pend);
      const clean = linkRecipes(items.filter(x => x.t.trim()).map(x => ({ ...x, t: x.t.trim() })));
      const rc = m.querySelector('#rico').checked, rk = ricoKey(k, mk), had = !!(S.rico || {})[rk];
      if (rc && clean.length) { const tpl = { items: clean.map(({ picks, ...x }) => x) }; S.rico = { ...S.rico, [rk]: tpl }; if (F) F.fs.setDoc(famRef(), { rico: { [rk]: tpl } }, { merge: true }).catch(werr) }
      else if (!rc && had) { const r2 = { ...S.rico }; delete r2[rk]; S.rico = r2; if (F) F.fs.setDoc(famRef(), { rico: { [rk]: F.fs.deleteField() } }, { merge: true }).catch(werr) }
      setMenu(k, mk, clean.length ? { ...mealVal(k, mk), items: clean } : (rc && had ? { items: [] } : null)); close();
      if (clean.length) logA(`ha scritto il menù di ${ml.toLowerCase()} di ${dayFmt.format(dt(k))}: ${listTxt(clean.map(itemName))}${rc ? ' (ogni ' + WDL[dowOf(k)] + ')' : ''}`);
      const miss = clean.filter(x => x.rid).map(x => S.ric.find(r => r.id === x.rid)).filter(r => r && match(r).miss.length);
      if (miss.length) toast(`Per ${miss[0].name} manca qualcosa: aprila per metterlo in spesa`)
    };
    draw()
  })
}
function recipeText(r, n) {
  const f = n / (+r.porz || 4);
  return `Per ${n} persone${r.tempo ? ' · ' + r.tempo + ' min' : ''}\n\nIngredienti:\n${(r.ingr || []).map(i => `- ${i.n}${i.u === 'qb' ? ' q.b.' : i.q != null ? ' ' + fmtQ(i.q * f, i.u) : ''}`).join('\n')}${r.passi ? `\n\nPreparazione:\n${String(r.passi).split(/\n+/).map(s => s.trim()).filter(Boolean).map((s, j) => `${j + 1}. ${s.replace(/^\d+[.)]\s*/, '')}`).join('\n')}` : ''}`
}

function ricModal(id, n0) {
  const r = S.ric.find(x => x.id === id); if (!r) return; const base = +r.porz || 4; const n = Math.max(1, n0 || base); const f = n / base;
  const st = (r.ingr || []).map(i => ({ i, s: ingStatus(i, f) })); const need = st.filter(x => x.s.st !== 'y');
  const opts = [...Array(7)].map((_, j) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + j); return `<option value="${ymd(d)}">${j === 0 ? 'Oggi' : j === 1 ? 'Domani' : esc(dayFmt.format(d))}</option>` }).join('');
  modal(`<h2>${esc(r.name)}</h2><p class="sub">${r.tempo ? esc(r.tempo) + ' min · ' : ''}ricetta per ${base}</p>
  <div class="srv"><span>Per</span><button class="ib" id="dn" aria-label="Meno persone">−</button><b>${n}</b><button class="ib" id="up" aria-label="Più persone">+</button><span>persone</span></div>
  <h3>Ingredienti</h3><ul class="ing">${st.map(({ i, s }) => `<li class="${s.st}"><span class="mk">${s.st === 'y' ? '✓' : s.st === 'p' ? '!' : '✗'}</span><span>${esc(i.n)}${s.st === 'p' ? ' <em>ne hai poco</em>' : ''}</span><span class="q">${fmtQ(i.q == null ? null : i.q * f, i.u)}</span></li>`).join('') || '<li>Nessun ingrediente scritto.</li>'}</ul>
  ${need.length ? `<p style="margin:14px 0 0"><button class="bp wide" id="miss">Metti in spesa ${need.length === 1 ? 'l\'ingrediente che manca' : `i ${need.length} che mancano`}</button></p>` : '<p class="okm">Hai tutto in casa.</p>'}
  ${r.passi ? `<h3>Preparazione</h3><ol class="steps">${String(r.passi).split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => `<li>${esc(s.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol>` : ''}
  <h3>Mettila nel menu</h3><div class="row"><select id="md" aria-label="Giorno">${opts}</select><select id="mm" aria-label="Pasto">${MEALS.map(([k, l]) => `<option value="${k}"${k === 's' ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="bg" id="madd">Aggiungi</button></div>
  <div class="acts"><button class="bd" id="del">Elimina</button><button class="bg" id="kp">Manda a Keep</button><button class="bg" id="ed">Modifica</button><button class="bp" id="cook">L'ho cucinata</button></div>`, m => {
    const q = s => m.querySelector(s);
    q('#dn').onclick = () => ricModal(id, n - 1); q('#up').onclick = () => ricModal(id, n + 1);
    if (q('#miss')) q('#miss').onclick = () => { addToSpesa(need.map(x => ({ name: x.i.n, qty: x.s.need.q == null ? null : round(x.s.need.q), unit: x.s.need.u, from: r.name }))); toast(`Aggiunti ${need.length} alla spesa`); ricModal(id, n) };
    q('#madd').onclick = () => { addDish(q('#md').value, q('#mm').value, { id: rid(), t: r.name, rid: r.id, alt: false, course: '', picks: [] }); toast('Messa nel menu') };
    q('#ed').onclick = () => ricEdit(r);
    q('#kp').onclick = () => shareText(r.name, recipeText(r, n));
    q('#cook').onclick = () => { let c = 0; const ask = st.filter(({ s }) => isLv(s.it)).map(({ s }) => s.it.id); st.forEach(({ i, s }) => { const it = s.it; if (!it || isLv(it) || i.q == null || i.u === 'qb' || typeof it.qty !== 'number') return; const [a, ba] = toBase(i.q * f, i.u), [b, bb] = toBase(it.qty, it.unit); if (ba !== bb) return; const k = BASE[it.unit] ? BASE[it.unit][1] : 1; save('dispensa', it.id, { ...it, qty: round(Math.max(0, b - a) / k) }); c++ }); close(); if (ask.length) levelAsk(ask); toast(c ? `Dispensa aggiornata: ${c} ingredienti scalati` : ask.length ? 'Dimmi com\'è rimasto quello che misuri per livello' : 'Niente da scalare in dispensa') };
    let armed = false; q('#del').onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Sicuro? Tocca di nuovo'; return } del('ricette', id); close(); toast('Ricetta eliminata') }
  })
}

function ricEdit(r) {
  const isNew = !r; r = r || { name: '', porz: 4, tempo: '', ingr: [], passi: '', tags: [] };
  modal(`<h2>${isNew ? 'Nuova ricetta' : 'Modifica ricetta'}</h2><form id="f"><label>Nome<input name="nome" required value="${esc(r.name)}" autocomplete="off"></label>
  <div class="row"><label>Porzioni<input name="porz" type="number" min="1" inputmode="numeric" value="${esc(r.porz || 4)}"></label><label>Tempo (min)<input name="tempo" type="number" min="0" inputmode="numeric" value="${esc(r.tempo || '')}"></label></div>
  <label>Ingredienti <small>uno per riga, es. "200 g pasta", "2 uova", "sale q.b."</small><textarea name="ingr" rows="7">${esc((r.ingr || []).map(lineOf).join('\n'))}</textarea></label>
  <label>Preparazione <small>un passaggio per riga</small><textarea name="passi" rows="6">${esc(r.passi || '')}</textarea></label>
  <label>Etichette <small>separate da virgola</small><input name="tags" value="${esc((r.tags || []).join(', '))}" placeholder="veloce, vegetariano, dolce" autocomplete="off"></label>${acts()}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const id = save('ricette', isNew ? null : r.id, { name: E(f, 'nome').value.trim(), porz: +E(f, 'porz').value || 4, tempo: +E(f, 'tempo').value || '', ingr: E(f, 'ingr').value.split('\n').map(parseLine).filter(Boolean), passi: E(f, 'passi').value.trim(), tags: E(f, 'tags').value.split(',').map(s => s.trim()).filter(Boolean) }); ricModal(id) }
  })
}

/* ---------- Gemini (facoltativo) ---------- */
const GBASE = 'https://generativelanguage.googleapis.com/v1beta/';
async function gErr(r) { let m = ''; try { m = (await r.json()).error.message || '' } catch (e) { } const k = /api key|api_key|permission|denied/i.test(m); return new Error(r.status === 429 ? 'troppe richieste a Gemini, riprova tra un minuto' : r.status === 503 ? 'Gemini 503: modello sovraccarico' : k ? 'chiave Gemini non valida o non abilitata' : `Gemini ${r.status}${m ? ': ' + m : ''}`) }
const isCustom = () => { const m = LS.get('gmodel', ''); return m && m !== 'gemini-2.5-flash' ? m : '' };
async function modelList(fresh) {
  if (isCustom()) return [isCustom()];
  const c = LS.get('gauto2', null); if (!fresh && c && c.list && Date.now() - c.t < 3 * 864e5) return c.list;
  const r = await gfetch(`${GBASE}models?pageSize=1000&key=${encodeURIComponent(gkey())}`, null, 15000); if (!r.ok) throw await gErr(r);
  const j = await r.json(); const ok = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, ''));
  const cand = ok.map(n => { const m = n.match(/^gemini-(\d+(?:\.\d+)?)-flash(-lite)?$/); return m ? { n, v: parseFloat(m[1]), lite: !!m[2] } : null }).filter(Boolean).sort((a, b) => (b.v - a.v) || (a.lite - b.lite));
  // prima il Flash-Lite più recente (veloce e meno affollato), poi il Flash, poi gli altri dal più nuovo
  const best = cand.find(x => !x.lite), lite = cand.find(x => x.lite);
  const list = [...new Set([lite && lite.n, best && best.n, ...cand.map(x => x.n), ok.includes('gemini-flash-latest') ? 'gemini-flash-latest' : null].filter(Boolean))].slice(0, 5);
  if (!list.length) throw new Error('nessun modello Gemini disponibile per questa chiave');
  LS.set('gauto2', { list, t: Date.now() }); return list
}
async function gfetch(url, body, ms) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac.signal } : { signal: ac.signal }) }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'Gemini non risponde (tempo scaduto)' : 'nessuna connessione') }
  finally { clearTimeout(t) }
}
async function gemini(parts, onModel) {
  let list = await modelList(false), last = null, refreshed = false;
  const pref = LS.get('gok', ''); if (pref && list.includes(pref)) list = [pref, ...list.filter(m => m !== pref)];
  for (let i = 0; i < list.length; i++) {
    const model = list[i]; onModel && onModel(model);
    let r; const url = `${GBASE}models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(gkey())}`;
    const gc = { responseMimeType: 'application/json' };
    const v = parseFloat((model.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
    if (v >= 3 && !/lite/.test(model)) gc.thinkingConfig = { thinkingLevel: 'minimal' }; // risposte rapide, senza "ragionamento" lungo
    try {
      r = await gfetch(url, { contents: [{ role: 'user', parts }], generationConfig: gc }, 30000);
      if (r.status === 400 && gc.thinkingConfig) { delete gc.thinkingConfig; r = await gfetch(url, { contents: [{ role: 'user', parts }], generationConfig: gc }, 30000) }
    } catch (e) { last = e; continue }
    if (r.status === 404 && !refreshed && !isCustom()) { refreshed = true; LS.del('gauto2'); list = await modelList(true); i = -1; continue }
    if ([429, 500, 503, 504].includes(r.status)) { last = await gErr(r); continue }
    if (!r.ok) throw await gErr(r);
    const j = await r.json(); const t = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
    if (!t) { last = new Error('Gemini non ha risposto (' + (j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'vuoto') + ')'); continue }
    LS.set('gok', model);
    const a = t.indexOf('{'), b = t.lastIndexOf('}'); return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t)
  }
  throw new Error(last && /503|429|high demand|troppe/i.test(last.message) ? 'Gemini in questo momento è sovraccarico su tutti i modelli: riprova tra qualche minuto' : (last && last.message) || 'Gemini non risponde')
}

function aiModal() {
  if (!gkey()) { settingsModal(); return }
  const n = members().filter(m => pres(today(), m.id).s !== false).length || 4;
  modal(`<h2>Idee per cucinare</h2><p class="sub">Tre ricette pensate su quello che avete in dispensa e in frigo, partendo da ciò che scade prima.</p><form id="f">
  <label>Hai voglia di qualcosa? <small>facoltativo</small><input name="v" placeholder="Es. qualcosa di veloce, senza carne, un dolce" autocomplete="off"></label>
  <div class="row"><label>Persone<input name="n" type="number" min="1" inputmode="numeric" value="${n}"></label><label class="ck"><input type="checkbox" name="solo" checked> Solo con quello che c'è</label></div>
  <button class="bp wide" id="go">Proponi 3 ricette</button></form><div id="out"></div>`, m => {
    const out = m.querySelector('#out'); let busy = false;
    m.querySelector('#f').onsubmit = async e => {
      e.preventDefault(); if (busy) return; busy = true; const f = e.target; const v = E(f, 'v').value.trim(), np = +E(f, 'n').value || n, solo = E(f, 'solo').checked; const go = m.querySelector('#go'); go.disabled = true;
      const pantry = S.disp.filter(d => !(typeof d.qty === 'number' && d.qty <= 0)).map(d => `- ${d.name}${d.qty != null ? ` (${fmtQ(d.qty, d.unit)})` : ''}${d.scad ? `, scade il ${d.scad}` : ''}`).join('\n') || '(dispensa vuota)';
      const prompt = `Sei un cuoco di casa italiano. Proponi 3 ricette diverse tra loro per ${np} persone. Oggi è il ${today()}.\nIngredienti disponibili in casa:\n${pantry}\n\n${solo ? 'Usa SOLO ingredienti disponibili, più eventualmente sale, pepe, acqua e olio.' : 'Usa soprattutto gli ingredienti disponibili; puoi aggiungere pochi ingredienti da comprare.'}\nDai la precedenza agli ingredienti che scadono prima.${v ? '\nRichiesta della famiglia: ' + v : ''}\nQuando usi un ingrediente della lista, scrivine il nome come appare nella lista.\nRispondi SOLO con JSON in questa forma: {"ricette":[{"nome":"...","porzioni":${np},"tempo":30,"ingredienti":[{"n":"nome in minuscolo","q":200,"u":"g"}],"passi":["..."]}]} dove "u" è uno tra g, kg, ml, l, pz, cucchiai, spicchi, fette, qb e "q" è un numero o null.`;
      out.innerHTML = '<p class="load">Sto pensando a cosa potete cucinare…</p>';
      try {
        const res = await gemini([{ text: prompt }]); const arr = (Array.isArray(res) ? res : res && res.ricette) || [];
        const R = arr.filter(x => x && x.nome).map(x => ({ name: String(x.nome), porz: +x.porzioni || np, tempo: +x.tempo || '', ingr: (x.ingredienti || []).filter(i => i && i.n).map(i => ({ n: String(i.n), q: i.q == null || i.q === '' ? null : +i.q, u: UNITS.includes(i.u) ? i.u : (UMAP[i.u] || 'pz') })), passi: (Array.isArray(x.passi) ? x.passi : [x.passi]).filter(Boolean).join('\n'), tags: ['idea'] }));
        out.innerHTML = R.length ? R.map((r, j) => { const mi = match(r).miss; return `<div class="idea"><h4>${esc(r.name)}</h4><p>${r.tempo ? r.tempo + ' min · ' : ''}${r.ingr.map(i => esc(i.n)).join(', ')}</p><p>${mi.length ? 'Da comprare: ' + mi.map(i => esc(i.n)).join(', ') : 'Hai tutto in casa'}</p><button class="bp" data-save="${j}">Salva e apri</button></div>` }).join('') : '<p class="load">Nessuna proposta, riprova.</p>';
        out.querySelectorAll('[data-save]').forEach(b => b.onclick = () => { const id = save('ricette', null, R[+b.dataset.save]); ricModal(id, np) })
      } catch (err) { console.warn(err); out.innerHTML = `<p class="load">Non è andata: ${esc(err.message || err)}.</p>` }
      busy = false; go.disabled = false
    }
  })
}

/* ---------- Scontrini ---------- */
let tessP = null;
function loadTess() { return tessP || (tessP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = TESS; s.onload = () => res(window.Tesseract); s.onerror = () => { tessP = null; rej(new Error('non riesco a scaricare il lettore di testo')) }; document.head.appendChild(s) })) }
async function prep(file) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('foto non leggibile')); i.src = url });
  const sc = Math.min(1, 1500 / img.width, 4500 / img.height); const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
  const color = c.toDataURL('image/jpeg', .85);
  const d = x.getImageData(0, 0, w, h), p = d.data; const hist = new Uint32Array(256);
  for (let i = 0; i < p.length; i += 4) { const g = (.299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2]) | 0; p[i] = g; hist[g]++ }
  const tot = w * h; let acc = 0, lo = 0, hi = 255; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > tot * .02) { lo = v; break } } acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > tot * .02) { hi = v; break } }
  const k = 255 / Math.max(1, hi - lo); for (let i = 0; i < p.length; i += 4) { const g = Math.max(0, Math.min(255, (p[i] - lo) * k)); p[i] = p[i + 1] = p[i + 2] = g }
  x.putImageData(d, 0, 0);
  return { color, gray: c }
}
const SKIP = /totale|subtot|\biva\b|contant|resto|pagament|\bcarta\b|bancomat|sconto|\breso\b|document|commercial|p\.?\s?iva|partita|\btel\b|\bvia\b|cassa|scontrin|articol|buono|punti|arrotond|elettronic|importo|\beuro?\b|autorizz|approvat|transaz|operaz|codice|\bcod\b|grazie|arrivederci|fidelity|saldo|risparmi|corrispettiv|vendita|cliente|\bs\.?p\.?a\b|\bs\.?r\.?l\b|\bpos\b|visa|mastercard|maestro|ticket|\bnr\b|\bnum\b|resto|totali/i;
function receiptTotal(text) { const m = String(text).match(/totale(?:\s+complessivo|\s+euro|\s+eur)?[^\d\n]{0,12}(\d{1,4}[.,]\d{2})/i); return m ? parseFloat(m[1].replace(',', '.')) : null }
function parseReceipt(text) {
  const out = []; let pend = null, last = null;
  for (const raw of text.split('\n')) {
    const l = raw.replace(/[|_~"`]/g, ' ').replace(/\s+/g, ' ').trim(); if (l.length < 3) { last = null; continue }
    const w = l.match(/^(\d+[.,]\d{1,3})\s*kg\s*[xX*]/i); if (w && last) { last.q = parseFloat(w[1].replace(',', '.')); last.u = 'kg'; last = null; continue }
    const qm = l.match(/^(\d{1,2})\s*[xX*]\s*(?:€\s*)?\d+[.,]\d{2}/); if (qm) { const n = +qm[1]; if (last && !last.multSet) { last.mult = n; last.multSet = true; last = null } else pend = n; continue }
    const m = l.match(/^(.*?[a-zA-Z].*?)\s+(-?)(?:€\s*)?(\d{1,4}[.,]\d{2})\s*(?:€|eur)?\s*[A-Z%*]{0,3}\s*$/i);
    if (!m || m[2] === '-' || SKIP.test(m[1])) { last = null; continue }
    let n = m[1].toLowerCase().replace(/^\d{3,}\s*/, '').replace(/[*#]+/g, ' ').replace(/\b\d{1,2}\s?%/, '').replace(/\s+/g, ' ').trim();
    let q = 1, u = 'pz'; const sm = n.match(/(\d+(?:[.,]\d+)?)\s*(kg|gr|g|ml|cl|lt|l)\b/);
    if (sm) { q = parseFloat(sm[1].replace(',', '.')); u = { gr: 'g', lt: 'l', cl: 'ml' }[sm[2]] || sm[2]; if (sm[2] === 'cl') q *= 10; n = n.replace(sm[0], ' ') }
    else { const pk = n.match(/\b(\d{1,2})\s?x\b|\bx\s?(\d{1,2})\b/); if (pk) { q = +(pk[1] || pk[2]); n = n.replace(pk[0], ' ') } }
    n = n.replace(/[^a-zà-ù0-9' .]/gi, ' ').replace(/\s+/g, ' ').trim(); if (n.replace(/[^a-z]/g, '').length < 3) { last = null; continue }
    const it = { n, q, u, mult: pend || 1, multSet: !!pend, price: parseFloat(m[3].replace(',', '.')) }; pend = null; out.push(it); last = it
  }
  const map = new Map(); out.forEach(i => { const q = round(i.q * i.mult); const k = norm(i.n) + '|' + i.u; const e = map.get(k); if (e) { e.q = round(e.q + q); e.price = round((e.price || 0) + (i.price || 0)) } else map.set(k, { n: i.n, q, u: i.u, price: i.price }) });
  return [...map.values()]
}
const RECEIPT_PROMPT = 'Questa è la foto di uno scontrino di un supermercato italiano. Elenca solo i prodotti comprati: niente totali, sconti, IVA, pagamenti, buste. Per ogni prodotto dai: "n" = nome generico breve in italiano minuscolo, come lo chiamerebbe una famiglia in dispensa (es. "latte", "pasta", "mozzarella", "petto di pollo"); "q" = quantità totale come numero (peso o volume della confezione moltiplicato per i pezzi comprati, oppure numero di pezzi); "u" = una tra g, kg, ml, l, pz, conf; "luogo" = una tra frigo, dispensa, freezer; "cat" = una tra carbo, verdura, frutta, proteine, latticini, condimenti, dolci, bevande, altro; "prezzo" = prezzo pagato per quella riga in euro (numero). Aggiungi anche "negozio" (nome del supermercato) e "totale" (totale pagato, numero). Rispondi SOLO con JSON: {"negozio":"Conad","totale":23.5,"prodotti":[{"n":"latte","q":1,"u":"l","luogo":"frigo","cat":"latticini","prezzo":1.29}]}';

function scanModal() {
  modal(`<h2>Scontrino</h2><p class="sub">Fotografa lo scontrino intero, dritto e ben illuminato. Le cose comprate vanno in dispensa e spariscono dalla lista della spesa.</p>
  <div class="row"><label class="bp filebtn">Scatta foto<input type="file" accept="image/*" capture="environment" id="cam" hidden></label><label class="bg filebtn">Dalla galleria<input type="file" accept="image/*" id="gal" hidden></label></div>
  <p class="hint">${gkey() ? 'Lettura con Gemini attiva.' : 'La lettura avviene sul telefono. Per riconoscere meglio i prodotti puoi attivare Gemini nelle impostazioni.'}</p><div id="sout"></div>`, m => {
    const go = e => { const f = e.target.files[0]; if (f) readReceipt(f, m.querySelector('#sout')); e.target.value = '' };
    m.querySelector('#cam').onchange = go; m.querySelector('#gal').onchange = go
  })
}
async function readReceipt(file, out) {
  out.innerHTML = '<p class="load" id="st">Preparo la foto…</p>'; const st = t => { const e = out.querySelector('#st'); if (e) e.textContent = t };
  try {
    const { color, gray } = await prep(file); let items = null, raw = '', meta = { shop: '', total: null };
    if (gkey()) {
      st('Gemini sta leggendo lo scontrino…');
      try { const r = await gemini([{ text: RECEIPT_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: color.split(',')[1] } }]); items = gItems(r); meta = { shop: (r && r.negozio) || '', total: r && r.totale != null ? +r.totale : null } }
      catch (e) { console.warn(e); toast('Gemini non risponde: leggo sul telefono') }
    }
    if (!items) {
      st('Scarico il lettore di testo (solo la prima volta)…'); const T = await loadTess();
      const res = await T.recognize(gray, 'ita', { logger: mm => { if (mm.status === 'recognizing text') st(`Leggo lo scontrino… ${Math.round(mm.progress * 100)}%`) } });
      raw = res.data.text; items = parseReceipt(raw).map(x => ({ ...x, luogo: guessLuogo(x.n), cat: guessCat(x.n) })); meta.total = receiptTotal(raw)
    }
    reviewReceipt(items, raw, out, { receipt: true, ...meta })
  } catch (e) { console.warn(e); out.innerHTML = `<p class="load">Non sono riuscito a leggerlo: ${esc(e.message || e)}. Riprova con una foto più nitida.</p>` }
}
function reviewReceipt(items, raw, out, opts = {}) {
  const row = i => `<div class="rv${opts.receipt ? ' wp' : ''}"><input type="checkbox" class="c" checked aria-label="Includi"><input class="n" value="${esc(i.n)}" aria-label="Nome" placeholder="Nome">${opts.receipt ? `<input class="pr" type="number" step="0.01" min="0" inputmode="decimal" value="${i.price ?? ''}" placeholder="€" aria-label="Prezzo">` : ''}<select class="k" aria-label="Categoria">${CATS.map(([k, l]) => `<option value="${k}"${k === (i.cat || guessCat(i.n)) ? ' selected' : ''}>${CAT_S[k] || l}</option>`).join('')}</select><input class="q" type="number" step="any" min="0" inputmode="decimal" value="${i.q ?? ''}" aria-label="Quantità"><select class="u" aria-label="Unità">${UNITS.map(u => `<option${u === i.u ? ' selected' : ''}>${u}</option>`).join('')}</select><select class="l" aria-label="Dove">${LUOGHI.map(([k, l]) => `<option value="${k}"${k === i.luogo ? ' selected' : ''}>${l}</option>`).join('')}</select>${i.info ? `<small style="grid-column:2/6;color:var(--mut)">${esc(i.info)}</small>` : ''}</div>`;
  out.innerHTML = `${opts.head || `<h3>${items.length ? `Ho trovato ${items.length} prodotti` : 'Non ho trovato prodotti'}</h3><p class="sub">Correggi i nomi come li chiamate voi (es. "latte" invece di "latte ps uht") e togli la spunta a quello che non va in dispensa.</p>`}<div id="rvs">${items.map(row).join('')}</div>
  <p><button class="bg" id="addr" type="button">+ Aggiungi una riga</button></p>
  ${opts.receipt ? `<div class="row rtot"><label>Negozio<input id="rshop" value="${esc(opts.shop || '')}" placeholder="Es. Conad" autocomplete="off"></label><label>Totale pagato (€)<input id="rtotal" type="number" step="0.01" min="0" inputmode="decimal" value="${opts.total ?? (items.some(i => i.price) ? round(items.reduce((a, i) => a + (i.price || 0), 0)) : '')}"></label></div><p class="hint" style="margin-top:0">Lo segno nelle spese del mese, in Spesa.</p>` : ''}
  <label class="ck"><input type="checkbox" id="rsp" checked> Togli dalla spesa quello che ho comprato</label>
  <button class="bp wide" id="rok">${opts.ok || 'Metti in dispensa'}</button>${raw ? `<details><summary>Testo letto dallo scontrino</summary><pre>${esc(raw)}</pre></details>` : ''}`;
  out.querySelector('#addr').onclick = () => out.querySelector('#rvs').insertAdjacentHTML('beforeend', row({ n: '', q: 1, u: 'pz', luogo: 'dispensa' }));
  out.querySelector('#rok').onclick = () => {
    const rs = [...out.querySelectorAll('.rv')].filter(r => r.querySelector('.c').checked).map(r => ({ name: r.querySelector('.n').value.trim(), qty: r.querySelector('.q').value === '' ? null : parseFloat(r.querySelector('.q').value), unit: r.querySelector('.u').value, luogo: r.querySelector('.l').value, cat: r.querySelector('.k').value })).filter(x => x.name);
    rs.forEach(mergeDisp); let k = 0; if (rs.length) logA('ha aggiunto in dispensa: ' + listTxt(rs.map(x => x.name)));
    if (opts.receipt) { const tot = parseFloat(out.querySelector('#rtotal').value); const prs = [...out.querySelectorAll('.rv')].filter(r => r.querySelector('.n').value.trim()).map(r => ({ n: r.querySelector('.n').value.trim(), cat: r.querySelector('.k').value, price: parseFloat((r.querySelector('.pr') || {}).value) || 0 })).filter(x => x.price > 0);
      if (tot > 0 || prs.length) { const total = tot > 0 ? round(tot) : round(prs.reduce((a, x) => a + x.price, 0)); const shop = out.querySelector('#rshop').value.trim(); save('spese', null, { date: today(), month: today().slice(0, 7), total, shop, items: prs, by: S.me || '' }); logA(`ha registrato una spesa di ${eur(total)}${shop ? ' da ' + shop : ''}`) } }
    if (out.querySelector('#rsp').checked) S.spesa.filter(s => rs.some(x => same(x.name, s.name))).forEach(s => { del('spesa', s.id); k++ });
    close(); toast(rs.length === 1 ? `${rs[0].name} → ${LUOGO_L[rs[0].luogo]}${k ? ', tolto dalla spesa' : ''}` : `${rs.length} prodotti in dispensa${k ? `, ${k} tolti dalla spesa` : ''}`)
  }
}

function gItems(r) {
  return ((r && r.prodotti) || (Array.isArray(r) ? r : [])).filter(x => x && x.n).map(x => ({ n: String(x.n).toLowerCase(), q: x.q == null || x.q === '' ? null : +x.q, u: UNITS.includes(x.u) ? x.u : 'pz', luogo: LUOGO_L[x.luogo] ? x.luogo : guessLuogo(x.n), cat: CAT_L[x.cat] ? x.cat : guessCat(x.n), price: x.prezzo == null || x.prezzo === '' ? null : +x.prezzo }))
}

/* ---------- Foto di un prodotto ---------- */
let zxP = null;
function loadZx() { return zxP || (zxP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = ZXING; s.onload = () => res(window.ZXing); s.onerror = () => { zxP = null; rej(new Error('lettore di codici non disponibile')) }; document.head.appendChild(s) })) }
async function readBarcode(file) {
  if ('BarcodeDetector' in window) {
    try { const bd = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }); const bmp = await createImageBitmap(file); const r = await bd.detect(bmp); if (r[0]) return r[0].rawValue } catch (e) { }
  }
  try {
    const Z = await loadZx(); const hints = new Map(); hints.set(Z.DecodeHintType.TRY_HARDER, true);
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
    const reader = new Z.BrowserMultiFormatReader(hints); const url = URL.createObjectURL(file);
    try { const r = await reader.decodeFromImageUrl(url); return r && r.getText() } finally { URL.revokeObjectURL(url) }
  } catch (e) { return null }
}
const OFF_MAP = [
  [/pasta|spaghetti|noodle|lasagne|gnocchi/, 'carbo', 'pasta'], [/en:rices?\b|risotto/, 'carbo', 'riso'], [/breads|rusks|crispbread|crackers|breadsticks/, 'carbo', null], [/flours?\b/, 'carbo', 'farina'], [/breakfast-cereals|mueslis|oat-flakes/, 'carbo', 'cereali'],
  [/biscuits|cookies|cakes|pastries|chocolates?|confectioner|candies|snacks|chips|spreads/, 'dolci', null],
  [/milks?\b|en:milk/, 'latticini', 'latte'], [/yogurts?/, 'latticini', 'yogurt'], [/mozzarella/, 'latticini', 'mozzarella'], [/butters?\b/, 'latticini', 'burro'], [/creams?\b/, 'latticini', 'panna'], [/cheeses?/, 'latticini', null],
  [/en:eggs|chicken-eggs/, 'proteine', 'uova'], [/tunas?/, 'proteine', 'tonno'], [/legumes|beans|chickpeas|lentils/, 'proteine', null], [/meats?|hams?|sausages|salami|poultr|chicken/, 'proteine', null], [/fishes|seafood|salmon/, 'proteine', null],
  [/tomato-sauces|tomato-purees|passata|peeled-tomatoes|crushed-tomatoes/, 'condimenti', 'passata'], [/olive-oils/, 'condimenti', 'olio'], [/oils|vinegars|condiments|sauces|spices|salts|sugars|pestos|broths|stock/, 'condimenti', null],
  [/vegetables|salads/, 'verdura', null], [/fruits|nuts/, 'frutta', null], [/beverages|waters|juices|sodas|wines|beers|coffees|teas/, 'bevande', null]
];
function offQty(s) {
  s = String(s || '').toLowerCase().replace(',', '.'); let m = s.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/);
  if (m) { let q = +m[1] * +m[2], u = m[3]; if (u === 'cl') { q *= 10; u = 'ml' } return { q: round(q), u } }
  m = s.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/); if (m) { let q = +m[1], u = m[2]; if (u === 'cl') { q *= 10; u = 'ml' } return { q, u } }
  m = s.match(/(\d+)\s*(pz|pezzi|uova|bustine|capsule)/); if (m) return { q: +m[1], u: 'pz' };
  return { q: 1, u: 'conf' }
}
async function lookupOFF(code) {
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_it,generic_name_it,brands,quantity,categories_tags`);
  if (!r.ok) return null; const j = await r.json(); if (!j || j.status !== 1 || !j.product) return null;
  const p = j.product; const full = (p.product_name_it || p.product_name || p.generic_name_it || '').trim(); if (!full) return null;
  const tags = (p.categories_tags || []).join(' '); const hit = OFF_MAP.find(([re]) => re.test(tags));
  let n = (hit && hit[2]) || full.toLowerCase().replace(new RegExp('\\b' + String(p.brands || '').split(',')[0].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'), '').replace(/\s+/g, ' ').trim() || full.toLowerCase();
  const cat = hit ? hit[1] : guessCat(n);
  const luogo = /frozen|surgel/.test(tags) ? 'freezer' : /canned|uht|long-life|dried|dry-/.test(tags) ? 'dispensa' : (cat === 'latticini' || /fresh|refrigerated|en:meats|fishes|hams/.test(tags)) ? 'frigo' : guessLuogo(n + ' ' + full);
  const { q, u } = offQty(p.quantity);
  return { n, q, u, luogo, cat, info: `${full}${p.brands ? ' · ' + p.brands.split(',')[0] : ''}${p.quantity ? ' · ' + p.quantity : ''}` }
}
const PRODUCT_PROMPT = 'Nella foto ci sono uno o più alimenti: confezioni oppure prodotti freschi (frutta, verdura, carne...). Elenca ognuno. Per ciascuno dai: "n" = nome generico breve in italiano minuscolo, come lo chiamerebbe una famiglia (es. "carote", "pasta", "latte", "petto di pollo"); "q" = quantità: numero di pezzi per la frutta e la verdura sfuse, oppure peso o volume se si legge sulla confezione; "u" = una tra g, kg, ml, l, pz, conf; "luogo" = dove si conserva di solito in una casa italiana, una tra frigo, dispensa, freezer (carote, zucchine, insalata, latticini, carne: frigo; pasta, riso, patate, cipolle, scatolame, biscotti: dispensa; surgelati: freezer); "cat" = una tra carbo, verdura, frutta, proteine, latticini, condimenti, dolci, bevande, altro. Se non c\'è nessun alimento rispondi con la lista vuota. Rispondi SOLO con JSON: {"prodotti":[{"n":"carote","q":4,"u":"pz","luogo":"frigo","cat":"verdura"}]}';
const QUICK = ['carote', 'zucchine', 'pomodori', 'insalata', 'patate', 'cipolle', 'mele', 'banane', 'limoni', 'uova', 'latte', 'pane'];

function photoModal() {
  modal(`<h2>Foto di un prodotto</h2><p class="sub">Fotografa una confezione (meglio dal lato del codice a barre) o della frutta e verdura: la metto in dispensa, in frigo o in freezer. Puoi fotografare anche più cose insieme.</p>
  <div class="row"><label class="bp filebtn">Scatta foto<input type="file" accept="image/*" capture="environment" id="cam" hidden></label><label class="bg filebtn">Dalla galleria<input type="file" accept="image/*" id="gal" hidden></label></div>
  <p class="hint">${gkey() ? 'Riconoscimento con Gemini attivo: funziona anche con frutta, verdura e prodotti senza codice.' : 'Senza Gemini riconosco le confezioni dal codice a barre. Per frutta e verdura attiva Gemini nelle impostazioni (è gratis).'}</p><div id="pout"></div>`, m => {
    const go = e => { const f = e.target.files[0]; if (f) readProduct(f, m.querySelector('#pout')); e.target.value = '' };
    m.querySelector('#cam').onchange = go; m.querySelector('#gal').onchange = go
  })
}
async function readProduct(file, out) {
  const url = URL.createObjectURL(file);
  out.innerHTML = `<div class="prev"><img src="${url}" alt=""><p class="load" id="st">Cerco il codice a barre…</p></div>`; const st = t => { const e = out.querySelector('#st'); if (e) e.textContent = t };
  let items = [], note = '';
  try {
    const code = await readBarcode(file);
    if (code) {
      st(`Codice ${code}: cerco il prodotto…`);
      try { const p = await lookupOFF(code); if (p) items = [p]; else note = `Il codice ${code} non è nell'archivio di Open Food Facts.` } catch (e) { note = 'Non riesco a cercare il codice adesso.' }
    }
    if (!items.length && gkey()) {
      st('Gemini sta guardando la foto…');
      try { const { color } = await prep(file); items = gItems(await gemini([{ text: PRODUCT_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: color.split(',')[1] } }])); if (!items.length) note = 'Non vedo alimenti nella foto.' } catch (e) { note = 'Gemini non risponde: ' + (e.message || e) }
    } else if (!items.length && !code) note = 'Non trovo un codice a barre nella foto.';
  } catch (e) { console.warn(e); note = 'Non sono riuscito a leggere la foto.' }
  if (items.length) {
    reviewReceipt(items, '', out, { head: `<div class="prev"><img src="${url}" alt=""><div><h3 style="margin:0">${items.length === 1 ? 'Ecco cosa ho trovato' : `Ho trovato ${items.length} prodotti`}</h3><p class="sub" style="margin:4px 0 0">Controlla nome, quantità e dove va, poi conferma.</p></div></div>`, ok: items.length === 1 ? 'Aggiungi' : 'Aggiungi tutto' });
    return
  }
  out.innerHTML = `<div class="prev"><img src="${url}" alt=""><p class="sub" style="margin:0">${esc(note)}${gkey() ? '' : ' Con Gemini riconoscerei anche frutta e verdura.'}</p></div>
  <h3>Cos'è?</h3><div class="quick">${QUICK.map(n => `<button class="sm" data-q="${n}">${n}</button>`).join('')}</div>
  <form id="pf" class="row"><input name="n" class="srch" placeholder="Scrivi il nome, es. 4 carote" autocomplete="off"><button class="bp">Avanti</button></form>`;
  const pick = t => { const p = parseLine(t); if (p) reviewReceipt([{ n: p.n, q: p.q ?? 1, u: p.u === 'qb' ? 'pz' : p.u, luogo: guessLuogo(p.n), cat: guessCat(p.n) }], '', out, { head: '<h3>Controlla e conferma</h3>', ok: 'Aggiungi' }) };
  out.querySelectorAll('[data-q]').forEach(b => b.onclick = () => pick(b.dataset.q));
  out.querySelector('#pf').onsubmit = e => { e.preventDefault(); pick(E(e.target, 'n').value) }
}

/* ---------- Keep / condivisione ---------- */
async function shareText(title, text) {
  if (navigator.share) { try { await navigator.share({ title, text }); return } catch (e) { if (e && e.name === 'AbortError') return } }
  try { await navigator.clipboard.writeText(title + '\n' + text); toast('Copiato: apri Keep e incollalo in una nota') }
  catch (e) { modal(`<h2>${esc(title)}</h2><p class="sub">Copia il testo e incollalo in una nota di <a href="https://keep.google.com" target="_blank" rel="noopener">Keep</a>.</p><textarea rows="12" readonly style="width:100%">${esc(text)}</textarea><div class="acts"><button class="bp" data-act="close">Fatto</button></div>`) }
}

/* ---------- impostazioni ---------- */
function settingsModal() {
  modal(`<h2>Impostazioni</h2>
  <h3>Invita la famiglia</h3><p class="sub">Manda questo link agli altri: aprendolo entrano subito nella vostra famiglia. Chi ha il link può vedere e modificare i dati, quindi mandalo solo a loro.</p><button class="bp wide" id="inv">Condividi il link di invito</button>
  <h3>Famiglia</h3><div class="acts-l" style="margin-top:0"><button class="act" id="ab"><span class="ai">${IC.cal}</span><span><b>Abitudini</b><small>Chi di solito c'è o non c'è, giorno per giorno</small></span></button><button class="act" id="ac"><span class="ai">${IC.hist}</span><span><b>Attività recenti</b><small>Chi ha fatto cosa negli ultimi 7 giorni</small></span></button><button class="act" id="nm"><span class="ai">${IC.pen}</span><span><b>Nomi</b><small>Cambia i nomi della famiglia</small></span></button></div>
  <h3>Gemini <small style="font-weight:400;color:var(--mut)">facoltativo</small></h3><p class="sub">Con una chiave gratuita di Google Gemini l'app legge meglio gli scontrini e propone ricette con quello che avete. Creala su <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. Resta salvata solo su questo telefono.</p>
  <form id="gf"><label>Chiave API<input name="k" type="password" autocomplete="off" value="${esc(gkey())}" placeholder="AIza…"></label><label>Modello <small>lascia vuoto: lo sceglie l'app</small><input name="m" value="${esc(LS.get('gmodel', '') === 'gemini-2.5-flash' ? '' : LS.get('gmodel', ''))}" placeholder="automatico${LS.get('gok', '') ? ' (ora ' + esc(LS.get('gok', '')) + ')' : ''}" autocomplete="off"></label><p class="hint" id="gres"></p><div class="acts">${gkey() ? '<button type="button" class="bd" id="gdel">Togli la chiave</button>' : ''}<button type="button" class="bg" id="gtest">Prova</button><button class="bp">Salva</button></div></form>
  <h3>Questo telefono</h3><button class="bd" id="out" style="margin:0">Esci dalla famiglia su questo telefono</button>`, m => {
    m.querySelector('#inv').onclick = () => shareText('Cosa si mangia?', 'Entra nella nostra app della cucina: ' + inviteLink());
    m.querySelector('#nm').onclick = namesModal; m.querySelector('#ab').onclick = () => habitsModal(); m.querySelector('#ac').onclick = activityModal;
    const gsave = f => { LS.set('gkey', E(f, 'k').value.trim()); LS.set('gmodel', E(f, 'm').value.trim()); LS.del('gauto2'); LS.del('gok') };
    m.querySelector('#gf').onsubmit = e => { e.preventDefault(); gsave(e.target); close(); render(); toast(gkey() ? 'Gemini attivo' : 'Salvato') };
    m.querySelector('#gtest').onclick = async () => { const f = m.querySelector('#gf'), out = m.querySelector('#gres'); gsave(f); if (!gkey()) { out.textContent = 'Incolla prima la chiave.'; return } out.textContent = 'Provo…'; try { const r = await gemini([{ text: 'Rispondi solo con JSON: {"ok":true}' }], md => out.textContent = `Provo con ${md}…`); out.textContent = r && r.ok ? `Funziona, modello ${LS.get('gok', '')}.` : 'Risposta strana, ma la chiave funziona.'; render() } catch (err) { out.textContent = 'Non funziona: ' + (err.message || err) } };
    const gd = m.querySelector('#gdel'); if (gd) gd.onclick = () => { LS.del('gkey'); close(); render() };
    let armed = false; m.querySelector('#out').onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Sicuro? Tocca di nuovo'; return } LS.del('fam'); LS.del('me'); location.href = location.pathname }
  })
}
function habitsModal(mid) {
  const M = members(); mid = mid || S.me || M[0].id; const h = { ...((S.abit || {})[mid] || {}) };
  modal(`<h2>Abitudini</h2><p class="sub">Tocca i pasti in cui di solito <b>non</b> c'è. La settimana si compila da sola: poi cambi solo le eccezioni.</p>
  <div class="segc">${M.map(m => `<button type="button" data-hm="${m.id}" class="${m.id === mid ? 'on' : ''}">${esc(m.name)}</button>`).join('')}</div>
  <div class="hgrid"><span></span>${MEALS.map(([, l]) => `<span class="hh">${l}</span>`).join('')}${WD.map((w, d) => `<span class="hd">${w}</span>${MEALS.map(([mk]) => { const on = h[d + mk] !== false; return `<button type="button" class="hc${on ? ' on' : ''}" data-hk="${d}${mk}" style="--c:${(M.find(x => x.id === mid) || {}).color}" aria-pressed="${on}">${on ? "c'è" : 'fuori'}</button>` }).join('')}`).join('')}</div>
  <div class="acts"><button class="bp" data-act="close">Fatto</button></div>`, m => {
    m.querySelectorAll('[data-hm]').forEach(b => b.onclick = () => habitsModal(b.dataset.hm));
    m.querySelectorAll('[data-hk]').forEach(b => b.onclick = () => { const k = b.dataset.hk; const on = h[k] === false; h[k] = on; b.classList.toggle('on', on); b.textContent = on ? 'c\'è' : 'fuori'; b.setAttribute('aria-pressed', on); S.abit = { ...S.abit, [mid]: { ...h } }; render(); if (F) F.fs.setDoc(famRef(), { abit: { [mid]: { [k]: on } } }, { merge: true }).catch(werr); clearTimeout(habitsModal.t); habitsModal.n = (habitsModal.n || 0) + 1; habitsModal.t = setTimeout(() => { logA(`ha cambiato le abitudini di ${(M.find(x => x.id === mid) || {}).name}`); habitsModal.n = 0 }, 3000) })
  })
}
function whoModal() {
  const M = members(); modal(`<h2>Chi sei?</h2><p class="sub">Così i nuovi impegni partono col tuo nome. Lo ricorda solo questo telefono.</p><div class="who">${M.map(m => `<button data-me="${m.id}" style="--c:${m.color}" class="${S.me === m.id ? 'on' : ''}"><span class="av on" style="--c:${m.color}">${esc(ini(m.name))}</span>${esc(m.name)}</button>`).join('')}</div><button class="bg wide" id="nm">Cambia i nomi della famiglia</button>`, mm => {
    mm.querySelectorAll('[data-me]').forEach(b => b.onclick = () => { S.me = b.dataset.me; LS.set('me', S.me); close(); render(); if (S.created) { S.created = false; toast('Ora invita gli altri dalle impostazioni') } }); mm.querySelector('#nm').onclick = namesModal
  })
}
function namesModal() {
  const M = members(); modal(`<h2>La famiglia</h2><p class="sub">I nomi li vedono tutti.</p><form id="f">${M.map((m, i) => `<label><span><span class="dot" style="background:${m.color}"></span>Persona ${i + 1}</span><input name="n${i}" value="${esc(m.name)}" required autocomplete="off"></label>`).join('')}${acts()}</form>`, mm => {
    mm.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const mem = M.map((m, i) => ({ id: m.id, name: E(f, 'n' + i).value.trim() || m.name, color: m.color })); S.members = mem; close(); render(); if (F) F.fs.setDoc(famRef(), { members: mem }, { merge: true }).catch(werr); if (!S.me) whoModal() }
  })
}

let tt; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2800) }
function go(t) { if (!TABS.includes(t)) t = 'settimana'; if (t === S.tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return } S.tab = t; history.pushState(null, '', '#' + t); render(); window.scrollTo(0, 0) }

/* ---------- eventi ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'modal') { close(); return } const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, ds = b.dataset;
  if (a === 'close') close(); else if (a === 'tab') go(ds.v); else if (a === 'who') whoModal(); else if (a === 'settings') settingsModal();
  else if (a === 'wk') { S.week += +ds.v; S.sel = null; subWeek(); render() } else if (a === 'wk0') { S.week = 0; S.sel = null; subWeek(); render() } else if (a === 'sel') { S.sel = ds.d; render() } else if (a === 'pick') togglePick(ds.d, ds.meal, +ds.i); else if (a === 'cook') cookMeal(ds.d, ds.meal); else if (a === 'leftover') leftoverModal(ds.d, ds.meal); else if (a === 'spese') speseModal(); else if (a === 'uncook') undoCook(ds.d, ds.meal); else if (a === 'dplus') addSheet(); else if (a === 'fold') { const i = S.fold.indexOf(ds.v); if (i >= 0) S.fold.splice(i, 1); else S.fold.push(ds.v); LS.set('fold', S.fold); render() } else if (a === 'ddel') del('dispensa', ds.id); else if (a === 'migok' || a === 'migno') { const L = S.disp.filter(d => !isLv(d) && !d.trackSet && !zero(d) && guessTrack(d.name)); L.forEach(d => save('dispensa', d.id, a === 'migok' ? { ...d, track: 'livello', trackSet: true, unit: 'conf', qty: d.unit === 'conf' || d.unit === 'pz' ? (d.qty || 1) : 1, lvl: 'pieno' } : { ...d, trackSet: true })); if (a === 'migok') toast(`${L.length} prodotti ora si contano per livello`) }
  else if (a === 'tog') { const p = pres(ds.d, ds.m); const on = p[ds.meal] === false; setPres(ds.d, ds.m, { [ds.meal]: on }); const who = (members().find(x => x.id === ds.m) || {}).name; logA(`ha segnato ${who === meName() ? 'di' : who} ${on ? 'esserci' : 'non esserci'} a ${MEALS.find(x => x[0] === ds.meal)[1].toLowerCase()} di ${dayFmt.format(dt(ds.d))}`.replace('segnato di esserci', 'segnato che c\'è').replace('segnato di non esserci', 'segnato che non c\'è')) }
  else if (a === 'menu') menuModal(ds.d, ds.meal); else if (a === 'imp') impModal(ds.d);
  else if (a === 'delimp') { const p = pres(ds.d, ds.m); setPres(ds.d, ds.m, { imp: (p.imp || []).filter((_, i) => i !== +ds.i) }) }
  else if (a === 'luogo') { S.luogo = ds.v; render() } else if (a === 'photo') photoModal(); else if (a === 'dadd') dispModal(); else if (a === 'dbulk') bulkModal(); else if (a === 'scan') scanModal();
  else if (a === 'dedit') dispModal(S.disp.find(x => x.id === ds.id));
  else if (a === 'dq') { const d = S.disp.find(x => x.id === ds.id); if (d) save('dispensa', d.id, { ...d, qty: Math.max(0, round((d.qty || 0) + (+ds.v) * stepFor(d.unit))) }) }
  else if (a === 'dzero') { const d = S.disp.find(x => x.id === ds.id); if (d) { save('dispensa', d.id, { ...d, qty: 0 }); addToSpesa([{ name: d.name, qty: null, unit: d.unit === 'qb' ? 'pz' : d.unit }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'd2spesa') { const d = S.disp.find(x => x.id === ds.id); if (d) { addToSpesa([{ name: d.name, qty: null, unit: d.unit }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'ropen') ricModal(ds.id); else if (a === 'rnew') ricEdit(); else if (a === 'ai') aiModal();
  else if (a === 'spdel') del('spesa', ds.id); else if (a === 'spq') { const x = (S._sugg || [])[+ds.i]; if (x) { addToSpesa([{ name: x.name, qty: null, unit: x.unit }]); toast(x.name + ' in lista') } }
  else if (a === 'sp2disp') { const L = S.spesa.filter(x => x.done); L.forEach(x => { mergeDisp({ name: x.name, qty: x.qty ?? 1, unit: x.unit }); del('spesa', x.id) }); logA('ha messo in dispensa la spesa: ' + listTxt(L.map(x => x.name))); toast(`${L.length} cose messe in dispensa`) }
  else if (a === 'spclear') S.spesa.filter(x => x.done).forEach(x => del('spesa', x.id));
  else if (a === 'keepspesa') { const L = S.spesa.filter(x => !x.done); if (!L.length) { toast('La lista è vuota'); return } shareText('Spesa', L.map(x => x.name + (x.qty != null ? ` (${fmtQ(x.qty, x.unit)})` : '')).join('\n')) }
  else if (a === 'keepdisp') { if (!S.disp.length) { toast('La dispensa è vuota'); return } shareText('In casa', LUOGHI.map(([k, l]) => { const L = S.disp.filter(d => d.luogo === k && !(typeof d.qty === 'number' && d.qty <= 0)); return L.length ? `${l}:\n${L.map(d => `- ${d.name}${d.qty != null ? ' ' + fmtQ(d.qty, d.unit) : ''}${d.scad ? ' (scade ' + scadTxt(d.scad) + ')' : ''}`).join('\n')}` : '' }).filter(Boolean).join('\n\n')) }
});
document.addEventListener('change', e => { const id = e.target.dataset && e.target.dataset.sp; if (id) { const x = S.spesa.find(s => s.id === id); if (x) save('spesa', id, { ...x, done: e.target.checked }) } });
$('#q').addEventListener('input', e => { S.q = e.target.value; renderDisp() });
$('#rq').addEventListener('input', e => { S.rq = e.target.value; renderRic() });
$('#onlycan').addEventListener('change', e => { S.onlyCan = e.target.checked; renderRic() });
$('#spadd').addEventListener('submit', e => { e.preventDefault(); const p = parseLine($('#spin').value); if (!p) return; addToSpesa([{ name: p.n, qty: p.q, unit: p.u === 'qb' ? 'pz' : p.u }]); $('#spin').value = '' });

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) close() });

/* ---------- dati ---------- */
let unsubW = [];
function subWeek() {
  if (!F) return; unsubW.forEach(u => u()); const ds = weekDays(S.week), a = ymd(ds[0]), b = ymd(ds[6]); const { fs } = F;
  const rng = n => fs.query(col(n), fs.where('date', '>=', a), fs.where('date', '<=', b));
  unsubW = [fs.onSnapshot(rng('presenze'), s => { const o = {}; s.docs.forEach(d => o[d.id] = d.data()); S.pres = o; render() }, dberr),
  fs.onSnapshot(rng('menu'), s => { const o = {}; s.docs.forEach(d => o[d.id] = d.data()); S.menu = o; render() }, dberr)]
}
async function connect() {
  S.phase = 'connecting'; render();
  try {
    const X = await ensureFirebase(); F = { fs: X.fs, db: X.db, fam: S.fam }; const { fs } = F;
    const sub = (name, key) => fs.onSnapshot(col(name), s => { S[key] = s.docs.map(d => ({ id: d.id, ...d.data() })); render() }, dberr);
    sub('dispensa', 'disp'); sub('ricette', 'ric'); sub('spesa', 'spesa'); sub('spese', 'spese'); subWeek();
    fs.onSnapshot(dref('stats', 'acquisti'), d => { S.stats = (d.exists() && d.data().counts) || {}; if (S.tab === 'spesa') render() }, () => { });
    fs.onSnapshot(famRef(), d => {
      const v = d.exists() && d.data(); S.members = v && Array.isArray(v.members) && v.members.length === 4 ? v.members : null; S.abit = (v && v.abit) || {}; S.rico = (v && v.rico) || {}; render();
      if (!S.me && !S.asked && !d.metadata.fromCache && $('#modal').hidden) { S.asked = true; S.created ? namesModal() : whoModal() }
    }, dberr);
    S.phase = 'ready'; S.note = ''; render()
  } catch (e) { console.warn(e); S.phase = 'error'; S.err = fbMsg(e); render() }
}
function start() {
  const p = new URLSearchParams(location.search);
  if (p.get('c')) { const c = decCfg(p.get('c')); if (c) LS.set('fbcfg', c) }
  if (p.get('f')) LS.set('fam', p.get('f').trim());
  if (p.has('c') || p.has('f')) history.replaceState(null, '', location.pathname + location.hash);
  S.cfg = CFG && CFG.apiKey ? CFG : LS.get('fbcfg', null); S.fam = LS.get('fam', '');
  if (!S.cfg) { S.phase = 'config'; return render() }
  if (!S.fam) { S.phase = 'family'; return render() }
  connect()
}
start();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
