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
  btnSave: document.getElementById("btnSave"),
  btnSaveAs: document.getElementById("btnSaveAs"),
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

// Save with browser
async function save() {
  if (!(await validateFileName())) return;

  const data = getFormData();
  const windowInfo = await browser.windows.getCurrent();

  const sending = browser.runtime.sendMessage({
    get: "save",
    url: data.url,
    fileName: data.fileName,
    filePath: data.filePath,
    header: data.header,
    incognito: windowInfo.incognito,
  });
  sending.then(handleResponse, handleError);
  saveWinLoc();
}

// Save As with browser
async function saveAs() {
  if (!(await validateFileName())) return;

  const data = getFormData();
  const windowInfo = await browser.windows.getCurrent();

  const sending = browser.runtime.sendMessage({
    get: "saveas",
    url: data.url,
    fileName: data.fileName,
    filePath: data.filePath,
    header: data.header,
    wid: windowInfo.id,
    incognito: windowInfo.incognito,
  });
  sending.then(handleResponse, handleError);
  saveWinLoc();
}

// Toggle advanced section
function toggleAdvanced() {
  isAdvancedExpanded = !isAdvancedExpanded;
  elements.advancedSection.classList.toggle("show", isAdvancedExpanded);
  elements.toggleAdvanced.classList.toggle("expanded", isAdvancedExpanded);

  // Adjust window height
  browser.windows.getCurrent().then((windowInfo) => {
    const heightDelta = isAdvancedExpanded ? 120 : -120;
    browser.windows.update(windowInfo.id, {
      height: windowInfo.height + heightDelta,
    });
  });
}

// Decode filename with charset detection
function decodeFn(fn) {
  const detected = jschardet.detect(fn);
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
  elements.btnSave.addEventListener("click", save);
  elements.btnSaveAs.addEventListener("click", saveAs);
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
