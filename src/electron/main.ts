import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from "electron";
import path from 'path';
import { ipcMainHandle, ipcMainOn, isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getAssetPath, getPreloadPath, getUIPath } from "./pathResolver.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";

// Disable menu (bar at the top)
//Menu.setApplicationMenu(null);



app.on("ready", ()=> {
    const primaryDisplay = screen.getPrimaryDisplay();
    const {width, height } = primaryDisplay.workAreaSize;

    const windowWidth = Math.floor(width * 0.6);
    const windowHeight = Math.floor(height * 0.6);

    const mainWindow = new BrowserWindow({
        width: windowWidth, 
        height: windowHeight,
        fullscreenable: false,
        resizable: false,

        webPreferences: {
            preload: getPreloadPath(),
        },

        frame: false,

    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(getUIPath())
    }

    pollResources(mainWindow);

    ipcMainHandle("getStaticData", () => {
        return getStaticData();
    })

    ipcMainOn("sendFrameAction", (payload) => {
        switch(payload) {
            case "CLOSE":
                mainWindow.close();
                break;
            case "MINIMIZE":
                mainWindow.minimize();
                break;
            case "MAXIMIZE":
                if (mainWindow.isMaximized()) {
                    mainWindow.unmaximize();
                } else {
                    mainWindow.maximize();
                }
                break;
        }
    });

    createTray(mainWindow);
    handleCloseEvents(mainWindow);
    createMenu(mainWindow);
    
});

function handleCloseEvents(mainWindow: BrowserWindow) {
    let willClose = false
    mainWindow.on("close", (e) => {
        if (willClose) {
            return; 
        }

        e.preventDefault();
        mainWindow.hide();
        if (app.dock) {
            app.dock.hide();
        }
    })

    app.on("before-quit", () => {
        willClose = true;
    })

    mainWindow.on("show", () => {
        willClose = false;

    })


}
