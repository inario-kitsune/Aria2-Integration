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
    if (!item.host) {
      updateStatus(false, "Not configured");
      return;
    }

    const secure =
      item.protocol?.toLowerCase() === "https" ||
      item.protocol?.toLowerCase() === "wss";

    const options = {
      host: item.host,
      port: item.port,
      secure: secure,
      secret: item.token,
      path: "/" + item.interf,
    };

    const aria2 = new Aria2(options);
    aria2.getVersion().then(
      function (res) {
        updateStatus(true, "Connected", "v" + res.version);
      },
      function (err) {
        console.log(err);
        updateStatus(false, "Disconnected");
      },
    );
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
