/**
 * http://usejsdoc.org/
 */
Ext.define('MyAppNamespace.controller.User', {
	extend : 'Ext.app.Controller',
	// 其实翻译出来就是“从根 app 开始找 view（注意没带 s 哦） 目录，在这个目录下找到 student 目录，然后加载 List.js 这个文件”
	views : ['user.userList'],
	init : function() {
		this.control({
			'viewport > panel' : {
				render : this.onPanelRendered
			}
		});
	},
	onPanelRendered : function() {
		//console.debug('userpanel被渲染了');
	}
});