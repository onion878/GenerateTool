/**
 * http://usejsdoc.org/
 */
Ext.define('OnionSpace.store.OnlineTemp', {
    extend: 'Ext.data.Store',
    pageSize: 30,
    proxy: {
        type: 'ajax',
        api: {
            read: userConfig.getUrl() + '/getTemplate'
        },
        headers: {
            "Authorization": "Bearer " + userConfig.getAuth()
        },
        reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'total'
        },
        writer: {
            writeAllFields: true,
            writeRecordId: false
        },
        listeners: {
            exception: function (proxy, response, operation) {
                try {
                    Ext.MessageBox.show({
                        title: '错误信息',
                        msg: JSON.parse(response.responseText).errorMsg,
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
    },
    sorters: [{
        property: 'Created',
        direction: 'desc'
    }],
    autoLoad: true,
    autoSync: false
});
