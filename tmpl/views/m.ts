/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix5';
import Dragdrop from './dd/index';
Magix.applyStyle('@:./m.less');
export default Magix.View.extend({
    tmpl: '@:./m.html',
    render() {
        this.digest({
            left: 50,
            top: 100
        });
    },
    'drag<pointerdown>'(e) {
        let startX = e.pageX,
            startY = e.pageY;
        let beginX = this.get('left'),
            beginY = this.get('top');
        this['@:{drag.drop}'](e, move => {
            let offsetX = move.pageX - startX,
                offsetY = move.pageY - startY;
            this.digest({
                left: beginX + offsetX,
                top: beginY + offsetY
            });
        });
    }
}).merge(Dragdrop);