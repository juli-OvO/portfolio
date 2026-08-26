(() => {
const KEY = 'jj-portfolio-content-v1';
const S = window.PORTFOLIO_SCHEMA;
let data = {};
try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { data = {}; }

const path = (p, s, f) => `${p}.${s}.${f}`;
const get = k => data[k];
const set = (k, v) => { if (v === '' || v == null || (Array.isArray(v) && !v.length)) delete data[k]; else data[k] = v; save(); };
let saveT;
function save(){ clearTimeout(saveT); saveT = setTimeout(() => {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){ toast('Storage full — export now'); }
  stats();
}, 250); }
function toast(m){ const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); setTimeout(()=>t.classList.remove('on'), 2200); }

/* ---------- counts ---------- */
const allFields = [];
S.forEach(p => p.sections.forEach(s => s.fields.forEach(f => allFields.push({p, s, f, k: path(p.id, s.id, f.id)}))));
function filled(k){ const v = get(k); if (!v) return false; if (Array.isArray(v)) return v.some(x => (x||'').trim()); if (typeof v === 'object') return !!(v.name || v.note); return !!String(v).trim(); }
function stats(){
  const n = allFields.filter(x => filled(x.k)).length;
  document.getElementById('stat').textContent = `${n} / ${allFields.length} filled`;
  S.forEach(p => {
    const fs = allFields.filter(x => x.p === p);
    const c = fs.filter(x => filled(x.k)).length;
    const a = document.querySelector(`[data-rail="${p.id}"]`);
    if (a){ a.querySelector('.c').textContent = `${c}/${fs.length}`; a.classList.toggle('done', c === fs.length); }
  });
}

/* ---------- field builders ---------- */
function labelEl(f, k){
  const d = document.createElement('div'); d.className = 'lab';
  d.innerHTML = `<span class="k"></span><span class="id"></span>${f.hint ? '<span class="hint"></span>' : ''}`;
  d.querySelector('.k').textContent = f.label;
  d.querySelector('.id').textContent = k;
  if (f.hint) d.querySelector('.hint').textContent = f.hint;
  return d;
}

function buildText(f, k, long){
  const el = document.createElement(long ? 'textarea' : 'input');
  if (!long) el.type = 'text'; else el.rows = f.id === 'body' || f.id.includes('body') ? 5 : 3;
  el.value = get(k) || '';
  el.placeholder = long ? 'Write the copy…' : '—';
  el.addEventListener('input', () => { set(k, el.value); autosize(el, long); });
  if (long) requestAnimationFrame(() => autosize(el, true));
  return el;
}
function autosize(el, long){ if(!long) return; el.style.height = 'auto'; el.style.height = Math.max(60, el.scrollHeight + 2) + 'px'; }

function buildList(f, k){
  const wrap = document.createElement('div'); wrap.className = 'list';
  let vals = get(k) || (f.seed ? f.seed.slice() : ['']);
  const commit = () => set(k, vals.filter(v => true));
  function render(){
    wrap.innerHTML = '';
    vals.forEach((v, i) => {
      const row = document.createElement('div'); row.className = 'item';
      const inp = document.createElement('input'); inp.type = 'text'; inp.value = v; inp.placeholder = f.hint || '—';
      inp.addEventListener('input', () => { vals[i] = inp.value; commit(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); vals.splice(i+1, 0, ''); commit(); render(); wrap.querySelectorAll('input')[i+1].focus(); } });
      const del = document.createElement('button'); del.className = 'del'; del.type = 'button'; del.textContent = '×';
      del.addEventListener('click', () => { vals.splice(i, 1); if (!vals.length) vals = ['']; commit(); render(); });
      row.append(inp, del); wrap.append(row);
    });
    const add = document.createElement('button'); add.className = 'btn ghost add'; add.type = 'button'; add.textContent = '+ Add row';
    add.addEventListener('click', () => { vals.push(''); commit(); render(); const is = wrap.querySelectorAll('input'); is[is.length-1].focus(); });
    wrap.append(add);
  }
  render();
  return wrap;
}

function buildImg(f, k){
  const wrap = document.createElement('div'); wrap.className = 'slot';
  const cur = () => get(k) || {};
  wrap.innerHTML = `<div class="drop"><div class="thumb">Drop image</div><div class="meta"><b>No file</b>Drag an image in, or click to choose.</div></div>
    <div class="row"><input type="text" placeholder="Caption / what this shows"></div>
    <div class="row"><button class="x" type="button">Clear</button></div>`;
  const drop = wrap.querySelector('.drop'), thumb = wrap.querySelector('.thumb'), meta = wrap.querySelector('.meta');
  const cap = wrap.querySelector('input');
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true; wrap.append(inp);

  function paint(){
    const v = cur();
    wrap.classList.toggle('has', !!(v.name || v.note));
    if (v.thumb){ thumb.style.backgroundImage = `url(${v.thumb})`; thumb.textContent = ''; }
    else { thumb.style.backgroundImage = ''; thumb.textContent = 'Drop image'; }
    meta.innerHTML = '<b></b>';
    meta.querySelector('b').textContent = v.name || 'No file';
    meta.append(v.name ? (v.w ? `${v.w} × ${v.h} px` : '') : 'Drag an image in, or click to choose.');
    cap.value = v.note || '';
  }
  function store(patch){ const v = Object.assign({}, cur(), patch); set(k, v); paint(); }

  async function take(file){
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise(r => { img.onload = r; img.onerror = r; img.src = url; });
    const c = document.createElement('canvas');
    const sc = Math.min(1, 300 / Math.max(img.width || 1, img.height || 1));
    c.width = Math.max(1, Math.round((img.width||300) * sc)); c.height = Math.max(1, Math.round((img.height||200) * sc));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    store({ name: file.name, w: img.width, h: img.height, thumb: c.toDataURL('image/jpeg', .6) });
  }

  drop.addEventListener('click', () => inp.click());
  inp.addEventListener('change', () => take(inp.files[0]));
  ['dragenter','dragover'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.add('over'); }));
  ['dragleave','drop'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.remove('over'); }));
  wrap.addEventListener('drop', e => take(e.dataTransfer.files[0]));
  cap.addEventListener('input', () => store({ note: cap.value }));
  wrap.querySelector('.x').addEventListener('click', () => { set(k, null); paint(); });
  paint();
  return wrap;
}

/* ---------- render ---------- */
const rail = document.getElementById('rail'), pages = document.getElementById('pages');
S.forEach((p, pi) => {
  const a = document.createElement('a'); a.href = '#' + p.id; a.dataset.rail = p.id;
  a.innerHTML = `<span class="n">${String(pi+1).padStart(2,'0')}</span><span>${p.title}</span><span class="c"></span>`;
  rail.append(a);

  const sec = document.createElement('section'); sec.className = 'page'; sec.id = p.id;
  const head = document.createElement('div'); head.className = 'phead';
  head.innerHTML = `<span class="n">${String(pi+1).padStart(2,'0')}</span><h2></h2><span class="file"></span>`;
  head.querySelector('h2').textContent = p.title;
  head.querySelector('.file').textContent = p.file;
  sec.append(head);
  if (p.note){ const n = document.createElement('p'); n.className = 'pnote'; n.textContent = p.note; sec.append(n); }

  p.sections.forEach(s => {
    const sb = document.createElement('div'); sb.className = 'sec';
    const sh = document.createElement('div'); sh.className = 'sh';
    sh.innerHTML = '<b></b><span></span>';
    sh.querySelector('b').textContent = s.title;
    sh.querySelector('span').textContent = s.id;
    sb.append(sh);
    s.fields.forEach(f => {
      const k = path(p.id, s.id, f.id);
      const row = document.createElement('div'); row.className = 'f';
      row.append(labelEl(f, k));
      const ctrl = f.type === 'img' ? buildImg(f, k) : f.type === 'list' ? buildList(f, k) : buildText(f, k, f.type === 'long');
      const cell = document.createElement('div'); cell.append(ctrl);
      row.append(cell); sb.append(row);
    });
    sec.append(sb);
  });
  pages.append(sec);
});
stats();

/* ---------- export ---------- */
function dl(name, text, mime){
  const b = new Blob([text], {type: mime});
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function clean(){
  const out = { _meta: { site: 'Julianne Jin portfolio', exported: new Date().toISOString(), schema: 'v1' }, pages: {} };
  S.forEach(p => {
    const pg = {};
    p.sections.forEach(s => {
      const sn = {};
      s.fields.forEach(f => {
        const v = get(path(p.id, s.id, f.id));
        if (!v) return;
        if (typeof v === 'object' && !Array.isArray(v)){
          const { thumb, ...rest } = v; if (rest.name || rest.note) sn[f.id] = rest;
        } else if (Array.isArray(v)){
          const a = v.filter(x => (x||'').trim()); if (a.length) sn[f.id] = a;
        } else if (String(v).trim()) sn[f.id] = v;
      });
      if (Object.keys(sn).length) pg[s.id] = sn;
    });
    if (Object.keys(pg).length) out.pages[p.id] = { title: p.title, file: p.file, sections: pg };
  });
  return out;
}
function md(){
  const L = ['# Portfolio content', '', `Exported ${new Date().toLocaleString()}`, ''];
  S.forEach(p => {
    const rows = [];
    p.sections.forEach(s => {
      const fr = [];
      s.fields.forEach(f => {
        const k = path(p.id, s.id, f.id), v = get(k);
        if (!filled(k)) return;
        if (f.type === 'img') fr.push(`- **${f.label}** → \`${v.name || '(no file)'}\`${v.note ? ' — ' + v.note : ''}`);
        else if (Array.isArray(v)) fr.push(`- **${f.label}**\n` + v.filter(x => (x||'').trim()).map(x => `  - ${x}`).join('\n'));
        else fr.push(`- **${f.label}** — ${String(v).replace(/\n+/g, '\n    ')}`);
      });
      if (fr.length) rows.push(`### ${s.title}\n${fr.join('\n')}`);
    });
    if (rows.length) L.push(`## ${p.title}  \n_${p.file}_`, '', rows.join('\n\n'), '');
  });
  const imgs = allFields.filter(x => x.f.type === 'img' && filled(x.k)).map(x => `- ${get(x.k).name} → ${x.p.title} / ${x.s.title} / ${x.f.label}`);
  if (imgs.length) L.push('## Images to send', '', ...imgs, '');
  return L.join('\n');
}
document.getElementById('btnJson').addEventListener('click', () => { dl('portfolio-content.json', JSON.stringify(clean(), null, 2), 'application/json'); toast('JSON exported'); });
document.getElementById('btnMd').addEventListener('click', () => { dl('portfolio-content.md', md(), 'text/markdown'); toast('Brief exported'); });
const fileIn = document.getElementById('fileIn');
document.getElementById('btnImport').addEventListener('click', () => fileIn.click());
fileIn.addEventListener('change', async () => {
  const f = fileIn.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    const src = j.pages || {};
    Object.entries(src).forEach(([pid, pg]) => Object.entries(pg.sections || {}).forEach(([sid, sn]) =>
      Object.entries(sn).forEach(([fid, v]) => { data[path(pid, sid, fid)] = v; })));
    localStorage.setItem(KEY, JSON.stringify(data));
    location.reload();
  } catch (e) { toast('Could not read that file'); }
});
})();
