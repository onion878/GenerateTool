Ext.define('OnionSpace.controller.Operation', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Operation',
    refreshOperation: function (dom) {
        const grid = dom.up('operation');
        const list = [];
        runMethod('operation', 'getAll').then(data => {
            data.forEach(({dataValues}) => {
                list.push(dataValues);
            });
            grid.getStore().setData(list);
        });
    },
    deleteOperation: function (dom) {
        const grid = dom.up('operation'), that = this;
        const sm = grid.getSelectionModel().getSelection();
        if (sm.length == 0) {
            Ext.toast({
                html: `<span style="color: red;">请选择至少一条数据!</span>`,
                closable: true,
                autoClose: false,
                align: 't',
                slideDUration: 400,
                maxWidth: 400
            });
            return;
        }
        const names = [];
        sm.map(d => {
            names.push(d.data.name);
        });
        showConfirm(`是否删除${names.join(',')},历史记录?`, function (text) {
            sm.map(d => {
                runMethod('operation', 'deleteById', [d.data.id]).then(() => {
                    that.refreshOperation(dom);
                });
            });
        }, dom, Ext.MessageBox.ERROR);
    },
    clearAll: function (dom) {
        const that = this;
        showConfirm(`是否删除所有历史记录?`, function (text) {
            runMethod('operation', 'clearAll').then(() => {
                that.refreshOperation(dom);
            });
        }, dom, Ext.MessageBox.ERROR);
    }
});
