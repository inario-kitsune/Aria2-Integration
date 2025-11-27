"use strict";

function restore() {
  // Display extension version from manifest
  const manifest = browser.runtime.getManifest();
  document.getElementById("extensionVersion").textContent = `Version ${manifest.version}`;

  // Apply i18n
  document.querySelectorAll("[data-message]").forEach((n) => {
    n.textContent = browser.i18n.getMessage(n.dataset.message);
  });
  document.body.style.direction = browser.i18n.getMessage("direction");

  // Show translator section if available
  const translatorMsg = browser.i18n.getMessage("translatorMessage");
  if (translatorMsg && translatorMsg.trim()) {
    document.getElementById("translatorSection").style.display = "block";
    document.getElementById("translatorMessage").textContent = translatorMsg;
  }

  // Check connection status for active server
  browser.storage.local.get(
    ["rpcServers", "activeServerId"],
    function (storage) {
      // Parse server list
      let servers = [];
      try {
        servers = JSON.parse(storage.rpcServers || "[]");
      } catch (e) {
        console.error("Failed to parse rpcServers", e);
        updateStatus(false, "Not configured");
        return;
      }

      if (servers.length === 0) {
        updateStatus(false, "Not configured");
        return;
      }

      // Get active server
      const activeServerId = storage.activeServerId || servers[0].id;
      const server = servers.find((s) => s.id === activeServerId) || servers[0];

      const protocol = (server.protocol || "ws").toLowerCase();
      const secure = protocol === "https" || protocol === "wss";
      const isWebSocket = protocol === "ws" || protocol === "wss";

      const options = {
        host: server.host,
        port: server.port || "6800",
        secure: secure,
        secret: server.token || "",
        path: "/" + (server.interf || "jsonrpc"),
      };

      const aria2 = new Aria2Client(options);

      if (isWebSocket) {
        aria2
          .open()
          .then(() => aria2.getVersion())
          .then((res) => {
            updateStatus(true, "Connected", "v" + res.version);
            aria2.close();
          })
          .catch((err) => {
            console.error("WebSocket connection error:", err);
            updateStatus(false, "Disconnected");
            aria2.close();
          });
      } else {
        // HTTP mode
        aria2
          .getVersion()
          .then((res) => {
            updateStatus(true, "Connected", "v" + res.version);
          })
          .catch((err) => {
            console.error("HTTP getVersion error:", err);
            updateStatus(false, "Disconnected");
          });
      }
    },
  );
}

function updateStatus(connected, text, version = "") {
  const dot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const statusVersion = document.getElementById("statusVersion");

  dot.className = "status-dot" + (connected ? " connected" : "");
  statusText.textContent = text;
  statusVersion.textContent = version;
}

document.addEventListener("DOMContentLoaded", restore);
