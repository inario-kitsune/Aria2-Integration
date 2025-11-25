"use strict";

function save() {
  const altKeyBypass = document.getElementById("altKeyBypass").checked;
  const allowedSites = document.getElementById("allowedSites").value;
  const blockedSites = document.getElementById("blockedSites").value;
  const allowedExts = document.getElementById("allowedExts").value;
  const blockedExts = document.getElementById("blockedExts").value;
  const minFileSize = document.getElementById("minFileSize").value;

  browser.storage.local.set(
    {
      altKeyBypass,
      allowedSites,
      blockedSites,
      allowedExts,
      blockedExts,
      minFileSize,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = browser.i18n.getMessage("OP_saveComplete");
      setTimeout(() => {
        status.textContent = "";
      }, 750);
      browser.runtime.sendMessage({
        get: "loadSettings",
      });
    },
  );
}

function restore() {
  browser.storage.local.get(config.command.guess, (prefs) => {
    document.getElementById("altKeyBypass").checked =
      prefs.altKeyBypass !== false;
    document.getElementById("allowedSites").value = prefs.allowedSites || "";
    document.getElementById("blockedSites").value = prefs.blockedSites || "";
    document.getElementById("allowedExts").value = prefs.allowedExts || "";
    document.getElementById("blockedExts").value = prefs.blockedExts || "";
    document.getElementById("minFileSize").value = prefs.minFileSize || 0;
  });

  // Apply i18n
  document.querySelectorAll("[data-message]").forEach((n) => {
    const msg = browser.i18n.getMessage(n.dataset.message);
    if (msg) n.textContent = msg;
  });
  document.body.style.direction = browser.i18n.getMessage("direction");
}

document.addEventListener("DOMContentLoaded", restore);
document.getElementById("save").addEventListener("click", save);
