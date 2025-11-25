"use strict";

let servers = [];
let activeServerId = "";
let editingServerId = null;

// 解析服务器列表
function parseServers(serversJson) {
  try {
    const parsed = JSON.parse(serversJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// 渲染服务器列表
function renderServerList() {
  const listEl = document.getElementById("serverList");
  listEl.innerHTML = "";

  if (servers.length === 0) {
    listEl.innerHTML = `<p class="form-hint" data-message="OPN_noServers">No servers configured. Click "Add Server" to create one.</p>`;
    applyI18n();
    return;
  }

  servers.forEach((server) => {
    const isActive = server.id === activeServerId;
    const serverEl = document.createElement("div");
    serverEl.className = `server-item ${isActive ? "active" : ""}`;
    serverEl.dataset.serverId = server.id;

    const details = `${server.protocol}://${server.host}:${server.port}/${server.interf}`;

    serverEl.innerHTML = `
      <input
        type="radio"
        name="activeServer"
        class="server-radio"
        ${isActive ? "checked" : ""}
        value="${server.id}"
      />
      <div class="server-info">
        <div class="server-name">${escapeHtml(server.name || "Unnamed Server")}</div>
        <div class="server-details">${escapeHtml(details)}</div>
      </div>
      <div class="server-actions">
        <button class="btn-icon edit-btn" data-id="${server.id}">
          ✏️ <span data-message="OP_edit">Edit</span>
        </button>
        ${
          servers.length > 1
            ? `<button class="btn-icon btn-delete delete-btn" data-id="${server.id}">
            🗑️ <span data-message="OP_delete">Delete</span>
          </button>`
            : ""
        }
      </div>
    `;

    // 点击整个项目选择服务器
    serverEl.addEventListener("click", (e) => {
      if (!e.target.closest(".server-actions")) {
        setActiveServer(server.id);
      }
    });

    listEl.appendChild(serverEl);
  });

  // 绑定编辑和删除按钮
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      editServer(id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      deleteServer(id);
    });
  });

  applyI18n();
}

// 设置激活的服务器
function setActiveServer(serverId) {
  activeServerId = serverId;
  saveServers();
  renderServerList();
  showStatus(
    browser.i18n.getMessage("OP_serverActivated") || "Server activated",
  );
}

// 添加新服务器
function addServer() {
  const newServer = {
    id: Date.now().toString(),
    name: "New Server",
    path: "",
    protocol: "ws",
    host: "127.0.0.1",
    port: "6800",
    interf: "jsonrpc",
    token: "",
  };

  editingServerId = newServer.id;
  showServerForm(newServer);
}

// 编辑服务器
function editServer(serverId) {
  const server = servers.find((s) => s.id === serverId);
  if (!server) return;

  editingServerId = serverId;
  showServerForm(server);
}

// 显示服务器表单
function showServerForm(server) {
  document.getElementById("formTitle").textContent =
    editingServerId && servers.find((s) => s.id === editingServerId)
      ? browser.i18n.getMessage("OP_editServer") || "Edit Server"
      : browser.i18n.getMessage("OP_addServer") || "Add Server";

  document.getElementById("serverName").value = server.name || "";
  document.getElementById("protocol").value = server.protocol || "ws";
  document.getElementById("host").value = server.host || "";
  document.getElementById("port").value = server.port || "";
  document.getElementById("interf").value = server.interf || "";
  document.getElementById("token").value = server.token || "";
  document.getElementById("path").value = server.path || "";

  document.getElementById("serverForm").classList.add("show");
}

// 隐藏服务器表单
function hideServerForm() {
  document.getElementById("serverForm").classList.remove("show");
  editingServerId = null;
}

// 保存当前编辑的服务器
function saveCurrentServer() {
  const serverData = {
    id: editingServerId,
    name:
      document.getElementById("serverName").value.trim() || "Unnamed Server",
    protocol: document.getElementById("protocol").value,
    host: document.getElementById("host").value.trim(),
    port: document.getElementById("port").value.trim(),
    interf: document.getElementById("interf").value.trim(),
    token: document.getElementById("token").value,
    path: document.getElementById("path").value.trim(),
  };

  // 验证必填字段
  if (!serverData.host || !serverData.port || !serverData.interf) {
    showStatus(
      browser.i18n.getMessage("error_invalidServer") ||
        "Please fill in Host, Port and Interface",
      true,
    );
    return;
  }

  const existingIndex = servers.findIndex((s) => s.id === editingServerId);
  if (existingIndex >= 0) {
    // 更新现有服务器
    servers[existingIndex] = serverData;
  } else {
    // 添加新服务器
    servers.push(serverData);
    // 如果是第一个服务器，自动激活
    if (servers.length === 1) {
      activeServerId = serverData.id;
    }
  }

  saveServers();
  hideServerForm();
  renderServerList();
  showStatus(browser.i18n.getMessage("OP_saveComplete") || "Saved");
}

// 删除服务器
function deleteServer(serverId) {
  if (servers.length <= 1) {
    showStatus(
      browser.i18n.getMessage("error_lastServer") ||
        "Cannot delete the last server",
      true,
    );
    return;
  }

  const confirmMsg =
    browser.i18n.getMessage("confirm_deleteServer") || "Delete this server?";
  if (!confirm(confirmMsg)) return;

  servers = servers.filter((s) => s.id !== serverId);

  // 如果删除的是激活的服务器，激活第一个
  if (activeServerId === serverId) {
    activeServerId = servers.length > 0 ? servers[0].id : "";
  }

  saveServers();
  renderServerList();
  showStatus(browser.i18n.getMessage("OP_deleteComplete") || "Deleted");
}

// 保存服务器列表到存储
function saveServers() {
  browser.storage.local.set(
    {
      rpcServers: JSON.stringify(servers),
      activeServerId: activeServerId,
      initialize: servers.length > 0, // 至少有一个服务器时才算初始化
    },
    () => {
      console.log("Servers saved:", servers);
    },
  );
}

// 从存储加载服务器列表
function loadServers() {
  browser.storage.local.get(config.command.guess, (prefs) => {
    servers = parseServers(prefs.rpcServers);
    activeServerId = prefs.activeServerId || "";

    // 如果没有激活的服务器但有服务器列表，激活第一个
    if (!activeServerId && servers.length > 0) {
      activeServerId = servers[0].id;
      saveServers();
    }

    renderServerList();
  });
}

// 显示状态消息
function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.style.color = isError ? "#ff3b30" : "var(--accent)";
  setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

// 转义 HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 应用 i18n
function applyI18n() {
  document.querySelectorAll("[data-message]").forEach((n) => {
    const msg = browser.i18n.getMessage(n.dataset.message);
    if (msg) n.textContent = msg;
  });
  document.body.style.direction = browser.i18n.getMessage("direction");
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  loadServers();

  // 绑定事件
  document.getElementById("addServer").addEventListener("click", addServer);
  document
    .getElementById("saveServer")
    .addEventListener("click", saveCurrentServer);
  document
    .getElementById("cancelEdit")
    .addEventListener("click", hideServerForm);
});
