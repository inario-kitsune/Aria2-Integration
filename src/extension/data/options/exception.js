"use strict";

// State
let siteList = [];
let extList = [];
let siteFilterMode = "blacklist"; // 'whitelist' or 'blacklist'
let extFilterMode = "blacklist"; // 'whitelist' or 'blacklist'

// Render site list
function renderSiteList() {
  const container = document.getElementById("siteList");
  container.innerHTML = "";

  siteList.forEach((site, index) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const text = document.createElement("span");
    text.className = "list-item-text";
    text.textContent = site;

    const removeBtn = document.createElement("button");
    removeBtn.className = "list-item-remove";
    removeBtn.textContent =
      browser.i18n.getMessage("OP_remove") || "Remove";
    removeBtn.onclick = () => {
      siteList.splice(index, 1);
      renderSiteList();
    };

    item.appendChild(text);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

// Render extension list
function renderExtList() {
  const container = document.getElementById("extList");
  container.innerHTML = "";

  extList.forEach((ext, index) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const text = document.createElement("span");
    text.className = "list-item-text";
    text.textContent = ext;

    const removeBtn = document.createElement("button");
    removeBtn.className = "list-item-remove";
    removeBtn.textContent =
      browser.i18n.getMessage("OP_remove") || "Remove";
    removeBtn.onclick = () => {
      extList.splice(index, 1);
      renderExtList();
    };

    item.appendChild(text);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

// Add site
function addSite() {
  const input = document.getElementById("siteInput");
  const value = input.value.trim();

  if (!value) return;

  if (siteList.includes(value)) {
    alert(
      browser.i18n.getMessage("OP_alreadyExists") || "Already in the list",
    );
    return;
  }

  siteList.push(value);
  input.value = "";
  renderSiteList();
}

// Add extension
function addExt() {
  const input = document.getElementById("extInput");
  let value = input.value.trim();

  if (!value) return;

  // Auto-add dot if missing
  if (!value.startsWith(".")) {
    value = "." + value;
  }

  if (extList.includes(value)) {
    alert(
      browser.i18n.getMessage("OP_alreadyExists") || "Already in the list",
    );
    return;
  }

  extList.push(value);
  input.value = "";
  renderExtList();
}

// Toggle site filter mode
function toggleSiteFilterMode(mode) {
  siteFilterMode = mode;
  document.getElementById("siteFilterWhitelist").classList.toggle("active", mode === "whitelist");
  document.getElementById("siteFilterBlacklist").classList.toggle("active", mode === "blacklist");
}

// Toggle ext filter mode
function toggleExtFilterMode(mode) {
  extFilterMode = mode;
  document.getElementById("extFilterWhitelist").classList.toggle("active", mode === "whitelist");
  document.getElementById("extFilterBlacklist").classList.toggle("active", mode === "blacklist");
}

// Save settings
function save() {
  const altKeyBypass = document.getElementById("altKeyBypass").checked;
  const minFileSize = document.getElementById("minFileSize").value;

  // Convert arrays to text format for backward compatibility
  const siteListText = siteList.join("\n");
  const extListText = extList.join("\n");

  browser.storage.local.set(
    {
      altKeyBypass,
      minFileSize,
      siteFilterMode,
      extFilterMode,
      // Store in the new format
      filterSites: siteListText,
      filterExts: extListText,
      // Clear old format
      allowedSites: "",
      blockedSites: "",
      allowedExts: "",
      blockedExts: "",
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

// Restore settings
function restore() {
  browser.storage.local.get(config.command.guess, (prefs) => {
    // Restore basic settings
    document.getElementById("altKeyBypass").checked =
      prefs.altKeyBypass !== false;
    document.getElementById("minFileSize").value = prefs.minFileSize || 0;

    // Restore filter modes
    siteFilterMode = prefs.siteFilterMode || "blacklist";
    extFilterMode = prefs.extFilterMode || "blacklist";
    toggleSiteFilterMode(siteFilterMode);
    toggleExtFilterMode(extFilterMode);

    // Migration: Convert old format to new format
    let sitesText = prefs.filterSites || "";
    let extsText = prefs.filterExts || "";

    // If new format is empty, try to migrate from old format
    if (!sitesText) {
      if (siteFilterMode === "whitelist") {
        sitesText = prefs.allowedSites || "";
      } else {
        sitesText = prefs.blockedSites || "";
      }
    }

    if (!extsText) {
      if (extFilterMode === "whitelist") {
        extsText = prefs.allowedExts || "";
      } else {
        extsText = prefs.blockedExts || "";
      }
    }

    // Parse lists
    siteList = sitesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    extList = extsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    renderSiteList();
    renderExtList();
  });

  // Apply i18n
  document.querySelectorAll("[data-message]").forEach((n) => {
    const msg = browser.i18n.getMessage(n.dataset.message);
    if (msg) n.textContent = msg;
  });

  // Apply i18n for placeholders
  document.querySelectorAll("[data-message-placeholder]").forEach((n) => {
    const msg = browser.i18n.getMessage(n.dataset.messagePlaceholder);
    if (msg) n.placeholder = msg;
  });

  // Apply i18n for empty messages
  document.querySelectorAll("[data-message-empty]").forEach((n) => {
    const msg = browser.i18n.getMessage(n.dataset.messageEmpty);
    if (msg) n.dataset.emptyMessage = msg;
  });

  document.body.style.direction = browser.i18n.getMessage("direction");
}

// Event listeners
document.addEventListener("DOMContentLoaded", restore);
document.getElementById("save").addEventListener("click", save);
document.getElementById("addSite").addEventListener("click", addSite);
document.getElementById("addExt").addEventListener("click", addExt);

// Allow Enter key to add items
document.getElementById("siteInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addSite();
});
document.getElementById("extInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addExt();
});

// Mode toggle listeners
document
  .getElementById("siteFilterWhitelist")
  .addEventListener("click", () => toggleSiteFilterMode("whitelist"));
document
  .getElementById("siteFilterBlacklist")
  .addEventListener("click", () => toggleSiteFilterMode("blacklist"));
document
  .getElementById("extFilterWhitelist")
  .addEventListener("click", () => toggleExtFilterMode("whitelist"));
document
  .getElementById("extFilterBlacklist")
  .addEventListener("click", () => toggleExtFilterMode("blacklist"));
