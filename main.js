const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;
let miniMode = false;

function createWindow() {

win = new BrowserWindow({
width: 420,
height: 600,
minWidth: 320,
minHeight: 480,
frame: false,
alwaysOnTop: true,
resizable: true,
transparent: true,
webPreferences: {
preload: path.join(__dirname, "preload.js")
}
});

win.loadFile("renderer/index.html");

}

ipcMain.on("toggle-mini-mode", () => {

miniMode = !miniMode;

if(miniMode){

win.setSize(220,120);
win.setAlwaysOnTop(true);

}else{

win.setSize(420,600);
win.setAlwaysOnTop(true);

}

});

app.whenReady().then(createWindow);
