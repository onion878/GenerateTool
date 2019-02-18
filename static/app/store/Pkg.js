/**
 * http://usejsdoc.org/
 */
Ext.define('OnionSpace.store.Pkg', {
	extend : 'Ext.data.Store',
    proxy: {
        type: 'ajax',
        api:{
            read:'https://www.npmjs.com/search/suggestions'
        },
        listeners: {
            exception: function(proxy, response, operation){
                Ext.MessageBox.show({
                    title: '错误信息',
                    msg:JSON.parse(response.responseText).errorMsg,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK
                });
            }
        }
    },
    autoLoad: false
});
