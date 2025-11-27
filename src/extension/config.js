"use strict";
var config = {};
config.command = {
  get guess() {
    return {
      // 通用设置
      zoom: "1",
      menu: false,
      aggressive: false,
      windowLoc: false,
      auto: true,
      autoSet: true,
      chgLog: true,
      badge: true,
      cmDownPanel: true,
      downPanel: true,
      ua: false,
      // 过滤设置
      filterSites: "", // 站点列表 (每行一个)
      siteFilterMode: "blacklist", // 站点过滤模式: 'whitelist' 或 'blacklist'
      filterExts: "", // 扩展名列表 (每行一个，如 .zip)
      extFilterMode: "blacklist", // 扩展名过滤模式: 'whitelist' 或 'blacklist'
      minFileSize: 0, // 最小文件大小 (MB)，小于此值不拦截
      // 旧版兼容（用于迁移）
      allowedSites: "", // 已弃用 - 使用 filterSites + siteFilterMode
      blockedSites: "", // 已弃用 - 使用 filterSites + siteFilterMode
      allowedExts: "", // 已弃用 - 使用 filterExts + extFilterMode
      blockedExts: "", // 已弃用 - 使用 filterExts + extFilterMode
      // Alt 键绕过
      altKeyBypass: true, // 启用 Alt 键绕过
      // RPC 服务器列表
      rpcServers: JSON.stringify([
        {
          id: Date.now().toString(),
          name: "默认服务器",
          path: "",
          protocol: "ws",
          host: "127.0.0.1",
          port: "6800",
          interf: "jsonrpc",
          token: "",
        },
      ]),
      activeServerId: "", // 当前激活的服务器 ID
    };
  },
};
