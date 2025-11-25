"use strict";

const contentFrame = document.getElementById("contentFrame");
const pageTitle = document.getElementById("pageTitle");

// Page title mappings
const pageTitles = {
  general: "OP_general",
  rpc: "OP_rpcServer",
  exception: "OP_exception",
  about: "OP_about",
};

// Navigate to a page
function navigateTo(page) {
  // Update iframe
  contentFrame.src = page + ".html";

  // Update page title
  const titleKey = pageTitles[page] || "OP_general";
  const titleText = browser.i18n.getMessage(titleKey);
  pageTitle.textContent = titleText || page;
  pageTitle.dataset.message = titleKey;

  // Update active states
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });

  // Update URL hash
  history.replaceState(null, "", "#" + page);
}

// Apply i18n translations
function applyI18n() {
  document.querySelectorAll("[data-message]").forEach((el) => {
    const key = el.dataset.message;
    const message = browser.i18n.getMessage(key);
    if (message) {
      el.textContent = message;
    }
  });

  // Apply text direction
  const direction = browser.i18n.getMessage("direction");
  if (direction) {
    document.body.style.direction = direction;
  }
}

// Handle hash change
function handleHashChange() {
  const hash = location.hash.slice(1);
  if (hash && pageTitles[hash]) {
    navigateTo(hash);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Apply translations
  applyI18n();

  // Handle nav item clicks
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Handle initial hash or default to general
  if (location.hash) {
    handleHashChange();
  } else {
    navigateTo("general");
  }
});

// Listen for hash changes
window.addEventListener("hashchange", handleHashChange);
