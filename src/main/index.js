/* Import node modules */
const { app, BrowserWindow, Tray, Menu, ipcMain, ipcRenderer, protocol } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");
const notifier = require('node-notifier');
const log4js = require("log4js");
const request = require('request');
require('v8-compile-cache');

const { spawn, exec } = require('child_process');

/* Info about app */
var appdir = app.getAppPath();
var appname = app.getName();
var appversion = app.getVersion();
const config = require(`${appdir}/src/data/config.json`);
const userDataPath = app.getPath('userData');

/*Update Dir*/
//console.log(userDataPath);
fs.mkdir(path.join(userDataPath, 'update'), (err) => {
    if (err) {
        if (err.code == "EEXIST") {
            return logger.debug('update Directory already exists!');
        }
    };
    logger.debug('update Directory created successfully!');
});
fs.mkdir(path.join(userDataPath, 'lib'), (err) => {
    if (err) {
        if (err.code == "EEXIST") {
            return logger.debug('lib Directory already exists!');
        }
    };
    logger.debug('lib Directory created successfully!');
    fs.mkdir(path.join(userDataPath, 'lib', 'platform-tools'), (err) => {
        if (err) {
            if (err.code == "EEXIST") {
                return logger.debug('platform-tools Directory already exists!');
            }
        };
        logger.debug('platform-tools Directory created successfully!');
    });
});
fs.mkdir(path.join(userDataPath, 'dl'), (err) => {
    if (err) {
        if (err.code == "EEXIST") {
            return logger.debug('dl Directory already exists!');
        }
    };
    logger.debug('dl Directory created successfully!');
});
fs.mkdir(path.join(userDataPath, 'adb-out'), (err) => {
    if (err) {
        if (err.code == "EEXIST") {
            return logger.debug('adb-out Directory already exists!');
        }
    };
    logger.debug('adb-out Directory created successfully!');
});

/* Functions */
function checkInternet(cb) {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            cb(false);
        } else {
            cb(true);
        }
    })
};

async function notification(mode, arg1) {
    if (mode == "1") {
        notifier.notify({
            title: 'Update availible.',
            message: 'An update is availible, Downloading now....',
            icon: `${appdir}/src/renderer/assets/download.png`,
            sound: true,
            wait: true
        });
    } else if (mode == "2") {
        notifier.notify({
            title: 'Update downloaded.',
            message: 'An update has been downloaded, Restarting app...',
            icon: `${appdir}/src/renderer/assets/tray-small.png`,
            sound: true,
            wait: true
        },
            function (err, response2) {
                if (response2 == "activate") {
                    console.log("An update has been downloaded.");
                    app.quit();
                }
            }
        );
    } else if (mode == "3") {
        notifier.notify({
            title: 'Not connected.',
            message: `You are not connected to the internet, unable to check for updates without internet.`,
            icon: `${appdir}/src/renderer/assets/warning.png`,
            sound: true,
            wait: true
        },
            function (err, response3) {
                console.log(err);
                if (response3 == "activate") {
                    console.log("User clicked on no wifi notification.");
                }
            }
        );
    } else if (mode == "4") {
        notifier.notify({
            title: 'Error downloading.',
            message: `Unable to download latest update file: '${arg1}'`,
            icon: `${appdir}/src/renderer/assets/warning.png`,
            sound: true,
            wait: true
        },
            function (err, response4) {
                if (response4 == "activate") {
                    console.log("User clicked on unable to download notification.");
                } else {
                    notifier.on('timeout', function (notifierObject, options) {
                        // Triggers if notification closes
                        console.log("User did not click on unable to download notification.");
                    });
                }
            }
        );
    } else if (mode == "5") {
        notifier.notify({
            title: 'Error extracting files.',
            message: 'There was an error extracting some files.',
            icon: `${appdir}/src/renderer/assets/warning.png`,
            sound: true,
            wait: true
        },
            function (err, response5) {
                if (response5 == "activate") {
                    console.log("User clicked on unable to extract notification.");
                } else {
                    notifier.on('timeout', function (notifierObject, options) {
                        // Triggers if notification closes
                        console.log("User did not click on unable to extract notification.");
                    });
                }
            }
        );
    } else if (mode == "6") {
        notifier.notify({
            title: 'Error checking for update.',
            message: 'There was an error checking for updates, continuing as normal.',
            icon: `${appdir}/src/renderer/assets/warning.png`,
            sound: true,
            wait: true
        },
            function (err, response6) {
                if (response6 == "activate") {
                    console.log("User clicked on unable to check for update notification.");
                } else {
                    notifier.on('timeout', function (notifierObject, options) {
                        // Triggers if notification closes
                        console.log("User did not click on unable to check for update notification.");
                    });
                }
            }
        );
    }
};

/* Logging */
log4js.configure({
    appenders: {
        q2mgminit: {
            type: "file",
            filename: `${path.join(userDataPath, 'QUEST2-MANAGEMENT-INIT.log')}`
        }
    },
    categories: {
        default: {
            appenders: ["q2mgminit"],
            level: "error"
        }
    }
});
const logger = log4js.getLogger("q2mgminit");
if (fs.existsSync(path.join(userDataPath, '.dev')) || fs.existsSync(path.join(userDataPath, '.debug')) || fs.existsSync(path.join(userDataPath, '.debug.txt'))) {
    logger.level = "debug";
};
logger.log("Starting");

var argum = process.argv || "none";

global.app = {};
global.app.arguments = { cml: argum };
global.app.paths = { data: userDataPath, main: appdir };
global.app.functions = {
    devToolsLog: function (s) {
        console.log(s)
        if (PageView && PageView.webContents) {
            PageView.webContents.executeJavaScript(`console.log("${s}")`)
        }
    }
};

/* Import custom functions */
logger.log("Loading shortcuts");
require("./shortcut");
logger.log("Loading MainWindow script");
const { createMainWindow } = require("./window");

logger.log("Disabling transparent visuals if not on win32 or darwin");
/* Disable gpu and transparent visuals if not win32 or darwin */
if (process.platform !== "win32" && process.platform !== "darwin") {
    app.commandLine.appendSwitch("enable-transparent-visuals");
    app.commandLine.appendSwitch("disable-gpu");
    app.disableHardwareAcceleration();
};

logger.log("Loading package.json and contributors.json");
logger.log("Creating Tray");
/* Menu tray and about window */
var packageJson = require(`${appdir}/package.json`); /* Read package.json */
var contrib = require(`${appdir}/src/data/contributors.json`); /* Read contributors.json */
var appAuthor = packageJson.author.name;

/* Tray Menu */
const createTray = () => {
    var trayMenuTemplate = [
        { label: appname, enabled: false },
        { type: 'separator' },
        {
            label: 'About', role: 'info', click: function () {
                if (global.AboutWindow) {
                    global.AboutWindow.show();
                }
            }
        },
        { label: 'Quit', role: 'quit', click: function () { app.quit(); } }
    ];
    var tray = new Tray(`${appdir}/src/view/img/tray-icon.png`);
    let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    tray.setContextMenu(trayMenu);
    tray.on('click', function (e) {
        global.mainWindow && global.mainWindow.focus();
    });
};
require('@electron/remote/main').initialize();
/* When app ready, check for internet, then register q2mgm:// */
logger.log("Enabling q2mgm://");
let deeplinkingUrl;
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('q2mgm', process.execPath, [path.resolve(process.argv[1])]);
    };
} else {
    app.setAsDefaultProtocolClient('q2mgm');
};
logger.log("Second instance");
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        try {
            if (commandLine.length >= 3) {
                uri = commandLine[3].split('/');
            } else {
                uri = "none";
            };
        } catch (error) {
            uri = "none";
        };
        logger.debug("CommandLine:", deeplinkingUrl);
        logger.debug("DeepLink:", commandLine[3]);
        logger.debug("DeepLink data:", uri);

        switch (uri[2]) {
            case "oauth":
                console.log("Handle oauth");
                if (uri[3] == "login") {
                    try {
                        const response = await axios.get(`https://protoshock.ml/discord/users/${uri[4]}`);
                        userjson = response.data;
                        if (PageView && PageView.webContents) {
                            PageView.webContents.executeJavaScript(`var uj = atob('${userjson}');
                            if (getData('DauthD')) {
                                updateData('DauthD', uj);
                            } else {
                                storeData('DauthD', uj);
                            };

                            function jqdefer(method) {
                                if (window.jQuery) {
                                    method();
                                } else {
                                    setTimeout(function() { jqdefer(method) }, 50);
                                }
                            }

                            jqdefer(function () {
                                var duj = JSON.parse(getData("DauthD"));
                                var dusername = duj.username + "#" + duj.discrim;
                                var usericon = 'https://cdn.discordapp.com/avatars/'+duj.user.id+'/'+duj.user.avatar;

                                $("#DLMODAL-title").html("<img src='./img/discord/discord-logo-white.svg' style='width: 40px;'/> Discord account added!");
                                $("#DLMODAL-body").html('User account linked: ' + dusername);
                                
                                $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
                                $('#DLGMODAL').modal('show');
                                
                                setTimeout(function() {
                                    $('#DLGMODAL').modal('hide');
                                }, 3000);
                            });`);
                        } else {
                            console.error("Discord oauth failed via uri handler");
                        };
                    } catch (e) {
                        console.error("Discord oauth failed via uri handler e2");
                    };
                } else if (uri[3] == "logout") {
                    try {
                        const response = await axios.get(`https://protoshock.ml/discord/users/${uri[4]}`);
                        userjson = response.data;
                        if (PageView && PageView.webContents) {
                            PageView.webContents.executeJavaScript(`var uj = atob('${userjson}');
                            if (getData('DauthD')) {
                                updateData('DauthD', uj);
                            } else {
                                storeData('DauthD', uj);
                            };

                            function jqdefer(method) {
                                if (window.jQuery) {
                                    method();
                                } else {
                                    setTimeout(function() { jqdefer(method) }, 50);
                                }
                            }

                            jqdefer(function () {
                                var duj = JSON.parse(getData("DauthD"));
                                var dusername = duj.username + "#" + duj.discrim;
                                var usericon = 'https://cdn.discordapp.com/avatars/'+duj.user.id+'/'+duj.user.avatar;

                                $("#DLMODAL-title").html("<img src='./img/discord/discord-logo-white.svg' style='width: 40px;'/> Discord account added!");
                                $("#DLMODAL-body").html('User account linked: ' + dusername);
                                
                                $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
                                $('#DLGMODAL').modal('show');
                                
                                setTimeout(function() {
                                    $('#DLGMODAL').modal('hide');
                                }, 3000);
                            });`);
                        } else {
                            console.error("Discord oauth failed via uri handler");
                        };
                    } catch (e) {
                        console.error("Discord oauth failed via uri handler e2");
                    };
                };
                break;

            case "manage":
                console.log("Handle app install/uninstall");
                var appdata;
                var apibase = "https://github.com/IsaacMvmv/N/blob/main/applist.json";

                var modurl = `${apimods}?api_key=${access_token}&id=${uri[4]}`;
                var modjson;

                try {
                    const response = await axios.get(modurl);
                    modjson = response.data.data;
                    modj = modjson;

                    switch (uri[3]) {
                        case "install":
                            console.log("install mod", uri[4]);
                            appdata = `installmod('mod.io', ${JSON.stringify(modj[0])});`;
                            break;

                        case "uninstall":
                            console.log("uninstall mod", uri[4]);
                            appdata = `removemod('uri', ${JSON.stringify(modj[0])});`;
                            break;

                        default:
                            break;
                    }
                    if (PageView && PageView.webContents) {
                        //console.log(appdata);
                        PageView.webContents.executeJavaScript(appdata);
                    } else {
                        console.error("Mod install failed via uri handler");
                    };
                } catch (error) {
                    console.error("Mod install failed via uri handler e2");
                }
                break;

            default:
                break;
        }

        app.on('open-url', async (event, url) => {
            switch (url) {
                case "oauth":
                    console.log("Handle oauth");
                    if (uri[3] == "login") {
                        try {
                            const response = await axios.get(`https://protoshock.ml/discord/users/${uri[4]}`);
                            userjson = response.data;
                            if (PageView && PageView.webContents) {
                                PageView.webContents.executeJavaScript(`var uj = atob('${userjson}');
                            if (getData('DauthD')) {
                                updateData('DauthD', uj);
                            } else {
                                storeData('DauthD', uj);
                            };

                            function jqdefer(method) {
                                if (window.jQuery) {
                                    method();
                                } else {
                                    setTimeout(function() { jqdefer(method) }, 50);
                                }
                            }

                            jqdefer(function () {
                                var duj = JSON.parse(getData("DauthD"));
                                var dusername = duj.username + "#" + duj.discrim;
                                var usericon = 'https://cdn.discordapp.com/avatars/'+duj.user.id+'/'+duj.user.avatar;

                                $("#DLMODAL-title").html("<img src='./img/discord/discord-logo-white.svg' style='width: 40px;'/> Discord account added!");
                                $("#DLMODAL-body").html('User account linked: ' + dusername);
                                
                                $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
                                $('#DLGMODAL').modal('show');
                                
                                setTimeout(function() {
                                    $('#DLGMODAL').modal('hide');
                                }, 3000);
                            });`);
                            } else {
                                console.error("Discord oauth failed via uri handler");
                            };
                        } catch (e) {
                            console.error("Discord oauth failed via uri handler e2");
                        };
                    } else if (uri[3] == "logout") {
                        try {
                            const response = await axios.get(`https://protoshock.ml/discord/users/${uri[4]}`);
                            userjson = response.data;
                            if (PageView && PageView.webContents) {
                                PageView.webContents.executeJavaScript(`var uj = atob('${userjson}');
                            if (getData('DauthD')) {
                                updateData('DauthD', uj);
                            } else {
                                storeData('DauthD', uj);
                            };

                            function jqdefer(method) {
                                if (window.jQuery) {
                                    method();
                                } else {
                                    setTimeout(function() { jqdefer(method) }, 50);
                                }
                            }

                            jqdefer(function () {
                                var duj = JSON.parse(getData("DauthD"));
                                var dusername = duj.username + "#" + duj.discrim;
                                var usericon = 'https://cdn.discordapp.com/avatars/'+duj.user.id+'/'+duj.user.avatar;

                                $("#DLMODAL-title").html("<img src='./img/discord/discord-logo-white.svg' style='width: 40px;'/> Discord account added!");
                                $("#DLMODAL-body").html('User account linked: ' + dusername);
                                
                                $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
                                $('#DLGMODAL').modal('show');
                                
                                setTimeout(function() {
                                    $('#DLGMODAL').modal('hide');
                                }, 3000);
                            });`);
                            } else {
                                console.error("Discord oauth failed via uri handler");
                            };
                        } catch (e) {
                            console.error("Discord oauth failed via uri handler e2");
                        };
                    };
                    break;

                case "manage":
                    console.log("Handle app install/uninstall");
                    var appdata;
                    var apibase = "https://github.com/IsaacMvmv/N/blob/main/applist.json";

                    var modurl = `${apimods}?api_key=${access_token}&id=${uri[4]}`;
                    var modjson;

                    try {
                        const response = await axios.get(modurl);
                        modjson = response.data.data;
                        modj = modjson;

                        switch (uri[3]) {
                            case "install":
                                console.log("install mod", uri[4]);
                                appdata = `installmod('mod.io', ${JSON.stringify(modj[0])});`;
                                break;

                            case "uninstall":
                                console.log("uninstall mod", uri[4]);
                                appdata = `removemod('uri', ${JSON.stringify(modj[0])});`;
                                break;

                            default:
                                break;
                        }
                        if (PageView && PageView.webContents) {
                            //console.log(appdata);
                            PageView.webContents.executeJavaScript(appdata);
                        } else {
                            console.error("Mod install failed via uri handler");
                        };
                    } catch (error) {
                        console.error("Mod install failed via uri handler e2");
                    }
                    break;

                default:
                    break;
            }
        });

        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            //app.quit();
        };
    });

    // Create mainWindow, load the rest of the app, etc...
    logger.log("Checking for internet and getting updates");
    app.whenReady().then(async () => {
        require("@electron/remote/main").enable(PageView.webContents);
        require("@electron/remote/main").enable(AboutWindow.webContents);
        require("@electron/remote/main").enable(SplashWindow.webContents);
        /* Check for internet */
        checkInternet(function (isConnected) {
            if (isConnected) {
                logger.log("Show splash");
                SplashWindow.webContents.on("did-finish-load", () => {
                    /* Get latest version */
                    console.log("Initilize Updater:");
                    axios.get(config.latestlauncher).then(function (response) {
                        //console.log(response);
                        if (response.status == 200) {
                            const onlineversion = response.data.version;
                            console.log(`Online version: '${onlineversion}'`);
                            console.log(`Local version: '${appversion}'`);
                            /* If Online version is greater than local version, show update dialog */
                            if (onlineversion > appversion) {
                                logger.log("Updating app");
                                mainWindow.close();
                                console.log("\x1b[1m", "\x1b[31m", "Version is not up to date!", "\x1b[0m");
                                SplashWindow.webContents.send('SplashWindow', 'Update');
                            } else {
                                logger.log("Loading normaly");
                                console.log("\x1b[1m", "\x1b[32m", "Version is up to date!", "\x1b[0m");
                                SplashWindow.webContents.send('SplashWindow', 'Latest');
                            };
                        } else if (response.status == 404) {
                            logger.error("Server error, id: 1");
                            console.log("\x1b[1m", "\x1b[31m", "Unable to check latest version from main server!\nIt may be because the server is down, moved, or does not exist.", "\x1b[0m");
                            notification("6");
                            SplashWindow.webContents.send('SplashWindow', 'Unknown');
                        };
                    }).catch(function (error) {
                        // handle error
                        logger.error("Server error, id: 2");
                        console.log(error);
                        console.log("\x1b[1m", "\x1b[31m", "Unable to check latest version from main server!\nIt may be because the server is down, moved, or does not exist.", "\x1b[0m");
                        notification("6");
                        SplashWindow.webContents.send('SplashWindow', 'Unknown');
                    });
                });
                ipcMain.on('FromSplashWindow', function (event, arg) {
                    //console.log(arg);
                    if (arg == "Restart") {
                        if (os.platform() == "win32") {
                            updatefile = path.join(userDataPath, 'update', `${appname}.exe`);
                            var pshockupdate = spawn(updatefile, [], { detached: true, stdio: ['ignore', 'ignore', 'ignore'] });
                            pshockupdate.unref();
                            app.quit();
                        } else if (os.platform() == "darwin") {
                            updatefile = path.join(userDataPath, 'update', `${appname}.app`);
                            var pshockupdate = spawn(`open -a ${updatefile}`, [], { detached: true, stdio: ['ignore', 'ignore', 'ignore'] });
                            pshockupdate.unref();
                            app.quit();
                        } else if (os.platform() == "linux") {
                            updatefile = path.join(userDataPath, 'update', `${appname}.deb`);
                            var pshockupdate = spawn(`sudo dpkg -i -y ${updatefile}`, [], { detached: true, stdio: ['ignore', '/var/log/protoshocklauncher/update.log', '/var/log/protoshocklauncher/update-err.log'] });
                            pshockupdate.unref();
                            app.quit();
                        };
                    } else if (arg == "ShowMainWindow") {
                        //PageView.webContents.on("did-finish-load", () => {
                        //  console.log("Page loaded");
                        //});
                        console.log("Loading complete, Showing main window.");
                        mainWindow.show();
                        SplashWindow.close();
                        mainWindow.center();
                    };
                });
            } else {
                /* User not connected */
                console.log("\x1b[1m", "\x1b[31m", "ERROR: User is not connected to internet, showing NotConnectedNotification", "\x1b[0m");
                notification("3");
                SplashWindow.webContents.on("did-finish-load", () => {
                    SplashWindow.webContents.send('SplashWindow', 'Unknown');
                    ipcMain.on('FromSplashWindow', function (event, arg) {
                        if (arg == "ShowMainWindow") {
                            console.log("Loading complete, Showing main window.");
                            //PageView.webContents.loadFile(`${appdir}/src/view/notconnected.html`);
                            mainWindow.show();
                            SplashWindow.close();
                            mainWindow.center();
                        };
                    });
                });
            };
        });
    });
};

/* If all windows are closed, quit app, exept if on darwin */
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

/* App ready */
app.on('ready', () => {
    /* Create windows and tray */
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
        createTray();
    } else {
        global.mainWindow && global.mainWindow.focus();
    }
    PageView.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });
});