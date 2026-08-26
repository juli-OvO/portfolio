(() => {
const KEY = 'jj-portfolio-braindump-v1';
const S = window.BRAINDUMP_SCHEMA;
let data = {};
try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ data = {}; }
const get = k => data[k];
const set = (k, v) => { if (v === '' || v == null || (Array.isArray(v) && !v.length)) delete data[k]; else data[k] = v; save(); };
let t; function save(){ clearTimeout(t); t = setTimeout(() => {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){ toast('Storage full — export now'); }
  stats(); }, 250); }
function toast(m){ const e = document.getElementById('toast'); e.textContent = m; e.classList.add('on'); setTimeout(()=>e.classList.remove('on'), 2200); }

/* groups: one per project + the about groups */
const groups = [];
S.projects.forEach(p => groups.push({ id: p.id, title: p.title, meta: p.meta, blocks: S.blocks }));
groups.push({ id: 'about', title: 'You & the portfolio', meta: 'asked once', blocks: S.about });

const all = [];
groups.forEach(g => g.blocks.forEach(b => b.fields.forEach(f => all.push({ g, b, f, k: `${g.id}.${b.id}.${f.id}` }))));
function filled(k){ const v = get(k); if (!v) return false; if (Array.isArray(v)) return v.some(x => (x||'').trim());
  if (typeof v === 'object') return !!(v.name || v.note); return !!String(v).trim(); }
function stats(){
  document.getElementById('stat').textContent = `${all.filter(x => filled(x.k)).length} / ${all.length} answered`;
  groups.forEach(g => {
    const fs = all.filter(x => x.g === g), c = fs.filter(x => filled(x.k)).length;
    const a = document.querySelector(`[data-rail="${g.id}"]`);
    if (a){ a.querySelector('.c').textContent = `${c}/${fs.length}`; a.classList.toggle('done', c === fs.length); }
  });
}

function autosize(el){ el.style.height = 'auto'; el.style.height = Math.max(74, el.scrollHeight + 2) + 'px'; }
function words(s){ return (s||'').trim() ? (s.trim().split(/\s+/).length) : 0; }

function buildLong(f, k){
  const wrap = document.createElement('div');
  const el = document.createElement('textarea');
  el.value = get(k) || ''; el.placeholder = 'Type anything…';
  const wc = document.createElement('div'); wc.className = 'wc';
  const paint = () => wc.textContent = words(el.value) ? words(el.value) + ' words' : '';
  el.addEventListener('input', () => { set(k, el.value); autosize(el); paint(); });
  wrap.append(el, wc); paint();
  requestAnimationFrame(() => autosize(el));
  return wrap;
}
function buildText(f, k){
  const el = document.createElement('input'); el.type = 'text'; el.value = get(k) || ''; el.placeholder = '—';
  el.addEventListener('input', () => set(k, el.value));
  return el;
}
function buildList(f, k){
  const wrap = document.createElement('div'); wrap.className = 'list';
  let vals = get(k) || [''];
  const commit = () => set(k, vals);
  function render(){
    wrap.innerHTML = '';
    vals.forEach((v, i) => {
      const row = document.createElement('div'); row.className = 'item';
      const inp = document.createElement('input'); inp.type = 'text'; inp.value = v; inp.placeholder = f.hint || '—';
      inp.addEventListener('input', () => { vals[i] = inp.value; commit(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); vals.splice(i+1,0,''); commit(); render(); wrap.querySelectorAll('input')[i+1].focus(); } });
      const del = document.createElement('button'); del.className = 'del'; del.type = 'button'; del.textContent = '×';
      del.addEventListener('click', () => { vals.splice(i,1); if(!vals.length) vals = ['']; commit(); render(); });
      row.append(inp, del); wrap.append(row);
    });
    const add = document.createElement('button'); add.className = 'btn ghost add'; add.type = 'button'; add.textContent = '+ Add row';
    add.addEventListener('click', () => { vals.push(''); commit(); render(); const is = wrap.querySelectorAll('input'); is[is.length-1].focus(); });
    wrap.append(add);
  }
  render(); return wrap;
}
function buildImg(f, k){
  const wrap = document.createElement('div'); wrap.className = 'slot';
  wrap.innerHTML = `<div class="drop"><div class="thumb">Drop image</div><div class="meta"><b>No file</b>Drag an image in, or click to choose.</div></div>
    <input type="text" placeholder="What this shows / why it matters">
    <button class="x" type="button">Clear</button>`;
  const thumb = wrap.querySelector('.thumb'), meta = wrap.querySelector('.meta'), cap = wrap.querySelector('input[type=text]');
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.hidden = true; wrap.append(inp);
  const cur = () => get(k) || {};
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
  const store = p => { set(k, Object.assign({}, cur(), p)); paint(); };
  async function take(file){
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file), img = new Image();
    await new Promise(r => { img.onload = r; img.onerror = r; img.src = url; });
    const c = document.createElement('canvas');
    const sc = Math.min(1, 300 / Math.max(img.width || 1, img.height || 1));
    c.width = Math.max(1, Math.round((img.width||300) * sc)); c.height = Math.max(1, Math.round((img.height||200) * sc));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    store({ name: file.name, w: img.width, h: img.height, thumb: c.toDataURL('image/jpeg', .6) });
  }
  wrap.querySelector('.drop').addEventListener('click', () => inp.click());
  inp.addEventListener('change', () => take(inp.files[0]));
  ['dragenter','dragover'].forEach(e => wrap.addEventListener(e, ev => { ev.preventDefault(); wrap.classList.add('over'); }));
  ['dragleave','drop'].forEach(e => wrap.addEventListener(e, ev => { ev.preventDefault(); wrap.classList.remove('over'); }));
  wrap.addEventListener('drop', e => take(e.dataTransfer.files[0]));
  cap.addEventListener('input', () => store({ note: cap.value }));
  wrap.querySelector('.x').addEventListener('click', () => { set(k, null); paint(); });
  paint(); return wrap;
}

/* render */
const rail = document.getElementById('rail'), body = document.getElementById('body');
const h1 = document.createElement('h4'); h1.textContent = 'Projects'; rail.append(h1);
groups.forEach((g, i) => {
  if (g.id === 'about'){ const h = document.createElement('h4'); h.textContent = 'Once'; rail.append(h); }
  const a = document.createElement('a'); a.href = '#' + g.id; a.dataset.rail = g.id;
  a.innerHTML = `<span></span><span class="c"></span>`;
  a.firstChild.textContent = g.title; rail.append(a);

  const sec = document.createElement('section'); sec.className = 'proj'; sec.id = g.id;
  const head = document.createElement('div'); head.className = 'phead';
  head.innerHTML = `<h2></h2><span class="m"></span>`;
  head.querySelector('h2').textContent = g.title;
  head.querySelector('.m').textContent = g.meta || '';
  sec.append(head);

  g.blocks.forEach(b => {
    const blk = document.createElement('div'); blk.className = 'blk';
    const bh = document.createElement('div'); bh.className = 'bh'; bh.innerHTML = '<b></b>';
    bh.querySelector('b').textContent = b.title; blk.append(bh);
    if (b.note){ const n = document.createElement('p'); n.className = 'bnote'; n.textContent = b.note; blk.append(n); }
    b.fields.forEach(f => {
      const k = `${g.id}.${b.id}.${f.id}`;
      const q = document.createElement('div'); q.className = 'q'; q.dataset.tag = f.tag;
      const qh = document.createElement('div'); qh.className = 'qh';
      qh.innerHTML = `<span class="l"></span><span class="tag ${f.tag}"></span><span class="id"></span>`;
      qh.querySelector('.l').textContent = f.label;
      qh.querySelector('.tag').textContent = f.tag === 'hr' ? 'Recruiter' : f.tag === 'des' ? 'Designer' : 'Both';
      qh.querySelector('.id').textContent = k;
      q.append(qh);
      if (f.hint){ const h = document.createElement('p'); h.className = 'hint'; h.textContent = f.hint; q.append(h); }
      q.append(f.type === 'img' ? buildImg(f, k) : f.type === 'list' ? buildList(f, k) : f.type === 'long' ? buildLong(f, k) : buildText(f, k));
      blk.append(q);
    });
    sec.append(blk);
  });
  body.append(sec);
});
stats();

/* filter */
const filt = document.getElementById('filt');
filt.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  [...filt.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const f = b.dataset.f;
  document.querySelectorAll('.q').forEach(q => q.classList.toggle('hide', f !== 'all' && q.dataset.tag !== f && q.dataset.tag !== 'both'));
  document.querySelectorAll('.blk').forEach(blk => {
    const any = [...blk.querySelectorAll('.q')].some(q => !q.classList.contains('hide'));
    blk.style.display = any ? '' : 'none';
  });
});

/* export */
function dl(name, text, mime){
  const b = new Blob([text], { type: mime }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function clean(){
  const out = { _meta: { doc: 'braindump', site: 'Julianne Jin portfolio', exported: new Date().toISOString(), schema: 'v1' }, groups: {} };
  groups.forEach(g => {
    const gg = {};
    g.blocks.forEach(b => {
      const bb = {};
      b.fields.forEach(f => {
        const v = get(`${g.id}.${b.id}.${f.id}`); if (!v) return;
        if (typeof v === 'object' && !Array.isArray(v)){ const { thumb, ...r } = v; if (r.name || r.note) bb[f.id] = r; }
        else if (Array.isArray(v)){ const a = v.filter(x => (x||'').trim()); if (a.length) bb[f.id] = a; }
        else if (String(v).trim()) bb[f.id] = v;
      });
      if (Object.keys(bb).length) gg[b.id] = bb;
    });
    if (Object.keys(gg).length) out.groups[g.id] = { title: g.title, blocks: gg };
  });
  return out;
}
function md(){
  const L = ['# Portfolio braindump', '', `Exported ${new Date().toLocaleString()}`, ''];
  groups.forEach(g => {
    const parts = [];
    g.blocks.forEach(b => {
      const rows = [];
      b.fields.forEach(f => {
        const k = `${g.id}.${b.id}.${f.id}`, v = get(k); if (!filled(k)) return;
        const tag = f.tag === 'hr' ? '[recruiter]' : f.tag === 'des' ? '[designer]' : '[both]';
        if (f.type === 'img') rows.push(`**${f.label}** ${tag} → \`${v.name || '(no file)'}\`${v.note ? ' — ' + v.note : ''}`);
        else if (Array.isArray(v)) rows.push(`**${f.label}** ${tag}\n` + v.filter(x => (x||'').trim()).map(x => `- ${x}`).join('\n'));
        else rows.push(`**${f.label}** ${tag}\n\n${v}`);
      });
      if (rows.length) parts.push(`### ${b.title}\n\n${rows.join('\n\n')}`);
    });
    if (parts.length) L.push(`## ${g.title}${g.meta ? '  \n_' + g.meta + '_' : ''}`, '', parts.join('\n\n'), '');
  });
  const imgs = all.filter(x => x.f.type === 'img' && filled(x.k)).map(x => `- ${get(x.k).name} → ${x.g.title} / ${x.f.label}`);
  if (imgs.length) L.push('## Images referenced', '', ...imgs, '');
  return L.join('\n');
}
document.getElementById('btnJson').addEventListener('click', () => { dl('portfolio-braindump.json', JSON.stringify(clean(), null, 2), 'application/json'); toast('Dump exported'); });
document.getElementById('btnMd').addEventListener('click', () => { dl('portfolio-braindump.md', md(), 'text/markdown'); toast('Brief exported'); });
const fileIn = document.getElementById('fileIn');
document.getElementById('btnImport').addEventListener('click', () => fileIn.click());
fileIn.addEventListener('change', async () => {
  const f = fileIn.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    Object.entries(j.groups || {}).forEach(([gid, g]) => Object.entries(g.blocks || {}).forEach(([bid, b]) =>
      Object.entries(b).forEach(([fid, v]) => { data[`${gid}.${bid}.${fid}`] = v; })));
    localStorage.setItem(KEY, JSON.stringify(data));
    location.reload();
  } catch(e){ toast('Could not read that file'); }
});
})();
