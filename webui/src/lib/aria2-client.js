/**
 * Aria2 JSON-RPC Client
 *
 * Provides a clean interface to interact with Aria2 via JSON-RPC.
 * Supports both WebSocket and HTTP protocols.
 */

export class Aria2Client {
  constructor(config = {}) {
    this.protocol = config.protocol || "ws";
    this.host = config.host || "127.0.0.1";
    this.port = config.port || "6800";

    // Ensure path starts with /
    let path = config.path || "jsonrpc";
    this.path = path.startsWith("/") ? path : `/${path}`;

    this.secret = config.secret || "";
    this.config = config; // Store original config for reference

    this.ws = null;
    this.connected = false;
    this.messageId = 0;
    this.callbacks = new Map();
    this.eventHandlers = new Map();
  }

  /**
   * Get the base URL for HTTP requests
   */
  getHttpUrl() {
    const proto = this.protocol === "https" ? "https" : "http";
    return `${proto}://${this.host}:${this.port}${this.path}`;
  }

  /**
   * Get the WebSocket URL
   */
  getWebSocketUrl() {
    const proto = this.protocol === "wss" ? "wss" : "ws";
    return `${proto}://${this.host}:${this.port}${this.path}`;
  }

  /**
   * Connect to Aria2 via WebSocket
   */
  async connect() {
    if (this.protocol !== "ws" && this.protocol !== "wss") {
      // HTTP mode, no persistent connection
      this.connected = true;
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.getWebSocketUrl());

        this.ws.onopen = () => {
          this.connected = true;
          this.emit("connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.emit("error", error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.emit("disconnected");
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from Aria2
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      // Handle RPC response
      if (message.id !== undefined && this.callbacks.has(message.id)) {
        const callback = this.callbacks.get(message.id);
        this.callbacks.delete(message.id);

        if (message.error) {
          const error = new Error(message.error.message || "RPC Error");
          error.code = message.error.code;
          callback.reject(error);
        } else {
          callback.resolve(message.result);
        }
      }

      // Handle notification (events from Aria2)
      if (message.method) {
        this.emit(message.method, message.params);
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  }

  /**
   * Call an Aria2 RPC method
   */
  async call(method, params = []) {
    const id = ++this.messageId;

    // Add secret token if configured
    if (this.secret) {
      params = [`token:${this.secret}`, ...params];
    }

    const request = {
      jsonrpc: "2.0",
      id,
      method: `aria2.${method}`,
      params,
    };

    if (this.protocol === "ws" || this.protocol === "wss") {
      // WebSocket mode
      if (!this.connected) {
        throw new Error("Not connected to Aria2");
      }

      return new Promise((resolve, reject) => {
        this.callbacks.set(id, { resolve, reject });
        this.ws.send(JSON.stringify(request));

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.callbacks.has(id)) {
            this.callbacks.delete(id);
            reject(new Error("Request timeout"));
          }
        }, 30000);
      });
    } else {
      // HTTP mode
      const response = await fetch(this.getHttpUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        const error = new Error(data.error.message || "RPC Error");
        error.code = data.error.code;
        throw error;
      }

      return data.result;
    }
  }

  /**
   * Event emitter
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach((handler) => handler(data));
    }
  }

  // ========== Aria2 Methods ==========

  /**
   * Get Aria2 version
   */
  async getVersion() {
    return this.call("getVersion");
  }

  /**
   * Add a new download from URL
   */
  async addUri(uris, options = {}) {
    return this.call("addUri", [uris, options]);
  }

  /**
   * Add a torrent download
   */
  async addTorrent(torrent, options = {}) {
    return this.call("addTorrent", [torrent, [], options]);
  }

  /**
   * Add a metalink download
   */
  async addMetalink(metalink, options = {}) {
    return this.call("addMetalink", [metalink, options]);
  }

  /**
   * Remove a download
   */
  async remove(gid) {
    return this.call("remove", [gid]);
  }

  /**
   * Force remove a download
   */
  async forceRemove(gid) {
    return this.call("forceRemove", [gid]);
  }

  /**
   * Pause a download
   */
  async pause(gid) {
    return this.call("pause", [gid]);
  }

  /**
   * Pause all downloads
   */
  async pauseAll() {
    return this.call("pauseAll");
  }

  /**
   * Force pause a download
   */
  async forcePause(gid) {
    return this.call("forcePause", [gid]);
  }

  /**
   * Unpause a download
   */
  async unpause(gid) {
    return this.call("unpause", [gid]);
  }

  /**
   * Unpause all downloads
   */
  async unpauseAll() {
    return this.call("unpauseAll");
  }

  /**
   * Get download status
   */
  async tellStatus(gid, keys = []) {
    return this.call("tellStatus", [gid, keys]);
  }

  /**
   * Get active downloads
   */
  async tellActive(keys = []) {
    return this.call("tellActive", [keys]);
  }

  /**
   * Get waiting downloads
   */
  async tellWaiting(offset, num, keys = []) {
    return this.call("tellWaiting", [offset, num, keys]);
  }

  /**
   * Get stopped downloads
   */
  async tellStopped(offset, num, keys = []) {
    return this.call("tellStopped", [offset, num, keys]);
  }

  /**
   * Get global statistics
   */
  async getGlobalStat() {
    return this.call("getGlobalStat");
  }

  /**
   * Purge completed/error/removed downloads
   */
  async purgeDownloadResult() {
    return this.call("purgeDownloadResult");
  }

  /**
   * Remove completed/error/removed download
   */
  async removeDownloadResult(gid) {
    return this.call("removeDownloadResult", [gid]);
  }

  /**
   * Get global option
   */
  async getGlobalOption() {
    return this.call("getGlobalOption");
  }

  /**
   * Change global option
   */
  async changeGlobalOption(options) {
    return this.call("changeGlobalOption", [options]);
  }

  /**
   * Get option for a specific download
   */
  async getOption(gid) {
    return this.call("getOption", [gid]);
  }

  /**
   * Change option for a specific download
   */
  async changeOption(gid, options) {
    return this.call("changeOption", [gid, options]);
  }

  /**
   * Get session information
   */
  async getSessionInfo() {
    return this.call("getSessionInfo");
  }
}
