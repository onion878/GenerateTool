const {app, BrowserWindow, dialog, Menu, MenuItem, webFrame} = require('electron');
app.showExitPrompt = true;
const path = require('path');
const url = require('url');
const config = require('./service/dao/system');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: '代码构建工具',
        icon: path.join(__dirname, 'static/images/icon.ico')
    });
    const theme = config.getTheme();
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, `static/${theme}.html`),
        protocol: 'file:',
        slashes: true
    }));
    // mainWindow.reload();
    // Open the DevTools. debug
    //mainWindow.webContents.openDevTools();
    const menu = Menu.buildFromTemplate([
        {
            label: '系统',
            submenu: [
                {
                    label: '设置',
                    click() {
                        let code = `openSome({id:'set-demo',title:'系统设置',type:'code'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '停止loading',
                    click() {
                        mainWindow.webContents.executeJavaScript(`Ext.getBody().unmask()`);
                    }
                },
                {
                    label: '放大',
                    click() {
                        mainWindow.webContents.executeJavaScript(`setZoom('+')`);
                    }
                },
                {
                    label: '缩小',
                    click() {
                        mainWindow.webContents.executeJavaScript(`setZoom('-')`);
                    }
                },
                {
                    label: '重置',
                    click() {
                        mainWindow.webContents.executeJavaScript(`resetZoom()`);
                    }
                },
                {
                    label: '重载界面',
                    click() {
                        mainWindow.reload();
                    }
                },
                {
                    label: '主题',
                    submenu: [
                        {
                            label: 'aria',
                            type: 'radio',
                            checked: theme == 'aria',
                            click() {
                                setTheme('aria');
                            }
                        },
                        {
                            label: 'classic',
                            type: 'radio',
                            checked: theme == 'classic',
                            click() {
                                setTheme('classic');
                            }
                        },
                        {
                            label: 'crisp',
                            type: 'radio',
                            checked: theme == 'crisp',
                            click() {
                                setTheme('crisp');
                            }
                        },
                        {
                            label: 'gray',
                            type: 'radio',
                            checked: theme == 'gray',
                            click() {
                                setTheme('gray');
                            }
                        },
                        {
                            label: 'neptune',
                            type: 'radio',
                            checked: theme == 'neptune',
                            click() {
                                setTheme('neptune');
                            }
                        },
                        {
                            label: 'triton',
                            type: 'radio',
                            checked: theme == 'triton',
                            click() {
                                setTheme('triton');
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: '控制台',
            click() {
                mainWindow.webContents.openDevTools();
            }
        }
    ]);
    Menu.setApplicationMenu(menu);

    function setTheme(name) {
        config.setTheme(name);
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, `static/${name}.html`),
            protocol: 'file:',
            slashes: true
        }));
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.on('close', function (e) {
        if (app.showExitPrompt) {
            e.preventDefault();
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['否', '是'],
                title: '提示',
                message: '是否退出?'
            }, function (response) {
                if (response === 1) { // Runs the following if 'Yes' is clicked
                    app.showExitPrompt = false;
                    mainWindow.close();
                }
            });
        }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.