(function(){
  // Spanish is the source language: each text block is looked up by its normalized Spanish HTML
  // and swapped for its English version from window.MARSO_EN (i18n-en.js).
  var SKIP = {SCRIPT:1,STYLE:1,SVG:1,CANVAS:1,VIDEO:1,IFRAME:1,NOSCRIPT:1,TEMPLATE:1};
  var ATTRS = ['alt','aria-label','title','placeholder'];
  var STORAGE_KEY = 'marso-lang';
  var dictionary = window.MARSO_EN || {html:{},attr:{}};
  var changes = [];

  function normalize(text){return text.replace(/\s+/g,' ').trim();}
  function hasOwnText(element){
    for (var node = element.firstChild; node; node = node.nextSibling){
      if (node.nodeType === 3 && /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(node.nodeValue)){return true;}
    }
    return false;
  }

  // A translation unit is the outermost element that holds text directly; its inline markup travels with it.
  function walk(element, onUnit, onAttr){
    if (element.hasAttribute('data-i18n-skip')){return;}
    ATTRS.forEach(function(name){var value = element.getAttribute(name);if (value && /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value)){onAttr(element,name,normalize(value));}});
    if (SKIP[element.nodeName.toUpperCase()]){return;}
    if (hasOwnText(element)){onUnit(element,normalize(element.innerHTML));return;}
    for (var child = element.firstElementChild; child; child = child.nextElementSibling){walk(child,onUnit,onAttr);}
  }

  function apply(){
    changes = [];
    walk(document.body,function(element,key){
      var english = dictionary.html[key];
      if (english !== undefined){changes.push({element:element,html:element.innerHTML});element.innerHTML = english;}
    },function(element,name,key){
      var english = dictionary.attr[key];
      if (english !== undefined){changes.push({element:element,attr:name,value:element.getAttribute(name)});element.setAttribute(name,english);}
    });
    var meta = document.querySelector('meta[name="description"]');
    if (meta && dictionary.attr[normalize(meta.content)]){changes.push({element:meta,attr:'content',value:meta.content});meta.content = dictionary.attr[normalize(meta.content)];}
    changes.push({title:document.title});
    if (dictionary.attr[normalize(document.title)]){document.title = dictionary.attr[normalize(document.title)];}
  }
  function revert(){
    for (var i = changes.length - 1; i >= 0; i -= 1){
      var change = changes[i];
      if (change.title !== undefined){document.title = change.title;}
      else if (change.attr){change.element.setAttribute(change.attr,change.value);}
      else {change.element.innerHTML = change.html;}
    }
    changes = [];
  }

  var current = 'es';
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'lang-toggle';
  button.setAttribute('data-i18n-skip','');

  function render(){
    button.innerHTML = current === 'en' ? '<span aria-hidden="true">ES</span>' : '<span aria-hidden="true">EN</span>';
    button.setAttribute('aria-label',current === 'en' ? 'Ver la página en español' : 'View this page in English');
    button.setAttribute('lang',current === 'en' ? 'es' : 'en');
  }
  function setLanguage(language){
    if (language === current){return;}
    if (language === 'en'){apply();} else {revert();}
    current = language;
    document.documentElement.lang = language;
    render();
    try {localStorage.setItem(STORAGE_KEY,language);} catch (error) {}
    document.dispatchEvent(new CustomEvent('marso:lang',{detail:language}));
  }
  button.addEventListener('click',function(){setLanguage(current === 'en' ? 'es' : 'en');});

  // Extraction mode for maintenance: lists every untranslated text so the dictionary can be completed.
  window.marsoI18nMissing = function(){
    var missing = {html:[],attr:[]};
    walk(document.body,function(element,key){if (dictionary.html[key] === undefined){missing.html.push(key);}},function(element,name,key){if (dictionary.attr[key] === undefined){missing.attr.push(key);}});
    return missing;
  };

  render();
  var anchor = document.querySelector('.area-back') || document.querySelector('header .status-pill');
  if (anchor){
    var actions = document.createElement('div');
    actions.className = 'header-actions';
    anchor.parentNode.insertBefore(actions,anchor);
    actions.appendChild(button);
    actions.appendChild(anchor);
  } else if (document.querySelector('header')){document.querySelector('header').appendChild(button);}

  var saved = 'es';
  try {saved = localStorage.getItem(STORAGE_KEY) || 'es';} catch (error) {}
  if (saved === 'en'){setLanguage('en');}
})();
