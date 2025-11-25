var Aria2Module = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/aria2-client.js
  var aria2_client_exports = {};
  __export(aria2_client_exports, {
    Aria2Client: () => Aria2Client,
    createAria2Client: () => createAria2Client,
    default: () => aria2_client_default
  });
  var Aria2Client = class {
    constructor(options = {}) {
      this.host = options.host || "localhost";
      this.port = options.port || 6800;
      this.secure = options.secure || false;
      this.secret = options.secret || "";
      this.path = options.path || "/jsonrpc";
      this.socket = null;
      this.requestId = 0;
      this.pendingRequests = /* @__PURE__ */ new Map();
      this.eventListeners = /* @__PURE__ */ new Map();
    }
    /**
     * Get the protocol based on connection type
     */
    get httpUrl() {
      const protocol = this.secure ? "https" : "http";
      return "".concat(protocol, "://").concat(this.host, ":").concat(this.port).concat(this.path);
    }
    get wsUrl() {
      const protocol = this.secure ? "wss" : "ws";
      return "".concat(protocol, "://").concat(this.host, ":").concat(this.port).concat(this.path);
    }
    /**
     * Open WebSocket connection
     * @returns {Promise<void>}
     */
    open() {
      return new Promise((resolve, reject) => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }
        try {
          this.socket = new WebSocket(this.wsUrl);
          this.socket.onopen = () => {
            this._emit("open");
            resolve();
          };
          this.socket.onerror = (err) => {
            this._emit("error", err);
            reject(new Error("WebSocket connection failed"));
          };
          this.socket.onclose = () => {
            this._emit("close");
            this.socket = null;
          };
          this.socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              this._handleMessage(message);
            } catch (e) {
              console.error("Failed to parse message:", e);
            }
          };
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Close WebSocket connection
     * @returns {Promise<void>}
     */
    close() {
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve();
          return;
        }
        this.socket.onclose = () => {
          this.socket = null;
          resolve();
        };
        this.socket.close();
      });
    }
    /**
     * Make an RPC call
     * @param {string} method - RPC method name
     * @param  {...any} params - Method parameters
     * @returns {Promise<any>}
     */
    async call(method, ...params) {
      if (!method.startsWith("system.") && !method.startsWith("aria2.")) {
        method = "aria2." + method;
      }
      const id = ++this.requestId;
      const allParams = this.secret ? ["token:".concat(this.secret), ...params] : params;
      const request = {
        jsonrpc: "2.0",
        id,
        method,
        params: allParams.length > 0 ? allParams : void 0
      };
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return this._sendWebSocket(request);
      } else {
        return this._sendHttp(request);
      }
    }
    /**
     * Send request via WebSocket
     */
    _sendWebSocket(request) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(request.id);
          reject(new Error("Request timeout"));
        }, 1e4);
        this.pendingRequests.set(request.id, { resolve, reject, timeout });
        this.socket.send(JSON.stringify(request));
      });
    }
    /**
     * Send request via HTTP
     */
    async _sendHttp(request) {
      const response = await fetch(this.httpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error("HTTP error: ".concat(response.status));
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "RPC error");
      }
      return data.result;
    }
    /**
     * Handle incoming WebSocket message
     */
    _handleMessage(message) {
      if (message.id !== void 0) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error.message || "RPC error"));
          } else {
            pending.resolve(message.result);
          }
        }
      }
      if (message.method) {
        const eventName = message.method.replace("aria2.", "");
        this._emit(eventName, message.params);
      }
    }
    /**
     * Add event listener
     */
    on(event, callback) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
      return this;
    }
    /**
     * Remove event listener
     */
    off(event, callback) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
      return this;
    }
    /**
     * Emit event
     */
    _emit(event, data) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach((cb) => {
          try {
            cb(data);
          } catch (e) {
            console.error("Event listener error:", e);
          }
        });
      }
    }
    // Convenience methods
    async getVersion() {
      return this.call("getVersion");
    }
    async getGlobalStat() {
      return this.call("getGlobalStat");
    }
    async addUri(uris, options = {}) {
      const uriArray = Array.isArray(uris) ? uris : [uris];
      return this.call("addUri", uriArray, options);
    }
    async addTorrent(torrent, uris = [], options = {}) {
      return this.call("addTorrent", torrent, uris, options);
    }
    async addMetalink(metalink, options = {}) {
      return this.call("addMetalink", metalink, options);
    }
    async remove(gid) {
      return this.call("remove", gid);
    }
    async forceRemove(gid) {
      return this.call("forceRemove", gid);
    }
    async pause(gid) {
      return this.call("pause", gid);
    }
    async pauseAll() {
      return this.call("pauseAll");
    }
    async forcePause(gid) {
      return this.call("forcePause", gid);
    }
    async forcePauseAll() {
      return this.call("forcePauseAll");
    }
    async unpause(gid) {
      return this.call("unpause", gid);
    }
    async unpauseAll() {
      return this.call("unpauseAll");
    }
    async tellStatus(gid, keys = []) {
      return this.call("tellStatus", gid, keys);
    }
    async tellActive(keys = []) {
      return this.call("tellActive", keys);
    }
    async tellWaiting(offset, num, keys = []) {
      return this.call("tellWaiting", offset, num, keys);
    }
    async tellStopped(offset, num, keys = []) {
      return this.call("tellStopped", offset, num, keys);
    }
    async getOption(gid) {
      return this.call("getOption", gid);
    }
    async changeOption(gid, options) {
      return this.call("changeOption", gid, options);
    }
    async getGlobalOption() {
      return this.call("getGlobalOption");
    }
    async changeGlobalOption(options) {
      return this.call("changeGlobalOption", options);
    }
    async purgeDownloadResult() {
      return this.call("purgeDownloadResult");
    }
    async removeDownloadResult(gid) {
      return this.call("removeDownloadResult", gid);
    }
    async getSessionInfo() {
      return this.call("getSessionInfo");
    }
    async shutdown() {
      return this.call("shutdown");
    }
    async forceShutdown() {
      return this.call("forceShutdown");
    }
    async saveSession() {
      return this.call("saveSession");
    }
    async multicall(methods) {
      return this.call("system.multicall", methods);
    }
    async listMethods() {
      return this.call("system.listMethods");
    }
    async listNotifications() {
      return this.call("system.listNotifications");
    }
  };
  function createAria2Client(options) {
    return new Aria2Client(options);
  }
  var aria2_client_default = Aria2Client;
  return __toCommonJS(aria2_client_exports);
})();
var Aria2Client = Aria2Module.Aria2Client; var createAria2Client = Aria2Module.createAria2Client;
