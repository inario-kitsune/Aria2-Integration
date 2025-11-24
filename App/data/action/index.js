"use strict";

// DOM Elements
const elements = {
  switch: document.getElementById("switch"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  version: document.getElementById("version"),
  speedSection: document.getElementById("speedSection"),
  statsSection: document.getElementById("statsSection"),
  offlineMessage: document.getElementById("offlineMessage"),
  downloadSpeed: document.getElementById("downloadSpeed"),
  uploadSpeed: document.getElementById("uploadSpeed"),
  activeCount: document.getElementById("activeCount"),
  waitingCount: document.getElementById("waitingCount"),
  stoppedCount: document.getElementById("stoppedCount"),
  btnAriaNg: document.getElementById("btnAriaNg"),
  btnSettings: document.getElementById("btnSettings"),
};

let aria2 = null;
let refreshInterval = null;

// Utility: Format bytes to human readable
function formatSpeed(bytes) {
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Update connection status UI
function updateStatus(connected, version = "") {
  elements.statusDot.className = "status-dot" + (connected ? " connected" : "");
  elements.statusText.textContent = connected
    ? browser.i18n.getMessage("status_connected") || "Connected"
    : browser.i18n.getMessage("status_disconnected") || "Disconnected";
  elements.version.textContent = version ? "v" + version : "";

  // Show/hide sections based on connection
  elements.speedSection.classList.toggle("hidden", !connected);
  elements.statsSection.classList.toggle("hidden", !connected);
  elements.offlineMessage.classList.toggle("show", !connected);
}

// Update stats UI
function updateStats(stats) {
  elements.downloadSpeed.textContent = formatSpeed(
    parseInt(stats.downloadSpeed) || 0,
  );
  elements.uploadSpeed.textContent = formatSpeed(
    parseInt(stats.uploadSpeed) || 0,
  );
  elements.activeCount.textContent = stats.numActive || "0";
  elements.waitingCount.textContent = stats.numWaiting || "0";
  elements.stoppedCount.textContent = stats.numStopped || "0";
}

// Initialize Aria2 connection
async function initAria2() {
  try {
    const item = await browser.storage.local.get(config.command.guess);

    if (!item.host) {
      updateStatus(false);
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

    aria2 = new Aria2(options);

    // Check connection and get version
    const isWebSocket =
      item.protocol?.toLowerCase() === "ws" ||
      item.protocol?.toLowerCase() === "wss";

    if (isWebSocket) {
      await aria2.open();
    }

    const versionInfo = await aria2.getVersion();
    updateStatus(true, versionInfo.version);

    // Start refreshing stats
    refreshStats();
    refreshInterval = setInterval(refreshStats, 1000);
  } catch (err) {
    console.error("Aria2 connection failed:", err);
    updateStatus(false);
  }
}

// Refresh global stats
async function refreshStats() {
  if (!aria2) return;

  try {
    const stats = await aria2.getGlobalStat();
    updateStats(stats);
  } catch (err) {
    console.error("Failed to get stats:", err);
    updateStatus(false);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
}

// Toggle extension enabled state
function handleToggle(e) {
  const enabled = e.target.checked;
  browser.runtime.sendMessage({
    get: "changeState",
    checked: enabled,
  });
}

// Open AriaNg
function openAriaNg() {
  browser.storage.local.get("initialize", (item) => {
    if (!item.initialize) {
      browser.runtime.openOptionsPage();
      browser.notifications.create({
        type: "basic",
        iconUrl: "/data/icons/48.png",
        title: browser.i18n.getMessage("extensionName"),
        message: browser.i18n.getMessage("error_setConfig"),
      });
      return;
    }

    browser.storage.local.get(config.command.guess, (item) => {
      let ariangUrl = "../../data/ariang/index.html";
      if (item.autoSet) {
        ariangUrl += "#!/settings/rpc/set/";
        ariangUrl +=
          item.protocol +
          "/" +
          item.host +
          "/" +
          item.port +
          "/" +
          item.interf +
          "/" +
          btoa(item.token || "");
      }
      browser.tabs.create({ url: ariangUrl });
      window.close();
    });
  });
}

// Open Settings
function openSettings() {
  browser.runtime.openOptionsPage();
  window.close();
}

// Apply i18n
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const message = browser.i18n.getMessage(key);
    if (message) {
      el.textContent = message;
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Apply translations
  applyI18n();

  // Load enabled state
  browser.storage.local.get("enabled", (item) => {
    elements.switch.checked = item.enabled;
  });

  // Event listeners
  elements.switch.addEventListener("change", handleToggle);
  elements.btnAriaNg.addEventListener("click", openAriaNg);
  elements.btnSettings.addEventListener("click", openSettings);

  // Initialize Aria2 connection
  browser.storage.local.get("initialize", (item) => {
    if (item.initialize) {
      initAria2();
    } else {
      updateStatus(false);
    }
  });
});

// Cleanup on unload
window.addEventListener("unload", () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (aria2 && aria2.close) {
    aria2.close();
  }
});
