//#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
'@./lib/sea.js';
'@./lib/magix.js';
let office = () => {
    let node = document.getElementById('boot') as HTMLScriptElement;
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
        'magix'
    ], (Magix: Magix5.Magix) => {
        Magix.applyStyle('@scoped.style');
        Magix.boot({
            defaultPath: '/index',
            defaultView: 'views/index',
            rootId: 'app',
            error(e: Error) {
                setTimeout(() => {
                    throw e;
                }, 0);
            }
        });
    });
};