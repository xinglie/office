//#snippet;
//#exclude = all;
/*!5.0.0 Licensed MIT*/
/*
author:kooboy_li@163.com
loader:cmd
enables:

optionals:router
*/
define('magix5', () => {
    //VARS
if (typeof DEBUG == 'undefined') window.DEBUG = true;
let Counter = 0;
let Empty = '';
let Empty_Array = [];
let Comma = ',';
let Null = null;
let Doc_Window = window;
let Undefined = void Counter;
let Doc_Document = document;
let Timeout = setTimeout;
let Encode = encodeURIComponent;
let Value = 'value';
let Tag_Static_Key = 'mxs';
let Tag_View_Params_Key = 'mxv';
let Hash_Key = '#';
function Noop() { }
let JSON_Stringify = JSON.stringify;
let Doc_Body = Doc_Document.body;
let Date_Now = Date.now;
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
let Spliter = '\x1e';
let Prototype = 'prototype';
let Params = 'params';
let Path = 'path';
let MX_View = 'mx-view';
let ToString = Object[Prototype].toString;
let Type = o => ToString.call(o).slice(8, -1);
let IsObject = o => Type(o) == 'Object';
let IsArray = Array.isArray;
let GUID = prefix => (prefix || 'mx_') + Counter++;
let GetById = id => Doc_Document.getElementById(id);
let SetInnerHTML = (n, html) => n.innerHTML = html;
let MxGlobalView = GUID();
let Mx_Cfg = {
    rootId: GUID(),
    defaultView: MxGlobalView,
    error(e) {
        throw e;
    }
};
let IsPrimitive = args => !args || typeof args != 'object';
let UpdateData = (newData, oldData, keys, unchanged) => {
    let changed = 0,
        now, old, p;
    for (p in newData) {
        now = newData[p];
        old = oldData[p];
        if ((!IsPrimitive(now) || old !== now) && !Has(unchanged, p)) {
            keys[p] = 1;
            changed = 1;
        }
        oldData[p] = now;
    }
    return changed;
};
let NodeIn = (a, b, r) => {
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = (b.compareDocumentPosition(a) & 16) == 16;
            } catch (_magix) { }
        }
    }
    return r;
};
let {
    assign: Assign,
    keys: Keys,
    hasOwnProperty: HasProp
} = Object;
let Header = Doc_Document.head;
let Temp = Doc_Document.createElement('div');
let GA = Temp.getAttribute;
let GetAttribute = (node, attr) => GA.call(node, attr);
let ApplyStyle = (key, css) => {
    if (DEBUG && IsArray(key)) {
        for (let i = 0; i < key.length; i += 2) {
            ApplyStyle(key[i], key[i + 1]);
        }
        return;
    }
    if (css && !ApplyStyle[key]) {
        ApplyStyle[key] = 1;
        if (DEBUG) {
            if (key.indexOf('$throw_') === 0) {
                throw new Error(css);
            }
            SetInnerHTML(Temp, `<style id="${key}">${css}`);
            Header.appendChild(Temp.firstChild);
        } else {
            SetInnerHTML(Temp, `<style>${css}`);
            Header.appendChild(Temp.firstChild);
        }
    }
};
let ToTry = (fns, args, context, r, e) => {
    args = args || Empty_Array;
    if (!IsArray(fns)) fns = [fns];
    if (!IsArray(args)) args = [args];
    for (e of fns) {
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Mx_Cfg.error(x);
        }
    }
    return r;
};

let Has = (owner, prop) => owner && HasProp.call(owner, prop);
let TranslateData = (data, params) => {
    let p, val;
    if (IsPrimitive(params)) {
        p = params + Empty;
        if (p[0] == Spliter && data.has(p)) {
            params = data.get(p);
        }
    } else {
        for (p in params) {
            val = params[p];
            val = TranslateData(data, val);
            params[p] = val;
        }
    }
    return params;
};
    let CacheSort = (a, b) => b['a'] - a['a'] || b['b'] - a['b'];
/**
 * Magix.Cache 类
 * @name Cache
 * @constructor
 * @param {Integer} [max] 缓存最大值，默认20
 * @param {Integer} [buffer] 缓冲区大小，默认5
 * @param {Function} [remove] 当缓存的元素被删除时调用
 * @example
 * let c = new Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
 * c.set('key1',{});//缓存
 * c.get('key1');//获取
 * c.del('key1');//删除
 * c.has('key1');//判断
 * //注意：缓存通常配合其它方法使用，在Magix中，对路径的解析等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
 */
function Cache(max, buffer, remove, me) {
    me = this;
    me['a'] = [];
    me['b'] = buffer || 5; //buffer先取整，如果为0则再默认5
    me['c'] = me['b'] + (max || 20);
    me['d'] = remove;
}

Assign(Cache[Prototype], {
    /**
     * @lends Cache#
     */
    /**
     * 获取缓存的值
     * @param  {String} key
     * @return {Object} 初始设置的缓存对象
     */
    get(key) {
        let me = this;
        let c = me['a'];
        let r = c[Spliter + key];
        if (r) {
            r['a']++;
            r['b'] = Counter++;
            r = r['c'];
        }
        return r;
    },
    /**
     * 设置缓存
     * @param {String} key 缓存的key
     * @param {Object} value 缓存的对象
     */
    set(okey, value) {
        let me = this;
        let c = me['a'];
        let key = Spliter + okey;
        let r = c[key];
        let t = me['b'];
        if (!r) {
            if (c.length >= me['c']) {
                c.sort(CacheSort);
                while (t--) {
                    r = c.pop();
                    //为什么要判断r['a']>0,考虑这样的情况：用户设置a,b，主动删除了a,重新设置a,数组中的a原来指向的对象残留在列表里，当排序删除时，如果不判断则会把新设置的删除，因为key都是a
                    //
                    if (r['a'] > 0) me.del(r.o); //如果没有引用，则删除
                }
            }
            r = {
                'd': okey
            };
            c.push(r);
            c[key] = r;
        }
        r['c'] = value;
        r['a'] = 1;
        r['b'] = Counter++;
    },
    /**
     * 删除缓存
     * @param  {String} key 缓存key
     */
    del(k) {
        k = Spliter + k;
        let c = this['a'];
        let r = c[k],
            m = this['d'];
        if (r) {
            r['a'] = -1;
            r['c'] = Empty;
            delete c[k];
            if (m) {
                ToTry(m, r['d']);
            }
        }
    },
    /**
     * 检测缓存中是否有给定的key
     * @param  {String} key 缓存key
     * @return {Boolean}
     */
    has(k) {
        return Has(this['a'], Spliter + k);
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
let AddEventListener = (element, type, fn, viewId, eventOptions, view) => {
    let h = {
        'a': viewId,
        'b': fn,
        'c': type,
        'd': element,
        'e'(e) {
            if (viewId) {
                ToTry(fn, e, view);
            } else {
                fn(e);
            }
        }
    };
    AttachEventHandlers.push(h);
    element.addEventListener(type, h['e'], eventOptions);
};
let RemoveEventListener = (element, type, cb, viewId, eventOptions) => {
    for (let c, i = AttachEventHandlers.length; i--;) {
        c = AttachEventHandlers[i];
        if (c['c'] == type &&
            c['a'] == viewId &&
            c['d'] == element &&
            c['b'] === cb) {
            AttachEventHandlers.splice(i, 1);
            element.removeEventListener(type, c['e'], eventOptions);
            break;
        }
    }
};
    
let PathToObject = new Cache();
/**
 * 把路径字符串转换成对象
 * @param  {String} path 路径字符串
 * @return {Object} 解析后的对象
 * @example
 * let obj = Magix.parseUri('/xxx/?a=b&c=d');
 * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
 */
let ParseUri = path => {
    //把形如 /xxx/?a=b&c=d 转换成对象 {path:'/xxx/',params:{a:'b',c:'d'}}
    //1. /xxx/a.b.c.html?a=b&c=d  path /xxx/a.b.c.html
    //2. /xxx/?a=b&c=d  path /xxx/
    //5. /xxx/index.html  => path /xxx/index.html
    //11. ab?a&b          => path ab  params:{a:'',b:''}
    let r = PathToObject.get(path),
        pathname, key, value, po, q;
    if (!r) {
        po = {};
        q = path.indexOf('?');
        if (q == -1) {
            pathname = path;
        } else {
            pathname = path.substring(0, q);
            path = path.substring(q + 1);
            if (path) {
                for (q of path.split('&')) {
                    [key, value] = q.split('=');
                    po[key] = decodeURIComponent(value || Empty);
                }
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
/**
 * 转换成字符串路径
 * @param  {String} path 路径
 * @param {Object} params 参数对象
 * @param {Object} [keo] 保留空白值的对象
 * @return {String} 字符串路径
 * @example
 * let str = Magix.toUri('/xxx/',{a:'b',c:'d'});
 * // str == /xxx/?a=b&c=d
 *
 * let str = Magix.toUri('/xxx/',{a:'',c:2});
 *
 * // str == /xxx/?a=&c=2
 *
 * let str = Magix.toUri('/xxx/',{a:'',c:2},{c:1});
 *
 * // str == /xxx/?c=2
 * let str = Magix.toUri('/xxx/',{a:'',c:2},{a:1,c:1});
 *
 * // str == /xxx/?a=&c=2
 */
let ToUri = (path, params, keo) => {
    let arr = [], v, p, f;
    for (p in params) {
        v = params[p] + Empty;
        if (!keo || v || Has(keo, p)) {
            v = Encode(v);
            arr.push(f = p + '=' + v);
        }
    }
    if (f) {
        path += (path && (~path.indexOf('?') ? '&' : '?')) + arr.join('&');
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
let ParseExprCache = new Cache();
let ParseExpr = (expr, data, result) => {
    if (ParseExprCache.has(expr)) {
        result = ParseExprCache.get(expr);
    } else {
        //jshint evil:true
        result = ToTry(Function(`return ${expr}`));
        if (expr.indexOf(Spliter) > -1) {
            TranslateData(data, result);
        } else {
            ParseExprCache.set(expr, result);
        }
    }
    if (DEBUG) {
        result = Safeguard(result);
    }
    return result;
};
    let MxDefaultViewEntity;
    let Async_Require = (name, fn) => {
        if (name) {
            let a = [], n;
            if (MxGlobalView == name) {
                if (!MxDefaultViewEntity) {
                    MxDefaultViewEntity = View.extend();
                }
                fn(MxDefaultViewEntity);
            } else /*if (Doc_Window.seajs)*/ {
                seajs.use(name, (...g) => {
                    for (let m of g) {
                        a.push(m && m.__esModule && m.default || m);
                    }
                    if (fn) fn(...a);
                });
            } /*else {
                if (!IsArray(name)) name = [name];
                for (n of name) {
                    n = require(n);
                    a.push(n && n.__esModule && n.default || n);
                }
                if (fn) fn(...a);
            }*/
        } else {
            fn();
        }
    };
    function T() { }
let Extend = (ctor, base, props, statics, cProto) => {
    //bProto.constructor = base;
    T[Prototype] = base[Prototype];
    cProto = new T();
    Assign(cProto, props);
    Assign(ctor, statics);
    cProto.constructor = ctor;
    ctor[Prototype] = cProto;
    return ctor;
};
    let Safeguard = data => data;
if (DEBUG && window.Proxy) {
    let ProxiesPool = new Map();
    Safeguard = (data, getter, setter, root) => {
        if (IsPrimitive(data)) {
            return data;
        }
        let build = (prefix, o) => {
            let key = getter + '\x01' + setter;
            let cached = ProxiesPool.get(o);
            if (cached && cached.key == key) {
                return cached.entity;
            }
            if (o['\x1e_sf_\x1e']) {
                return o;
            }
            let entity = new Proxy(o, {
                set(target, property, value) {
                    if (!setter && !prefix) {
                        throw new Error('avoid writeback,key: ' + prefix + property + ' value:' + value + ' more info: https://github.com/thx/magix/issues/38');
                    }
                    target[property] = value;
                    if (setter) {
                        setter(prefix + property, value);
                    }
                    return true;
                },
                get(target, property) {
                    if (property == '\x1e_sf_\x1e') {
                        return true;
                    }
                    let out = target[property];
                    if (!prefix && getter) {
                        getter(property);
                    }
                    if (!root && Has(target, property) &&
                        (IsArray(out) || IsObject(out))) {
                        return build(prefix + property + '.', out);
                    }
                    return out;
                }
            });
            ProxiesPool.set(o, {
                key,
                entity
            });
            return entity;
        };
        return build('', data);
    };
}
    /**
 * 多播事件对象
 * @name Event
 * @namespace
 */
let MxEvent = {
    /**
     * @lends MEvent
     */
    /**
     * 触发事件
     * @param {String} name 事件名称
     * @param {Object} data 事件对象
     * @param {Boolean} [remove] 事件触发完成后是否移除这个事件的所有监听
     */
    fire(name, data) {
        let key = Spliter + name,
            me = this,
            list = me[key],
            idx = 0, len, t;
        if (!data) data = {};
        data.type = name;
        if (list) {
            for (len = list.length; idx < len; idx++) {
                t = list[idx];
                if (t.f) {
                    t.x = 1;
                    ToTry(t.f, data, me);
                    t.x = Empty;
                } else if (!t.x) {
                    list.splice(idx--, 1);
                    len--;
                }
            }
        }
        list = me[`on${name}`];
        if (list) ToTry(list, data, me);
        return me;
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件处理函数
     * @example
     * let T = Magix.mix({},Magix.Event);
     * T.on('done',function(e){
     *     alert(1);
     * });
     * T.on('done',function(e){
     *     alert(2);
     *     T.off('done',arguments.callee);
     * });

     * T.fire('done',{data:'test'});
     * T.fire('done',{data:'test2'});
     */
    on(name, f) {
        let me = this;
        let key = Spliter + name;
        let list = me[key] || (me[key] = []);
        list.push({
            f
        });
        return me;
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} [fn] 事件处理函数
     */
    off(name, fn) {
        let key = Spliter + name,
            me = this,
            list = me[key],
            t;
        if (fn) {
            if (list) {
                for (t of list) {
                    if (t.f == fn) {
                        t.f = Empty;
                        break;
                    }
                }
            }
        } else {
            delete me[key];
            delete me[`on${name}`];
        }
        return me;
    }
};
    
    
    let Vframe_RootVframe;
let Vframe_Vframes = {};
let Vframe_TranslateQuery = (pId, src, params, pVf) => {
    if (src.indexOf(Spliter) > 0 &&
        (pVf = Vframe_Vframes[pId])) {
        TranslateData(pVf['a']['a'], params);
    }
};
/**
 * 获取根vframe;
 * @return {Vframe}
 * @private
 */
let Vframe_Root = (rootId, e) => {
    if (!Vframe_RootVframe) {
        rootId = Mx_Cfg.rootId;
        e = GetById(rootId);
        if (!e) {
            e = Doc_Body;
        }
        Vframe_RootVframe = new Vframe(e);
    }
    return Vframe_RootVframe;
};


let Vframe_AddVframe = (id, vframe) => {
    if (!Has(Vframe_Vframes, id)) {
        Vframe_Vframes[id] = vframe;
        Vframe.fire('add', {
            vframe
        });
    }
};
let Vframe_RemoveVframe = (id, vframe) => {
    vframe = Vframe_Vframes[id];
    if (vframe) {
        delete Vframe_Vframes[id];
        vframe.root['a'] = 0;
        Vframe.fire('remove', {
            vframe
        });
        vframe.id = vframe.root = vframe.pId = vframe['b'] = Null; //清除引用,防止被移除的view内部通过setTimeout之类的异步操作有关的界面，影响真正渲染的view
        if (DEBUG) {
            let nodes = Doc_Document.querySelectorAll('#' + id);
            if (nodes.length > 1) {
                Mx_Cfg.error(Error(`remove vframe error. dom id:"${id}" duplicate`));
            }
        }
    }
};

let Vframe_RunInvokes = (vf, list, o) => {
    list = vf['c']; //invokeList
    while (list.length) {
        o = list.shift();
        if (!o.r) { //remove
            vf.invoke(o.n, o.a); //name,arguments
        }
        delete list[o.k]; //key
    }
};

let Vframe_GetVfId = node => node['b'] || (node['b'] = GUID());
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 */
function Vframe(root, pId) {
    let me = this;
    let vfId = Vframe_GetVfId(root);
    me.id = vfId;
    me.root = root;
    me.pId = pId;
    me['b'] = {}; //childrenMap
    me['d'] = 1; //signature
    me['c'] = []; //invokeList
    Vframe_AddVframe(vfId, me);
}
Assign(Vframe, {
    /**
     * @lends Vframe
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all() {
        return Vframe_Vframes;
    },
    byId(id) {
        return Vframe_Vframes[id];
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe|undefined} vframe对象
     */
    byNode(node) {
        return Vframe_Vframes[node['b']];
    }
}, MxEvent);

Assign(Vframe[Prototype], {
    /**
     * @lends Vframe#
     */
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} [viewInitParams] 调用view的init方法时传递的参数
     */
    mountView(viewPath, viewInitParams /*,keepPreHTML*/) {
        let me = this;
        let { id, root, pId } = me;
        let po, sign, view, params, ctors;
        if (!me['e'] && root) { //alter
            me['e'] = 1;
            me['f'] = root.innerHTML;
        }
        me.unmountView();
        if (root && viewPath) {
            po = ParseUri(viewPath);
            view = po[Path];
            me[Path] = viewPath;
            params = po[Params];
            Vframe_TranslateQuery(pId, viewPath, params);
            me['g'] = view;
            Assign(params, viewInitParams);
            sign = me['d'];
            Async_Require(view, TView => {
                if (sign == me['d']) { //有可能在view载入后，vframe已经卸载了
                    if (!TView) {
                        return Mx_Cfg.error(Error(`${id} cannot load:${view}`));
                    }
                    ctors = View_Prepare(TView);
                    view = new TView(id, root, me, params, ctors);

                    if (DEBUG) {
                        let viewProto = TView.prototype;
                        let importantProps = {
                            id: 1,
                            owner: 1,
                            'b': 1,
                            'c': 1,
                            'd': 1,
                            'e': 1,
                            'a': 1,
                            'f': 1
                        };
                        for (let p in view) {
                            if (Has(view, p) && viewProto[p]) {
                                throw new Error(`avoid write ${p} at file ${viewPath}!`);
                            }
                        }
                        view = Safeguard(view, null, (key, value) => {
                            if (Has(viewProto, key) ||
                                (Has(importantProps, key) &&
                                    (key != 'd' || !isFinite(value)) &&
                                    ((key != 'owner' && key != 'root') || value !== Null))) {
                                throw new Error(`avoid write ${key} at file ${viewPath}!`);
                            }
                        }, true);
                    }
                    me['a'] = view;
                    
                    View_DelegateEvents(view);
                    ToTry(view.init, params, view);
                    view['g']();
                    if (!view.tmpl) { //无模板
                        me['e'] = 0; //不会修改节点，因此销毁时不还原
                        if (!view['h']) {
                            view.endUpdate();
                        }
                    }
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView() {
        let me = this;
        let { 'a': v, root } = me;
        me['c'] = [];
        if (v) {
            me.unmountZone();
            me['a'] = 0; //unmountView时，尽可能早的删除vframe上的$v对象，防止$v销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            if (v['d'] > 0) {
                v['d'] = 0;
                v.fire('destroy');
                v.off('destroy');
                View_DestroyAllResources(v, 1);
                View_DelegateEvents(v, 1);
                v.owner = v.root = Null;
            }
            v['d']--;
            if (root && me['e'] /*&&!keepPreHTML*/) { //如果$v本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且$v有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即$v安装前什么样，销毁后把节点恢复到安装前的情况
                SetInnerHTML(root, me['f']);
            }
        }
        me['d']++; //增加signature，阻止相应的回调，见mountView
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} [viewInitParams] 传递给view init方法的参数
     * @return {Vframe} vframe对象
     * @example
     * // html
     * // &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe(node, viewPath, viewInitParams) {
        let me = this,
            vf, id = me.id, c = me['b'];
        let vfId = Vframe_GetVfId(node);
        vf = Vframe_Vframes[vfId];
        if (!vf) {
            if (!Has(c, vfId)) { //childrenMap,当前子vframe不包含这个id
                me['h'] = 0; //childrenList 清空缓存的子列表
            }
            c[vfId] = vfId; //map
            vf = new Vframe(node, id);
        }
        vf.mountView(viewPath, viewInitParams);
        return vf;
    },
    /**
     * 加载某个区域下的view
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @example
     * // html
     * // &lt;div id="zone"&gt;
     * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
     * // &lt;/div&gt;
     *
     * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
     */
    mountZone(zone) {
        let me = this, it;
        zone = zone || me.root;
        let vframes = zone.querySelectorAll(`[${MX_View}]`);
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

        //me['i'] = 1; //hold fire creted
        //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27

        for (it of vframes) {
            if (!it['a']) { //防止嵌套的情况下深层的view被反复实例化
                it['a'] = 1;
                me.mountVframe(it, GetAttribute(it, MX_View));
            }
        }
        //me['i'] = 0;
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe(node, isVframeId) { //inner 标识是否是由内部调用，外部不应该传递该参数
        let me = this,
            vf, pId;
        node = node ? me['b'][isVframeId ? node : node['b']] : me.id;
        vf = Vframe_Vframes[node];
        if (vf) {
            vf.unmountView();
            pId = vf.pId;
            Vframe_RemoveVframe(node);
            vf = Vframe_Vframes[pId];
            if (vf && Has(vf['b'], node)) { //childrenMap
                delete vf['b'][node]; //childrenMap
                vf['h'] = 0;
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId] 节点对象或id
     */
    unmountZone(root) {
        let me = this;
        let p, vf, unmount;
        for (p in me['b']) {
            if (root) {
                vf = Vframe_Vframes[p];
                unmount = vf && NodeIn(vf.root, root);
            } else {
                unmount = 1;
            }
            if (unmount) {
                me.unmountVframe(p, 1);
            }
        }
    },
    /**
     * 获取父vframe
     * @param  {Integer} [level] 向上查找层级，默认1,取当前vframe的父级
     * @return {Vframe|undefined}
     * @beta
     * @module linkage
     */
    parent(level, vf) {
        vf = this;
        level = (level >>> 0) || 1;
        while (vf && level--) {
            vf = Vframe_Vframes[vf.pId];
        }
        return vf;
    },
    /**
     * 获取当前vframe的所有子vframe的id。返回数组中，vframe在数组中的位置并不固定
     * @return {Array[String]}
     * @beta
     * @module linkage
     * @example
     * let children = view.owner.children();
     * console.log(children);
     */
    children(me) {
        me = this;
        return me['h'] || (me['h'] = Keys(me['b']));
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} [args] 参数
     * @return {Object}
     * @beta
     * @module linkage
     * @example
     * // html
     * // &lt;div&gt; mx-view="path/to/v1" id="test"&gt;&lt;/div&gt;
     * let vf = Magix.Vframe.get('test');
     * vf.invoke('methodName',['args1','agrs2']);
     */
    invoke(name, args) {
        let result;
        let vf = this,
            view, fn, o, list = vf['c'],
            key;
        if ((view = vf['a']) && view['h']) { //view rendered
            result = (fn = view[name]) && ToTry(fn, args, view);
        } else {
            o = list[key = Spliter + name];
            if (o) {
                o.r = args === o.a; //参数一样，则忽略上次的
            }
            o = {
                n: name,
                a: args,
                k: key
            };
            list.push(o);
            list[key] = o;
        }
        return result;
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
let Body_EvtInfoCache = new Cache(30, 10);
let Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;
let Body_RootEvents = {};
let Body_SearchSelectorEvents = {};
let Body_FindVframeInfo = (current, eventType) => {
    let vf, tempId, selectorObject, eventSelector, eventInfos = [],
        begin = current,
        info = GetAttribute(current, `mx-${eventType}`),
        match, view, vfs,
        selectorVfId,
        backtrace = 0;
    if (info) {
        match = Body_EvtInfoCache.get(info);
        if (!match) {
            match = info.match(Body_EvtInfoReg) || Empty_Array;
            match = {
                v: match[1],
                n: match[2],
                i: match[3]
            };
            Body_EvtInfoCache.set(info, match);
        }
        match = Assign({}, match, { r: info });
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        selectorVfId = begin['c'];
        if (!selectorVfId) { //先找最近的vframe
            vfs = [begin];
            while (begin != Doc_Body && (begin = begin.parentNode)) {
                if (Vframe_Vframes[tempId = begin['b']] ||
                    (tempId = begin['c'])) {
                    selectorVfId = tempId;
                    break;
                }
                vfs.push(begin);
            }
            if (selectorVfId) {
                for (info of vfs) {
                    info['c'] = selectorVfId;
                }
            }
        }
        if (selectorVfId) { //从最近的vframe向上查找带有选择器事件的view
            begin = current['b'];
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
            do {
                vf = Vframe_Vframes[selectorVfId];
                if (vf && (view = vf['a'])) {
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
                            } else if (backtrace) {
                                eventInfos.unshift(selectorObject);
                            }
                        }
                    }
                    //防止跨view选中，到带模板的view时就中止或未指定
                    if (view.tmpl && !backtrace) {
                        break; //带界面的中止
                    }
                    backtrace = 0;
                }
            }
            while (vf && (selectorVfId = vf.pId));
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
    let lastVfId;
    let params, arr = [];
    while (target != Doc_Body) {
        if (domEvent.cancelBubble ||
            (ignore = target['d']) && ignore[type]) {
            break;
        }
        arr.push(target);
        eventInfos = Body_FindVframeInfo(target, type);
        if (eventInfos.length) {
            arr = [];
            for (let { v, r, n, i } of eventInfos) {
                if (!v && DEBUG) {
                    return Mx_Cfg.error(Error(`bad ${type}:${r}`));
                }
                if (lastVfId != v) {
                    if (lastVfId && domEvent.cancelBubble) {
                        break;
                    }
                    lastVfId = v;
                }
                vframe = Vframe_Vframes[v];
                view = vframe && vframe['a'];
                if (view) {
                    if (view['h']) {
                        eventName = n + Spliter + type;
                        fn = view[eventName];
                        if (fn) {
                            domEvent.eventTarget = target;
                            params = i ? ParseExpr(i, view['a']) : {};
                            domEvent[Params] = params;
                            ToTry(fn, domEvent, view);
                        }
                        if (DEBUG) {
                            if (!fn) { //检测为什么找不到处理函数
                                if (eventName[0] == '\u001f') {
                                    console.error('use view.wrapEvent wrap your html');
                                } else {
                                    console.error('can not find event processor:' + n + '<' + type + '> from view:' + vframe.path);
                                }
                            }
                        }
                    }
                } else {//如果处于删除中的事件触发，则停止事件的传播
                    domEvent.stopPropagation();
                }
                if (DEBUG) {
                    if (!view && view !== 0) { //销毁
                        console.error('can not find vframe:' + v);
                    }
                }
            }
        }
        target = target.parentNode || Doc_Body;
    }
    for (lastVfId of arr) {
        ignore = lastVfId['d'] || (lastVfId['d'] = {});
        ignore[type] = 1;
    }
};
let Body_DOMEventBind = (type, searchSelector, remove) => {
    let counter = Body_RootEvents[type] | 0;
    let offset = (remove ? -1 : 1),
        fn = remove ? RemoveEventListener : AddEventListener;
    if (!counter || remove === counter) { // remove=1  counter=1
        fn(Doc_Body, type, Body_DOMEventProcessor);
    }
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
    '&': 'amp',
    '<': 'lt',
    '>': 'gt',
    '"': '#34',
    '\'': '#39',
    '\`': '#96'
};
let Updater_ER = /[&<>"'\`]/g;
let Updater_Safeguard = v => Empty + (v == Null ? Empty : v);
let Updater_EncodeReplacer = m => `&${Updater_EM[m]};`;
let Updater_Encode = v => Updater_Safeguard(v).replace(Updater_ER, Updater_EncodeReplacer);

let Updater_UM = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A'
};
let Updater_URIReplacer = m => Updater_UM[m];
let Updater_URIReg = /[!')(*]/g;
let Updater_EncodeURI = v => Encode(Updater_Safeguard(v)).replace(Updater_URIReg, Updater_URIReplacer);

let Updater_QR = /[\\'"]/g;
let Updater_EncodeQ = v => Updater_Safeguard(v).replace(Updater_QR, '\\$&');

let Updater_Ref = ($$, v, k) => {
    if (!$$.has(v)) {
        k = Spliter + $$.size;
        $$.set(v, k);
        $$.set(k, v);
    }
    return $$.get(v);
};
let Updater_Digest = (view, digesting) => {
    let keys = view['j'],
        changed = view['k'],
        vf = view.owner,
        viewId = view.id,
        ref = { 'a': [] },
        tmpl, vdom, data = view['e'],
        refData = view['a'],
        redigest = trigger => {
            if (digesting['a'] < digesting.length) {
                Updater_Digest(view, digesting);
            } else {
                ref = digesting.slice();
                digesting['a'] = digesting.length = 0;
                if (trigger) {
                    view.fire('domready');
                }
                ToTry(ref);
            }
        };
    digesting['a'] = digesting.length;
    view['k'] = 0;
    view['j'] = {};
    if (changed && view['d'] > 0 && (tmpl = view.tmpl)) {
        view.fire('dompatch');
        vdom = tmpl(data, Q_Create, viewId, Updater_Safeguard, Updater_EncodeURI, refData, Updater_Ref, Updater_EncodeQ, IsArray);
        if (DEBUG) {
            Updater_CheckInput(view, vdom['a']);
        }
        V_SetChildNodes(view.root, view['l'], vdom, ref, vf, keys);
        view['l'] = vdom;
        /*
            在dom diff patch时，如果已渲染的vframe有变化，则会在vom tree上先派发created事件，同时传递inner标志，vom tree处理alter事件派发状态，未进入created事件派发状态

            patch完成后，需要设置vframe hold fire created事件，因为带有assign方法的view在调用render后，vom tree处于就绪状态，此时会导致提前派发created事件，应该hold，统一在endUpdate中派发

            有可能不需要endUpdate，所以hold fire要视情况而定
        */
        //vf['i'] = tmpl = ref['b'] || !view['h'];
        for (vdom of ref['a']) {
            vdom['g']();
        }
        if (tmpl) {
            view.endUpdate();
        }
        redigest(1);
    } else {
        redigest();
    }
};
    let Q_TEXTAREA = 'textarea';
let Q_Create = (tag, props, children, unary) => {
    //html=tag+to_array(attrs)+children.html
    let token;
    if (tag) {
        props = props || {};
        let compareKey = Empty,
            hasMxv,
            prop, value, c,
            reused = {},
            outerHTML = '<' + tag,
            attrs,
            innerHTML = Empty,
            newChildren = [],
            prevNode;
        if (children) {
            for (c of children) {
                value = c['a'];
                if (c['b'] == V_TEXT_NODE) {
                    value = value ? Updater_Encode(value) : ' ';//无值的文本节点我们用一个空格占位，这样在innerHTML的时候才会有文本节点
                }
                innerHTML += value;
                //merge text node
                if (prevNode &&
                    c['b'] == V_TEXT_NODE &&
                    prevNode['b'] == V_TEXT_NODE) {
                    //prevNode['c'] += c['c'];
                    prevNode['a'] += c['a'];
                } else {
                    //reused node if new node key equal old node key
                    if (c['d']) {
                        reused[c['d']] = (reused[c['d']] || 0) + 1;
                    }
                    //force diff children
                    if (c['e']) {
                        hasMxv = 1;
                    }
                    prevNode = c;
                    newChildren.push(c);
                }
            }
        }
        for (prop in props) {
            value = props[prop];
            //布尔值
            if (value === false ||
                value == Null) {
                delete props[prop];
                continue;
            } else if (value === true) {
                props[prop] = value = Empty;
            }
            if (prop == 'id') {//如果有id优先使用
                compareKey = value;
            } else if (prop == MX_View &&
                value &&
                !compareKey) {
                //否则如果是组件,则使用组件的路径做为key
                compareKey = ParseUri(value)[Path];
            } else if (prop == Tag_Static_Key) {
                if (!compareKey) {
                    compareKey = value;
                }
                //newChildren = Empty_Array;
            } else if (prop == Tag_View_Params_Key) {
                hasMxv = 1;
            }
            if (prop == Value &&
                tag == Q_TEXTAREA) {
                innerHTML = value;
            } else if (!Has(V_SKIP_PROPS, prop)) {
                outerHTML += ` ${prop}="${Updater_Encode(value)}"`;
            }
        }
        attrs = outerHTML;
        outerHTML += unary ? '/>' : `>${innerHTML}</${tag}>`;
        token = {
            'a': outerHTML,
            'c': innerHTML,
            'd': compareKey,
            'b': tag,
            'e': hasMxv || Has(V_SPECIAL_PROPS, tag),
            'f': attrs,
            'g': props,
            'h': newChildren,
            'i': reused,
            'j': unary
        };
    } else {
        token = {
            'b': props ? Spliter : V_TEXT_NODE,
            'a': children + Empty
        };
    }
    return token;
};
    let V_SPECIAL_PROPS = {
    input: {
        [Value]: 1,
        checked: 1
    },
    [Q_TEXTAREA]: {
        [Value]: 1
    },
    option: {
        selected: 1
    }
};

let V_SKIP_PROPS = {
    [Tag_Static_Key]: 1,
    [Tag_View_Params_Key]: 1
};

if (DEBUG) {
    var CheckNodes = (realNodes, vNodes) => {
        let index = 0;
        if (vNodes.length != 1 ||
            vNodes[0]['b'] != Spliter) {
            for (let e of realNodes) {
                if (e.nodeName.toLowerCase() != vNodes[index]['b'].toLowerCase()) {
                    console.error('real not match virtual!');
                }
                index++;
            }
        }
    };
}

let V_TEXT_NODE = Counter;
if (DEBUG) {
    V_TEXT_NODE = '#text';
}
let V_W3C = 'http://www.w3.org/';
let V_NSMap = {
    svg: `${V_W3C}2000/svg`,
    math: `${V_W3C}1998/Math/MathML`
};
let V_SetAttributes = (oldNode, lastVDOM, newVDOM, common) => {
    let key, value,
        changed = 0,
        specials = V_SPECIAL_PROPS[lastVDOM['b']],
        nMap = newVDOM['g'],
        oMap = lastVDOM['g'];
    if (common) {
        if (lastVDOM) {
            for (key in oMap) {
                if (!Has(specials, key) &&
                    !Has(nMap, key)) {//如果旧有新木有
                    changed = 1;
                    oldNode.removeAttribute(key);
                }
            }
        }
        for (key in nMap) {
            if (!Has(specials, key) &&
                !Has(V_SKIP_PROPS, key)) {
                value = nMap[key];
                //旧值与新值不相等
                if (!lastVDOM || oMap[key] !== value) {
                    changed = 1;
                    oldNode.setAttribute(key, value);
                }
            }
        }
    }
    for (key in specials) {
        value = Has(nMap, key) ? key != Value || nMap[key] : key == Value && Empty;
        if (oldNode[key] != value) {
            changed = 1;
            oldNode[key] = value;
        }
    }
    if (changed) {
        delete oldNode['d'];
    }
    return changed;
};

let V_CreateNode = (vnode, owner, ref) => {
    let tag = vnode['b'], c;
    if (tag == V_TEXT_NODE) {
        c = Doc_Document.createTextNode(vnode['a']);
    } else {
        c = Doc_Document.createElementNS(V_NSMap[tag] || owner.namespaceURI, tag);
        if (V_SetAttributes(c, 0, vnode, 1)) {
            ref['b'] = 1;
        }
        SetInnerHTML(c, vnode['c']);
    }
    return c;
};
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, keys) => {
    if (lastVDOM) {//view首次初始化，通过innerHTML快速更新
        if (lastVDOM['e'] ||
            lastVDOM['c'] != newVDOM['c']) {
            let i, oi,
                oldChildren = lastVDOM['h'],
                newChildren = newVDOM['h'], oc, nc,
                oldCount = oldChildren.length,
                newCount = newChildren.length,
                reused = newVDOM['i'],
                nodes = realNode.childNodes, compareKey,
                keyedNodes = {},
                oldVIndex = 0,
                realNodeStep;
            for (i = oldCount; i--;) {
                oc = oldChildren[i];
                compareKey = oc['d'];
                if (compareKey) {
                    compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
                    compareKey.push(nodes[i]);
                }
            }
            if (DEBUG && lastVDOM['b'] != Q_TEXTAREA) {
                CheckNodes(nodes, oldChildren);
            }
            for (i = 0; i < newCount; i++) {
                nc = newChildren[i];
                oc = oldChildren[oldVIndex++];
                compareKey = keyedNodes[nc['d']];
                if (compareKey && (compareKey = compareKey.pop())) {
                    if (compareKey != nodes[i]) {
                        for (oi = oldVIndex, realNodeStep = 1;
                            oi < oldCount;
                            oi++ , realNodeStep++) {
                            oc = oldChildren[oi];
                            if (oc && nodes[i + realNodeStep] == compareKey) {
                                oldChildren.splice(oi, 1);
                                oldVIndex--;
                                break;
                            }
                        }
                        realNode.insertBefore(compareKey, nodes[i]);
                    }
                    if (reused[oc['d']]) {
                        reused[oc['d']]--;
                    }
                    V_SetNode(compareKey, realNode, oc, nc, ref, vframe, keys);
                } else if (oc) {//有旧节点，则更新
                    if (keyedNodes[oc['d']] &&
                        reused[oc['d']]) {
                        oldCount++;
                        ref['b'] = 1;
                        realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                        oldVIndex--;
                    } else {
                        V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, keys);
                    }
                } else {//添加新的节点
                    if (nc['b'] == Spliter) {
                        SetInnerHTML(realNode, nc['a']);
                    } else {
                        realNode.appendChild(V_CreateNode(nc, realNode, ref));
                    }
                    ref['b'] = 1;
                }
            }
            for (i = newCount; i < oldCount; i++) {
                oi = nodes[newCount];//删除多余的旧节点
                if (oi.nodeType == 1) {
                    vframe.unmountZone(oi);
                }
                if (DEBUG) {
                    if (!oi.parentNode) {
                        console.error('Avoid remove node on view.destroy in digesting');
                    }
                }
                realNode.removeChild(oi);
            }
        }
    } else {
        ref['b'] = 1;
        SetInnerHTML(realNode, newVDOM['c']);
    }
};
let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, keys) => {
    if (DEBUG) {
        if (lastVDOM['b'] != Spliter &&
            newVDOM['b'] != Spliter) {
            if (oldParent.nodeName == 'TEMPLATE') {
                console.error('unsupport template tag');
            }
            if (
                (realNode.nodeName == '#text' &&
                    lastVDOM['b'] != '#text') ||
                (realNode.nodeName != '#text' &&
                    realNode.nodeName.toLowerCase() != lastVDOM['b'].toLowerCase())) {
                console.error('Your code is not match the DOM tree generated by the browser. near:' + lastVDOM['c'] + '. Is that you lost some tags or modified the DOM tree?');
            }
        }
    }
    let lastAMap = lastVDOM['g'],
        newAMap = newVDOM['g'],
        lastNodeTag = lastVDOM['b'];
    if (lastVDOM['e'] ||
        lastVDOM['a'] != newVDOM['a']) {
        if (lastNodeTag == newVDOM['b']) {
            if (lastNodeTag == V_TEXT_NODE) {
                ref['b'] = 1;
                realNode.nodeValue = newVDOM['a'];
            } else if (lastNodeTag == Spliter) {
                ref['b'] = 1;
                SetInnerHTML(oldParent, newVDOM['a']);
            } else if (!lastAMap[Tag_Static_Key] ||
                lastAMap[Tag_Static_Key] != newAMap[Tag_Static_Key]) {
                let newMxView = newAMap[MX_View],
                    newHTML = newVDOM['c'],
                    commonAttrs = lastVDOM['f'] != newVDOM['f'],
                    updateAttribute = Has(V_SPECIAL_PROPS, lastNodeTag) || commonAttrs,
                    updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[realNode['b']],
                    assign,
                    view,
                    uri = newMxView && ParseUri(newMxView),
                    params,
                    htmlChanged,
                    paramsChanged;
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
                    updateAttribute = V_SetAttributes(realNode, lastVDOM, newVDOM, commonAttrs);
                    if (updateAttribute) {
                        ref['b'] = 1;
                    }
                }
                //旧节点有view,新节点有view,且是同类型的view
                if (newMxView && oldVf &&
                    oldVf['g'] == uri[Path] &&
                    (view = oldVf['a'])) {
                    htmlChanged = newHTML != lastVDOM['c'];
                    paramsChanged = newMxView != oldVf[Path];
                    assign = lastAMap[Tag_View_Params_Key];
                    if (!htmlChanged && !paramsChanged && assign) {
                        params = assign.split(Comma);
                        for (assign of params) {
                            if (assign == Hash_Key || Has(keys, assign)) {
                                paramsChanged = 1;
                                break;
                            }
                        }
                    }
                    if (paramsChanged || htmlChanged || updateAttribute) {
                        assign = view['h'] && view['m'];
                        //如果有assign方法,且有参数或html变化
                        if (assign) {
                            params = uri[Params];
                            //处理引用赋值
                            Vframe_TranslateQuery(oldVf.pId, newMxView, params);
                            oldVf[Path] = newMxView;//update ref
                            //如果需要更新，则进行更新的操作
                            // uri = {
                            //     //node: newVDOM,//['h'],
                            //     //html: newHTML,
                            //     //mxv: hasMXV,
                            //     node: realNode,
                            //     attr: updateAttribute,
                            //     deep: !view.tmpl,
                            //     inner: htmlChanged,
                            //     query: paramsChanged
                            // };
                            //updateAttribute = 1;
                            if (ToTry(assign, params,/*[params, uri],*/ view)) {
                                ref['a'].push(view);
                            }
                            //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                            //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                            updateChildren = !view.tmpl;//uri.deep;
                        } else {
                            unmountOld = 1;
                            updateChildren = 1;
                        }
                    }// else {
                    // updateAttribute = 1;
                    //}
                } else {
                    updateChildren = 1;
                    unmountOld = oldVf;
                }
                if (unmountOld) {
                    ref['b'] = 1;
                    oldVf.unmountVframe(0, 1);
                }
                // Update all children (and subchildren).
                //自闭合标签不再检测子节点
                if (updateChildren &&
                    !newVDOM['j']) {
                    V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, keys);
                }
            }
        } else {
            if (lastVDOM['b'] == Spliter) {
                SetInnerHTML(oldParent, newVDOM['a']);
            } else {
                vframe.unmountZone(realNode);
                oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
            }
            ref['b'] = 1;
        }
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
    //like 'login<click>' or '$<click>' or '$win<scroll>' or '$win<scroll>&passive,capture'
let View_EvtMethodReg = /^(\$?)([^<]*)<([^>]+)>(?:&(.+))?$/;
let processMixinsSameEvent = (exist, additional, temp) => {
    if (exist['a']) {
        temp = exist;
    } else {
        temp = function (e) {
            ToTry(temp['a'], e, this);
        };
        temp['a'] = [exist];
        temp['b'] = 1;
    }
    temp['a'] = temp['a'].concat(additional['a'] || additional);
    return temp;
};
let View_DestroyAllResources = (me, lastly) => {
    let cache = me['c'], //reources
        p, c;
    for (p in cache) {
        c = cache[p];
        if (lastly || c['a']) { //destroy
            View_DestroyResource(cache, p, 1);
        }
    }
};
let View_DestroyResource = (cache, key, callDestroy, old) => {
    let o = cache[key],
        fn, res;
    if (o && o != old) {
        //let processed=false;
        res = o['b']; //entity
        fn = res.destroy;
        if (fn && callDestroy) {
            ToTry(fn, Empty_Array, res);
        }
        delete cache[key];
    }
    return res;
};
let View_WrapMethod = (prop, fName, short, fn, me) => {
    fn = prop[fName];
    prop[fName] = prop[short] = function (...args) {
        me = this;
        if (me['d'] > 0) { //signature
            me['d']++;
            me.fire('rendercall');
            View_DestroyAllResources(me);
            ToTry(fn, args, me);
        }
    };
};
let View_DelegateEvents = (me, destroy) => {
    let e, { 'n': eventsObject,
        'i': selectorObject,
        'o': eventsList, id } = me; //eventsObject
    for (e in eventsObject) {
        Body_DOMEventBind(e, selectorObject[
            e], destroy);
    }
    eventsObject = destroy ? RemoveEventListener : AddEventListener;
    for (e of eventsList) {
        eventsObject(e['a'], e['b'], e['c'], id, e['d'], me);
    }
};
let View_Globals = {
    win: Doc_Window,
    doc: Doc_Document
};
let View_MergeMixins = (mixins, proto, ctors) => {
    let temp = {}, p, node, fn, exist;
    for (node of mixins) {
        for (p in node) {
            fn = node[p];
            exist = temp[p];
            if (p == 'ctor') {
                ctors.push(fn);
                continue;
            } else if (View_EvtMethodReg.test(p)) {
                if (exist) {
                    fn = processMixinsSameEvent(exist, fn);
                } else {
                    fn['b'] = 1;
                }
            } else if (DEBUG && exist && p != 'extend' && p != Spliter) { //只在开发中提示
                Mx_Cfg.error(Error('merge duplicate:' + p));
            }
            temp[p] = fn;
        }
    }
    for (p in temp) {
        if (!Has(proto, p)) {
            proto[p] = temp[p];
        }
    }
};
function merge(...args) {
    let me = this, _ = me['a'] || (me['a'] = []);
    View_MergeMixins(args, me[Prototype], _);
    return me;
}

function extend(props, statics) {
    let me = this;
    props = props || {};
    let ctor = props.ctor;
    let ctors = [];
    if (ctor) ctors.push(ctor);
    function NView(viewId, rootNode, ownerVf, initParams, mixinCtors, cs, z, concatCtors) {
        me.call(z = this, viewId, rootNode, ownerVf, initParams, mixinCtors);
        cs = NView['a'];

        if (cs) ToTry(cs, initParams, z);
        concatCtors = ctors.concat(mixinCtors);
        if (concatCtors.length) {
            ToTry(concatCtors, initParams, z);
        }
    }
    NView.merge = merge;
    NView.extend = extend;
    return Extend(NView, me, props, statics);
}
/**
 * 预处理view
 * @param  {View} oView view子类
 * @param  {Vom} vom vom
 */
let View_Prepare = oView => {
    if (!oView[Spliter]) { //只处理一次
        oView[Spliter] = [];
        let prop = oView[Prototype],
            currentFn, matches, selectorOrCallback, events, eventsObject = {},
            eventsList = [],
            selectorObject = {},
            node, isSelector, p, item, mask, mod, modifiers;

        matches = prop.mixins;
        if (matches) {
            View_MergeMixins(matches, prop, oView[Spliter]);
        }
        for (p in prop) {
            currentFn = prop[p];
            matches = p.match(View_EvtMethodReg);
            if (matches) {
                [, isSelector, selectorOrCallback, events, modifiers] = matches;
                mod = {};
                if (modifiers) {
                    modifiers = modifiers.split(Comma);
                    for (item of modifiers) {
                        mod[item] = true;
                    }
                }
                events = events.split(Comma);
                for (item of events) {
                    node = View_Globals[selectorOrCallback];
                    mask = 1;
                    if (isSelector) {
                        if (node) {
                            eventsList.push({
                                'c': currentFn,
                                'a': node,
                                'b': item,
                                'd': mod
                            });
                            continue;
                        }
                        mask = 2;
                        node = selectorObject[item];
                        if (!node) {
                            node = selectorObject[item] = [];
                        }
                        if (!node[selectorOrCallback]) {
                            node[selectorOrCallback] = 1;
                            node.push(selectorOrCallback);
                        }
                    }
                    eventsObject[item] = eventsObject[item] | mask;
                    item = selectorOrCallback + Spliter + item;
                    node = prop[item];
                    //for in 就近遍历，如果有则忽略
                    if (!node) { //未设置过
                        prop[item] = currentFn;
                    } else if (node['b']) { //现有的方法是mixins上的
                        if (currentFn['b']) { //2者都是mixins上的事件，则合并
                            prop[item] = processMixinsSameEvent(currentFn, node);
                        } else if (Has(prop, p)) { //currentFn方法不是mixin上的，也不是继承来的，在当前view上，优先级最高
                            prop[item] = currentFn;
                        }
                    }
                }
            }
        }
        //console.log(prop);
        View_WrapMethod(prop, 'render', 'g');
        prop['n'] = eventsObject;
        prop['o'] = eventsList;
        prop['i'] = selectorObject;
        prop['m'] = prop.assign;
    }
    return oView[Spliter];
};

/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @example
 * // 关于事件:
 * // html写法：
 *
 * //  &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 * //  &lt;a href="http://etao.com" mx-click="test({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 * // js写法：
 *
 *     'test&lt;click&gt;':function(e){
 *          e.preventDefault();
 *          //e.current 处理事件的dom节点(即带有mx-click属性的节点)
 *          //e.target 触发事件的dom节点(即鼠标点中的节点，在current里包含其它节点时，current与target有可能不一样)
 *          //e.params  传递的参数
 *          //e.params.com,e.params.id,e.params.name
 *      },
 *      'test&lt;mousedown&gt;':function(e){
 *
 *       }
 *
 *  //上述示例对test方法标注了click与mousedown事件，也可以合写成：
 *  'test&lt;click,mousedown&gt;':function(e){
 *      alert(e.type);//可通过type识别是哪种事件类型
 *  }
 */


function View(id, root, owner, ops, me) {
    me = this;
    me.root = root;
    me.owner = owner;
    me.id = id;
    
    me['c'] = {};
    me['d'] = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    me['k'] = 1;
    me['e'] = {
        id
    };
    me['a'] = new Map();
    me['f'] = [];
    me['j'] = {};
    id = View['a'];
    if (id) ToTry(id, ops, me);
}
Assign(View, {
    /**
     * @lends View
     */
    /**
     * 扩展View
     * @param  {Object} props 扩展到原型上的方法
     * @example
     * define('app/tview',function(require){
     *     let Magix = require('magix');
     *     Magix.View.merge({
     *         ctor:function(){
     *             this.$attr='test';
     *         },
     *         test:function(){
     *             alert(this.$attr);
     *         }
     *     });
     * });
     * //加入Magix.config的exts中
     *
     *  Magix.config({
     *      //...
     *      exts:['app/tview']
     *
     *  });
     *
     * //这样完成后，所有的view对象都会有一个$attr属性和test方法
     * //当然上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
     * //同时当项目进行中发现所有view要实现某个功能时，该方式比继承更快捷有效
     *
     *
     */
    merge,
    /**
     * 继承
     * @param  {Object} [props] 原型链上的方法或属性对象
     * @param {Function} [props.ctor] 类似constructor，但不是constructor，当我们继承时，你无需显示调用上一层级的ctor方法，magix会自动帮你调用
     * @param {Array} [props.mixins] mix到当前原型链上的方法对象，该对象可以有一个ctor方法用于初始化
     * @param  {Object} [statics] 静态对象或方法
     * @example
     * let Magix = require('magix');
     * let Sortable = {
     *     ctor: function() {
     *         console.log('sortable ctor');
     *         //this==当前mix Sortable的view对象
     *         this.on('destroy', function() {
     *             console.log('dispose')
     *         });
     *     },
     *     sort: function() {
     *         console.log('sort');
     *     }
     * };
     * module.exports = Magix.View.extend({
     *     mixins: [Sortable],
     *     ctor: function() {
     *         console.log('view ctor');
     *     },
     *     render: function() {
     *         this.sort();
     *     }
     * });
     */
    extend
});
Assign(View[Prototype], MxEvent, {
    /**
     * @lends View#
     */
    /**
     * 初始化调用的方法
     * @beta
     * @module viewInit
     * @param {Object} extra 外部传递的数据对象
     */
    init: Noop,
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: Noop,
    /*
     * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
     * @function
     * @param {String} html 处理的代码片断
     * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
     * @return {String} 处理后的字符串
     * @example
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one(HashKey+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         let tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
     *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
     *         tmpl=this.wrapEvent(tmpl);
     *         S.one(HashKey+e.currentId).append(tmpl);
     *     }
     * });
     */
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate(node, me) {
        me = this;
        if (me['d'] > 0 && me['h']) {
            me.owner.unmountZone(node);
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate(node, me, o, f) {
        me = this;
        if (me['d'] > 0) {
            f = me['h'];
            me['h'] = 1;
            o = me.owner;
            o.mountZone(node);
            if (!f) {
                Timeout(me.wrapAsync(Vframe_RunInvokes), 0, o);
            }
        }
    },
    /**
     * 包装异步回调
     * @param  {Function} fn 异步回调的function
     * @return {Function}
     * @example
     * render:function(){
     *     setTimeout(this.wrapAsync(function(){
     *         //codes
     *     }),50000);
     * }
     * // 为什么要包装一次？
     * // 在单页应用的情况下，可能异步回调执行时，当前view已经被销毁。
     * // 比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，
     * // 则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。
     * // (该示例中最好的做法是在view销毁时清除setTimeout，
     * // 但有时候你很难控制回调的执行，比如JSONP，所以最好包装一次)
     */
    wrapAsync(fn, context) {
        let me = this;
        let sign = me['d'];
        return (...a) => {
            if (sign > 0 && sign == me['d']) {
                return fn.apply(context || me, a);
            }
        };
    },
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} key 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [destroyWhenCalleRender] 调用render方法时是否销毁托管的资源
     * @return {Object} 返回托管的资源
     * @beta
     * @module resource
     * @example
     * View.extend({
     *     render: function(){
     *         let me = this;
     *         let dropdown = new Dropdown();
     *
     *         me.capture('dropdown',dropdown,true);
     *     },
     *     getTest: function(){
     *         let dd = me.capture('dropdown');
     *         console.log(dd);
     *     }
     * });
     */
    capture(key, res, destroyWhenCallRender, cache) {
        cache = this['c'];
        if (res) {
            View_DestroyResource(cache, key, 1, res);
            cache[key] = {
                'b': res,
                'a': destroyWhenCallRender
            };
            //service托管检查
            if (DEBUG && res && (res.id + Empty).indexOf('\x1es') === 0) {
                res.__captured = 1;
                if (!destroyWhenCallRender) {
                    console.warn('beware! May be you should set destroyWhenCallRender = true');
                }
            }
        } else {
            cache = cache[key];
            res = cache && cache['b'];
        }
        return res;
    },
    /**
     * 释放管理的资源
     * @param  {String} key 托管时的key
     * @param  {Boolean} [destroy] 是否销毁资源
     * @return {Object} 返回托管的资源，无论是否销毁
     * @beta
     * @module resource
     */
    release(key, destroy) {
        return View_DestroyResource(this['c'], key, destroy);
    },
    
    /**
     * 设置view的html内容
     * @param {String} id 更新节点的id
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    /*
        Q:为什么删除setHTML?
        A:统一使用updater更新界面。
        关于api的分级，高层api更内聚，一个api完成很多功能。方便开发者，但不灵活。
        底层api职责更单一，一个api只完成一个功能，灵活，但不方便开发者
        更新界面来讲，updater是一个高层api，但是有些功能却无法完成，如把view当成壳子或容器渲染第三方的组件，组件什么时间加载完成、渲染、更新了dom、如何通知magix等，这些问题在updater中是无解的，而setHTML这个api又不够底层，同样也无法完成一些功能，所以这个api食之无味，故删除
     */
    /**
     * 获取放入的数据
     * @param  {String} [key] key
     * @return {Object} 返回对应的数据，当key未传递时，返回整个数据对象
     * @example
     * render: function() {
     *     this.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.get('a'));
     * }
     */
    get(key, result) {
        result = this['e'];
        if (key) {
            result = result[key];
        }
        return result;
    },
    /**
     * 通过path获取值
     * @param  {String} path 点分割的路径
     * @return {Object}
     */
    /*gain: function (path) {
        let result = this.$d;
        let ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },*/
    /**
     * 获取放入的数据
     * @param  {Object} obj 待放入的数据
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.get('a'));
     * }
     */
    set(obj, unchanged) {
        let me = this;
        me['k'] = UpdateData(obj, me['e'], me['j'], unchanged) || me['k'];
        return me;
    },
    /**
     * 检测数据变化，更新界面，放入数据后需要显式调用该方法才可以把数据更新到界面
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     }).digest();
     * }
     */
    digest(data, unchanged, resolve) {
        let me = this.set(data, unchanged),
            digesting = me['f'];
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
        if (resolve) {
            digesting.push(resolve);
        }
        if (!digesting['a']) {
            Updater_Digest(me, digesting);
        } else if (DEBUG) {
            console.warn('Avoid redigest while updater is digesting');
        }
    },
    /**
     * 获取当前数据状态的快照，配合altered方法可获得数据是否有变化
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    snapshot() {
        let me = this;
        me['p'] = JSON_Stringify(me['e']);
        return me;
    },
    /**
     * 检测数据是否有变动
     * @return {Boolean} 是否变动
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    altered() {
        let me = this;
        if (me['p']) {
            return me['p'] != JSON_Stringify(me['e']);
        }
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} data 源对象
     */
    translate(data) {
        return TranslateData(this['e'], data);
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} origin 源字符串
     */
    parse(origin) {
        return ParseExpr(origin, this['a']);
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
/**
 * Bag类
 * @name Bag
 * @beta
 * @module service
 * @constructor
 * @property {String} id bag唯一标识
 */

function Bag() {
    this.id = GUID('b');
    this['a'] = {};
}
Assign(Bag[Prototype], {
    /**
     * @lends Bag#
     */
    /**
     * 获取属性
     * @param {String} [key] 要获取数据的key
     * @param {Object} [dValue] 当根据key取到的值为falsy时，使用默认值替代，防止代码出错
     * @return {Object}
     * @example
     * new Serice().one({
     *     name:'Test'
     * },function(error,bag){
     *     let obj=bag.get();//获取所有数据
     *
     *     let list=bag.get('list',[]);//获取list数据，如果不存在list则使用空数组
     *
     *     let count=bag.get('data.info.count',0);//获取data下面info下count的值，您无须关心data下是否有info属性
     *     console.log(list);
     * });
     */
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
        let attrs = me['a'];
        if (key) {
            let tks = IsArray(key) ? key.slice() : (key + Empty).split('.'),
                tk;
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
        if (DEBUG && me['b'] && me['b']['a']) { //缓存中的接口不让修改数据
            attrs = Safeguard(attrs);
        }
        return attrs;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set(key, val) {
        if (!IsObject(key)) {
            key = { [key]: val };
        }
        Assign(this['a'], key);
    }
});
let Service_FetchFlags_ONE = 1;
let Service_FetchFlags_ALL = 2;
let Service_Cache_Done = (bagCacheKeys, cacheKey, fns) => error => {
    fns = bagCacheKeys[cacheKey];
    if (fns) {
        delete bagCacheKeys[cacheKey]; //先删除掉信息
        ToTry(fns, error, fns['a']); //执行所有的回调
    }
};
// function Service_CacheDone(cacheKey, err, fns) {
//     fns = this[cacheKey]; //取出当前的缓存信息
//     if (fns) {
//         delete this[cacheKey]; //先删除掉信息
//         ToTry(fns, err, fns['a']); //执行所有的回调
//     }
// }
let Service_Task = (done, host, service, total, flag, bagCache) => {
    let doneArr = [];
    let errorArgs = Null;
    let currentDoneCount = 0;

    return function (idx, error) {
        currentDoneCount++; //当前完成加1.
        let newBag;
        let bag = this;
        let mm = bag['b'];
        let cacheKey = mm['a'], temp;
        doneArr[idx + 1] = bag; //完成的bag
        if (error) { //出错
            errorArgs = error;
            //errorArgs[idx] = err; //记录相应下标的错误信息
            //Assign(errorArgs, err);
            newBag = 1; //标记当前是一个新完成的bag,尽管出错了
        } else if (!bagCache.has(cacheKey)) { //如果缓存对象中不存在，则处理。注意在开始请求时，缓存与非缓存的都会调用当前函数，所以需要在该函数内部做判断处理
            if (cacheKey) { //需要缓存
                bagCache.set(cacheKey, bag); //缓存
            }
            //bag.set(data);
            mm['b'] = Date_Now(); //记录当前完成的时间
            temp = mm['c'];
            if (temp) { //有after
                ToTry(temp, bag, bag);
            }
            newBag = 1;
        }
        if (!service['a']) { //service['a'] 当前请求被销毁
            let finish = currentDoneCount == total;
            if (finish) {
                service['b'] = 0;
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
/**
 * 获取attrs，该用缓存的用缓存，该发起请求的请求
 * @private
 * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
 * @param {Function} done   完成时的回调
 * @param {Integer} flag   获取哪种类型的attrs
 * @param {Boolean} save 是否是保存的动作
 * @return {Service}
 */
let Service_Send = (me, attrs, done, flag, save) => {
    if (me['a']) return me; //如果已销毁，返回
    if (me['b']) { //繁忙，后续请求入队
        return me.enqueue(Service_Send.bind(me, me, attrs, done, flag, save));
    }
    me['b'] = 1; //标志繁忙
    if (!IsArray(attrs)) {
        attrs = [attrs];
    }
    let host = me.constructor,
        requestCount = 0;
    //let bagCache = host['c']; //存放bag的Cache对象
    let bagCacheKeys = host['d']; //可缓存的bag key
    let removeComplete = Service_Task(done, host, me, attrs.length, flag, host['c']);
    for (let bag of attrs) {
        if (bag) {
            let [bagEntity, update] = host.get(bag, save); //获取bag信息
            let cacheKey = bagEntity['b']['a']; //从实体上获取缓存key

            let complete = removeComplete.bind(bagEntity, requestCount++);
            let cacheList;

            if (cacheKey && bagCacheKeys[cacheKey]) { //如果需要缓存，并且请求已发出
                bagCacheKeys[cacheKey].push(complete); //放到队列中
            } else if (update) { //需要更新
                if (cacheKey) { //需要缓存
                    cacheList = [complete];
                    cacheList['a'] = bagEntity;
                    bagCacheKeys[cacheKey] = cacheList;
                    complete = Service_Cache_Done(bagCacheKeys, cacheKey); //替换回调，详见Service_CacheDone
                }
                host['e'](bagEntity, complete);
            } else { //不需要更新时，直接回调
                complete();
            }
        }
    }
    return me;
};
/**
 * 接口请求服务类
 * @name Service
 * @constructor
 * @beta
 * @module service
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @example
 * let S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data)//设置数据
 *             callback();//通知内部完成数据请求
 *         },
 *         error:function(msg){
 *             callback(msg);//出错
 *         }
 *     })
 * });
 * // 添加接口
 * S.add({
 *     name:'test',
 *     url:'/test',
 *     cache:1000*60 //缓存一分钟
 * });
 * // 使用接口
 * let s=new S();
 * s.all('test',function(err,bag){
 *     console.log(err,bag);
 * });
 */
function Service() {
    let me = this;
    me.id = GUID('s');
    if (DEBUG) {
        me.id = GUID('\x1es');
        setTimeout(() => {
            if (!me.__captured) {
                console.warn('beware! You should use view.capture to connect Service and View');
            }
        }, 1000);
    }
    me['f'] = [];
}

Assign(Service[Prototype], {
    /**
     * @lends Service#
     */
    /**
     * 获取attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * new Service().all([{
     *     name:'Test1'
     * },{
     *     name:'Test2'
     * }],function(err,bag1,bag2){
     *     console.log(arguments);
     * });
     */
    all(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL);
    },
    /**
     * 保存attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 保存attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * // 同all,但与all不同的是，当指定接口缓存时，all方法会优先使用缓存，而save方法则每次都会发送请求到服务器，忽略掉缓存。同时save更语义化
     */
    save(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL, 1);
    },
    /**
     * 获取attrs，其中任意一个成功均立即回调，回调会被调用多次。注：当使用promise时，不存在该方法。
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @beta
     * @return {Service}
     * @example
     *  //代码片断：
     * let s = new Service().one([
     *     {name:'M1'},
     *     {name:'M2'},
     *     {name:'M3'}
     * ],function(err,bag){//m1,m2,m3，谁快先调用谁，且被调用三次
     *     if(err){
     *         alert(err.msg);
     *     }else{
     *         alert(bag.get('name'));
     *     }
     * });
     */
    one(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ONE);
    },
    /**
     * 前一个all,one或save任务做完后的下一个任务
     * @param  {Function} callback 当前面的任务完成后调用该回调
     * @return {Service}
     * @beta
     * @example
     * let r = new Service().all([
     *     {name:'M1'},
     *     {name:'M2'}
     * ],function(err,bag1,bag2){
     *     r.dequeue(['args1','args2']);
     * });
     * r.enqueue(function(args1,args2){
     *     alert([args1,args2]);
     * });
     */
    enqueue(callback) {
        let me = this;
        if (!me['a']) {
            me['f'].push(callback);
            me.dequeue(me['g']);
        }
        return me;
    },
    /**
     * 做下一个任务
     * @param {Array} preArgs 传递的参数
     * @beta
     * @example
     * let r = new Service();
     * r.all('Name',function(e,bag){
     *     r.dequeue([e,bag]);
     * });
     * r.enqueue(function(e,result){//result为m
     *     r.all('NextName',function(e,bag){
     *         r.dequeue([e,bag]);
     *     });
     * });
     *
     * r.enqueue(function(e,bag){//m===queue m;
     *     console.log(e,bag);
     *     r.dequeue([e,bag]);
     * });
     *
     * r.enqueue(function(e,bag){
     *     console.log(e,bag);
     * });
     *
     * //当出错时，e为出错的信息
     */
    dequeue(...a) {
        let me = this,
            one;
        if (!me['b'] && !me['a']) {
            me['b'] = 1;
            Timeout(() => { //前面的任务可能从缓存中来，执行很快
                me['b'] = 0;
                if (!me['a']) { //不清除setTimeout,但在回调中识别是否调用了destroy方法
                    one = me['f'].shift();
                    if (one) {
                        ToTry(one, me['g'] = a);
                    }
                }
            }, 0);
        }
    },
    /**
     * 销毁当前请求，不可以继续发起新请求，而且不再调用相应的回调
     */
    destroy(me) {
        me = this;
        me['a'] = 1; //只需要标记及清理即可，其它的不需要
        me['f'] = 0;
    }
    /**
     * 当Service发送请求前触发
     * @name Service.begin
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @example
     * let S = Magix.Service.extend({
     *     //codes
     * });
     *
     * S.on('begin',function(e){//监听所有的开始请求事件
     *     console.log(e);
     * });
     */
    /**
     * 当Service结束请求时触发(成功或失败均触发)
     * @name Service.end
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求失败时触发
     * @name Service.fail
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求成功时触发
     * @name Service.done
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     */
});

let Manager_DefaultCacheKey = (meta, attrs, arr) => {
    arr = [JSON_Stringify(attrs), JSON_Stringify(meta)];
    return arr.join(Spliter);
};
let Service_Manager = Assign({
    /**
     * @lends Service
     */
    /**
     * 添加元信息
     * @param {Object} attrs 信息属性
     */
    add(attrs) {
        let me = this;
        let metas = me['h'],
            bag;
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
    /**
     * 创建bag对象
     * @param {Object} attrs           bag描述信息对象
     * @return {Bag}
     */
    create(attrs) {
        let me = this;
        let meta = me.meta(attrs);
        let cache = (attrs.cache | 0) || meta.cache;
        let entity = new Bag();
        entity.set(meta);
        entity['b'] = {
            'c': meta.after,
            'a': cache && Manager_DefaultCacheKey(meta, attrs)
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
    /**
     * 获取bag注册时的元信息
     * @param  {String|Object} attrs 名称
     * @return {Object}
     * @example
     * let S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test'
     * });
     *
     * console.log(S.meta('test'),S.meta({name:'test'}));//这2种方式都可以拿到add时的对象信息
     */
    meta(attrs) {
        let me = this;
        let metas = me['h'];
        let name = attrs.name || attrs;
        let ma = metas[name];
        return ma || attrs;
    },
    /**
     * 获取bag对象，优先从缓存中获取
     * @param {Object} attrs           bag描述信息对象
     * @param {Boolean} createNew 是否是创建新的Bag对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
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
    /**
     * 从缓存中获取bag对象
     * @param  {Object} attrs
     * @return {Bag}
     * @example
     * let S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test',
     *     cache:1000*60
     * });
     *
     * S.cached('test');//尝试从缓存中获取bag对象
     */
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
            let requestCacheKeys = me['d'];
            let info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info['a'];
            } else { //缓存
                entity = bagCache.get(cacheKey);
                if (entity && Date_Now() - entity['b']['b'] > cache) {
                    bagCache.del(cacheKey);
                    entity = 0;
                }
            }
        }
        return entity;
    }
}, MxEvent);
/**
 * 继承
 * @lends Service
 * @param  {Function} sync 接口服务同步数据方法
 * @param  {Integer} [cacheMax] 最大缓存数，默认20
 * @param  {Integer} [cacheBuffer] 缓存缓冲区大小，默认5
 * @return {Function} 返回新的接口类
 * @example
 * let S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data);
 *             callback();
 *         },
 *         error:function(msg){
 *             callback({message:msg});
 *         }
 *     })
 * },10,2);//最大缓存10个接口数据，缓冲区2个
 */
Service.extend = (sync, cacheMax, cacheBuffer) => {
    function NService() {
        Service.call(this);
    }
    NService['e'] = sync;
    NService['c'] = new Cache(cacheMax, cacheBuffer);
    NService['d'] = {};
    NService['h'] = {};
    return Extend(NService, Service, Null, Service_Manager);
};
    Assign(Noop[Prototype], MxEvent);
Noop.extend = function extend(props, statics) {
    let me = this;
    let ctor = props && props.ctor;
    function X(...a) {
        let t = this;
        me.apply(t, a);
        if (ctor) ctor.apply(t, a);
    }
    X.extend = extend;
    return Extend(X, me, props, statics);
};
    
/**
 * Magix对象，提供常用方法
 * @name Magix
 * @namespace
 */
let Magix = {
    /**
     * @lends Magix
     */
    /**
     * 设置或获取配置信息
     * @param  {Object} cfg 初始化配置参数对象
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPath 当无法从地址栏取到path时的默认值。比如使用hash保存路由信息，而初始进入时并没有hash,此时defaultPath会起作用
     * @param {Object} cfg.routes path与view映射关系表
     * @param {String} cfg.unmatchView 在routes里找不到匹配时使用的view，比如显示404
     * @param {String} cfg.rootId 根view的id
     * @param {Function} cfg.error 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
     * @example
     * Magix.config({
     *      rootId:'J_app_main',
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPath:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     *
     *
     * let config = Magix.config();
     *
     * console.log(config.rootId);
     *
     * // 可以多次调用该方法，除内置的配置项外，您也可以缓存一些数据，如
     * Magix.config({
     *     user:'彳刂'
     * });
     *
     * console.log(Magix.config('user'));
     */
    config(cfg, r) {
        r = Mx_Cfg;
        if (cfg) {
            if (IsObject(cfg)) {
                r = Assign(r, cfg);
            } else {
                r = r[cfg];
            }
        }
        return r;
    },

    /**
     * 应用初始化入口
     * @function
     * @param {Object} [cfg] 配置信息对象,更多信息请参考Magix.config方法
     * @return {Object} 配置信息对象
     * @example
     * Magix.boot({
     *      rootId:'J_app_main'
     * });
     *
     */
    boot(cfg) {
        Assign(Mx_Cfg, cfg); //先放到配置信息中，供ini文件中使用
        
        Vframe_Root().mountView(Mx_Cfg.defaultView);
        
    },
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} [key]  以数组中对象的哪个key的value做为hash的key
     * @return {Object}
     * @example
     * let map = Magix.toMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * let map = Magix.toMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     *
     * console.log(map['30']);//=> {id:30}
     * //转成对象后不需要每次都遍历数组查询
     */
    toMap: ToMap,
    /**
     * 以try cache方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} [args]    参数数组
     * @param  {Object} [context] 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
     * @example
     * let result = Magix.toTry(function(){
     *     return true
     * });
     *
     * // result == true
     *
     * let result = Magix.toTry(function(){
     *     throw new Error('test');
     * });
     *
     * // result == undefined
     *
     * let result = Magix.toTry([function(){
     *     throw new Error('test');
     * },function(){
     *     return true;
     * }]);
     *
     * // result == true
     *
     * //异常的方法执行时，可以通过Magix.config中的error来捕获，如
     *
     * Magix.config({
     *     error:function(e){
     *         console.log(e);//在这里可以进行错误上报
     *     }
     * });
     *
     * let result = Magix.toTry(function(a1,a2){
     *     return a1 + a2;
     * },[1,2]);
     *
     * // result == 3
     * let o={
     *     title:'test'
     * };
     * let result = Magix.toTry(function(){
     *     return this.title;
     * },null,o);
     *
     * // result == 'test'
     */
    toTry: ToTry,
    /**
     * 转换成字符串路径
     * @function
     * @param  {String} path 路径
     * @param {Object} params 参数对象
     * @param {Object} [keo] 保留空白值的对象
     * @return {String} 字符串路径
     * @example
     * let str = Magix.toUrl('/xxx/',{a:'b',c:'d'});
     * // str == /xxx/?a=b&c=d
     *
     * let str = Magix.toUrl('/xxx/',{a:'',c:2});
     *
     * // str==/xxx/?a=&c=2
     *
     * let str = Magix.toUrl('/xxx/',{a:'',c:2},{c:1});
     *
     * // str == /xxx/?c=2
     * let str = Magix.toUrl('/xxx/',{a:'',c:2},{a:1,c:1});
     *
     * // str == /xxx/?a=&c=2
     */
    toUrl: ToUri,
    /**
     * 把路径字符串转换成对象
     * @function
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * let obj = Magix.parseUrl('/xxx/?a=b&c=d');
     * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
     */
    parseUrl: ParseUri,
    /*
     * 路径
     * @function
     * @param  {String} url  参考地址
     * @param  {String} part 相对参考地址的片断
     * @return {String}
     * @example
     * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
     */
    /**
     * 把src对象的值混入到aim对象上
     * @function
     * @param  {Object} aim    要mix的目标对象
     * @param  {Object} src    mix的来源对象
     * @example
     * let o1={
     *     a:10
     * };
     * let o2={
     *     b:20,
     *     c:30
     * };
     *
     * Magix.mix(o1,o2);//{a:10,b:20,c:30}
     *
     *
     * @return {Object}
     */
    mix: Assign,
    /**
     * 检测某个对象是否拥有某个属性
     * @function
     * @param  {Object}  owner 检测对象
     * @param  {String}  prop  属性
     * @example
     * let obj={
     *     key1:undefined,
     *     key2:0
     * }
     *
     * Magix.has(obj,'key1');//true
     * Magix.has(obj,'key2');//true
     * Magix.has(obj,'key3');//false
     *
     *
     * @return {Boolean} 是否拥有prop属性
     */
    has: Has,
    /**
     * 获取对象的keys
     * @param {Object} object 获取key的对象
     * @type {Array}
     * @beta
     * @module linkage|router
     * @example
     * let o = {
     *     a:1,
     *     b:2,
     *     test:3
     * };
     * let keys = Magix.keys(o);
     *
     * // keys == ['a','b','test']
     * @return {Array}
     */
    keys: Keys,
    /**
     * 判断一个节点是否在另外一个节点内，如果比较的2个节点是同一个节点，也返回true
     * @function
     * @param {String|HTMLElement} node节点或节点id
     * @param {String|HTMLElement} container 容器
     * @example
     * let root = $('html');
     * let body = $('body');
     *
     * let r = Magix.inside(body[0],root[0]);
     *
     * // r == true
     *
     * let r = Magix.inside(root[0],body[0]);
     *
     * // r == false
     *
     * let r = Magix.inside(root[0],root[0]);
     *
     * // r == true
     *
     * @return {Boolean}
     */
    inside: NodeIn,
    /**
     * 应用样式
     * @beta
     * @module style
     * @param {String} prefix 样式的名称前缀
     * @param {String} css 样式字符串
     * @example
     * // 该方法配合magix-combine工具使用
     * // 更多信息可参考magix-combine工具：https://github.com/thx/magix-combine
     * // 样式问题可查阅这里：https://github.com/thx/magix-combine/issues/6
     *
     */
    applyStyle: ApplyStyle,
    /**
     * 返回全局唯一ID
     * @function
     * @param {String} [prefix] 前缀
     * @return {String}
     * @example
     *
     * let id = Magix.guid('mx-');
     * // id maybe mx-7
     */
    guid: GUID,
    Cache,
    use: Async_Require,
    dispatch: DispatchEvent,
    type: Type,
    View,
    State,
    Vframe,
    Service,
    Event: MxEvent,
    
    guard: Safeguard,
    node: GetById
};
    Magix.default = Magix;
    return Magix;
});