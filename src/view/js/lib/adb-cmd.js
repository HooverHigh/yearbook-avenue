/*NodeJS Modules*/
const fs = require('fs');
const os = require('os');
const log4js = require("log4js");

/* Paths */
var appdir = path.join(__dirname, "..", "..");
const rootpath = path.join(app.getPath('userData'));
console.log(rootpath);

/* Functions */
exports.listDevices =  function() {
    adb.exec(['devices']);
};

exports.installApp =  function(apk_path) {
    adb.exec(['install', apk_path])
};

exports.uninstallApp =  function(apk_name) {
    adb.exec(['uninstall', apk_name])
};