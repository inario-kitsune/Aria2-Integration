"use strict";

function restore() {
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

  // Check connection status for default server
  browser.storage.local.get(config.command.guess, function (item) {
    console.log("About page - Aria2 config:", item);

    if (!item.host) {
      updateStatus(false, "Not configured");
      return;
    }

    const protocol = (item.protocol || "http").toLowerCase();
    const secure = protocol === "https" || protocol === "wss";
    const isWebSocket = protocol === "ws" || protocol === "wss";

    const options = {
      host: item.host,
      port: item.port || "6800",
      secure: secure,
      secret: item.token || "",
      path: "/" + (item.interf || "jsonrpc"),
    };

    console.log("About page - Aria2 options:", options);

    const aria2 = new Aria2(options);

    if (isWebSocket) {
      aria2.open().then(
        function () {
          aria2.getVersion().then(
            function (res) {
              console.log("Aria2 version:", res);
              updateStatus(true, "Connected", "v" + res.version);
              aria2.close();
            },
            function (err) {
              console.log("getVersion error:", err);
              updateStatus(false, "Disconnected");
              aria2.close();
            },
          );
        },
        function (err) {
          console.log("WebSocket open error:", err);
          updateStatus(false, "Disconnected");
        },
      );
    } else {
      // HTTP mode
      aria2.getVersion().then(
        function (res) {
          console.log("Aria2 version:", res);
          updateStatus(true, "Connected", "v" + res.version);
        },
        function (err) {
          console.log("getVersion error:", err);
          updateStatus(false, "Disconnected");
        },
      );
    }
  });
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
