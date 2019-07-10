/**
 * http://usejsdoc.org/
 */
Ext.define('OnionSpace.store.Pkg', {
    extend: 'Ext.data.Store',
    alias: 'store.Pkg',
    model: 'OnionSpace.model.Pkg',
    proxy: {
        type: 'ajax',
        api: {
            read: 'https://www.npmjs.com/search/suggestions'
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
    autoLoad: false
});
