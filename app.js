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
  carbo: ['pasta', 'spaghett', 'penne', 'fusill', 'rigaton', 'maccheron', 'tagliatell', 'lasagn', 'tortellin', 'raviol', 'gnocch', 'riso', 'pane', 'panin', 'farina', 'cous cous', 'couscous', 'orzo', 'farro', 'patat', 'cracker', 'grissin', 'fette biscottate', 'piadin', 'pizza', 'polenta', 'cereali', 'avena', 'fiocchi d avena', 'quinoa', 'pangrattato', 'tramezzin', 'focacc'],
  verdura: ['carot', 'zucchin', 'pomodor', 'insalat', 'lattuga', 'spinac', 'cipoll', 'aglio', 'peperon', 'melanzan', 'broccol', 'cavol', 'cavolfior', 'finocch', 'sedan', 'piselli', 'fagiolini', 'funghi', 'zucca', 'porr', 'radicchi', 'rucola', 'cetriol', 'asparag', 'carciof', 'verdur', 'minestrone', 'basilic', 'prezzemol', 'verza', 'bietol', 'cime di rapa', 'mais', 'olive'],
  frutta: ['mela', 'mele', 'banan', 'aranc', 'pera', 'pere', 'fragol', 'uva', 'kiwi', 'limon', 'mandarin', 'clementin', 'pesca', 'pesche', 'albicocc', 'ciliegi', 'anguri', 'melon', 'ananas', 'frutta', 'prugn', 'mirtill', 'lampon', 'avocado', 'pompelm', 'cachi', 'fichi', 'noci', 'mandorl', 'nocciol'],
  proteine: ['carne', 'pollo', 'petto di pollo', 'manzo', 'maiale', 'vitell', 'tacchin', 'salsicc', 'macinat', 'hamburger', 'bistecc', 'cotolett', 'arrost', 'prosciutt', 'salam', 'speck', 'bresaol', 'mortadell', 'wurstel', 'pancett', 'affettat', 'pesce', 'salmon', 'tonno', 'merluzz', 'orata', 'branzin', 'gamber', 'calamar', 'cozze', 'vongol', 'sgombr', 'uova', 'uovo', 'legum', 'fagiol', 'ceci', 'lenticchi', 'tofu', 'seitan', 'bastoncini di pesce'],
  latticini: ['latte', 'yogurt', 'formagg', 'mozzarell', 'burro', 'panna', 'ricott', 'parmigian', 'grana', 'stracchin', 'mascarpon', 'scamorz', 'gorgonzol', 'asiago', 'philadelphia', 'fiordilatte', 'emmental', 'pecorin', 'provol', 'feta', 'kefir', 'burrata', 'crescenza', 'fontina'],
  condimenti: ['olio', 'aceto', 'sale', 'pepe', 'zucchero', 'passata', 'pelati', 'polpa di pomodoro', 'concentrato', 'sugo', 'pesto', 'maionese', 'ketchup', 'senape', 'spezie', 'origano', 'rosmarin', 'dado', 'brodo', 'salsa', 'lievito', 'curry', 'paprika', 'cannella', 'noce moscata', 'besciamella'],
  dolci: ['biscott', 'cioccolat', 'merendin', 'nutella', 'marmellat', 'confettur', 'crostat', 'torta', 'gelato', 'caramell', 'patatine', 'snack', 'wafer', 'miele', 'brioche', 'cornett', 'budino', 'pandoro', 'panettone', 'crema spalmabile'],
  bevande: ['acqua', 'succo', 'birra', 'vino', 'coca', 'aranciata', 'bibita', 'caffe', 'tisana', 'the', 'spremuta', 'latte di soia', 'bevanda', 'prosecco', 'spritz']
};
function guessCat(name) {
  const n = ' ' + norm(name); let best = 'altro', len = 0;
  for (const [c, keys] of Object.entries(CAT_KW)) for (const k of keys) if (k.length > len && n.includes(' ' + k)) { best = c; len = k.length }
  return best
}
const catOf = d => CAT_L[d.cat] ? d.cat : guessCat(d.name);

const S = { members: null, pres: {}, menu: {}, disp: [], ric: [], spesa: [], week: 0, me: LS.get('me', null), tab: TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'settimana', luogo: 'tutto', cat: 'tutte', q: '', rq: '', onlyCan: false, note: '', phase: 'start', err: '', cfg: null, fam: '', asked: false };
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
const round = x => Math.round(x * 100) / 100;
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const randCode = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return [...a].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('') };
function weekDays(off) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x }) }
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
function ingStatus(i, f) {
  if (STAPLES.includes(norm(i.n))) return { st: 'y' }; const it = haveItem(i.n); const q = i.q == null ? null : i.q * f;
  if (!it) return { st: 'n', need: { q, u: i.u || 'pz' } };
  if (q != null && i.u !== 'qb' && typeof it.qty === 'number') { const [a, ba] = toBase(q, i.u), [b, bb] = toBase(it.qty, it.unit); if (ba === bb && b < a) { const k = BASE[i.u] ? BASE[i.u][1] : 1; return { st: 'p', need: { q: (a - b) / k, u: i.u }, it } } }
  return { st: 'y', it }
}
function pres(date, mid) { return S.pres[date + '_' + mid] || { date, mid, c: true, p: true, s: true, imp: [] } }
function menuLabel(k, mk) { const v = (S.menu[k] || {})[mk]; if (!v) return ''; if (v.rid) { const r = S.ric.find(r => r.id === v.rid); if (r) return r.name } return v.t || '' }
const gkey = () => LS.get('gkey', '');

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
const KEY = { dispensa: 'disp', ricette: 'ric', spesa: 'spesa' };
function save(c, id, data) { const arr = S[KEY[c]]; id = id || rid(); const v = { ...data }; delete v.id; const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { id, ...v }; else arr.push({ id, ...v }); render(); if (F) F.fs.setDoc(dref(c, id), v).catch(werr); return id }
function del(c, id) { S[KEY[c]] = S[KEY[c]].filter(x => x.id !== id); render(); if (F) F.fs.deleteDoc(dref(c, id)).catch(werr) }
function setPres(date, mid, patch) { const k = date + '_' + mid; const v = { ...pres(date, mid), ...patch, date, mid }; S.pres[k] = v; render(); if (F) F.fs.setDoc(dref('presenze', k), v).catch(werr) }
function setMenu(k, mk, val) { const cur = { ...(S.menu[k] || {}), date: k }; if (val) cur[mk] = val; else delete cur[mk]; S.menu[k] = cur; render(); if (F) F.fs.setDoc(dref('menu', k), { date: k, [mk]: val || F.fs.deleteField() }, { merge: true }).catch(werr) }
function addToSpesa(items) {
  items.forEach(x => {
    const u = x.unit || 'pz'; const ex = S.spesa.find(s => !s.done && same(s.name, x.name) && (s.unit || 'pz') === u);
    if (ex) { const qty = ex.qty == null || x.qty == null ? (ex.qty ?? x.qty ?? null) : round(ex.qty + x.qty); const from = [...new Set([ex.from, x.from].filter(Boolean).join(', ').split(', '))].join(', '); save('spesa', ex.id, { ...ex, qty, from }) }
    else save('spesa', null, { name: x.name, qty: x.qty ?? null, unit: u, done: false, ts: Date.now(), from: x.from || '', by: S.me || '' })
  })
}
function mergeDisp(x) {
  const u = x.unit || 'pz'; const ex = S.disp.find(d => same(d.name, x.name) && (d.unit || 'pz') === u && (!x.luogo || d.luogo === x.luogo));
  if (ex) { const qty = ex.qty == null || x.qty == null ? (x.qty ?? ex.qty ?? null) : round(Math.max(0, ex.qty) + x.qty); save('dispensa', ex.id, { ...ex, qty, scad: x.scad || ex.scad || '' }) }
  else save('dispensa', null, { name: x.name, qty: x.qty ?? null, unit: u, luogo: x.luogo || guessLuogo(x.name), cat: CAT_L[x.cat] ? x.cat : guessCat(x.name), scad: x.scad || '' })
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

function hero() {
  const t = today(), now = new Date(), hr = now.getHours() + now.getMinutes() / 60; const mk = hr < 10 ? 'c' : hr < 14.5 ? 'p' : 's';
  const lab = { c: 'Stamattina a colazione', p: 'Oggi a pranzo', s: 'Stasera a cena' }[mk];
  const home = members().filter(m => pres(t, m.id)[mk] !== false); const mn = menuLabel(t, mk); const v = (S.menu[t] || {})[mk]; const r = v && v.rid && S.ric.find(x => x.id === v.rid);
  const soon = S.disp.filter(d => d.scad && daysTo(d.scad) <= 3 && !(typeof d.qty === 'number' && d.qty <= 0)).sort((a, b) => a.scad.localeCompare(b.scad)).slice(0, 4);
  return `<section class="hero"><svg class="plate" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="rgba(255,255,255,.14)"/><circle cx="100" cy="100" r="70" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.35)" stroke-width="2"/><circle cx="100" cy="100" r="46" fill="rgba(0,0,0,.08)"/><path d="M84 92c6-14 26-14 32 0" stroke="rgba(255,255,255,.5)" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
  <p class="hl">${lab}</p><p class="hn">${home.length ? `${home.length} a casa` : 'Nessuno a casa'}</p><p class="hw">${home.map(m => esc(m.name)).join(', ') || 'Tutti fuori'}</p>
  <div class="hm">${mn ? (r ? `<button class="hmn" data-act="ropen" data-id="${r.id}">${esc(mn)}</button>` : `<span class="hq" style="opacity:1">${esc(mn)}</span>`) : '<span class="hq">Ancora da decidere</span>'}</div>
  <div class="hb"><button class="bw" data-act="menu" data-d="${t}" data-meal="${mk}">${mn ? 'Cambia' : 'Scegli cosa cucinare'}</button>${gkey() ? '<button class="bo" data-act="ai">Idee con quello che c\'è</button>' : ''}</div>
  ${soon.length ? `<p class="hs">Da usare presto: ${soon.map(d => `${esc(d.name)} <small>(${scadTxt(d.scad)})</small>`).join(' · ')}</p>` : ''}</section>`
}

function renderSett() {
  const ds = weekDays(S.week), M = members(), t = today(); let h = S.week === 0 ? hero() : '';
  h += `<div class="wk"><button class="ib" data-act="wk" data-v="-1" aria-label="Settimana precedente">‹</button><b>${S.week === 0 ? 'Questa settimana' : shortFmt.format(ds[0]) + ' – ' + shortFmt.format(ds[6])}</b><button class="ib" data-act="wk" data-v="1" aria-label="Settimana successiva">›</button></div>`;
  h += ds.map(d => {
    const k = ymd(d); const imps = M.flatMap(m => (pres(k, m.id).imp || []).map((x, i) => ({ ...x, m, i }))).sort((a, b) => (a.ora || '99').localeCompare(b.ora || '99'));
    return `<article class="day${k === t ? ' today' : ''}${k < t ? ' past' : ''}"><header><h3>${esc(dayFmt.format(d))}</h3>${k === t ? '<span class="pill">Oggi</span>' : ''}<button class="lnk" data-act="imp" data-d="${k}">+ Impegno</button></header>
    ${imps.length ? `<ul class="imps">${imps.map(x => `<li><i style="background:${x.m.color}"></i>${x.ora ? `<span class="t">${esc(x.ora)}</span>` : ''}<span><b>${esc(x.m.name)}</b> · ${esc(x.testo)}</span><button class="x" data-act="delimp" data-d="${k}" data-m="${x.m.id}" data-i="${x.i}" aria-label="Elimina impegno">×</button></li>`).join('')}</ul>` : ''}
    ${MEALS.map(([mk, ml]) => {
      const n = M.filter(m => pres(k, m.id)[mk] !== false).length; const mn = menuLabel(k, mk);
      return `<div class="meal"><span class="ml">${ml}</span><span class="avs">${M.map(m => { const on = pres(k, m.id)[mk] !== false; return `<button class="av${on ? ' on' : ''}" style="--c:${m.color}" data-act="tog" data-d="${k}" data-m="${m.id}" data-meal="${mk}" aria-pressed="${on}" aria-label="${esc(m.name)} ${on ? 'a casa' : 'fuori'}" title="${esc(m.name)}">${esc(ini(m.name))}</button>` }).join('')}</span><span class="cnt" title="a casa">${n}</span><button class="mn${mn ? '' : ' empty'}" data-act="menu" data-d="${k}" data-meal="${mk}">${mn ? esc(mn) : 'Cosa si mangia?'}</button></div>`
    }).join('')}</article>`
  }).join('');
  $('#sett').innerHTML = h
}

function renderDisp() {
  const q = norm(S.q); const inL = d => S.luogo === 'tutto' || d.luogo === S.luogo; const L = S.disp.filter(d => inL(d) && (S.cat === 'tutte' || catOf(d) === S.cat) && (!q || norm(d.name).includes(q))).sort((a, b) => (a.scad || '9999').localeCompare(b.scad || '9999') || String(a.name).localeCompare(b.name, 'it'));
  const cnt = l => S.disp.filter(d => l === 'tutto' || d.luogo === l).length;
  $('#lgs').innerHTML = [['tutto', 'Tutto'], ...LUOGHI].map(([k, l]) => `<button class="seg${S.luogo === k ? ' on' : ''}" data-act="luogo" data-v="${k}">${l} <small>${cnt(k)}</small></button>`).join('');
  const inLoc = S.disp.filter(inL); const cc = c => inLoc.filter(d => catOf(d) === c).length;
  $('#cats').innerHTML = inLoc.length ? `<button class="seg${S.cat === 'tutte' ? ' on' : ''}" data-act="cat" data-v="tutte">Tutte</button>` + CATS.filter(([k]) => cc(k) || S.cat === k).map(([k, l]) => `<button class="seg${S.cat === k ? ' on' : ''}" data-act="cat" data-v="${k}">${l} <small>${cc(k)}</small></button>`).join('') : '';
  $('#dlist').innerHTML = L.length ? L.map(d => {
    const z = typeof d.qty === 'number' && d.qty <= 0; const dd = d.scad ? daysTo(d.scad) : null;
    return `<li class="it${z ? ' zero' : ''}"><button class="nm" data-act="dedit" data-id="${d.id}"><b>${esc(d.name)}</b><small>${[S.luogo === 'tutto' ? LUOGO_L[d.luogo] : '', S.cat === 'tutte' ? CAT_L[catOf(d)] : ''].filter(Boolean).map(esc).join(' · ')}${d.scad ? ` <span class="sc${dd < 0 ? ' bad' : dd <= 3 ? ' warn' : ''}">${dd < 0 ? 'scaduto' : 'scade ' + scadTxt(d.scad)}</span>` : ''}</small></button>
    ${z ? '<span class="fin">Finito</span><button class="sm" data-act="d2spesa" data-id="' + d.id + '">In spesa</button>' : ''}
    ${d.unit === 'qb' || d.qty == null ? `<button class="sm" data-act="dzero" data-id="${d.id}">Finito</button>` : `<span class="qt"><button class="ib" data-act="dq" data-id="${d.id}" data-v="-1" aria-label="Meno ${esc(d.name)}">−</button><span>${fmtQ(d.qty, d.unit)}</span><button class="ib" data-act="dq" data-id="${d.id}" data-v="1" aria-label="Più ${esc(d.name)}">+</button></span>`}</li>`
  }).join('')
    : `<li class="empty">${S.disp.length ? 'Niente qui.' : 'La dispensa è vuota. Fotografa un prodotto o uno scontrino, oppure con "Più cose" scrivi tutto quello che c\'è, una cosa per riga.'}</li>`
}

function renderRic() {
  const q = norm(S.rq); const L = S.ric.map(r => ({ r, m: match(r) })).filter(({ r, m }) => (!q || norm(r.name).includes(q) || (r.ingr || []).some(i => norm(i.n).includes(q)) || norm((r.tags || []).join(' ')).includes(q)) && (!S.onlyCan || !m.miss.length)).sort((a, b) => (a.m.miss.length - b.m.miss.length) || String(a.r.name).localeCompare(b.r.name, 'it'));
  $('#rlist').innerHTML = L.length ? L.map(({ r, m }) => `<li class="rc"><button data-act="ropen" data-id="${r.id}"><b>${esc(r.name)}</b><span class="meta">${r.tempo ? esc(r.tempo) + ' min · ' : ''}${esc(r.porz || 4)} porzioni${(r.tags || []).length ? ' · ' + esc(r.tags.join(', ')) : ''}</span><span class="bar"><i style="width:${m.tot ? Math.round(m.ok / m.tot * 100) : 100}%"></i></span><span class="mt">${m.miss.length ? `Hai ${m.ok} ingredienti su ${m.tot}. Mancano: ${m.miss.slice(0, 4).map(i => esc(i.n)).join(', ')}${m.miss.length > 4 ? '…' : ''}` : 'Hai tutto per farla'}</span></button></li>`).join('')
    : `<li class="empty">${S.ric.length ? 'Nessuna ricetta trovata.' : 'Nessuna ricetta ancora. Scrivi le vostre preferite con "Nuova".' + (gkey() ? ' Oppure tocca "Idee" per farti proporre qualcosa con quello che avete.' : ' Con una chiave Gemini (dalle impostazioni) l\'app può anche proporvele.')}</li>`
}

function renderSpesa() {
  const L = [...S.spesa].sort((a, b) => (a.done - b.done) || ((a.ts || 0) - (b.ts || 0)));
  $('#slist').innerHTML = L.length ? L.map(x => `<li class="sp${x.done ? ' done' : ''}"><label><input type="checkbox" data-sp="${x.id}" ${x.done ? 'checked' : ''}><span><b>${esc(x.name)}</b> <span class="q">${fmtQ(x.qty, x.unit)}</span>${x.from ? `<small>per ${esc(x.from)}</small>` : ''}</span></label><button class="x" data-act="spdel" data-id="${x.id}" aria-label="Togli ${esc(x.name)}">×</button></li>`).join('')
    : '<li class="empty">La lista è vuota. Aggiungi a mano o dalle ricette con "Metti in spesa".</li>';
  const d = S.spesa.filter(x => x.done).length;
  $('#spf').innerHTML = d ? `<button class="bp" data-act="sp2disp">Metti in dispensa i presi (${d})</button><button class="bg" data-act="spclear">Togli i presi</button>` : ''
}

/* ---------- modals ---------- */
function modal(html, mount) { const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; mount && mount(m) }
function close() { const m = $('#modal'); m.hidden = true; m.innerHTML = '' }
const E = (f, n) => f.elements[n];
const acts = (label = 'Salva') => `<div class="acts"><button type="button" class="bg" data-act="close">Annulla</button><button class="bp">${label}</button></div>`;

function dispModal(d) {
  const isNew = !d; d = d || { name: '', qty: 1, unit: 'pz', luogo: S.luogo !== 'tutto' ? S.luogo : '', scad: '' };
  modal(`<h2>${isNew ? 'Aggiungi in casa' : 'Modifica'}</h2><form id="f"><label>Cosa<input name="name" required value="${esc(d.name)}" autocomplete="off" placeholder="Es. latte, pasta, uova"></label>
  <div class="row"><label>Quantità<input name="qty" type="number" inputmode="decimal" step="any" min="0" value="${d.qty ?? ''}"></label><label>Unità<select name="unit">${UNITS.map(u => `<option${u === (d.unit || 'pz') ? ' selected' : ''}>${u}</option>`).join('')}</select></label></div>
  <div class="row"><label>Dove<select name="luogo"><option value="">Lo decide l'app</option>${LUOGHI.map(([k, l]) => `<option value="${k}"${k === d.luogo ? ' selected' : ''}>${l}</option>`).join('')}</select></label><label>Scadenza<input name="scad" type="date" value="${esc(d.scad || '')}"></label></div>
  <label>Categoria<select name="cat"><option value="">Lo decide l'app</option>${CATS.map(([k, l]) => `<option value="${k}"${k === d.cat ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
  <div class="acts">${isNew ? '' : '<button type="button" class="bd" id="del">Elimina</button>'}<button type="button" class="bg" data-act="close">Annulla</button>${isNew ? '<button class="bg" value="more">Salva e un altro</button>' : ''}<button class="bp" value="ok">Salva</button></div></form>`, m => {
    m.querySelector('#f').onsubmit = e => {
      e.preventDefault(); const f = e.target; const name = E(f, 'name').value.trim(); if (!name) return; const qs = E(f, 'qty').value; const luogo = E(f, 'luogo').value;
      save('dispensa', isNew ? null : d.id, { ...(isNew ? {} : d), name, qty: qs === '' ? null : parseFloat(qs), unit: E(f, 'unit').value, luogo: luogo || guessLuogo(name), cat: E(f, 'cat').value || guessCat(name), scad: E(f, 'scad').value || '' });
      if (e.submitter && e.submitter.value === 'more') { toast(name + ' aggiunto'); dispModal(); if (luogo) E($('#f'), 'luogo').value = luogo } else close()
    };
    const x = m.querySelector('#del'); if (x) x.onclick = () => { del('dispensa', d.id); close() }
  })
}

function bulkModal() {
  modal(`<h2>Aggiungi più cose</h2><p class="sub">Una per riga. Se c'è già, la quantità si somma.</p><form id="f"><label>Cosa c'è<textarea name="t" rows="8" placeholder="2 l latte&#10;500 g pasta&#10;6 uova&#10;mozzarella"></textarea></label>
  <label>Dove<select name="l"><option value="">Lo decide l'app per ognuna</option>${LUOGHI.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>${acts('Aggiungi')}</form>`, m => {
    m.querySelector('#f').onsubmit = e => { e.preventDefault(); const f = e.target; const L = E(f, 't').value.split('\n').map(parseLine).filter(Boolean); const l = E(f, 'l').value; L.forEach(x => mergeDisp({ name: x.n, qty: x.u === 'qb' ? null : (x.q ?? 1), unit: x.u, luogo: l })); close(); toast(`${L.length} cose aggiunte`) }
  })
}

function impModal(k) {
  const me = S.me || members()[0].id;
  modal(`<h2>Nuovo impegno</h2><p class="sub" style="text-transform:capitalize">${esc(dayFmt.format(dt(k)))}</p><form id="f">
  <label>Chi<select name="who">${members().map(m => `<option value="${m.id}"${m.id === me ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
  <div class="row"><label>Ora<input type="time" name="ora"></label><label class="grow">Cosa<input name="testo" required placeholder="Palestra, cena fuori, turno…" autocomplete="off"></label></div>
  <fieldset><legend>Mangia a casa a</legend><div class="chk">${MEALS.map(([mk, ml]) => `<label><input type="checkbox" name="${mk}"> ${ml}</label>`).join('')}</div></fieldset>${acts()}</form>`, m => {
    const f = m.querySelector('#f'); const sync = () => { const p = pres(k, E(f, 'who').value); MEALS.forEach(([mk]) => E(f, mk).checked = p[mk] !== false) }; sync(); E(f, 'who').onchange = sync;
    f.onsubmit = e => { e.preventDefault(); const mid = E(f, 'who').value, p = pres(k, mid); setPres(k, mid, { imp: [...(p.imp || []), { ora: E(f, 'ora').value, testo: E(f, 'testo').value.trim() }], c: E(f, 'c').checked, p: E(f, 'p').checked, s: E(f, 's').checked }); close() }
  })
}

function menuModal(k, mk) {
  const cur = (S.menu[k] || {})[mk] || {}; const ml = MEALS.find(x => x[0] === mk)[1]; const n = members().filter(m => pres(k, m.id)[mk] !== false).length;
  const L = S.ric.map(r => ({ r, m: match(r) })).sort((a, b) => a.m.miss.length - b.m.miss.length);
  modal(`<h2>${ml}</h2><p class="sub"><span style="text-transform:capitalize">${esc(dayFmt.format(dt(k)))}</span> · ${n} a casa</p><form id="f"><label>Scrivi cosa si mangia<input name="t" value="${esc(cur.rid ? '' : cur.t || '')}" placeholder="Es. pizza, avanzi, pasta al pomodoro" autocomplete="off"></label>
  <div class="acts">${cur.t || cur.rid ? '<button type="button" class="bd" id="clr">Svuota</button>' : ''}<button type="button" class="bg" data-act="close">Annulla</button><button class="bp">Salva</button></div></form>
  ${L.length ? `<h3>Oppure scegli una ricetta</h3><ul class="pick">${L.map(({ r, m }) => `<li><button data-pick="${r.id}" class="${cur.rid === r.id ? 'on' : ''}"><b>${esc(r.name)}</b><small>${m.miss.length ? 'mancano ' + m.miss.length : 'hai tutto'}</small></button></li>`).join('')}</ul>` : '<p class="sub" style="margin-top:14px">Quando aggiungi ricette potrai sceglierle da qui.</p>'}`, mm => {
    mm.querySelector('#f').onsubmit = e => { e.preventDefault(); const t = E(e.target, 't').value.trim(); setMenu(k, mk, t ? { t } : null); close() };
    const c = mm.querySelector('#clr'); if (c) c.onclick = () => { setMenu(k, mk, null); close() };
    mm.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const r = S.ric.find(x => x.id === b.dataset.pick); if (!r) return; setMenu(k, mk, { rid: r.id, t: r.name }); const mi = match(r).miss.length; if (mi) { ricModal(r.id, n || r.porz); toast(`Mancano ${mi} ingredienti: puoi metterli in spesa`) } else close() })
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
    q('#madd').onclick = () => { setMenu(q('#md').value, q('#mm').value, { rid: r.id, t: r.name }); toast('Messa nel menu') };
    q('#ed').onclick = () => ricEdit(r);
    q('#kp').onclick = () => shareText(r.name, recipeText(r, n));
    q('#cook').onclick = () => { let c = 0; st.forEach(({ i, s }) => { const it = s.it; if (!it || i.q == null || i.u === 'qb' || typeof it.qty !== 'number') return; const [a, ba] = toBase(i.q * f, i.u), [b, bb] = toBase(it.qty, it.unit); if (ba !== bb) return; const k = BASE[it.unit] ? BASE[it.unit][1] : 1; save('dispensa', it.id, { ...it, qty: round(Math.max(0, b - a) / k) }); c++ }); close(); toast(c ? `Dispensa aggiornata: ${c} ingredienti scalati` : 'Niente da scalare in dispensa') };
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
async function gErr(r) { let m = ''; try { m = (await r.json()).error.message || '' } catch (e) { } const k = /api key|api_key|permission|denied/i.test(m); return new Error(r.status === 429 ? 'troppe richieste a Gemini, riprova tra un minuto' : k ? 'chiave Gemini non valida o non abilitata' : `Gemini ${r.status}${m ? ': ' + m : ''}`) }
async function pickModel(fresh) {
  const saved = LS.get('gmodel', ''); if (saved && saved !== 'gemini-2.5-flash') return saved;
  const c = LS.get('gauto', null); if (!fresh && c && c.m && Date.now() - c.t < 3 * 864e5) return c.m;
  const r = await fetch(`${GBASE}models?pageSize=1000&key=${encodeURIComponent(gkey())}`); if (!r.ok) throw await gErr(r);
  const j = await r.json(); const ok = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, ''));
  const cand = ok.map(n => { const m = n.match(/^gemini-(\d+(?:\.\d+)?)-flash(-lite)?$/); return m ? { n, v: parseFloat(m[1]), lite: !!m[2] } : null }).filter(Boolean).sort((a, b) => (a.lite - b.lite) || (b.v - a.v));
  const m = cand.length ? cand[0].n : ok.includes('gemini-flash-latest') ? 'gemini-flash-latest' : ok.find(n => /flash/.test(n) && !/tts|image|live|audio|embed/.test(n));
  if (!m) throw new Error('nessun modello Gemini disponibile per questa chiave');
  LS.set('gauto', { m, t: Date.now() }); return m
}
async function gemini(parts, retry = true) {
  const model = await pickModel(false);
  const r = await fetch(`${GBASE}models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(gkey())}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json' } }) });
  if (r.status === 404 && retry && !(LS.get('gmodel', '') && LS.get('gmodel', '') !== 'gemini-2.5-flash')) { LS.del('gauto'); return gemini(parts, false) }
  if (!r.ok) throw await gErr(r);
  const j = await r.json(); const t = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
  if (!t) throw new Error('Gemini non ha risposto (' + (j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'vuoto') + ')');
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t)
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
    const it = { n, q, u, mult: pend || 1, multSet: !!pend }; pend = null; out.push(it); last = it
  }
  const map = new Map(); out.forEach(i => { const q = round(i.q * i.mult); const k = norm(i.n) + '|' + i.u; const e = map.get(k); if (e) e.q = round(e.q + q); else map.set(k, { n: i.n, q, u: i.u }) });
  return [...map.values()]
}
const RECEIPT_PROMPT = 'Questa è la foto di uno scontrino di un supermercato italiano. Elenca solo i prodotti comprati: niente totali, sconti, IVA, pagamenti, buste. Per ogni prodotto dai: "n" = nome generico breve in italiano minuscolo, come lo chiamerebbe una famiglia in dispensa (es. "latte", "pasta", "mozzarella", "petto di pollo"); "q" = quantità totale come numero (peso o volume della confezione moltiplicato per i pezzi comprati, oppure numero di pezzi); "u" = una tra g, kg, ml, l, pz, conf; "luogo" = una tra frigo, dispensa, freezer; "cat" = una tra carbo, verdura, frutta, proteine, latticini, condimenti, dolci, bevande, altro. Rispondi SOLO con JSON: {"prodotti":[{"n":"latte","q":1,"u":"l","luogo":"frigo","cat":"latticini"}]}';

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
    const { color, gray } = await prep(file); let items = null, raw = '';
    if (gkey()) {
      st('Gemini sta leggendo lo scontrino…');
      try { const r = await gemini([{ text: RECEIPT_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: color.split(',')[1] } }]); items = gItems(r) }
      catch (e) { console.warn(e); toast('Gemini non risponde: leggo sul telefono') }
    }
    if (!items) {
      st('Scarico il lettore di testo (solo la prima volta)…'); const T = await loadTess();
      const res = await T.recognize(gray, 'ita', { logger: mm => { if (mm.status === 'recognizing text') st(`Leggo lo scontrino… ${Math.round(mm.progress * 100)}%`) } });
      raw = res.data.text; items = parseReceipt(raw).map(x => ({ ...x, luogo: guessLuogo(x.n), cat: guessCat(x.n) }))
    }
    reviewReceipt(items, raw, out)
  } catch (e) { console.warn(e); out.innerHTML = `<p class="load">Non sono riuscito a leggerlo: ${esc(e.message || e)}. Riprova con una foto più nitida.</p>` }
}
function reviewReceipt(items, raw, out, opts = {}) {
  const row = i => `<div class="rv"><input type="checkbox" class="c" checked aria-label="Includi"><input class="n" value="${esc(i.n)}" aria-label="Nome" placeholder="Nome"><select class="k" aria-label="Categoria">${CATS.map(([k, l]) => `<option value="${k}"${k === (i.cat || guessCat(i.n)) ? ' selected' : ''}>${CAT_S[k] || l}</option>`).join('')}</select><input class="q" type="number" step="any" min="0" inputmode="decimal" value="${i.q ?? ''}" aria-label="Quantità"><select class="u" aria-label="Unità">${UNITS.map(u => `<option${u === i.u ? ' selected' : ''}>${u}</option>`).join('')}</select><select class="l" aria-label="Dove">${LUOGHI.map(([k, l]) => `<option value="${k}"${k === i.luogo ? ' selected' : ''}>${l}</option>`).join('')}</select>${i.info ? `<small style="grid-column:2/6;color:var(--mut)">${esc(i.info)}</small>` : ''}</div>`;
  out.innerHTML = `${opts.head || `<h3>${items.length ? `Ho trovato ${items.length} prodotti` : 'Non ho trovato prodotti'}</h3><p class="sub">Correggi i nomi come li chiamate voi (es. "latte" invece di "latte ps uht") e togli la spunta a quello che non va in dispensa.</p>`}<div id="rvs">${items.map(row).join('')}</div>
  <p><button class="bg" id="addr" type="button">+ Aggiungi una riga</button></p>
  <label class="ck"><input type="checkbox" id="rsp" checked> Togli dalla spesa quello che ho comprato</label>
  <button class="bp wide" id="rok">${opts.ok || 'Metti in dispensa'}</button>${raw ? `<details><summary>Testo letto dallo scontrino</summary><pre>${esc(raw)}</pre></details>` : ''}`;
  out.querySelector('#addr').onclick = () => out.querySelector('#rvs').insertAdjacentHTML('beforeend', row({ n: '', q: 1, u: 'pz', luogo: 'dispensa' }));
  out.querySelector('#rok').onclick = () => {
    const rs = [...out.querySelectorAll('.rv')].filter(r => r.querySelector('.c').checked).map(r => ({ name: r.querySelector('.n').value.trim(), qty: r.querySelector('.q').value === '' ? null : parseFloat(r.querySelector('.q').value), unit: r.querySelector('.u').value, luogo: r.querySelector('.l').value, cat: r.querySelector('.k').value })).filter(x => x.name);
    rs.forEach(mergeDisp); let k = 0;
    if (out.querySelector('#rsp').checked) S.spesa.filter(s => rs.some(x => same(x.name, s.name))).forEach(s => { del('spesa', s.id); k++ });
    close(); toast(rs.length === 1 ? `${rs[0].name} → ${LUOGO_L[rs[0].luogo]}${k ? ', tolto dalla spesa' : ''}` : `${rs.length} prodotti in dispensa${k ? `, ${k} tolti dalla spesa` : ''}`)
  }
}

function gItems(r) {
  return ((r && r.prodotti) || (Array.isArray(r) ? r : [])).filter(x => x && x.n).map(x => ({ n: String(x.n).toLowerCase(), q: x.q == null || x.q === '' ? null : +x.q, u: UNITS.includes(x.u) ? x.u : 'pz', luogo: LUOGO_L[x.luogo] ? x.luogo : guessLuogo(x.n), cat: CAT_L[x.cat] ? x.cat : guessCat(x.n) }))
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
  <h3>Nomi</h3><button class="bg wide" id="nm">Cambia i nomi della famiglia</button>
  <h3>Gemini <small style="font-weight:400;color:var(--mut)">facoltativo</small></h3><p class="sub">Con una chiave gratuita di Google Gemini l'app legge meglio gli scontrini e propone ricette con quello che avete. Creala su <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. Resta salvata solo su questo telefono.</p>
  <form id="gf"><label>Chiave API<input name="k" type="password" autocomplete="off" value="${esc(gkey())}" placeholder="AIza…"></label><label>Modello <small>lascia vuoto: lo sceglie l'app</small><input name="m" value="${esc(LS.get('gmodel', '') === 'gemini-2.5-flash' ? '' : LS.get('gmodel', ''))}" placeholder="automatico${LS.get('gauto', null) ? ' (' + esc(LS.get('gauto', null).m) + ')' : ''}" autocomplete="off"></label><p class="hint" id="gres"></p><div class="acts">${gkey() ? '<button type="button" class="bd" id="gdel">Togli la chiave</button>' : ''}<button type="button" class="bg" id="gtest">Prova</button><button class="bp">Salva</button></div></form>
  <h3>Questo telefono</h3><button class="bd" id="out" style="margin:0">Esci dalla famiglia su questo telefono</button>`, m => {
    m.querySelector('#inv').onclick = () => shareText('Cosa si mangia?', 'Entra nella nostra app della cucina: ' + inviteLink());
    m.querySelector('#nm').onclick = namesModal;
    const gsave = f => { LS.set('gkey', E(f, 'k').value.trim()); LS.set('gmodel', E(f, 'm').value.trim()); LS.del('gauto') };
    m.querySelector('#gf').onsubmit = e => { e.preventDefault(); gsave(e.target); close(); render(); toast(gkey() ? 'Gemini attivo' : 'Salvato') };
    m.querySelector('#gtest').onclick = async () => { const f = m.querySelector('#gf'), out = m.querySelector('#gres'); gsave(f); if (!gkey()) { out.textContent = 'Incolla prima la chiave.'; return } out.textContent = 'Provo…'; try { const r = await gemini([{ text: 'Rispondi solo con JSON: {"ok":true}' }]); out.textContent = r && r.ok ? `Funziona, modello ${LS.get('gmodel', '') || LS.get('gauto', {}).m}.` : 'Risposta strana, ma la chiave funziona.'; render() } catch (err) { out.textContent = 'Non funziona: ' + (err.message || err) } };
    const gd = m.querySelector('#gdel'); if (gd) gd.onclick = () => { LS.del('gkey'); close(); render() };
    let armed = false; m.querySelector('#out').onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Sicuro? Tocca di nuovo'; return } LS.del('fam'); LS.del('me'); location.href = location.pathname }
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
function go(t) { if (!TABS.includes(t)) t = 'settimana'; S.tab = t; if (location.hash.slice(1) !== t) history.replaceState(null, '', '#' + t); render(); window.scrollTo(0, 0) }

/* ---------- eventi ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'modal') { close(); return } const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, ds = b.dataset;
  if (a === 'close') close(); else if (a === 'tab') go(ds.v); else if (a === 'who') whoModal(); else if (a === 'settings') settingsModal();
  else if (a === 'wk') { S.week += +ds.v; subWeek(); render() }
  else if (a === 'tog') { const p = pres(ds.d, ds.m); setPres(ds.d, ds.m, { [ds.meal]: p[ds.meal] === false }) }
  else if (a === 'menu') menuModal(ds.d, ds.meal); else if (a === 'imp') impModal(ds.d);
  else if (a === 'delimp') { const p = pres(ds.d, ds.m); setPres(ds.d, ds.m, { imp: (p.imp || []).filter((_, i) => i !== +ds.i) }) }
  else if (a === 'luogo') { S.luogo = ds.v; render() } else if (a === 'cat') { S.cat = ds.v; render() } else if (a === 'photo') photoModal(); else if (a === 'dadd') dispModal(); else if (a === 'dbulk') bulkModal(); else if (a === 'scan') scanModal();
  else if (a === 'dedit') dispModal(S.disp.find(x => x.id === ds.id));
  else if (a === 'dq') { const d = S.disp.find(x => x.id === ds.id); if (d) save('dispensa', d.id, { ...d, qty: Math.max(0, round((d.qty || 0) + (+ds.v) * stepFor(d.unit))) }) }
  else if (a === 'dzero') { const d = S.disp.find(x => x.id === ds.id); if (d) { save('dispensa', d.id, { ...d, qty: 0 }); addToSpesa([{ name: d.name, qty: null, unit: d.unit === 'qb' ? 'pz' : d.unit }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'd2spesa') { const d = S.disp.find(x => x.id === ds.id); if (d) { addToSpesa([{ name: d.name, qty: null, unit: d.unit }]); toast(d.name + ' messo in spesa') } }
  else if (a === 'ropen') ricModal(ds.id); else if (a === 'rnew') ricEdit(); else if (a === 'ai') aiModal();
  else if (a === 'spdel') del('spesa', ds.id);
  else if (a === 'sp2disp') { const L = S.spesa.filter(x => x.done); L.forEach(x => { mergeDisp({ name: x.name, qty: x.qty ?? 1, unit: x.unit }); del('spesa', x.id) }); toast(`${L.length} cose messe in dispensa`) }
  else if (a === 'spclear') S.spesa.filter(x => x.done).forEach(x => del('spesa', x.id));
  else if (a === 'keepspesa') { const L = S.spesa.filter(x => !x.done); if (!L.length) { toast('La lista è vuota'); return } shareText('Spesa', L.map(x => x.name + (x.qty != null ? ` (${fmtQ(x.qty, x.unit)})` : '')).join('\n')) }
  else if (a === 'keepdisp') { if (!S.disp.length) { toast('La dispensa è vuota'); return } shareText('In casa', LUOGHI.map(([k, l]) => { const L = S.disp.filter(d => d.luogo === k && !(typeof d.qty === 'number' && d.qty <= 0)); return L.length ? `${l}:\n${L.map(d => `- ${d.name}${d.qty != null ? ' ' + fmtQ(d.qty, d.unit) : ''}${d.scad ? ' (scade ' + scadTxt(d.scad) + ')' : ''}`).join('\n')}` : '' }).filter(Boolean).join('\n\n')) }
});
document.addEventListener('change', e => { const id = e.target.dataset && e.target.dataset.sp; if (id) { const x = S.spesa.find(s => s.id === id); if (x) save('spesa', id, { ...x, done: e.target.checked }) } });
$('#q').addEventListener('input', e => { S.q = e.target.value; renderDisp() });
$('#rq').addEventListener('input', e => { S.rq = e.target.value; renderRic() });
$('#onlycan').addEventListener('change', e => { S.onlyCan = e.target.checked; renderRic() });
$('#spadd').addEventListener('submit', e => { e.preventDefault(); const p = parseLine($('#spin').value); if (!p) return; addToSpesa([{ name: p.n, qty: p.q, unit: p.u === 'qb' ? 'pz' : p.u }]); $('#spin').value = '' });
addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.includes(t) && t !== S.tab) { S.tab = t; render() } });
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
    sub('dispensa', 'disp'); sub('ricette', 'ric'); sub('spesa', 'spesa'); subWeek();
    fs.onSnapshot(famRef(), d => {
      const v = d.exists() && d.data(); S.members = v && Array.isArray(v.members) && v.members.length === 4 ? v.members : null; render();
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
