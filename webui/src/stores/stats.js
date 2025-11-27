import { writable } from "svelte/store";
import { aria2Client, connected } from "./client.js";

export const stats = writable({
  downloadSpeed: 0,
  uploadSpeed: 0,
  numActive: 0,
  numWaiting: 0,
  numStopped: 0,
});

let statsInterval = null;

export function startStatsUpdates() {
  if (statsInterval) return;

  statsInterval = setInterval(async () => {
    const client = aria2Client.getInstance();
    if (!client) return;

    try {
      const globalStat = await client.getGlobalStat();
      stats.set({
        downloadSpeed: parseInt(globalStat.downloadSpeed) || 0,
        uploadSpeed: parseInt(globalStat.uploadSpeed) || 0,
        numActive: parseInt(globalStat.numActive) || 0,
        numWaiting: parseInt(globalStat.numWaiting) || 0,
        numStopped: parseInt(globalStat.numStopped) || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // If unauthorized or connection error, mark as disconnected
      if (
        error.message &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("Not connected"))
      ) {
        connected.set(false);
        stopStatsUpdates();
      }
    }
  }, 1000);
}

export function stopStatsUpdates() {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
}
