import { contextBridge, ipcRenderer } from 'electron';

export const api = {
    on: (channel: string, callback: Function) => {
        console.log('on', channel);
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
};

contextBridge.exposeInMainWorld('Api', api);
