const {
    app,
    BrowserWindow,
    dialog,
    Menu,
    ipcMain
} = require('electron');
app.showExitPrompt = true;
const path = require('path');
const url = require('url');
const fs = require('fs');
const shell = require('shelljs');
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, loading, loadFlag = false, globalStoreDirPath;

function createWindow() {
    // 预加载
    loading = new BrowserWindow({
        show: false,
        frame: false,
        width: 200,
        height: 200
    });
    loading.loadURL(url.format({
        pathname: path.join(__dirname, 'static/loading/loading.html'),
        protocol: 'file:',
        slashes: true
    }));
    loading.webContents.once('dom-ready', () => {
        // 加载正式窗口
        createMainWindow();
        setTimeout(() => {
            if (!loadFlag) {
                const systemConfig = require('./service/dao/system');
                if (systemConfig.getWin().maximal) {
                    mainWindow.maximize();
                }
                mainWindow.show();
                if (loading && loading != null) {
                    loading.hide();
                    loading.close();
                    loading = null;
                }
            }
        }, 10000);
    });
    loading.show();
    loading.setResizable(false);
}

function createMainWindow() {
    globalStoreDirPath = path.join(process.env.ProgramData || 'C:/ProgramData', '/', app.getName());
    if (!fs.existsSync(globalStoreDirPath)) {
        shell.mkdir('-p', globalStoreDirPath);
    }
    if (!fs.existsSync(globalStoreDirPath + '/data')) {
        fs.mkdirSync(globalStoreDirPath + '/data');
    }
    if (!fs.existsSync(globalStoreDirPath + '/jscode')) {
        fs.mkdirSync(globalStoreDirPath + '/jscode');
    }
    const systemConfig = require('./service/dao/system');
    let data = systemConfig.getWin();
    if (data.id == undefined) {
        data = {id: '', width: 800, height: 600, maximal: false, x: 100, y: 100};
    }
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: data.width,
        height: data.height,
        show: false,
        title: '代码构建工具',
        icon: path.join(__dirname, 'static/images/icon.ico')
    });
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, `static/${systemConfig.getTheme()}.html`),
        protocol: 'file:',
        slashes: true
    }));

    if (data.id == 'system') {
        mainWindow.setPosition(data.x, data.y);
    }
    // Open the DevTools. debug
    //mainWindow.webContents.openDevTools();
    const menu = Menu.buildFromTemplate([
        {
            label: '系统',
            submenu: [
                {
                    label: '设置',
                    click() {
                        let code = `openSome({id:'setting',title:'设置',type:'setting'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '控制台',
                    click() {
                        mainWindow.webContents.openDevTools();
                    }
                },
                {
                    label: '系统日志',
                    click() {
                        let code = `openSome({id:'logger',title:'系统日志',type:'logger'})`;
                        mainWindow.webContents.executeJavaScript(code);
                    }
                },
                {
                    label: '重新启动',
                    click() {
                        app.relaunch();
                        app.exit(0);
                    }
                },
                {
                    label: '停止loading',
                    click() {
                        mainWindow.webContents.executeJavaScript(`Ext.getBody().unmask()`);
                    }
                }
            ]
        },
        {
            label: '模板管理',
            click() {
                let code = `openSome({id:'templet',title:'模板管理',type:'templet'})`;
                mainWindow.webContents.executeJavaScript(code);
            }
        },
        {
            label: '帮助',
            click() {
                require("open")('https://generate-docs.netlify.com/');
            }
        },
        {
            label: 'Github',
            click() {
                require("open")('https://github.com/onion878/GenerateTool');
            }
        }
    ]);
    Menu.setApplicationMenu(menu);

    let msgIndex = 0;

    ipcMain.on('loading-msg', (event, msg) => {
        if (msgIndex == -1) return;
        msgIndex++;
        if (loading && loading != null) {
            loading.webContents.executeJavaScript(`setMsg('${msg}', ${msgIndex})`);
        }
    });

    ipcMain.on('loading-success', (event, arg) => {
        loadFlag = true;
        if (data.maximal) {
            mainWindow.maximize();
        }
        mainWindow.show();
        if (loading && loading != null) {
            loading.hide();
            loading.close();
            loading = null;
        }
        msgIndex = -1;
    });

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
                    if (loading && loading != null) {
                        loading.close();
                    }
                    let [x, y] = mainWindow.getPosition();
                    let [width, height] = mainWindow.getSize();
                    const maximal = mainWindow.isMaximized();
                    if (maximal) {
                        width = data.width;
                        height = data.height;
                        x = data.x;
                        y = data.y;
                    }
                    systemConfig.setWin({id: 'system', x: x, y: y, width: width, height: height, maximal: maximal});
                }
            });
        }
    })
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
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
