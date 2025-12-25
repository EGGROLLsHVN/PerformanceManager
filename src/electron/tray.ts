import { app, BrowserWindow, Menu, Tray } from "electron";
import { getAssetPath } from "./pathResolver.js";
import path from "path";
import { ipcWebContentsSend } from "./util.js";

export function createTray(mainWindow: BrowserWindow) {
    const tray = new Tray(path.join(getAssetPath(), process.platform === 'darwin' ? 'icontiny.png' : 'whiteicontiny.png'))

    tray.setContextMenu(Menu.buildFromTemplate([
        {
        label: 'Open',
        click: () => {
            mainWindow.show();
            if (app.dock) {
                app.dock.show();
            }},
        },
        {
        label: 'Quit',
        click: () => app.quit(),
        },
        // {
        // label:"View",
        // type: "submenu",
        // submenu: [
        //     {
        //     label: "CPU",
        //     click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "CPU"),
        //     },
        //     {
        //     label: "RAM",
        //     click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "RAM"),
        //     },
        //     {
        //     label: "STORAGE",
        //     click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "STORAGE"),
        //     }],
        // }
    ])) 
}