const {app, BrowserWindow, dialog, Menu, MenuItem} = require('electron');
app.showExitPrompt = true;
const path = require('path');
const url = require('url');
const sysData = require('./service/dao/system');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#157fcc'
    });
    sysData.getData();
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'static/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools. debug
    //mainWindow.webContents.openDevTools();
    const menu = Menu.buildFromTemplate([
        {
            label: 'close',
            submenu: [
                {
                    label: 'startspeaking',
                    click() {
                        console.log(123);
                    }
                },
                {
                    label: 'stopspeaking'
                }
            ]
        },
        {
            label: '调试',
            click() {
                mainWindow.webContents.openDevTools();
            }
        }
    ]);
    Menu.setApplicationMenu(menu);

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