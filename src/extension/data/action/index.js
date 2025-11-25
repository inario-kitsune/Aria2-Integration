"use strict";

// DOM Elements
const elements = {
  switch: document.getElementById("switch"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  version: document.getElementById("version"),
  siteSection: document.getElementById("siteSection"),
  siteHostname: document.getElementById("siteHostname"),
  siteStatus: document.getElementById("siteStatus"),
  btnAllow: document.getElementById("btnAllow"),
  btnBlock: document.getElementById("btnBlock"),
  btnRemove: document.getElementById("btnRemove"),
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
let currentHostname = "";
let allowedSites = [];
let blockedSites = [];

// Utility: Format bytes to human readable
function formatSpeed(bytes) {
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Parse text list to array
function parseTextList(text) {
  if (!text) return [];
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Convert array back to text
function arrayToText(arr) {
  return arr.filter((s) => s).join("\n");
}

// Check if hostname is in a list
function isInList(list, hostname) {
  return list.some((pattern) => {
    if (!pattern) return false;
    const regex = new RegExp(
      "^" +
        pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
        "$",
      "i",
    );
    return regex.test(hostname);
  });
}

// Update site filter UI
function updateSiteUI() {
  if (!currentHostname) {
    elements.siteHostname.textContent = "-";
    elements.siteStatus.textContent =
      browser.i18n.getMessage("currentSite") || "Current site";
    elements.siteStatus.className = "site-status";
    elements.btnAllow.style.display = "";
    elements.btnBlock.style.display = "";
    elements.btnRemove.style.display = "none";
    return;
  }

  elements.siteHostname.textContent = currentHostname;

  const inAllowed = isInList(allowedSites, currentHostname);
  const inBlocked = isInList(blockedSites, currentHostname);

  if (inAllowed) {
    elements.siteStatus.textContent =
      browser.i18n.getMessage("siteAllowed") || "Allowed";
    elements.siteStatus.className = "site-status allowed";
    elements.btnAllow.style.display = "none";
    elements.btnBlock.style.display = "none";
    elements.btnRemove.style.display = "";
  } else if (inBlocked) {
    elements.siteStatus.textContent =
      browser.i18n.getMessage("siteBlocked") || "Blocked";
    elements.siteStatus.className = "site-status blocked";
    elements.btnAllow.style.display = "none";
    elements.btnBlock.style.display = "none";
    elements.btnRemove.style.display = "";
  } else {
    elements.siteStatus.textContent =
      browser.i18n.getMessage("currentSite") || "Current site";
    elements.siteStatus.className = "site-status";
    elements.btnAllow.style.display = "";
    elements.btnBlock.style.display = "";
    elements.btnRemove.style.display = "none";
  }
}

// Add site to allowed list
function addToAllowed() {
  if (!currentHostname) return;

  // Remove from blocked if exists
  blockedSites = blockedSites.filter((s) => s !== currentHostname);

  // Add to allowed if not exists
  if (!allowedSites.includes(currentHostname)) {
    allowedSites.push(currentHostname);
  }

  saveSiteLists();
}

// Add site to blocked list
function addToBlocked() {
  if (!currentHostname) return;

  // Remove from allowed if exists
  allowedSites = allowedSites.filter((s) => s !== currentHostname);

  // Add to blocked if not exists
  if (!blockedSites.includes(currentHostname)) {
    blockedSites.push(currentHostname);
  }

  saveSiteLists();
}

// Remove site from both lists
function removeFromLists() {
  if (!currentHostname) return;

  allowedSites = allowedSites.filter((s) => s !== currentHostname);
  blockedSites = blockedSites.filter((s) => s !== currentHostname);

  saveSiteLists();
}

// Save site lists to storage
function saveSiteLists() {
  browser.storage.local.set(
    {
      allowedSites: arrayToText(allowedSites),
      blockedSites: arrayToText(blockedSites),
    },
    () => {
      updateSiteUI();
      // Notify background to reload settings
      browser.runtime.sendMessage({ get: "loadSettings" });
    },
  );
}

// Load site lists and current tab hostname
async function loadSiteInfo() {
  // Load site lists
  const prefs = await browser.storage.local.get(config.command.guess);
  allowedSites = parseTextList(prefs.allowedSites);
  blockedSites = parseTextList(prefs.blockedSites);

  // Get current tab hostname
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      if (url.protocol === "http:" || url.protocol === "https:") {
        currentHostname = url.hostname;
      }
    }
  } catch (err) {
    console.error("Failed to get current tab:", err);
  }

  updateSiteUI();
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
    const storage = await browser.storage.local.get([
      "rpcServers",
      "activeServerId",
    ]);

    // Parse server list
    let servers = [];
    try {
      servers = JSON.parse(storage.rpcServers || "[]");
    } catch (e) {
      console.error("Failed to parse rpcServers", e);
      updateStatus(false);
      return;
    }

    if (servers.length === 0) {
      updateStatus(false);
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

    aria2 = new Aria2Client(options);

    if (isWebSocket) {
      try {
        await aria2.open();
      } catch (wsErr) {
        console.error("WebSocket connection failed:", wsErr);
        updateStatus(false);
        return;
      }
    }

    aria2.getVersion().then(
      function (versionInfo) {
        updateStatus(true, versionInfo.version);
        refreshStats();
        refreshInterval = setInterval(refreshStats, 1000);
      },
      function (err) {
        console.error("getVersion failed:", err);
        updateStatus(false);
      },
    );
  } catch (err) {
    console.error("Aria2 connection failed:", err);
    updateStatus(false);
  }
}

// Refresh global stats
function refreshStats() {
  if (!aria2) return;

  aria2.getGlobalStat().then(
    function (stats) {
      updateStats(stats);
    },
    function (err) {
      console.error("Failed to get stats:", err);
      updateStatus(false);
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    },
  );
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

    browser.storage.local.get(
      ["rpcServers", "activeServerId", "autoSet"],
      (storage) => {
        let ariangUrl = "../../data/ariang/index.html";

        if (storage.autoSet) {
          // Parse server list
          let servers = [];
          try {
            servers = JSON.parse(storage.rpcServers || "[]");
          } catch (e) {
            console.error("Failed to parse rpcServers", e);
          }

          if (servers.length > 0) {
            // Get active server
            const activeServerId = storage.activeServerId || servers[0].id;
            const server =
              servers.find((s) => s.id === activeServerId) || servers[0];

            ariangUrl += "#!/settings/rpc/set/";
            ariangUrl +=
              (server.protocol || "ws") +
              "/" +
              server.host +
              "/" +
              server.port +
              "/" +
              (server.interf || "jsonrpc") +
              "/" +
              btoa(server.token || "");
          }
        }

        browser.tabs.create({ url: ariangUrl });
        window.close();
      },
    );
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
  applyI18n();

  // Load enabled state
  browser.storage.local.get("enabled", (item) => {
    elements.switch.checked = item.enabled;
  });

  // Load site info
  loadSiteInfo();

  // Event listeners
  elements.switch.addEventListener("change", handleToggle);
  elements.btnAllow.addEventListener("click", addToAllowed);
  elements.btnBlock.addEventListener("click", addToBlocked);
  elements.btnRemove.addEventListener("click", removeFromLists);
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
