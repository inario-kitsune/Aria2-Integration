import { writable } from "svelte/store";
import { Aria2Client } from "../lib/aria2-client.js";

let clientInstance = null;

function createClientStore() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    initialize: (config) => {
      if (clientInstance) {
        clientInstance.disconnect();
      }
      clientInstance = new Aria2Client(config);
      set(clientInstance);
      return clientInstance;
    },
    connect: async () => {
      if (clientInstance) {
        await clientInstance.connect();
      }
    },
    disconnect: () => {
      if (clientInstance) {
        clientInstance.disconnect();
      }
    },
    getInstance: () => clientInstance,
  };
}

export const aria2Client = createClientStore();
export const connected = writable(false);

// Update connection status
if (typeof window !== "undefined") {
  aria2Client.subscribe((client) => {
    if (client) {
      // Don't auto-set to true on WebSocket connect
      // Wait for verification in App.svelte
      client.on("disconnected", () => connected.set(false));
      client.on("error", () => connected.set(false));
    }
  });
}
