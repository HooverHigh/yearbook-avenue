/* All window creation functions */
const { BrowserWindow, BrowserView, ipcMain, app } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");
const fs = require("fs");
var appdir = app.getAppPath();
const config = require(`${appdir}/src/data/config.json`);

/* Window functions */
function createMainWindow() {
    const modalwindow = (global.modalwindow = new BrowserWindow({
        modal: true,
        show: false
    }));
    const SplashWindow = (global.SplashWindow = new BrowserWindow({
        width: 390,
        height: 370,
        frame: false,
        transparent: false,
        /*skipTaskbar: true,*/
        resizeable: false,
        center: true,
        icon: `${appdir}/src/view/assets/app.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    }));
    SplashWindow.loadFile(`${appdir}/src/view/splash.html`);
    //SplashWindow.webContents.openDevTools();
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1200,
        defaultHeight: 700,
        fullScreen: false,
        maximize: true,
    });
    const mainWindow = (global.mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 894,
        minHeight: 574,
        frame: false,
        center: true,
        webPreferences: {
            contextIsolation: true,
            preload: `${appdir}/src/view/js/preload.js`,
        },
    }));
    mainWindowState.manage(mainWindow);
    mainWindow.loadFile(`${appdir}/src/view/titlebar.html`);
    //mainWindow.webContents.openDevTools();
    mainWindow.hide();
    const PageView = (global.PageView = new BrowserView({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
    }));
    mainWindow.setBrowserView(PageView);
    PageView.webContents.loadFile(`${appdir}/src/view/index.html`);
    PageView.setBounds({
        x: 0,
        y: 40,
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height - 40,
    });

    var UA = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36";;
    PageView.webContents.setUserAgent(UA);
    PageView.webContents.userAgent = UA

    PageView.webContents.on('did-attach-webview', function (event, webContents) {
        webContents.userAgent = UA;
    });

    PageView.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        //console.log(details.requestHeaders);
        details.requestHeaders['User-Agent'] = UA;
        callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    });
    
    PageView.webContents.session.webRequest.onHeadersReceived((details, callback) => {callback({
        responseHeaders: {
            //'Access-Control-Allow-Origin': ['*'],
            // We use this to bypass headers
            'Access-Control-Allow-Headers': ['*'],
            ...details.responseHeaders,
          },
        });
    });
    //PageView.webContents.openDevTools();
    mainWindow.on("resize", () => {
        PageView.setBounds({
            x: 0,
            y: 40,
            width: mainWindow.getBounds().width,
            height: mainWindow.getBounds().height - 40,
        });
    });
    /* Buttons */
    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window.maximized");
    });
    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window.restored");
    });
    ipcMain.on("window.minimize", (event) => {
        mainWindow.minimize();
    });
    ipcMain.on("window.maximize", (event) => {
        mainWindow.maximize();
        event.sender.send("window.maximized");
    });
    ipcMain.on("window.restore", (event) => {
        mainWindow.unmaximize();
        event.sender.send("window.restored");
    });
    ipcMain.on("window.close", () => {
        mainWindow.close();
        app.quit();
    });

    if (mainWindowState.isMaximized == true) {
        mainWindow.webContents.send("window.maximized");
        //mainWindow.webContents.executeJavaScript(`var mainwin = ${JSON.stringify(mainWindowState)};`);
        mainWindow.webContents.executeJavaScript("document.getElementById('maximize').style.display = 'none';");
        mainWindow.webContents.executeJavaScript("document.getElementById('restore').style.display = 'flex';");
    };
}
/* Export functions */
module.exports = { createMainWindow };