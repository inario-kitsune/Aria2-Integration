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
      // 白/黑名单过滤
      allowedSites: "", // 站点白名单 - 始终拦截 (每行一个)
      blockedSites: "", // 站点黑名单 - 永不拦截 (每行一个)
      allowedExts: "", // 扩展名白名单 (每行一个，如 .zip)
      blockedExts: "", // 扩展名黑名单 (每行一个)
      minFileSize: 0, // 最小文件大小 (MB)，小于此值不拦截
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
