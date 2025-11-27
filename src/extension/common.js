"use strict";
var request = [];
var globalD = [];
var mon;

// 过滤变量
var filterSites = [];
var filterExts = [];
var siteFilterMode = "blacklist"; // 'whitelist' or 'blacklist'
var extFilterMode = "blacklist"; // 'whitelist' or 'blacklist'
var minFileSize = 0;
var altKeyBypass = true;
var altKeyPressed = false;

function sendTo(url, fileName, filePath, header, serverId, onFallback) {
  // check whether config is set
  browser.storage.local.get(
    ["initialize", "rpcServers", "activeServerId", "auto"],
    (storage) => {
      if (!storage.initialize || storage.initialize == undefined) {
        browser.runtime.openOptionsPage();
        notify(browser.i18n.getMessage("error_setConfig"));
        if (onFallback) onFallback();
        return;
      }

      // Parse server list
      let servers = [];
      try {
        servers = JSON.parse(storage.rpcServers || "[]");
      } catch (e) {
        console.error("Failed to parse rpcServers", e);
        notify(browser.i18n.getMessage("error_setConfig"));
        if (onFallback) onFallback();
        return;
      }

      if (servers.length === 0) {
        browser.runtime.openOptionsPage();
        notify(browser.i18n.getMessage("error_setConfig"));
        if (onFallback) onFallback();
        return;
      }

      // Find server by ID or use active server
      const targetServerId =
        serverId || storage.activeServerId || servers[0].id;
      const server = servers.find((s) => s.id === targetServerId) || servers[0];

      // Build Aria2 client options
      const secure =
        server.protocol.toLowerCase() === "https" ||
        server.protocol.toLowerCase() === "wss";

      const options = {
        host: server.host,
        port: server.port,
        secure: secure,
        secret: server.token,
        path: "/" + server.interf,
      };

      const aria2 = new Aria2Client(options);

      // Note: Removed isRunning check to avoid extra connection attempts
      // If Aria2 is not running, the actual download will fail and trigger fallback

      // Prepare params
      filePath = filePath.replace(/\\/g, "\\\\");
      const serverPath = (server.path || "").replace(/\\/g, "\\\\");

      const params = {};
      if (header != "[]") params.header = header;
      params.out = fileName;
      params["parameterized-uri"] = "false";

      if (filePath != "") {
        params.dir = filePath;
      } else if (serverPath != "") {
        params.dir = serverPath;
      }

      // Send to Aria2
      const isWebSocket =
        server.protocol.toLowerCase() === "ws" ||
        server.protocol.toLowerCase() === "wss";

      if (isWebSocket) {
        sendViaWebSocket(aria2, url, params, fileName, options, onFallback);
      } else {
        sendViaHttp(aria2, url, params, fileName, onFallback);
      }
    },
  );
}

// Helper function: Send via WebSocket
function sendViaWebSocket(aria2, url, params, fileName, options, onFallback) {
  aria2.open().then(
    function (res) {
      aria2.addUri([url], params).then(
        function (res) {
          monitor(options, res);
          notify(
            browser.i18n.getMessage("success_connect", fileName) + "\n\n" + url,
          );
          aria2.close();
        },
        function (err) {
          // retry after 3 seconds
          retryWebSocket(aria2, url, params, fileName, options, onFallback);
        },
      );
    },
    function (err) {
      // retry after 3 seconds
      setTimeout(() => {
        aria2.open().then(
          () => {
            aria2.addUri([url], params).then(
              function (res) {
                monitor(options, res);
                notify(
                  browser.i18n.getMessage("success_connect", fileName) +
                    "\n\n" +
                    url,
                );
                aria2.close();
              },
              function (err) {
                console.error("WebSocket addUri failed after retry:", err);
                notifyWithFallback(fileName, url, onFallback);
                aria2.close();
              },
            );
          },
          (err) => {
            console.error("WebSocket connection failed on retry:", err);
            notifyWithFallback(fileName, url, onFallback);
          },
        );
      }, 3000);
    },
  );
}

// Helper function: Retry WebSocket
function retryWebSocket(aria2, url, params, fileName, options, onFallback) {
  setTimeout(() => {
    aria2.addUri([url], params).then(
      function (res) {
        monitor(options, res);
        notify(
          browser.i18n.getMessage("success_connect", fileName) + "\n\n" + url,
        );
        aria2.close();
      },
      function (err) {
        console.error("WebSocket addUri failed after retry:", err);
        notifyWithFallback(fileName, url, onFallback);
        aria2.close();
      },
    );
  }, 3000);
}

// Helper function: Send via HTTP
function sendViaHttp(aria2, url, params, fileName, onFallback) {
  aria2.addUri([url], params).then(
    function (res) {
      notify(
        browser.i18n.getMessage("success_connect", fileName) + "\n\n" + url,
      );
    },
    function (err) {
      // retry after 3 seconds
      setTimeout(() => {
        aria2.addUri([url], params).then(
          function (res) {
            notify(
              browser.i18n.getMessage("success_connect", fileName) +
                "\n\n" +
                url,
            );
          },
          function (err) {
            console.error("HTTP addUri failed after retry:", err);
            notifyWithFallback(fileName, url, onFallback);
          },
        );
      }, 3000);
    },
  );
}

// Helper function: Notify with fallback
function notifyWithFallback(fileName, url, onFallback) {
  const fallbackMsg =
    browser.i18n.getMessage("error_aria2_fallback") ||
    "Aria2 connection failed. Using browser download as fallback.";
  notify(fallbackMsg + "\n\n" + fileName);

  if (onFallback) {
    console.log("Triggering fallback for:", url);
    onFallback();
  } else {
    notify(browser.i18n.getMessage("error_connect"));
  }
}

function save(url, fileName, filePath, header, as, wid, incog) {
  if (fileName != "") {
    var downloading = browser.downloads.download({
      //conflictAction: "prompt",  //not work
      filename: fileName,
      incognito: incog, //not work under 57
      saveAs: as,
      url: url,
    });
  } else {
    var downloading = browser.downloads.download({
      //conflictAction: "prompt",  //not work
      incognito: incog, //not work under 57
      saveAs: as,
      url: url,
    });
  }

  // close download panel
  if (wid != 0)
    downloading.then(
      (id) => {
        browser.windows.remove(wid);
      },
      (e) => {
        notify(e);
      },
    );
  else
    downloading.then(
      () => {},
      (e) => {
        notify(e);
      },
    );
}

function tmpopen(url, fileName, header) {
  var downloading = browser.downloads.download({
    filename: "%temp%",
    //headers: header,
    url: url,
  });
  downloading.then(
    (id) => {
      var opening = browser.downloads.open(id);
      opening.then(
        () => {},
        (e) => {
          console.error("Failed to open download:", e);
        },
      );
    },
    (e) => {
      console.error("Failed to download temp file:", e);
    },
  );
}

function handleMessage(request, sender, sendResponse) {
  //console.log("Message from the content script: " +request.get);
  switch (request.get) {
    case "all":
      var d = globalD.pop();
      //var tmp = d.responseHeaders.find(x => x.name === 'Content-Type').value;
      sendResponse({
        response: "all",
        url: d.url,
        fileName: d.fileName,
        fileSize: d.fileSize,
        //fileType: tmp,
        header: d.requestHeaders,
      });
      break;
    case "download":
      // Fallback to browser download if Aria2 fails
      const fallbackToBrowser = () => {
        save(
          request.url,
          request.fileName,
          request.filePath,
          request.header,
          false,
          false,
          false,
        );
      };

      sendTo(
        request.url,
        request.fileName,
        request.filePath,
        request.header,
        request.server,
        fallbackToBrowser,
      );
      sendResponse({
        response: "send success",
      });
      break;
    case "save":
      save(
        request.url,
        request.fileName,
        request.filePath,
        request.header,
        false,
        false,
        request.incognito,
      );
      sendResponse({
        response: "send success",
      });
      break;
    case "saveas":
      save(
        request.url,
        request.fileName,
        request.filePath,
        request.header,
        true,
        request.wid,
        request.incognito,
      );
      sendResponse({
        response: "saveas create",
      });
      break;
    case "tmpopen":
      tmpopen(request.url, request.fileName, request.header);
      sendResponse({
        response: "send success",
      });
      break;
    case "changeState":
      changeState(request.checked);
      sendResponse({
        response: "send success",
      });
      break;
    case "loadSettings":
      loadSettings();
      sendResponse({
        response: "send success",
      });
      break;
    case "altKeyPressed":
      // 收到 Alt 键按下的消息
      if (altKeyBypass) {
        altKeyPressed = true;
        // 5 秒后重置，防止状态卡住
        setTimeout(() => {
          altKeyPressed = false;
        }, 5000);
      }
      sendResponse({
        response: "alt key registered",
      });
      break;
    default:
      sendResponse({
        response: "Response from background script",
      });
  }
}

function getFileName(d) {
  // get file name
  var fileName = "";
  var id = 0;
  id = d.responseHeaders.findIndex(
    (x) => x.name.toLowerCase() === "content-disposition",
  );
  if (id >= 0) {
    var PARAM_REGEXP =
      /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g;
    var EXT_VALUE_REGEXP =
      /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/;
    var QESC_REGEXP = /\\([\u0000-\u007f])/g;

    var string = d.responseHeaders[id].value;

    var key;
    var value;

    var match = PARAM_REGEXP.exec(string);
    if (!match) {
      fileName = getFileNameURL(d.url);
      return fileName;
    }

    key = match[1].toLowerCase();
    value = match[2];

    if (key.indexOf("*") + 1 === key.length) {
      var match = EXT_VALUE_REGEXP.exec(value);
      if (!match) {
        fileName = getFileNameURL(d.url);
        return fileName;
      } else {
        value = match[2];
      }
    }

    if (value[0] === '"') {
      // remove quotes and escapes
      value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1");
    }
    fileName = value;
  } else {
    fileName = getFileNameURL(d.url);
  }
  return fileName;
}

function getFileNameURL(url) {
  var fileName = "";
  var id = url.lastIndexOf("/");
  if (id >= 0) {
    var id1 = url.lastIndexOf("?");
    if (id1 == -1) {
      fileName = url.slice(id + 1);
    } else {
      fileName = url.slice(id + 1, id1);
    }
  }
  return fileName;
}

function getFileSize(d) {
  var fileSize = "";
  var id = 0;
  id = d.responseHeaders.findIndex(
    (x) => x.name.toLowerCase() === "content-length",
  );
  if (id >= 0) {
    fileSize = humanFileSize(d.responseHeaders[id].value, true);
  }
  return fileSize;
}

function getRequestHeaders(d, ua) {
  // create header
  var id1;
  var requestHeaders = [];
  if (ua) {
    var getheader = [
      "Referer",
      "Cookie",
      "Cookie2",
      "Authorization",
      "User-Agent",
    ];
  } else {
    var getheader = ["Referer", "Cookie", "Cookie2", "Authorization"];
  }
  for (var i = 0; i < getheader.length; i++) {
    id1 = d.requestHeaders.findIndex((x) => x.name === getheader[i]);
    if (id1 >= 0) {
      requestHeaders[i] =
        d.requestHeaders[id1].name + ": " + d.requestHeaders[id1].value;
    }
  }
  return requestHeaders;
}

// 通配符匹配函数 (支持 * 通配符)
// * 匹配除点号外的任意字符 (单个子域名部分)
// 例如: *.example.com 匹配 www.example.com 但不匹配 sub.www.example.com
function matchWildcard(str, pattern) {
  if (!pattern || !str) return false;

  // 转义点号
  let regexPattern = pattern.replace(/\./g, "\\.");

  // 处理 * (匹配除点号外的任意字符)
  regexPattern = regexPattern.replace(/\*/g, "[^.]*");

  const regex = new RegExp("^" + regexPattern + "$", "i");
  return regex.test(str);
}

// 获取 URL 的主机名
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// 获取文件扩展名
function getFileExtension(filename) {
  if (!filename) return "";
  const match = filename.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? "." + match[1].toLowerCase() : "";
}

// 获取 Referer 的 hostname
function getRefererHostname(d) {
  // 先从 request 数组中查找
  const reqId = request.findIndex((x) => x.requestId === d.requestId);
  if (reqId >= 0 && request[reqId].requestHeaders) {
    const refererIdx = request[reqId].requestHeaders.findIndex(
      (x) => x.name.toLowerCase() === "referer"
    );
    if (refererIdx >= 0) {
      return getHostname(request[reqId].requestHeaders[refererIdx].value);
    }
  }
  return "";
}

function isException(d) {
  const url = d.url;
  const hostname = getHostname(url);
  const filename = getFileNameURL(url);
  const ext = getFileExtension(filename);

  // 获取 Referer (来源页面)
  const refererHostname = getRefererHostname(d);

  // 获取文件大小
  const contentLengthIdx = d.responseHeaders.findIndex(
    (x) => x.name.toLowerCase() === "content-length",
  );
  const fileSize =
    contentLengthIdx !== -1
      ? Number(d.responseHeaders[contentLengthIdx].value)
      : 0;

  // Alt 键绕过检测
  if (altKeyBypass && altKeyPressed) {
    altKeyPressed = false;
    console.log("Alt key bypass: skipping capture");
    return true;
  }

  // 站点过滤检测
  const siteMatched = filterSites.some((pattern) =>
    pattern && (matchWildcard(hostname, pattern) || matchWildcard(refererHostname, pattern))
  );

  if (siteFilterMode === "whitelist") {
    // 白名单模式：如果有站点列表且不匹配，则不拦截
    if (filterSites.length > 0 && !siteMatched) {
      console.log("Site not in whitelist:", hostname, "referer:", refererHostname);
      return true;
    }
  } else {
    // 黑名单模式：如果匹配则不拦截
    if (siteMatched) {
      console.log("Site in blacklist:", hostname, "or referer:", refererHostname);
      return true;
    }
  }

  // 扩展名过滤检测
  if (ext) {
    const extMatched = filterExts.some((pattern) => pattern && matchWildcard(ext, pattern));

    if (extFilterMode === "whitelist") {
      // 白名单模式：如果有扩展名列表且不匹配，则不拦截
      if (filterExts.length > 0 && !extMatched) {
        console.log("Extension not in whitelist:", ext);
        return true;
      }
    } else {
      // 黑名单模式：如果匹配则不拦截
      if (extMatched) {
        console.log("Extension in blacklist:", ext);
        return true;
      }
    }
  }

  // 5. 最小文件大小检测
  if (minFileSize > 0 && fileSize > 0) {
    const minBytes = minFileSize * 1024 * 1024;
    if (fileSize < minBytes) {
      console.log("File size below minimum:", fileSize, "< ", minBytes);
      return true;
    }
  }

  return false;
}

async function prepareDownload(d) {
  var details = {};
  details.url = d.url;

  // get request item
  var id = request.findIndex((x) => x.requestId === d.requestId);
  const reqFound = { ...request[id] };
  if (id >= 0) {
    // create header
    var get = browser.storage.local.get(config.command.guess);
    await get.then((item) => {
      details.requestHeaders = getRequestHeaders(reqFound, item.ua);
    });
    // delete request item
    request.splice(id, 1);
  } else {
    details.requestHeaders = "";
  }

  // process file name
  details.fileName = getFileName(d);

  // decode URI Component
  details.fileName = decodeURIComponent(details.fileName);

  // issue #8
  try {
    details.fileName = decodeURI(escape(details.fileName));
  } catch (e) {}

  // file name cannot have ""
  details.fileName = details.fileName.replace('\";', "");
  details.fileName = details.fileName.replace('\"', "");
  details.fileName = details.fileName.replace('\"', "");

  // correct File Name
  var getting = correctFileName(details.fileName);
  await getting.then((name) => {
    details.fileName = name;
  });

  // get file size
  details.fileSize = getFileSize(d);

  // create download panel
  browser.storage.local.get(config.command.guess, (item) => {
    if (item.downPanel) {
      downloadPanel(details);
    } else {
      sendTo(details.url, details.fileName, "", details.requestHeaders, "1");
    }
  });

  // avoid blank new tab
  var getting = browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
    //url: "about:blank", // not allowed
    windowType: "normal",
  });
  getting.then(
    (tabsInfo) => {
      if (tabsInfo[0].url == "about:blank") browser.tabs.remove(tabsInfo[0].id);
    },
    (e) => {
      console.error("Failed to get tab info:", e);
    },
  );
}

function observeRequest(d) {
  request.push(d);
}

function observeResponse(d) {
  //console.log(d.responseHeaders);
  // Only capture downloads with status code 200
  if (d.statusCode == 200) {
    if (
      d.responseHeaders.find(
        (x) => x.name.toLowerCase() === "content-disposition",
      ) != undefined
    ) {
      var contentDisposition = d.responseHeaders
        .find((x) => x.name.toLowerCase() === "content-disposition")
        .value.toLowerCase();
      // Only capture if Content-Disposition is "attachment"
      if (contentDisposition.slice(0, 10) == "attachment") {
        //console.log(contentDisposition);
        if (isException(d)) return { cancel: false };
        prepareDownload(d);
        return { cancel: true };
      }
    }
    if (
      d.responseHeaders.find((x) => x.name.toLowerCase() === "content-type") !=
      undefined
    ) {
      var contentType = d.responseHeaders
        .find((x) => x.name.toLowerCase() === "content-type")
        .value.toLowerCase();
      // Capture application/* types except web content
      if (
        contentType.slice(0, 11) == "application" &&
        contentType.slice(12, 15) != "pdf" &&
        contentType.slice(12, 17) != "xhtml" &&
        contentType.slice(12, 23) != "x-xpinstall" &&
        contentType.slice(12, 29) != "x-shockwave-flash" &&
        contentType.slice(12, 15) != "rss" &&
        contentType.slice(12, 16) != "json"
      ) {
        //console.log(contentType);
        if (isException(d)) return { cancel: false };
        prepareDownload(d);
        return { cancel: true };
      }
      // Capture video files
      if (contentType.slice(0, 5) == "video") {
        //console.log(contentType);
        if (isException(d)) return { cancel: false };
        prepareDownload(d);
        return { cancel: true };
      }
      // Capture audio files
      if (contentType.slice(0, 5) == "audio") {
        //console.log(contentType);
        if (isException(d)) return { cancel: false };
        prepareDownload(d);
        return { cancel: true };
      }
    }
  }
  // get request item and delete
  var id = request.findIndex((x) => x.requestId === d.requestId);
  if (id >= 0) {
    request.splice(id, 1);
  }
  return false;
}

function requestError(d) {
  var id = request.findIndex((x) => x.requestId === d.requestId);
  if (id >= 0) {
    request.splice(id, 1);
  }
  //console.log(d.error);
  return;
}

function tabRemoved(tabId, removeInfo) {
  var id = request.findIndex((x) => x.tabId === tabId);
  while (id >= 0) {
    request.splice(id, 1);
    id = request.findIndex((x) => x.tabId === tabId);
    //console.log("removed");
  }
  //console.log(tabId);
  return;
}

function changeState(enabled) {
  if (enabled) {
    var types = ["main_frame", "sub_frame"];
    browser.webRequest.onSendHeaders.addListener(
      observeRequest,
      {
        urls: ["<all_urls>"],
        types: types,
      },
      ["requestHeaders"],
    );
    browser.webRequest.onHeadersReceived.addListener(
      observeResponse,
      {
        urls: ["<all_urls>"],
        types: types,
      },
      ["blocking", "responseHeaders"],
    );
    browser.webRequest.onErrorOccurred.addListener(requestError, {
      urls: ["<all_urls>"],
      types: types,
    });
    browser.tabs.onRemoved.addListener(tabRemoved);
    browser.storage.local.set({
      enabled: true,
    });
  } else {
    browser.webRequest.onHeadersReceived.removeListener(observeResponse);
    browser.webRequest.onSendHeaders.removeListener(observeRequest);
    browser.webRequest.onErrorOccurred.removeListener(requestError);
    browser.tabs.onRemoved.removeListener(tabRemoved);
    request.splice(0, request.length);
    browser.storage.local.set({
      enabled: false,
    });
  }
  browser.browserAction.setIcon({
    path: {
      16: "data/icons/" + (enabled ? "" : "disabled/") + "16.png",
      32: "data/icons/" + (enabled ? "" : "disabled/") + "32.png",
      64: "data/icons/" + (enabled ? "" : "disabled/") + "64.png",
      128: "data/icons/" + (enabled ? "" : "disabled/") + "128.png",
      256: "data/icons/" + (enabled ? "" : "disabled/") + "256.png",
    },
  });
  browser.browserAction.setTitle({
    title:
      browser.i18n.getMessage("extensionName") +
      ` "${enabled ? browser.i18n.getMessage("enabled") : browser.i18n.getMessage("disabled")}"`,
  });
}
function cmCallback(info, tab) {
  var server = info.menuItemId.slice(1);
  var url = info.parentMenuItemId === "open-video" ? info.srcUrl : info.linkUrl;
  if (url == "") {
    notify(browser.i18n.getMessage("error_notSupported"));
  } else {
    browser.cookies.getAll({ url: url }).then(
      (cookies) => {
        var requestHeaders = [];
        requestHeaders[0] = "Referer: " + info.pageUrl + '"';
        requestHeaders[1] = "Cookie: ";
        var cookie = {};
        for (cookie of cookies) {
          requestHeaders[1] += cookie.name;
          requestHeaders[1] += "=";
          requestHeaders[1] += cookie.value;
          requestHeaders[1] += "; ";
        }
        var d = {
          url: url,
          fileName: getFileNameURL(url),
          fileSize: "",
          requestHeaders: requestHeaders,
        };
        browser.storage.local.get(config.command.guess, (item) => {
          if (item.cmDownPanel) {
            downloadPanel(d);
          } else {
            sendTo(url, "", "", requestHeaders, server);
          }
        });
      },
      (e) => {
        console.error("Failed to get request headers:", e);
        var requestHeaders = "[";
        requestHeaders += '"Referer: ' + info.pageUrl + '"';
        requestHeaders += "]";
        var d = {
          url: url,
          fileName: getFileNameURL(url),
          fileSize: "",
          requestHeaders: requestHeaders,
        };
        browser.storage.local.get(config.command.guess, (item) => {
          if (item.cmDownPanel) {
            downloadPanel(d);
          } else {
            sendTo(url, "", "", requestHeaders, server);
          }
        });
      },
    );
  }
}
function contextMenus(enabled, cmDownPanel) {
  browser.contextMenus.removeAll();
  browser.contextMenus.onClicked.removeListener(cmCallback);
  var cmTitle = browser.i18n.getMessage("CM_title");
  var seD = browser.i18n.getMessage("OP_rpcDefault");
  var se2 = browser.i18n.getMessage("OP_rpc2");
  var se3 = browser.i18n.getMessage("OP_rpc3");
  if (enabled) {
    browser.contextMenus.create({
      id: "open-link",
      title: cmTitle,
      contexts: ["link"],
      documentUrlPatterns: ["*://*/*"],
    });

    browser.contextMenus.create({
      id: "open-video",
      title: cmTitle,
      contexts: ["video", "audio"],
      documentUrlPatterns: ["*://*/*"],
    });

    if (!cmDownPanel) {
      browser.contextMenus.create({
        id: "A1",
        title: seD,
        contexts: ["link"],
        parentId: "open-link",
        documentUrlPatterns: ["*://*/*"],
      });
      browser.contextMenus.create({
        id: "A2",
        title: se2,
        contexts: ["link"],
        parentId: "open-link",
        documentUrlPatterns: ["*://*/*"],
      });
      browser.contextMenus.create({
        id: "A3",
        title: se3,
        contexts: ["link"],
        parentId: "open-link",
        documentUrlPatterns: ["*://*/*"],
      });
      browser.contextMenus.create({
        id: "B1",
        title: seD,
        contexts: ["video", "audio"],
        parentId: "open-video",
        documentUrlPatterns: ["*://*/*"],
      });
      browser.contextMenus.create({
        id: "B2",
        title: se2,
        contexts: ["video", "audio"],
        parentId: "open-video",
        documentUrlPatterns: ["*://*/*"],
      });
      browser.contextMenus.create({
        id: "B3",
        title: se3,
        contexts: ["video", "audio"],
        parentId: "open-video",
        documentUrlPatterns: ["*://*/*"],
      });
    }
    browser.contextMenus.onClicked.addListener(cmCallback);
  }
}

(function (callback) {
  browser.runtime.onInstalled.addListener(callback);
  //browser.runtime.onStartup.addListener(callback);
})(function (d) {
  browser.storage.local.get("initialize", (item) => {
    if (item.initialize == undefined) {
      browser.runtime.openOptionsPage();
      changeState(true);
      browser.storage.local.set({
        initialize: false,
      });
    } else {
      browser.storage.local.get(config.command.guess, (item) => {
        if (d.reason == "update" && item.chgLog == true) {
          browser.tabs.create({
            url: "https://github.com/inario-kitsune/Aria2-Integration/blob/master/CHANGELOG.md",
          });
        }
      });
    }
  });
});

// 解析多行文本为数组
function parseTextList(text) {
  if (!text) return [];
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function loadSettings() {
  browser.storage.local.get(config.command.guess, (item) => {
    contextMenus(item.menu, item.cmDownPanel);

    // 加载过滤配置
    filterSites = parseTextList(item.filterSites || "");
    filterExts = parseTextList(item.filterExts || "");
    siteFilterMode = item.siteFilterMode || "blacklist";
    extFilterMode = item.extFilterMode || "blacklist";
    minFileSize = Number(item.minFileSize) || 0;
    altKeyBypass = item.altKeyBypass !== false; // 默认启用

    console.log("Filter settings loaded:", {
      filterSites,
      filterExts,
      siteFilterMode,
      extFilterMode,
      minFileSize,
      altKeyBypass,
    });
  });
}

(function () {
  browser.storage.local.get("enabled", function (item) {
    changeState(item.enabled);
  });
  browser.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 100] });
  loadSettings();
  browser.runtime.onMessage.addListener(handleMessage);
})();
