// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  fetchMyrientDirectory: (consoleName: string) =>
    ipcRenderer.invoke("fetch-myrient-directory", consoleName),

  copyToClipboard: (text: string) =>
    ipcRenderer.invoke("copy-to-clipboard", text),
});

// Type definition for the exposed API
export interface ElectronAPI {
  fetchMyrientDirectory: (url: string) => Promise<string>;
  copyToClipboard: (text: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
