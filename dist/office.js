/*
    generate by magix-composer@3.0.0
    https://github.com/thx/magix-composer
    author: https://github.com/xinglie
    loader:none
 */
if (typeof DEBUG == 'undefined')
    DEBUG = true;

/**
 * Sea.js 2.2.3 | seajs.org/LICENSE.md
 */
(function(global, undefined) {

// Avoid conflicting when `sea.js` is loaded multiple times
if (global.seajs) {
  return
}

var seajs = global.seajs = {
  // The current version of Sea.js being used
  version: "2.2.3"
}

var data = seajs.data = {}


/**
 * util-lang.js - The minimal language enhancement
 */

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")
var isUndefined = isType("Undefined")

var _cid = 0
function cid() {
  return _cid++
}

/**
 * util-events.js - The minimal events support
 */

var events = data.events = {}

// Bind event
seajs.on = function(name, callback) {
  var list = events[name] || (events[name] = [])
  list.push(callback)
  return seajs
}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
seajs.off = function(name, callback) {
  // Remove *all* events
  if (!(name || callback)) {
    events = data.events = {}
    return seajs
  }

  var list = events[name]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete events[name]
    }
  }

  return seajs
}

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
var emit = seajs.emit = function(name, data) {
  var list = events[name], fn

  if (list) {
    // Copy callback lists to prevent modification
    list = list.slice()

    // Execute event callbacks
    while ((fn = list.shift())) {
      fn(data)
    }
  }

  return seajs
}


/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?#]*\//

var DOT_RE = /\/\.\//g
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
var DOUBLE_SLASH_RE = /([^:/])\/\//g

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  return path.match(DIRNAME_RE)[0]
}

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
function realpath(path) {
  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(DOT_RE, "/")

  // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, "/")
  }

  // a//b/c  ==>  a/b/c
  path = path.replace(DOUBLE_SLASH_RE, "$1/")

  return path
}

// Normalize an id
// normalize("path/to/a") ==> "path/to/a.js"
// NOTICE: substring is faster than negative slice and RegExp
function normalize(path) {
  var last = path.length - 1
  var lastC = path.charAt(last)

  // If the uri ends with `#`, just return it without '#'
  if (lastC === "#") {
    return path.substring(0, last)
  }

  return (path.substring(last - 2) === ".js" ||
      path.indexOf("?") > 0 ||
      path.substring(last - 3) === ".css" ||
      lastC === "/") ? path : path + ".js"
}


var PATHS_RE = /^([^/:]+)(\/.+)$/
var VARS_RE = /{([^{]+)}/g

function parseAlias(id) {
  var alias = data.alias
  return alias && isString(alias[id]) ? alias[id] : id
}

function parsePaths(id) {
  var paths = data.paths
  var m

  if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
    id = paths[m[1]] + m[2]
  }

  return id
}

function parseVars(id) {
  var vars = data.vars

  if (vars && id.indexOf("{") > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return isString(vars[key]) ? vars[key] : m
    })
  }

  return id
}

function parseMap(uri) {
  var map = data.map
  var ret = uri

  if (map) {
    for (var i = 0, len = map.length; i < len; i++) {
      var rule = map[i]

      ret = isFunction(rule) ?
          (rule(uri) || uri) :
          uri.replace(rule[0], rule[1])

      // Only apply the first matched rule
      if (ret !== uri) break
    }
  }

  return ret
}


var ABSOLUTE_RE = /^\/\/.|:\//
var ROOT_DIR_RE = /^.*?\/\/.*?\//

function addBase(id, refUri) {
  var ret
  var first = id.charAt(0)

  // Absolute
  if (ABSOLUTE_RE.test(id)) {
    ret = id
  }
  // Relative
  else if (first === ".") {
    ret = realpath((refUri ? dirname(refUri) : data.cwd) + id)
  }
  // Root
  else if (first === "/") {
    var m = data.cwd.match(ROOT_DIR_RE)
    ret = m ? m[0] + id.substring(1) : id
  }
  // Top-level
  else {
    ret = data.base + id
  }

  // Add default protocol when uri begins with "//"
  if (ret.indexOf("//") === 0) {
    ret = location.protocol + ret
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ""

  id = parseAlias(id)
  id = parsePaths(id)
  id = parseVars(id)
  id = normalize(id)

  var uri = addBase(id, refUri)
  uri = parseMap(uri)

  return uri
}


var doc = document
var cwd = dirname(doc.URL)
var scripts = doc.scripts

// Recommend to add `seajsnode` id for the `sea.js` script element
var loaderScript = doc.getElementById("seajsnode") ||
    scripts[scripts.length - 1]

// When `sea.js` is inline, set loaderDir to current working directory
var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd)

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? // non-IE6/7
      node.src :
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
      node.getAttribute("src", 4)
}


// For Developers
seajs.resolve = id2Uri


/**
 * util-request.js - The utilities for requesting script and style files
 * ref: tests/research/load-js-css/test.html
 */

var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
var baseElement = head.getElementsByTagName("base")[0]

var IS_CSS_RE = /\.css(?:\?|$)/i
var currentlyAddingScript
var interactiveScript

// `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
// ref:
//  - https://bugs.webkit.org/show_activity.cgi?id=38995
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
var isOldWebKit = +navigator.userAgent
    .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536


function request(url, callback, charset, crossorigin) {
  var isCSS = IS_CSS_RE.test(url)
  var node = doc.createElement(isCSS ? "link" : "script")

  if (charset) {
    node.charset = charset
  }

  // crossorigin default value is `false`.
  if (!isUndefined(crossorigin)) {
    node.setAttribute("crossorigin", crossorigin)
  }


  addOnload(node, callback, isCSS, url)

  if (isCSS) {
    node.rel = "stylesheet"
    node.href = url
  }
  else {
    node.async = true
    node.src = url
  }

  // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
  // the end of the insert execution, so use `currentlyAddingScript` to
  // hold current node, for deriving url in `define` call
  currentlyAddingScript = node

  // ref: #185 & http://dev.jquery.com/ticket/2709
  baseElement ?
      head.insertBefore(node, baseElement) :
      head.appendChild(node)

  currentlyAddingScript = null
}

function addOnload(node, callback, isCSS, url) {
  var supportOnload = "onload" in node

  // for Old WebKit and Old Firefox
  if (isCSS && (isOldWebKit || !supportOnload)) {
    setTimeout(function() {
      pollCss(node, callback)
    }, 1) // Begin after node insertion
    return
  }

  if (supportOnload) {
    node.onload = onload
    node.onerror = function() {
      emit("error", { uri: url, node: node })
      onload()
    }
  }
  else {
    node.onreadystatechange = function() {
      if (/loaded|complete/.test(node.readyState)) {
        onload()
      }
    }
  }

  function onload() {
    // Ensure only run once and handle memory leak in IE
    node.onload = node.onerror = node.onreadystatechange = null

    // Remove the script to reduce memory leak
    if (!isCSS && !data.debug) {
      head.removeChild(node)
    }

    // Dereference the node
    node = null

    callback()
  }
}

function pollCss(node, callback) {
  var sheet = node.sheet
  var isLoaded

  // for WebKit < 536
  if (isOldWebKit) {
    if (sheet) {
      isLoaded = true
    }
  }
  // for Firefox < 9.0
  else if (sheet) {
    try {
      if (sheet.cssRules) {
        isLoaded = true
      }
    } catch (ex) {
      // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
      // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
      // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        isLoaded = true
      }
    }
  }

  setTimeout(function() {
    if (isLoaded) {
      // Place callback here to give time for style rendering
      callback()
    }
    else {
      pollCss(node, callback)
    }
  }, 20)
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  // For IE6-9 browsers, the script onload event may not fire right
  // after the script is evaluated. Kris Zyp found that it
  // could query the script nodes and the one that is in "interactive"
  // mode indicates the current script
  // ref: http://goo.gl/JHfFW
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}


// For Developers
seajs.request = request

/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 */

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = []

  code.replace(SLASH_RE, "")
      .replace(REQUIRE_RE, function(m, m1, m2) {
        if (m2) {
          ret.push(m2)
        }
      })

  return ret
}


/**
 * module.js - The core of module loader
 */

var cachedMods = seajs.cache = {}
var anonymousMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

var STATUS = Module.STATUS = {
  // 1 - The `module.uri` is being fetched
  FETCHING: 1,
  // 2 - The meta data has been saved to cachedMods
  SAVED: 2,
  // 3 - The `module.dependencies` are being loaded
  LOADING: 3,
  // 4 - The module are ready to execute
  LOADED: 4,
  // 5 - The module is being executed
  EXECUTING: 5,
  // 6 - The `module.exports` is available
  EXECUTED: 6
}


function Module(uri, deps) {
  this.uri = uri
  this.dependencies = deps || []
  this.exports = null
  this.status = 0

  // Who depends on me
  this._waitings = {}

  // The number of unloaded dependencies
  this._remain = 0
}

// Resolve module.dependencies
Module.prototype.resolve = function() {
  var mod = this
  var ids = mod.dependencies
  var uris = []

  for (var i = 0, len = ids.length; i < len; i++) {
    uris[i] = Module.resolve(ids[i], mod.uri)
  }
  return uris
}

// Load module.dependencies and fire onload when all done
Module.prototype.load = function() {
  var mod = this

  // If the module is being loaded, just wait it onload call
  if (mod.status >= STATUS.LOADING) {
    return
  }

  mod.status = STATUS.LOADING

  // Emit `load` event for plugins such as combo plugin
  var uris = mod.resolve()
  emit("load", uris)

  var len = mod._remain = uris.length
  var m

  // Initialize modules and register waitings
  for (var i = 0; i < len; i++) {
    m = Module.get(uris[i])

    if (m.status < STATUS.LOADED) {
      // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
      m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
    }
    else {
      mod._remain--
    }
  }

  if (mod._remain === 0) {
    mod.onload()
    return
  }

  // Begin parallel loading
  var requestCache = {}

  for (i = 0; i < len; i++) {
    m = cachedMods[uris[i]]

    if (m.status < STATUS.FETCHING) {
      m.fetch(requestCache)
    }
    else if (m.status === STATUS.SAVED) {
      m.load()
    }
  }

  // Send all requests at last to avoid cache bug in IE6-9. Issues#808
  for (var requestUri in requestCache) {
    if (requestCache.hasOwnProperty(requestUri)) {
      requestCache[requestUri]()
    }
  }
}

// Call this method when module is loaded
Module.prototype.onload = function() {
  var mod = this
  mod.status = STATUS.LOADED

  if (mod.callback) {
    mod.callback()
  }

  // Notify waiting modules to fire onload
  var waitings = mod._waitings
  var uri, m

  for (uri in waitings) {
    if (waitings.hasOwnProperty(uri)) {
      m = cachedMods[uri]
      m._remain -= waitings[uri]
      if (m._remain === 0) {
        m.onload()
      }
    }
  }

  // Reduce memory taken
  delete mod._waitings
  delete mod._remain
}

// Fetch a module
Module.prototype.fetch = function(requestCache) {
  var mod = this
  var uri = mod.uri

  mod.status = STATUS.FETCHING

  // Emit `fetch` event for plugins such as combo plugin
  var emitData = { uri: uri }
  emit("fetch", emitData)
  var requestUri = emitData.requestUri || uri

  // Empty uri or a non-CMD module
  if (!requestUri || fetchedList[requestUri]) {
    mod.load()
    return
  }

  if (fetchingList[requestUri]) {
    callbackList[requestUri].push(mod)
    return
  }

  fetchingList[requestUri] = true
  callbackList[requestUri] = [mod]

  // Emit `request` event for plugins such as text plugin
  emit("request", emitData = {
    uri: uri,
    requestUri: requestUri,
    onRequest: onRequest,
    charset: isFunction(data.charset) ? data.charset(requestUri): data.charset,
    crossorigin: isFunction(data.crossorigin) ? data.crossorigin(requestUri) : data.crossorigin
  })

  if (!emitData.requested) {
    requestCache ?
        requestCache[emitData.requestUri] = sendRequest :
        sendRequest()
  }

  function sendRequest() {
    seajs.request(emitData.requestUri, emitData.onRequest, emitData.charset, emitData.crossorigin)
  }

  function onRequest() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Save meta data of anonymous module
    if (anonymousMeta) {
      Module.save(uri, anonymousMeta)
      anonymousMeta = null
    }

    // Call callbacks
    var m, mods = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((m = mods.shift())) m.load()
  }
}

// Execute a module
Module.prototype.exec = function () {
  var mod = this

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.status >= STATUS.EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS.EXECUTING

  // Create require
  var uri = mod.uri

  function require(id) {
    return Module.get(require.resolve(id)).exec()
  }

  require.resolve = function(id) {
    return Module.resolve(id, uri)
  }

  require.async = function(ids, callback) {
    Module.use(ids, callback, uri + "_async_" + cid())
    return require
  }

  // Exec factory
  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  if (exports === undefined) {
    exports = mod.exports
  }

  // Reduce memory leak
  delete mod.factory

  mod.exports = exports
  mod.status = STATUS.EXECUTED

  // Emit `exec` event
  emit("exec", mod)

  return exports
}

// Resolve id to uri
Module.resolve = function(id, refUri) {
  // Emit `resolve` event for plugins such as text plugin
  var emitData = { id: id, refUri: refUri }
  emit("resolve", emitData)

  return emitData.uri || seajs.resolve(emitData.id, refUri)
}

// Define a module
Module.define = function (id, deps, factory) {
  var argsLen = arguments.length

  // define(factory)
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  else if (argsLen === 2) {
    factory = deps

    // define(deps, factory)
    if (isArray(id)) {
      deps = id
      id = undefined
    }
    // define(id, factory)
    else {
      deps = undefined
    }
  }

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = {
    id: id,
    uri: Module.resolve(id),
    deps: deps,
    factory: factory
  }

  // Try to derive uri in IE6-9 for anonymous modules
  if (!meta.uri && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      meta.uri = script.src
    }

    // NOTE: If the id-deriving methods above is failed, then falls back
    // to use onload event to get the uri
  }

  // Emit `define` event, used in nocache plugin, seajs node version etc
  emit("define", meta)

  meta.uri ? Module.save(meta.uri, meta) :
      // Save information for "saving" work in the script onload event
      anonymousMeta = meta
}

// Save meta data to cachedMods
Module.save = function(uri, meta) {
  var mod = Module.get(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = meta.deps || []
    mod.factory = meta.factory
    mod.status = STATUS.SAVED
  }
}

// Get an existed module or create a new one
Module.get = function(uri, deps) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
}

// Use function is equal to load a anonymous module
Module.use = function (ids, callback, uri) {
  var mod = Module.get(uri, isArray(ids) ? ids : [ids])

  mod.callback = function() {
    var exports = []
    var uris = mod.resolve()

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = cachedMods[uris[i]].exec()
    }

    if (callback) {
      callback.apply(global, exports)
    }

    delete mod.callback
  }

  mod.load()
}

// Load preload modules before all other modules
Module.preload = function(callback) {
  var preloadMods = data.preload
  var len = preloadMods.length

  if (len) {
    Module.use(preloadMods, function() {
      // Remove the loaded preload modules
      preloadMods.splice(0, len)

      // Allow preload modules to add new preload modules
      Module.preload(callback)
    }, data.cwd + "_preload_" + cid())
  }
  else {
    callback()
  }
}


// Public API

seajs.use = function(ids, callback) {
  Module.preload(function() {
    Module.use(ids, callback, data.cwd + "_use_" + cid())
  })
  return seajs
}

Module.define.cmd = {}
global.define = Module.define


// For Developers

seajs.Module = Module
data.fetchedList = fetchedList
data.cid = cid

seajs.require = function(id) {
  var mod = Module.get(Module.resolve(id))
  if (mod.status < STATUS.EXECUTING) {
    mod.onload()
    mod.exec()
  }
  return mod.exports
}


/**
 * config.js - The configuration for the loader
 */

var BASE_RE = /^(.+?\/)(\?\?)?(seajs\/)+/

// The root path to use for id2uri parsing
// If loaderUri is `http://test.com/libs/seajs/[??][seajs/1.2.3/]sea.js`, the
// baseUri should be `http://test.com/libs/`
data.base = (loaderDir.match(BASE_RE) || ["", loaderDir])[1]

// The loader directory
data.dir = loaderDir

// The current working directory
data.cwd = cwd

// The charset for requesting files
data.charset = "utf-8"

// The history of every config
data.history = {}

// The CORS options, Do't set CORS on default.
//data.crossorigin = undefined

// Modules that are needed to load before all other modules
data.preload = (function() {
  var plugins = []

  // Convert `seajs-xxx` to `seajs-xxx=1`
  // NOTE: use `seajs-xxx=1` flag in uri or cookie to preload `seajs-xxx`
  var str = location.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/(seajs-\w+)=1/g, function(m, name) {
    plugins.push(name)
  })

  return plugins
})()

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

seajs.config = function(configData) {

  for (var key in configData) {
    var curr = configData[key]
    var prev = data[key]

    // record the config
    data.history[key] = data.history[key] || []
    data.history[key].push(clone(curr))

    // Merge object config such as alias, vars
    if (prev && isObject(prev)) {
      for (var k in curr) {
        prev[k] = curr[k]
      }
    }
    else {
      // Concat array config such as map, preload
      if (isArray(prev)) {
        curr = prev.concat(curr)
      }
      // Make sure that `data.base` is an absolute path
      else if (key === "base") {
        // Make sure end with "/"
        if (curr.slice(-1) !== "/") {
          curr += "/"
        }
        curr = addBase(curr)
      }

      // Set config
      data[key] = curr
    }
  }

  emit("config", configData)
  return seajs
}

// simple clone an object
function clone(obj) {
  if (isObject(obj)) {
    var copy = {}
    for (var k in obj) {
      copy[k] = obj[k]
    }
    return copy
  }
  return obj
}
})(this);
/*
version:5.0.2 Licensed MIT
author:kooboy_li@163.com
loader:umd
enables:mxevent,richVframe,xml,async,service,state,wait,lang
optionals:router,routerHash,routerState,routerTip,routerTipLockUrl,richView,innerView,recast,require,customTags,checkAttr,webc,xview,taskComplete,spreadMxViewParams,lockSubWhenBusy,taskIdle
*/
if (typeof DEBUG == 'undefined')
    window.DEBUG = true;
(factory => {
    if (window.define) {
        define('magix5', factory);
    }
    else {
        window.Magix = factory();
    }
})(() => {
    //VARS
    let Counter = 0;
    let Empty = '';
    let Empty_Array = [];
    let Comma = ',';
    let Null = null;
    let Doc_Window = window;
    let Thousand = 1000;
    let GPromise = Promise;
    let Undefined = void Counter;
    let Doc_Document = document;
    let Timeout = Doc_Window.setTimeout; //setTimeout;
    let Encode = encodeURIComponent;
    let Value = 'value';
    let Tag_Static_Key = '_';
    let Tag_View_Params_Key = '$';
    let Tag_Prop_Id = 'id';
    let Hash_Key = '#';
    function Noop() { }
    let JSON_Stringify = JSON.stringify;
    let Header = Doc_Document.head;
    let Doc_Body;
    let Pfm = Doc_Window.performance;
    let Date_Now = Pfm.now.bind(Pfm);
    /*
        关于spliter
        出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
     */
    let Spliter = '\x1e';
    let Prototype = 'prototype';
    let Params = 'params';
    let Path = 'path';
    let MX_PREFIX = 'mx5-';
    //let Tag_Porp_MX_Key = MX_PREFIX + 'key';
    let MX_View = MX_PREFIX + 'view';
    let MX_OWNER = MX_PREFIX + 'owner';
    let GUID = (prefix) => (prefix || Tag_Static_Key) + Counter++;
    let GetById = id => Doc_Document.getElementById(id);
    let SetInnerHTML = (n, html) => n.innerHTML = html;
    let isRString = s => s[0] == Spliter;
    let Empty_Object = {};
    let Mx_Cfg = {
        rootId: GUID(),
        wait: Noop,
        error(e) {
            throw e;
        }
    };
    let IsPrimitive = args => !args || typeof args != 'object';
    let NodeIn = (a, b, r) => {
        if (a && b) {
            r = a == b;
            if (!r) {
                try {
                    r = (b.compareDocumentPosition(a) & 16) == 16;
                }
                catch (_magix) { }
            }
        }
        return r;
    };
    let Mark = (me, key, host, m, k) => {
        k = Spliter + '_';
        if (me[k] != 0) {
            host = me[k] || (me[k] = {});
            if (!Has(host, key)) {
                host[key] = 0;
            }
            m = ++host[key];
        }
        return t => (t = me[k], t && m === t[key]);
    };
    let Unmark = me => {
        me[Spliter + '_'] = 0;
    };
    let { assign: Assign, keys: Keys, hasOwnProperty: HasProp, prototype: ObjectProto } = Object;
    let ToString = ObjectProto.toString;
    let Type = o => ToString.call(o).slice(8, -1);
    let strObject = 'Object';
    let IsObject = o => Type(o) == strObject;
    let IsArray = Array.isArray;
    let strFunction = 'Function';
    let IsFunction = o => Type(o) == strFunction;
    let strString = 'String';
    let IsString = o => Type(o) == strString;
    let strNumber = 'Number';
    let IsNumber = o => Type(o) == strNumber;
    let GA = Header.getAttribute;
    let GetAttribute = (node, attr) => GA.call(node, attr);
    let ApplyStyle = (key, css, node) => {
        if (DEBUG && IsArray(key)) {
            let result = [];
            for (let i = 0; i < key.length; i += 2) {
                result.push(ApplyStyle(key[i], key[i + 1]));
            }
            return result;
        }
        if (css && !ApplyStyle[key]) {
            ApplyStyle[key] = 1;
            if (DEBUG) {
                if (key.indexOf('$throw_') === 0) {
                    throw new Error(css);
                }
                node = Doc_Document.createElement('style');
                node.id = key;
                SetInnerHTML(node, css);
                Header.appendChild(node);
            }
            else {
                node = Doc_Document.createElement('style');
                SetInnerHTML(node, css);
                Header.appendChild(node);
            }
        }
    };
    let ToTry = (fn, args, context, r) => {
        try {
            if (IsArray(args)) {
                r = fn.apply(context, args);
            }
            else {
                r = fn.call(context, args);
            }
        }
        catch (x) {
            Mx_Cfg.error(x);
        }
        return r;
    };
    let Has = (owner, prop) => owner && HasProp.call(owner, prop);
    let TranslateData = (data, params) => {
        let p, val;
        if (IsPrimitive(params)) {
            p = params + Empty;
            if (isRString(p)) {
                params = data.get(p);
            }
        }
        else {
            for (p in params) {
                val = params[p];
                val = TranslateData(data, val);
                params[p] = val;
            }
        }
        return params;
    };
    let CacheSort = (a, b) => b['_'] - a['_'];
    //let CacheCounter = 0;
    function MxCache(max, buffer /*, remove?: (item: any) => void*/, me) {
        me = this;
        me['_'] = [];
        me['a'] = buffer || 20; //buffer先取整，如果为0则再默认5
        me['b'] = me['a'] + (max || 50);
        //me['@:{cache#remove.callback}'] = remove;
    }
    Assign(MxCache[Prototype], {
        get(key) {
            let me = this;
            let c = me['_'];
            let r = c[Spliter + key];
            if (r) {
                r['_']++;
                //r['@:{cache-item#add.time}'] = CacheCounter++;
                r = r['a'];
            }
            return r;
        },
        set(okey, value) {
            let me = this;
            let c = me['_'];
            let key = Spliter + okey;
            let r = c[key];
            let t = me['a'];
            if (!r) {
                if (c.length > me['b']) {
                    c.sort(CacheSort);
                    while (t--) {
                        r = c.pop();
                        if (r['_']) { //important
                            me.del(r['b']); //如果没有引用，则删除
                        }
                    }
                }
                r = {
                    'b': okey
                };
                c.push(r);
                c[key] = r;
            }
            r['a'] = value;
            r['_'] = 1;
            //r['@:{cache-item#add.time}'] = CacheCounter++;
        },
        del(k) {
            k = Spliter + k;
            let c = this['_'];
            let r = c[k] /*,
            m = this['@:{cache#remove.callback}']*/;
            if (r) {
                r['_'] = 0;
                r['a'] = Empty;
                delete c[k]; // = Null;
                //if (m) {
                //ToTry(m, r['@:{cache-item#origin.key}']);
                //}
            }
        },
        has(k) {
            return Has(this['_'], Spliter + k);
        }
    });
    let EventDefaultOptions = {
        bubbles: true,
        cancelable: true
    };
    //https://www.w3.org/TR/dom/#interface-event
    let DispatchEvent = (element, type, data) => {
        let e = new Event(type, EventDefaultOptions);
        Assign(e, data);
        element.dispatchEvent(e);
    };
    let AttachEventHandlers = [];
    let EventListen = (element, type, fn, options) => element.addEventListener(type, fn, options);
    let EventUnlisten = (element, type, fn, options) => element.removeEventListener(type, fn, options);
    let AddEventListener = (element, type, fn, eventOptions, viewId, view) => {
        let h = {
            '_': viewId,
            'a': fn,
            'b': type,
            'c': element,
            'd'(e) {
                if (viewId) {
                    ToTry(fn, e, view);
                }
                else {
                    fn(e);
                }
            }
        };
        AttachEventHandlers.push(h);
        EventListen(element, type, h['d'], eventOptions);
    };
    let RemoveEventListener = (element, type, cb, eventOptions, viewId) => {
        for (let c, i = AttachEventHandlers.length; i--;) {
            c = AttachEventHandlers[i];
            if (c['b'] == type &&
                c['_'] == viewId &&
                c['c'] == element &&
                c['a'] === cb) {
                AttachEventHandlers.splice(i, 1);
                EventUnlisten(element, type, c['d'], eventOptions);
                break;
            }
        }
    };
    let ToObjectCache = new MxCache();
    let ToObject = (expr, cache = 1, result) => {
        if (cache &&
            ToObjectCache.has(expr)) {
            result = ToObjectCache.get(expr);
        }
        else {
            result = ToTry(Function(`return ${expr}`));
            if (cache) {
                if (DEBUG) {
                    result = Safeguard(result);
                }
                ToObjectCache.set(expr, result);
            }
        }
        return result;
    };
    let Decode = decodeURIComponent;
    let PathToObject = new MxCache();
    let ParseUri = path => {
        //把形如 /xxx/?a=b&c=d 转换成对象 {path:'/xxx/',params:{a:'b',c:'d'}}
        //1. /xxx/a.b.c.html?a=b&c=d  path /xxx/a.b.c.html
        //2. /xxx/?a=b&c=d  path /xxx/
        //5. /xxx/index.html  => path /xxx/index.html
        //11. ab?a&b          => path ab  params:{a:'',b:''}
        let r = PathToObject.get(path), pathname, key, value, po, q, rest;
        if (!r) {
            po = {};
            q = path.indexOf('?');
            if (q == -1) {
                pathname = path;
                rest = Empty;
            }
            else {
                pathname = path.substring(0, q);
                rest = path.substring(q + 1);
            }
            if (rest) {
                for (q of rest.split('&')) {
                    [key, value = Empty] = q.split('=');
                    po[Decode(key)] = isRString(value) ? value : Decode(value);
                }
            }
            PathToObject.set(path, r = {
                a: pathname,
                b: po
            });
        }
        return {
            path: r.a,
            params: Assign({}, r.b)
        };
    };
    let ToUri = (path, params, keo) => {
        let arr = [], v, p, f;
        for (p in params) {
            v = params[p] + Empty;
            if (v || Has(keo, p)) {
                v = Encode(v);
                arr.push(f = p + '=' + v);
            }
        }
        if (f) {
            path += (path && (path.includes('?') ? '&' : '?')) + arr.join('&');
        }
        return path;
    };
    let ToMap = (list, key) => {
        let e, map = {};
        if (list) {
            for (e of list) {
                map[(key && e) ? e[key] : e] = key ? e : (map[e] | 0) + 1; //对于简单数组，采用累加的方式，以方便知道有多少个相同的元素
            }
        }
        return map;
    };
    let ParseExprCache = new MxCache();
    let ParseExpr = (expr, data, result) => {
        if (ParseExprCache.has(expr)) {
            result = ParseExprCache.get(expr);
        }
        else {
            result = ToObject(expr, 0);
            if (expr.includes(Spliter)) {
                TranslateData(data, result);
                if (DEBUG) {
                    result = Safeguard(result, true);
                }
            }
            else {
                if (DEBUG) {
                    result = Safeguard(result, true);
                }
                ParseExprCache.set(expr, result);
            }
        }
        return result;
    };
    let CallBreakTime = 9, CallWorked, CallCurrent, CallCurrentExec, CallLogicTail, CallRealTail;
    let lastWaitState;
    let ns = navigator.scheduling;
    let StartCall = () => {
        let last = Date_Now(), out = last + CallBreakTime, args, fn, context, wait = Mx_Cfg.wait;
        for (;;) {
            if (CallCurrent) { //有待执行的任务
                if (DEBUG) {
                    CallFunction['_']++;
                }
                if (CallLogicTail == CallCurrent) { //如果当前节点是逻辑末尾，则删除逻辑末尾
                    CallLogicTail = Null;
                }
                CallCurrentExec = CallCurrent; //当前正在执行的任务，先保存一下，有可能在fn中再追加新的任务，需要使用该节点进行调整关系
                context = CallCurrent['_'];
                args = CallCurrent['a'];
                fn = CallCurrent['b'];
                ToTry(fn, args, context);
                CallCurrent = CallCurrent['c'];
                CallCurrentExec = Null; //clear current;
                if (CallCurrent && ((Date_Now() > out) ||
                    (ns && ns.isInputPending()))) {
                    if (lastWaitState != 1) {
                        wait(lastWaitState = 1);
                    }
                    console.log(`CF take a break at ${CallFunction['_']} of ${CallFunction['a']}`);
                    Timeout(StartCall);
                    break;
                }
            }
            else {
                CallRealTail = CallWorked = Null;
                if (DEBUG) {
                    delete CallFunction['a'];
                    delete CallFunction['_'];
                }
                if (lastWaitState != 0) {
                    wait(lastWaitState = 0);
                }
                break;
            }
        }
    };
    let CallFunction = (fn, args, context, /*id?,*/ last, current) => {
        if (DEBUG) {
            if (!CallFunction['a']) {
                CallFunction['a'] = 0;
                CallFunction['_'] = 0;
            }
            CallFunction['a']++;
        }
        // if (id &&
        //     CallCurrent) {
        //     current = CallCurrent['@:{call#next}'];
        //     while (current) {
        //         if (current['@:{call#id}'] == id) {
        //             current['@:{call#function}'] =
        //                 current['@:{call#context}'] =
        //                 current['@:{call#args}'] =
        //                 current['@:{call#id}'] = Null;
        //         }
        //         current = current['@:{call#next}'];
        //     }
        // }
        current = {
            //'@:{call#id}': id,
            'b': fn,
            '_': context,
            'a': args
        };
        if (last) { //指明放在真正的末尾
            if (CallRealTail) { //如果有，则直接追加
                CallRealTail['c'] = current;
            }
            else { //没有，则把当前待执行的头指定当前元素
                CallCurrent = current;
            }
            CallRealTail = current; //更新末尾
        }
        else { //需要放逻辑末尾
            last = CallLogicTail || CallCurrentExec; //合并统一判断
            //不存在逻辑末尾，但当前正在执行中，1种情况：执行已过逻辑末尾，此时需要把执行节点的下一个指向当前节点，以提高优先级
            if (last) { //有节点则更新
                //prev = last['@:{call#next}'];
                current['c'] = last['c'];
                last['c'] = current;
                if (CallRealTail == last) { //如果逻辑末尾或当前执行的与真实是同一个节点，则真实末尾节点需要移动
                    CallRealTail = current;
                }
            }
            else if (CallCurrent) { //即不存在逻辑末尾，也不在执行中，比如先调用lastTask，再调用普通的task，则需要把普通的任务放在最前面
                current['c'] = CallCurrent;
                CallCurrent = current;
            }
            else { //初始化的情况
                CallCurrent = CallRealTail = current;
            }
            CallLogicTail = current; //更新逻辑末尾为当前节点
        }
        if (!CallWorked) {
            CallWorked = 1;
            Timeout(StartCall);
        }
    };
    let LastCallFunction = (fn, args, context /*, id?*/) => {
        CallFunction(fn, args, context /*, id*/, 1);
    };
    let isEsModule = o => o.__esModule || (window.Symbol && o[Symbol.toStringTag] === 'Module');
    let Async_Require = (name, fn) => {
        if (name) {
            let a = [];
            //if (window.seajs) {
            seajs.use(name, (...g) => {
                for (let m of g) {
                    a.push(isEsModule(m) ? m.default : m);
                }
                CallFunction(fn, a);
            });
            /*} else {
                if (!Array.isArray(name)) {
                    name = [name];
                }
                for (let n of name) {
                    let m = require(n);
                    a.push(isEsModule(m) ? m.default : m);
                }
                CallFunction(fn, a);
            }*/
        }
        else {
            CallFunction(fn);
        }
    };
    let Extend = (ctor, base, props, cProto) => {
        //bProto.constructor = base;
        Noop[Prototype] = base[Prototype];
        cProto = new Noop();
        Assign(cProto, props);
        //Assign(ctor, statics);
        cProto.constructor = ctor;
        ctor[Prototype] = cProto;
        return ctor;
    };
    let Safeguard = data => data;
    if (DEBUG && window.Proxy) {
        let ProxiesPool = new Map();
        Safeguard = (data, allowDeep, setter, prefix = '') => {
            if (IsPrimitive(data)) {
                return data;
            }
            let key = prefix + '\x01' + setter;
            let p = data['\x01_sf_\x01'];
            if (p && p.proxy) {
                data = p.entity;
            }
            let list = ProxiesPool.get(data);
            if (list) {
                for (let e of list) {
                    if (e.key == key) {
                        return e.entity;
                    }
                }
            }
            let entity = new Proxy(data, {
                set(target, property, value) {
                    if (!setter && (!prefix || !allowDeep)) {
                        throw new Error('avoid writeback, key: "' + prefix + property + '" value: ' + value + ' more info: https://github.com/thx/magix/issues/38');
                    }
                    if (setter) {
                        setter(prefix + property, value);
                    }
                    target[property] = value;
                    return true;
                },
                get(target, property) {
                    if (property == '\x01_sf_\x01') {
                        return {
                            entity: data,
                            proxy: true
                        };
                    }
                    let out = target[property];
                    if (!allowDeep &&
                        Has(target, property) &&
                        (IsArray(out) || IsObject(out))) {
                        return Safeguard(out, allowDeep, setter, prefix + property + '.');
                    }
                    return out;
                }
            });
            if (!prefix) {
                if (!list) {
                    list = [];
                }
                list.push({
                    key,
                    entity
                });
                ProxiesPool.set(data, list);
            }
            return entity;
        };
    }
    if (DEBUG) {
        Empty_Object = Safeguard(Empty_Object);
    }
    let MxEvent = {
        fire(name, data) {
            let key = Spliter + name, me = this, list = me[key], idx = 0, len, t;
            if (!data)
                data = {};
            data.type = name;
            if (list) {
                for (len = list.length; idx < len; idx++) {
                    t = list[idx];
                    if (t['_']) {
                        t['a'] = 1;
                        ToTry(t['_'], data, me);
                        if (!t['_']) {
                            list.splice(idx--, 1);
                            len--;
                        }
                        t['a'] = Null;
                    }
                }
            }
            // if (!cancel) {
            //     list = me[`on${name}`];
            //     if (list) ToTry(list, data, me);
            // }
            // return me;
        },
        on(name, fn, priority = 0) {
            let me = this;
            let key = Spliter + name;
            let list = me[key] || (me[key] = []), added, len, i, definition = {
                '_': fn,
                'b': priority
            };
            for (i = 0, len = list.length; i < len; i++) {
                if (list[i]['b'] < priority) {
                    list.splice(i, 0, definition);
                    added = 1;
                    break;
                }
            }
            if (!added) {
                list.push(definition);
            }
            // return me;
        },
        off(name, fn) {
            let key = Spliter + name, me = this, list = me[key], t;
            if (fn) {
                if (list &&
                    (t = list.length)) {
                    for (; t--;) {
                        key = list[t];
                        if (key['_'] == fn) {
                            if (key['a']) {
                                key['_'] = Null;
                            }
                            else {
                                list.splice(t, 1);
                            }
                            break;
                        }
                    }
                }
            }
            else {
                me[key] = Null;
                //me[`on${name}`] = Null;
            }
            // return me;
        }
    };
    let Vframe_RootVframe;
    let Vframe_Vframes = {};
    let Vframe_RootId;
    let Vframe_TranslateQuery = (pId, src, params, pVf) => {
        if (src.includes(Spliter) &&
            (pVf = Vframe_Vframes[pId])) {
            TranslateData(pVf['_'], params);
        }
    };
    let Vframe_Root = (rootId, e) => {
        if (!Vframe_RootVframe) {
            Doc_Body = Doc_Document.body;
            rootId = Vframe_RootId = Mx_Cfg.rootId;
            e = GetById(rootId);
            if (!e) {
                if (DEBUG) {
                    console.warn('can not find element:"' + rootId + '",use document.body as default');
                }
                e = Doc_Body;
            }
            Vframe_RootVframe = new Vframe(e);
        }
        return Vframe_RootVframe;
    };
    let Vframe_Unroot = () => {
        if (Vframe_RootVframe) {
            Vframe_RootVframe.unmount();
            Vframe_RootVframe = Null;
        }
    };
    let Vframe_AddVframe = (id, vframe) => {
        if (!Has(Vframe_Vframes, id)) {
            Vframe_Vframes[id] = vframe;
            // Vframe.fire('add', {
            //     vframe
            // });
        }
    };
    let Vframe_RemoveVframe = (id, vframe, root) => {
        vframe = Vframe_Vframes[id];
        if (vframe) {
            delete Vframe_Vframes[id];
            root = vframe.root;
            root['_'] = 0;
            root['a'] = 0;
            // Vframe.fire('remove', {
            //     vframe
            // });
            vframe.id = vframe.root = vframe.pId = vframe['a'] = Null; //清除引用,防止被移除的view内部通过setTimeout之类的异步操作有关的界面，影响真正渲染的view
            if (DEBUG) {
                let nodes = Doc_Document.querySelectorAll('#' + id);
                if (nodes.length > 1) {
                    Mx_Cfg.error(Error(`remove vframe error. dom id:"${id}" duplicate`));
                }
            }
        }
    };
    let Vframe_RunInvokes = (vf, list, name, resolve, view, fn, args) => {
        list = vf['b']; //invokeList
        view = vf['c'];
        while (list.length) {
            [name, args, resolve] = list.shift();
            CallFunction(resolve, (fn = view[name]) && ToTry(fn, args, view));
        }
    };
    let Vframe_UnmountZone = (owner, root, onlyInnerView) => {
        let p, vf, unmount;
        for (p in owner['a']) {
            if (root) {
                vf = Vframe_Vframes[p];
                unmount = vf && NodeIn(vf.root, root) && (!onlyInnerView || vf.root != root);
            }
            else {
                unmount = 1;
            }
            if (unmount) {
                owner.unmount(p, unmount);
            }
        }
    };
    let Vframe_MountZone = (owner, zone, it, vframes) => {
        zone = zone || owner.root;
        vframes = zone.querySelectorAll(`[${MX_View}][${MX_OWNER}="${owner.id}"]`);
        /*
            body(#mx-root)
                div(mx-vframe=true,mx-view='xx')
                    div(mx-vframe=true,mx-view=yy)
            这种结构，自动构建父子关系，
            根结点渲染，获取到子列表[div(mx-view=xx)]
                子列表渲染，获取子子列表的子列表
                    加入到忽略标识里
            会导致过多的dom查询
    
            现在使用的这种，无法处理这样的情况，考虑到项目中几乎没出现过这种情况，先采用高效的写法
            上述情况一般出现在展现型页面，dom结构已经存在，只是附加上js行为
            不过就展现来讲，一般是不会出现嵌套的情况，出现的话，把里面有层级的vframe都挂到body上也未尝不可，比如brix2.0
         */
        //me['@:{vframe#hold.fire}'] = 1; //hold fire creted
        //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27
        for (it of vframes) {
            if (!it['_']) { //防止嵌套的情况下深层的view被反复实例化
                it['_'] = 1;
                owner.mount(it, GetAttribute(it, MX_View));
            }
        }
        //me['@:{vframe#hold.fire}'] = 0;
    };
    /**
      * 销毁对应的view
      */
    let Vframe_unmountView = owner => {
        let { 'c': v, 'b': list, root } = owner;
        list.length = 0;
        if (v) {
            owner['c'] = 0; //unmountView时，尽可能早的删除vframe上的$v对象，防止$v销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            if (v['_']) {
                v['_'] = 0;
                Unmark(v);
                Vframe_UnmountZone(owner);
                v.fire('destroy');
                View_DelegateEvents(v, 1);
                //v.owner = v.root = Null;
                if (root && owner['d'] /*&&!keepPreHTML*/) { //如果$v本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且$v有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即$v安装前什么样，销毁后把节点恢复到安装前的情况
                    SetInnerHTML(root, owner['e']);
                }
            }
        }
        owner['f']++; //增加signature，阻止相应的回调，见mountView
    };
    let Vframe_mountView = (owner, viewPath, viewInitParams /*,keepPreHTML*/) => {
        let { id, root } = owner;
        let po, sign, view, params, pId;
        if (!owner['d'] && root) { //alter
            owner['d'] = 1;
            owner['e'] = root.innerHTML;
        }
        Vframe_unmountView(owner);
        if (root && viewPath) {
            po = ParseUri(viewPath);
            view = po[Path];
            owner[Path] = viewPath;
            params = po[Params];
            pId = GetAttribute(root, MX_OWNER);
            Vframe_TranslateQuery(pId, viewPath, params);
            owner['g'] = view;
            Assign(params, viewInitParams);
            sign = owner['f'];
            Async_Require(view, TView => {
                if (sign == owner['f']) { //有可能在view载入后，vframe已经卸载了
                    if (TView) {
                        View_Prepare(TView);
                        view = new TView(id, root, owner, params);
                        if (DEBUG) {
                            let viewProto = TView.prototype;
                            let importantProps = {
                                id: 1,
                                owner: 1,
                                root: 1,
                                'a': 1,
                                'b': 1,
                                '_': 1,
                                'c': 1,
                                'd': 1
                            };
                            for (let p in view) {
                                if (Has(view, p) && viewProto[p]) {
                                    throw new Error(`avoid write ${p} at file ${viewPath}!`);
                                }
                            }
                            view = Safeguard(view, true, (key, value) => {
                                if (Has(viewProto, key) ||
                                    (Has(importantProps, key) &&
                                        (key != '_' || !isFinite(value)) &&
                                        ((key != 'owner' && key != 'root') || value !== Null))) {
                                    throw new Error(`avoid write ${key} at file ${viewPath}!`);
                                }
                            });
                        }
                        owner['c'] = view;
                        View_DelegateEvents(view);
                        ToTry(view.init, params, view);
                        ToTry(view['e'], [params, owner['e']], view);
                        view['f']();
                        if (!view['g'] &&
                            !view['h']) { //无模板且未触发渲染
                            View_EndUpdate(view);
                        }
                    }
                    else {
                        //if (DEBUG) {
                        Mx_Cfg.error(Error(`${id} cannot load:${view}`));
                        //}
                    }
                }
            });
        }
    };
    let Vframe_GetVfId = node => node['a'] || (node['a'] = GUID(Vframe_RootId));
    function Vframe(root, pId) {
        let me = this;
        let vfId = Vframe_GetVfId(root);
        me.id = vfId;
        me.root = root;
        me['f'] = 1; //signature
        me['a'] = {}; //childrenMap
        me.pId = pId;
        me['b'] = []; //invokeList
        me['_'] = new Map();
        Vframe_AddVframe(vfId, me);
    }
    Assign(Vframe, {
        root() {
            return Vframe_RootVframe;
        },
        all() {
            return Vframe_Vframes;
        },
        byId(id) {
            return Vframe_Vframes[id];
        },
        byNode(node) {
            return Vframe_Vframes[node['a']];
        }
    });
    //    , MxEvent
    Assign(Vframe[Prototype], {
        mount(node, viewPath, viewInitParams) {
            let me = this, vf, id = me.id, c = me['a'];
            let vfId = Vframe_GetVfId(node);
            vf = Vframe_Vframes[vfId];
            if (!vf) {
                if (!Has(c, vfId)) { //childrenMap,当前子vframe不包含这个id
                    me['h'] = 0; //childrenList 清空缓存的子列表
                }
                c[vfId] = vfId; //map
                vf = new Vframe(node, id);
            }
            Vframe_mountView(vf, viewPath, viewInitParams);
            return vf;
        },
        unmount(node, isVframeId) {
            let me = this, vf, pId;
            node = node ? me['a'][isVframeId ? node : node['a']] : me.id;
            vf = Vframe_Vframes[node];
            if (vf) {
                pId = vf.pId;
                Vframe_unmountView(vf);
                Vframe_RemoveVframe(node);
                vf = Vframe_Vframes[pId];
                if (vf && Has(vf['a'], node)) { //childrenMap
                    delete vf['a'][node]; //childrenMap
                    vf['h'] = 0;
                }
            }
        },
        children() {
            return this['h'] || (this['h'] = Keys(this['a']));
        },
        parent(level, vf) {
            vf = this;
            level = (level >>> 0) || 1;
            while (vf && level--) {
                vf = Vframe_Vframes[vf.pId];
            }
            return vf;
        },
        invoke(name, args) {
            let vf = this, view, fn, list = vf['b'];
            return new GPromise(resolve => {
                if ((view = vf['c']) &&
                    view['h']) { //view rendered
                    resolve((fn = view[name]) && ToTry(fn, args, view));
                }
                else {
                    list.push([name, args, resolve]);
                }
            });
        }
    });
    /*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+Magix.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.eventTarget)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
    4.如果同一节点上同时绑定了mx-event和选择器事件，如
        <div data-menu="true" mx-click="clickMenu()"></div>

        'clickMenu<click>'(e){
            console.log('direct',e);
        },
        '$div[data-menu="true"]<click>'(e){
            console.log('selector',e);
        }

        那么先派发选择器绑定的事件再派发mx-event绑定的事件


    5.在当前view根节点上绑定事件，目前只能使用选择器绑定，如
        '$<click>'(e){
            console.log('view root click',e);
        }
    
    range:{
        app:{
            20:{
                mouseover:1,
                mousemove:1
            }
        }
    }
    view:{
        linkage:{
            40:1
        }
    }
 */
    let Body_EvtInfoCache = new MxCache();
    let Body_EvtInfoReg = /^([\w\-]+)\x1e(\d+)?(\x1e)?([^(]+)\(([\s\S]*?)\)$/;
    let Body_RootEvents = {};
    let Body_RootEvents_Modifier = {};
    let Body_RootEvents_Passive = {};
    let Body_RootEvents_Capture = {};
    let Body_SearchSelectorEvents = {};
    let Body_Passive_Flag = 4;
    let Body_Capture_Flag = 8;
    let Body_Capture_Modifier = { capture: true };
    let Body_Passive_Modifier = { passive: false };
    let Body_Passive_Capture_Modifier = { passive: false, capture: true };
    let Body_FindVframeInfo = (current, eventType) => {
        let vf, tempId, selectorObject, eventSelector, eventInfos = [], begin = current, info = GetAttribute(current, MX_PREFIX + eventType), match, view, vfs, selectorVfId, backtrace;
        if (info) {
            match = Body_EvtInfoCache.get(info);
            if (!match) {
                match = info.match(Body_EvtInfoReg) || Empty_Array;
                match = {
                    v: match[1],
                    b: match[2] | 0,
                    t: match[3],
                    n: match[4],
                    i: match[5]
                };
                if (DEBUG) {
                    match = Safeguard(match);
                }
                Body_EvtInfoCache.set(info, match);
            }
            match = Assign({}, match);
            if (DEBUG) {
                match = Assign(match, { r: info });
            }
        }
        //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
        if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
            selectorVfId = begin['b'];
            if (selectorVfId == Null) { //先找最近的vframe
                vfs = [begin];
                while (begin != Doc_Body && (begin = begin.parentNode)) {
                    if (Vframe_Vframes[tempId = begin['a']] ||
                        (tempId = begin['b'])) {
                        selectorVfId = tempId;
                        break;
                    }
                    vfs.push(begin);
                }
                for (info of vfs) {
                    info['b'] = selectorVfId || Empty;
                }
            }
            begin = current['a'];
            if (Vframe_Vframes[begin]) {
                /*
                    如果当前节点是vframe的根节点，则把当前的vf置为该vframe
                    该处主要处理这样的边界情况
                    <mx-vrame src="./test" mx-click="parent()"/>
                    //.test.js
                    export default Magix.View.extend({
                        '$<click>'(){
                            console.log('test clicked');
                        }
                    });
     
                    当click事件发生在mx-vframe节点上时，要先派发内部通过选择器绑定在根节点上的事件，然后再派发外部的事件
                */
                backtrace = selectorVfId = begin;
            }
            // if (!selectorVfId) {
            //     selectorVfId = Mx_Cfg.rootId;
            // }
            if (selectorVfId) { //从最近的vframe向上查找带有选择器事件的view
                do {
                    vf = Vframe_Vframes[selectorVfId];
                    if (vf && (view = vf['c'])) {
                        selectorObject = view['i'];
                        eventSelector = selectorObject[eventType];
                        if (eventSelector) {
                            for (begin = eventSelector.length; begin--;) {
                                tempId = eventSelector[begin];
                                selectorObject = {
                                    r: tempId,
                                    v: selectorVfId,
                                    n: tempId
                                };
                                if (tempId) {
                                    /*
                                        事件发生时，做为临界的根节点只能触发`$`绑定的事件，其它事件不能触发
                                    */
                                    if (!backtrace &&
                                        current.matches(tempId)) {
                                        eventInfos.push(selectorObject);
                                    }
                                }
                                else if (backtrace) {
                                    eventInfos.push(selectorObject);
                                }
                            }
                        }
                        //防止跨view选中，到带模板的view时就中止或未指定
                        if (view['g'] && !backtrace) {
                            break; //带界面的中止
                        }
                        backtrace = 0;
                    }
                } while (vf && (selectorVfId = vf.pId));
            }
        }
        if (match) {
            eventInfos.push(match);
        }
        return eventInfos;
    };
    let Body_DOMEventProcessor = domEvent => {
        let { target, type } = domEvent;
        let eventInfos;
        let ignore;
        let vframe, view, eventName, fn;
        //let lastVfId;
        let params, arr = [], offset;
        while (target &&
            target != Doc_Body &&
            !domEvent.cancelBubble &&
            (!(ignore = target['c']) || !ignore[type])) {
            offset = 1;
            if (target.nodeType == offset) {
                eventInfos = Body_FindVframeInfo(target, type);
                if (eventInfos.length) {
                    arr.length = 0;
                    for (fn of eventInfos) {
                        let { v, n, i, t, b } = fn;
                        if (!v && DEBUG) {
                            return Mx_Cfg.error(Error(`bad ${type}:${fn.r}`));
                        }
                        // if (lastVfId != v) {
                        //     if (lastVfId && domEvent.cancelBubble) {
                        //         break;
                        //     }
                        //     lastVfId = v;
                        // }
                        vframe = Vframe_Vframes[v];
                        view = vframe && vframe['c'];
                        if (view) {
                            if (view['h'] &&
                                view['_']) {
                                eventName = n + Spliter + type;
                                fn = view[eventName];
                                if (fn) {
                                    domEvent.eventTarget = target;
                                    params = i ? ParseExpr(i, vframe['_']) : Empty_Object;
                                    domEvent[Params] = params;
                                    ToTry(fn, domEvent, view);
                                }
                                if (DEBUG) {
                                    if (!fn) { //检测为什么找不到处理函数
                                        console.error('can not find event processor:' + n + '<' + type + '> from view:' + vframe.path);
                                    }
                                }
                                if (target != view.root &&
                                    !view['i'][type]) {
                                    if (t) {
                                        offset = b || offset;
                                    }
                                    else {
                                        target = view.root;
                                        offset = 0;
                                    }
                                }
                            }
                        }
                        else { //如果处于删除中的事件触发，则停止事件的传播
                            if (DEBUG) {
                                if (view !== 0) { //销毁
                                    console.error('can not find vframe:' + v);
                                }
                            }
                        }
                    }
                }
                else {
                    arr.push(target);
                }
                if (offset) {
                    vframe = target['a'];
                    if (vframe) {
                        vframe = Vframe_Vframes[vframe];
                        view = vframe && vframe['c'];
                        if (view &&
                            view['j'][type]) {
                            arr.length = 0;
                        }
                    }
                }
            }
            while (offset--)
                target = target.parentNode;
        }
        for (target of arr) {
            ignore = target['c'] || (target['c'] = {});
            ignore[type] = 1;
        }
    };
    let Body_DOMEventBind = (type, searchSelector, remove, flags) => {
        let counter = Body_RootEvents[type] | 0;
        let passiveCount = Body_RootEvents_Passive[type] | 0;
        let captureCount = Body_RootEvents_Capture[type] | 0;
        let offset = (remove ? -1 : 1), fn = remove ? RemoveEventListener : AddEventListener;
        if (flags & Body_Passive_Flag) {
            passiveCount += offset;
            Body_RootEvents_Passive[type] = passiveCount;
        }
        if (flags & Body_Capture_Flag) {
            captureCount += offset;
            Body_RootEvents_Capture[type] = captureCount;
        }
        let mod, lastMod = Body_RootEvents_Modifier[type];
        if (passiveCount && captureCount) {
            mod = Body_Passive_Capture_Modifier;
        }
        else if (passiveCount) {
            mod = Body_Passive_Modifier;
        }
        else if (captureCount) {
            mod = Body_Capture_Modifier;
        }
        if (!counter || remove === counter) { // remove=1  counter=1
            fn(Doc_Body, type, Body_DOMEventProcessor, remove ? lastMod : mod);
        }
        else if (mod != lastMod) {
            RemoveEventListener(Doc_Body, type, Body_DOMEventProcessor, lastMod);
            AddEventListener(Doc_Body, type, Body_DOMEventProcessor, mod);
        }
        Body_RootEvents_Modifier[type] = mod;
        Body_RootEvents[type] = counter + offset;
        if (searchSelector) { //记录需要搜索选择器的事件
            Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
        }
    };
    if (DEBUG) {
        var Updater_CheckInput = (view, html) => {
            if (/<(?:input|textarea|select)/i.test(html)) {
                let url = ParseUri(view.owner.path);
                let found = false, hasParams = false;
                for (let p in url.params) {
                    hasParams = true;
                    if (url.params[p][0] == Spliter) {
                        found = true;
                    }
                }
                if (hasParams && !found) {
                    console.warn('[!use at to pass parameter] path:' + view.owner.path + ' at ' + (view.owner.parent().path));
                }
            }
        };
    }
    let Updater_EM = {
        '&': 38,
        '<': 60,
        '>': 62,
        '"': 34,
        '\'': 39,
        '\`': 96
    };
    let Updater_ER = /[&<>"'\`]/g;
    //let Updater_Safeguard = v => v == Null ? Empty : Empty + v;
    let Updater_EncodeReplacer = m => `&#${Updater_EM[m]};`;
    let Updater_Encode = v => (v + Empty).replace(Updater_ER, Updater_EncodeReplacer);
    let Updater_UM = {
        '!': 1,
        '\'': 7,
        '(': 8,
        ')': 9,
        '*': 'A'
    };
    let Updater_URIReplacer = m => '%2' + Updater_UM[m];
    let Updater_URIReg = /[!')(*]/g;
    let Updater_EncodeURI = v => Encode(v).replace(Updater_URIReg, Updater_URIReplacer);
    let Updater_QR = /[\\'"]/g;
    let Updater_EncodeQ = v => (v + Empty).replace(Updater_QR, '\\$&');
    let Updater_Ref = ($$, v, k) => {
        if ($$.has(v)) {
            k = $$.get(v);
        }
        else {
            if (DEBUG) {
                if (k && $$.has(k)) {
                    console.error(`map has different value for same key:${k},current value:${v},previous value:${$$.get(k)}`);
                }
            }
            k = Spliter + (k || $$['_']++);
            if (!$$.has(k)) {
                $$.set(v, k);
                $$.set(k, v);
            }
        }
        return k;
        // if (DEBUG && k === undefined) {
        //     console.error('check ref data!');
        // }
        // $$[k] = v;
        // return k;
    };
    // let Updater_Ready_List = [];
    // let Updater_Ready_Checker = ready => {
    //     let findUnready = 0,
    //         findCurrent = 0;
    //     for (let r of Updater_Ready_List) {
    //         if (r['@:{ready#callback}'] == ready) {
    //             r['@:{ready#ok}'] = 1;
    //             findCurrent = 1;
    //         }
    //         if (r['@:{ready#ok}']) {
    //             if (!findUnready &&
    //                 !r['@:{ready#invoke}']) {
    //                 r['@:{ready#invoke}'] = 1;
    //                 r['@:{ready#callback}']();
    //                 r['@:{ready#callback}'] = Empty;
    //             }
    //         } else {
    //             findUnready = 1;
    //         }
    //         if (findUnready &&
    //             findCurrent) {
    //             break;
    //         }
    //     }
    //     findCurrent = Updater_Ready_List[Updater_Ready_List.length - 1];
    //     if (findCurrent['@:{ready#callback}'] === Empty) {
    //         Updater_Ready_List.length = 0;
    //     }
    // };
    let Updater_Digest = (view, fire, tmpl) => {
        if (view['_'] &&
            (tmpl = view['g'])) {
            let keys = view['k'], viewId = view.id, vf = Vframe_Vframes[viewId], ref = {
                '_': [],
                'a': [],
                'b': 0
            }, vdom, data = view['c'], refData = vf['_'];
            view['l'] = 0;
            view['k'] = {};
            if (fire) {
                view.fire('dompatch');
            }
            refData['_'] = 0;
            refData.clear();
            vdom = tmpl(data, Q_Create, viewId, Updater_EncodeURI, refData, Updater_Ref, Updater_EncodeQ, IsArray);
            if (DEBUG) {
                Updater_CheckInput(view, vdom['_']);
            }
            let ready = () => {
                view['m'] = vdom;
                if (view['_']) {
                    tmpl = ref['c'] || !view['h'];
                    if (tmpl) {
                        View_EndUpdate(view);
                    }
                    for (vdom of ref['_']) {
                        CallFunction(vdom['f'], Empty_Array, vdom);
                        //CallFunction(View_CheckAssign, [vdom]);
                    }
                }
                if (view['n'] > 1) {
                    view['n'] = 1;
                    ref['a'].length = 0;
                    Updater_Digest(view);
                }
                else {
                    view['n'] = 0;
                    /*
                        在dom diff patch时，如果已渲染的vframe有变化，则会在vom tree上先派发created事件，同时传递inner标志，vom tree处理alter事件派发状态，未进入created事件派发状态
            
                        patch完成后，需要设置vframe hold fire created事件，因为带有assign方法的view在调用render后，vom tree处于就绪状态，此时会导致提前派发created事件，应该hold，统一在endUpdate中派发
            
                        有可能不需要endUpdate，所以hold fire要视情况而定
                    */
                    for ([vdom, viewId, refData] of ref["a"]) {
                        if (vdom[viewId] != refData) {
                            vdom[viewId] = refData;
                        }
                    }
                    view.fire('domready');
                    keys = view['o'];
                    for (vdom of keys) {
                        vdom();
                    }
                    keys.length = 0;
                }
            };
            // Updater_Ready_List.push({
            //     '@:{ready#callback}': ready
            // });
            CallFunction(V_SetChildNodes, [view.root, view['m'], vdom, ref, vf, keys, view, ready]);
            //V_SetChildNodes(view.root, view['@:{view#updater.vdom}'], vdom, ref, vf, keys, view, ready);
        }
    };
    let Q_TEXTAREA = 'textarea';
    let Q_Create = (tag, props, children, specials) => {
        //html=tag+to_array(attrs)+children.html
        let token;
        if (tag) {
            props = props || Empty_Object;
            let compareKey = Empty, unary = children == 1, mxvKeys = specials, hasSpecials = specials, prop, value, c, reused, reusedTotal = 0, 
            //outerHTML = '<' + tag,
            attrs = `<${tag}`, innerHTML = Empty, newChildren, prevNode, mxView = 0;
            if (children &&
                children != 1) {
                for (c of children) {
                    if (c['a']) {
                        value = c['a'] + (c['b'] ? '/>' : `>${c['c']}</${c['d']}>`);
                    }
                    else {
                        value = c['c'];
                        if (c['d'] == V_TEXT_NODE) {
                            if (value) {
                                value = Updater_Encode(value);
                            }
                            else {
                                continue;
                            }
                        }
                    }
                    innerHTML += value;
                    //merge text node
                    if (prevNode &&
                        c['d'] == V_TEXT_NODE &&
                        prevNode['d'] == V_TEXT_NODE) {
                        //prevNode['@:{v#node.html}'] += c['@:{v#node.html}'];
                        prevNode['c'] += c['c'];
                    }
                    else {
                        //reused node if new node key equal old node key
                        if (c['e']) {
                            if (!reused)
                                reused = {};
                            reused[c['e']] = (reused[c['e']] || 0) + 1;
                            reusedTotal++;
                        }
                        //force diff children
                        mxvKeys = mxvKeys || c['f'];
                        prevNode = c;
                        if (!newChildren)
                            newChildren = [];
                        newChildren.push(c);
                    }
                }
            }
            specials = specials || Empty_Object;
            for (prop in props) {
                value = props[prop];
                //布尔值
                if (value === false ||
                    value == Null) {
                    if (!specials[prop]) {
                        delete props[prop];
                    }
                    continue;
                }
                else if (value === true) {
                    props[prop] = value = specials[prop] ? value : Empty;
                }
                if ((prop == Hash_Key ||
                    prop == Tag_Prop_Id ||
                    prop == Tag_Static_Key) &&
                    !compareKey) {
                    compareKey = value;
                    if (prop != Tag_Prop_Id) {
                        delete props[prop];
                        continue;
                    }
                }
                if (prop == MX_View &&
                    value) {
                    mxView = 1;
                    if (!compareKey) {
                        //否则如果是组件,则使用组件的路径做为key
                        compareKey = tag + Spliter + ParseUri(value)[Path];
                    }
                }
                if (prop == Value &&
                    tag == Q_TEXTAREA) {
                    innerHTML = value;
                    //attrs += value;
                }
                else if (prop == Tag_View_Params_Key) {
                    mxvKeys = value;
                    delete props[prop];
                }
                else {
                    attrs += ` ${prop}="${value && Updater_Encode(value)}"`;
                }
            }
            //attrs += outerHTML;
            //outerHTML += unary ? '/>' : `>${innerHTML}</${tag}>`;
            token = {
                'c': innerHTML,
                'e': compareKey,
                'd': tag,
                'g': mxView,
                'f': mxvKeys,
                'h': specials,
                'i': hasSpecials,
                'a': attrs,
                'j': props,
                'k': newChildren,
                'l': reused,
                'm': reusedTotal,
                'b': unary
            };
        }
        else {
            token = {
                'd': children ? Spliter : V_TEXT_NODE,
                'c': props + Empty
            };
        }
        return token;
    };
    if (DEBUG) {
        var CheckNodes = (realNodes, vNodes) => {
            let index = 0;
            if (vNodes.length &&
                vNodes[0]['d'] != Spliter) {
                for (let e of realNodes) {
                    if (e.nodeName.toLowerCase() != vNodes[index]['d'].toLowerCase()) {
                        console.error('real not match virtual!');
                    }
                    index++;
                }
            }
        };
    }
    //let V_Active_Is_Diff = currentNode => Doc_Document.activeElement != currentNode;
    let V_TEXT_NODE = Counter;
    if (DEBUG) {
        V_TEXT_NODE = '#text';
    }
    let V_W3C = 'http://www.w3.org/';
    let V_NSMap = {
        svg: `${V_W3C}2000/svg`,
        math: `${V_W3C}1998/Math/MathML`
    };
    let V_SetAttributes = (oldNode, newVDOM, lastVDOM, ref) => {
        let key, value, changed = 0, nsMap = newVDOM['h'], nMap = newVDOM['j'], osMap, oMap, sValue;
        if (lastVDOM) {
            osMap = lastVDOM['h'];
            oMap = lastVDOM['j'];
            for (key in oMap) {
                if (!Has(nMap, key)) { //如果旧有新木有
                    changed = 1;
                    if ((sValue = osMap[key])) {
                        if (ref) {
                            ref['a'].push([oldNode, sValue, Empty]);
                        }
                        else {
                            oldNode[sValue] = Empty;
                        }
                    }
                    else {
                        oldNode.removeAttribute(key);
                    }
                }
            }
        }
        for (key in nMap) {
            value = nMap[key];
            if ((sValue = nsMap[key])) {
                if (!lastVDOM || oldNode[sValue] != value) {
                    changed = 1;
                    if (ref) {
                        ref['a'].push([oldNode, sValue, value]);
                    }
                    else {
                        oldNode[sValue] = value;
                    }
                }
            }
            else if (!lastVDOM || oMap[key] != value) {
                changed = 1;
                oldNode.setAttribute(key, value);
            }
        }
        return changed;
    };
    let V_CreateNode = (vnode, owner, ref) => {
        let tag = vnode['d'], c;
        if (tag == V_TEXT_NODE) {
            c = Doc_Document.createTextNode(vnode['c']);
        }
        else {
            c = Doc_Document.createElementNS(V_NSMap[tag] || owner.namespaceURI, tag);
            V_SetAttributes(c, vnode);
            SetInnerHTML(c, vnode['c']);
        }
        return c;
    };
    let V_GetKeyNodes = (list, nodes, start, end, realEnd) => {
        let keyedNodes = {}, i, oc, cKey; //, iKey;
        for (i = end; i >= start; i--, realEnd--) {
            oc = list[i];
            cKey = oc['e'];
            if (cKey) {
                //iKey = Spliter + cKey;
                //keyedNodes[iKey] = (keyedNodes[iKey] || 0) + 1;
                oc = keyedNodes[cKey] || (keyedNodes[cKey] = []);
                oc.push(nodes[realEnd]);
            }
        }
        return keyedNodes;
    };
    let V_IsSameVNode = (aVNode, bVNode) => {
        return (aVNode['e'] &&
            bVNode['e'] == aVNode['e']) ||
            (!aVNode['e'] &&
                !bVNode['e'] &&
                aVNode['d'] == bVNode['d']) ||
            aVNode['d'] == Spliter ||
            bVNode['d'] == Spliter;
    };
    let V_Remove_Vframe_By_Node = (node, parentVf, elementNode, vf) => {
        if (elementNode) {
            vf = Vframe_Vframes[node['a']];
            if (vf) {
                vf.unmount();
            }
            else {
                Vframe_UnmountZone(parentVf, node);
            }
        }
    };
    let V_Remove_Node_Task = (node, parent, parentVf, ref, view, ready) => {
        if (view['_']) {
            V_Remove_Vframe_By_Node(node, parentVf, node.nodeType == 1);
            if (DEBUG) {
                if (!node.parentNode) {
                    console.error('Avoid remove node on view.destroy in digesting');
                }
            }
            parent.removeChild(node);
            if (!(--ref['b'])) {
                CallFunction(ready);
            }
        }
    };
    let V_Insert_Node_Task = (realNode, oc, nodes, offset, view, ref, ready) => {
        if (view['_']) {
            if (oc['d'] == Spliter) {
                Vframe_UnmountZone(realNode);
                SetInnerHTML(realNode, oc['c']);
            }
            else {
                realNode.insertBefore(V_CreateNode(oc, realNode, ref), nodes[offset]);
            }
            if (!(--ref['b'])) {
                CallFunction(ready);
            }
        }
    };
    // let V_DecreaseUsed = (reused, resuedTotal, vnode, keyedNodes, list?) => {
    //     if (reused[vnode['@:{v#node.compare.key}']]) {
    //         reused[vnode['@:{v#node.compare.key}']]--;
    //         resuedTotal--;
    //         if (keyedNodes &&
    //             (list = keyedNodes[vnode['@:{v#node.compare.key}']]) &&
    //             list.length > 1) {
    //             keyedNodes = Null;
    //         }
    //     }
    //     return [resuedTotal, keyedNodes];
    // };
    let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, keys, view, ready) => {
        if (view['_']) {
            if (lastVDOM) { //view首次初始化，通过innerHTML快速更新
                if (lastVDOM['f'] ||
                    lastVDOM['c'] != newVDOM['c']) {
                    let i, oi, oc, oldChildren = lastVDOM['k'] || Empty_Array, newChildren = newVDOM['k'] || Empty_Array, reused = newVDOM['l'] || Empty_Object, resuedTotal = newVDOM['m'], oldReusedTotal = lastVDOM['m'], nodes = realNode.childNodes, compareKey, keyedNodes, oldRangeStart = 0, newCount = newChildren.length, oldRangeEnd = oldChildren.length - 1, newRangeStart = 0, newRangeEnd = newCount - 1;
                    if (DEBUG &&
                        lastVDOM['d'] != Q_TEXTAREA) {
                        CheckNodes(nodes, oldChildren);
                    }
                    // let newCount = newChildren.length - 1;
                    // let oldCount = oldChildren.length - 1,
                    //     nc,
                    //     realNodeStep;
                    // keyedNodes = {};
                    // while (oldCount &&
                    //     newCount) {
                    //     oc = oldChildren[oldRangeStart];
                    //     nc = newChildren[newRangeStart];
                    //     if (oc['@:{v#node.outer.html}'] ==
                    //         nc['@:{v#node.outer.html}']) {
                    //         if (oc['@:{v#node.has.mxv}']) {
                    //             V_SetNode(nodes[oldRangeStart], realNode, oc, nc, ref, vframe, keys);
                    //         }
                    //         if (reused[oc['@:{v#node.compare.key}']]) {
                    //             reused[oc['@:{v#node.compare.key}']]--;
                    //             resuedTotal--;
                    //         }
                    //         ++oldRangeStart;
                    //         ++newRangeStart;
                    //         --oldCount;
                    //         --newCount;
                    //     } else {
                    //         break;
                    //     }
                    // }
                    // while (oldCount > 1 &&
                    //     newCount > 1) {
                    //     oc = oldChildren[oldRangeEnd];
                    //     nc = newChildren[newRangeEnd];
                    //     if (oc && nc &&
                    //         oc['@:{v#node.outer.html}'] ==
                    //         nc['@:{v#node.outer.html}']) {
                    //         if (oc['@:{v#node.has.mxv}']) {
                    //             V_SetNode(nodes[oldRangeEnd], realNode, oc, nc, ref, vframe, keys);
                    //         }
                    //         if (reused[oc['@:{v#node.compare.key}']]) {
                    //             reused[oc['@:{v#node.compare.key}']]--;
                    //             resuedTotal--;
                    //         }
                    //         --oldRangeEnd;
                    //         --newRangeEnd;
                    //         --oldCount;
                    //         --newCount;
                    //     } else {
                    //         break;
                    //     }
                    // }
                    // if (resuedTotal > 0 &&
                    //     oldReusedTotal > 0) {
                    //     for (i = oldRangeEnd; i >= oldRangeStart; i--) {
                    //         oc = oldChildren[i];
                    //         compareKey = oc['@:{v#node.compare.key}'];
                    //         if (compareKey) {
                    //             compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
                    //             compareKey.push(nodes[i]);
                    //         }
                    //     }
                    // }
                    // for (i = newRangeStart; i <= newRangeEnd; i++) {
                    //     nc = newChildren[i];
                    //     oc = oldRangeStart <= oldRangeEnd && oldChildren[oldRangeStart++];
                    //     compareKey = keyedNodes[nc['@:{v#node.compare.key}']];
                    //     if (compareKey && (compareKey = compareKey.pop())) {
                    //         if (compareKey != nodes[i]) {
                    //             for (oi = oldRangeStart, realNodeStep = 1;
                    //                 oi <= oldRangeEnd;
                    //                 oi++, realNodeStep++) {
                    //                 oc = oldChildren[oi];
                    //                 if (oc && nodes[i + realNodeStep] == compareKey) {
                    //                     oldChildren.splice(oi, 1);
                    //                     oldRangeStart--;
                    //                     break;
                    //                 }
                    //             }
                    //             realNode.insertBefore(compareKey, nodes[i]);
                    //         }
                    //         if (reused[oc['@:{v#node.compare.key}']]) {
                    //             reused[oc['@:{v#node.compare.key}']]--;
                    //         }
                    //         
                    //         ref['@:{updater-ref#async.count}']++;
                    //         CallFunction(V_SetNode, [compareKey, realNode, oc, nc, ref, vframe, keys, view, ready]);
                    //         
                    //     } else if (oc) {//有旧节点，则更新
                    //         if (keyedNodes[oc['@:{v#node.compare.key}']] &&
                    //             reused[oc['@:{v#node.compare.key}']]) {
                    //             oldCount++;
                    //             ref['@:{updater-ref#changed}'] = 1;
                    //             realNode.insertBefore(V_CreateNode(nc, realNode), nodes[i]);
                    //             oldRangeStart--;
                    //         } else {
                    //             ref['@:{updater-ref#async.count}']++;
                    //             CallFunction(V_SetNode, [nodes[i], realNode, oc, nc, ref, vframe, keys, view, ready]);
                    //             
                    //         }
                    //     } else {//添加新的节点
                    //         if (nc['@:{v#node.tag}'] == Spliter) {
                    //             SetInnerHTML(realNode, nc['@:{v#node.outer.html}']);
                    //         } else {
                    //             realNode.insertBefore(V_CreateNode(nc, realNode), nodes[i]);
                    //         }
                    //         ref['@:{updater-ref#changed}'] = 1;
                    //     }
                    // }
                    // for (i = newCount; i < oldCount; i++) {
                    //     oi = nodes[newRangeEnd + 1];//删除多余的旧节点
                    //     if (oi.nodeType == 1) {
                    //         vframe.unmountZone(oi);
                    //     }
                    //     if (DEBUG) {
                    //         if (!oi.parentNode) {
                    //             console.error('Avoid remove node on view.destroy in digesting');
                    //         }
                    //     }
                    //     realNode.removeChild(oi);
                    // }
                    //-------new alg-------
                    let oldStartNode = oldChildren[oldRangeStart], oldEndNode = oldChildren[oldRangeEnd], newStartNode = newChildren[newRangeStart], newEndNode = newChildren[newRangeEnd], realNodeRangeStart = oldRangeStart, realNodeRangeEnd = oldRangeEnd, currentNode;
                    while (oldRangeStart <= oldRangeEnd &&
                        newRangeStart <= newRangeEnd) {
                        if (!oldStartNode) {
                            oldStartNode = oldChildren[++oldRangeStart];
                        }
                        else if (!oldEndNode) {
                            oldEndNode = oldChildren[--oldRangeEnd];
                        }
                        else if (V_IsSameVNode(newStartNode, oldStartNode)) {
                            if (newStartNode['d'] == Spliter ||
                                oldStartNode['d'] == Spliter) {
                                ref['c'] = 1;
                                Vframe_UnmountZone(realNode);
                                if (newStartNode['d'] == Spliter) {
                                    realNodeRangeEnd = 0;
                                    SetInnerHTML(realNode, newStartNode['c']);
                                }
                                else {
                                    SetInnerHTML(realNode, Empty);
                                    realNode.appendChild(V_CreateNode(newStartNode, realNode, ref));
                                }
                            }
                            else {
                                ref['b']++;
                                CallFunction(V_SetNode, [nodes[realNodeRangeStart], realNode, oldStartNode, newStartNode, ref, vframe, keys, view, ready]);
                            }
                            //更新需要保留的节点，加速对节点索引
                            //如果当前节点已经在索引中，则要按顺序移除
                            //[resuedTotal, keyedNodes] = V_DecreaseUsed(reused, resuedTotal, oldStartNode, keyedNodes);
                            if (reused[oldStartNode['e']]) {
                                reused[oldStartNode['e']]--;
                                resuedTotal--;
                                compareKey = keyedNodes &&
                                    keyedNodes[oldStartNode['e']];
                                if (compareKey) {
                                    --keyedNodes[oldStartNode['e']];
                                }
                            }
                            realNodeRangeStart++;
                            oldStartNode = oldChildren[++oldRangeStart];
                            newStartNode = newChildren[++newRangeStart];
                        }
                        else if (V_IsSameVNode(newEndNode, oldEndNode)) {
                            ref['b']++;
                            CallFunction(V_SetNode, [nodes[realNodeRangeEnd], realNode, oldEndNode, newEndNode, ref, vframe, keys, view, ready]);
                            //[resuedTotal, keyedNodes] = V_DecreaseUsed(reused, resuedTotal, oldEndNode, keyedNodes);
                            if (reused[oldEndNode['e']]) {
                                reused[oldEndNode['e']]--;
                                resuedTotal--;
                            }
                            realNodeRangeEnd--;
                            oldEndNode = oldChildren[--oldRangeEnd];
                            newEndNode = newChildren[--newRangeEnd];
                        }
                        else if (V_IsSameVNode(newEndNode, oldStartNode)) {
                            oi = nodes[realNodeRangeStart];
                            realNode.insertBefore(oi, nodes[realNodeRangeEnd + 1]);
                            ref['b']++;
                            CallFunction(V_SetNode, [oi, realNode, oldStartNode, newEndNode, ref, vframe, keys, view, ready]);
                            //[resuedTotal, keyedNodes] = V_DecreaseUsed(reused, resuedTotal, oldStartNode, keyedNodes);
                            if (reused[oldStartNode['e']]) {
                                reused[oldStartNode['e']]--;
                                resuedTotal--;
                            }
                            realNodeRangeEnd--;
                            oldStartNode = oldChildren[++oldRangeStart];
                            newEndNode = newChildren[--newRangeEnd];
                        }
                        else if (V_IsSameVNode(newStartNode, oldEndNode)) {
                            oi = nodes[realNodeRangeEnd];
                            realNode.insertBefore(oi, nodes[realNodeRangeStart++]);
                            ref['b']++;
                            CallFunction(V_SetNode, [oi, realNode, oldEndNode, newStartNode, ref, vframe, keys, view, ready]);
                            if (reused[oldEndNode['e']]) {
                                reused[oldEndNode['e']]--;
                                resuedTotal--;
                            }
                            //[resuedTotal, keyedNodes] = V_DecreaseUsed(reused, resuedTotal, oldEndNode, keyedNodes);
                            oldEndNode = oldChildren[--oldRangeEnd];
                            newStartNode = newChildren[++newRangeStart];
                        }
                        else {
                            if (!keyedNodes &&
                                resuedTotal > 0 &&
                                oldReusedTotal > 0) {
                                keyedNodes = V_GetKeyNodes(oldChildren, nodes, oldRangeStart, oldRangeEnd, realNodeRangeEnd);
                            }
                            currentNode = nodes[realNodeRangeStart];
                            compareKey = keyedNodes &&
                                keyedNodes[newStartNode['e']];
                            /**
                             * <div>{{=f}}</div>   =>  <div>aa</div>
                             * <div>aa</div>
                             * <div>bb</div>
                             */
                            if (compareKey &&
                                (compareKey = compareKey.pop() /*[--keyedNodes[Spliter + newStartNode['@:{v#node.compare.key}']]]*/)) {
                                oc = oldStartNode;
                                if (compareKey != currentNode) {
                                    /**
                                     * <div>{{=x}}</div>    =>    <div>aa</div>
                                     * <div>aa</div>              <div>bb</div>
                                     * <div>bb</div>
                                     * <div>{{=y}}</div>
                                     */
                                    for (oi = oldRangeStart + 1,
                                        i = realNodeRangeStart + 1; oi <= oldRangeEnd; oi++) {
                                        oc = oldChildren[oi];
                                        if (oc &&
                                            nodes[i++] == compareKey) {
                                            oldChildren[oi] = Null;
                                            break;
                                        }
                                    }
                                    oldRangeStart--;
                                    realNode.insertBefore(compareKey, currentNode);
                                }
                                if (reused[oc['e']]) {
                                    reused[oc['e']]--;
                                }
                                ref['b']++;
                                CallFunction(V_SetNode, [compareKey, realNode, oc, newStartNode, ref, vframe, keys, view, ready]);
                            }
                            else {
                                /**
                                 * <div>aa</div>    =>    <div>{{=f}}</div>
                                 *                        <div>aa</div>
                                 *                        <div>bb</div>
                                 */
                                if ((keyedNodes &&
                                    keyedNodes[oldStartNode['e']] &&
                                    reused[oldStartNode['e']]) ||
                                    (Vframe_Vframes[currentNode['a']] &&
                                        !newStartNode['g'])) {
                                    ref['c'] = 1;
                                    realNode.insertBefore(V_CreateNode(newStartNode, realNode, ref), currentNode);
                                    oldRangeStart--;
                                    realNodeRangeEnd++;
                                }
                                else {
                                    ref['b']++;
                                    CallFunction(V_SetNode, [currentNode, realNode, oldStartNode, newStartNode, ref, vframe, keys, view, ready]);
                                }
                            }
                            ++realNodeRangeStart;
                            oldStartNode = oldChildren[++oldRangeStart];
                            newStartNode = newChildren[++newRangeStart];
                        }
                    }
                    for (i = newRangeStart, oi = 1; i <= newRangeEnd; i++, oi++) {
                        oc = newChildren[i];
                        ref['c'] = 1;
                        ref['b']++;
                        CallFunction(V_Insert_Node_Task, [realNode, oc, nodes, realNodeRangeEnd + oi, view, ref, ready]);
                        // if (oc['@:{v#node.tag}'] == Spliter) {
                        //     Vframe_UnmountZone(realNode);
                        //     SetInnerHTML(realNode, oc['@:{v#node.html}']);
                        // } else {
                        //     realNode.insertBefore(V_CreateNode(oc, realNode), nodes[realNodeRangeEnd + oi]);
                        // }
                    }
                    if (!newCount &&
                        oldStartNode &&
                        oldStartNode['d'] == Spliter) {
                        realNodeRangeEnd = nodes.length - 1;
                    }
                    for (i = realNodeRangeEnd; i >= realNodeRangeStart; i--) { //删除多余的旧节点
                        ref['c'] = 1;
                        ref['b']++;
                        CallFunction(V_Remove_Node_Task, [nodes[i], realNode, vframe, ref, view, ready]);
                    }
                }
            }
            else {
                ref['c'] = 1;
                SetInnerHTML(realNode, newVDOM['c']);
                if (DEBUG) {
                    if (vframe.root.nodeType == 1 && !vframe.root.parentNode) {
                        throw new Error(`unsupport mount "${vframe.path}". the root element is removed by other views`);
                    }
                    let pId = vframe.pId;
                    let vf = Vframe_Vframes[pId];
                    if (vf) {
                        let cs = vf.children();
                        for (let c of cs) {
                            if (c != vframe.id) {
                                let nv = Vframe_Vframes[c];
                                if (nv &&
                                    nv['c'] &&
                                    nv['c']['g'] &&
                                    NodeIn(vframe.root, nv.root)) {
                                    throw new Error(`unsupport nest "${vframe.path}" within "${nv.path}"`);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (!ref['b']) {
            CallFunction(ready);
        }
    };
    let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, keys, rootView, ready) => {
        if (rootView['_']) {
            if (DEBUG) {
                if (lastVDOM['d'] != Spliter &&
                    newVDOM['d'] != Spliter) {
                    if (oldParent.nodeName == 'TEMPLATE') {
                        console.error('unsupport template tag');
                    }
                    if ((realNode.nodeName == '#text' &&
                        lastVDOM['d'] != '#text') ||
                        (realNode.nodeName != '#text' &&
                            realNode.nodeName.toLowerCase() != lastVDOM['d'].toLowerCase())) {
                        console.error('Your code is not match the DOM tree generated by the browser. near:' + lastVDOM['c'] + '. Is that you lost some tags or modified the DOM tree?');
                    }
                }
            }
            let lastAMap = lastVDOM['j'], newAMap = newVDOM['j'];
            if (lastVDOM['f'] ||
                lastVDOM['a'] != newVDOM['a'] ||
                lastVDOM['c'] != newVDOM['c']) {
                if (lastVDOM['d'] == newVDOM['d']) {
                    if (lastVDOM['d'] == V_TEXT_NODE) {
                        ref['c'] = 1;
                        realNode.nodeValue = newVDOM['c'];
                    }
                    else if (!lastAMap[Tag_Static_Key] ||
                        lastAMap[Tag_Static_Key] != newAMap[Tag_Static_Key]) {
                        let newMxView = newAMap[MX_View], newHTML = newVDOM['c'], updateAttribute = lastVDOM['a'] != newVDOM['a'] || newVDOM['i'], updateChildren, unmountOld, oldVf = Vframe_Vframes[realNode['a']], assign, view, uri = newMxView && ParseUri(newMxView), params, htmlChanged, paramsChanged;
                        /*
                            如果存在新旧view，则考虑路径一致，避免渲染的问题
                         */
                        /*
                            只检测是否有参数控制view而不检测数据是否变化的原因：
                            例：view内有一input接收传递的参数，且该input也能被用户输入
                            var d1='xl';
                            var d2='xl';
                            当传递第一份数据时，input显示值xl，这时候用户修改了input的值且使用第二份数据重新渲染这个view，问input该如何显示？
                        */
                        if (updateAttribute) {
                            updateAttribute = V_SetAttributes(realNode, newVDOM, lastVDOM, ref);
                            if (updateAttribute) {
                                ref['c'] = 1;
                            }
                        }
                        //旧节点有view,新节点有view,且是同类型的view
                        if (newMxView && oldVf &&
                            oldVf['g'] == uri[Path] &&
                            (view = oldVf['c'])) {
                            htmlChanged = newHTML != lastVDOM['c'];
                            paramsChanged = newMxView != oldVf[Path];
                            assign = newVDOM['f'];
                            if (!htmlChanged && !paramsChanged && assign) {
                                params = assign.split(Comma);
                                for (assign of params) {
                                    if (assign == Hash_Key || Has(keys, assign)) {
                                        paramsChanged = 1;
                                        break;
                                    }
                                }
                            }
                            if (paramsChanged ||
                                htmlChanged) {
                                assign = view['e'];
                                //如果有assign方法,且有参数或html变化
                                //if (assign) {
                                params = uri[Params];
                                //处理引用赋值
                                Vframe_TranslateQuery(newAMap[MX_OWNER], newMxView, params);
                                oldVf[Path] = newMxView; //update ref
                                oldVf['e'] = newHTML;
                                //如果需要更新，则进行更新的操作
                                // uri = {
                                //     //node: newVDOM,//['@:{v#node.children}'],
                                //     //html: newHTML,
                                //     //mxv: hasMXV,
                                //     node: realNode,
                                //     attr: updateAttribute,
                                //     deep: !view.tmpl,
                                //     inner: htmlChanged,
                                //     query: paramsChanged
                                // };
                                //updateAttribute = 1;
                                if (DEBUG) {
                                    let result = ToTry(assign, [params, newHTML], /*[params, uri],*/ view);
                                    if (result !== false) {
                                        if (assign == View.prototype.assign) {
                                            console.error(`override ${uri[Path]} "assign" method and make sure returned true or false value`);
                                        }
                                        ref['_'].push(view);
                                    }
                                }
                                else if (ToTry(assign, [params, newHTML], /*[params, uri],*/ view) !== false) {
                                    ref['_'].push(view);
                                }
                                //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                                //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                                updateChildren = !view['g']; //uri.deep;
                                // } else {
                                //     unmountOld = 1;
                                //     updateChildren = 1;
                                //     if (DEBUG) {
                                //         if (updateAttribute) {
                                //             console.warn(`There is no "assign" method in ${uri[Path]},so magix remount it when attrs changed`);
                                //         }
                                //     }
                                // }
                            } // else {
                            // updateAttribute = 1;
                            //}
                        }
                        else {
                            updateChildren = 1;
                            unmountOld = oldVf;
                        }
                        if (unmountOld) {
                            ref['c'] = 1;
                            oldVf.unmount();
                        }
                        // Update all children (and subchildren).
                        //自闭合标签不再检测子节点
                        if (updateChildren &&
                            !newVDOM['b']) {
                            V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, keys, rootView, ready);
                        }
                    }
                }
                else {
                    ref['c'] = 1;
                    V_Remove_Vframe_By_Node(realNode, vframe, 1);
                    oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
                }
            }
        }
        if (!(--ref['b'])) {
            CallFunction(ready);
        }
    };
    let State_Data = {};
    let State = Assign({
        get(key) {
            return key ? State_Data[key] : State_Data;
        },
        /**
         * 设置数据
         * @param {Object} data 数据对象
         */
        set(data) {
            Assign(State_Data, data);
        }
    }, MxEvent);
    //like 'login<click>' or '$<click>' or '$win<scroll>' or '$win<scroll>&{capture:true}'
    let View_EvtMethodReg = /^(\$?)([^<]*)<([^>]+)>(?:\s*&(.+))?$/;
    let processMixinsSameEvent = (exist, additional, temp) => {
        if (exist['_']) {
            temp = exist;
        }
        else {
            temp = function (e, f) {
                for (f of temp['_']) {
                    ToTry(f, e, this);
                }
            };
            temp['_'] = [exist];
            temp['a'] = 1;
        }
        temp['_'] = temp['_'].concat(additional['_'] || additional);
        return temp;
    };
    let View_EndUpdate = view => {
        let o, f;
        if (view['_']) {
            f = view['h'];
            view['h'] = 1;
            o = view.owner;
            Vframe_MountZone(o);
            if (!f) {
                CallFunction(Vframe_RunInvokes, o);
            }
        }
    };
    let View_DelegateEvents = (me, destroy) => {
        let e, { 'j': eventsObject, 'i': selectorObject, 'p': eventsList, id } = me; //eventsObject
        for (e in eventsObject) {
            Body_DOMEventBind(e, selectorObject[e], destroy, eventsObject[e]);
        }
        eventsObject = destroy ? RemoveEventListener : AddEventListener;
        for (e of eventsList) {
            eventsObject(e['_'], e['a'], e['b'], e['c'], id, me);
        }
    };
    let View_Globals = {
        win: Doc_Window,
        doc: Doc_Document,
        root: Empty
    };
    function staticExtend(...args) {
        return Assign(this, ...args), this;
    }
    let View_MergeMixins = (mixins, proto, ctors) => {
        let temp = {}, p, node, fn, exist;
        for (node of mixins) {
            for (p in node) {
                fn = node[p];
                exist = temp[p];
                if (p == 'ctor') {
                    ctors.push(fn);
                    continue;
                }
                else if (View_EvtMethodReg.test(p)) {
                    if (exist) {
                        fn = processMixinsSameEvent(exist, fn);
                    }
                    else {
                        fn['a'] = 1;
                    }
                }
                else if (DEBUG &&
                    exist &&
                    fn != exist) { //只在开发中提示
                    Mx_Cfg.error(Error('plugins duplicate property:' + p));
                }
                temp[p] = fn;
            }
        }
        for (p in temp) {
            if (!Has(proto, p)) {
                proto[p] = temp[p];
            }
            else if (DEBUG) {
                console.error('already exist ' + p + ',avoid override it!');
            }
        }
    };
    function merge(...args) {
        let me = this, _ = me['_'] || (me['_'] = []);
        View_MergeMixins(args, me[Prototype], _);
        return me;
    }
    let safeRender = render => function (...args) { return this['_'] && ToTry(render, args, this); };
    let execCtors = (list, params, me, cx) => {
        if (list) {
            for (cx of list) {
                ToTry(cx, params, me);
            }
        }
    };
    function extend(props) {
        let me = this;
        props = props || {};
        let ctor = props.ctor;
        function NView(viewId, rootNode, ownerVf, initParams, z) {
            me.call(z = this, viewId, rootNode, ownerVf, initParams);
            if (ctor)
                ToTry(ctor, initParams, z);
            execCtors(NView['_'], initParams, z);
        }
        NView.merge = merge;
        NView.extend = extend;
        NView.static = staticExtend;
        return Extend(NView, me, props);
    }
    let View_Prepare = oView => {
        if (!oView[Spliter]) { //只处理一次
            oView[Spliter] = 1;
            let prop = oView[Prototype], currentFn, matches, selectorOrCallback, events, eventsObject = {}, eventsList = [], selectorObject = {}, node, isSelector, p, item, mask, mod, modifiers;
            for (p in prop) {
                currentFn = prop[p];
                matches = p.match(View_EvtMethodReg);
                if (matches) {
                    [, isSelector, selectorOrCallback, events, modifiers] = matches;
                    mod = modifiers ? ToObject(modifiers) : Empty_Object;
                    events = events.split(Comma);
                    for (item of events) {
                        node = View_Globals[selectorOrCallback];
                        mask = 1;
                        if (mod.passive === false) {
                            mask |= Body_Passive_Flag;
                        }
                        if (mod.capture) {
                            mask |= Body_Capture_Flag;
                        }
                        if (isSelector) {
                            if (node) {
                                eventsList.push({
                                    'b': currentFn,
                                    '_': node,
                                    'a': item,
                                    'c': mod
                                });
                                continue;
                            }
                            if (node === Empty) {
                                selectorOrCallback = Empty;
                            }
                            mask |= 2;
                            node = selectorObject[item];
                            if (!node) {
                                node = selectorObject[item] = [];
                            }
                            if (!node[selectorOrCallback]) {
                                node[selectorOrCallback] = 1;
                                node.push(selectorOrCallback);
                            }
                        }
                        eventsObject[item] |= mask;
                        item = selectorOrCallback + Spliter + item;
                        node = prop[item];
                        //for in 就近遍历，如果有则忽略
                        if (!node) { //未设置过
                            prop[item] = currentFn;
                        }
                        else if (node['a']) { //现有的方法是mixins上的
                            if (currentFn['a']) { //2者都是mixins上的事件，则合并
                                prop[item] = processMixinsSameEvent(currentFn, node);
                            }
                            else if (Has(prop, p)) { //currentFn方法不是mixin上的，也不是继承来的，在当前view上，优先级最高
                                prop[item] = currentFn;
                            }
                        }
                    }
                }
            }
            prop['f'] = prop.render = safeRender(prop.render);
            prop['j'] = eventsObject;
            prop['p'] = eventsList;
            prop['i'] = selectorObject;
            prop['e'] = prop.assign;
            prop['g'] = prop.tmpl;
        }
    };
    function View(id, root, owner, params, me) {
        me = this;
        me.root = root;
        me.owner = owner;
        me.id = id;
        //me[Spliter] = id;
        me['_'] = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
        me['l'] = 1;
        me['c'] = {};
        me['k'] = {};
        //me['@:{view#assign.sign}'] = 0;
        me['n'] = 0;
        me['o'] = [];
        execCtors(View['_'], params, me);
    }
    Assign(View, {
        merge,
        extend
    });
    Assign(View[Prototype], MxEvent, {
        init: Noop,
        render: Noop,
        assign: Noop,
        get(key, result) {
            result = this['c'];
            if (key) {
                result = result[key];
            }
            return result;
        },
        set(newData, force) {
            let me = this, oldData = me['c'], keys = me['k'];
            let changed = me['l'], now, old, p;
            for (p in newData) {
                now = newData[p];
                old = oldData[p];
                if (!IsPrimitive(now) ||
                    old != now ||
                    force) {
                    keys[p] = 1;
                    changed = 1;
                }
                oldData[p] = now;
            }
            me['l'] = changed;
            return me;
        },
        digest(data, force) {
            data = this.set(data, force);
            /*
                view:
                <div>
                    <mx-dropdown mx-focusout="rerender()"/>
                <div>
    
                view.digest=>dropdown.focusout=>view.redigest=>view.redigest.end=>view.digest.end
    
                view.digest中嵌套了view.redigest，view.redigest可能操作了view.digest中引用的dom,这样会导致view.redigest.end后续的view.digest中出错
    
                expect
                view.digest=>dropdown.focusout=>view.digest.end=>view.redigest=>view.redigest.end
    
                如果在digest的过程中，多次调用自身的digest，则后续的进行排队。前面的执行完成后，排队中的一次执行完毕
            */
            return new GPromise(resolve => {
                if (data['l']) {
                    data['n']++;
                    data['o'].push(resolve);
                    if (data['n'] == 1) {
                        Updater_Digest(data, 1);
                    }
                }
                else if (data['n']) {
                    data['o'].push(resolve);
                }
                else {
                    resolve();
                }
            });
        },
        finale() {
            let me = this;
            return new GPromise(resolve => {
                if (me['n']) {
                    me['o'].push(resolve);
                }
                else {
                    resolve();
                }
            });
        },
        parse(origin) {
            return ParseExpr(origin, this.owner['_']);
        }
    });
    /*
        一个请求send后，应该取消吗？
        参见xmlhttprequest的实现
            https://chromium.googlesource.com/chromium/blink/+/master/Source/core
            https://chromium.googlesource.com/chromium/blink/+/master/Source/core/xmlhttprequest/XMLHttpService.cpp
        当请求发出，服务器接受到之前取消才有用，否则连接已经建立，数据开始传递，中止只会浪费。
        但我们很难在合适的时间点abort，而且像jsonp的，我们根本无法abort掉，只能任数据返回
    
        然后我们在自已的代码中再去判断、决定回调是否调用
    
        那我们是否可以这样做：
            1. 不取消请求
            2. 请求返回后尽可能的处理保留数据，比如缓存。处理完成后才去决定是否调用回调（Service_Send中的Done实现）
    
        除此之外，我们还要考虑
            1. 跨请求对象对同一个缓存的接口进行请求，而某一个销毁了。
                Service.add([{
                    name:'Test',
                    url:'/test',
                    cache:20000
                }]);
    
                let r1=new Service();
                r1.all('Test',function(e,m){
    
                });
    
                let r2=new Service();
                r2.all('Test',function(e,m){
    
                });
    
                r1.destroy();
    
                如上代码，我们在实现时：
                r2在请求Test时，此时Test是可缓存的，并且Test已经处于r1请求中了，我们不应该再次发起新的请求，只需要把回调排队到r1的Test请求中即可。参见代码：Service_Send中的for,Service.cached。
    
                当r1进行销毁时，并不能贸然销毁r1上的所有请求，如Test请求不能销毁，只能从回调中标识r1的回调不能再被调用。r1的Test还要继续，参考上面讨论的请求应该取消吗。就算能取消，也需要查看Test的请求中，除了r1外是否还有别的请求要用，我们示例中是r2，所以仍然继续请求。参考Service#.destroy
    
    
     */
    function Bag() {
        this.id = GUID('b');
        this['_'] = {};
    }
    Assign(Bag[Prototype], {
        get(key, dValue) {
            let me = this;
            //let alen = arguments.length;
            /*
                目前只处理了key中不包含.的情况，如果key中包含.则下面的简单的通过split('.')的方案就不行了，需要改为：
    
                let reg=/[^\[\]]+(?=\])|[^.\[\]]+/g;
                let a=['a.b.c','a[b.c].d','a[0][2].e','a[b.c.d][eg].a.b.c','[e.g.d]','a.b[c.d.fff]'];
    
                for(let i=0,one;i<a.length;i++){
                  one=a[i];
                  console.log(one.match(reg))
                }
    
                但考虑到key中有.的情况非常少，则优先使用性能较高的方案
    
                或者key本身就是数组
             */
            let attrs = me['_'];
            if (key) {
                let tks = IsArray(key) ? key.slice() : (key + Empty).split('.'), tk;
                while ((tk = tks.shift()) && attrs) {
                    attrs = attrs[tk];
                }
                if (tk) {
                    attrs = Undefined;
                }
            }
            let type;
            if (dValue !== Undefined && (type = Type(dValue)) != Type(attrs)) {
                if (DEBUG) {
                    console.warn('type neq:' + key + ' is not a(n) ' + type);
                }
                attrs = dValue;
            }
            if (DEBUG && me['a'] && me['a']['_']) { //缓存中的接口不让修改数据
                attrs = Safeguard(attrs);
            }
            return attrs;
        },
        set(data) {
            Assign(this['_'], data);
        }
    });
    let Service_FetchFlags_ONE = 1;
    let Service_FetchFlags_ALL = 2;
    let Service_Cache_Done = (bagCacheKeys, cacheKey, fns) => error => {
        fns = bagCacheKeys[cacheKey];
        if (fns) {
            delete bagCacheKeys[cacheKey]; //先删除掉信息
            for (let fn of fns) {
                ToTry(fn, error, fns['_']); //执行所有的回调
            }
        }
    };
    // function Service_CacheDone(cacheKey, err, fns) {
    //     fns = this[cacheKey]; //取出当前的缓存信息
    //     if (fns) {
    //         delete this[cacheKey]; //先删除掉信息
    //         ToTry(fns, err, fns['@:{service-cache-list#entity}']); //执行所有的回调
    //     }
    // }
    let Service_Task = (done, host, service, total, flag, bagCache) => {
        let doneArr = [];
        let errorArgs = Null;
        let currentDoneCount = 0;
        return (bag, idx, error) => {
            currentDoneCount++; //当前完成加1.
            let newBag;
            let mm = bag['a'];
            let cacheKey = mm['_'], temp;
            doneArr[idx + 1] = bag; //完成的bag
            if (error) { //出错
                errorArgs = error;
                //errorArgs[idx] = err; //记录相应下标的错误信息
                //Assign(errorArgs, err);
                newBag = 1; //标记当前是一个新完成的bag,尽管出错了
            }
            else if (!bagCache.has(cacheKey)) { //如果缓存对象中不存在，则处理。注意在开始请求时，缓存与非缓存的都会调用当前函数，所以需要在该函数内部做判断处理
                if (cacheKey) { //需要缓存
                    bagCache.set(cacheKey, bag); //缓存
                }
                //bag.set(data);
                mm['a'] = Date_Now(); //记录当前完成的时间
                temp = mm['b'];
                if (temp) { //有after
                    ToTry(temp, bag, bag);
                }
                newBag = 1;
            }
            if (!service['_']) { //service['@:{service#destroyed}'] 当前请求被销毁
                let finish = currentDoneCount == total;
                if (finish) {
                    service['a'] = 0;
                    if (flag == Service_FetchFlags_ALL) { //all
                        doneArr[0] = errorArgs;
                        ToTry(done, doneArr, service);
                    }
                }
                if (flag == Service_FetchFlags_ONE) { //如果是其中一个成功，则每次成功回调一次
                    ToTry(done, [error || Null, bag, finish, idx], service);
                }
            }
            if (newBag) { //不管当前request或回调是否销毁，均派发end事件，就像前面缓存一样，尽量让请求处理完成，该缓存的缓存，该派发事件派发事件。
                host.fire('end', {
                    bag,
                    error
                });
            }
        };
    };
    let Service_Send = (me, attrs, done, flag, save) => {
        if (me['_'])
            return me; //如果已销毁，返回
        if (me['a']) { //繁忙，后续请求入队
            return me.enqueue(Service_Send.bind(me, me, attrs, done, flag, save));
        }
        me['a'] = 1; //标志繁忙
        if (!IsArray(attrs)) {
            attrs = [attrs];
        }
        let host = me.constructor, requestCount = 0;
        //let bagCache = host['@:{service#cache}']; //存放bag的Cache对象
        let bagCacheKeys = host['b']; //可缓存的bag key
        let removeComplete = Service_Task(done, host, me, attrs.length, flag, host['c']);
        for (let bag of attrs) {
            if (bag) {
                let [bagEntity, update] = host.get(bag, save); //获取bag信息
                let cacheKey = bagEntity['a']['_']; //从实体上获取缓存key
                let complete = removeComplete.bind(bagEntity, bagEntity, requestCount++);
                let cacheList;
                if (cacheKey && bagCacheKeys[cacheKey]) { //如果需要缓存，并且请求已发出
                    bagCacheKeys[cacheKey].push(complete); //放到队列中
                }
                else if (update) { //需要更新
                    if (cacheKey) { //需要缓存
                        cacheList = [complete];
                        cacheList['_'] = bagEntity;
                        bagCacheKeys[cacheKey] = cacheList;
                        complete = Service_Cache_Done(bagCacheKeys, cacheKey); //替换回调，详见Service_CacheDone
                    }
                    host['d'](bagEntity, complete);
                }
                else { //不需要更新时，直接回调
                    complete();
                }
            }
        }
        return me;
    };
    function Service() {
        let me = this;
        me.id = GUID('s');
        me['e'] = [];
    }
    Assign(Service[Prototype], {
        all(attrs, done) {
            return Service_Send(this, attrs, done, Service_FetchFlags_ALL);
        },
        save(attrs, done) {
            return Service_Send(this, attrs, done, Service_FetchFlags_ALL, 1);
        },
        one(attrs, done) {
            return Service_Send(this, attrs, done, Service_FetchFlags_ONE);
        },
        enqueue(callback) {
            let me = this;
            if (!me['_']) {
                me['e'].push(callback);
                me.dequeue(me['f']);
            }
            return me;
        },
        dequeue(...a) {
            let me = this, one;
            if (!me['a'] && !me['_']) {
                me['a'] = 1;
                Timeout(() => {
                    me['a'] = 0;
                    if (!me['_']) { //不清除setTimeout,但在回调中识别是否调用了destroy方法
                        one = me['e'].shift();
                        if (one) {
                            ToTry(one, me['f'] = a);
                        }
                    }
                });
            }
        },
        destroy(me) {
            me = this;
            me['_'] = 1; //只需要标记及清理即可，其它的不需要
            me['e'] = 0;
        }
    });
    let Manager_DefaultCacheKey = (meta, attrs, arr) => {
        arr = [JSON_Stringify(attrs), JSON_Stringify(meta)];
        return arr.join(Spliter);
    };
    let Service_Manager = Assign({
        add(attrs) {
            let me = this;
            let metas = me['g'], bag;
            if (!IsArray(attrs)) {
                attrs = [attrs];
            }
            for (bag of attrs) {
                if (bag) {
                    let { name, cache } = bag;
                    bag.cache = cache | 0;
                    if (DEBUG && Has(metas, name)) {
                        throw new Error('service already exists:' + name);
                    }
                    metas[name] = bag;
                }
            }
        },
        create(attrs) {
            let me = this;
            let meta = me.meta(attrs);
            let cache = (attrs.cache | 0) || meta.cache;
            let entity = new Bag();
            entity.set(meta);
            entity['a'] = {
                'b': meta.after,
                '_': cache && Manager_DefaultCacheKey(meta, attrs)
            };
            if (IsObject(attrs)) {
                entity.set(attrs);
            }
            let before = meta.before;
            if (before) {
                ToTry(before, entity, entity);
            }
            me.fire('begin', {
                bag: entity
            });
            return entity;
        },
        meta(attrs) {
            let me = this;
            let metas = me['g'];
            let name = attrs.name || attrs;
            let ma = metas[name];
            return ma || attrs;
        },
        get(attrs, createNew) {
            let me = this;
            let e, u;
            if (!createNew) {
                e = me.cached(attrs);
            }
            if (!e) {
                e = me.create(attrs);
                u = 1;
            }
            return [e, u];
        },
        cached(attrs) {
            let me = this;
            let bagCache = me['c'];
            let entity;
            let cacheKey;
            let meta = me.meta(attrs);
            let cache = (attrs.cache | 0) || meta.cache;
            if (cache) {
                cacheKey = Manager_DefaultCacheKey(meta, attrs);
            }
            if (cacheKey) {
                let requestCacheKeys = me['b'];
                let info = requestCacheKeys[cacheKey];
                if (info) { //处于请求队列中的
                    entity = info['_'];
                }
                else { //缓存
                    entity = bagCache.get(cacheKey);
                    if (entity && Date_Now() - entity['a']['a'] > cache) {
                        bagCache.del(cacheKey);
                        entity = 0;
                    }
                }
            }
            return entity;
        }
    }, MxEvent);
    Service.extend = (sync, cacheMax, cacheBuffer) => {
        function NService() {
            Service.call(this);
        }
        NService['d'] = sync;
        NService['c'] = new MxCache(cacheMax, cacheBuffer);
        NService['b'] = {};
        NService['g'] = {};
        Assign(NService, Service_Manager);
        return Extend(NService, Service);
    };
    let Magix_Booted = 0;
    let Magix = {
        config(cfg, ...args) {
            let r = Mx_Cfg;
            if (cfg) {
                if (IsObject(cfg)) {
                    r = Assign(r, cfg, ...args);
                }
                else {
                    r = r[cfg];
                }
            }
            return r;
        },
        boot(cfg) {
            if (!Magix_Booted) {
                Magix_Booted = 1;
                Assign(Mx_Cfg, cfg); //先放到配置信息中，供ini文件中使用
                Vframe_mountView(Vframe_Root(), Mx_Cfg.defaultView);
            }
        },
        unboot() {
            if (Magix_Booted) {
                Magix_Booted = 0;
                Vframe_Unroot();
            }
        },
        HIGH: Thousand,
        LOW: -Thousand,
        isObject: IsObject,
        isArray: IsArray,
        isFunction: IsFunction,
        isString: IsString,
        isNumber: IsNumber,
        //isPrimitive:IsPrimitive,
        attach: EventListen,
        detach: EventUnlisten,
        mix: Assign,
        toMap: ToMap,
        toTry: ToTry,
        toUrl: ToUri,
        parseUrl: ParseUri,
        guid: GUID,
        use: Async_Require,
        dispatch: DispatchEvent,
        guard: Safeguard,
        type: Type,
        has: Has,
        inside: NodeIn,
        applyStyle: ApplyStyle,
        Cache: MxCache,
        View,
        Vframe,
        State,
        Service,
        Event: MxEvent,
        mark: Mark,
        unmark: Unmark,
        node: GetById,
        task: CallFunction,
        lowTask: LastCallFunction,
        taskFinale() {
            return new GPromise(CallFunction);
        },
        lowTaskFinale() {
            return new GPromise(LastCallFunction);
        },
        delay(time) {
            return new GPromise(r => Timeout(r, time));
        },
        /**
         * let checkIfReady=Matix.taskComplete((a,b,c)=>{
         *  console.log(a,b,c);
         * });
         * let process=index=>console.log(index);
         * for(let i=0;i<10;i++){
         *  Magix.task(process,[index]);
         *  checkIfReady(a,b,c);
         * }
         */
    };
    Magix.default = Magix;
    return Magix;
});

let office = () => {
    let node = document.getElementById('boot');
    let src = node.src.replace(/\/[^\/]+$/, '/');
    seajs.config({
        paths: {
            views: src + 'views',
        },
        alias: {
            magix: 'magix5'
        }
    });
    seajs.use([
        'magix5'
    ], (Magix) => {
        let { params } = Magix.parseUrl(location.href);
        Magix.applyStyle('@scoped.style');
        Magix.boot({
            defaultPath: '/index',
            defaultView: 'views/' + (params.view || 'index'),
            rootId: 'app',
            error(e) {
                setTimeout(() => {
                    throw e;
                }, 0);
            }
        });
    });
};

/*
    generate by magix-composer@3.0.0
    https://github.com/thx/magix-composer
    author: https://github.com/xinglie
    loader:cmd_es
 */
define("views/index",["magix5"],(require,exports,module)=>{
let $quick___1_static_node;
let $quick___2_static_node;
let $quick___3_static_node;
let $quick___static_text;
let $quick_a_static_text;
let $quick___0_static_attr={'class': 'o-e',};
let $quick___4_static_attr={'class': 'o-j',};
let $special_2={'selected':'selected',};
let $special_4={'value':'value',};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    author:xinglie.lkf@alibaba-inc.com
*/
const magix5_1 = require("magix5");
magix5_1.default.applyStyle("o-a",".o-e{align-items:center;display:flex;height:50px;margin:10px 50px}.o-f{height:25px;line-height:25px}.o-g{width:150px}.o-h{background-color:#f8f8f8;border:1px solid #a6a6a6;border-radius:5px;height:23px;padding:0 8px;width:60px}.o-g:focus,.o-h:focus{outline:none}.o-i{margin-left:30px}.o-j{margin:10px 50px}.o-k{border-collapse:collapse;table-layout:fixed;width:100%}.o-k td{border:1px solid #666;height:20px;word-break:break-all}.o-l{margin-left:5px}.o-m{display:none}");
let ColsCount = [1, 20];
let Settings = {
    br: /(?:\r\n|\r|\n)/,
    cell: /\t/
};
let escapedRegexp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
let escapeRegexp = s => (s + '').replace(escapedRegexp, '\\$&');
exports.default = magix5_1.default.View.extend({
    tmpl: ($dataFromView, $createVNode,$viewId)=> { 
let $temp_var,$vnode_0,
{
	cols,
	col,
	chars,
	table,
	id,}=$dataFromView,
$vnode_2,
$vnode_3,
$$_class,
$vnode_1,
$vnode_5,
$vnode_4,
$text;

if($quick___1_static_node){
$vnode_1=[$quick___1_static_node];
}else{
$vnode_2=[$createVNode(0,'第：')];$vnode_1=[$quick___1_static_node=$createVNode('div',{'_': '_','class': 'o-f',},$vnode_2)];
}
$vnode_2=[];
for(let i=cols[0];i<=cols[1];i++){
$vnode_3=[$createVNode(0,(i))];$vnode_2.push($createVNode('option',{'selected': (i==col),},$vnode_3,$special_2));
}$vnode_1.push($createVNode('select',{'class': 'o-f o-g','mx5-change': $viewId+'@{change.col}()',},$vnode_2));
if($quick___2_static_node){
$vnode_1.push($quick___2_static_node);
}else{
$vnode_2=[$createVNode(0,'列按字符：')];$vnode_1.push($quick___2_static_node=$createVNode('div',{'_': 'a','class': 'o-f o-l',},$vnode_2));
}
$vnode_1.push($createVNode('input',{'class': 'o-f o-h','value': (chars),'mx5-input': $viewId+'@{change.chars}()',},1,$special_4));
if($quick___3_static_node){
$vnode_1.push($quick___3_static_node);
}else{
$vnode_2=[$createVNode(0,'拆分')];$vnode_1.push($quick___3_static_node=$createVNode('div',{'_': 'b','class': 'o-f o-l',},$vnode_2));
}
$vnode_2=[$quick___static_text||($quick___static_text=$createVNode(0,'复制表格内容'))];;$$_class='o-c o-d o-i';if(!table){;$$_class+=' o-m';};$vnode_1.push($createVNode('button',{'mx5-click': $viewId+'@{copy}()','class': $$_class,},$vnode_2));$vnode_0=[$createVNode('div',$quick___0_static_attr,$vnode_1)];$vnode_1=[];
if(table){
$vnode_3=[];
for(let $q_a_gtmaufp=table.grid,$q_c_kqcczc=$q_a_gtmaufp.length,$q_key_jav=0;$q_key_jav<$q_c_kqcczc;$q_key_jav+=1){
let cells=$q_a_gtmaufp[$q_key_jav];
$vnode_4=[];
for(let $q_c_lpesrciodj=cells.length,$q_key_anwfipzx=0;$q_key_anwfipzx<$q_c_lpesrciodj;$q_key_anwfipzx+=1){
let cell=cells[$q_key_anwfipzx];
$vnode_5=[$createVNode(0,(cell))];$vnode_4.push($createVNode('td',{'style': 'width:'+(100/table.cols)+'%',},$vnode_5));
}$vnode_3.push($createVNode('tr',0,$vnode_4));
}$vnode_2=[$createVNode('tbody',0,$vnode_3)];$vnode_1.push($createVNode('table',{'class': 'o-k','id': 'result_'+(id),},$vnode_2));
}else{
$vnode_1.push($quick_a_static_text||($quick_a_static_text=$createVNode(0,'请粘贴内容')));
}$vnode_0.push($createVNode('div',$quick___4_static_attr,$vnode_1));$text='';if(table){;$text+=' 由原'+(table.from)+'行拆分成'+(table.to)+'行 ';};$vnode_1=[$createVNode(0,$text)];$vnode_0.push($createVNode('div',$quick___4_static_attr,$vnode_1)); 

return $createVNode($viewId,0,$vnode_0); } ,
    render() {
        this.digest({
            id: this.id,
            col: 5,
            chars: ',，',
            cols: ColsCount
        });
    },
    '@{get.cells}'(data) {
        let lines = data.split(Settings.br);
        let result = [];
        for (let line of lines) {
            if (line && line.trim()) {
                let cs = line.split(Settings.cell);
                result.push(cs);
            }
        }
        return result;
    },
    '@{get.table}'(data) {
        let lines = this['@{get.cells}'](data);
        let table = {
            from: lines.length,
            to: 0,
            grid: []
        };
        let ref = this.get();
        let col = Math.max((ref.col | 0) - 1, 0);
        let grid = [];
        let spliter = new RegExp(`[${escapeRegexp(ref.chars)}]`);
        for (let line of lines) {
            let cell = line[col];
            if (cell && cell.trim()) {
                let cs = cell.trim().split(spliter);
                for (let c of cs) {
                    let copy = line.slice();
                    copy[col] = c;
                    grid.push(copy);
                }
            }
            else {
                grid.push(line);
            }
        }
        table.grid = grid;
        table.to = grid.length;
        return table;
    },
    '@{change.col}<change>'(e) {
        let target = e.eventTarget;
        let option = target.options[target.selectedIndex];
        this.digest({
            col: option.value,
            table: null
        });
    },
    '@{change.chars}<input>'(e) {
        let target = e.eventTarget;
        this.digest({
            chars: target.value.trim(),
            table: null
        });
    },
    '@{copy}<click>'() {
        let range = document.createRange();
        range.selectNode(magix5_1.default.node('result_' + this.id));
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        alert('已复制');
    },
    '$doc<paste>'(e) {
        let data = e.clipboardData.getData('text/plain');
        let table = this['@{get.table}'](data);
        this.digest({
            table
        });
    }
});

});
/*
    generate by magix-composer@3.0.0
    https://github.com/thx/magix-composer
    author: https://github.com/xinglie
    loader:cmd_es
 */
define("views/m",["magix5","./dd/index"],(require,exports,module)=>{
let $quick_b_static_text;
let $quick_a_0_static_attr={'class': 'o-n',};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    author:xinglie.lkf@alibaba-inc.com
*/
const magix5_1 = require("magix5");
const index_1 = require("./dd/index");
magix5_1.default.applyStyle("o-b",".o-n{height:2000px}.o-o{background-color:#eee;height:400px;left:0;position:absolute;top:0;width:300px}.o-p{background-color:#ccc;height:40px;touch-action:none}");
exports.default = magix5_1.default.View.extend({
    tmpl: ($dataFromView, $createVNode,$viewId)=> { 
let $temp_var,$vnode_0,
{
	left,
	top,}=$dataFromView,
$vnode_3,
$vnode_2,
$vnode_1;
$vnode_3=[$quick_b_static_text||($quick_b_static_text=$createVNode(0,'drag title'))];$vnode_2=[$createVNode('div',{'class': 'o-p','mx5-pointerdown': $viewId+'drag()',},$vnode_3)];$vnode_1=[$createVNode('div',{'class': 'o-o','style': 'left:'+(left)+'px;top:'+(top)+'px',},$vnode_2)];$vnode_0=[$createVNode('div',$quick_a_0_static_attr,$vnode_1)]; 

return $createVNode($viewId,0,$vnode_0); } ,
    render() {
        this.digest({
            left: 50,
            top: 100
        });
    },
    'drag<pointerdown>'(e) {
        let startX = e.pageX, startY = e.pageY;
        let beginX = this.get('left'), beginY = this.get('top');
        this['_h'](e, move => {
            let offsetX = move.pageX - startX, offsetY = move.pageY - startY;
            this.digest({
                left: beginX + offsetX,
                top: beginY + offsetY
            });
        });
    }
}).merge(index_1.default);

});
/*
    generate by magix-composer@3.0.0
    https://github.com/thx/magix-composer
    author: https://github.com/xinglie
    loader:cmd_es
 */
define("views/dd/index",["magix5"],(require,exports,module)=>{

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    author:https://github.com/xinglie
 */
const magix5_1 = require("magix5");
let { attach, detach } = magix5_1.default;
let Win = window;
let Doc = document;
let IsW3C = Win.getComputedStyle;
let ClearSelection = (t) => {
    if ((t = Win.getSelection)) {
        t().removeAllRanges();
    }
};
let DragPrevent = e => e.preventDefault();
let DragMoveEvent = ['pointermove'];
let DragEndEvent = ['pointerup', 'pointercancel'];
let DragPreventEvent = ['keydown', 'wheel', 'DOMMouseScroll', 'fullscreenchange', 'selectstart'];
let passiveObject = {
    passive: false
};
let dragKey = '__';
exports.default = {
    ctor() {
        let me = this;
        me.on('destroy', () => {
            me['_a']();
        });
    },
    '_b'(owner, key) {
        key || (key = dragKey);
        let ref = owner[key];
        if (!ref) {
            owner[key] = 0;
        }
        owner[key]++;
        return !ref;
    },
    '_c'(owner, key) {
        key || (key = dragKey);
        let ref = owner[key];
        if (ref) {
            owner[key]--;
        }
        return ref === 1;
    },
    '_d'(owner, key) {
        delete owner[key || dragKey];
    },
    '_a'(e) {
        let me = this;
        let info = me['_e'];
        if (info) {
            let fn;
            for (fn of DragMoveEvent) {
                detach(Doc, fn, me['_e']);
            }
            for (fn of DragEndEvent) {
                detach(Doc, fn, me['_f']);
            }
            for (fn of DragPreventEvent) {
                detach(Doc, fn, DragPrevent);
            }
            detach(Win, 'blur', me['_f']);
            delete me['_e'];
            let stop = me['_g'];
            if (stop) {
                stop(e);
            }
        }
    },
    '_h'(e, moveCallback, endCallback) {
        let me = this;
        me['_a']();
        if (e) {
            ClearSelection();
            me['_g'] = endCallback;
            me['_f'] = me['_a'].bind(me);
            me['_e'] = e => {
                if (moveCallback) {
                    moveCallback(e);
                }
            };
            let fn;
            for (fn of DragMoveEvent) {
                attach(Doc, fn, me['_e']);
            }
            for (fn of DragEndEvent) {
                attach(Doc, fn, me['_f']);
            }
            for (fn of DragPreventEvent) {
                attach(Doc, fn, DragPrevent, passiveObject);
            }
            attach(Win, 'blur', me['_f']);
        }
    },
    /**
     * 获取某坐标点的dom元素
     * @param x x坐标
     * @param y y坐标
     */
    '_k'(x, y) {
        let node;
        if (Doc.elementFromPoint) {
            if (!DragPrevent['_i'] && IsW3C) {
                DragPrevent['_i'] = 1;
                DragPrevent['_j'] = Doc.elementFromPoint(-1, -1) !== null;
            }
            if (DragPrevent['_j']) {
                x += window.pageXOffset;
                y += window.pageYOffset;
            }
            node = Doc.elementFromPoint(x, y);
            while (node && node.nodeType == 3)
                node = node.parentNode;
        }
        return node;
    },
    '_l': ClearSelection
};

});