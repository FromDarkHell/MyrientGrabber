import { ipcMain } from "electron";
import { net } from "electron";

/**
 * Initializes the Electron -> React IPC
 */
export default function initializeIPC() {
  ipcMain.handle("fetch-myrient-directory", async (event, url: string) => {
    try {
      console.log(`Fetching from main process: ${url}`);

      return new Promise((resolve, reject) => {
        const request = net.request(url);

        let responseData = "";

        request.on("response", (response) => {
          response.on("data", (chunk) => {
            responseData += chunk.toString();
          });

          response.on("end", () => {
            if (response.statusCode === 200) {
              resolve(responseData);
            } else {
              reject(
                new Error(
                  `HTTP ${response.statusCode}: ${response.statusMessage}`,
                ),
              );
            }
          });
        });

        request.on("error", (error) => {
          reject(error);
        });

        request.end();
      });
    } catch (error) {
      console.error("Main process fetch error:", error);
      throw error;
    }
  });

  ipcMain.handle("copy-to-clipboard", async (event, text: string) => {
    try {
      const { clipboard } = require("electron");
      clipboard.writeText(text);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      throw error;
    }
  });
}
