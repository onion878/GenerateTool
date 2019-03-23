Ext.define('OnionSpace.controller.OnlineTemp', {
    extend: 'Ext.app.Controller',
    views: ['online-temp.online-temp'],
    models: ['OnlineTemp'],
    stores: ['OnlineTemp'],
    init: function () {
        this.control({
            'online-temp': {
                render: this.onPanelRendered
            },
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
    },
    onPanelRendered: function () {

    }
});
