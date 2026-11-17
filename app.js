// Cosa si mangia? — app della cucina di famiglia
import { firebaseConfig as CFG } from './config.js';

const APP_V = '2.0', DATA_V = 2;
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
const UNITS = ['pz', 'g', 'kg', 'ml', 'l', 'conf', 'vasetti', 'barattoli', 'bottiglie', 'scatole', 'pacchi', 'bustine', 'tubetti', 'lattine', 'rotoli', 'cucchiai', 'cucchiaini', 'spicchi', 'fette', 'qb'];
const PACK = ['conf', 'pz', 'vasetti', 'barattoli', 'bottiglie', 'scatole', 'pacchi', 'bustine', 'tubetti', 'lattine', 'rotoli'];
const LV_UNITS = [...PACK, 'g', 'kg', 'ml', 'l'];
const SING = { vasetti: 'vasetto', barattoli: 'barattolo', bottiglie: 'bottiglia', scatole: 'scatola', pacchi: 'pacco', bustine: 'bustina', tubetti: 'tubetto', lattine: 'lattina', rotoli: 'rotolo', cucchiai: 'cucchiaio', cucchiaini: 'cucchiaino', spicchi: 'spicchio', fette: 'fetta' };
const isPack = u => PACK.includes(u || 'conf');
const uLabel = (u, q) => (q === 1 && SING[u]) || u || 'conf';
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

const S = { prof: {}, piatti: {}, gusti: {}, rview: 'ricette', members: null, pres: {}, menu: {}, disp: [], ric: [], libro: [], spesa: [], week: 0, me: LS.get('me', null), tab: TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'settimana', luogo: 'tutto', stats: {}, abit: {}, rico: {}, spese: [], sel: null, fold: LS.get('fold', []), q: '', rq: '', onlyCan: false, note: '', phase: 'start', err: '', cfg: null, fam: '', asked: false };
let F = null; // { fs, db, fam }
let FBX = null; // { app, fs, db, authMod, auth }

const members = () => (S.members && S.members.map((m, i) => m.color ? m : { ...m, color: COLORS[i % 4] })) || [1, 2, 3, 4].map((n, i) => ({ id: 'm' + n, name: 'Persona ' + n, color: COLORS[i] }));
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
  down: '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 17v3h14v-3"/></svg>',
  bar: '<svg viewBox="0 0 24 24"><path d="M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.200 9.400l6.100-.8z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.600a3.500 3.500 0 0 1 0 6.800M18 14.500a6.500 6.500 0 0 1 3.500 5.500"/></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h11L21 7H6.200"/><circle cx="9" cy="19.500" r="1.500"/><circle cx="17" cy="19.500" r="1.500"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
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
const STOPW = ['di', 'del', 'della', 'dello', 'dei', 'delle', 'degli', 'd', 'al', 'alla', 'allo', 'all', 'ai', 'alle', 'con', 'e', 'in', 'da', 'per', 'a', 'il', 'lo', 'la', 'i', 'le', 'gli', 'l'];
const BENIGN = ['oliva', 'extravergine', 'evo', 'grano', 'duro', 'tenero', 'frumento', 'mucca', 'vaccino', 'pomodoro', 'pomodori', 'bovino', 'suino', 'maiale', 'manzo', 'pollo', 'tacchino', 'bufala', 'stagione', 'campo', 'montagna', 'mare'].map(stem);
const DIFFW = ['grattugiato', 'pangrattato', 'vegetale', 'condensato', 'soia', 'riso', 'avena', 'mandorla', 'mandorle', 'cocco', 'arachidi', 'semi', 'mais', 'capra', 'pecora', 'decaffeinato', 'affumicato'].map(stem);
const HEADOK = ['petto', 'cosce', 'coscia', 'fesa', 'filetto', 'filetti', 'fettine', 'trancio', 'tranci', 'spicchi', 'foglie', 'cuori', 'bistecca', 'bistecche'].map(stem);
// stesso prodotto? "latte" = "latte intero", ma "latte" ≠ "latte di soia", "pane" ≠ "pane grattugiato", "mele" ≠ "succo di mela"
function same(a, b) {
  a = norm(a); b = norm(b); if (!a || !b) return false; if (a === b) return true;
  const tk = x => x.split(' ').filter(w => !STOPW.includes(w)).map(stem); const A = tk(a), B = tk(b); if (!A.length || !B.length) return false;
  const [s, l, ls] = A.length <= B.length ? [A, B, b] : [B, A, a];
  if (!s.every(w => l.includes(w))) return false; if (A.length === B.length) return true;
  if (l.filter(w => !s.includes(w)).some(w => DIFFW.includes(w))) return false;
  if (!s.includes(l[0]) && !HEADOK.includes(l[0])) return false;
  const ws = ls.split(' '); for (let i = 0; i < ws.length - 1; i++) if (['di', 'd', 'al', 'alla', 'ai', 'alle', 'all'].includes(ws[i])) { const w = stem(ws[i + 1]); if (!s.includes(w) && !BENIGN.includes(w)) return false }
  return true
}
function guessLuogo(n) { n = norm(n); if (FREEZER_KW.some(k => n.includes(k))) return 'freezer'; if (FRIGO_KW.some(k => n.includes(k))) return 'frigo'; return 'dispensa' }
const UMAP = { g: 'g', gr: 'g', grammi: 'g', grammo: 'g', kg: 'kg', chili: 'kg', ml: 'ml', l: 'l', lt: 'l', litro: 'l', litri: 'l', pz: 'pz', pezzi: 'pz', conf: 'conf', confezione: 'conf', confezioni: 'conf', cucchiaio: 'cucchiai', cucchiai: 'cucchiai', cucchiaino: 'cucchiaini', cucchiaini: 'cucchiaini', cucchiaiate: 'cucchiai', cucchiaiata: 'cucchiai', spicchio: 'spicchi', spicchi: 'spicchi', fetta: 'fette', fette: 'fette', litro: 'l', kilo: 'kg', kili: 'kg', pezzo: 'pz', scatoletta: 'scatole', scatolette: 'scatole', busta: 'conf', buste: 'conf', cespo: 'pz', mazzo: 'pz', panetto: 'conf', vaschetta: 'conf', vaschette: 'conf', brick: 'conf', cartone: 'conf', cartoni: 'conf', sacchetto: 'conf', sacchetti: 'conf', retina: 'conf', vasetto: 'vasetti', vasetti: 'vasetti', barattolo: 'barattoli', barattoli: 'barattoli', bottiglia: 'bottiglie', bottiglie: 'bottiglie', scatola: 'scatole', scatole: 'scatole', pacco: 'pacchi', pacchi: 'pacchi', pacchetto: 'pacchi', pacchetti: 'pacchi', bustina: 'bustine', bustine: 'bustine', tubetto: 'tubetti', tubetti: 'tubetti', lattina: 'lattine', lattine: 'lattine', rotolo: 'rotoli', rotoli: 'rotoli' };
const lineOf = i => i.u === 'qb' ? `${i.n} q.b.` : `${i.q != null ? numFmt.format(i.q) + ' ' : ''}${i.u && i.u !== 'pz' ? i.u + ' ' : ''}${i.n}`;
function fmtQ(q, u) { if (u === 'qb') return 'q.b.'; if (q == null || q === '') return ''; let v = +q; if (u === 'g' || u === 'ml') v = v >= 50 ? Math.round(v / 5) * 5 : Math.round(v); return numFmt.format(v) + ' ' + ((v === 1 && SING[u]) || u || 'pz') }
const BASE = { kg: ['g', 1000], g: ['g', 1], l: ['ml', 1000], ml: ['ml', 1], cucchiai: ['cucchiaini', 3], cucchiaini: ['cucchiaini', 1] };
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
const lvText = d => { const q = typeof d.qty === 'number' ? d.qty : 1; const u = d.unit || 'conf'; const l = d.lvl === 'poco' ? 'quasi finita' : d.lvl === 'meta' ? 'a metà' : ''; if (!isPack(u)) return `${fmtQ(q, u)}${l ? ', ' + l : ''}`; return q > 1 ? `${numFmt.format(q)} ${uLabel(u, q)}${l ? ', uno ' + l.replace('finita', 'finito') : ''}` : l ? cap(l) : 'Piena' };
const lvQty = d => { const q = typeof d.qty === 'number' ? d.qty : 1; const u = d.unit || 'conf'; return isPack(u) ? (q > 1 || u !== 'conf' ? ` ${numFmt.format(q)} ${uLabel(u, q)}` : '') : ' ' + fmtQ(q, u) };
function setLevel(d, lvl, quiet) {
  d = S.disp.find(x => x.id === d.id) || d; const q = typeof d.qty === 'number' ? d.qty : 1; const pk = isPack(d.unit), spare = pk && q > 1;
  logA(`ha segnato ${d.name}: ${lvl === 'finito' ? (spare ? 'confezione finita, aperta la successiva' : 'finito') : lvl === 'poco' ? 'quasi finito' : lvl === 'meta' ? 'a metà' : 'pieno'}`);
  if (lvl === 'finito') {
    if (spare) { save('dispensa', d.id, { ...d, qty: round(q - 1), lvl: 'pieno' }); if (!quiet) toast(`${d.name}: aperta una nuova confezione`); return }
    save('dispensa', d.id, { ...d, qty: 0, lvl: 'pieno' }); addToSpesa([{ name: d.name, qty: null, unit: pk ? d.unit || 'conf' : 'conf' }]); if (!quiet) toast(`${d.name} finito, messo in spesa`); return
  }
  save('dispensa', d.id, { ...d, lvl });
  if (lvl === 'poco' && !spare && !S.spesa.some(x => !x.done && same(x.name, d.name))) { addToSpesa([{ name: d.name, qty: null, unit: pk ? d.unit || 'conf' : 'conf' }]); if (!quiet) toast(`${d.name} quasi finito: aggiunto alla spesa`) }
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
  if (q != null && i.u !== 'qb' && typeof it.qty === 'number') { const have = conv(it.name, it.qty, it.unit, i.u || 'pz'); if (have != null && have < q - 1e-9) return { st: 'p', need: { q: round(q - have), u: i.u || 'pz' }, it } }
  return { st: 'y', it }
}
const dowOf = k => (dt(k).getDay() + 6) % 7; // 0 = lunedì
const WD = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], WDL = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
function habit(mid, k, mk) { const h = (S.abit || {})[mid]; return !(h && h[dowOf(k) + mk] === false) }
function pres(date, mid) { const d = S.pres[date + '_' + mid]; const base = { date, mid, c: habit(mid, date, 'c'), p: habit(mid, date, 'p'), s: habit(mid, date, 's'), imp: [] }; return d ? { ...base, ...d } : base }
const COURSES = [['', 'Portata'], ['antipasto', 'Antipasto'], ['primo', 'Primo'], ['secondo', 'Secondo'], ['contorno', 'Contorno'], ['unico', 'Piatto unico'], ['dolce', 'Dolce']];
const COURSE_L = Object.fromEntries(COURSES); const COURSE_ORDER = ['antipasto', 'primo', 'unico', 'secondo', 'contorno', 'dolce', ''];
const ricoKey = (k, mk) => dowOf(k) + mk;
function ricoItems(k, mk) { if (k < today()) return null; const t = (S.rico || {})[ricoKey(k, mk)]; return t && Array.isArray(t.items) && t.items.length ? t.items : null }
const isRico = (k, mk) => !(S.menu[k] || {})[mk] && !!ricoItems(k, mk);
const pkOf = (k, mk, id) => { const p = ((((S.menu[k] || {}).pk || {})[mk]) || {})[id]; return p ? Object.keys(p).filter(m => p[m]) : null };
function mealItems(k, mk) {
  const v = (S.menu[k] || {})[mk]; let it;
  if (!v) it = (ricoItems(k, mk) || []).map(x => ({ ...x, picks: [] })); else if (Array.isArray(v.items)) it = v.items; else if (v.t || v.rid) it = [{ id: 'x0', t: v.t || '', rid: v.rid || '' }]; else it = [];
  return it.map(x => ({ ...x, picks: pkOf(k, mk, x.id) || x.picks || [] }))
}
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
function mealVal(k, mk) { const v = (S.menu[k] || {})[mk]; if (!v) { const t = ricoItems(k, mk); return t ? { items: t.map(x => ({ ...x, picks: [] })) } : {} } return { ...(Array.isArray(v.items) ? v : {}), items: mealItems(k, mk) } }
function suggestFor(text, chosen) {
  const toks = norm(text).split(' ').filter(w => w.length >= 2 && !STOPW.includes(w));
  return S.disp.filter(d => { if (zero(d) || chosen.includes(d.id)) return false; const ws = norm(d.name).split(' ').filter(w => w.length >= 2 && !STOPW.includes(w)); return ws.length && ws.every(w => w.length >= 4 ? toks.some(t => stem(t) === stem(w)) : toks.includes(w)) }).slice(0, 5)
}
function consume(d, q, u) { if (!d || typeof d.qty !== 'number' || q == null || u === 'qb') return null; const used = conv(d.name, q, u || d.unit, d.unit); return used == null ? null : round(Math.max(0, d.qty - used)) }
function cookMeal(k, mk) {
  const v = mealVal(k, mk); const items = v.items || []; const n = heads(k, mk) || 1; const noconv = [];
  const groups = {}; items.forEach(it => { if (it.alt) { const c = it.course || ''; (groups[c] = groups[c] || []).push(it) } });
  const skipped = Object.values(groups).filter(g => !g.some(x => (x.picks || []).length)).length;
  const prev = new Map();
  const ask = [];
  const apply = (id, q, u) => { const d = S.disp.find(x => x.id === id); if (isLv(d)) { ask.push(id); return } const nq = consume(d, q, u); if (nq == null) { if (q != null && u !== 'qb' && typeof d.qty === 'number') noconv.push(d.name); return } if (!prev.has(id)) prev.set(id, d.qty); save('dispensa', id, { ...d, qty: nq }) };
  items.filter(it => !it.alt || (it.picks || []).length).forEach(it => {
    (it.ingr || []).forEach(g => { const d = S.disp.find(x => x.id === g.id) || haveItem(g.name); if (d) apply(d.id, g.q, g.u) });
    const r = it.rid && S.ric.find(x => x.id === it.rid);
    if (r) { const f = n / (+r.porz || 4); (r.ingr || []).forEach(i => { if (STAPLES.includes(norm(i.n))) return; const d = haveItem(i.n); if (!d) return; if (isLv(d)) { ask.push(d.id); return } if (i.q != null) apply(d.id, i.q * f, i.u) }) }
  });
  const used = [...prev].map(([id, q]) => ({ id, q }));
  setMenu(k, mk, { ...v, items, cooked: { at: Date.now(), used, by: S.me || '' } }); logA(`ha cucinato ${MEALS.find(x => x[0] === mk)[1].toLowerCase()}: ${listTxt(items.filter(it => !it.alt || (it.picks || []).length).map(itemName))}${used.length ? ` (${used.length} ingredienti scalati)` : ''}`);
  bumpDishes(items.filter(it => !it.alt || (it.picks || []).length));
  if (ask.length) levelAsk(ask);
  if (noconv.length) { toast(`Non ho saputo scalare ${listTxt([...new Set(noconv)])}: unità diverse da quelle in dispensa. Controlla la scheda del prodotto.`); return }
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
  const items = mealItems(k, mk); const it = items[i]; if (!it) return; const on = !it.picks.includes(S.me);
  const loc = { ...((((S.menu[k] || {}).pk || {})[mk]) || {}) }, patch = {};
  items.forEach(o => {
    if (!o.alt) return; const cur = new Set(o.picks); const had = pkOf(k, mk, o.id) !== null; let ch = false;
    if (o === it) { on ? cur.add(S.me) : cur.delete(S.me); ch = true } else if (on && (o.course || '') === (it.course || '') && cur.has(S.me)) { cur.delete(S.me); ch = true }
    if (ch || (!had && cur.size)) { loc[o.id] = Object.fromEntries([...cur].map(m => [m, true])); patch[o.id] = had ? { [S.me]: cur.has(S.me) ? true : (F ? F.fs.deleteField() : false) } : loc[o.id] }
  });
  S.menu[k] = { ...(S.menu[k] || {}), date: k, pk: { ...((S.menu[k] || {}).pk || {}), [mk]: loc } }; render();
  if (F) F.fs.setDoc(dref('menu', k), { date: k, pk: { [mk]: patch } }, { merge: true }).catch(werr)
}
const gkey = () => LS.get('gkey', '') || S.famKey || '';
const tkey = () => LS.get('tkey', '') || S.famTkey || '';
const RECIPE_URL = /^https:\/\/(ricette\.giallozafferano\.it\/[^/?#]+\.html|(www\.)?cucchiaio\.it\/ricetta\/[^?#]+)/i;
async function tavily(query, n) {
  const url = (LS.get('tproxy', '') || '').trim() || 'https://api.tavily.com/search';
  let r; try { r = await gfetch(url, null, 25000, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tkey() }, body: JSON.stringify({ query, include_domains: ['giallozafferano.it', 'cucchiaio.it'], max_results: Math.min(20, n), search_depth: 'basic', include_raw_content: 'text', country: 'italy' }) }) }
  catch (e) { const x = new Error(e.timeout ? 'Tavily non risponde' : 'il telefono non riesce a parlare con Tavily (probabilmente serve l\'indirizzo intermedio)'); x.net = true; throw x }
  if (!r.ok) { let m = ''; try { const j = await r.json(); m = (j.detail && (j.detail.error || j.detail)) || j.error || '' } catch (e) { } throw new Error(r.status === 401 ? 'chiave Tavily non valida' : [429, 432, 433].includes(r.status) ? 'ricerche Tavily del mese finite' : 'Tavily ' + r.status + (m ? ': ' + String(m).slice(0, 100) : '')) }
  const j = await r.json(); return (j.results || []).map(x => ({ url: String(x.url || ''), title: String(x.title || ''), text: String(x.raw_content || x.content || '') }))
}
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
const KEY = { dispensa: 'disp', ricette: 'ric', spesa: 'spesa', spese: 'spese', libro: 'libro' };
function save(c, id, data) { const arr = S[KEY[c]]; id = id || rid(); const v = { ...data }; delete v.id; const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { id, ...v }; else arr.push({ id, ...v }); render(); if (F) F.fs.setDoc(dref(c, id), v).catch(werr); return id }
function saveMany(c, list) {
  const arr = S[KEY[c]]; const items = list.map(data => { const id = data.id || rid(); const v = { ...data }; delete v.id; const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { id, ...v }; else arr.push({ id, ...v }); return [id, v] }); render();
  if (F) { if (F.fs.writeBatch) { for (let i = 0; i < items.length; i += 400) { const b = F.fs.writeBatch(F.db); items.slice(i, i + 400).forEach(([id, v]) => b.set(dref(c, id), v)); b.commit().catch(werr) } } else items.forEach(([id, v]) => F.fs.setDoc(dref(c, id), v).catch(werr)) }
  return items.map(x => x[0])
}
function delMany(c, ids) {
  const set = new Set(ids); S[KEY[c]] = S[KEY[c]].filter(x => !set.has(x.id)); render();
  if (F) { if (F.fs.writeBatch) { for (let i = 0; i < ids.length; i += 400) { const b = F.fs.writeBatch(F.db); ids.slice(i, i + 400).forEach(id => b.delete(dref(c, id))); b.commit().catch(werr) } } else ids.forEach(id => F.fs.deleteDoc(dref(c, id)).catch(werr)) }
}
function libroAdmin() {
  const by = {}; S.libro.forEach(r => { const f = r.fonte || 'Senza fonte'; by[f] = (by[f] || 0) + 1 });
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  modal(`<h2>Libro mastro</h2><p class="sub">${S.libro.length ? `${S.libro.length} ricette in archivio.` : 'Il Libro mastro è vuoto.'} Qui puoi importare nuove ricette, togliere quelle di un libro o svuotare tutto per ricaricare i file da capo.</p>
  <button class="bp wide" id="lai">Importa ricette (PDF o file .json)</button>
  ${rows.length ? `<h3>Per libro</h3><div class="card">${rows.map(([f, n], i) => `<div class="ri"><span class="rn"><b>${esc(f)}</b><small>${n} ${n === 1 ? 'ricetta' : 'ricette'}</small></span><button class="lnk" data-lf="${i}" style="color:var(--bad)">Togli</button></div>`).join('')}</div>
  <p style="margin-top:16px"><button class="bd wide" id="lall">Svuota il Libro mastro</button></p>` : ''}`, m => {
    m.querySelector('#lai').onclick = () => ricFileModal();
    m.querySelectorAll('[data-lf]').forEach(b => b.onclick = () => { const f = rows[+b.dataset.lf][0]; libroClear(f === 'Senza fonte' ? '\u0000' : f) });
    const la = m.querySelector('#lall'); if (la) la.onclick = () => libroClear('');
  })
}
function libroClear(fonte) {
  const L = S.libro.filter(r => !fonte || (fonte === '\u0000' ? !r.fonte : r.fonte === fonte)); if (!L.length) return; if (fonte === '\u0000') fonte = 'senza fonte';
  modal(`<h2>${fonte ? 'Togliere queste ricette?' : 'Svuotare il Libro mastro?'}</h2><p class="sub">${fonte ? `Tolgo dal Libro mastro le <b>${L.length}</b> ricette di <b>${esc(fonte)}</b>.` : `Tolgo tutte le <b>${L.length}</b> ricette del Libro mastro.`} Le ricette che hai già salvato tra le tue Ricette restano. Subito dopo puoi ancora annullare.</p><div class="acts"><button class="bg" data-act="close">Annulla</button><button class="bd" id="lcgo">${fonte ? 'Togli' : 'Svuota'}</button></div>`, m => {
    m.querySelector('#lcgo').onclick = () => { const old = L.map(r => ({ ...r })); delMany('libro', L.map(r => r.id)); close(); logA(fonte ? `ha tolto dal Libro mastro le ricette di ${fonte}` : 'ha svuotato il Libro mastro'); toast(`${L.length} ricette tolte`, () => saveMany('libro', old)); if (S.rf) S.rf.fonte = '' };
  })
}
function del(c, id) { S[KEY[c]] = S[KEY[c]].filter(x => x.id !== id); render(); if (F) F.fs.deleteDoc(dref(c, id)).catch(werr) }
function setPres(date, mid, patch) { const k = date + '_' + mid; S.pres[k] = { ...(S.pres[k] || {}), ...patch, date, mid }; render(); if (F) F.fs.setDoc(dref('presenze', k), { ...patch, date, mid }, { merge: true }).catch(werr) }
function setMenu(k, mk, val) {
  const cur = { ...(S.menu[k] || {}), date: k }; let pkm = null;
  if (val && Array.isArray(val.items)) { pkm = {}; val = { ...val, items: val.items.map(({ picks, ...x }) => { if ((picks || []).length) pkm[x.id] = Object.fromEntries(picks.map(m => [m, true])); return x }) }; cur.pk = { ...(cur.pk || {}), [mk]: pkm } }
  if (val) cur[mk] = val; else delete cur[mk]; S.menu[k] = cur; render();
  if (F) F.fs.setDoc(dref('menu', k), { date: k, [mk]: val || F.fs.deleteField(), ...(pkm ? { pk: { [mk]: pkm } } : {}) }, { mergeFields: ['date', mk, ...(pkm ? ['pk.' + mk] : [])] }).catch(werr)
}
// dati del pasto che non sono piatti (ospiti, chi cucina): scritti campo per campo
function setMeal(k, field, mk, v) { S.menu[k] = { ...(S.menu[k] || {}), date: k, [field]: { ...((S.menu[k] || {})[field] || {}), [mk]: v } }; render(); if (F) F.fs.setDoc(dref('menu', k), { date: k, [field]: { [mk]: v == null ? F.fs.deleteField() : v } }, { merge: true }).catch(werr) }
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
  const ux = x.ux ?? (!!x.unit && x.unit !== 'pz'); const isNewName = !S.disp.some(d => same(d.name, x.name));
  if (!x.scad && isNewName) { const sd = shelfDays(x.name, x.luogo || guessLuogo(x.name)); if (sd && !prof(x.name).lv) x = { ...x, scad: plusDays(sd), scadStima: true } }
  const lvEx = S.disp.find(d => isLv(d) && same(d.name, x.name));
  if (lvEx) { const eu = lvEx.unit || 'conf'; const c = x.qty != null && ux ? conv(x.name, x.qty, x.unit, eu) : null; const add = c != null ? c : (isPack(eu) ? (x.qty || 1) : 1); const was = zero(lvEx) ? 0 : (lvEx.qty ?? 1); save('dispensa', lvEx.id, { ...lvEx, qty: round(was + add), lvl: was ? lvEx.lvl || 'pieno' : 'pieno', scad: x.scad || lvEx.scad || '' }); return }
  const f = fitProf(x.name, x.qty, x.unit || 'pz', ux);
  if (isNewName && f.lv) { save('dispensa', null, { name: x.name, qty: f.qty, unit: f.unit, track: 'livello', lvl: 'pieno', luogo: x.luogo || guessLuogo(x.name), cat: CAT_L[x.cat] ? x.cat : guessCat(x.name), scad: x.scad || '' }); askProf(x.name); return }
  // stesso prodotto già in casa: sommo, convertendo se l'unità è diversa
  const cands = S.disp.filter(d => !isLv(d) && same(d.name, x.name) && (!x.luogo || d.luogo === x.luogo));
  for (const ex of cands) { const add = conv(x.name, f.qty, f.unit, ex.unit || 'pz'); if (add == null) continue; const qty = ex.qty == null ? f.qty : round(Math.max(0, ex.qty) + add); save('dispensa', ex.id, { ...ex, qty, scad: x.scad || (zero(ex) ? '' : ex.scad) || '', scadStima: x.scad ? !!x.scadStima : !!ex.scadStima }); return }
  save('dispensa', null, { name: x.name, qty: f.qty ?? null, unit: f.unit, luogo: x.luogo || guessLuogo(x.name), cat: CAT_L[x.cat] ? x.cat : guessCat(x.name), scad: x.scad || '', scadStima: !!x.scadStima }); askProf(x.name)
}

/* ---------- render ---------- */
function render() {
  const ready = S.phase === 'ready';
  const me = members().find(m => m.id === S.me);
  $('#who').hidden = !ready; document.querySelector('.gear').hidden = !ready;
  $('#who').innerHTML = me ? `<span class="av on" style="--c:${me.color};width:34px;height:34px">${esc(ini(me.name))}</span>${esc(me.name)}` : 'Chi sei?';
  $('#nav').hidden = !ready; $('#v-setup').hidden = ready;
  TABS.forEach(t => { $('#v-' + t).hidden = !ready || t !== S.tab });
  $('#note').innerHTML = (S.update ? '<p class="note upd">È disponibile una nuova versione dell\'app.<button class="sm on" data-act="reload">Aggiorna</button></p>' : '') + (S.note ? `<p class="note">${esc(S.note)}</p>` : '');
  if (!ready) return renderSetup();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === S.tab));
  const n = S.spesa.filter(x => !x.done).length; $('#bdg').hidden = !n; $('#bdg').textContent = n;
  const ex = S.disp.filter(d => d.scad && !zero(d) && daysTo(d.scad) <= 2).length; $('#bdgd').hidden = !ex; $('#bdgd').textContent = ex;
  fillKnown(); if (S.shop) drawShop();
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
    $('#mk').onclick = async e => { e.target.disabled = true; $('#ferr').textContent = 'Creo la famiglia…'; try { const X = await ensureFirebase(); const code = randCode(); await X.fs.setDoc(X.fs.doc(X.db, 'famiglie', code), { members: members(), created: Date.now(), dataV: DATA_V, lastBackup: Date.now() }); LS.set('fam', code); S.fam = code; S.created = true; connect() } catch (err) { console.warn(err); e.target.disabled = false; $('#ferr').textContent = fbMsg(err) } };
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
  const brief = k === t ? dayBrief() : ''; h += brief;
  if (soon.length && !brief) h += `<button class="alert" data-act="tab" data-v="dispensa"><b>Da usare presto</b>${soon.map(x => `${esc(x.name)} <small>(${scadTxt(x.scad)})</small>`).join(', ')}</button>`;
  h += MEALS.map(([mk, ml]) => {
    const home = M.filter(m => pres(k, m.id)[mk] !== false); const items = mealItems(k, mk); const osp = ospOf(k, mk), chef = M.find(m => m.id === chefOf(k, mk)); const warn = items.length ? tasteWarn(k, mk, items) : [];
    return `<section class="mc${mk === nextMk ? ' next' : ''}${k < t ? ' past' : ''}"><header><span class="mt2">${ml}</span>${mk === nextMk ? '<span class="badge">Prossimo</span>' : ''}${isRico(k, mk) ? `<span class="badge rico" title="Si ripete ogni ${WDL[dowOf(k)]}">${IC.rep}ogni ${WD[dowOf(k)].toLowerCase()}</span>` : ''}<span class="cnt">${home.length + osp ? `${home.length + osp} a tavola` : 'nessuno a casa'}</span>${items.length ? `<button class="lnk" data-act="menu" data-d="${k}" data-meal="${mk}">Modifica</button>` : ''}</header>
    ${items.length ? menuBlock(k, mk, items, M) : `<div class="mline"><button class="madd" data-act="menu" data-d="${k}" data-meal="${mk}">+ Cosa si mangia?</button>${mk === nextMk && gkey() ? '<button class="lnk" data-act="ai">Idee</button>' : ''}</div>`}
    <div class="avs">${M.map(m => { const on = pres(k, m.id)[mk] !== false; return `<button class="av${on ? ' on' : ''}" style="--c:${m.color}" data-act="tog" data-d="${k}" data-m="${m.id}" data-meal="${mk}" aria-pressed="${on}" aria-label="${esc(m.name)}: ${on ? 'a casa' : 'fuori'}"><span>${esc(ini(m.name))}</span><small>${esc(m.name)}</small></button>` }).join('')}</div>
    ${warn.length ? `<p class="twarn">${warn.map(esc).join('<br>')}</p>` : ''}
    <div class="mfoot"><button data-act="osp" data-d="${k}" data-meal="${mk}" class="${osp ? 'on' : ''}">${osp ? `+ ${osp} ${osp === 1 ? 'ospite' : 'ospiti'}` : '+ Ospiti'}</button><button data-act="chef" data-d="${k}" data-meal="${mk}" class="${chef ? 'on' : ''}">${chef ? `Cucina ${esc(chef.name)}` : 'Chi cucina?'}</button></div></section>`
  }).join('');
  const imps = M.flatMap(m => (pres(k, m.id).imp || []).map((x, i) => ({ ...x, m, i }))).sort((a, b) => (a.ora || '99').localeCompare(b.ora || '99'));
  h += `<section class="mc"><header><span class="mt2">Impegni</span><button class="lnk" data-act="imp" data-d="${k}" style="margin-left:auto">+ Aggiungi</button></header>${imps.length ? `<ul class="imps">${imps.map(x => `<li><i style="background:${x.m.color}"></i>${x.ora ? `<span class="t">${esc(x.ora)}</span>` : ''}<span><b>${esc(x.m.name)}</b> · ${esc(x.testo)}</span><button class="x" data-act="delimp" data-d="${k}" data-m="${x.m.id}" data-i="${x.i}" aria-label="Elimina impegno">×</button></li>`).join('')}</ul>` : '<p class="sub" style="margin:2px 0 0">Nessun impegno. Chi esce a mangiare può segnarlo qui.</p>'}</section>`;
  h += `<div class="plan"><button class="bg" data-act="plan">${IC.star}Proponi il menù della settimana</button><button class="bg" data-act="miss">${IC.cart}Cosa manca per il menù</button></div>`;
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
    return `<button class="ri" data-act="dedit" data-id="${d.id}"><span class="rn"><b>${esc(d.name)}</b>${bits.length ? `<small>${bits.join(' · ')}</small>` : ''}</span><span class="rq">${isLv(d) ? `${lvBar(d)}${lvQty(d)}` : d.unit === 'qb' || d.qty == null ? '' : fmtQ(d.qty, d.unit)}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`
  };
  const sec = (id, title, n, body, cls = '') => { const closed = !q && S.fold.includes(id); return `<section class="grp ${cls}${closed ? ' closed' : ''}"><h3 data-act="fold" data-v="${id}">${title} <small>${n}</small>${IC.chev}</h3><div class="card">${body}</div></section>` };
  let h = '';
  const mig = S.disp.filter(d => !isLv(d) && !d.trackSet && !zero(d) && prof(d.name).lv);
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
  const v = S.rview || 'ricette'; const ev = v === 'mangiati', pr = v === 'proposte', lb = v === 'libro';
  $('#rseg').innerHTML = [['ricette', 'Ricette', S.ric.length], ['libro', 'Libro', S.libro.length], ['proposte', 'Proposte', PROPS.length], ['mangiati', 'Mangiati', Object.keys(S.piatti || {}).length]].map(([k, l, c]) => `<button class="${v === k ? 'on' : ''}" data-act="rview" data-v="${k}">${l} <small>${c}</small></button>`).join('');
  $('#rfil').innerHTML = ev ? '' : filterBar(lb ? 'libro' : pr); $('#rq').placeholder = ev ? 'Cerca un piatto…' : 'Cerca per nome o ingrediente…';
  if (ev) return renderEaten(); if (pr) return renderProps(); if (lb) return renderLibro();
  const L = applyFilters(S.ric, false); const f = S.rf || {}; const nc = S.ric.filter(r => !r.tipo).length;
  $('#rlist').innerHTML = (f.tipo && nc && gkey() ? `<li class="pcl"><button class="lnk" data-act="rclass">${nc === 1 ? '1 ricetta non ha' : nc + ' ricette non hanno'} il tipo: classificale con Gemini</button></li>` : '') + (L.length ? L.map(({ r, m }) => `<li class="rc"><button data-act="ropen" data-id="${r.id}"><b>${esc(r.name)}</b><span class="meta">${[r.tempo ? esc(r.tempo) + ' min' : '', esc(r.porz || 4) + ' porzioni', esc(COURSE_L[tipoOf(r)] || ''), isVeg(r) ? 'vegetariana' : '', r.fonte ? esc(r.fonte) : ''].filter(Boolean).join(' · ')}</span><span class="bar"><i style="width:${m.tot ? Math.round(m.ok / m.tot * 100) : 100}%"></i></span><span class="mt">${m.miss.length ? `Hai ${m.ok} ingredienti su ${m.tot}. Mancano: ${m.miss.slice(0, 4).map(i => esc(i.n)).join(', ')}${m.miss.length > 4 ? '…' : ''}` : 'Hai tutto per farla'}</span></button></li>`).join('')
    : `<li class="empty">${S.ric.length ? 'Nessuna ricetta con questi filtri.' : 'Nessuna ricetta ancora. Tocca + per scriverne una, importarla o trovarne su GialloZafferano e Cucchiaio d\'Argento.'}</li>`)
}

const AISLE = ['verdura', 'frutta', 'carbo', 'proteine', 'latticini', 'condimenti', 'dolci', 'bevande', 'altro'];
function renderSpesa() {
  const open = S.spesa.filter(x => !x.done), done = S.spesa.filter(x => x.done);
  const row = x => `<li class="sp${x.done ? ' done' : ''}"><label><input type="checkbox" data-sp="${x.id}" ${x.done ? 'checked' : ''}><span><b>${esc(x.name)}</b> <span class="q">${fmtQ(x.qty, x.unit)}</span>${x.from ? `<small>per ${esc(x.from)}</small>` : ''}</span></label><button class="x" data-act="spdel" data-id="${x.id}" aria-label="Togli ${esc(x.name)}">×</button></li>`;
  // proposte: finiti in dispensa + cose che comprate spesso
  const inList = n => S.spesa.some(x => !x.done && same(x.name, n));
  const fin = S.disp.filter(d => zero(d) && !d.avanzo && !inList(d.name)).map(d => ({ name: d.name, unit: spesaUnit(d.name), why: 'finito' }));
  const freq = Object.values(S.stats || {}).filter(v => v && v.n >= 2 && v.name && !inList(v.name) && !fin.some(f => same(f.name, v.name)) && !S.disp.some(d => same(d.name, v.name) && !zero(d) && !(isLv(d) && d.lvl === 'poco'))).sort((a, b) => b.n - a.n).slice(0, 8).map(v => ({ name: v.name, unit: v.unit, why: 'spesso' }));
  const sugg = [...fin, ...freq].slice(0, 10);
  let h = sugg.length ? `<li class="sugg"><span>${fin.length ? 'Finiti o comprati spesso' : 'Comprati spesso'}</span><div>${sugg.map((x, i) => `<button class="igs${x.why === 'finito' ? ' fin' : ''}" data-act="spq" data-i="${i}">+ ${esc(x.name)}</button>`).join('')}</div></li>` : '';
  S._sugg = sugg;
  if (!S.spesa.length) h += '<li class="empty">La lista è vuota. Aggiungi a mano, dalle ricette con "Metti in spesa", o tocca le proposte qui sopra.</li>';
  const groups = AISLE.map(c => [c, open.filter(x => catOf(x) === c).sort((a, b) => (a.ts || 0) - (b.ts || 0))]).filter(g => g[1].length);
  h += groups.map(([c, L]) => `<li class="sph">${CAT_L[c]} <small>${L.length}</small></li>${L.map(row).join('')}`).join('');
  if (done.length) h += `<li class="sph">Nel carrello <small>${done.length}</small></li>${done.map(row).join('')}`;
  $('#slist').innerHTML = h;
  const chi = members().find(m => m.id === S.spesaChi); $('#spchi').innerHTML = chi ? `Va ${esc(chi.name)}` : 'Chi va?'; $('#spchi').classList.toggle('on', !!chi);
  const mo = today().slice(0, 7), ms = S.spese.filter(x => x.month === mo);
  $('#spm').innerHTML = `<button class="spm" data-act="spese"><span><small>Spese di ${esc(new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date()))}</small><b>${eur(ms.reduce((a, x) => a + (x.total || 0), 0))}</b></span><span class="sub" style="margin:0">${ms.length ? ms.length + (ms.length === 1 ? ' scontrino' : ' scontrini') : 'Fotografa gli scontrini per tenerne il conto'}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`;
  $('#spf').innerHTML = done.length ? `<button class="bp" data-act="sp2disp">Metti in dispensa i presi (${done.length})</button><button class="bg" data-act="spclear">Togli i presi</button>` : ''
}

/* ---------- modals ---------- */
// Le finestre aggiungono un passo nella cronologia: il tasto "indietro" del telefono le chiude invece di uscire dall'app
let modalPushed = false, ignorePop = false, modalCleanup = null;
function modal(html, mount) {
  if (modalCleanup) { const c = modalCleanup; modalCleanup = null; c() }
  const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="sx" data-act="close" aria-label="Chiudi">×</button>${html}</div>`;
  if (!modalPushed) { history.pushState({ modal: 1 }, '', location.hash || '#' + S.tab); modalPushed = true }
  m.hidden = false; m.scrollTop = 0; mount && mount(m)
}
function hideModal() { if (modalCleanup) { const c = modalCleanup; modalCleanup = null; c() } const m = $('#modal'); m.hidden = true; m.innerHTML = '' }
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

function bulkModal() {
  modal(`<h2>Aggiungi più cose</h2><p class="sub">Una per riga. Se c'è già, la quantità si somma.</p><form id="f"><label>Cosa c'è<textarea name="t" rows="8" placeholder="2 l latte&#10;500 g pasta&#10;6 uova&#10;mozzarella"></textarea></label>
  <label>Dove<select name="l"><option value="">Lo decide l'app per ognuna</option>${LUOGHI.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>${acts('Aggiungi')}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const L = parseMany(E(f, 't').value); const l = E(f, 'l').value; logA('ha aggiunto in dispensa: ' + listTxt(L.map(x => x.n))); L.forEach(x => mergeDisp({ name: x.n, qty: x.u === 'qb' ? null : x.q, unit: x.u === 'qb' ? 'pz' : x.u, ux: x.ux && x.u !== 'qb', luogo: l })); close(); toast(`${L.length} cose aggiunte`) }
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
  ${r.url && /^https:\/\//.test(r.url) ? `<p class="srclnk"><a href="${esc(r.url)}" target="_blank" rel="noopener">Apri la ricetta originale${r.fonte ? ' su ' + esc(r.fonte) : ''} ↗</a></p>` : ''}
  <div id="ask"></div>
  <h3>Mettila nel menu</h3><div class="row"><select id="md" aria-label="Giorno">${opts}</select><select id="mm" aria-label="Pasto">${MEALS.map(([k, l]) => `<option value="${k}"${k === 's' ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="bg" id="madd">Aggiungi</button></div>
  <div class="acts"><button class="bd" id="del">Elimina</button><button class="bg" id="kp">Manda a Keep</button><button class="bg" id="ed">Modifica</button><button class="bp" id="cook">L'ho cucinata</button></div>`, m => {
    const q = s => m.querySelector(s);
    q('#dn').onclick = () => ricModal(id, n - 1); q('#up').onclick = () => ricModal(id, n + 1);
    if (q('#miss')) q('#miss').onclick = () => { addToSpesa(need.map(x => ({ name: x.i.n, qty: x.s.need.q == null ? null : round(x.s.need.q), unit: x.s.need.u, from: r.name }))); toast(`Aggiunti ${need.length} alla spesa`); ricModal(id, n) };
    q('#madd').onclick = () => { addDish(q('#md').value, q('#mm').value, { id: rid(), t: r.name, rid: r.id, alt: false, course: '', picks: [] }); toast('Messa nel menu') };
    q('#ed').onclick = () => ricEdit(r);
    askBox(q('#ask'), 'r:' + id, () => r, { label: 'Sostituisci la ricetta', apply: x => { const y = toRic(x); const { veg, ...r1 } = r; save('ricette', r.id, { ...r1, name: y.name || r.name, porz: y.porz || r.porz, tempo: y.tempo || r.tempo, ingr: y.ingr.length ? y.ingr : r.ingr, passi: y.passi || r.passi }); toast('Ricetta aggiornata'); ricModal(id) } });
    q('#kp').onclick = () => shareText(r.name, recipeText(r, n));
    q('#cook').onclick = () => { let c = 0; const ask = st.filter(({ s }) => isLv(s.it)).map(({ s }) => s.it.id); st.forEach(({ i, s }) => { const it = s.it; if (!it || isLv(it) || i.q == null) return; const nq = consume(it, i.q * f, i.u); if (nq == null) return; save('dispensa', it.id, { ...it, qty: nq }); c++ }); bumpDishes([{ t: r.name, rid: r.id }]); close(); if (ask.length) levelAsk(ask); toast(c ? `Dispensa aggiornata: ${c} ingredienti scalati` : ask.length ? 'Dimmi com\'è rimasto quello che misuri per livello' : 'Niente da scalare in dispensa') };
    q('#del').onclick = () => { close(); delU('ricette', id, r.name) }
  })
}

function ricEdit(r, fresh) {
  const isNew = !r || !!fresh; r = r || { name: '', porz: 4, tempo: '', ingr: [], passi: '', tags: [] };
  modal(`<h2>${isNew ? 'Nuova ricetta' : 'Modifica ricetta'}</h2><form id="f"><label>Nome<input name="nome" required value="${esc(r.name)}" autocomplete="off"></label>
  <div class="row"><label>Porzioni<input name="porz" type="number" min="1" inputmode="numeric" value="${esc(r.porz || 4)}"></label><label>Tempo (min)<input name="tempo" type="number" min="0" inputmode="numeric" value="${esc(r.tempo || '')}"></label></div>
  <label>Ingredienti <small>uno per riga, es. "200 g pasta", "2 uova", "sale q.b."</small><textarea name="ingr" rows="7">${esc((r.ingr || []).map(lineOf).join('\n'))}</textarea></label>
  <label>Preparazione <small>un passaggio per riga</small><textarea name="passi" rows="6">${esc(r.passi || '')}</textarea></label>
  <label>Tipo<select name="tipo"><option value="">—</option>${TIPI.map(([k, l]) => `<option value="${k}"${tipoOf(r) === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
  <label>Etichette <small>separate da virgola</small><input name="tags" value="${esc((r.tags || []).join(', '))}" placeholder="veloce, vegetariano, dolce" autocomplete="off"></label>${acts()}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const id = save('ricette', isNew ? null : r.id, { name: E(f, 'nome').value.trim(), porz: +E(f, 'porz').value || 4, tempo: +E(f, 'tempo').value || '', ingr: E(f, 'ingr').value.split('\n').map(parseLine).filter(Boolean).map(({ ux, ...i }) => i), passi: E(f, 'passi').value.trim(), tags: E(f, 'tags').value.split(',').map(s => s.trim()).filter(Boolean), tipo: E(f, 'tipo').value, ...(r && r.url ? { url: r.url, fonte: r.fonte || '' } : {}) }); ricModal(id) }
  })
}

/* ---------- Gemini (facoltativo) ---------- */
const GBASE = 'https://generativelanguage.googleapis.com/v1beta/';
async function gErr(r) { let m = ''; try { m = (await r.json()).error.message || '' } catch (e) { } const k = /api key|api_key|permission|denied/i.test(m); if (r.status === 429 || (r.status === 400 && /grounding|search|billing|tool/i.test(m))) { const e = new Error(/quota|limit|billing|exhaust|tier/i.test(m) ? 'limite della chiave gratuita raggiunto (' + (m.split('\n')[0].slice(0, 120) || '429') + ')' : 'troppe richieste a Gemini, riprova tra un minuto'); e.quota = true; return e } return new Error(r.status === 429 ? 'troppe richieste a Gemini, riprova tra un minuto' : r.status === 503 ? 'Gemini 503: modello sovraccarico' : k ? 'chiave Gemini non valida o non abilitata' : `Gemini ${r.status}${m ? ': ' + m : ''}`) }
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
  LS.set('gauto2', { list, t: Date.now(), old: cand.filter(x => x.v < 3).map(x => x.n).slice(0, 3) }); return list
}
async function gfetch(url, body, ms, init) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, init ? { ...init, signal: ac.signal } : body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac.signal } : { signal: ac.signal }) }
  catch (e) { const x = new Error(e.name === 'AbortError' ? 'Gemini non risponde (tempo scaduto)' : 'nessuna connessione'); x.timeout = e.name === 'AbortError'; throw x }
  finally { clearTimeout(t) }
}
async function gemini(parts, onModel, opts = {}) {
  let list = await modelList(false), last = null, refreshed = false;
  const pref = LS.get('gok', ''); if (pref && list.includes(pref)) list = [pref, ...list.filter(m => m !== pref)];
  if (opts.tools && opts.tools.some(t => t.google_search) && !isCustom()) { const old = (LS.get('gauto2', {}) || {}).old || []; list = [...new Set([...old, ...list])] }
  let quota = null;
  for (let i = 0; i < list.length; i++) {
    const model = list[i]; onModel && onModel(model);
    let r; const url = `${GBASE}models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(gkey())}`;
    const gc = opts.tools || opts.raw ? {} : { responseMimeType: 'application/json' }; const body = () => ({ contents: [{ role: 'user', parts }], generationConfig: gc, ...(opts.tools ? { tools: opts.tools } : {}) });
    const v = parseFloat((model.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
    if (v >= 3 && !/lite/.test(model)) gc.thinkingConfig = { thinkingLevel: 'minimal' }; // risposte rapide, senza "ragionamento" lungo
    try {
      r = await gfetch(url, body(), opts.ms || (opts.tools ? 45000 : 30000));
      if (r.status === 400 && gc.thinkingConfig) { delete gc.thinkingConfig; r = await gfetch(url, body(), opts.ms || (opts.tools ? 45000 : 30000)) }
    } catch (e) { last = e; continue }
    if (r.status === 404 && !refreshed && !isCustom()) { refreshed = true; LS.del('gauto2'); list = await modelList(true); i = -1; continue }
    if ([429, 500, 503, 504].includes(r.status) || (r.status === 400 && opts.tools)) { last = await gErr(r); if (last.quota) quota = last; continue }
    if (!r.ok) throw await gErr(r);
    const j = await r.json(); const t = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
    if (!t) { last = new Error('Gemini non ha risposto (' + (j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'vuoto') + ')'); continue }
    if (!opts.tools) LS.set('gok', model); if (opts.raw) return t;
    const a = t.indexOf('{'), b = t.lastIndexOf('}'); return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t)
  }
  if (quota) throw quota;
  throw new Error(last && /503|429|high demand|troppe/i.test(last.message) ? 'Gemini in questo momento è sovraccarico su tutti i modelli: riprova tra qualche minuto' : (last && last.message) || 'Gemini non risponde')
}

const AI_SITES = { 'giallozafferano.it': 'GialloZafferano', 'cucchiaio.it': 'Cucchiaio d\'Argento' };
const AI_CHIPS = ['Primo', 'Secondo', 'Piatto unico', 'Contorno', 'Dolce', 'Veloce', 'Vegetariano', 'Pesce', 'Leggero', 'Al forno', 'Economico', 'Per ospiti'];
const AI_SPUNTI = ['un piatto della tradizione veneta', 'un primo di pesce', 'qualcosa al forno', 'una zuppa o vellutata', 'un piatto vegetariano', 'un piatto della cucina siciliana', 'un secondo di carne', 'un risotto', 'un piatto unico', 'un piatto leggero', 'una ricetta della cucina pugliese', 'un piatto con i legumi', 'una torta salata', 'un piatto della cucina emiliana', 'un secondo di pesce', 'un contorno sfizioso', 'una ricetta toscana', 'un piatto con le uova', 'una pasta al forno', 'un piatto della cucina romana', 'un dolce semplice', 'un piatto di stagione', 'una ricetta della cucina napoletana', 'un piatto con le patate'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a };
function siteOf(u) { try { const h = new URL(u).hostname.replace(/^www\./, ''); const k = Object.keys(AI_SITES).find(d => h === d || h.endsWith('.' + d)); return k ? AI_SITES[k] : '' } catch (e) { return '' } }
function siteSearch(name, fonte) { const d = /cucchiaio/i.test(fonte || '') ? 'cucchiaio.it' : 'giallozafferano.it'; return 'https://www.google.com/search?q=' + encodeURIComponent(name + ' site:' + d) }

let AI_RES = { all: [], np: 4, v: '', chips: [], focus: '' };
function aiModal() {
  if (!gkey()) { modal(`<h2>Trova ricette</h2><p class="sub">Per cercare ricette su GialloZafferano e Cucchiaio d'Argento, o farle inventare, serve Gemini, che è gratuito. Attivalo dalle impostazioni e torna qui.</p><div class="acts"><button class="bg" data-act="close">Chiudi</button><button class="bp" data-act="settings">Impostazioni</button></div>`); return }
  const n0 = heads(today(), 's') || 4;
  const st = { src: LS.get('aisrc') || 'siti', mode: LS.get('aimode') || 'libero', cnt: +LS.get('aicnt') || 6, chips: new Set(AI_RES.chips), shown: [], all: AI_RES.all, busy: false };
  const seg = (id, opts, cur) => `<div class="segc${opts.length > 2 ? ' seg3' : ''}" id="${id}">${opts.map(([k, l]) => `<button type="button" data-k="${k}" class="${String(k) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  modal(`<h2>Trova ricette</h2><p class="sub">Ricette vere da GialloZafferano e Cucchiaio d'Argento, dal vostro Libro mastro, oppure idee inventate da Gemini. Ogni volta che cerchi escono ricette nuove.</p><form id="f">
  <label>Da dove?</label>${seg('src', [['siti', 'Siti di cucina'], ['libro', 'Libro mastro'], ['gemini', 'Inventate']], st.src)}<p class="hint" id="srch"></p>
  <label>Cosa cerchi? <small>facoltativo</small><input name="v" placeholder="Es. lasagne, qualcosa con la zucca, cena veloce" autocomplete="off"></label>
  <div class="chips" id="ch">${AI_CHIPS.map(c => `<button type="button" class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <label>Con quali ingredienti?</label>${seg('mode', [['libero', 'Qualsiasi'], ['misto', 'Quello che c\'è + poco da comprare'], ['solo', 'Solo quello che c\'è']], st.mode)}
  <p class="hint" id="mh"></p>
  <div class="row"><label>Persone<input name="n" type="number" min="1" inputmode="numeric" value="${n0}"></label><label>Quante ricette?${seg('cnt', [[3, '3'], [6, '6'], [10, '10']], st.cnt)}</label></div>
  <button class="bp wide" id="go">Cerca ricette</button></form><div id="out"></div><div id="more"></div>`, m => {
    const q = s => m.querySelector(s); const out = q('#out'), more = q('#more');
    const MH = { libero: 'Ricette di ogni tipo, senza guardare cosa c\'è in casa. Quello che manca lo metti in spesa con un tocco.', misto: 'Soprattutto con quello che avete, al massimo 2 o 3 cose da comprare.', solo: 'Niente da comprare: solo dispensa e frigo, più sale, pepe e olio.' };
    const segWire = (id, key, ls, after) => m.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => { st[key] = id === 'cnt' ? +b.dataset.k : b.dataset.k; LS.set(ls, st[key]); m.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); after && after() });
    const hint = () => { q('#mh').textContent = MH[st.mode] };
    const SRCH = { siti: 'GialloZafferano e Cucchiaio d\'Argento.', libro: () => S.libro.length ? `Tra le ${S.libro.length} ricette dei vostri PDF e quaderni.` : 'Il Libro mastro è vuoto: importa un PDF da "Tante ricette insieme".', gemini: 'Ricette inventate da Gemini.' }; const srch = () => { const v = SRCH[st.src]; q('#srch').textContent = typeof v === 'function' ? v() : v }; segWire('src', 'src', 'aisrc', srch); srch(); segWire('mode', 'mode', 'aimode', hint); segWire('cnt', 'cnt', 'aicnt'); hint();
    m.querySelectorAll('#ch .chip').forEach(b => b.onclick = () => { const c = b.dataset.c; st.chips.has(c) ? st.chips.delete(c) : st.chips.add(c); b.classList.toggle('on', st.chips.has(c)) });

    const pantryTxt = full => S.disp.filter(d => !zero(d)).map(d => full ? `- ${d.name}${d.qty != null && !isLv(d) ? ` (${fmtQ(d.qty, d.unit)})` : ''}${d.scad ? `, scade il ${d.scad}` : ''}` : d.name).join(full ? '\n' : ', ') || '(niente)';
    const buildPrompt = (np, want, k) => {
      const recent = [...new Set([...st.shown, ...(LS.get('aiseen') || [])])].slice(0, 80);
      const spunti = shuffle(AI_SPUNTI).slice(0, 4).join('; ');
      let p = `Oggi è il ${today()} (${MESI[new Date().getMonth()]}). Servono ${k} ricette diverse tra loro, per ${np} persone, per una famiglia italiana.\n`;
      if (want) p += `Cosa cercano: ${want}.\n`; else p += `Non hanno chiesto niente di preciso: varia molto (tipi di piatto, regioni, cotture). Per esempio puoi spaziare tra: ${spunti}. Preferisci ingredienti di stagione.\n`;
      if (st.mode === 'libero') p += 'Non preoccuparti di cosa c\'è in casa: la famiglia farà la spesa. Scegli liberamente.\n';
      else if (st.mode === 'misto') p += `In casa hanno:\n${pantryTxt(true)}\nUsa soprattutto questi ingredienti; ogni ricetta può richiedere al massimo 2 o 3 ingredienti da comprare. Dai la precedenza a quelli che scadono prima.\n`;
      else p += `In casa hanno:\n${pantryTxt(true)}\nOgni ricetta deve usare SOLO questi ingredienti, più eventualmente sale, pepe, acqua e olio. Dai la precedenza a quelli che scadono prima.\n`;
      if (tastesText()) p += `Gusti da rispettare: ${tastesText()}.\n`;
      if (recent.length) p += `NON proporre queste ricette, già viste: ${recent.join('; ')}.\n`;
      return p
    };
    const FMT = '{"ricette":[{"nome":"...","fonte":"GialloZafferano o Cucchiaio d\'Argento o vuoto","url":"https://... o vuoto","porzioni":4,"tempo":30,"ingredienti":[{"n":"nome in minuscolo","q":200,"u":"g"}],"tipo":"antipasto o primo o secondo o contorno o unico o dolce","veg":true,"perche":"una frase breve"}]} dove "u" è uno tra g, kg, ml, l, pz, cucchiai, cucchiaini, spicchi, fette, qb e "q" è un numero o null';
    const viaTavily = async (np, want, k, base) => {
      const seenU = new Set([...(LS.get('aiurls', []) || []), ...st.all.map(r => r.url).filter(Boolean)]);
      const mods = ['', 'facile', 'veloce', 'della tradizione', 'al forno', 'leggera', 'sfiziosa', 'della nonna', 'di stagione', 'economica'];
      let q = want;
      if (!q && st.mode !== 'libero') { const pick = [...S.disp].filter(d => !zero(d) && !STAPLES.includes(norm(d.name))).sort((a, b) => String(a.scad || '9').localeCompare(String(b.scad || '9'))).slice(0, 6); const two = shuffle(pick.slice(0, 4)).slice(0, 2).map(d => d.name); if (two.length) q = 'con ' + two.join(' e ') }
      if (!q) q = shuffle(AI_SPUNTI)[0].replace(/^(un|una|qualcosa)\s+/i, '');
      if (st.all.length) q += ' ' + mods[1 + Math.floor(Math.random() * (mods.length - 1))];
      const res = (await tavily('ricetta ' + q, Math.max(10, k * 2 + 2))).filter(x => RECIPE_URL.test(x.url) && !seenU.has(x.url));
      if (!res.length) return [];
      const pages = res.slice(0, Math.min(12, k + 4)).map((x, i) => `### PAGINA ${i + 1}\nURL: ${x.url}\nTITOLO: ${x.title}\n${x.text.replace(/\s+/g, ' ').slice(0, 5500)}`).join('\n\n');
      const r = await gemini([{ text: `Qui sotto ci sono pagine di ricette prese da GialloZafferano e dal Cucchiaio d'Argento.\n${base}\nTra queste pagine scegli le ${k} ricette più adatte (al massimo ${k}; salta le pagine che non contengono una ricetta). Per ognuna estrai nome, url (copialo esatto dalla pagina), fonte ("GialloZafferano" o "Cucchiaio d'Argento"), porzioni, tempo totale in minuti, ingredienti con quantità e passi del procedimento COME SONO SCRITTI NELLA PAGINA, senza inventare niente.\nRispondi SOLO con JSON in questa forma: ${FMT.replace('"perche"', '"passi":["..."],"perche"')}\n\n${pages}` }]);
      const ok = new Set(res.map(x => x.url));
      const R = ((r && r.ricette) || []).filter(x => x && x.nome).map(x => ({ ...x, url: ok.has(String(x.url || '').trim()) ? String(x.url).trim() : '' }));
      LS.set('aiurls', [...R.map(x => x.url).filter(Boolean), ...(LS.get('aiurls', []) || [])].slice(0, 200));
      return R
    };
    const CHT = { Primo: 'primo', Secondo: 'secondo', 'Piatto unico': 'unico', Contorno: 'contorno', Dolce: 'dolce' };
    const pickLibro = async (k, base) => {
      if (!S.libro.length) throw new Error('il Libro mastro è vuoto: importa prima un PDF da "Tante ricette insieme"');
      const tipi = [...st.chips].map(c => CHT[c]).filter(Boolean);
      let L = S.libro.filter(r => !st.all.some(o => o.lib === r.id));
      if (tipi.length) L = L.filter(r => tipi.includes(tipoOf(r)));
      if (st.chips.has('Vegetariano')) L = L.filter(isVeg); if (st.chips.has('Veloce')) L = L.filter(r => !r.tempo || +r.tempo <= 35); if (st.chips.has('Pesce')) L = L.filter(r => /pesce|tonno|salmon|merluzz|gamber|cozz|vongol|calamar|baccal|orata|branzin|acciug|polp|seppi/.test(norm(r.name + ' ' + (r.ingr || []).map(i => i.n).join(' '))));
      if (st.mode === 'solo') L = L.filter(r => !match(r).miss.length);
      const words = norm(E(q('#f'), 'v').value).split(' ').filter(w => w.length > 3 && !STOPW.includes(w));
      if (words.length) { const hit = L.filter(r => words.some(w => norm(r.name + ' ' + (r.ingr || []).map(i => i.n).join(' ')).includes(w.slice(0, -1)))); if (hit.length) L = hit }
      if (!L.length) return [];
      L = shuffle(L); if (st.mode !== 'libero') L.sort((a, b) => match(a).miss.length - match(b).miss.length); L = L.slice(0, 180);
      const wrap = (r, why) => ({ ...r, lib: r.id, pid: 'L' + r.id, why: why || '' });
      if (L.length <= k) return L.map(r => wrap(r));
      const list = L.map((r, i) => `${i}. ${r.name} [${COURSE_L[tipoOf(r)] || '-'}${r.tempo ? ', ' + r.tempo + ' min' : ''}] ${(r.ingr || []).slice(0, 8).map(x => x.n).join(', ')}`).join('\n');
      const res = await gemini([{ text: `${base}\nScegli le ${k} ricette più adatte SOLO da questo elenco, che è il ricettario della famiglia (indica i numeri). Varia il più possibile.\n${list}\nRispondi SOLO con JSON: {"scelte":[{"i":0,"perche":"una frase breve"}]}` }]);
      const seen = new Set(); return ((res && res.scelte) || []).map(x => ({ r: L[+x.i], why: x.perche })).filter(x => x.r && !seen.has(x.r.id) && seen.add(x.r.id)).slice(0, k).map(x => wrap(x.r, x.why))
    };
    const ask = async (np, want, k) => {
      const base = buildPrompt(np, want, k);
      if (st.src === 'libro') return pickLibro(k, base);
      if (st.src === 'gemini') { const r = await gemini([{ text: 'Sei un cuoco di casa italiano. ' + base + '\nPer ogni ricetta scrivi anche i passaggi in "passi" (lista di frasi). Rispondi SOLO con JSON in questa forma: ' + FMT.replace('"perche"', '"passi":["..."],"perche"') }]); return (r && r.ricette) || (Array.isArray(r) ? r : []) }
      st.fb = false; st.tav = false; st.terr = '';
      if (tkey()) {
        try { const R = await viaTavily(np, want, k, base); if (R.length) { st.tav = true; return R } st.terr = 'Tavily non ha trovato ricette per questa richiesta' }
        catch (e) { console.warn('tavily', e); st.terr = e.message || String(e) }
      }
      const known = `Proponi ricette che sono davvero pubblicate su GialloZafferano o sul Cucchiaio d'Argento e che conosci bene: usa il nome della ricetta come compare sul sito e indica il sito in "fonte". ${base}\nRiporta porzioni e ingredienti come li indica il sito, e il tempo totale in minuti. Lascia "url" vuoto.\nRispondi SOLO con JSON in questa forma: ${FMT}`;
      if (Date.now() - (LS.get('nogrd', 0) || 0) > 864e5) {
        const sp = `Cerca con Google ricette VERE pubblicate su giallozafferano.it (anche ricette.giallozafferano.it) o su cucchiaio.it. ${base}\nPer ogni ricetta trovata riporta il nome esatto della ricetta sul sito, il sito, l'indirizzo esatto della pagina (solo se lo hai visto nei risultati, altrimenti lascialo vuoto: non inventarlo), le porzioni e gli ingredienti come li indica il sito, il tempo totale in minuti.\nRispondi SOLO con JSON in questa forma: ${FMT}`;
        try {
          const t = await gemini([{ text: sp }], null, { tools: [{ google_search: {} }], raw: true });
          const a = t.indexOf('{'), b = t.lastIndexOf('}');
          try { const r = JSON.parse(t.slice(a, b + 1)); if ((r.ricette || []).length) return r.ricette }
          catch (e) { const r = await gemini([{ text: 'Trasforma questo elenco di ricette in JSON, senza inventare niente. Rispondi SOLO con JSON in questa forma: ' + FMT + '\n\n' + t.slice(0, 15000) }]); if (r && (r.ricette || []).length) return r.ricette }
        } catch (e) { console.warn('ricerca google', e); if (e.quota) LS.set('nogrd', Date.now()) }
      }
      st.fb = true; const r = await gemini([{ text: known }]); return ((r && r.ricette) || []).map(x => ({ ...x, url: '' }))
    };
    const toR = (x, np) => { const r = toRic(x); r.porz = +x.porzioni || np; r.why = String(x.perche || ''); r.tags = ['idea']; r.tipo = TIPI.some(([k]) => k === x.tipo) ? x.tipo : ''; if (typeof x.veg === 'boolean') r.veg = x.veg; r.pid = rid(); r.ts = Date.now();
      if (st.src === 'siti') { const u = String(x.url || '').trim(); const ok = /^https:\/\//.test(u) && siteOf(u); r.fonte = ok ? siteOf(u) : (/cucchiaio/i.test(x.fonte || '') ? 'Cucchiaio d\'Argento' : 'GialloZafferano'); r.url = ok ? u : ''; r.link = ok ? u : siteSearch(r.name, r.fonte) }
      else r.fonte = ''; return r };
    const real = r => r.lib ? (S.libro.find(x => x.id === r.lib) || r) : r;
    const card = (r, j) => { const mi = match(r).miss; const tot = match(r).tot; const o = real(r);
      return `<div class="idea" id="pc_${esc(r.pid)}"><button class="iopen" data-open="${j}"><span class="ih">${srcBadge(o)}${r.tempo ? `<span class="tm">${esc(r.tempo)} min</span>` : ''}</span><h4>${esc(r.name)}</h4>${r.why ? `<p class="why">${esc(r.why)}</p>` : ''}
      <p>${(r.ingr || []).map(i => esc(i.n)).join(', ')}</p><p class="${mi.length ? 'miss' : 'okm2'}">${mi.length ? `Da comprare (${mi.length} su ${tot}): ${mi.map(i => esc(i.n)).join(', ')}` : 'Hai tutto in casa'}</p></button>
      <div class="row"><button class="bg" data-open="${j}">Vedi la ricetta</button><button class="${propSaved(o) ? 'bg' : 'bp'}" data-save="${j}">${propSaved(o) ? 'Salvata ✓' : 'Salva'}</button></div></div>` };
    const draw = np => {
      AI_RES.np = np;
      out.innerHTML = st.all.length ? `<h3>${st.all.length === 1 ? "1 ricetta" : st.all.length + " ricette"}</h3>${st.fb && st.src === 'siti' ? `<p class="hint warnbox">${st.terr ? 'Tavily: ' + esc(st.terr) + '. ' : ''}Ti propongo ricette famose di GialloZafferano e Cucchiaio d'Argento che Gemini conosce. Con "Cerca sul sito" apri la ricetta originale.${tkey() ? '' : ' Per cercare le ricette vere sui siti, aggiungi la chiave gratuita di Tavily nelle Impostazioni.'}</p>` : ''}<p class="hint">${st.src === 'libro' ? 'Vengono dal Libro mastro: tocca una ricetta per vederla, chiedere varianti e salvarla tra le tue Ricette se ti piace.' : 'Tocca una ricetta per vederla, chiedere varianti e decidere se salvarla. Le ritrovi tutte in Ricette → Proposte.'}</p>` + st.all.map(card).join('') : '';
      out.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const r = st.all[+b.dataset.open]; AI_RES.focus = r.pid; AI_RES.v = E(q('#f'), 'v').value; AI_RES.chips = [...st.chips]; if (r.lib) propModal(r.lib, () => aiModal(), 'libro'); else propModal(r.pid, () => aiModal()) });
      out.querySelectorAll('[data-save]').forEach(b => b.onclick = () => { const r = st.all[+b.dataset.save], o = real(r); if (propSaved(o)) { AI_RES.focus = r.pid; ricModal(o.rid); return } saveProp(o, b) });
      more.innerHTML = st.all.length ? `<button class="bg wide" id="again">Altre ${st.cnt} ricette</button>` : '';
      if (q('#again')) q('#again').onclick = () => run(true)
    };
    const run = async append => {
      if (st.busy) return; st.busy = true; const f = q('#f'); const np = +E(f, 'n').value || n0;
      const want = [E(f, 'v').value.trim(), ...st.chips].filter(Boolean).join(', ');
      if (!append) { st.all.length = 0; out.innerHTML = '' }
      more.innerHTML = `<p class="load">${st.src === 'libro' ? 'Cerco nel Libro mastro…' : st.src === 'siti' ? (tkey() ? 'Cerco su GialloZafferano e Cucchiaio d\'Argento con Tavily e leggo le ricette…' : 'Cerco su GialloZafferano e Cucchiaio d\'Argento…') : 'Sto pensando a cosa potete cucinare…'}</p>`; q('#go').disabled = true;
      try {
        const arr = await ask(np, want, st.cnt);
        let R = st.src === 'libro' ? arr : arr.filter(x => x && x.nome).map(x => toR(x, np)).filter(r => !st.all.some(o => norm(o.name) === norm(r.name))).map(propUpsert);
        if (st.mode !== 'libero') R.sort((a, b) => match(a).miss.length - match(b).miss.length);
        st.all.push(...R); st.shown.push(...R.map(r => r.name)); LS.set('aiseen', [...R.map(r => r.name), ...(LS.get('aiseen') || [])].slice(0, 60));
        draw(np); if (!R.length) more.innerHTML = '<p class="load">Non ho trovato niente di nuovo: prova a cambiare richiesta.</p>' + more.innerHTML;
        else if (!append) out.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (err) { console.warn(err); more.innerHTML = `<p class="load">Non è andata: ${esc(err.message || err)}.${st.src === 'siti' ? ' Puoi riprovare, oppure scegliere "Inventate da Gemini".' : ''}</p>` + (st.all.length ? `<button class="bg wide" id="again">Riprova</button>` : ''); if (q('#again')) q('#again').onclick = () => run(true) }
      st.busy = false; q('#go').disabled = false
    };
    q('#f').onsubmit = e => { e.preventDefault(); run(false) };
    if (st.all.length) { E(q('#f'), 'v').value = AI_RES.v || ''; m.querySelectorAll('#ch .chip').forEach(b => b.classList.toggle('on', st.chips.has(b.dataset.c))); E(q('#f'), 'n').value = AI_RES.np; draw(AI_RES.np); more.innerHTML = `<button class="bg wide" id="again">Altre ${st.cnt} ricette</button>`; q('#again').onclick = () => run(true); const fc = AI_RES.focus && m.querySelector('#pc_' + CSS.escape(AI_RES.focus)); if (fc) setTimeout(() => fc.scrollIntoView({ block: 'center' }), 30) }
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
    const qm = l.match(/^(\d{1,2})\s*[xX*]\s*(?:€\s*)?(\d+[.,]\d{2})/); if (qm) { const n = +qm[1], tot = n * parseFloat(qm[2].replace(',', '.')); if (last && !last.multSet && Math.abs(tot - last.price) < 0.03) { last.mult = n; last.multSet = true; last = null } else pend = n; continue }
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
  <h3>Famiglia</h3><div class="acts-l" style="margin-top:0"><button class="act" id="ab"><span class="ai">${IC.cal}</span><span><b>Abitudini</b><small>Chi di solito c'è o non c'è, giorno per giorno</small></span></button><button class="act" id="ac"><span class="ai">${IC.hist}</span><span><b>Attività recenti</b><small>Chi ha fatto cosa negli ultimi 7 giorni</small></span></button><button class="act" id="gu"><span class="ai">${IC.users}</span><span><b>Gusti</b><small>Cosa non mangia ognuno</small></span></button><button class="act" id="nm"><span class="ai">${IC.pen}</span><span><b>Nomi</b><small>Cambia i nomi della famiglia</small></span></button></div>
  <h3>Libro mastro</h3><div class="acts-l" style="margin-top:0"><button class="act" id="lbm"><span class="ai">${IC.rec}</span><span><b>Gestisci il Libro mastro</b><small>${S.libro.length ? S.libro.length + ' ricette · importa, togli un libro o svuota tutto' : 'Vuoto · importa ricette da PDF o file'}</small></span></button></div>
  <h3>Sicurezza dei dati</h3><div class="acts-l" style="margin-top:0"><button class="act" id="bk"><span class="ai">${IC.shield}</span><span><b>Backup e ripristino</b><small>${S.famRaw && S.famRaw.lastBackup ? 'Ultima copia automatica: ' + new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(new Date(S.famRaw.lastBackup)) : 'Scarica una copia o torna a una precedente'}</small></span></button></div>
  <h3>Gemini <small style="font-weight:400;color:var(--mut)">facoltativo</small></h3><p class="sub">Con una chiave gratuita di Google Gemini l'app legge meglio gli scontrini e propone ricette con quello che avete. Creala su <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. L'app la usa per leggere scontrini e foto, proporre ricette e menù e capire i prodotti che non conosce.</p>
  <form id="gf"><label>Chiave API<input name="k" type="password" autocomplete="off" value="${esc(gkey())}" placeholder="AIza…"></label><label>Modello <small>lascia vuoto: lo sceglie l'app</small><input name="m" value="${esc(LS.get('gmodel', '') === 'gemini-2.5-flash' ? '' : LS.get('gmodel', ''))}" placeholder="automatico${LS.get('gok', '') ? ' (ora ' + esc(LS.get('gok', '')) + ')' : ''}" autocomplete="off"></label><label class="ck"><input type="checkbox" name="sh"${S.famKey ? ' checked' : ''}> Usala per tutta la famiglia <small style="font-weight:400;color:var(--mut)">così gli altri non devono inserirla</small></label><p class="hint" id="gres">${S.famKey && !LS.get('gkey', '') ? 'Stai usando la chiave condivisa dalla famiglia.' : ''}</p><div class="acts">${gkey() ? '<button type="button" class="bd" id="gdel">Togli la chiave</button>' : ''}<button type="button" class="bg" id="gtest">Prova</button><button class="bp">Salva</button></div></form>
  <h3>Ricette dai siti <small style="font-weight:400;color:var(--mut)">facoltativo</small></h3><p class="sub">Con una chiave gratuita di Tavily l'app cerca le ricette vere su GialloZafferano e Cucchiaio d'Argento, con il link giusto. Sono 1.000 ricerche gratis al mese: ogni "Cerca ricette" ne usa una. Creala su <a href="https://app.tavily.com" target="_blank" rel="noopener">app.tavily.com</a> (serve anche Gemini).</p>
  <form id="tf"><label>Chiave Tavily<input name="k" type="password" autocomplete="off" value="${esc(tkey())}" placeholder="tvly-…"></label><label class="ck"><input type="checkbox" name="sh"${S.famTkey ? ' checked' : ''}> Usala per tutta la famiglia</label>
  <details class="more"><summary>Indirizzo intermedio (solo se serve)</summary><label>Indirizzo<input name="px" value="${esc(LS.get('tproxy', ''))}" placeholder="https://…workers.dev" autocomplete="off"></label><p class="hint">Lascialo vuoto. Serve solo se il telefono non riesce a collegarsi a Tavily.</p></details>
  <p class="hint" id="tres">${S.famTkey && !LS.get('tkey', '') ? 'Stai usando la chiave condivisa dalla famiglia.' : ''}</p><div class="acts">${tkey() ? '<button type="button" class="bd" id="tdel">Togli</button>' : ''}<button type="button" class="bg" id="ttest">Prova</button><button class="bp">Salva</button></div></form>
  <h3>Questo telefono</h3><button class="bg wide" id="tr">Rivedi la guida iniziale</button><p style="margin:10px 0 0"><button class="bd" id="out" style="margin:0">Esci dalla famiglia su questo telefono</button></p><p class="hint">Versione ${APP_V}</p>`, m => {
    m.querySelector('#inv').onclick = () => shareText('Cosa si mangia?', 'Entra nella nostra app della cucina: ' + inviteLink());
    m.querySelector('#nm').onclick = namesModal; m.querySelector('#ab').onclick = () => habitsModal(); m.querySelector('#ac').onclick = activityModal; m.querySelector('#gu').onclick = tastesModal; m.querySelector('#bk').onclick = backupModal; m.querySelector('#lbm').onclick = libroAdmin; m.querySelector('#tr').onclick = () => tourModal();
    const gsave = f => { const key = E(f, 'k').value.trim(), sh = E(f, 'sh').checked; LS.set('gkey', key); LS.set('gmodel', E(f, 'm').value.trim()); LS.del('gauto2'); LS.del('gok'); if (F && (sh ? key !== S.famKey : !!S.famKey)) { S.famKey = sh ? key : ''; F.fs.setDoc(famRef(), { gkey: sh && key ? key : F.fs.deleteField() }, { merge: true }).catch(werr) } };
    m.querySelector('#gf').onsubmit = e => { e.preventDefault(); gsave(e.target); close(); render(); toast(gkey() ? 'Gemini attivo' : 'Salvato') };
    m.querySelector('#gtest').onclick = async () => { const f = m.querySelector('#gf'), out = m.querySelector('#gres'); gsave(f); if (!gkey()) { out.textContent = 'Incolla prima la chiave.'; return } out.textContent = 'Provo…'; try { const r = await gemini([{ text: 'Rispondi solo con JSON: {"ok":true}' }], md => out.textContent = `Provo con ${md}…`); out.textContent = r && r.ok ? `Funziona, modello ${LS.get('gok', '')}.` : 'Risposta strana, ma la chiave funziona.'; render() } catch (err) { out.textContent = 'Non funziona: ' + (err.message || err) } };
    const tsave = f => { const key = E(f, 'k').value.trim(), sh = E(f, 'sh').checked; LS.set('tkey', key); LS.set('tproxy', E(f, 'px').value.trim()); LS.del('nogrd'); if (F && (sh ? key !== S.famTkey : !!S.famTkey)) { S.famTkey = sh ? key : ''; F.fs.setDoc(famRef(), { tkey: sh && key ? key : F.fs.deleteField() }, { merge: true }).catch(werr) } };
    m.querySelector('#tf').onsubmit = e => { e.preventDefault(); tsave(e.target); close(); toast(tkey() ? 'Ricerca sui siti attiva' : 'Salvato') };
    m.querySelector('#ttest').onclick = async () => { const f = m.querySelector('#tf'), out = m.querySelector('#tres'); tsave(f); if (!tkey()) { out.textContent = 'Incolla prima la chiave.'; return } out.textContent = 'Provo…'; try { const r = await tavily('ricetta carbonara', 5); const n = r.filter(x => RECIPE_URL.test(x.url)).length; out.textContent = n ? `Funziona: trovate ${n} ricette sui siti.` : `Funziona, ma non ho trovato ricette (${r.length} risultati).` } catch (err) { out.textContent = 'Non funziona: ' + (err.message || err) } };
    const td = m.querySelector('#tdel'); if (td) td.onclick = () => { LS.del('tkey'); if (F && S.famTkey) { S.famTkey = ''; F.fs.setDoc(famRef(), { tkey: F.fs.deleteField() }, { merge: true }).catch(werr) } close() };
    const gd = m.querySelector('#gdel'); if (gd) gd.onclick = () => { LS.del('gkey'); if (F && S.famKey) { S.famKey = ''; F.fs.setDoc(famRef(), { gkey: F.fs.deleteField() }, { merge: true }).catch(werr) } close(); render() };
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
    mm.querySelectorAll('[data-me]').forEach(b => b.onclick = () => { S.me = b.dataset.me; LS.set('me', S.me); render(); if (S.created) { S.created = false; toast('Ora invita gli altri dalle impostazioni') } if (!LS.get('tour', 0)) tourModal(); else close() }); mm.querySelector('#nm').onclick = namesModal
  })
}
function namesModal() {
  const M = members(); modal(`<h2>La famiglia</h2><p class="sub">I nomi li vedono tutti.</p><form id="f">${M.map((m, i) => `<label><span><span class="dot" style="background:${m.color}"></span>Persona ${i + 1}</span><input name="n${i}" value="${esc(m.name)}" required autocomplete="off"></label>`).join('')}${acts()}</form>`, mm => {
    mm.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const mem = M.map((m, i) => ({ id: m.id, name: E(f, 'n' + i).value.trim() || m.name, color: m.color })); S.members = mem; close(); render(); if (F) F.fs.setDoc(famRef(), { members: mem }, { merge: true }).catch(werr); if (!S.me) whoModal() }
  })
}

let tt; function toast(t, undo) {
  const el = $('#toast'); el.innerHTML = `<span>${esc(t)}</span>${undo ? '<button id="tundo">Annulla</button>' : ''}`; el.classList.toggle('act', !!undo);
  if (undo) el.querySelector('#tundo').onclick = () => { el.classList.remove('show'); undo() };
  el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), undo ? 6500 : 2800)
}
// elimina con possibilità di ripensarci
function delU(c, id, what) { const old = S[KEY[c]].find(x => x.id === id); if (!old) return; del(c, id); const { id: _i, ...data } = old; toast(`${what || old.name || 'Elemento'}: eliminato`, () => save(c, id, data)) }
function go(t) { if (!TABS.includes(t)) t = 'settimana'; if (t === S.tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return } S.tab = t; history.pushState(null, '', '#' + t); render(); window.scrollTo(0, 0) }

/* ---------- backup e ripristino ---------- */
const BK_COLS = ['dispensa', 'ricette', 'libro', 'spesa', 'spese', 'presenze', 'menu', 'stats', 'attivita'];
const runAll = async jobs => { for (let i = 0; i < jobs.length; i += 20) await Promise.all(jobs.slice(i, i + 20).map(j => j())) };
async function buildBackup(light) {
  const { fs } = F; const out = { app: 'cosa-si-mangia', v: APP_V, at: Date.now(), fam: {}, cols: {} };
  const g = await fs.getDoc(famRef()); out.fam = g.exists() ? g.data() : {}; delete out.fam.gkey; delete out.fam.tkey;
  for (const c of BK_COLS) { if (light && c === 'attivita') continue; const s = await fs.getDocs(col(c)); out.cols[c] = {}; s.docs.forEach(d => out.cols[c][d.id] = d.data()) }
  return out
}
async function downloadBackup() {
  try {
    toast('Preparo il backup…'); const b = await buildBackup(); const name = `cosa-si-mangia-backup-${today()}.json`;
    const blob = new Blob([JSON.stringify(b)], { type: 'application/json' }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    const n = Object.values(b.cols).reduce((t, c) => t + Object.keys(c).length, 0); toast(`Backup scaricato: ${name} (${n} elementi)`)
  } catch (e) { console.warn(e); toast('Backup non riuscito: ' + fbMsg(e)) }
}
// copia di sicurezza dentro Firebase, a pezzi per stare sotto il limite di dimensione dei documenti
async function autoBackup(why) {
  const { fs } = F; const s = JSON.stringify(await buildBackup(true)); const stamp = Date.now(); const SZ = 350000, N = Math.ceil(s.length / SZ) || 1;
  for (let i = 0; i < N; i++) await fs.setDoc(dref('backup', `${stamp}_${i}`), { stamp, i, n: N, why, s: s.slice(i * SZ, (i + 1) * SZ) });
  await fs.setDoc(famRef(), { lastBackup: stamp }, { merge: true });
  const all = await fs.getDocs(col('backup')); const meta = new Map(); all.docs.forEach(d => { const v = d.data(); meta.set(v.stamp, v.why) });
  const keepAlways = [...meta].filter(([, w]) => /aggiornamento/.test(w || '')).map(([st]) => st).sort((a, b) => b - a).slice(0, 1);
  const rolling = [...meta.keys()].filter(st => !keepAlways.includes(st)).sort((a, b) => b - a); const drop = new Set(rolling.slice(4));
  await runAll(all.docs.filter(d => drop.has(d.data().stamp)).map(d => () => fs.deleteDoc(dref('backup', d.id))));
  return stamp
}
async function listBackups() {
  const all = await F.fs.getDocs(col('backup')); const by = new Map();
  all.docs.forEach(d => { const v = d.data(); if (!by.has(v.stamp)) by.set(v.stamp, { stamp: v.stamp, why: v.why, n: v.n, parts: [] }); by.get(v.stamp).parts[v.i] = v.s });
  return [...by.values()].filter(b => b.parts.filter(Boolean).length === b.n).sort((a, b) => b.stamp - a.stamp)
}
async function applyBackup(b) {
  const { fs } = F; if (!b || b.app !== 'cosa-si-mangia' || !b.cols) throw new Error('questo file non è un backup di Cosa si mangia?');
  await autoBackup('prima del ripristino');
  for (const c of Object.keys(b.cols)) {
    if (!BK_COLS.includes(c)) continue; const keep = b.cols[c] || {}; const cur = await fs.getDocs(col(c));
    await runAll(cur.docs.filter(d => !(d.id in keep)).map(d => () => fs.deleteDoc(dref(c, d.id))));
    await runAll(Object.entries(keep).map(([id, v]) => () => fs.setDoc(dref(c, id), v)))
  }
  const fam = { ...(b.fam || {}), dataV: DATA_V, lastBackup: Date.now() }; if (S.famKey) fam.gkey = S.famKey; if (S.famTkey) fam.tkey = S.famTkey; if (!fam.members) fam.members = members();
  await fs.setDoc(famRef(), fam)
}
let maintained = false;
async function maintain(v) {
  if (maintained || !F) return; maintained = true;
  try {
    if ((v.dataV || 1) < DATA_V) { await autoBackup('prima dell\'aggiornamento alla versione ' + APP_V); await F.fs.setDoc(famRef(), { dataV: DATA_V }, { merge: true }) }
    else if (Date.now() - (v.lastBackup || 0) > 7 * 864e5) await autoBackup('settimanale')
  } catch (e) { console.warn('backup automatico', e) }
}
function backupModal() {
  const df = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  modal(`<h2>Backup</h2><p class="sub">Una copia di tutto: dispensa, ricette, menù, spesa, spese, abitudini. Ogni settimana l'app ne salva una da sola e tiene le ultime 4.</p>
  <div class="acts-l" style="margin-top:0"><button class="act" id="bdl"><span class="ai">${IC.down}</span><span><b>Scarica un backup</b><small>Un file da tenere dove vuoi</small></span></button><label class="act" style="cursor:pointer"><span class="ai">${IC.share}</span><span><b>Ripristina da un file</b><small>Rimette i dati com'erano nel backup</small></span><input type="file" id="bup" accept="application/json,.json" hidden></label></div>
  <h3>Copie automatiche</h3><div id="bl"><p class="load">Carico…</p></div><p class="err" id="berr"></p>`, async m => {
    const err = t => { const e = m.querySelector('#berr'); if (e) e.textContent = t };
    const restore = async (b, label) => {
      modal(`<h2>Ripristinare?</h2><p class="sub">I dati di tutta la famiglia tornano com'erano nel backup <b>${esc(label)}</b>. Quello che avete aggiunto dopo viene tolto. Prima salvo una copia della situazione di adesso, così puoi tornare indietro.</p><p class="err" id="rerr"></p><div class="acts"><button class="bg" data-act="close">Annulla</button><button class="bp" id="rgo">Ripristina</button></div>`, mm => {
        mm.querySelector('#rgo').onclick = async e => { e.target.disabled = true; e.target.textContent = 'Ripristino…'; try { await applyBackup(b); logA('ha ripristinato il backup ' + label); close(); toast('Dati ripristinati') } catch (x) { console.warn(x); e.target.disabled = false; e.target.textContent = 'Ripristina'; mm.querySelector('#rerr').textContent = 'Non riuscito: ' + (x.message || fbMsg(x)) } }
      })
    };
    m.querySelector('#bdl').onclick = downloadBackup;
    m.querySelector('#bup').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const b = JSON.parse(await f.text()); if (b.app !== 'cosa-si-mangia') throw new Error('x'); restore(b, 'del ' + df.format(new Date(b.at))) } catch (x) { err('Questo file non è un backup di Cosa si mangia?') } };
    try {
      const L = await listBackups(); const el = m.querySelector('#bl'); if (!el) return;
      el.innerHTML = L.length ? `<div class="card">${L.map((b, i) => `<div class="ri"><span class="rn"><b>${esc(df.format(new Date(b.stamp)))}</b><small>${esc(b.why || '')}</small></span><button class="sm" data-bk="${i}">Ripristina</button></div>`).join('')}</div>` : '<p class="sub">Ancora nessuna. La prima si crea da sola entro una settimana.</p><button class="bg" id="bnow">Creane una adesso</button>';
      el.querySelectorAll('[data-bk]').forEach(x => x.onclick = () => { const b = L[+x.dataset.bk]; try { restore(JSON.parse(b.parts.join('')), 'del ' + df.format(new Date(b.stamp))) } catch (e2) { err('Questa copia è rovinata.') } });
      const bn = el.querySelector('#bnow'); if (bn) bn.onclick = async () => { bn.disabled = true; try { await autoBackup('manuale'); backupModal() } catch (x) { err(fbMsg(x)) } }
    } catch (x) { err(fbMsg(x)) }
  })
}

/* ---------- schede di consumo: come si compra, come si usa, quanto a testa ---------- */
// parole chiave | unità in dispensa | quanta ce n'è in una confezione | nome della confezione | unità d'uso | dose a testa | 1 = per livello
const PROD_T = `
pasta,spaghetti,penne,pennette,fusilli,rigatoni,maccheroni,tagliatelle,linguine,farfalle,bucatini,orecchiette,conchiglie,ditalini,pastina,lasagne|g|500|pacchi|g|80|
riso|g|1000|pacchi|g|70|
gnocchi|g|500|conf|g|200|
tortellini,ravioli,cappelletti,agnolotti|g|250|conf|g|125|
cous cous,couscous,orzo,farro,quinoa,bulgur|g|500|pacchi|g|70|
polenta|g|500|pacchi|g|80|
spatzle|g|500|conf|g|150|
pane|pz||pz|fette|2|1
pancarre,pan bauletto,pane in cassetta,pan carre|conf||conf|fette|2|1
panini|pz||pz|pz|1|
piadine,piadina,tortillas|pz|5|conf|pz|1|
fette biscottate|conf||conf|fette|3|1
biscotti|conf||conf|pz|4|1
cracker,crackers,grissini,taralli|conf||conf|pz|1|1
cereali,muesli,fiocchi d avena,avena,corn flakes|conf||conf|g|40|1
farina|pacchi||pacchi|g||1
zucchero|pacchi||pacchi|cucchiai|1|1
sale,pepe,spezie,origano,rosmarino,paprika,curry,cannella,noce moscata,peperoncino,basilico secco,dado,lievito,bicarbonato,cacao|conf||conf|qb||1
olio|bottiglie||bottiglie|cucchiai|1|1
aceto|bottiglie||bottiglie|cucchiai||1
maionese,ketchup,senape,salsa|conf||conf|cucchiai||1
latte|l|1|bottiglie|ml|200|
yogurt|vasetti||conf|vasetti|1|
uova,uovo|pz|6|conf|pz|2|
burro|conf||conf|g|10|1
mozzarella,mozzarelle,burrata|pz||conf|pz|0.5|
parmigiano,grana,pecorino,formaggio grattugiato|conf||conf|cucchiai|1|1
formaggio,formaggi,scamorza,asiago,fontina,emmental,provola,gorgonzola,feta|conf||conf|g|50|1
ricotta,stracchino,crescenza,mascarpone,philadelphia,robiola|conf||conf|g|60|
panna|conf||conf|ml|50|
prosciutto,salame,speck,bresaola,mortadella,affettato,affettati,pancetta|g|100|conf|g|40|
wurstel|pz|4|conf|pz|2|
pollo,petto di pollo,tacchino,carne,manzo,maiale,vitello,bistecca,bistecche,macinato,arrosto,cotolette,salsiccia,salsicce|g|||g|150|
hamburger|pz|2|conf|pz|1|
pesce,salmone,merluzzo,orata,branzino,gamberi,calamari,sgombro|g|||g|150|
bastoncini|pz|12|conf|pz|4|
tonno|scatole||scatole|scatole|0.5|
ceci,fagioli,lenticchie,legumi,piselli,mais|barattoli||barattoli|barattoli|0.5|
passata,passata di pomodoro,pelati,polpa di pomodoro,salsa di pomodoro|bottiglie||bottiglie|bottiglie|0.25|
sugo,pesto,ragu|vasetti||vasetti|vasetti|0.25|
marmellata,confettura,miele,nutella,crema spalmabile,burro di arachidi|vasetti||vasetti|cucchiai|1|1
te,the,tisana,tisane,camomilla,infuso|bustine|20|scatole|bustine|1|
caffe|conf||conf|cucchiai|1|1
capsule,cialde|pz|10|conf|pz|1|
zucchine,zucchina,carote,carota,pomodori,pomodoro,cetrioli,cetriolo,finocchi,finocchio,porri,porro|pz|||pz|1|
peperoni,peperone,melanzane,melanzana,cavolfiore,broccoli,broccolo,zucca,verza,cavolo|pz|||pz|0.5|
cipolle,cipolla,aglio|pz|||pz|0.25|
patate,patata|kg|||g|200|
insalata,lattuga,rucola,spinaci,radicchio,valeriana,bietole|conf||conf|conf|0.25|
funghi,fagiolini,asparagi,carciofi|g|||g|100|
mele,mela,banane,banana,arance,arancia,pere,pera,kiwi,pesche,pesca,mandarini,mandarino,clementine,albicocche,cachi,fichi|pz|||pz|1|
limoni,limone,avocado,melone,anguria,ananas|pz|||pz|0.25|
fragole,uva,ciliegie,mirtilli,lamponi,prugne|g|||g|150|
noci,mandorle,nocciole,frutta secca|conf||conf|g|20|1
acqua|bottiglie|6|conf|ml||
succo,birra,vino,bibita,coca cola,aranciata,spremuta|bottiglie||bottiglie|ml|200|
gelato|conf||conf|g|80|1
cioccolato,cioccolata,merendine,patatine,snack,wafer,caramelle|conf||conf|pz|1|1
`;
const PROD = PROD_T.trim().split('\n').map(l => { const [k, u, pack, pu, use, per, lv] = l.split('|'); return { keys: k.split(',').map(x => norm(x)), u, pack: +pack || null, pu: pu || '', use: use || u, per: per ? +per : null, lv: lv === '1' } });
function dictProf(name) {
  const n = ' ' + norm(name) + ' '; const toks = norm(name).split(' '); let best = null, len = 0;
  for (const p of PROD) for (const k of p.keys) {
    let sc = 0; if (k.includes(' ')) { if (n.includes(' ' + k + ' ')) sc = k.length + (n.startsWith(' ' + k + ' ') ? 10 : 0) }
    else toks.forEach((t, i) => { const ex = t === k, st = k.length >= 5 && stem(t) === stem(k); if (ex || st) sc = Math.max(sc, k.length + (ex ? .5 : 0) + (i === 0 ? 10 : 0)) });
    if (sc > len) { best = p; len = sc }
  }
  return best
}
const pkey = n => norm(n).replace(/ /g, '_');
// la scheda di un prodotto: prima quello che la famiglia ha corretto, poi il dizionario, poi un'ipotesi
function prof(name) {
  const l = (S.prof || {})[pkey(name)]; const d = dictProf(name);
  const base = d ? { u: d.u, pack: d.pack, pu: d.pu, use: d.use, per: d.per, lv: d.lv } : { u: 'pz', pack: null, pu: '', use: 'pz', per: null, lv: guessTrack(name) === 'livello', unknown: true };
  return l ? { ...base, ...l, unknown: false } : base
}
function learnProf(name, patch) {
  const k = pkey(name); if (!k) return; const cur = prof(name); const ch = {}; for (const [f, v] of Object.entries(patch)) if (v !== undefined && cur[f] !== v) ch[f] = v;
  if (!Object.keys(ch).length) return; S.prof = { ...(S.prof || {}), [k]: { ...((S.prof || {})[k] || {}), ...ch } };
  if (F) F.fs.setDoc(dref('stats', 'profili'), { p: { [k]: ch } }, { merge: true }).catch(werr)
}
const conv2 = (q, from, to) => { if (from === to) return q; const [a, ba] = toBase(q, from), [one, bb] = toBase(1, to); return ba === bb && BASE[from] && BASE[to] ? a / one : null };
// converte una quantità tra unità diverse dello stesso prodotto (g↔kg, confezioni↔pezzi, pacchi↔grammi…); null se non si può
function conv(name, q, from, to) {
  from = from || 'pz'; to = to || 'pz'; if (q == null) return null; const d = conv2(q, from, to); if (d != null) return d;
  const p = prof(name); if (!p.pack) return null;
  if (isPack(from) && from !== p.u) { const r = conv2(q * p.pack, p.u, to); if (r != null) return r }
  if (isPack(to) && to !== p.u) { const r = conv2(q, from, p.u); if (r != null) return r / p.pack }
  return null
}
// quello che l'utente ha scritto → quantità e unità "giuste" per quel prodotto
function fitProf(name, q, u, ux) {
  const p = prof(name);
  if (p.lv) return { lv: true, unit: ux && LV_UNITS.includes(u) && u !== 'pz' ? u : (!p.unknown && LV_UNITS.includes(p.u) ? p.u : 'conf'), qty: q ?? 1 };
  if (!ux) { if (q == null) return { qty: !isPack(p.u) && p.pack ? p.pack : 1, unit: p.u }; return { qty: !isPack(p.u) && p.pack ? round(q * p.pack) : q, unit: p.u } }
  if (conv2(q ?? 1, u, p.u) != null) return { qty: q ?? 1, unit: u };
  if (p.pack && isPack(u) && u !== p.u) return { qty: round((q ?? 1) * p.pack), unit: p.u };
  return { qty: q ?? 1, unit: u }
}
// dose proposta per un piatto: quanto serve per n persone, nell'unità in cui si usa
function doseFor(d, n) {
  const p = prof(d.name); const stock = typeof d.qty === 'number' ? d.qty : null;
  if (p.per) { let q = round(p.per * n), u = p.use; if (isPack(u) || u === 'pz') q = Math.max(1, Math.ceil(q - 1e-9)); const inStock = conv(d.name, q, u, d.unit); if (inStock != null && stock != null && inStock > stock) { const back = conv(d.name, stock, d.unit, u); if (back != null) q = round(back) } return { q, u } }
  const u = d.unit || 'pz'; const v = u === 'g' ? 80 * n : u === 'ml' ? 100 * n : u === 'kg' ? .08 * n : u === 'l' ? .1 * n : 1; return { q: round(stock != null ? Math.min(stock, v) : v), u }
}
// per i prodotti che il dizionario non conosce, chiede a Gemini (se attivo) e se lo ricorda
let profQ = [], profT = null;
function askProf(name) { if (!gkey() || !prof(name).unknown || profQ.includes(name)) return; profQ.push(name); clearTimeout(profT); profT = setTimeout(runProf, 2500) }
async function runProf() {
  const names = profQ.splice(0, 12); if (!names.length) return;
  try {
    const r = await gemini([{ text: `Sei l'assistente di una dispensa di casa italiana. Per ognuno di questi prodotti: ${JSON.stringify(names)} dimmi come si tiene il conto e come si usa. Campi: "n" = il nome esatto che ti ho dato; "u" = unità con cui si conta in dispensa, una tra pz, g, kg, ml, l, conf, vasetti, barattoli, bottiglie, scatole, pacchi, bustine, tubetti, lattine; "pack" = quante di quelle unità ci sono in una confezione tipica (numero) oppure null; "use" = unità con cui si usa in cucina, una tra pz, g, ml, cucchiai, cucchiaini, fette, bustine, vasetti, qb; "per" = dose tipica a testa in quell'unità (numero) oppure null; "lv" = true se si consuma poco alla volta e conviene segnare solo se la confezione è piena, a metà o quasi finita (es. marmellata, spezie, olio), altrimenti false. Rispondi SOLO con JSON: {"prodotti":[{"n":"...","u":"pz","pack":null,"use":"pz","per":1,"lv":false}]}` }]);
    ((r && r.prodotti) || []).forEach(x => {
      if (!x || !x.n || !names.some(n => norm(n) === norm(x.n))) return; const u = UNITS.includes(x.u) ? x.u : 'pz';
      learnProf(x.n, { u, pack: +x.pack || null, use: UNITS.includes(x.use) ? x.use : u, per: +x.per || null, lv: !!x.lv, ai: true });
      const d = S.disp.find(y => norm(y.name) === norm(x.n) && !y.trackSet && !isLv(y)); if (d && x.lv) save('dispensa', d.id, { ...d, track: 'livello', lvl: 'pieno', unit: LV_UNITS.includes(u) && u !== 'pz' ? u : 'conf', qty: d.qty || 1 })
    })
  } catch (e) { console.warn('schede prodotto', e) }
}
/* ---------- capire quello che si scrive ---------- */
const NUMW = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, dodici: 12, mezzo: .5, mezza: .5 };
const UMULT = { etto: ['g', 100], etti: ['g', 100], hg: ['g', 100], cl: ['ml', 10], dl: ['ml', 100], chilo: ['kg', 1], chili: ['kg', 1], chilogrammi: ['kg', 1], grammi: ['g', 1], grammo: ['g', 1], millilitri: ['ml', 1], dozzina: ['pz', 12], dozzine: ['pz', 12], paio: ['pz', 2] };
// "2 l latte", "mezzo chilo di pane", "un litro e mezzo di latte", "pane 500 g", "uova x6", "due vasetti di marmellata"
function parseLine(s) {
  s = String(s).trim().replace(/^[-*•]\s*/, '').replace(/[’`]/g, "'"); if (!s) return null;
  if (/\s*q\.?\s?b\.?$/i.test(s)) return { n: s.replace(/\s*q\.?\s?b\.?$/i, '').trim(), q: null, u: 'qb', ux: true };
  let w = s.split(/\s+/), q = null, u = null, ux = false;
  const numOf = x => { const y = (x || '').toLowerCase(); if (NUMW[y] != null) return NUMW[y]; return /^\d+([.,]\d+)?$/.test(y) ? parseFloat(y.replace(',', '.')) : null };
  const unitOf = x => { const y = (x || '').toLowerCase().replace(/\.$/, ''); if (UMULT[y]) return UMULT[y]; return UMAP[y] ? [UMAP[y], 1] : null };
  const glued = x => { const m = (x || '').toLowerCase().match(/^(\d+(?:[.,]\d+)?)([a-z]+)\.?$/); const un = m && unitOf(m[2]); return un ? [parseFloat(m[1].replace(',', '.')) * un[1], un[0]] : null };
  const g0 = glued(w[0]), n0 = numOf(w[0]);
  if (g0 && w.length > 1) { [q, u] = g0; ux = true; w = w.slice(1) }
  else if (n0 != null && w.length > 1) {
    q = n0; w = w.slice(1); let mu = 1; const un = unitOf(w[0]); if (un && w.length > 1) { u = un[0]; mu = un[1]; q *= mu; ux = true; w = w.slice(1) }
    if (/^e$/i.test(w[0] || '') && /^mezz[oa]$/i.test(w[1] || '') && w.length > 2) { q += .5 * mu; w = w.slice(2) }
  } else {
    const L = w.length, last = w[L - 1] || '', xm = last.match(/^x(\d+)$/i);
    if (xm && L > 1) { q = +xm[1]; w = w.slice(0, -1) }
    else if (L >= 3 && /^\d/.test(w[L - 2]) && numOf(w[L - 2]) != null && unitOf(last)) { const un = unitOf(last); q = numOf(w[L - 2]) * un[1]; u = un[0]; ux = true; w = w.slice(0, -2) }
    else if (L >= 2 && glued(last)) { [q, u] = glued(last); ux = true; w = w.slice(0, -1) }
    else if (L >= 2 && /^\d+([.,]\d+)?$/.test(last)) { q = numOf(last); w = w.slice(0, -1) }
  }
  if (/^(di|del|della|dello|dei|delle|degli)$/i.test(w[0] || '') && w.length > 1) w = w.slice(1);
  const n = w.join(' ').replace(/^d'\s*/i, '').trim(); return n ? { n, q: q == null ? null : round(q), u: u || 'pz', ux } : null
}
// più cose in una riga: "2 l latte, 6 uova e pane"
function parseMany(t) { return String(t).split(/\n|,|;|\s+e\s+(?!mezz[oa]\b)/).map(parseLine).filter(Boolean) }
function fillKnown() {
  const el = $('#known'); if (!el) return; const names = new Set();
  S.disp.forEach(d => names.add(d.name)); Object.values(S.stats || {}).forEach(v => v && v.name && names.add(v.name)); S.spesa.forEach(x => names.add(x.name));
  const sig = names.size + ':' + [...names].slice(-3).join('|'); if (fillKnown.sig === sig) return; fillKnown.sig = sig;
  el.innerHTML = [...names].filter(n => n && !/^avanzi:/.test(n)).sort((a, b) => a.localeCompare(b, 'it')).slice(0, 300).map(n => `<option value="${esc(n)}">`).join('')
}

/* ---------- aggiungere in dispensa ---------- */
function quickAdd(text) {
  const L = parseMany(text); if (!L.length) return 0;
  const before = new Map(S.disp.map(d => [d.id, d.qty]));
  L.forEach(x => mergeDisp({ name: x.n, qty: x.u === 'qb' ? null : x.q, unit: x.u === 'qb' ? 'pz' : x.u, ux: x.ux && x.u !== 'qb' }));
  logA('ha aggiunto in dispensa: ' + listTxt(L.map(x => x.n)));
  const out = L.map(x => { const d = S.disp.find(y => same(y.name, x.n)); return d ? `${d.name} ${isLv(d) ? lvText(d).toLowerCase() : fmtQ(d.qty, d.unit)} → ${LUOGO_L[d.luogo]}` : x.n });
  toast(out.length <= 2 ? out.join(' · ') : `${L.length} cose aggiunte`, () => { S.disp.slice().forEach(d => { if (!before.has(d.id)) del('dispensa', d.id); else if (before.get(d.id) !== d.qty) save('dispensa', d.id, { ...d, qty: before.get(d.id) }) }) });
  return L.length
}
function addSheet() {
  const it = (act, t, sub, ic) => `<button class="act" data-act="${act}"><span class="ai">${ic}</span><span><b>${t}</b><small>${sub}</small></span></button>`;
  modal(`<h2>Aggiungi in casa</h2>
  <form id="qa" class="qa"><input id="qai" list="known" placeholder="Es. 2 l latte, 6 uova, pane" autocomplete="off" enterkeyhint="done">${micHtml()}<button class="bp">Aggiungi</button></form>
  <p class="hint" style="margin:6px 2px 0">Scrivi come parli, anche più cose separate da virgola. Quantità, posto e categoria li capisco da solo: poi puoi correggerli toccando il prodotto.</p>
  <div class="acts-l">${it('live', 'Codici a barre', 'Inquadra i prodotti uno dopo l\'altro', IC.bar)}${it('photo', 'Foto di un prodotto', 'Anche frutta e verdura, con Gemini', IC.cam)}${it('scan', 'Scontrino', 'Tutta la spesa in una volta, con i prezzi', IC.rec)}${it('dadd', 'Con tutti i dettagli', 'Un prodotto con scadenza e categoria', IC.pen)}</div>
  <div class="acts-l">${it('keepdisp', 'Manda l\'elenco a Keep', 'Tutto quello che c\'è in casa', IC.share)}</div>`, m => {
    const inp = m.querySelector('#qai'); wireMic(m, inp);
    m.querySelector('#qa').onsubmit = e => { e.preventDefault(); if (quickAdd(inp.value)) { inp.value = ''; inp.focus() } }
  })
}
function dispModal(d) {
  const isNew = !d; d = d || { name: '', qty: 1, unit: 'pz', luogo: S.luogo !== 'tutto' ? S.luogo : '', scad: '' }; const p0 = d.name ? prof(d.name) : { use: 'pz', per: null, pack: null, u: 'pz' };
  modal(`<h2>${isNew ? 'Aggiungi in casa' : esc(d.name)}</h2><form id="f">
  <label>Nome<input name="name" required value="${esc(d.name)}" autocomplete="off" list="known" placeholder="Es. latte, pasta, uova"></label>
  <div id="qx"><label>Quantità</label><div class="stepper"><button type="button" class="ib" id="mn" aria-label="Meno">−</button><input name="qty" type="number" inputmode="decimal" step="any" min="0" value="${isLv(d) ? '' : d.qty ?? ''}" aria-label="Quantità"><button type="button" class="ib" id="pl" aria-label="Più">+</button><select name="unit" aria-label="Unità">${UNITS.map(u => `<option${u === (isLv(d) ? 'pz' : d.unit || 'pz') ? ' selected' : ''}>${u}</option>`).join('')}</select></div></div>
  <div id="lx"><label>Quanto ne resta</label><div class="segc lvsel">${LEVELS.map(([k, l]) => `<label><input type="radio" name="lvl" value="${k}"${(d.lvl || 'pieno') === k ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <label style="margin-top:10px">Quante ne hai <small id="cuh">compresa quella aperta</small></label><div class="stepper"><button type="button" class="ib" id="cmn" aria-label="Meno">−</button><input name="conf" type="number" inputmode="decimal" step="any" min="0" value="${isLv(d) ? d.qty ?? 1 : 1}" aria-label="Quantità"><button type="button" class="ib" id="cpl" aria-label="Più">+</button><select name="cu" aria-label="Unità">${LV_UNITS.map(u => `<option${u === (isLv(d) ? d.unit || 'conf' : 'conf') ? ' selected' : ''}>${u}</option>`).join('')}</select></div></div>
  <label>Dove</label><div class="segc">${LUOGHI.map(([k, l]) => `<label><input type="radio" name="luogo" value="${k}"${k === d.luogo ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <label>Scadenza <small id="sst">${d.scadStima ? 'stimata' : ''}</small><input name="scad" type="date" value="${esc(d.scad || '')}"></label>
  <details class="more"${isNew ? '' : ''}><summary>Altro: come lo conti, categoria, come si usa</summary>
    <label>Come lo conti</label><div class="segc" id="trk"><label><input type="radio" name="trk" value=""${isLv(d) ? '' : ' checked'}><span>Quantità esatta</span></label><label><input type="radio" name="trk" value="livello"${isLv(d) ? ' checked' : ''}><span>Per livello</span></label></div>
    <p class="hint" id="trkh" style="margin:2px 2px 8px"></p>
    <label>Categoria<select name="cat"><option value="">Automatica</option>${CATS.map(([k, l]) => `<option value="${k}"${k === d.cat ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="row" style="margin-top:10px"><label>In cucina si usa in<select name="use">${UNITS.map(u => `<option${u === p0.use ? ' selected' : ''}>${u}</option>`).join('')}</select></label><label>Dose a testa<input name="per" type="number" step="any" min="0" inputmode="decimal" value="${p0.per ?? ''}" placeholder="—"></label></div>
    <label style="margin-top:10px">In una confezione ce ne sono <small id="pkh"></small><input name="pack" type="number" step="any" min="0" inputmode="decimal" value="${p0.pack ?? ''}" placeholder="Es. 6 per le uova"></label>
    <p class="hint" style="margin:6px 2px 0">Servono a proporre le dosi nei piatti e a scalare giusto quando segni "Cucinato". L'app le ricorda per questo prodotto.</p>
  </details>
  <div class="acts">${isNew ? '' : '<button type="button" class="bd" id="del">Elimina</button><button type="button" class="bg" id="fin">Finito</button>'}${isNew ? '<button class="bg" value="more">Salva e un altro</button>' : ''}<button class="bp" value="ok">Salva</button></div></form>`, m => {
    const f = m.querySelector('#f'); const qi = E(f, 'qty'); let touched = !!d.luogo, trkTouched = !isNew, unitTouched = !isNew, useTouched = false;
    const curTrk = () => (f.querySelector('input[name=trk]:checked') || {}).value || '';
    const showTrk = () => { const lv = curTrk() === 'livello'; m.querySelector('#qx').hidden = lv; m.querySelector('#lx').hidden = !lv; m.querySelector('#trkh').textContent = lv ? 'Per le cose che usi poco alla volta: segni solo se è piena, a metà o quasi finita. Quando è quasi finita va in spesa da sola.' : 'Pezzi, grammi, litri: si scala da solo quando segni "Cucinato".' };
    f.querySelectorAll('input[name=trk]').forEach(r => r.onchange = () => { trkTouched = true; if (curTrk() === 'livello' && qi.value) { const u = E(f, 'unit').value; if (LV_UNITS.includes(u) && u !== 'pz') { E(f, 'cu').value = u; E(f, 'conf').value = qi.value } } else if (curTrk() !== 'livello') { qi.value = E(f, 'conf').value; if (UNITS.includes(E(f, 'cu').value)) E(f, 'unit').value = E(f, 'cu').value } showTrk(); est() }); showTrk();
    const ci = E(f, 'conf'); const cstep = () => { const u = E(f, 'cu').value; return isPack(u) ? 1 : stepFor(u) }; const cuh = () => m.querySelector('#cuh').textContent = isPack(E(f, 'cu').value) ? 'compresa quella aperta' : 'più o meno, quanto ne resta in tutto'; E(f, 'cu').onchange = cuh; cuh();
    m.querySelector('#cmn').onclick = () => ci.value = Math.max(0, round((parseFloat(ci.value) || 0) - cstep())); m.querySelector('#cpl').onclick = () => ci.value = round((parseFloat(ci.value) || 0) + cstep());
    const step = v => { unitTouched = true; qi.value = Math.max(0, round((parseFloat(qi.value) || 0) + v * stepFor(E(f, 'unit').value))) };
    m.querySelector('#mn').onclick = () => step(-1); m.querySelector('#pl').onclick = () => step(1);
    qi.oninput = () => unitTouched = true; E(f, 'unit').onchange = () => { unitTouched = true; pkh() };
    ['use', 'per', 'pack'].forEach(n => E(f, n).addEventListener('input', () => useTouched = true)); E(f, 'use').addEventListener('change', () => useTouched = true);
    const pkh = () => m.querySelector('#pkh').textContent = '(' + (curTrk() === 'livello' ? E(f, 'cu').value : E(f, 'unit').value) + ')'; pkh();
    f.querySelectorAll('input[name=luogo]').forEach(r => r.onchange = () => touched = true);
    let scadAuto = isNew || !!d.scadStima;
    function est() { if (!scadAuto) return; const lr = f.querySelector('input[name=luogo]:checked'); const sd = shelfDays(E(f, 'name').value, lr ? lr.value : guessLuogo(E(f, 'name').value)); E(f, 'scad').value = sd && curTrk() !== 'livello' ? plusDays(sd) : ''; m.querySelector('#sst').textContent = E(f, 'scad').value ? 'stimata, puoi cambiarla' : '' }
    E(f, 'scad').oninput = () => { scadAuto = false; m.querySelector('#sst').textContent = '' };
    f.querySelectorAll('input[name=luogo]').forEach(r => r.addEventListener('change', est));
    // mentre scrivi il nome, l'app compila da sola unità, modo di contare, posto e scadenza
    E(f, 'name').oninput = () => {
      const nm = E(f, 'name').value; const p = prof(nm);
      if (!trkTouched) { f.querySelectorAll('input[name=trk]').forEach(r => r.checked = r.value === (p.lv ? 'livello' : '')); showTrk() }
      if (!unitTouched && nm.trim()) { const ft = fitProf(nm, null, 'pz', false); if (ft.lv) { E(f, 'cu').value = ft.unit; cuh() } else { E(f, 'unit').value = UNITS.includes(ft.unit) ? ft.unit : 'pz'; qi.value = ft.qty } }
      if (!useTouched) { E(f, 'use').value = UNITS.includes(p.use) ? p.use : 'pz'; E(f, 'per').value = p.per ?? ''; E(f, 'pack').value = p.pack ?? '' } pkh();
      if (!touched) { const g = guessLuogo(nm); f.querySelectorAll('input[name=luogo]').forEach(r => r.checked = r.value === g) } est()
    };
    f.onsubmit = e => {
      e.preventDefault(); const name = E(f, 'name').value.trim(); if (!name) return; const qs = qi.value; const lr = f.querySelector('input[name=luogo]:checked'); const luogo = lr ? lr.value : guessLuogo(name);
      const lv = curTrk() === 'livello'; const base = { ...(isNew ? {} : d), name, luogo, cat: E(f, 'cat').value || guessCat(name), scad: E(f, 'scad').value || '', scadStima: scadAuto && !!E(f, 'scad').value };
      const nl = (f.querySelector('input[name=lvl]:checked') || {}).value || 'pieno'; const nc = parseFloat(ci.value); const confs = isNaN(nc) ? 1 : Math.max(0, round(nc)); const cu = E(f, 'cu').value;
      const rec = lv ? { ...base, track: 'livello', trackSet: true, unit: cu, qty: confs, lvl: nl } : { ...base, track: '', trackSet: true, lvl: '', qty: qs === '' ? null : parseFloat(qs), unit: E(f, 'unit').value };
      save('dispensa', isNew ? null : d.id, rec); if (isNew) logA('ha aggiunto in dispensa: ' + name);
      // quello che hai corretto a mano diventa la regola per questo prodotto
      const lp = {}; if (trkTouched && (isNew || lv !== isLv(d))) lp.lv = lv; if (unitTouched && (isNew || rec.unit !== d.unit)) lp.u = rec.unit;
      if (useTouched) { lp.use = E(f, 'use').value; lp.per = parseFloat(E(f, 'per').value) || null; lp.pack = parseFloat(E(f, 'pack').value) || null }
      if (Object.keys(lp).length) learnProf(name, lp); else if (isNew) askProf(name);
      if (lv && nl === 'poco' && (!isPack(cu) || confs <= 1) && (isNew || d.lvl !== 'poco') && !S.spesa.some(x => !x.done && same(x.name, name))) { addToSpesa([{ name, qty: null, unit: isPack(cu) ? cu : 'conf' }]); toast(name + ' quasi finito: aggiunto alla spesa') }
      if (e.submitter && e.submitter.value === 'more') { toast(name + ' aggiunto'); dispModal(); const r2 = $('#f').querySelector(`input[name=luogo][value=${luogo}]`); if (r2 && lr && touched) r2.checked = true } else close()
    };
    const x = m.querySelector('#del'); if (x) x.onclick = () => { close(); delU('dispensa', d.id); logA('ha tolto dalla dispensa: ' + d.name) };
    const fb = m.querySelector('#fin'); if (fb) fb.onclick = () => { close(); if (isLv(d)) { setLevel(d, 'finito'); return } const { id: _i, ...old } = d; save('dispensa', d.id, { ...d, qty: 0 }); addToSpesa([{ name: d.name, qty: null, unit: spesaUnit(d.name) }]); toast(d.name + ' finito, messo in spesa', () => { save('dispensa', d.id, old); S.spesa.filter(y => !y.done && same(y.name, d.name) && y.qty == null).forEach(y => del('spesa', y.id)) }) }
  })
}
const spesaUnit = name => { const p = prof(name); return p.pu || (isPack(p.u) ? p.u : 'pz') };

/* ---------- il menù di un pasto ---------- */
const ingSummary = it => (it.ingr || []).map(g => g.name + (g.lv ? '' : g.q != null ? ' ' + fmtQ(g.q, g.u) : '')).join(' · ');
function autoIngr(it, n) { if (it.rid || (it.ingr || []).length || !it.t) return it; const sug = suggestFor(it.t, []).filter(d => !d.avanzo); return sug.length ? { ...it, ingr: sug.map(d => isLv(d) ? { id: d.id, name: d.name, q: null, u: '', lv: true } : { id: d.id, name: d.name, ...doseFor(d, n || 1) }), auto: true } : it }
function menuModal(k, mk) {
  let items = mealItems(k, mk).map(x => ({ id: x.id && x.id !== 'x0' ? x.id : rid(), t: x.t || itemName(x), rid: x.rid || '', alt: !!x.alt, course: x.course || '', picks: [...(x.picks || [])], ingr: (x.ingr || []).map(g => ({ ...g })) }));
  const ml = MEALS.find(x => x[0] === mk)[1]; const n = heads(k, mk); let lastW = []; const open = new Set();
  modal(`<h2>${ml}</h2><p class="sub"><span style="text-transform:capitalize">${esc(dayFmt.format(dt(k)))}</span> · ${n} a tavola</p>
  <form id="mf" class="qa"><input id="mt" placeholder="Scrivi un piatto…" autocomplete="off" enterkeyhint="done">${micHtml()}<button class="bp">Aggiungi</button></form>
  <p class="hint" style="margin:6px 2px 0">Per far scegliere tra due piatti scrivi "o": <i>spätzle o gnocchi</i>.</p>
  <div class="quick" id="sg"></div>
  <div id="dl"></div>
  <label class="ck" style="margin-top:8px"><input type="checkbox" id="rico"${(S.rico || {})[ricoKey(k, mk)] ? ' checked' : ''}> Ripeti ogni ${WDL[dowOf(k)]}</label>
  <div class="acts"><button type="button" class="bd" id="clr">Svuota</button><button type="button" class="bg" data-act="close">Annulla</button><button class="bp" id="ok">Salva</button></div>`, m => {
    const dl = m.querySelector('#dl'), mt = m.querySelector('#mt'), sg = m.querySelector('#sg'); wireMic(m, mt);
    const push = arr => { items.push(...arr.map(x => autoIngr(x, n))); draw(); sugg() };
    // suggerimenti: avanzi, la settimana scorsa, le ricette (prima quelle che puoi fare), i piatti che mangiate spesso
    const sugg = () => {
      const q = norm(mt.value), has = t => items.some(i => norm(i.t) === norm(t)), S2 = [];
      S.disp.filter(d => d.avanzo && !zero(d)).forEach(d => S2.push({ l: 'Avanzi: ' + d.name.replace(/^avanzi:\s*/, ''), t: cap(d.name.replace(/^avanzi:\s*/, '')) + ' (avanzi)', lo: d }));
      if (lastW.length) S2.push({ l: `Come ${WDL[dowOf(k)]} scorso: ${listTxt(lastW.map(itemName))}`, lw: true, t: lastW.map(itemName).join(' ') });
      S.ric.map(r => ({ r, mi: match(r).miss.length })).sort((a, b) => a.mi - b.mi).forEach(({ r, mi }) => S2.push({ l: r.name + (mi ? '' : ' ✓'), t: r.name, r }));
      Object.values(S.piatti || {}).filter(v => v && v.name && !v.rid).sort((a, b) => (b.voto || 0) - (a.voto || 0) || b.n - a.n).forEach(v => S2.push({ l: v.name, t: v.name }));
      const L = S2.filter(x => (x.lw || !has(x.t)) && (!q || norm(x.l).includes(q))).slice(0, q ? 8 : 7);
      sg.innerHTML = L.map((x, i) => `<button type="button" class="igs" data-sg="${i}">+ ${esc(x.l)}</button>`).join('');
      sg.querySelectorAll('[data-sg]').forEach(b => b.onclick = () => {
        const x = L[+b.dataset.sg]; mt.value = '';
        if (x.lw) { push(lastW.map(y => ({ id: rid(), t: y.t || itemName(y), rid: y.rid || '', alt: !!y.alt, course: y.course || '', picks: [], ingr: (y.ingr || []).map(g => ({ ...g })) }))); lastW = []; sugg() }
        else if (x.lo) push([{ id: rid(), t: x.t, rid: '', alt: false, course: '', picks: [], ingr: [{ id: x.lo.id, name: x.lo.name, q: Math.min(x.lo.qty || 1, Math.max(1, n || 1)), u: 'pz' }] }])
        else push([{ id: rid(), t: x.t, rid: x.r ? x.r.id : '', alt: false, course: '', picks: [] }])
      })
    };
    (async () => { const pk = (() => { const d = dt(k); d.setDate(d.getDate() - 7); return ymd(d) })(); let v = (S.menu[pk] || {})[mk];
      if (!v && F) { try { const g = await F.fs.getDoc(dref('menu', pk)); v = g.exists() && g.data()[mk] } catch (e) { } }
      lastW = v ? (Array.isArray(v.items) ? v.items : (v.t || v.rid) ? [{ t: v.t, rid: v.rid }] : []) : []; if (lastW.length && m.querySelector('#sg')) sugg() })();
    const draw = () => {
      dl.innerHTML = items.length ? `<h3>Il menù</h3>${items.map((it, i) => {
        const r = it.rid && S.ric.find(x => x.id === it.rid), sum = r ? 'Ricetta: gli ingredienti li prende da lì' : ingSummary(it) ? 'Usa: ' + ingSummary(it) : 'Nessun ingrediente dalla dispensa';
        return `<div class="dr" data-i="${i}"><input class="dt" value="${esc(it.t)}" placeholder="Nome del piatto" aria-label="Piatto"><button type="button" class="x" data-del aria-label="Togli">×</button>
        <div class="segc mini"><button type="button" data-alt="0" class="${it.alt ? '' : 'on'}">Sicuro</button><button type="button" data-alt="1" class="${it.alt ? 'on' : ''}">A scelta</button></div>
        <button type="button" class="dsum" data-more><span>${esc(sum)}</span><b>${open.has(it.id) ? 'Chiudi' : 'Modifica'}</b></button>
        <div class="dx"${open.has(it.id) ? '' : ' hidden'}><select class="dc" aria-label="Portata">${COURSES.map(([c, l]) => `<option value="${c}"${c === it.course ? ' selected' : ''}>${l}</option>`).join('')}</select>${r ? '' : ingRow(it)}</div></div>` }).join('')}` : '';
      m.querySelector('#clr').hidden = !items.length
    };
    const pickList = (r, q) => { const it = items[+r.dataset.i]; const ch = (it.ingr || []).map(g => g.id); const L = S.disp.filter(d => !zero(d) && !ch.includes(d.id) && (!q || norm(d.name).includes(norm(q)))).sort((a, b) => String(a.name).localeCompare(b.name, 'it')).slice(0, 8); r.querySelector('.igl').innerHTML = L.length ? L.map(d => `<button type="button" class="igo" data-igadd="${d.id}"><span>${esc(d.name)}</span><small>${esc(LUOGO_L[d.luogo] || '')}${isLv(d) ? ' · ' + esc(lvText(d)) : d.qty != null ? ' · ' + fmtQ(d.qty, d.unit) : ''}</small></button>`).join('') : '<p class="sub" style="margin:6px 0">Niente in dispensa con questo nome.</p>' };
    dl.addEventListener('input', e => {
      const r = e.target.closest('.dr'); if (!r) return; const it = items[+r.dataset.i];
      if (e.target.classList.contains('iq')) { const g = it.ingr[+e.target.closest('.ig').dataset.j]; g.q = e.target.value === '' ? null : parseFloat(e.target.value); it.auto = false }
      else if (e.target.classList.contains('igq')) pickList(r, e.target.value)
      else if (e.target.classList.contains('dt')) { it.t = e.target.value; if (it.rid && norm(it.t) !== norm(itemName({ rid: it.rid }))) it.rid = '' }
    });
    dl.addEventListener('change', e => { const r = e.target.closest('.dr'); if (!r) return; const it = items[+r.dataset.i]; if (e.target.classList.contains('dc')) it.course = e.target.value; if (e.target.classList.contains('dt')) { if (it.auto || !(it.ingr || []).length) { it.ingr = []; items[+r.dataset.i] = autoIngr(it, n) } draw() } });
    dl.addEventListener('click', e => {
      const r = e.target.closest('.dr'); if (!r) return; const i = +r.dataset.i; const it = items[i];
      const ad = e.target.closest('[data-igadd]'); if (ad) { const d = S.disp.find(x => x.id === ad.dataset.igadd); if (d) { it.ingr = [...(it.ingr || []), isLv(d) ? { id: d.id, name: d.name, q: null, u: '', lv: true } : { id: d.id, name: d.name, ...doseFor(d, n || 1) }]; it.auto = false; draw() } return }
      const gd = e.target.closest('[data-igdel]'); if (gd) { it.ingr.splice(+gd.dataset.igdel, 1); it.auto = false; draw(); return }
      if (e.target.closest('[data-igpick]')) { const p = r.querySelector('.igp'); p.hidden = !p.hidden; if (!p.hidden) { pickList(r, ''); p.querySelector('.igq').focus() } return }
      if (e.target.closest('[data-more]')) { open.has(it.id) ? open.delete(it.id) : open.add(it.id); draw(); return }
      if (e.target.closest('[data-del]')) { items.splice(i, 1); draw(); sugg() } else { const b = e.target.closest('[data-alt]'); if (b) { it.alt = b.dataset.alt === '1'; draw() } }
    });
    mt.addEventListener('input', sugg);
    m.querySelector('#mf').onsubmit = e => { e.preventDefault(); const add = linkRecipes(parseMenuText(mt.value)); if (!add.length) { mt.focus(); return } mt.value = ''; push(add); mt.focus() };
    m.querySelector('#clr').onclick = () => { items = []; draw(); sugg() };
    m.querySelector('#ok').onclick = () => {
      items.push(...linkRecipes(parseMenuText(mt.value)).map(x => autoIngr(x, n)));
      const clean = linkRecipes(items.filter(x => x.t.trim()).map(({ auto, ...x }) => ({ ...x, t: x.t.trim() })));
      const rc = m.querySelector('#rico').checked, rk = ricoKey(k, mk), had = !!(S.rico || {})[rk];
      if (rc && clean.length) { const tpl = { items: clean.map(({ picks, ...x }) => x) }; S.rico = { ...S.rico, [rk]: tpl }; if (F) F.fs.setDoc(famRef(), { rico: { [rk]: tpl } }, { merge: true }).catch(werr) }
      else if (!rc && had) { const r2 = { ...S.rico }; delete r2[rk]; S.rico = r2; if (F) F.fs.setDoc(famRef(), { rico: { [rk]: F.fs.deleteField() } }, { merge: true }).catch(werr) }
      const prevV = (S.menu[k] || {})[mk]; const keep = prevV && Array.isArray(prevV.items) ? prevV : {};
      setMenu(k, mk, clean.length ? { ...keep, items: clean } : (rc && had ? { items: [] } : null)); close();
      if (clean.length) logA(`ha scritto il menù di ${ml.toLowerCase()} di ${dayFmt.format(dt(k))}: ${listTxt(clean.map(itemName))}${rc ? ' (ogni ' + WDL[dowOf(k)] + ')' : ''}`);
      const miss = clean.filter(x => x.rid).map(x => S.ric.find(r => r.id === x.rid)).filter(r => r && match(r).miss.length);
      if (miss.length) toast(`Per ${miss[0].name} manca qualcosa: aprila per metterlo in spesa`)
    };
    draw(); sugg()
  })
}

/* ---------- controllo di scontrini e foto: righe leggibili, si aprono solo per correggere ---------- */
function reviewReceipt(items, raw, out, opts = {}) {
  items = items.map(i => { if (!i.n) return i; const f = fitProf(i.n, i.q, i.u || 'pz', !!i.u && i.u !== 'pz'); return { ...i, q: f.qty, u: f.unit, lvp: !!f.lv } });
  const sumOf = r => { const q = r.querySelector('.q').value, u = r.querySelector('.u').value, pr = r.querySelector('.pr'); return [q ? fmtQ(+q, u) : '', LUOGO_L[r.querySelector('.l').value], pr && +pr.value ? eur(+pr.value) : ''].filter(Boolean).join(' · ') };
  const row = i => `<div class="rv rvc${opts.receipt ? ' wp' : ''}"><div class="rvh"><input type="checkbox" class="c" checked aria-label="Includi"><button type="button" class="rvt" data-ed><b>${esc(i.n || 'Nuovo prodotto')}</b><small></small></button><button type="button" class="lnk" data-ed>Modifica</button></div>
  <div class="rvx"${i.n ? ' hidden' : ''}><input class="n" value="${esc(i.n)}" aria-label="Nome" placeholder="Nome" list="known">${opts.receipt ? `<input class="pr" type="number" step="0.01" min="0" inputmode="decimal" value="${i.price ?? ''}" placeholder="€" aria-label="Prezzo">` : ''}<select class="k" aria-label="Categoria">${CATS.map(([k, l]) => `<option value="${k}"${k === (i.cat || guessCat(i.n)) ? ' selected' : ''}>${CAT_S[k] || l}</option>`).join('')}</select><input class="q" type="number" step="any" min="0" inputmode="decimal" value="${i.q ?? ''}" aria-label="Quantità"><select class="u" aria-label="Unità">${UNITS.map(u => `<option${u === i.u ? ' selected' : ''}>${u}</option>`).join('')}</select><select class="l" aria-label="Dove">${LUOGHI.map(([k, l]) => `<option value="${k}"${k === (i.luogo || guessLuogo(i.n)) ? ' selected' : ''}>${l}</option>`).join('')}</select>${i.info ? `<small style="grid-column:1/-1;color:var(--mut)">${esc(i.info)}</small>` : ''}</div></div>`;
  out.innerHTML = `${opts.head || `<h3>${items.length ? `Ho trovato ${items.length} prodotti` : 'Non ho trovato prodotti'}</h3><p class="sub">Togli la spunta a quello che non va in dispensa. Tocca una riga per correggere nome, quantità o posto.</p>`}<div id="rvs">${items.map(row).join('')}</div>
  <p><button class="bg" id="addr" type="button">+ Aggiungi una riga</button></p>
  ${opts.receipt ? `<div class="row rtot"><label>Negozio<input id="rshop" value="${esc(opts.shop || '')}" placeholder="Es. Conad" autocomplete="off"></label><label>Totale pagato (€)<input id="rtotal" type="number" step="0.01" min="0" inputmode="decimal" value="${opts.total ?? (items.some(i => i.price) ? round(items.reduce((a, i) => a + (i.price || 0), 0)) : '')}"></label></div><p class="hint" style="margin-top:0">Lo segno nelle spese del mese, in Spesa.</p>` : ''}
  <label class="ck"><input type="checkbox" id="rsp" checked> Togli dalla spesa quello che ho comprato</label>
  <button class="bp wide" id="rok">${opts.ok || 'Metti in dispensa'}</button>${raw ? `<details><summary>Testo letto dallo scontrino</summary><pre>${esc(raw)}</pre></details>` : ''}`;
  const rvs = out.querySelector('#rvs'); const upd = r => { r.querySelector('.rvt b').textContent = r.querySelector('.n').value.trim() || 'Nuovo prodotto'; r.querySelector('.rvt small').textContent = sumOf(r) }; rvs.querySelectorAll('.rv').forEach(upd);
  rvs.addEventListener('input', e => { const r = e.target.closest('.rv'); if (r) upd(r) }); rvs.addEventListener('change', e => { const r = e.target.closest('.rv'); if (r) upd(r) });
  rvs.addEventListener('click', e => { const b = e.target.closest('[data-ed]'); if (!b) return; const r = b.closest('.rv'); const x = r.querySelector('.rvx'); x.hidden = !x.hidden; r.querySelector('.lnk').textContent = x.hidden ? 'Modifica' : 'Chiudi' });
  out.querySelector('#addr').onclick = () => { rvs.insertAdjacentHTML('beforeend', row({ n: '', q: 1, u: 'pz', luogo: 'dispensa' })); const r = rvs.lastElementChild; upd(r); r.querySelector('.lnk').textContent = 'Chiudi'; r.querySelector('.n').focus() };
  out.querySelector('#rok').onclick = () => {
    const rs = [...out.querySelectorAll('.rv')].filter(r => r.querySelector('.c').checked).map(r => ({ name: r.querySelector('.n').value.trim(), qty: r.querySelector('.q').value === '' ? null : parseFloat(r.querySelector('.q').value), unit: r.querySelector('.u').value, luogo: r.querySelector('.l').value, cat: r.querySelector('.k').value, ux: true })).filter(x => x.name);
    rs.forEach(mergeDisp); let k = 0; if (rs.length) logA('ha aggiunto in dispensa: ' + listTxt(rs.map(x => x.name)));
    if (opts.receipt) { const tot = parseFloat(out.querySelector('#rtotal').value); const prs = [...out.querySelectorAll('.rv')].filter(r => r.querySelector('.n').value.trim()).map(r => ({ n: r.querySelector('.n').value.trim(), cat: r.querySelector('.k').value, price: parseFloat((r.querySelector('.pr') || {}).value) || 0 })).filter(x => x.price > 0);
      if (tot > 0 || prs.length) { const total = tot > 0 ? round(tot) : round(prs.reduce((a, x) => a + x.price, 0)); const shop = out.querySelector('#rshop').value.trim(); save('spese', null, { date: today(), month: today().slice(0, 7), total, shop, items: prs, by: S.me || '' }); logA(`ha registrato una spesa di ${eur(total)}${shop ? ' da ' + shop : ''}`) } }
    if (out.querySelector('#rsp').checked) S.spesa.filter(s => rs.some(x => same(x.name, s.name))).forEach(s => { del('spesa', s.id); k++ });
    if (opts.onDone) opts.onDone(); close(); toast(rs.length === 1 ? `${rs[0].name} → ${LUOGO_L[rs[0].luogo]}${k ? ', tolto dalla spesa' : ''}` : `${rs.length} prodotti in dispensa${k ? `, ${k} ${k === 1 ? 'tolto' : 'tolti'} dalla spesa` : ''}`)
  }
}

/* ---------- guida al primo avvio ---------- */
const TOUR = [
  ['Settimana', 'Ogni giorno ha colazione, pranzo e cena. Tocca il tuo nome per dire se ci sei, e scrivi cosa si mangia. Chi cucina vede subito per quanti.'],
  ['Dispensa', 'Tocca + e scrivi come parli: "2 l latte, 6 uova, pane". Oppure inquadra i codici a barre o fotografa lo scontrino. L\'app capisce da sola quantità, posto e scadenza.'],
  ['Ricette e menù', 'Le ricette dicono quanti ingredienti hai già. Quando segni "Cucinato", gli ingredienti si scalano dalla dispensa.'],
  ['Spesa', 'Una lista sola per tutti, divisa per reparto. Quello che finisce ci va da solo, e con un tocco vedi cosa manca per il menù dei prossimi giorni.']
];
function tourModal(i = 0) {
  const [t, x] = TOUR[i], last = i === TOUR.length - 1;
  modal(`<p class="tdots">${TOUR.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</p><h2>${t}</h2><p class="tourp">${x}</p><div class="acts">${last ? '' : '<button class="bg" data-act="close">Salta</button>'}<button class="bp" id="tn">${last ? 'Cominciamo' : 'Avanti'}</button></div>`, m => { LS.set('tour', 1); m.querySelector('#tn').onclick = () => last ? close() : tourModal(i + 1) })
}

/* ---------- ospiti, chi cucina, gusti ---------- */
const homeOf = (k, mk) => members().filter(m => pres(k, m.id)[mk] !== false);
const ospOf = (k, mk) => +(((S.menu[k] || {}).osp || {})[mk]) || 0;
const heads = (k, mk) => homeOf(k, mk).length + ospOf(k, mk);
const chefOf = (k, mk) => ((S.menu[k] || {}).chef || {})[mk] || '';
function guestModal(k, mk) {
  let n = ospOf(k, mk);
  modal(`<h2>Ospiti</h2><p class="sub">Quante persone in più a ${MEALS.find(x => x[0] === mk)[1].toLowerCase()}? Le dosi dei piatti e delle ricette si adattano.</p><div class="stepper big"><button type="button" class="ib" id="gm" aria-label="Meno">−</button><b id="gn">${n}</b><button type="button" class="ib" id="gp" aria-label="Più">+</button></div><div class="acts"><button class="bp" id="gok">Fatto</button></div>`, m => {
    const sh = () => m.querySelector('#gn').textContent = n; m.querySelector('#gm').onclick = () => { n = Math.max(0, n - 1); sh() }; m.querySelector('#gp').onclick = () => { n = Math.min(30, n + 1); sh() };
    m.querySelector('#gok').onclick = () => { if (n !== ospOf(k, mk)) { setMeal(k, 'osp', mk, n || null); logA(`ha segnato ${n} ${n === 1 ? 'ospite' : 'ospiti'} a ${MEALS.find(x => x[0] === mk)[1].toLowerCase()} di ${dayFmt.format(dt(k))}`) } close() }
  })
}
function cycleChef(k, mk) {
  const opts = ['', ...homeOf(k, mk).map(m => m.id)]; const next = opts[(opts.indexOf(chefOf(k, mk)) + 1) % opts.length];
  setMeal(k, 'chef', mk, next || null); const nm = (members().find(m => m.id === next) || {}).name; if (nm) logA(`ha segnato che ${nm} cucina ${MEALS.find(x => x[0] === mk)[1].toLowerCase()} di ${dayFmt.format(dt(k))}`)
}
// avvisi: qualcuno a tavola non mangia qualcosa che c'è nel piatto
function tasteWarn(k, mk, items) {
  const out = []; const G = S.gusti || {};
  homeOf(k, mk).forEach(m => {
    const no = (G[m.id] || []).map(w => norm(w)).filter(Boolean); if (!no.length) return;
    items.forEach(it => {
      const r = it.rid && S.ric.find(x => x.id === it.rid); const words = norm([itemName(it), ...(it.ingr || []).map(g => g.name), ...((r && r.ingr) || []).map(i => i.n)].join(' ')).split(' ').map(stem);
      const hit = no.find(w => w.split(' ').every(p => words.includes(stem(p)))); if (hit) out.push(`${m.name} non mangia ${hit} (${itemName(it)})`)
    })
  });
  return out
}
function tastesModal() {
  const M = members(), G = S.gusti || {};
  modal(`<h2>Gusti</h2><p class="sub">Scrivi cosa <b>non</b> mangia ognuno, separato da virgole. L'app avvisa quando lo trova in un piatto e ne tiene conto quando propone ricette e menù.</p><form id="f">${M.map(m => `<label><span><span class="dot" style="background:${m.color}"></span>${esc(m.name)}</span><input name="${m.id}" value="${esc((G[m.id] || []).join(', '))}" placeholder="Es. pesce, funghi, peperoni" autocomplete="off"></label>`).join('')}${acts()}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const g = {}; M.forEach(x => g[x.id] = E(e.target, x.id).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)); S.gusti = g; close(); render(); if (F) F.fs.setDoc(famRef(), { gusti: g }, { mergeFields: ['gusti'] }).catch(werr); logA('ha aggiornato i gusti della famiglia') }
  })
}
const tastesText = () => members().map(m => ((S.gusti || {})[m.id] || []).length ? `${m.name} non mangia ${S.gusti[m.id].join(', ')}` : '').filter(Boolean).join('; ');

/* ---------- storico dei piatti e voti ---------- */
function bumpDishes(items) {
  const upd = {}; items.forEach(it => { const name = itemName(it).replace(/\s*\(avanzi\)$/i, ''); const k = pkey(name); if (!k) return; const cur = (S.piatti || {})[k] || {}; S.piatti = { ...(S.piatti || {}), [k]: { ...cur, n: (cur.n || 0) + 1, name, last: today(), rid: it.rid || cur.rid || '' } }; upd[k] = { n: F ? F.fs.increment(1) : 1, name, last: today(), rid: it.rid || cur.rid || '' } });
  if (F && Object.keys(upd).length) F.fs.setDoc(dref('stats', 'piatti'), { counts: upd }, { merge: true }).catch(werr)
}
function rateDish(k, v) { const cur = (S.piatti || {})[k]; if (!cur) return; const voto = cur.voto === v ? 0 : v; S.piatti = { ...S.piatti, [k]: { ...cur, voto } }; render(); if (F) F.fs.setDoc(dref('stats', 'piatti'), { counts: { [k]: { voto } } }, { merge: true }).catch(werr) }
function renderEaten() {
  const q = norm(S.rq); const L = Object.entries(S.piatti || {}).filter(([, v]) => v && v.name && (!q || norm(v.name).includes(q))).sort((a, b) => String(b[1].last || '').localeCompare(String(a[1].last || '')));
  $('#rlist').innerHTML = L.length ? L.map(([k, v]) => { const ago = v.last ? -daysTo(v.last) : null;
    return `<li class="rc eat"><div><button class="en" ${v.rid && S.ric.some(r => r.id === v.rid) ? `data-act="ropen" data-id="${v.rid}"` : `data-act="eatadd" data-k="${k}"`}><b>${esc(v.name)}</b><span class="meta">${v.n} ${v.n === 1 ? 'volta' : 'volte'}${ago != null ? ' · ' + (ago <= 0 ? 'oggi' : ago === 1 ? 'ieri' : ago + ' giorni fa') : ''}${ago != null && ago >= 21 ? ' · <em>non lo mangiate da un po\'</em>' : ''}</span></button><span class="stars" role="group" aria-label="Voto">${[1, 2, 3, 4, 5].map(s => `<button data-act="rate" data-k="${k}" data-v="${s}" class="${(v.voto || 0) >= s ? 'on' : ''}" aria-label="${s} su 5">★</button>`).join('')}</span></div></li>` }).join('')
    : '<li class="empty">Qui compaiono i piatti che avete mangiato, dopo che segnate "Cucinato" in un pasto. Potete dare un voto: i preferiti vengono proposti più spesso.</li>'
}
function eatAdd(k) { const v = (S.piatti || {})[k]; if (!v) return; const mk = new Date().getHours() < 14 ? 'p' : 's'; addDish(today(), mk, autoIngr({ id: rid(), t: v.name, rid: '', alt: false, course: '', picks: [] }, heads(today(), mk))); toast(`${v.name} aggiunto a ${mk === 'p' ? 'pranzo' : 'cena'} di oggi`) }

/* ---------- menù della settimana proposto ---------- */
function planCandidates() {
  const out = []; const recent = new Set(); weekDays(0).forEach(d => MEALS.forEach(([mk]) => mealItems(ymd(d), mk).forEach(it => recent.add(norm(itemName(it))))));
  S.disp.filter(d => d.avanzo && !zero(d)).forEach(d => out.push({ t: cap(d.name.replace(/^avanzi:\s*/, '')) + ' (avanzi)', why: 'avanzi in frigo', lo: d }));
  S.ric.map(r => ({ r, m: match(r) })).sort((a, b) => a.m.miss.length - b.m.miss.length).forEach(({ r, m }) => out.push({ t: r.name, rid: r.id, why: m.miss.length ? (m.miss.length === 1 ? 'manca 1 ingrediente' : `mancano ${m.miss.length} ingredienti`) : 'avete tutto' }));
  Object.values(S.piatti || {}).filter(v => v && v.name && !v.rid).sort((a, b) => (b.voto || 0) - (a.voto || 0) || b.n - a.n).forEach(v => out.push({ t: v.name, why: v.voto >= 4 ? 'vi piace' : `mangiato ${v.n} ${v.n === 1 ? 'volta' : 'volte'}` }));
  const seen = new Set(); return out.filter(x => { const k = norm(x.t); if (seen.has(k) || recent.has(k)) return false; seen.add(k); return true })
}
function planModal() {
  if (S.week !== 0) { S.week = 0; S.sel = null; subWeek() }
  const slots = []; weekDays(0).forEach(d => { const k = ymd(d); ['p', 's'].forEach(mk => { if (!mealItems(k, mk).length && heads(k, mk) > 0) slots.push({ k, mk }) }) });
  if (!slots.length) { toast('I pranzi e le cene dei prossimi 7 giorni sono già tutti decisi'); return }
  const cands = planCandidates(); let plan = slots.map((s, i) => ({ ...s, on: true, c: cands.length ? i % cands.length : -1, own: null }));
  modal(`<h2>Menù della settimana</h2><p class="sub">Una proposta per i ${slots.length} pasti ancora vuoti dei prossimi 7 giorni. Togli la spunta a quelli che non vuoi, tocca "Altro" per cambiare piatto.</p>
  ${gkey() ? '<button class="bg wide" id="pai">Fammela proporre da Gemini, con quello che c\'è in casa</button><p class="hint" id="pst" style="margin:6px 2px 0"></p>' : '<p class="hint" style="margin:0 2px 8px">Uso le vostre ricette e i piatti che mangiate di più. Con Gemini attivo (Impostazioni) propongo anche piatti nuovi partendo da quello che scade.</p>'}
  <div id="pl"></div><div class="acts"><button class="bg" data-act="close">Annulla</button><button class="bp" id="pok">Metti nel menù</button></div>`, m => {
    const el = m.querySelector('#pl'); const dishOf = p => p.own || cands[p.c] || null;
    const draw = () => {
      el.innerHTML = cands.length || plan.some(p => p.own) ? plan.map((p, i) => { const c = dishOf(p); return `<div class="pr2${i && plan[i - 1].k === p.k ? ' same' : ''}"><label><input type="checkbox" data-pi="${i}"${p.on && c ? ' checked' : ''}${c ? '' : ' disabled'}><span><small>${esc(cap(wdLong.format(dt(p.k))))} · ${p.mk === 'p' ? 'pranzo' : 'cena'} · ${heads(p.k, p.mk)} a tavola</small><b>${c ? esc(c.t) : '—'}</b>${c && c.why ? `<small>${esc(c.why)}</small>` : ''}</span></label>${cands.length > 1 ? `<button type="button" class="sm" data-px="${i}">Altro</button>` : ''}</div>` }).join('') : '<div class="emptyc">Non ho ancora abbastanza piatti da proporre. Aggiungi qualche ricetta, oppure segna "Cucinato" nei pasti: imparo cosa mangiate.</div>';
      m.querySelector('#pok').disabled = !plan.some(p => p.on && dishOf(p))
    };
    el.addEventListener('change', e => { const i = e.target.dataset.pi; if (i != null) { plan[+i].on = e.target.checked; draw() } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-px]'); if (!b || !cands.length) return; const p = plan[+b.dataset.px]; p.own = null; p.c = (p.c + 1) % cands.length; p.on = true; draw() });
    const ai = m.querySelector('#pai'); if (ai) ai.onclick = async () => {
      const st = m.querySelector('#pst'); ai.disabled = true; st.textContent = 'Gemini sta preparando il menù…';
      const pantry = S.disp.filter(d => !zero(d)).map(d => `- ${d.name}${isLv(d) ? '' : d.qty != null ? ` (${fmtQ(d.qty, d.unit)})` : ''}${d.scad ? `, scade il ${d.scad}` : ''}`).join('\n') || '(dispensa vuota)';
      const fav = Object.values(S.piatti || {}).sort((a, b) => (b.voto || 0) - (a.voto || 0) || b.n - a.n).slice(0, 15).map(v => v.name).join(', ');
      const prompt = `Sei un cuoco di casa italiano. Prepara il menù per questi pasti di una famiglia: ${JSON.stringify(plan.map(p => ({ giorno: p.k, pasto: p.mk === 'p' ? 'pranzo' : 'cena', persone: heads(p.k, p.mk) })))}.\nIn casa c'è:\n${pantry}\nRicette della famiglia: ${S.ric.map(r => r.name).join(', ') || 'nessuna'}.\nPiatti che mangiano volentieri: ${fav || 'non lo so ancora'}.\n${tastesText() ? 'Attenzione: ' + tastesText() + '.\n' : ''}Usa prima quello che scade, varia tra pasta, carne, pesce, verdure e legumi, non ripetere lo stesso piatto, tieni piatti semplici di tutti i giorni. Quando un piatto è una ricetta della famiglia usa esattamente quel nome.\nRispondi SOLO con JSON: {"menu":[{"giorno":"AAAA-MM-GG","pasto":"pranzo","piatto":"...","perche":"motivo in 5 parole"}]}`;
      try { const r = await gemini([{ text: prompt }]); let c = 0; ((r && r.menu) || []).forEach(x => { const p = plan.find(y => y.k === x.giorno && (y.mk === 'p' ? 'pranzo' : 'cena') === x.pasto); if (!p || !x.piatto) return; const rr = S.ric.find(z => norm(z.name) === norm(x.piatto)); p.own = { t: String(x.piatto), rid: rr ? rr.id : '', why: x.perche ? String(x.perche) : '' }; p.on = true; c++ }); st.textContent = c ? 'Ecco la proposta di Gemini. Puoi ancora cambiarla.' : 'Gemini non ha proposto niente, riprova.'; draw() }
      catch (e) { st.textContent = 'Non è andata: ' + (e.message || e) } ai.disabled = false
    };
    m.querySelector('#pok').onclick = () => { let c = 0; plan.forEach(p => { const d = dishOf(p); if (!p.on || !d) return; const it = d.lo ? { id: rid(), t: d.t, rid: '', alt: false, course: '', picks: [], ingr: [{ id: d.lo.id, name: d.lo.name, q: 1, u: 'pz' }] } : autoIngr({ id: rid(), t: d.t, rid: d.rid || '', alt: false, course: '', picks: [] }, heads(p.k, p.mk)); const { auto, ...clean } = it; setMenu(p.k, p.mk, { items: [clean] }); c++ }); close(); logA(`ha riempito il menù della settimana (${c} pasti)`); toast(`${c} pasti messi nel menù. Ora puoi vedere cosa manca in Spesa`) };
    draw()
  })
}

/* ---------- cosa manca per il menù dei prossimi giorni ---------- */
function menuNeeds(days) {
  const need = new Map(); const add = (name, q, u, from) => { const key = norm(name) + '|' + (u || 'pz'); const e = need.get(key) || { name, q: 0, u: u || 'pz', from: new Set(), noq: false }; if (q == null) e.noq = true; else e.q += q; e.from.add(from); need.set(key, e) };
  weekDays(0).slice(0, days).forEach(d => { const k = ymd(d); MEALS.forEach(([mk]) => { const v = (S.menu[k] || {})[mk]; if (v && v.cooked) return; const n = heads(k, mk) || 1;
    mealItems(k, mk).forEach(it => { const nm = itemName(it); const r = it.rid && S.ric.find(x => x.id === it.rid);
      if (r) { const f = n / (+r.porz || 4); (r.ingr || []).forEach(i => { if (!STAPLES.includes(norm(i.n))) add(i.n, i.q == null || i.u === 'qb' ? null : i.q * f, i.u === 'qb' ? 'pz' : i.u, nm) }) }
      (it.ingr || []).forEach(g => { if (!/^avanzi:/.test(g.name)) add(g.name, g.lv ? null : g.q, g.lv ? 'pz' : g.u, nm) }) }) }) });
  const out = []; const up = (q, u) => ['g', 'ml', 'kg', 'l'].includes(u) ? round(q) : Math.ceil(q - 1e-9);
  need.forEach(e => {
    const it = haveItem(e.name); const from = [...e.from].join(', ');
    if (!it) { out.push({ name: e.name, qty: e.noq || !e.q ? null : up(e.q, e.u), unit: e.u, from, why: 'non c\'è' }); return }
    if (isLv(it)) { if (it.lvl === 'poco' && (!isPack(it.unit) || (it.qty ?? 1) <= 1)) out.push({ name: it.name, qty: null, unit: spesaUnit(it.name), from, why: 'quasi finito' }); return }
    if (e.noq || typeof it.qty !== 'number') return; const have = conv(it.name, it.qty, it.unit, e.u); if (have != null && have < e.q - 1e-9) out.push({ name: it.name, qty: up(e.q - have, e.u), unit: e.u, from, why: `ne hai ${fmtQ(round(have), e.u)}, ne servono ${fmtQ(round(e.q), e.u)}` })
  });
  return out.filter(x => !S.spesa.some(s => !s.done && same(s.name, x.name)))
}
function missModal(days = 3) {
  if (S.week !== 0) { S.week = 0; S.sel = null; subWeek() }
  const L = menuNeeds(days);
  modal(`<h2>Cosa manca per il menù</h2><div class="segc">${[[1, 'Oggi'], [3, '3 giorni'], [7, '7 giorni']].map(([d, l]) => `<button type="button" data-md="${d}" class="${d === days ? 'on' : ''}">${l}</button>`).join('')}</div>
  ${L.length ? `<p class="sub" style="margin-top:10px">Ingredienti dei piatti in menù che non avete, o non abbastanza. Quelli già in lista non li ripeto.</p><div class="card">${L.map((x, i) => `<label class="ri"><input type="checkbox" data-mi="${i}" checked><span class="rn"><b>${esc(x.name)}${x.qty != null ? ' · ' + fmtQ(x.qty, x.unit) : ''}</b><small>${esc(x.why)} · per ${esc(x.from)}</small></span></label>`).join('')}</div>` : '<div class="emptyc"><b>Non manca niente</b><p style="margin:0">Per i piatti in menù avete tutto, oppure i piatti non hanno ingredienti collegati. Per collegarli tocca "Modifica" sul pasto.</p></div>'}
  <div class="acts"><button class="bg" data-act="close">Chiudi</button>${L.length ? '<button class="bp" id="mok">Metti in spesa</button>' : ''}</div>`, m => {
    m.querySelectorAll('[data-md]').forEach(b => b.onclick = () => missModal(+b.dataset.md));
    const ok = m.querySelector('#mok'); if (ok) ok.onclick = () => { const sel = [...m.querySelectorAll('[data-mi]')].filter(c => c.checked).map(c => L[+c.dataset.mi]); addToSpesa(sel.map(x => ({ name: x.name, qty: x.qty, unit: x.unit, from: x.from }))); close(); toast(`${sel.length} cose messe in spesa`) }
  })
}

/* ---------- modalità supermercato ---------- */
let wakeLock = null;
function shopMode() {
  S.shop = true; modal('<div id="shop"></div>', m => { m.querySelector('.sheet').classList.add('full'); drawShop(); try { navigator.wakeLock && navigator.wakeLock.request('screen').then(w => wakeLock = w).catch(() => { }) } catch (e) { } });
  modalCleanup = () => { S.shop = false; try { wakeLock && wakeLock.release() } catch (e) { } wakeLock = null }
}
function drawShop() {
  const el = $('#shop'); if (!el) return; const open = S.spesa.filter(x => !x.done), done = S.spesa.filter(x => x.done);
  const row = x => `<button class="shr${x.done ? ' done' : ''}" data-act="shtog" data-id="${x.id}"><i></i><span><b>${esc(x.name)}</b>${x.qty != null ? `<small>${fmtQ(x.qty, x.unit)}</small>` : ''}</span></button>`;
  el.innerHTML = `<h2>Al supermercato</h2><p class="sub">${open.length ? `Mancano ${open.length} cose. Tocca quello che metti nel carrello.` : 'Hai preso tutto.'}</p>
  ${AISLE.map(c => [c, open.filter(x => catOf(x) === c)]).filter(g => g[1].length).map(([c, L]) => `<h3>${CAT_L[c]}</h3>${L.map(row).join('')}`).join('')}
  ${done.length ? `<h3>Nel carrello (${done.length})</h3>${done.map(row).join('')}` : ''}
  <div class="acts">${done.length ? '<button class="bp" data-act="shend">Finito: metti in dispensa</button>' : ''}<button class="bg" data-act="close">Esci</button></div>`
}

/* ---------- dettatura ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const micHtml = () => SR ? `<button type="button" class="mic" aria-label="Detta">${IC.mic}</button>` : '';
function wireMic(root, input) {
  const b = root.querySelector('.mic'); if (!b || !SR) return; let rec = null;
  b.onclick = () => {
    if (rec) { rec.stop(); return }
    try { rec = new SR(); rec.lang = 'it-IT'; rec.interimResults = true; rec.continuous = false; const base = input.value ? input.value.replace(/[,\s]*$/, '') + ', ' : '';
      rec.onresult = e => { input.value = base + [...e.results].map(r => r[0].transcript).join(' '); input.dispatchEvent(new Event('input', { bubbles: true })) };
      rec.onend = () => { rec = null; b.classList.remove('on'); input.focus() }; rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Il microfono non è permesso: controlla i permessi del browser') };
      rec.start(); b.classList.add('on') } catch (e) { rec = null; toast('La dettatura non è disponibile su questo telefono') }
  }
}

/* ---------- codici a barre dal vivo ---------- */
function liveScan() {
  const found = []; const seen = new Set(); let stream = null, timer = null, zx = null, stopped = false;
  modal(`<h2>Codici a barre</h2><p class="sub">Inquadra un codice alla volta: quando lo leggo compare qui sotto. Alla fine tocca "Fatto".</p><div class="cam"><video id="lv" playsinline muted></video><span class="aim"></span></div><p class="hint" id="lst">Avvio la fotocamera…</p><div id="lf" class="card" hidden></div><div id="lout"></div><div class="acts" id="lact"><button class="bg" data-act="close">Annulla</button><button class="bp" id="lok" disabled>Fatto</button></div>`, async m => {
    const v = m.querySelector('#lv'), st = t => { const e = m.querySelector('#lst'); if (e) e.textContent = t };
    const stop = () => { stopped = true; clearInterval(timer); try { zx && zx.reset() } catch (e) { } try { stream && stream.getTracks().forEach(t => t.stop()) } catch (e) { } };
    modalCleanup = stop;
    const list = () => { const el = m.querySelector('#lf'); if (!el) return; el.hidden = !found.length; el.innerHTML = found.map(x => `<div class="ri"><span class="rn"><b>${esc(x.n || 'Codice ' + x.code)}</b><small>${esc(x.n ? (x.info || '') : 'non lo conosco: lo aggiungi a mano dopo')}</small></span><span class="rq">${x.n && x.q != null ? fmtQ(x.q, x.u) : ''}</span></div>`).join(''); m.querySelector('#lok').disabled = !found.some(x => x.n); m.querySelector('#lok').textContent = found.filter(x => x.n).length ? `Fatto (${found.filter(x => x.n).length})` : 'Fatto' };
    const onCode = async code => { if (stopped || !/^\d{8,14}$/.test(code) || seen.has(code)) return; seen.add(code); try { navigator.vibrate && navigator.vibrate(60) } catch (e) { } const slot = { code }; found.unshift(slot); list(); st('Letto ' + code + ': cerco il prodotto…'); try { const p = await lookupOFF(code); if (p) Object.assign(slot, p) } catch (e) { } list(); st('Inquadra il prossimo codice') };
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }); if (stopped) { stop(); return } v.srcObject = stream; await v.play(); st('Inquadra il codice a barre');
      if ('BarcodeDetector' in window) { const bd = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }); let busy = false; timer = setInterval(async () => { if (busy || stopped || v.readyState < 2) return; busy = true; try { const r = await bd.detect(v); if (r[0]) onCode(r[0].rawValue) } catch (e) { } busy = false }, 350) }
      else { const Z = await loadZx(); const hints = new Map(); hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]); zx = new Z.BrowserMultiFormatReader(hints, 300); zx.decodeFromStream(stream, v, r => { if (r) onCode(r.getText()) }) }
    } catch (e) { console.warn(e); st(e && /NotAllowed|Permission/.test(e.name + e.message) ? 'La fotocamera non è permessa: controlla i permessi del browser, oppure usa "Foto di un prodotto".' : 'Non riesco ad aprire la fotocamera qui: usa "Foto di un prodotto".') }
    m.querySelector('#lok').onclick = () => { stop(); m.querySelector('.cam').remove(); m.querySelector('#lf').remove(); m.querySelector('#lact').remove(); st(''); reviewReceipt(found.filter(x => x.n).reverse(), '', m.querySelector('#lout'), { head: '<h3>Controlla e conferma</h3>', ok: 'Metti in dispensa' }) }
  })
}

/* ---------- importare una ricetta da foto, testo o link ---------- */
const RIC_FMT = '{"nome":"...","porzioni":4,"tempo":30,"ingredienti":[{"n":"nome in minuscolo","q":200,"u":"g"}],"passi":["..."]} dove "u" è uno tra g, kg, ml, l, pz, cucchiai, cucchiaini, spicchi, fette, qb e "q" è un numero o null';
const toRic = x => ({ name: String(x.nome || ''), porz: +x.porzioni || 4, tempo: +x.tempo || '', ingr: (x.ingredienti || []).filter(i => i && i.n).map(i => ({ n: String(i.n), q: i.q == null || i.q === '' ? null : +i.q, u: UNITS.includes(i.u) ? i.u : (UMAP[i.u] || 'pz') })), passi: (Array.isArray(x.passi) ? x.passi : [x.passi]).filter(Boolean).join('\n'), tags: [] });
function importModal() {
  if (!gkey()) { modal(`<h2>Importa una ricetta</h2><p class="sub">Per leggere una ricetta da una foto, da un testo o da un link serve Gemini, che è gratuito. Attivalo dalle impostazioni e torna qui.</p><div class="acts"><button class="bg" data-act="close">Chiudi</button><button class="bp" data-act="settings">Impostazioni</button></div>`); return }
  modal(`<h2>Importa una ricetta</h2><p class="sub">Fotografa la pagina di un libro o un foglio scritto a mano, oppure incolla il testo o il link di una ricetta. Prima di salvarla la puoi correggere.</p>
  <div class="row"><label class="bp filebtn">Fotografa<input type="file" accept="image/*" capture="environment" id="ic" hidden></label><label class="bg filebtn">Dalla galleria<input type="file" accept="image/*" id="ig" hidden></label></div>
  <form id="if" style="margin-top:14px"><label>Testo o link<textarea name="t" rows="5" placeholder="Incolla qui la ricetta, oppure l'indirizzo della pagina"></textarea></label><button class="bg wide">Leggi</button></form><p class="load" id="ist" hidden></p>`, m => {
    const st = t => { const e = m.querySelector('#ist'); if (e) { e.hidden = !t; e.textContent = t } };
    const done = r => { const x = toRic((r && r.ricetta) || r || {}); if (!x.name && !x.ingr.length) { st('Non ho trovato una ricetta. Prova con una foto più nitida o incolla il testo.'); return } ricEdit(x, true) };
    const fromPhoto = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; st('Leggo la foto…'); try { const { color } = await prep(f); done(await gemini([{ text: 'Nella foto c\'è una ricetta di cucina (stampata o scritta a mano). Trascrivila in italiano. Rispondi SOLO con JSON: ' + RIC_FMT }, { inline_data: { mime_type: 'image/jpeg', data: color.split(',')[1] } }])) } catch (x) { st('Non è andata: ' + (x.message || x)) } };
    m.querySelector('#ic').onchange = fromPhoto; m.querySelector('#ig').onchange = fromPhoto;
    m.querySelector('#if').onsubmit = async e => {
      e.preventDefault(); const t = E(e.target, 't').value.trim(); if (!t) return; const isUrl = /^https?:\/\/\S+$/i.test(t); st(isUrl ? 'Apro la pagina…' : 'Leggo il testo…');
      try { done(isUrl ? await gemini([{ text: `Apri questa pagina: ${t} ed estrai la ricetta che contiene, in italiano. Rispondi SOLO con JSON: ` + RIC_FMT }], null, { tools: [{ url_context: {} }] }) : await gemini([{ text: 'Questo è il testo di una ricetta. Mettila in ordine, in italiano. Rispondi SOLO con JSON: ' + RIC_FMT + '\n\n' + t.slice(0, 12000) }])) }
      catch (x) { st(isUrl ? 'Non sono riuscito ad aprire il link. Apri la pagina, copia il testo della ricetta e incollalo qui.' : 'Non è andata: ' + (x.message || x)) }
    }
  })
}
function ricSheet() {
  const it = (act, t, sub, ic) => `<button class="act" data-act="${act}"><span class="ai">${ic}</span><span><b>${t}</b><small>${sub}</small></span></button>`;
  modal(`<h2>Aggiungi una ricetta</h2><div class="acts-l">${it('rnew', 'Scrivila', 'Nome, ingredienti e passaggi', IC.pen)}${it('rimp', 'Importa da foto, testo o link', 'La legge Gemini, poi la correggi', IC.cam)}${it('ai', 'Trova ricette', 'GialloZafferano, Cucchiaio d\'Argento o inventate', IC.star)}${it('rfile', 'Tante ricette insieme', 'Da un PDF o da un file di ricette', IC.rec)}</div>`)
}

/* ---------- riepilogo del giorno ---------- */
function dayBrief() {
  const t = today(); if (LS.get('brief', '') === t) return '';
  const ex = S.disp.filter(d => d.scad && !zero(d) && daysTo(d.scad) <= 2), sp = S.spesa.filter(x => !x.done).length, hr = new Date().getHours(), mk = hr < 14 ? 'p' : 's';
  const bits = []; const menu = menuLabel(t, mk); bits.push(`${mk === 'p' ? 'A pranzo' : 'Stasera'} siete in ${heads(t, mk)}${menu ? ': ' + menu : ', menù da decidere'}`);
  if (ex.length) bits.push(`${ex.length === 1 ? 'c\'è 1 cosa' : 'ci sono ' + ex.length + ' cose'} da usare presto (${listTxt(ex.slice(0, 3).map(d => d.name))})`); if (sp) bits.push(`${sp} ${sp === 1 ? 'cosa' : 'cose'} in lista della spesa`);
  return `<div class="brief"><p><b>${hr < 12 ? 'Buongiorno' : hr < 18 ? 'Buon pomeriggio' : 'Buonasera'}${S.me ? ', ' + esc(meName()) : ''}.</b> ${esc(bits.join('; '))}.</p><button class="x" data-act="briefx" aria-label="Chiudi">×</button></div>`
}

/* ---------- proposte salvate, filtri, chiedi a Gemini ---------- */
const TIPI = COURSES.filter(([k]) => k);
const TIPO_RX = [['dolce', /\b(dolc|tort[ae]\b(?! salat)|biscott|crostat|tiramis|budin|gelat|muffin|ciambell|panna cotta|semifredd|plumcake|crema pasticc|frittell|cheesecake|brownie|cantucc)/], ['primo', /\b(risott|pasta|spaghett|lasagn|gnocch|tagliatell|penne|fusill|raviol|tortellin|zupp|minestr|vellutat|orecchiett|linguin|paccher|rigaton|bucatin|farfall|tagliolin|pappardell|cannellon|passatell|carbonara|amatriciana|pasta e fagioli|bigoli|maccheron)/], ['contorno', /\b(contorn|insalat|patate (al forno|arrosto)|verdure (grigliate|al forno)|caponata|purè|spinaci|fagiolini|peperonat|carciofi trifolati|funghi trifolati)/], ['antipasto', /\b(antipast|bruschett|crostin|tartin|vol au vent|finger)/], ['unico', /\b(pizz|focacc|torta salata|quiche|piatto unico|panin|piadin|burger|cous ?cous|poke|insalatona)/]];
const MEATFISH = /\b(carne|manzo|vitell|maial|pollo|tacchin|agnell|coniglio|salsicc|prosciutt|pancett|guancial|speck|salam|mortadell|bresaol|wurstel|ragù|ragu|macinat|bistecc|fegat|anatra|cotechin|zampone|lardo|nduja|pesce|tonno|salmon|merluzz|baccal|gamber|cozz|vongol|calamar|seppi|polp|acciug|alic|sgombr|branzin|orata|trot|sogliol|scampi|aragost|granchi|surimi|brodo di (carne|pollo|manzo))/;
const tipoOf = r => r.tipo || (TIPO_RX.find(([, rx]) => rx.test(norm(r.name || ''))) || [''])[0] || ((r.tags || []).map(norm).find(t => TIPI.some(([k]) => k === t)) || '');
const isVeg = r => r.veg != null ? !!r.veg : !MEATFISH.test(norm([r.name, ...(r.ingr || []).map(i => i.n)].join(' ')));
const fastOf = r => +r.tempo > 0 && +r.tempo <= 30;
let PROPS = LS.get('aiprop', []);
const propSave = () => { PROPS = PROPS.slice(0, 120); LS.set('aiprop', PROPS) };
function propUpsert(r) { const i = PROPS.findIndex(p => p.pid === r.pid || norm(p.name) === norm(r.name)); const { link, ...v } = r; if (i >= 0) { v.pid = PROPS[i].pid; v.rid = PROPS[i].rid || v.rid; if (PROPS[i] !== r) Object.assign(PROPS[i], v); if (!r.link) delete PROPS[i].link } else PROPS.unshift(v); propSave(); return i >= 0 ? PROPS[i] : PROPS[0] }
const propGet = pid => PROPS.find(p => p.pid === pid);
const persistItem = p => { if (p.pid) propUpsert(p); else if (p.id) { const { id, ...v } = p; save('libro', id, v) } };
const srcBadge = p => p.pid ? `<span class="src ${p.fonte ? (/cucchiaio/i.test(p.fonte) ? 'cu' : 'gz') : 'gm'}">${p.fonte ? esc(p.fonte) : 'Idea di Gemini'}</span>` : `<span class="src lb">Libro mastro${p.fonte ? ' · ' + esc(p.fonte) : ''}</span>`;
const propSaved = p => p.rid && S.ric.some(r => r.id === p.rid);
const linkOf = p => p.url || (p.pid && p.fonte ? siteSearch(p.name, p.fonte) : '');

async function fetchProc(p) {
  let y = null;
  if (p.url) { try { const x = await gemini([{ text: `Apri questa pagina: ${p.url} ed estrai la ricetta che contiene, in italiano. Rispondi SOLO con JSON: ` + RIC_FMT }], null, { tools: [{ url_context: {} }] }); y = toRic((x && x.ricetta) || x || {}); if (!y.passi) y = null } catch (e) { console.warn('pagina', e) } }
  if (!y) { const x = await gemini([{ text: `Scrivi il procedimento della ricetta "${p.name}"${p.fonte ? ' come la propone ' + p.fonte : ''}, in italiano, passo per passo, semplice e preciso. Ingredienti: ${(p.ingr || []).map(i => i.n + (i.q != null ? ' ' + i.q + ' ' + i.u : '')).join(', ')}. Mantieni questi ingredienti. Rispondi SOLO con JSON: ` + RIC_FMT }]); y = toRic((x && x.ricetta) || x || {}); if (y.passi) p.procAi = true; y.ingr = [] }
  if (y.ingr.length) { p.ingr = y.ingr; p.porz = y.porz || p.porz } if (y.passi) p.passi = y.passi; if (y.tempo && !p.tempo) p.tempo = y.tempo; persistItem(p); return !!y.passi
}
async function saveProp(p, btn) {
  if (propSaved(p)) { ricModal(p.rid); return }
  if (btn) { btn.disabled = true; btn.textContent = !p.passi ? 'Prendo il procedimento…' : 'Salvo…' }
  if (!p.passi) { try { await fetchProc(p) } catch (e) { console.warn(e) } }
  const data = { name: p.name, porz: +p.porz || 4, tempo: p.tempo || '', ingr: p.ingr || [], passi: p.passi || (linkOf(p) ? 'Procedimento sul sito: ' + linkOf(p) : ''), tags: [p.pid ? 'proposta' : 'dal libro mastro'], tipo: tipoOf(p), veg: isVeg(p), ...(p.url ? { url: p.url, fonte: p.fonte || '' } : !p.pid && p.fonte ? { fonte: p.fonte } : {}) };
  p.rid = save('ricette', null, data); persistItem(p); logA('ha salvato la ricetta ' + p.name);
  if (btn) { btn.disabled = false; btn.textContent = 'Salvata ✓'; btn.classList.remove('bp'); btn.classList.add('bg') }
  toast('Ricetta salvata in Ricette'); return p.rid
}

function propModal(pid, back, kind) {
  const lib = kind === 'libro'; const p = lib ? S.libro.find(x => x.id === pid) : propGet(pid); if (!p) return; const n = +p.porz || 4;
  const st = (p.ingr || []).map(i => ({ i, s: ingStatus(i, 1) })); const need = st.filter(x => x.s.st !== 'y'); const lk = linkOf(p);
  modal(`${back ? '<button class="lnk backl" id="pback">‹ Torna all\'elenco</button>' : ''}<h2>${esc(p.name)}</h2>
  <p class="sub">${srcBadge(p)} ${[p.tempo ? p.tempo + ' min' : '', 'per ' + n, COURSE_L[tipoOf(p)] || '', isVeg(p) ? 'vegetariana' : ''].filter(Boolean).map(esc).join(' · ')}</p>
  ${p.why ? `<p class="why">${esc(p.why)}</p>` : ''}
  <h3>Ingredienti</h3><ul class="ing">${st.map(({ i, s }) => `<li class="${s.st}"><span class="mk">${s.st === 'y' ? '✓' : s.st === 'p' ? '!' : '✗'}</span><span>${esc(i.n)}</span><span class="q">${fmtQ(i.q, i.u)}</span></li>`).join('') || '<li>Ingredienti non indicati.</li>'}</ul>
  ${p.passi ? `<h3>Preparazione</h3><ol class="steps">${String(p.passi).split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => `<li>${esc(s.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol>` : `<p style="margin-top:14px"><button class="bg wide" id="proc">${p.url ? 'Leggi il procedimento dal sito' : 'Mostra il procedimento'}</button></p>`}${p.passi && p.procAi ? '<p class="hint">Procedimento scritto da Gemini: può essere un po\' diverso da quello del sito.</p>' : ''}
  ${lk ? `<p class="srclnk"><a href="${esc(lk)}" target="_blank" rel="noopener">${p.url ? 'Apri la ricetta originale' : 'Cerca la ricetta'}${p.fonte ? ' su ' + esc(p.fonte) : ''} ↗</a></p>` : ''}
  <div id="ask"></div>
  <div class="acts">${lib ? '<button class="bd" id="pdel">Togli dal libro</button>' : ''}${need.length ? `<button class="bg" id="pbuy">Metti in spesa (${need.length})</button>` : ''}<button class="${propSaved(p) ? 'bg' : 'bp'}" id="psave">${propSaved(p) ? 'Salvata ✓ · Apri' : 'Salva tra le ricette'}</button></div>`, m => {
    const q = s => m.querySelector(s);
    if (q('#pback')) q('#pback').onclick = back;
    if (q('#pdel')) q('#pdel').onclick = () => { close(); delU('libro', p.id, p.name) };
    if (q('#proc')) q('#proc').onclick = async e => { e.target.disabled = true; e.target.textContent = p.url ? 'Leggo la pagina…' : 'Lo chiedo a Gemini…'; try { const ok = await fetchProc(p); if (ok) propModal(pid, back, kind); else { e.target.disabled = false; e.target.textContent = 'Non ci sono riuscito: riprova'; } } catch (x) { e.target.disabled = false; e.target.textContent = 'Non è andata (' + (x.message || x) + '): riprova' } };
    if (q('#pbuy')) q('#pbuy').onclick = e => { addToSpesa(need.map(x => ({ name: x.i.n, qty: x.s.need.q == null ? null : round(x.s.need.q), unit: x.s.need.u, from: p.name }))); e.target.disabled = true; e.target.textContent = 'In spesa ✓'; toast(`${need.length} ${need.length === 1 ? 'ingrediente messo' : 'ingredienti messi'} in lista della spesa`) };
    q('#psave').onclick = e => { if (propSaved(p)) ricModal(p.rid); else saveProp(p, e.target).then(() => { const b = q('#psave'); if (b) b.textContent = 'Salvata ✓ · Apri' }) };
    askBox(q('#ask'), 'p:' + pid, () => p, { label: lib ? 'Salva come nuova (le ricette del libro restano com\'erano)' : 'Usa questa versione', apply: lib ? null : x => { const y = toRic(x); Object.assign(p, { name: y.name || p.name, ingr: y.ingr.length ? y.ingr : p.ingr, passi: y.passi || p.passi, porz: y.porz || p.porz, tempo: y.tempo || p.tempo }); delete p.veg; propUpsert(p); propModal(pid, back); toast('Ricetta aggiornata con la variazione') } })
  })
}

/* chiedi a Gemini su una ricetta: domande e variazioni, anche a voce */
const CHAT = {};
const ASK_SUGG = ['Versione vegetariana', 'Più leggera', 'Senza forno', 'Con quello che ho in casa', 'Dimezza le dosi', 'Cosa posso preparare prima?'];
function askBox(el, key, getR, opts = {}) {
  if (!el) return; const log = CHAT[key] || (CHAT[key] = []);
  if (!gkey()) { el.innerHTML = `<h3>Chiedi a Gemini</h3><p class="hint">Per fare domande sulla ricetta o chiedere variazioni serve Gemini. <button class="lnk" data-act="settings">Attivalo nelle impostazioni</button>.</p>`; return }
  const bubble = (x, i) => x.who === 'u' ? `<div class="bub u">${esc(x.t)}</div>` : `<div class="bub a">${esc(x.t).replace(/\n/g, '<br>')}${x.r ? `<div class="var"><b>${esc(x.r.nome || 'Variazione')}</b><small>${(x.r.ingredienti || []).map(g => esc(g.n)).join(', ')}</small><div class="row">${opts.apply ? `<button class="bg" data-ap="${i}">${esc(opts.label || 'Sostituisci la ricetta')}</button>` : ''}<button class="bp" data-nw="${i}">Salva come nuova</button></div></div>` : ''}</div>`;
  el.innerHTML = `<h3>Chiedi a Gemini</h3><p class="hint">Domande sul procedimento, sostituzioni, varianti. Puoi anche parlare.</p><div class="chat"></div>
  <div class="chips">${ASK_SUGG.map(s => `<button type="button" class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <form class="qa askf"><input name="q" placeholder="Es. posso usare il burro al posto dell'olio?" autocomplete="off" enterkeyhint="send">${micHtml()}<button class="bp">Chiedi</button></form>`;
  const chat = el.querySelector('.chat'), f = el.querySelector('form'), inp = E(f, 'q');
  const draw = (busy) => { chat.innerHTML = log.map(bubble).join('') + (busy ? '<div class="bub a load">Ci penso…</div>' : ''); chat.hidden = !log.length && !busy;
    chat.querySelectorAll('[data-ap]').forEach(b => b.onclick = () => opts.apply(log[+b.dataset.ap].r));
    chat.querySelectorAll('[data-nw]').forEach(b => b.onclick = () => { const r0 = getR(); const y = toRic(log[+b.dataset.nw].r); const id = save('ricette', null, { ...y, name: y.name || r0.name + ' (variante)', tags: ['variante'], tipo: tipoOf(r0) }); toast('Variante salvata in Ricette'); ricModal(id) }) };
  draw(false); wireMic(f, inp);
  let busy = false;
  const ask = async t => {
    if (busy || !t) return; busy = true; log.push({ who: 'u', t }); inp.value = ''; draw(true);
    const r = getR(); const hist = log.slice(-7, -1).map(x => (x.who === 'u' ? 'Famiglia: ' : 'Tu: ') + x.t).join('\n');
    const p = `Sei un cuoco di casa italiano esperto, pratico e gentile. Stiamo parlando di questa ricetta:\n\n${r.name}\n${recipeText(r, +r.porz || 4)}\n\nIn casa hanno: ${S.disp.filter(d => !zero(d)).map(d => d.name).join(', ') || 'non si sa'}.${tastesText() ? '\nGusti della famiglia: ' + tastesText() + '.' : ''}${hist ? '\n\nConversazione finora:\n' + hist : ''}\n\nNuova domanda della famiglia: ${t}\n\nRispondi in italiano, in modo semplice e pratico, al massimo 120 parole, senza markdown. Se la domanda chiede di cambiare la ricetta (una variante, una sostituzione, dosi diverse, una versione diversa), metti in "ricetta" la ricetta completa modificata; altrimenti "ricetta" è null.\nRispondi SOLO con JSON: {"risposta":"...","ricetta":null} oppure con "ricetta" nella forma ${RIC_FMT}`;
    try { const res = await gemini([{ text: p }]); const rr = res && res.ricetta && res.ricetta.ingredienti ? res.ricetta : null; log.push({ who: 'a', t: String((res && res.risposta) || (rr ? 'Ecco la versione modificata.' : 'Non ho una risposta, prova a chiedere in un altro modo.')), r: rr }) }
    catch (e) { log.push({ who: 'a', t: 'Non è andata: ' + (e.message || e) }) }
    busy = false; if (chat.isConnected) { draw(false); chat.lastElementChild && chat.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }
  };
  f.onsubmit = e => { e.preventDefault(); ask(inp.value.trim()) };
  el.querySelectorAll('.chips .chip').forEach(b => b.onclick = () => ask(b.dataset.s));
}

/* elenco ricette e proposte: filtri e ordinamento */
const SORTS = [['casa', 'cosa avete'], ['tempo', 'più veloci'], ['nome', 'nome'], ['recenti', 'più recenti']];
function filterBar(prop) {
  const f = S.rf || (S.rf = { tipo: '', fast: false, veg: false, can: false, fonte: '', sort: 'casa' });
  const c = (act, v, on, l) => `<button class="chip${on ? ' on' : ''}" data-act="${act}" data-v="${v}">${l}</button>`;
  return `<div class="fbar">${c('rfs', '', false, 'Ordina: ' + (SORTS.find(s => s[0] === f.sort) || SORTS[0])[1] + ' ▾')}${c('rft', 'can', f.can, 'Si può fare')}${c('rft', 'fast', f.fast, 'Veloci')}${c('rft', 'veg', f.veg, 'Vegetariane')}${TIPI.map(([k, l]) => c('rftipo', k, f.tipo === k, l)).join('')}${(prop === 'libro' ? [...new Set(S.libro.map(r => r.fonte).filter(Boolean))].slice(0, 14).map(x => [x, x.length > 22 ? x.slice(0, 20) + '…' : x]) : prop ? [['GialloZafferano', 'GialloZafferano'], ['Cucchiaio d\'Argento', 'Cucchiaio'], ['gemini', 'Gemini']] : []).map(([k, l]) => c('rffonte', esc(k), f.fonte === k, esc(l))).join('')}</div>`
}
function applyFilters(L, prop) {
  const f = S.rf || {}; const q = norm(S.rq || '');
  let out = L.map(r => ({ r, m: match(r) })).filter(({ r, m }) => (!q || norm(r.name).includes(q) || (r.ingr || []).some(i => norm(i.n).includes(q)) || norm((r.tags || []).join(' ')).includes(q)) && (!f.can || !m.miss.length) && (!f.fast || fastOf(r)) && (!f.veg || isVeg(r)) && (!f.tipo || tipoOf(r) === f.tipo) && (!prop || !f.fonte || (f.fonte === 'gemini' && prop !== 'libro' ? !r.fonte : r.fonte === f.fonte)));
  const by = { casa: (a, b) => (a.m.miss.length - b.m.miss.length) || String(a.r.name).localeCompare(b.r.name, 'it'), tempo: (a, b) => (+a.r.tempo || 999) - (+b.r.tempo || 999), nome: (a, b) => String(a.r.name).localeCompare(b.r.name, 'it'), recenti: (a, b) => (b.r.ts || 0) - (a.r.ts || 0) }[f.sort || 'casa'];
  return out.sort(by)
}
function renderProps() {
  const L = applyFilters(PROPS, true);
  $('#rlist').innerHTML = (PROPS.length ? '' : '<li class="empty">Qui trovi tutte le ricette che ti ha proposto "Trova ricette", anche dopo aver chiuso. Tocca + e poi "Trova ricette".</li>') + L.map(({ r, m }) => `<li class="rc prc"><button data-act="popen" data-pid="${esc(r.pid)}"><span class="ih"><span class="src ${r.fonte ? (/cucchiaio/i.test(r.fonte) ? 'cu' : 'gz') : 'gm'}">${r.fonte ? esc(r.fonte) : 'Gemini'}</span>${propSaved(r) ? '<span class="svd">✓ salvata</span>' : ''}</span><b>${esc(r.name)}</b><span class="meta">${[r.tempo ? r.tempo + ' min' : '', COURSE_L[tipoOf(r)] || '', isVeg(r) ? 'vegetariana' : ''].filter(Boolean).map(esc).join(' · ')}</span><span class="mt">${m.miss.length ? `Mancano ${m.miss.length}: ${m.miss.slice(0, 4).map(i => esc(i.n)).join(', ')}${m.miss.length > 4 ? '…' : ''}` : 'Hai tutto in casa'}</span></button><button class="x" data-act="pdel" data-pid="${esc(r.pid)}" aria-label="Togli">×</button></li>`).join('')
    + (PROPS.length && !L.length ? '<li class="empty">Nessuna proposta con questi filtri.</li>' : '') + (PROPS.length ? '<li class="pcl"><button class="lnk" data-act="pclear">Svuota le proposte</button></li>' : '')
}
function renderLibro() {
  const L0 = applyFilters(S.libro, 'libro'); const L = L0.slice(0, S.lmax || 60);
  $('#rlist').innerHTML = (S.libro.length ? '' : '<li class="empty"><b>Il Libro mastro è vuoto.</b><br>Qui finiscono le ricette importate dai PDF o dai file: le sfogli, Gemini te le può proporre, e tra le tue Ricette metti solo quelle che ti piacciono. Tocca + e poi "Tante ricette insieme".</li>')
    + L.map(({ r, m }) => `<li class="rc prc"><button data-act="lopen" data-id="${esc(r.id)}"><span class="ih">${r.fonte ? `<span class="src lb">${esc(r.fonte)}</span>` : ''}${r.rid && S.ric.some(x => x.id === r.rid) ? '<span class="svd">✓ tra le ricette</span>' : ''}</span><b>${esc(r.name)}</b><span class="meta">${[r.tempo ? r.tempo + ' min' : '', COURSE_L[tipoOf(r)] || '', isVeg(r) ? 'vegetariana' : ''].filter(Boolean).map(esc).join(' · ')}</span><span class="mt">${m.miss.length ? `Mancano ${m.miss.length}: ${m.miss.slice(0, 4).map(i => esc(i.n)).join(', ')}${m.miss.length > 4 ? '…' : ''}` : 'Hai tutto in casa'}</span></button></li>`).join('')
    + (S.libro.length && !L.length ? '<li class="empty">Nessuna ricetta con questi filtri.</li>' : '') + (L0.length > L.length ? `<li class="pcl"><button class="bg wide" data-act="lmore">Mostra altre (${L0.length - L.length})</button></li>` : '')
    + (S.libro.length ? `<li class="pcl">${(S.rf || {}).fonte ? `<button class="lnk" data-act="lclear" data-f="${esc(S.rf.fonte)}">Togli tutte le ricette di ${esc(S.rf.fonte)}</button><br>` : ''}<button class="lnk" data-act="lclear">Svuota il Libro mastro</button></li>` : '')
}
async function classifyRics() {
  const L = S.ric.filter(r => !r.tipo); if (!L.length || !gkey()) return; toast('Classifico ' + L.length + ' ricette…');
  try { const res = await gemini([{ text: `Classifica queste ricette italiane. Per ognuna dai "tipo" (uno tra antipasto, primo, secondo, contorno, unico, dolce) e "veg" (true se vegetariana, cioè senza carne e pesce).\n${L.map((r, i) => `${i}. ${r.name}: ${(r.ingr || []).map(x => x.n).join(', ')}`).join('\n')}\nRispondi SOLO con JSON: {"r":[{"i":0,"tipo":"primo","veg":true}]}` }]);
    let k = 0; ((res && res.r) || []).forEach(x => { const r = L[+x.i]; if (r && TIPI.some(([t]) => t === x.tipo)) { save('ricette', r.id, { ...r, tipo: x.tipo, veg: !!x.veg }); k++ } }); toast(k ? `${k} ricette classificate` : 'Gemini non ha risposto, riprova') }
  catch (e) { toast('Non è andata: ' + (e.message || e)) }
}

/* ---------- tante ricette insieme: da PDF (Gemini) o da file .json ---------- */
const BOOK_FMT = '{"ricette":[{"nome":"...","porzioni":4,"tempo":30,"tipo":"antipasto o primo o secondo o contorno o unico o dolce","veg":true,"ingredienti":[{"n":"nome in minuscolo","q":200,"u":"g"}],"passi":["..."]}],"finito":true} dove "u" è uno tra g, kg, ml, l, pz, cucchiai, cucchiaini, spicchi, fette, qb e "q" è un numero o null';
function normRic(x, fonte) {
  if (!x || typeof x !== 'object') return null;
  const r = x.nome || x.ingredienti ? toRic(x) : { name: String(x.name || ''), porz: +x.porz || 4, tempo: +x.tempo || '', ingr: (x.ingr || []).filter(i => i && i.n).map(i => ({ n: String(i.n), q: i.q == null || i.q === '' ? null : +i.q, u: UNITS.includes(i.u) ? i.u : (UMAP[i.u] || 'pz') })), passi: Array.isArray(x.passi) ? x.passi.join('\n') : String(x.passi || ''), tags: Array.isArray(x.tags) ? x.tags : [] };
  if (Array.isArray(x.righe) && x.righe.length) r.ingr = x.righe.map(l => parseLine(String(l))).filter(Boolean).map(({ ux, ...i }) => i);
  if (x.porz) r.porz = +x.porz || r.porz; if (x.tempo) r.tempo = +x.tempo || r.tempo;
  if (!r.name) return null;
  const t = x.tipo; if (TIPI.some(([k]) => k === t)) r.tipo = t; if (typeof x.veg === 'boolean') r.veg = x.veg;
  r.fonte = String(x.fonte || fonte || ''); if (x.pagina) r.pagina = x.pagina; return r
}
function ricFileModal() {
  modal(`<h2>Tante ricette insieme</h2><p class="sub">Carica un PDF con delle ricette (un ricettario, appunti, stampe): Gemini le trova tutte e le mette nel Libro mastro, senza riempire le tue Ricette. Oppure carica un file di ricette già pronto (.json).</p>
  <div class="acts-l" style="margin-top:0"><label class="act" style="cursor:pointer"><span class="ai">${IC.rec}</span><span><b>Da un PDF</b><small>Fino a circa 20 MB, serve Gemini</small></span><input type="file" id="bpdf" accept="application/pdf,.pdf" hidden></label><label class="act" style="cursor:pointer"><span class="ai">${IC.down}</span><span><b>Da un file di ricette (.json)</b><small>Per esempio quello preparato da Claude</small></span><input type="file" id="bjson" accept="application/json,.json" hidden></label></div>
  <p class="load" id="bst" hidden></p>`, m => {
    const st = t => { const e = m.querySelector('#bst'); if (e) { e.hidden = !t; e.textContent = t } };
    m.querySelector('#bjson').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      try { const j = JSON.parse(await f.text()); const arr = Array.isArray(j) ? j : (j.ricette || j.recipes || []); const L = arr.map(x => normRic(x, j.fonte || f.name.replace(/\.json$/i, ''))).filter(Boolean); if (!L.length) { st('In questo file non ho trovato ricette.'); return } bulkReview(L, f.name) }
      catch (x) { st('Il file non si legge: ' + (x.message || x)) } };
    m.querySelector('#bpdf').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!gkey()) { st('Per leggere i PDF serve Gemini: attivalo nelle Impostazioni. In alternativa manda il PDF a Claude e importa il file .json che ti prepara.'); return }
      if (f.size > 19 * 1024 * 1024) { st('Il PDF è troppo grande (più di 19 MB). Dividilo in parti più piccole, oppure mandalo a Claude.'); return }
      const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(f) });
      const fonte = f.name.replace(/\.pdf$/i, ''); const all = [];
      try {
        for (let round = 0; round < 12; round++) {
          st(`Leggo il PDF… ${all.length ? all.length + ' ricette trovate finora' : 'può volerci qualche minuto'}`);
          const p = `Questo PDF contiene ricette di cucina. Trascrivi in italiano le ricette che contiene, fedelmente, senza inventare niente: nome, porzioni, tempo totale in minuti se indicato, tipo di piatto, se è vegetariana, ingredienti con quantità e passi del procedimento.${all.length ? `\nHai già trascritto queste ${all.length} ricette: ${all.map(r => r.name).join('; ')}. Continua con le ricette successive, senza ripeterle.` : ''}\nTrascrivi al massimo 15 ricette per volta. Metti "finito": true se non ci sono altre ricette dopo queste, altrimenti false.\nRispondi SOLO con JSON in questa forma: ${BOOK_FMT}`;
          const res = await gemini([{ text: p }, { inline_data: { mime_type: 'application/pdf', data } }], null, { ms: 120000 });
          const got = ((res && res.ricette) || []).map(x => normRic(x, fonte)).filter(r => r && !all.some(o => norm(o.name) === norm(r.name)));
          all.push(...got); if (!got.length || res.finito !== false) break
        }
        if (!all.length) { st('Non ho trovato ricette in questo PDF. Se è una scansione poco leggibile, prova a mandarlo a Claude.'); return }
        bulkReview(all, f.name)
      } catch (x) { if (all.length) { toast('Mi sono fermato a metà: ' + (x.message || x)); bulkReview(all, f.name) } else st('Non è andata: ' + (x.message || x)) }
    };
  })
}
function bulkReview(L, label) {
  const dup = r => S.libro.some(o => norm(o.name) === norm(r.name));
  const sel = L.map(r => !dup(r));
  modal(`<h2>${L.length === 1 ? '1 ricetta trovata' : L.length + ' ricette trovate'}</h2><p class="sub">Da <b>${esc(label)}</b>. Vanno nel <b>Libro mastro</b>, non tra le tue Ricette: lì le sfogli, Gemini te le può proporre, e salvi solo quelle che ti piacciono. Togli la spunta a quelle che non vuoi; quelle già presenti nel libro sono senza spunta.</p>
  <div class="row" style="margin-bottom:6px"><button class="bg" id="ball">Tutte</button><button class="bg" id="bnone">Nessuna</button></div>
  <div class="card bulk">${L.map((r, i) => `<label class="bk"><input type="checkbox" data-i="${i}"${sel[i] ? ' checked' : ''}><span><b>${esc(r.name)}</b><small>${[COURSE_L[tipoOf(r)] || '', r.tempo ? r.tempo + ' min' : '', ((r.ingr || []).length === 1 ? '1 ingrediente' : (r.ingr || []).length + ' ingredienti'), r.passi ? '' : 'senza procedimento', dup(r) ? 'già nel libro: se la spunti la aggiorno' : ''].filter(Boolean).map(esc).join(' · ')}</small></span></label>`).join('')}</div>
  <div class="acts"><button class="bg" data-act="close">Annulla</button><button class="bp" id="bsave"></button></div>`, m => {
    const boxes = [...m.querySelectorAll('.bulk input')]; const btn = m.querySelector('#bsave');
    const upd = () => { const n = boxes.filter(b => b.checked).length; btn.textContent = n ? `Metti ${n === 1 ? '1 ricetta' : n + ' ricette'} nel Libro mastro` : 'Metti nel Libro mastro'; btn.disabled = !n };
    boxes.forEach(b => b.onchange = upd); upd();
    m.querySelector('#ball').onclick = () => { boxes.forEach(b => b.checked = true); upd() }; m.querySelector('#bnone').onclick = () => { boxes.forEach(b => b.checked = false); upd() };
    btn.onclick = () => { const pick = boxes.filter(b => b.checked).map(b => L[+b.dataset.i]); const now = Date.now(); saveMany('libro', pick.map((r, i) => { const old = S.libro.find(o => norm(o.name) === norm(r.name)); return old ? { ...r, id: old.id, ts: old.ts || now + i, ...(old.rid ? { rid: old.rid } : {}) } : { ...r, ts: now + i } })); logA(`ha messo ${pick.length} ricette nel Libro mastro (${label})`); close(); S.rview = 'libro'; if (S.rf) S.rf.fonte = ''; go('ricette'); render(); toast(`${pick.length === 1 ? '1 ricetta' : pick.length + ' ricette'} nel Libro mastro`) };
  })
}

/* ---------- eventi ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'modal') { close(); return } const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, ds = b.dataset;
  if (a === 'close') close(); else if (a === 'reload') location.reload(); else if (a === 'tab') go(ds.v); else if (a === 'live') liveScan(); else if (a === 'osp') guestModal(ds.d, ds.meal); else if (a === 'chef') cycleChef(ds.d, ds.meal); else if (a === 'plan') planModal(); else if (a === 'miss') missModal(); else if (a === 'shop') shopMode();
  else if (a === 'shtog') { const x = S.spesa.find(y => y.id === ds.id); if (x) save('spesa', x.id, { ...x, done: !x.done }) }
  else if (a === 'shend') { const L = S.spesa.filter(x => x.done); close(); L.forEach(x => { mergeDisp({ name: x.name, qty: x.qty, unit: x.unit, ux: x.qty != null }); del('spesa', x.id) }); logA('ha messo in dispensa la spesa: ' + listTxt(L.map(x => x.name))); toast(`${L.length} cose messe in dispensa`) }
  else if (a === 'rate') rateDish(ds.k, +ds.v); else if (a === 'eatadd') eatAdd(ds.k); else if (a === 'rplus') ricSheet(); else if (a === 'rimp') importModal(); else if (a === 'rview') { S.rview = ds.v; S.lmax = 60; if (S.rf) S.rf.fonte = ''; render() }
  else if (a === 'lclear') libroClear(ds.f || ''); else if (a === 'lmore') { S.lmax = (S.lmax || 60) + 60; render() } else if (a === 'popen') propModal(ds.pid); else if (a === 'lopen') propModal(ds.id, null, 'libro'); else if (a === 'pdel') { const old = PROPS.slice(); PROPS = PROPS.filter(x => x.pid !== ds.pid); propSave(); render(); toast('Proposta tolta', () => { PROPS = old; propSave(); render() }) }
  else if (a === 'pclear') { const old = PROPS.slice(); PROPS = []; propSave(); render(); toast('Proposte svuotate', () => { PROPS = old; propSave(); render() }) }
  else if (a === 'rfs') { const f = S.rf; const i = SORTS.findIndex(x => x[0] === f.sort); f.sort = SORTS[(i + 1) % SORTS.length][0]; render() }
  else if (a === 'rft') { S.rf[ds.v] = !S.rf[ds.v]; render() } else if (a === 'rftipo') { S.rf.tipo = S.rf.tipo === ds.v ? '' : ds.v; render() } else if (a === 'rffonte') { S.rf.fonte = S.rf.fonte === ds.v ? '' : ds.v; render() }
  else if (a === 'rclass') classifyRics(); else if (a === 'rfile') ricFileModal();
  else if (a === 'briefx') { LS.set('brief', today()); render() }
  else if (a === 'spchi') { const o = ['', ...members().map(m => m.id)]; const nx = o[(o.indexOf(S.spesaChi || '') + 1) % o.length]; S.spesaChi = nx; render(); if (F) F.fs.setDoc(famRef(), { spesaChi: nx || F.fs.deleteField() }, { merge: true }).catch(werr); const nm = (members().find(m => m.id === nx) || {}).name; if (nm) logA(`ha segnato che ${nm} va a fare la spesa`) } else if (a === 'who') whoModal(); else if (a === 'settings') settingsModal();
  else if (a === 'wk') { S.week += +ds.v; S.sel = null; subWeek(); render() } else if (a === 'wk0') { S.week = 0; S.sel = null; subWeek(); render() } else if (a === 'sel') { S.sel = ds.d; render() } else if (a === 'pick') togglePick(ds.d, ds.meal, +ds.i); else if (a === 'cook') cookMeal(ds.d, ds.meal); else if (a === 'leftover') leftoverModal(ds.d, ds.meal); else if (a === 'spese') speseModal(); else if (a === 'uncook') undoCook(ds.d, ds.meal); else if (a === 'dplus') addSheet(); else if (a === 'fold') { const i = S.fold.indexOf(ds.v); if (i >= 0) S.fold.splice(i, 1); else S.fold.push(ds.v); LS.set('fold', S.fold); render() } else if (a === 'ddel') delU('dispensa', ds.id); else if (a === 'migok' || a === 'migno') { const L = S.disp.filter(d => !isLv(d) && !d.trackSet && !zero(d) && prof(d.name).lv); L.forEach(d => save('dispensa', d.id, a === 'migok' ? { ...d, track: 'livello', trackSet: true, unit: LV_UNITS.includes(d.unit) && d.unit !== 'pz' ? d.unit : 'conf', qty: d.qty || 1, lvl: 'pieno' } : { ...d, trackSet: true })); if (a === 'migok') toast(`${L.length} prodotti ora si contano per livello`) }
  else if (a === 'tog') { const p = pres(ds.d, ds.m); const on = p[ds.meal] === false; setPres(ds.d, ds.m, { [ds.meal]: on }); const who = (members().find(x => x.id === ds.m) || {}).name; logA(`ha segnato ${who === meName() ? 'di' : who} ${on ? 'esserci' : 'non esserci'} a ${MEALS.find(x => x[0] === ds.meal)[1].toLowerCase()} di ${dayFmt.format(dt(ds.d))}`.replace('segnato di esserci', 'segnato che c\'è').replace('segnato di non esserci', 'segnato che non c\'è')) }
  else if (a === 'menu') menuModal(ds.d, ds.meal); else if (a === 'imp') impModal(ds.d);
  else if (a === 'delimp') { const p = pres(ds.d, ds.m); const old = p.imp || []; setPres(ds.d, ds.m, { imp: old.filter((_, i) => i !== +ds.i) }); toast('Impegno eliminato', () => setPres(ds.d, ds.m, { imp: old })) }
  else if (a === 'luogo') { S.luogo = ds.v; render() } else if (a === 'photo') photoModal(); else if (a === 'dadd') dispModal(); else if (a === 'dbulk') bulkModal(); else if (a === 'scan') scanModal();
  else if (a === 'dedit') dispModal(S.disp.find(x => x.id === ds.id));
  else if (a === 'dq') { const d = S.disp.find(x => x.id === ds.id); if (d) save('dispensa', d.id, { ...d, qty: Math.max(0, round((d.qty || 0) + (+ds.v) * stepFor(d.unit))) }) }
  else if (a === 'dzero') { const d = S.disp.find(x => x.id === ds.id); if (d) { save('dispensa', d.id, { ...d, qty: 0 }); addToSpesa([{ name: d.name, qty: null, unit: spesaUnit(d.name) }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'd2spesa') { const d = S.disp.find(x => x.id === ds.id); if (d) { addToSpesa([{ name: d.name, qty: null, unit: spesaUnit(d.name) }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'ropen') ricModal(ds.id); else if (a === 'rnew') ricEdit(); else if (a === 'ai') aiModal();
  else if (a === 'spdel') delU('spesa', ds.id); else if (a === 'spq') { const x = (S._sugg || [])[+ds.i]; if (x) { addToSpesa([{ name: x.name, qty: null, unit: spesaUnit(x.name) }]); toast(x.name + ' in lista') } }
  else if (a === 'sp2disp') { const L = S.spesa.filter(x => x.done); L.forEach(x => { mergeDisp({ name: x.name, qty: x.qty, unit: x.unit, ux: x.qty != null }); del('spesa', x.id) }); logA('ha messo in dispensa la spesa: ' + listTxt(L.map(x => x.name))); toast(`${L.length} cose messe in dispensa`) }
  else if (a === 'spclear') { const L = S.spesa.filter(x => x.done); L.forEach(x => del('spesa', x.id)); toast(`${L.length} tolti dalla lista`, () => L.forEach(({ id, ...d }) => save('spesa', id, d))) }
  else if (a === 'keepspesa') { const L = S.spesa.filter(x => !x.done); if (!L.length) { toast('La lista è vuota'); return } shareText('Spesa', L.map(x => x.name + (x.qty != null ? ` (${fmtQ(x.qty, x.unit)})` : '')).join('\n')) }
  else if (a === 'keepdisp') { if (!S.disp.length) { toast('La dispensa è vuota'); return } shareText('In casa', LUOGHI.map(([k, l]) => { const L = S.disp.filter(d => d.luogo === k && !(typeof d.qty === 'number' && d.qty <= 0)); return L.length ? `${l}:\n${L.map(d => `- ${d.name}${d.qty != null ? ' ' + fmtQ(d.qty, d.unit) : ''}${d.scad ? ' (scade ' + scadTxt(d.scad) + ')' : ''}`).join('\n')}` : '' }).filter(Boolean).join('\n\n')) }
});
document.addEventListener('change', e => { const id = e.target.dataset && e.target.dataset.sp; if (id) { const x = S.spesa.find(s => s.id === id); if (x) save('spesa', id, { ...x, done: e.target.checked }) } });
$('#q').addEventListener('input', e => { S.q = e.target.value; renderDisp() });
$('#rq').addEventListener('input', e => { S.rq = e.target.value; renderRic() });
$('#spmic').innerHTML = micHtml(); wireMic($('#spadd'), $('#spin'));
$('#spadd').addEventListener('submit', e => { e.preventDefault(); const L = parseMany($('#spin').value); if (!L.length) return; addToSpesa(L.map(p => ({ name: p.n, qty: p.q, unit: p.ux && p.u !== 'qb' ? p.u : spesaUnit(p.n) }))); $('#spin').value = ''; if (L.length > 1) toast(`${L.length} cose in lista`) });

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
    sub('dispensa', 'disp'); sub('ricette', 'ric'); sub('libro', 'libro'); sub('spesa', 'spesa'); sub('spese', 'spese'); subWeek();
    fs.onSnapshot(dref('stats', 'acquisti'), d => { S.stats = (d.exists() && d.data().counts) || {}; if (S.tab === 'spesa') render() }, () => { });
    fs.onSnapshot(dref('stats', 'profili'), d => { S.prof = (d.exists() && d.data().p) || {}; render() }, () => { });
    fs.onSnapshot(dref('stats', 'piatti'), d => { S.piatti = (d.exists() && d.data().counts) || {}; if (S.tab === 'ricette') render() }, () => { });
    fs.onSnapshot(famRef(), d => {
      const v = d.exists() && d.data(); S.members = v && Array.isArray(v.members) && v.members.length === 4 ? v.members : null; S.abit = (v && v.abit) || {}; S.rico = (v && v.rico) || {}; S.famKey = (v && v.gkey) || ''; S.famTkey = (v && v.tkey) || ''; S.gusti = (v && v.gusti) || {}; S.spesaChi = (v && v.spesaChi) || ''; S.famRaw = v || {}; render(); if (v && !d.metadata.fromCache) maintain(v);
      if (!S.me && !S.asked && !d.metadata.fromCache && $('#modal').hidden) { S.asked = true; S.created ? namesModal() : whoModal() } else if (S.me && !S.asked && !LS.get('tour', 0) && $('#modal').hidden) { S.asked = true; tourModal() }
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
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  let hadCtl = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtl) { S.update = true; render() } hadCtl = true });
  navigator.serviceWorker.register('sw.js').then(reg => { const chk = () => reg.update().catch(() => { }); document.addEventListener('visibilitychange', () => { if (!document.hidden) chk() }); setInterval(chk, 30 * 60e3) }).catch(() => { })
}
if (location.hostname === 'localhost') window.__t = { S, same, parseLine, parseMany, prof, fitProf, conv, doseFor, menuNeeds, buildBackup, autoBackup, listBackups, applyBackup, tasteWarn };
