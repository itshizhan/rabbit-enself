import {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut 
} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path')
        .join(__dirname, '/static')
        .replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`

//const express = require('/app.js');

const express = require("express");
const apicache = require("apicache");
const path = require("path");
const fs = require("fs");
let cache = apicache.middleware;
let downFileName = "";//下载的
import routes from './routers'
import Vue from 'vue';

function createWindow() {
    const app = express();

    // 跨域设置
    app.all("*", function(req, res, next) {
        if (req.path !== "/" && !req.path.includes(".")) {
            res.header("Access-Control-Allow-Credentials", true);
            // 这里获取 origin 请求头 而不是用 *
            res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("Content-Type", "application/json;charset=utf-8");
        }
        next();
    });

    const onlyStatus200 = (req, res) => res.statusCode === 200;

    app.use(cache("2 minutes", onlyStatus200));

    app.use(express.static(path.resolve(__dirname, "public")));

    app.use(function(req, res, next) {
        const proxy = req.query.proxy;
        if (proxy) {
            req.headers.cookie = req.headers.cookie + `__proxy__${proxy}`;
        }
        next();
    });


    app.use('/', routes);
    const port = 3000;
    app.listen(port, () => {
        console.log(`server running @ http://localhost:${port}`);
    });
    //express();
    /**
     * Initial window options
     * {fullscreen: true}
     */
    mainWindow = new BrowserWindow({
        //fullscreen: true,
        width: 1600,
        height: 800,
        useContentSize: true,        
        frame: false,
        resizable: true,
        skipTaskbar: false,
        transparent: false,
        title:"rabbit-ohis",
        autoHideMenuBar:true,
        x:0,
        y:0
    });

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {        
        console.log("save to local..." + downFileName);
        item.setSavePath(downFileName);
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused')
                } else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })
        item.once('done', (event, state) => {
            if (state === 'completed') {
              console.log('Download successfully')
            } else {
                console.log(`Download failed: ${state}`)
            }
        })
    })
}

app.on('ready', ()=>{
    createWindow();
    /*
    globalShortcut.register('Control+O', () => {
        console.log('saving...')
        mainWindow.webContents.send('shortcut-saving',"save");
    });
    globalShortcut.register('Control+N', () => {
        console.log('empty...')
        mainWindow.webContents.send('shortcut-saving',"new");
    });
    */
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('close',e=>{
    mainWindow.close()
})
ipcMain.on('minimize',e=>{
    mainWindow.minimize()
})
ipcMain.on('maximize',e=>{
    console.log("mainWindow.isMaximized()=" +mainWindow.isMaximized());
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
    } else {
        mainWindow.maximize()
    }
})
ipcMain.on('download', (evt, args) => {
    let arr = args.split("+");
    let downloadpath = arr[0];
    let fileName = arr[1];    
    evt.sender.send('tips',downloadpath); 
    //设置文件存放位置
    let mp3Path = `${__dirname}\\..\\mp3`
    //let localPath = `${path.resolve(mp3Path)}\\${item.getFilename()}`;
    downFileName = `${path.resolve(mp3Path)}\\${fileName}`;
    //console.log(downloadpath);     
    mainWindow.webContents.downloadURL(downloadpath);
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
