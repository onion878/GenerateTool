
Ext.define('MyAppNamespace.view.user.userList', {
    extend : 'Ext.grid.Panel',
    alias : 'widget.useraa',
    selType: 'checkboxmodel',
    plugins: {
        ptype: 'rowediting',
        clicksToMoveEditor:1,
        autoCancel:false,
        autoUpdate:true,
        listeners:{
            edit:function(editor,e,eOpts){

            }
        }
    },
    columnLines:true,
    initComponent : function() {
        this.columns = [
            new Ext.grid.RowNumberer(),
            { text: 'Name',align:'center',dataIndex: 'name',editor:{xtype:'textfield'},flex : 1},
            { text: 'Email',align:'center', dataIndex: 'email',editor:{xtype:'textfield'},flex : 1},
            { text: 'Phone',align:'center', dataIndex: 'phone',editor:{xtype:'textfield'},flex : 1},
            { text: '日期', align:'center',dataIndex: 'datetime',editor:{xtype:'timefield'},flex : 1}
        ];

        this.bbar= [{
            xtype: 'pagingtoolbar',
            displayInfo: true
        }];
        this.callParent(arguments);
    }
});