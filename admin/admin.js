/* Marso Studio admin panel: builds a form from profile.schema.json, validates live with the shared validator,
   previews unsaved changes in the iframe (postMessage) and saves through the local admin server. */
(function(){
  'use strict';

  var state = {schema: null, data: null, saved: '', version: null, errors: {}, backups: []};
  var statusEl = document.getElementById('status');
  var saveBtn = document.getElementById('save');
  var discardBtn = document.getElementById('discard');
  var restoreBtn = document.getElementById('restore');
  var backupsSel = document.getElementById('backups');
  var formEl = document.getElementById('form');
  var tocEl = document.getElementById('toc');
  var frame = document.getElementById('preview');
  var previewReady = false, previewTimer = null, toastTimer = null;

  /* ---------- helpers ---------- */
  function h(tag, props, kids){
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function(k){
      if (k === 'text') el.textContent = props[k];
      else if (k === 'class') el.className = props[k];
      else el.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function(c){ if (c) el.appendChild(c); });
    return el;
  }
  function getAt(obj, p){ return p.reduce(function(o, k){ return o == null ? undefined : o[k]; }, obj); }
  function setAt(obj, p, v){ var o = obj; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function api(path, opts){
    opts = opts || {};
    var headers = {'X-Requested-With': 'marso-admin'};
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch(path, {method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined})
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {ok: r.ok, status: r.status, json: j}; }); });
  }
  function toast(msg, kind){
    var t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.className = 'toast'; }, 4500);
  }
  // two-step confirmation without blocking dialogs: the first click arms the button, the second one runs it
  function confirmClick(btn, action, armedText){
    var original = btn.textContent;
    btn.addEventListener('click', function(){
      if (btn.classList.contains('armed')){ btn.classList.remove('armed'); btn.textContent = original; clearTimeout(btn._t); action(); return; }
      btn.classList.add('armed'); btn.textContent = armedText || '¿Seguro?';
      btn._t = setTimeout(function(){ btn.classList.remove('armed'); btn.textContent = original; }, 3000);
    });
  }

  /* ---------- form building ---------- */
  function fieldId(path){ return 'f-' + path.join('-'); }
  function withErr(wrapper, path){
    wrapper.setAttribute('data-path', path.join('.'));
    wrapper.appendChild(h('div', {class: 'err'}));
    return wrapper;
  }

  function renderInput(node, path, labelText){
    var id = fieldId(path), value = getAt(state.data, path);
    var multiline = node.kind === 'text';
    var input = h(multiline ? 'textarea' : 'input', {id: id});
    if (!multiline) input.type = node.kind === 'number' ? 'number' : (node.kind === 'email' ? 'email' : 'text');
    if (multiline) input.rows = Math.max(2, String(value || '').split('\n').length + (String(value || '').length > 90 ? 1 : 0));
    if (node.kind === 'number'){ if (node.min != null) input.min = node.min; if (node.max != null) input.max = node.max; }
    input.value = value == null ? '' : value;
    if (node.readonly) input.readOnly = true;
    input.addEventListener('input', function(){
      var v = input.value;
      if (node.kind === 'number') v = v === '' ? null : Number(v);
      setAt(state.data, path, v);
      changed();
    });
    var wrap = h('div', {class: 'field'}, [h('label', {for: id, text: labelText || node.label}), input]);
    if (node.hint) wrap.appendChild(h('div', {class: 'hint', text: node.hint}));
    return withErr(wrap, path);
  }

  function renderObjectBody(node, path, into){
    (node.fields || []).forEach(function(f){ into.appendChild(renderNode(f, path.concat(f.key))); });
  }

  function renderNode(node, path){
    if (node.kind === 'object'){
      var fs = h('fieldset', {}, [h('legend', {text: node.label})]);
      if (node.hint) fs.appendChild(h('div', {class: 'hint', text: node.hint}));
      renderObjectBody(node, path, fs);
      return fs;
    }
    if (node.kind === 'list') return renderList(node, path);
    return renderInput(node, path);
  }

  function renderList(node, path){
    var wrap = h('div', {class: 'list-wrap'}, [h('div', {class: 'list-title', text: node.label})]);
    if (node.hint) wrap.appendChild(h('div', {class: 'hint', text: node.hint}));
    var box = h('div', {class: 'list'});
    wrap.appendChild(box);
    wrap.setAttribute('data-path', path.join('.'));
    wrap.appendChild(h('div', {class: 'err'}));
    var fixed = node.fixedCount != null;

    function draw(){
      box.innerHTML = '';
      var arr = getAt(state.data, path);
      arr.forEach(function(item, i){
        var itemPath = path.concat(i);
        var title = h('strong', {text: (node.item.label || 'Elemento') + ' ' + (i + 1)});
        if (node.itemLabel) title.setAttribute('data-title', itemPath.concat(node.itemLabel).join('.'));
        title.setAttribute('data-fallback', (node.item.label || 'Elemento') + ' ' + (i + 1));
        var head = h('div', {class: 'item-head'}, [h('span', {class: 'idx', text: String(i + 1).padStart(2, '0')}), title]);
        if (!fixed){
          var up = h('button', {type: 'button', class: 'btn', 'aria-label': 'Subir elemento ' + (i + 1), text: '▲'});
          var down = h('button', {type: 'button', class: 'btn', 'aria-label': 'Bajar elemento ' + (i + 1), text: '▼'});
          var del = h('button', {type: 'button', class: 'btn', 'aria-label': 'Borrar elemento ' + (i + 1), text: 'Borrar'});
          up.disabled = i === 0; down.disabled = i === arr.length - 1;
          del.disabled = node.min != null && arr.length <= node.min;
          up.addEventListener('click', function(){ arr.splice(i - 1, 0, arr.splice(i, 1)[0]); draw(); changed(); });
          down.addEventListener('click', function(){ arr.splice(i + 1, 0, arr.splice(i, 1)[0]); draw(); changed(); });
          confirmClick(del, function(){ arr.splice(i, 1); draw(); changed(); }, '¿Borrar?');
          head.appendChild(up); head.appendChild(down); head.appendChild(del);
        } else {
          head.appendChild(h('span', {class: 'locked', text: 'cantidad fija'}));
        }
        var card = h('div', {class: 'item'}, [head]);
        if (node.item.kind === 'object') renderObjectBody(node.item, itemPath, card);
        else card.appendChild(renderInput(node.item, itemPath, node.item.label || node.label));
        box.appendChild(card);
      });
      if (!fixed && (node.max == null || arr.length < node.max)){
        var add = h('button', {type: 'button', class: 'btn list-add', text: '+ Agregar'});
        add.addEventListener('click', function(){
          arr.push(blank(node.item));
          draw(); changed();
          var last = box.querySelectorAll('.item');
          var first = last[last.length - 1] && last[last.length - 1].querySelector('input,textarea');
          if (first) first.focus();
        });
        box.appendChild(add);
      }
      updateTitles();
    }
    draw();
    return wrap;
  }

  function blank(node){
    if (node.kind === 'object'){ var o = {}; (node.fields || []).forEach(function(f){ if (f.kind === 'object' || f.kind === 'list') o[f.key] = blank(f); else if (!f.optional) o[f.key] = f.kind === 'number' ? null : ''; }); return o; }
    if (node.kind === 'list') return [];
    return node.kind === 'number' ? null : '';
  }

  function buildForm(){
    formEl.innerHTML = ''; tocEl.innerHTML = '';
    state.schema.fields.forEach(function(sec){
      var card = h('section', {class: 'card', id: 'sec-' + sec.key}, [h('h2', {text: sec.label})]);
      if (sec.hint) card.appendChild(h('div', {class: 'hint', text: sec.hint}));
      if (sec.kind === 'object') renderObjectBody(sec, [sec.key], card);
      else card.appendChild(renderNode(sec, [sec.key]));
      formEl.appendChild(card);
      tocEl.appendChild(h('a', {href: '#sec-' + sec.key, 'data-sec': sec.key, text: sec.label}));
    });
    updateTitles(); // titles read state.data, so they need the form to be attached first
    paintErrors();
  }

  function updateTitles(){
    document.querySelectorAll('[data-title]').forEach(function(el){
      var v = getAt(state.data, el.getAttribute('data-title').split('.').map(function(k){ return /^\d+$/.test(k) ? Number(k) : k; }));
      el.textContent = (v && String(v).trim()) || el.getAttribute('data-fallback');
    });
  }

  /* ---------- validation, status, preview ---------- */
  function runValidation(){
    var res = MarsoValidate.validate(state.schema, state.data);
    state.errors = {};
    res.errors.forEach(function(e){ if (!state.errors[e.path]) state.errors[e.path] = e.message; });
    return res;
  }
  function paintErrors(){
    document.querySelectorAll('[data-path]').forEach(function(n){
      var msg = state.errors[n.getAttribute('data-path')] || '';
      var e = n.querySelector(':scope > .err');
      if (e) e.textContent = msg;
      n.classList.toggle('invalid', !!msg);
    });
    tocEl.querySelectorAll('a').forEach(function(a){
      var key = a.getAttribute('data-sec');
      a.classList.toggle('has-error', Object.keys(state.errors).some(function(p){ return p === key || p.indexOf(key + '.') === 0; }));
    });
  }
  function isDirty(){ return JSON.stringify(state.data) !== state.saved; }
  function paintStatus(){
    var n = Object.keys(state.errors).length, dirty = isDirty();
    var text = dirty ? 'Cambios sin guardar' : 'Todo guardado';
    if (n) text += ' · ' + n + (n === 1 ? ' error' : ' errores');
    statusEl.textContent = text;
    statusEl.className = 'status ' + (n ? 'bad' : (dirty ? 'dirty' : 'good'));
    saveBtn.disabled = !dirty;
    discardBtn.disabled = !dirty;
  }
  function pushPreview(){
    if (!previewReady || !frame.contentWindow || !state.data) return;
    frame.contentWindow.postMessage({type: 'marso:profile-preview', data: clone(state.data)}, location.origin);
  }
  function changed(){
    updateTitles(); runValidation(); paintErrors(); paintStatus();
    clearTimeout(previewTimer); previewTimer = setTimeout(pushPreview, 250);
  }
  frame.addEventListener('load', function(){ previewReady = true; pushPreview(); });

  /* ---------- load / save / discard / restore ---------- */
  function load(){
    return api('/api/profile').then(function(r){
      if (!r.ok) throw new Error('profile ' + r.status);
      state.data = r.json.data; state.version = r.json.version;
      state.saved = JSON.stringify(state.data);
      buildForm(); runValidation(); paintErrors(); paintStatus(); pushPreview();
      return loadBackups();
    });
  }
  function loadBackups(){
    return api('/api/backups').then(function(r){
      state.backups = (r.json && r.json.backups) || [];
      backupsSel.innerHTML = '';
      backupsSel.appendChild(h('option', {value: '', text: state.backups.length ? 'Respaldos (' + state.backups.length + ')…' : 'Sin respaldos'}));
      state.backups.forEach(function(b){
        var d = new Date(b.createdAt);
        backupsSel.appendChild(h('option', {value: b.name, text: d.toLocaleDateString('es') + ' ' + d.toLocaleTimeString('es', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}));
      });
      restoreBtn.disabled = true;
    });
  }
  backupsSel.addEventListener('change', function(){ restoreBtn.disabled = !backupsSel.value; });

  function applyServerData(json){
    state.data = json.data; state.version = json.version; state.saved = JSON.stringify(state.data);
    var y = window.scrollY; buildForm(); window.scrollTo(0, y);
    runValidation(); paintErrors(); paintStatus(); pushPreview();
  }
  function conflict(msg){ toast(msg || 'profile.json cambió en el disco. Descarta los cambios para recargar.', 'bad'); }

  function save(){
    var res = runValidation(); paintErrors(); paintStatus();
    if (!res.ok){
      toast('Hay campos por corregir.', 'bad');
      var first = document.querySelector('.invalid'); if (first) first.scrollIntoView({block: 'center'});
      return;
    }
    saveBtn.disabled = true;
    api('/api/profile', {method: 'PUT', body: {data: state.data, version: state.version}}).then(function(r){
      if (r.ok){
        applyServerData(r.json); loadBackups();
        toast('Guardado. Respaldo: ' + r.json.backup, 'good');
        document.getElementById('publish').hidden = false;
      } else if (r.status === 409){ conflict(r.json.message); paintStatus(); }
      else if (r.status === 400 && r.json.errors){
        r.json.errors.forEach(function(e){ state.errors[e.path] = e.message; }); paintErrors(); paintStatus();
        toast('El servidor encontró campos inválidos.', 'bad');
      } else { toast('No se pudo guardar: ' + (r.json.error || r.status), 'bad'); paintStatus(); }
    }).catch(function(){ toast('No se pudo conectar con el servidor local.', 'bad'); paintStatus(); });
  }

  saveBtn.addEventListener('click', save);
  confirmClick(discardBtn, function(){ load().then(function(){ toast('Cambios descartados.'); }); }, '¿Descartar?');
  confirmClick(restoreBtn, function(){
    if (!backupsSel.value) return;
    api('/api/restore', {method: 'POST', body: {name: backupsSel.value, version: state.version}}).then(function(r){
      if (r.ok){ applyServerData(r.json); loadBackups(); toast('Respaldo restaurado. El anterior quedó guardado como ' + r.json.backup + '.', 'good'); document.getElementById('publish').hidden = false; }
      else if (r.status === 409) conflict(r.json.message);
      else toast('No se pudo restaurar: ' + (r.json.error || r.status), 'bad');
    });
  }, '¿Restaurar?');

  document.addEventListener('keydown', function(e){
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); if (!saveBtn.disabled) save(); }
  });
  window.addEventListener('beforeunload', function(e){ if (state.data && isDirty()){ e.preventDefault(); e.returnValue = ''; } });

  document.getElementById('copycmd').addEventListener('click', function(){
    var cmd = document.getElementById('gitcmd').textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(cmd) : Promise.reject()).then(function(){ toast('Comando copiado.', 'good'); }, function(){ toast('Selecciónalo y cópialo a mano.'); });
  });
  document.getElementById('closepublish').addEventListener('click', function(){ document.getElementById('publish').hidden = true; });

  /* ---------- start ---------- */
  fetch('profile.schema.json').then(function(r){ if (!r.ok) throw new Error('schema'); return r.json(); }).then(function(schema){
    state.schema = schema;
    return load();
  }).then(function(){
    document.getElementById('app').hidden = false;
    pushPreview();
  }).catch(function(){
    statusEl.textContent = 'Sin conexión con el servidor local'; statusEl.className = 'status bad';
    document.getElementById('offline').hidden = false;
    document.querySelector('.bar-actions').hidden = true;
  });
})();
