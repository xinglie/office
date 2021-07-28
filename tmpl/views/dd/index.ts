/*
    author:https://github.com/xinglie
 */
import Magix from 'magix5';
let { attach, detach } = Magix;
let Win = window;
let Doc = document;
let IsW3C = Win.getComputedStyle;
let ClearSelection = (t?: () => Selection) => {
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
let dragKey = '@:{drag.count}';
export default {
    ctor() {
        let me = this;
        me.on('destroy', () => {
            me['@:{drag.end}']();
        });
    },
    '@:{is.dragenter}'(owner, key?: string) {
        key ||= dragKey;
        let ref = owner[key];
        if (!ref) {
            owner[key] = 0;
        }
        owner[key]++;
        return !ref;
    },
    '@:{is.dragleave}'(owner, key?: string) {
        key ||= dragKey;
        let ref = owner[key];
        if (ref) {
            owner[key]--;
        }
        return ref === 1;
    },
    '@:{clear.drag}'(owner, key?: string) {
        delete owner[key || dragKey];
    },
    '@:{drag.end}'(e) {
        let me = this;
        let info = me['@:{move.proxy}'];
        if (info) {
            let fn;
            for (fn of DragMoveEvent) {
                detach(Doc, fn, me['@:{move.proxy}']);
            }
            for (fn of DragEndEvent) {
                detach(Doc, fn, me['@:{stop.proxy}']);
            }
            for (fn of DragPreventEvent) {
                detach(Doc, fn, DragPrevent);
            }
            detach(Win, 'blur', me['@:{stop.proxy}']);
            delete me['@:{move.proxy}'];
            let stop = me['@:{stop.callback}'];
            if (stop) {
                stop(e);
            }
        }
    },
    '@:{drag.drop}'(e, moveCallback, endCallback) {
        let me = this;
        me['@:{drag.end}']();
        if (e) {
            ClearSelection();
            me['@:{stop.callback}'] = endCallback;
            me['@:{stop.proxy}'] = me['@:{drag.end}'].bind(me);
            me['@:{move.proxy}'] = e => {
                if (moveCallback) {
                    moveCallback(e);
                }
            };
            let fn;
            for (fn of DragMoveEvent) {
                attach(Doc, fn, me['@:{move.proxy}']);
            }
            for (fn of DragEndEvent) {
                attach(Doc, fn, me['@:{stop.proxy}']);
            }
            for (fn of DragPreventEvent) {
                attach(Doc, fn, DragPrevent, passiveObject);
            }
            attach(Win, 'blur', me['@:{stop.proxy}']);
        }
    },
    /**
     * 获取某坐标点的dom元素
     * @param x x坐标
     * @param y y坐标
     */
    '@:{from.point}'<T extends HTMLElement>(x: number, y: number): T {
        let node;
        if (Doc.elementFromPoint) {
            if (!DragPrevent['@:{fixed}'] && IsW3C) {
                DragPrevent['@:{fixed}'] = 1;
                DragPrevent['@:{add.scroll}'] = Doc.elementFromPoint(-1, -1) !== null;
            }
            if (DragPrevent['@:{add.scroll}']) {
                x += window.pageXOffset;
                y += window.pageYOffset;
            }
            node = Doc.elementFromPoint(x, y);
            while (node && node.nodeType == 3) node = node.parentNode;
        }
        return node;
    },
    '@:{clear.selection}': ClearSelection
};