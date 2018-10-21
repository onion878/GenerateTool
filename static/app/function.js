const url = 'http://localhost:8000';
const axios = require('axios');

function showLoginWindow() {
    Ext.create('Ext.window.Window', {
        title: '登录',
        fixed: true,
        maxHeight: 500,
        width: 400,
        layout: 'fit',
        resizable: true,
        constrain: true,
        animateTarget: this,
        modal: true,
        items: {
            xtype: 'form',
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [{
                    xtype: 'textfield',
                    fieldLabel: '用户名',
                    margin: '10',
                    labelWidth: 45,
                    name: 'username',
                    allowBlank: false,
                    msgTarget: 'under',
                    value: systemConfig.getUser().username
                },
                {
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: '密码',
                    margin: '10',
                    labelWidth: 45,
                    name: 'password',
                    allowBlank: false,
                    msgTarget: 'under',
                    value: systemConfig.getUser().password
                }
            ]
        },
        buttonAlign: 'center',
        buttons: [{
                text: '登录',
                handler: function (btn) {
                    Ext.getBody().mask('执行中...');
                    const form = btn.up('window').down('form').getForm();
                    if (form.isValid()) {
                        axios.post(url + '/login', form.getValues()).then(({data}) => {
                            if(data.code == 200) {
                                showToast("登录成功!");
                                systemConfig.setAuth(data.token);
                                this.up('window').close();
                                Ext.getBody().unmask();
                            } else {
                                showToast("登录失败!");
                                Ext.getBody().unmask();
                            }
                        }).catch(err => Ext.getBody().unmask());
                    }
                }
            },
            {
                text: '关闭',
                handler: function () {
                    this.up('window').close();
                }
            }
        ]
    }).show().focus();
}

function showRegisterWindow() {
    Ext.create('Ext.window.Window', {
        title: '注册',
        fixed: true,
        maxHeight: 500,
        width: 400,
        layout: 'fit',
        resizable: true,
        constrain: true,
        animateTarget: this,
        modal: true,
        items: {
            xtype: 'form',
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [{
                    xtype: 'textfield',
                    inputType: 'email',
                    fieldLabel: '邮箱',
                    margin: '10',
                    labelWidth: 45,
                    name: 'username',
                    allowBlank: false,
                    msgTarget: 'under'
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    margin: '10',
                    items: [{
                            xtype: 'container',
                            flex: 1,
                            layout: 'hbox',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: '验证码',
                                labelWidth: 45,
                                name: 'code',
                                flex: 1,
                                allowBlank: false,
                                msgTarget: 'under'
                            }]
                        },
                        {
                            xtype: 'button',
                            text: '获取验证码',
                            labelWidth: 45,
                            handler: function (btn) {
                                const form = btn.up('form').getForm();
                                const {
                                    username
                                } = form.getValues();
                                if (username.trim().length == 0) {
                                    Ext.MessageBox.show({
                                        title: '提示',
                                        msg: '请输入邮箱!',
                                        buttons: Ext.MessageBox.OK,
                                        icon: Ext.MessageBox.ERROR
                                    });
                                    return;
                                }
                                const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                if (!re.test(username)) {
                                    Ext.MessageBox.show({
                                        title: '提示',
                                        msg: '请输入正确的邮箱!',
                                        buttons: Ext.MessageBox.OK,
                                        icon: Ext.MessageBox.ERROR
                                    });
                                    return;
                                }
                                axios.post(url + '/getCode', {id: username}).then(({data}) => {
                                    showToast(data.data);
                                });
                                let s = 60;
                                btn.setDisabled(true);
                                btn.setText(`剩余60秒`);
                                const yzmInterval = setInterval(() => {
                                    s--;
                                    btn.setText(`剩余${s}秒`);
                                    if (s == 0) {
                                        clearInterval(yzmInterval);
                                        btn.setDisabled(false);
                                        btn.setText(`获取验证码`);
                                    }
                                }, 1000);

                            }
                        }
                    ]
                },
                {
                    xtype: 'textfield',
                    inputType: 'password',
                    fieldLabel: '密码',
                    margin: '10',
                    labelWidth: 45,
                    name: 'password',
                    allowBlank: false,
                    msgTarget: 'under'
                }
            ]
        },
        buttonAlign: 'center',
        buttons: [{
                text: '注册',
                handler: function (btn) {
                    Ext.getBody().mask('执行中...');
                    const form = btn.up('window').down('form').getForm();
                    if (!form.isValid()) {
                        Ext.MessageBox.show({
                            title: '提示',
                            msg: '请输入注册信息!',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                        return;
                    }
                    const {
                        username
                    } = form.getValues();
                    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (!re.test(username)) {
                        Ext.MessageBox.show({
                            title: '提示',
                            msg: '请输入正确的邮箱!',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                        return;
                    }
                    const formData = form.getValues();
                    axios.post(url + '/register', formData).then(({data}) => {
                        Ext.getBody().unmask();
                        if(data.success) {
                            showToast(data.data);
                            systemConfig.setUser(formData.username, formData.password);
                            this.up('window').close();
                        } else {
                            showToast(data.val);
                        }
                    }).catch(err => Ext.getBody().unmask());
                }
            },
            {
                text: '关闭',
                handler: function () {
                    this.up('window').close();
                }
            }
        ]
    }).show().focus();
}

function post(path, data) {
    return axios.create({
        baseURL: url,
        timeout: 300000,
        headers: {'Authorization': 'Bearer ' + systemConfig.getAuth()}
    }).post(path, data);
}

function get(path) {
    return axios.create({
        baseURL: url,
        timeout: 300000,
        headers: {'Authorization': 'Bearer ' + systemConfig.getAuth()}
    }).get(path);
}