import { ipcMain, WebContents, webContents, WebFrameMain } from "electron";
import { getUIPath } from "./pathResolver.js";
import { pathToFileURL } from "url";

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(key: string, handler: () => EventPayloadMapping[Key]) {
    ipcMain.handle(key, (event) => {
        validateEventFrame(event.sender.mainFrame);
        return handler();
    });
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(key: string, handler: (payload: EventPayloadMapping[Key]) => void) {
    ipcMain.on(key, (event, payload) => {
        validateEventFrame(event.sender.mainFrame);
        return handler(payload);
    });
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(key: string, webContents: WebContents, payload: EventPayloadMapping[Key]) {
    webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain) {
    // Allow Vite dev server in development 
    // console.log(frame.url);

    if (isDev() && new URL(frame.url).host === 'localhost:5123') {
        return;
    }

    // =
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error('Malicious event');
    }
}
