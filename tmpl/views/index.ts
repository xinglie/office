/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@index.less');
let OrderRules = [{
    key: 1,
    text: '纯数字',
    rule: '[0-9]'
}, {
    key: 2,
    text: '纯字母',
    rule: '[a-zA-Z]'
}, {
    key: 3,
    text: '数字与字母混合',
    rule: '[a-zA-Z0-9]'
}];
let OrderLength = [5, 30];
let OrderRulesMap = Magix.toMap(OrderRules, 'key');
let Settings = {
    br: /[\r\n]/,
    cell: /\t/,
    spliter: /[,，]/
};
let IgnoreFirst = [0, 10];
export default Magix.View.extend({
    tmpl: '@index.html',
    render() {
        this.digest({
            rule: 1,
            len: 10,
            ignores: IgnoreFirst,
            first: 1,
            rules: OrderRules,
            lens: OrderLength
        });
    },
    '@{get.cells}'(data) {
        let lines = data.split(Settings.br);
        let result = [];
        for (let line of lines) {
            let cs = line.split(Settings.cell);
            result.push(cs);
        }
        return result;
    },
    '@{get.order.meta}'(result) {
        let data = this.get();
        let rule = OrderRulesMap[data.rule].rule;
        let len = data.len;
        let reg = new RegExp(`^${rule}{${len}}$`);
        let maybeCols = {},
            checkedCols = {},
            cols = 0,
            fi = 0,
            first = data.first | 0;
        for (let line of result) {
            let ci = 0;
            if (fi >= first) {
                for (let cell of line) {
                    if (cell && cell.trim()) {
                        let cs = cell.trim().split(Settings.spliter);
                        let f = 1;
                        for (let c of cs) {
                            if (!reg.test(c)) {
                                if (ci == 5) {
                                    console.log(c, line, cell);
                                }
                                f = 0;
                                break;
                            }
                        }
                        if (f && !checkedCols[ci]) {
                            maybeCols[ci] = 1;
                        } else {
                            delete maybeCols[ci];
                            checkedCols[ci] = 1;
                        }
                    }
                    ci++;
                }
            }
            fi++;
            if (line.length > cols) {
                cols = line.length;
            }
        }
        return {
            orders: Magix.keys(maybeCols),
            cols,
            rows: result.length
        };
    },
    '@{get.table}'(data) {
        let lines = this['@{get.cells}'](data);
        let meta = this['@{get.order.meta}'](lines);
        let table = {
            success: false,
            rows: meta.rows,
            cols: meta.cols,
            orders: meta.orders,
            grid: []
        };
        if (meta.orders.length == 1) {
            table.success = true;
            let col = meta.orders[0] | 0;
            let grid = [];
            for (let line of lines) {
                let cell = line[col];
                if (cell && cell.trim()) {
                    let cs = cell.trim().split(Settings.spliter);
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
        }
        return table;
    },
    '@{change.rule}<change>'(e: Magix5.MagixMouseEvent) {
        let target = e.eventTarget as HTMLSelectElement;
        let option = target.options[target.selectedIndex];
        this.digest({
            rule: option.value,
            table: null
        });
    },
    '@{change.len}<change>'(e) {
        let target = e.eventTarget as HTMLSelectElement;
        let option = target.options[target.selectedIndex];
        this.digest({
            len: option.value,
            table: null
        });
    },
    '@{change.ignore}<change>'(e) {
        let target = e.eventTarget as HTMLSelectElement;
        let option = target.options[target.selectedIndex];
        this.digest({
            first: option.value,
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