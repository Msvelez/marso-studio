/* Renders the home page from profile.json.
   The HTML keeps its Spanish text as a fallback (no JS, no network, file://); this script overwrites it from the JSON.

   Attributes (values are a path like "hero.title", or a template like "{.number}{?.status| · }"):
     data-profile="path"          sets the element's content (inline markup: **bold**, *italic*, newline = <br>)
     data-profile-text="path"     replaces only the element's own text node (keeps child icons/spans)
     data-profile-href="expr"     sets href
     data-profile-attr-NAME="expr" sets any attribute (removed when the value is empty)
     data-profile-list="path"     children are matched by index to the array; extra items clone the last child
     data-profile-fixed           on a list: never clone/remove children (layout depends on the count)
   Inside a list, paths starting with "." are relative to the item ("." alone is the item itself).
   Template: {path} inserts a value; {?path|prefix} inserts prefix+value only when the value exists. */
(function(){
  var URL = 'profile.json';
  var root = null;

  function lookup(path, scope){
    if (path === '.') return scope.item;
    var base = root, p = path;
    if (path.charAt(0) === '.'){ base = scope.item; p = path.slice(1); }
    return p.split('.').reduce(function(o, k){ return o == null ? undefined : o[k]; }, base);
  }
  function expand(expr, scope){
    if (expr.indexOf('{') === -1){ var v = lookup(expr, scope); return v == null ? null : String(v); }
    return expr.replace(/\{(\?)?([^}|]+)(?:\|([^}]*))?\}/g, function(_, optional, path, prefix){
      var v = lookup(path, scope);
      if (v == null || v === '') return '';
      return (optional ? (prefix || '') : '') + v;
    });
  }
  function markup(text){
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
  function setOwnText(el, value){
    for (var n = el.firstChild; n; n = n.nextSibling){
      if (n.nodeType === 3 && n.nodeValue.trim()){ n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), value); return; }
    }
    el.appendChild(document.createTextNode(value));
  }

  function apply(el, scope){
    Array.prototype.slice.call(el.attributes).forEach(function(attr){
      var name = attr.name, value;
      if (name === 'data-profile'){
        value = expand(attr.value, scope);
        if (value == null){ console.warn('[profile] sin dato para', attr.value); return; }
        el.innerHTML = markup(value);
      } else if (name === 'data-profile-text'){
        value = expand(attr.value, scope);
        if (value == null){ console.warn('[profile] sin dato para', attr.value); return; }
        setOwnText(el, value);
      } else if (name === 'data-profile-href'){
        value = expand(attr.value, scope);
        if (value) el.setAttribute('href', value); else console.warn('[profile] sin dato para', attr.value);
      } else if (name.indexOf('data-profile-attr-') === 0){
        var target = name.slice('data-profile-attr-'.length);
        value = expand(attr.value, scope);
        if (value) el.setAttribute(target, value); else el.removeAttribute(target);
      }
    });
  }
  function hasBinding(el){
    var all = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    return all.some(function(n){
      return Array.prototype.some.call(n.attributes, function(a){ return a.name.indexOf('data-profile') === 0; });
    });
  }

  function renderList(listEl){
    var items = lookup(listEl.getAttribute('data-profile-list'), {item: null});
    if (!Array.isArray(items)){ console.warn('[profile] la lista no existe:', listEl.getAttribute('data-profile-list')); return; }
    var fixed = listEl.hasAttribute('data-profile-fixed');
    // only children that carry bindings are items (other scripts may inject extras, e.g. the constellation <canvas>)
    var kids = Array.prototype.slice.call(listEl.children).filter(hasBinding);
    if (items.length !== kids.length){
      if (fixed){
        console.warn('[profile] "' + listEl.getAttribute('data-profile-list') + '" tiene ' + items.length + ' items y el HTML ' + kids.length + '; se rellenan los que coinciden');
      } else {
        while (kids.length < items.length){
          var clone = kids[kids.length - 1].cloneNode(true);
          if (clone.classList.contains('reveal')) clone.classList.add('in');
          listEl.appendChild(clone); kids.push(clone);
        }
        while (kids.length > items.length){ listEl.removeChild(kids.pop()); }
      }
    }
    kids.forEach(function(kid, i){
      if (i >= items.length) return;
      var scope = {item: items[i]};
      apply(kid, scope);
      Array.prototype.slice.call(kid.querySelectorAll('*')).forEach(function(el){ apply(el, scope); });
    });
  }

  function render(data){
    root = data;
    window.MARSO_PROFILE = data;
    var scope = {item: null};
    // top-level pass: everything that is not inside a list
    Array.prototype.slice.call(document.querySelectorAll('[data-profile],[data-profile-text],[data-profile-href]')).forEach(function(el){
      if (el.closest('[data-profile-list]')) return;
      apply(el, scope);
    });
    document.querySelectorAll('[data-profile-list]').forEach(renderList);
    if (data.site){
      if (data.site.title) document.title = data.site.title;
      var meta = document.querySelector('meta[name="description"]');
      if (meta && data.site.description) meta.setAttribute('content', data.site.description);
    }
    document.dispatchEvent(new CustomEvent('marso:profile', {detail: data}));
  }

  // i18n.js waits for this promise before applying the saved language, so English is applied on top of the rendered text
  window.marsoProfileReady = fetch(URL, {cache: 'no-cache'})
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch(function(err){ console.warn('[profile] se mantiene el texto del HTML (' + err.message + ')'); });
})();
