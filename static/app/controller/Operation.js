Ext.define('OnionSpace.controller.Operation', {
    extend: 'Ext.app.Controller',
    views: ['operation.operation'],
    init: function () {
        this.control({
            'operation': {
                render: this.onPanelRendered
            },
            'toolbar button[action=refreshOperation]': {
                click: this.refreshOperation
            },
            'toolbar button[action=deleteOperation]': {
                click: this.deleteOperation
            }
        });
    },
    refreshOperation: function (dom) {
        const grid = dom.up('operation');
        grid.getStore().setData(operation.getAll());
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
                operation.deleteById(d.data.id);
            });
            that.refreshOperation(dom);
        }, dom, Ext.MessageBox.ERROR);
    },
    onPanelRendered: function () {
    }
});
