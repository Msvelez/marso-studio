/* Schema validator shared by the admin server (Node) and the admin panel (browser).
   Field kinds: string, text (multi-line), email, href, number, object, list.
   Field options: optional, readonly, min, max, fixedCount, itemLabel, hint, label. Unknown keys in the data are preserved. */
(function(root, factory){
  if (typeof module === 'object' && module.exports){ module.exports = factory(); }
  else { root.MarsoValidate = factory(); }
})(this, function(){
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var HREF = /^(#[\w-]+|https?:\/\/\S+|mailto:\S+|[\w\-./]+\.html(#[\w-]*)?)$/;
  var MAX = {string: 200, text: 2000, email: 200, href: 300};

  function isObject(v){ return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function isEmpty(v){ return v === undefined || v === null || (typeof v === 'string' && v.trim() === ''); }

  function validate(node, value, path, errors){
    var k = node.kind;
    if (k === 'object'){
      if (!isObject(value)){ errors.push({path: path, message: 'Debe ser un objeto.'}); return; }
      (node.fields || []).forEach(function(f){
        var v = value[f.key], p = path ? path + '.' + f.key : f.key;
        if (isEmpty(v) && f.kind !== 'object' && f.kind !== 'list'){
          if (!f.optional) errors.push({path: p, message: 'Es obligatorio.'});
          return;
        }
        if (v === undefined){ errors.push({path: p, message: 'Falta esta sección.'}); return; }
        validate(f, v, p, errors);
      });
    } else if (k === 'list'){
      if (!Array.isArray(value)){ errors.push({path: path, message: 'Debe ser una lista.'}); return; }
      var n = value.length;
      if (node.fixedCount != null && n !== node.fixedCount) errors.push({path: path, message: 'Debe tener exactamente ' + node.fixedCount + ' elementos (tiene ' + n + ').'});
      if (node.min != null && n < node.min) errors.push({path: path, message: 'Necesita al menos ' + node.min + ' elemento(s).'});
      if (node.max != null && n > node.max) errors.push({path: path, message: 'Admite como máximo ' + node.max + ' elementos.'});
      value.forEach(function(item, i){
        var p = path + '.' + i;
        if (node.item.kind !== 'object' && isEmpty(item)){ errors.push({path: p, message: 'Es obligatorio.'}); return; }
        validate(node.item, item, p, errors);
      });
    } else if (k === 'number'){
      if (typeof value !== 'number' || !isFinite(value) || Math.floor(value) !== value) errors.push({path: path, message: 'Debe ser un número entero.'});
      else {
        if (node.min != null && value < node.min) errors.push({path: path, message: 'Mínimo ' + node.min + '.'});
        if (node.max != null && value > node.max) errors.push({path: path, message: 'Máximo ' + node.max + '.'});
      }
    } else {
      if (typeof value !== 'string'){ errors.push({path: path, message: 'Debe ser texto.'}); return; }
      var t = value.trim(), max = node.max || MAX[k] || MAX.string;
      if (t.length > max) errors.push({path: path, message: 'Máximo ' + max + ' caracteres (tiene ' + t.length + ').'});
      if (k === 'email' && !EMAIL.test(t)) errors.push({path: path, message: 'No parece un correo válido.'});
      if (k === 'href' && !HREF.test(t)) errors.push({path: path, message: 'Usa #sección, una página .html o una URL http(s)://, mailto:.'});
      if (k !== 'text' && /\n/.test(t)) errors.push({path: path, message: 'No admite saltos de línea.'});
    }
  }

  // Returns a clean copy: trimmed strings, empty optionals removed, keys in schema order, unknown keys kept at the end.
  function normalize(node, value){
    if (node.kind === 'object'){
      var out = {}, known = {};
      (node.fields || []).forEach(function(f){
        known[f.key] = true;
        var v = value ? value[f.key] : undefined;
        if (f.optional && isEmpty(v)) return;
        if (v !== undefined) out[f.key] = normalize(f, v);
      });
      Object.keys(value || {}).forEach(function(key){ if (!known[key]) out[key] = value[key]; });
      return out;
    }
    if (node.kind === 'list') return (value || []).map(function(item){ return normalize(node.item, item); });
    if (typeof value === 'string') return value.trim();
    return value;
  }

  function run(schema, data){
    var errors = [];
    validate(schema, data, '', errors);
    return {ok: errors.length === 0, errors: errors, data: errors.length ? null : normalize(schema, data)};
  }

  return {validate: run, normalize: normalize};
});
