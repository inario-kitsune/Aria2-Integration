/**
 * Modern Aria2 RPC Client for Browser Extensions
 * Pure ES6+ implementation with native Promise support
 * No external dependencies
 */

export class Aria2Client {
  constructor(options = {}) {
    this.host = options.host || "localhost";
    this.port = options.port || 6800;
    this.secure = options.secure || false;
    this.secret = options.secret || "";
    this.path = options.path || "/jsonrpc";

    this.socket = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Get the protocol based on connection type
   */
  get httpUrl() {
    const protocol = this.secure ? "https" : "http";
    return `${protocol}://${this.host}:${this.port}${this.path}`;
  }

  get wsUrl() {
    const protocol = this.secure ? "wss" : "ws";
    return `${protocol}://${this.host}:${this.port}${this.path}`;
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
    // Prefix method with aria2. if needed
    if (!method.startsWith("system.") && !method.startsWith("aria2.")) {
      method = "aria2." + method;
    }

    const id = ++this.requestId;

    // Add secret token if configured
    const allParams = this.secret
      ? [`token:${this.secret}`, ...params]
      : params;

    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params: allParams.length > 0 ? allParams : undefined,
    };

    // Use WebSocket if connected, otherwise HTTP
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
      }, 10000);

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
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
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
    // Handle response to a request
    if (message.id !== undefined) {
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

    // Handle notifications
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
}

// Factory function for convenience
export function createAria2Client(options) {
  return new Aria2Client(options);
}

// Default export
export default Aria2Client;
