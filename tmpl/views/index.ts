/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix5';
Magix.applyStyle('@:./index.less');
let ColsCount = [1, 20];
let Settings = {
    br: /(?:\r\n|\r|\n)/,
    cell: /\t/
};
let escapedRegexp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
let escapeRegexp = s => (s + '').replace(escapedRegexp, '\\$&');
export default Magix.View.extend({
    tmpl: '@:./index.html',
    render() {
        this.digest({
            id:this.id,
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
            } else {
                grid.push(line);
            }
        }
        table.grid = grid;
        table.to = grid.length;
        return table;
    },
    '@{change.col}<change>'(e: Magix5.MagixMouseEvent) {
        let target = e.eventTarget as HTMLSelectElement;
        let option = target.options[target.selectedIndex];
        this.digest({
            col: option.value,
            table: null
        });
    },
    '@{change.chars}<input>'(e) {
        let target = e.eventTarget as HTMLInputElement;
        this.digest({
            chars: target.value.trim(),
            table: null
        });
    },
    '@{copy}<click>'() {
        let range = document.createRange();
        range.selectNode(Magix.node('result_' + this.id));
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        alert('已复制');
    },
    '$doc<paste>'(e: ClipboardEvent) {
        let data = e.clipboardData.getData('text/plain');
        let table = this['@{get.table}'](data);
        this.digest({
            table
        });
    }
});