"use strict";

// Alt 键检测 content script
// 当用户按住 Alt 键点击链接时，通知 background script 跳过下载拦截

(function () {
  // 监听点击事件
  document.addEventListener(
    "click",
    function (e) {
      // 检测 Alt 键是否按下
      if (e.altKey) {
        // 通知 background script
        browser.runtime.sendMessage({ get: "altKeyPressed" }).catch(() => {
          // 忽略错误（可能是扩展未就绪）
        });
      }
    },
    true // 使用捕获阶段，确保在链接跳转前捕获
  );

  // 也监听 mousedown 事件，因为有些下载可能在 click 之前触发
  document.addEventListener(
    "mousedown",
    function (e) {
      if (e.altKey) {
        browser.runtime.sendMessage({ get: "altKeyPressed" }).catch(() => {});
      }
    },
    true
  );
})();
