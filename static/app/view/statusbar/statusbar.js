Ext.define('MyAppNamespace.view.statusbar.statusbar', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.statusbar',
    html: '<div class="states-toolbar"></div>',
    listeners: {
        render: function (c) {
            const that = this;
            let child = `<div class="states-content">`;
            if (that.float) {
                child = `<div class="states-content" style="float:${that.float};">`;
            }
            let changeFlag = false;
            that.list.forEach(l => {
                let cls = '';
                if (l.active) {
                    cls = ' class="active"';
                    changeFlag = true;
                }
                if (l.img) {
                    child = child + `<a${cls}`;
                    if (l.id) {
                        child = child + ` id="${l.id}" `;
                    }
                    child = child + `><img src="${l.img}"/>${l.name}</a>`;
                } else {
                    child = child + `<a${cls}`;
                    if (l.id) {
                        child = child + ` id="${l.id}" `;
                    }
                    child = child + `>${l.name}</a>`;
                }
            });
            child = child + '</div>';
            if(that.msg) {
                child = child + '<div class="status-msg"></div>';
            }
            c.el.dom.querySelector('.states-toolbar').innerHTML = child;
            that.infoPanel = Ext.get(c.el.dom).query('.status-msg')[0];
            const btn = Ext.get(c.el.dom).query('a');
            that.list.forEach((l, i) => {
                btn[i].addEventListener("click", function (dom) {
                    if (changeFlag) {
                        that.changeCls(btn, this);
                    }
                    that.click(that, this, l.name);
                });
            });
        }
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    click: function (that, dom) {
    },
    changeCls: function (btn, dom) {
        btn.forEach(b => {
            b.className = '';
        });
        dom.className = 'active';
    }
});
