"use strict";

// DOM Elements
const elements = {
  fileName: document.getElementById("fileName"),
  filePath: document.getElementById("filePath"),
  fileSize: document.getElementById("fileSize"),
  url: document.getElementById("url"),
  serverSelect: document.getElementById("serverSelect"),
  headers: document.getElementById("headers"),
  advancedSection: document.getElementById("advancedSection"),
  toggleAdvanced: document.getElementById("toggleAdvanced"),
  btnDownload: document.getElementById("btnDownload"),
};

let isAdvancedExpanded = false;

// Handle response from background script
function handleResponse(message) {
  switch (message.response) {
    case "all":
      elements.url.value = message.url;
      elements.fileSize.textContent = message.fileSize;
      elements.fileName.value = decodeFn(message.fileName);
      elements.headers.value = Array.isArray(message.header)
        ? message.header.join("\n")
        : message.header;
      elements.btnDownload.focus();
      break;
    case "send success":
      browser.windows.getCurrent().then((windowInfo) => {
        browser.windows.remove(windowInfo.id);
      });
      break;
    case "saveas create":
      break;
    default:
      console.log("Message:", message);
  }
}

// Handle errors
function handleError(error) {
  browser.notifications.create({
    type: "basic",
    iconUrl: "/data/icons/48.png",
    title: browser.i18n.getMessage("extensionName"),
    message: error.message || String(error),
  });
}

// Save window location if enabled
function saveWinLoc() {
  browser.storage.local.get(config.command.guess, (item) => {
    if (item.windowLoc) {
      browser.windows.getCurrent().then((windowInfo) => {
        browser.storage.local.set({
          dpTop: windowInfo.top,
          dpLeft: windowInfo.left,
        });
      });
    }
  });
}

// Validate filename and show error if invalid
function validateFileName() {
  return new Promise((resolve) => {
    const fn = elements.fileName.value;
    verifyFileName(fn).then((errors) => {
      if (errors.length > 0) {
        elements.fileName.classList.add("error");
        elements.fileName.addEventListener("input", function handler() {
          elements.fileName.classList.remove("error");
          elements.fileName.removeEventListener("input", handler);
        });
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Get form data
function getFormData() {
  return {
    url: elements.url.value,
    fileName: elements.fileName.value,
    filePath: elements.filePath.value,
    header: elements.headers.value.split("\n").filter((h) => h.trim()),
    server: elements.serverSelect.value,
  };
}

// Download with Aria2
async function download() {
  if (!(await validateFileName())) return;

  const data = getFormData();
  const sending = browser.runtime.sendMessage({
    get: "download",
    url: data.url,
    fileName: data.fileName,
    filePath: data.filePath,
    header: data.header,
    server: data.server,
  });
  sending.then(handleResponse, handleError);
  saveWinLoc();
}

// Toggle advanced section
function toggleAdvanced() {
  isAdvancedExpanded = !isAdvancedExpanded;
  elements.advancedSection.classList.toggle("show", isAdvancedExpanded);
  elements.toggleAdvanced.classList.toggle("expanded", isAdvancedExpanded);

  // Adjust window height with minimum height constraint
  browser.windows.getCurrent().then((windowInfo) => {
    const heightDelta = isAdvancedExpanded ? 120 : -120;
    const newHeight = windowInfo.height + heightDelta;
    const minHeight = 380; // Minimum height to ensure Download button is visible

    browser.windows.update(windowInfo.id, {
      height: Math.max(newHeight, minHeight),
    });
  });
}

// Decode filename with charset detection
function decodeFn(fn) {
  const detected = detectEncoding(fn);
  if (detected.encoding && detected.encoding.toLowerCase() !== "ascii") {
    try {
      const decoder = new TextDecoder(detected.encoding);
      const charCodes = [];
      for (let i = 0; i < fn.length; i++) {
        charCodes.push(fn.charCodeAt(i));
      }
      return decoder.decode(new Uint8Array(charCodes));
    } catch (e) {
      console.error("Decode error:", e);
      return fn;
    }
  }
  return fn;
}

// Load server list
function loadServerList() {
  browser.storage.local.get(["rpcServers", "activeServerId"], (storage) => {
    let servers = [];
    try {
      servers = JSON.parse(storage.rpcServers || "[]");
    } catch (e) {
      console.error("Failed to parse rpcServers", e);
    }

    const select = elements.serverSelect;
    select.innerHTML = "";

    if (servers.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No servers configured";
      select.appendChild(option);
      return;
    }

    servers.forEach((server) => {
      const option = document.createElement("option");
      option.value = server.id;
      option.textContent = server.name || "Unnamed Server";
      if (server.id === storage.activeServerId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  });
}

// Apply i18n translations
function applyI18n() {
  document.querySelectorAll("[data-message]").forEach((el) => {
    const key = el.dataset.message;
    const message = browser.i18n.getMessage(key);
    if (message) {
      if (el.tagName === "OPTION") {
        el.textContent = message;
      } else {
        el.textContent = message;
      }
    }
  });

  const direction = browser.i18n.getMessage("direction");
  if (direction) {
    document.body.style.direction = direction;
  }
}

// Initialize
function init() {
  // Request download info from background
  browser.runtime.sendMessage({ get: "all" }).then(handleResponse, handleError);

  // Load server list
  loadServerList();

  // Apply zoom
  browser.storage.local.get(config.command.guess, (item) => {
    if (item.zoom && item.zoom !== 1) {
      document.documentElement.style.transformOrigin = "left top";
      document.documentElement.style.transform = `scale(${item.zoom})`;
    }
  });

  // Apply translations
  applyI18n();

  // Event listeners
  elements.btnDownload.addEventListener("click", download);
  elements.toggleAdvanced.addEventListener("click", toggleAdvanced);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      download();
    } else if (e.key === "Escape") {
      browser.windows.getCurrent().then((windowInfo) => {
        browser.windows.remove(windowInfo.id);
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
