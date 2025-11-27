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
  blockMenu: document.getElementById("blockMenu"),
  allowMenu: document.getElementById("allowMenu"),
  btnBlockExact: document.getElementById("btnBlockExact"),
  btnBlockWildcard: document.getElementById("btnBlockWildcard"),
  btnBlockCancel: document.getElementById("btnBlockCancel"),
  btnAllowExact: document.getElementById("btnAllowExact"),
  btnAllowWildcard: document.getElementById("btnAllowWildcard"),
  btnAllowCancel: document.getElementById("btnAllowCancel"),
  speedSection: document.getElementById("speedSection"),
  statsSection: document.getElementById("statsSection"),
  offlineMessage: document.getElementById("offlineMessage"),
  downloadSpeed: document.getElementById("downloadSpeed"),
  uploadSpeed: document.getElementById("uploadSpeed"),
  activeCount: document.getElementById("activeCount"),
  waitingCount: document.getElementById("waitingCount"),
  stoppedCount: document.getElementById("stoppedCount"),
  btnWebUI: document.getElementById("btnWebUI"),
  btnSettings: document.getElementById("btnSettings"),
};

let aria2 = null;
let refreshInterval = null;
let currentHostname = "";
let filterSites = [];
let siteFilterMode = "blacklist";

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

// Check if hostname is in a list (using wildcard matching)
function isInList(list, hostname) {
  return list.some((pattern) => {
    if (!pattern) return false;

    // Same wildcard logic as common.js
    // * matches any characters except dots (single subdomain part)
    let regexPattern = pattern.replace(/\./g, "\\.");
    regexPattern = regexPattern.replace(/\*/g, "[^.]*");

    const regex = new RegExp("^" + regexPattern + "$", "i");
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

  const inList = isInList(filterSites, currentHostname);

  if (inList) {
    if (siteFilterMode === "whitelist") {
      elements.siteStatus.textContent =
        browser.i18n.getMessage("siteAllowed") || "Allowed";
      elements.siteStatus.className = "site-status allowed";
    } else {
      elements.siteStatus.textContent =
        browser.i18n.getMessage("siteBlocked") || "Blocked";
      elements.siteStatus.className = "site-status blocked";
    }
    elements.btnAllow.style.display = "none";
    elements.btnBlock.style.display = "none";
    elements.btnRemove.style.display = "";
  } else {
    elements.siteStatus.textContent =
      browser.i18n.getMessage("currentSite") || "Current site";
    elements.siteStatus.className = "site-status";
    elements.btnAllow.style.display = siteFilterMode === "whitelist" ? "" : "none";
    elements.btnBlock.style.display = siteFilterMode === "blacklist" ? "" : "none";
    elements.btnRemove.style.display = "none";
  }
}

// Get wildcard pattern for current hostname
function getWildcardPattern() {
  if (!currentHostname) return "";
  const parts = currentHostname.split(".");
  if (parts.length <= 2) {
    // For top-level domains like "example.com", use *.example.com
    return "*." + currentHostname;
  }
  // For subdomains like "www.example.com", use *.example.com (remove first part)
  return "*." + parts.slice(1).join(".");
}

// Show block menu
function showBlockMenu() {
  elements.blockMenu.style.display = "flex";
  elements.allowMenu.style.display = "none";
}

// Show allow menu
function showAllowMenu() {
  elements.allowMenu.style.display = "flex";
  elements.blockMenu.style.display = "none";
}

// Hide menus
function hideMenus() {
  elements.blockMenu.style.display = "none";
  elements.allowMenu.style.display = "none";
}

// Add site to list (exact match)
function addToListExact() {
  if (!currentHostname) return;

  if (!filterSites.includes(currentHostname)) {
    filterSites.push(currentHostname);
  }

  hideMenus();
  saveSiteLists();
}

// Add site to list (wildcard)
function addToListWildcard() {
  if (!currentHostname) return;
  const pattern = getWildcardPattern();

  if (!filterSites.includes(pattern)) {
    filterSites.push(pattern);
  }

  hideMenus();
  saveSiteLists();
}

// Remove site from list
function removeFromLists() {
  if (!currentHostname) return;

  const pattern = getWildcardPattern();
  filterSites = filterSites.filter((s) => s !== currentHostname && s !== pattern);

  saveSiteLists();
}

// Save site lists to storage
function saveSiteLists() {
  const filterSitesText = arrayToText(filterSites);

  browser.storage.local.set(
    {
      filterSites: filterSitesText,
      siteFilterMode: siteFilterMode,
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
  filterSites = parseTextList(prefs.filterSites);
  siteFilterMode = prefs.siteFilterMode || "blacklist";

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

// Open Web UI
async function openWebUI() {
  // Get current server config
  const storage = await browser.storage.local.get([
    "rpcServers",
    "defaultServerId",
  ]);

  let config = null;

  // Parse servers and get default server config
  try {
    const servers = JSON.parse(storage.rpcServers || "[]");
    if (servers.length > 0) {
      const defaultServerId = storage.defaultServerId || servers[0].id;
      const server =
        servers.find((s) => s.id === defaultServerId) || servers[0];

      config = {
        protocol: server.protocol || "ws",
        host: server.host || "127.0.0.1",
        port: server.port || "6800",
        path: server.interf || "jsonrpc",
        secret: server.token || "",
      };
    }
  } catch (e) {
    console.warn("Failed to load server config:", e);
  }

  // Build URL with config hash parameter
  let url = "/data/webui/index.html";
  if (config) {
    url += "#config=" + encodeURIComponent(JSON.stringify(config));
  }

  browser.tabs.create({ url });
  window.close();
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
  elements.btnAllow.addEventListener("click", showAllowMenu);
  elements.btnBlock.addEventListener("click", showBlockMenu);
  elements.btnRemove.addEventListener("click", removeFromLists);

  // Block menu listeners
  elements.btnBlockExact.addEventListener("click", addToListExact);
  elements.btnBlockWildcard.addEventListener("click", addToListWildcard);
  elements.btnBlockCancel.addEventListener("click", hideMenus);

  // Allow menu listeners
  elements.btnAllowExact.addEventListener("click", addToListExact);
  elements.btnAllowWildcard.addEventListener("click", addToListWildcard);
  elements.btnAllowCancel.addEventListener("click", hideMenus);

  elements.btnWebUI.addEventListener("click", openWebUI);
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
