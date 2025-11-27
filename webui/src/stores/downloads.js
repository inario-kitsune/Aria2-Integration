import { writable, derived } from "svelte/store";
import { aria2Client, connected } from "./client.js";

export const downloads = writable([]);

let updateInterval = null;

export function startDownloadUpdates() {
  if (updateInterval) return;

  updateInterval = setInterval(async () => {
    const client = aria2Client.getInstance();
    if (!client) return;

    try {
      const [active, waiting, stopped] = await Promise.all([
        client.tellActive(),
        client.tellWaiting(0, 100),
        client.tellStopped(0, 100),
      ]);

      downloads.set([...active, ...waiting, ...stopped.slice(0, 10)]);
    } catch (error) {
      console.error("Failed to fetch downloads:", error);
      // If unauthorized or connection error, mark as disconnected
      if (
        error.message &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("Not connected"))
      ) {
        connected.set(false);
        stopDownloadUpdates();
      }
    }
  }, 1000);
}

export function stopDownloadUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

export const activeDownloads = derived(downloads, ($downloads) =>
  $downloads.filter((d) => d.status === "active"),
);

export const waitingDownloads = derived(downloads, ($downloads) =>
  $downloads.filter((d) => d.status === "waiting"),
);

export const stoppedDownloads = derived(downloads, ($downloads) =>
  $downloads.filter(
    (d) =>
      d.status === "complete" || d.status === "error" || d.status === "removed",
  ),
);
