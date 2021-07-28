//magix-composer#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
'@:./lib/sea.js';
'@:./lib/magix.js';
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
        'magix5'
    ], (Magix: Magix5.Magix) => {
        let { params } = Magix.parseUrl(location.href);
        Magix.applyStyle('@scoped.style');
        Magix.boot({
            defaultPath: '/index',
            defaultView: 'views/' + (params.view || 'index'),
            rootId: 'app',
            error(e: Error) {
                setTimeout(() => {
                    throw e;
                }, 0);
            }
        });
    });
};