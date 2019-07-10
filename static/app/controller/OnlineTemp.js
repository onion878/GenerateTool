Ext.define('OnionSpace.controller.OnlineTemp', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.OnlineTemp',
    init: function () {
        this.control({
            'toolbar textfield[action=search]': {
                change: this.query
            }
        });
    },
    query: function (dom, val) {
        const grid = dom.up('gridpanel');
        const store = grid.getStore();
        store.getProxy().extraParams = {name: val, size: 30};
        store.load();
    }
});
