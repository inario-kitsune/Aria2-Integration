import { writable, derived } from "svelte/store";

// Supported locales
export const LOCALES = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
};

// Translation dictionaries
const translations = {
  en: {
    // App
    "app.name": "ArcUI",
    "app.title": "Aria2 Downloads",
    "app.description": "Lightweight download manager interface",

    // Header
    "header.connected": "Connected",
    "header.disconnected": "Disconnected",
    "header.connecting": "Connecting...",
    "header.addDownload": "Add Download",

    // Stats
    "stats.download": "Download",
    "stats.upload": "Upload",
    "stats.active": "Active",
    "stats.waiting": "Waiting",
    "stats.stopped": "Stopped",

    // Download List
    "downloads.tabs.active": "Active",
    "downloads.tabs.waiting": "Waiting",
    "downloads.tabs.stopped": "Stopped",
    "downloads.empty": "No downloads in this category",

    // Download Item
    "download.status.active": "Active",
    "download.status.waiting": "Waiting",
    "download.status.paused": "Paused",
    "download.status.complete": "Complete",
    "download.status.error": "Error",
    "download.status.removed": "Removed",
    "download.action.pause": "Pause",
    "download.action.resume": "Resume",
    "download.action.remove": "Remove",
    "download.info.status": "Status",
    "download.info.progress": "Progress",
    "download.info.size": "Size",
    "download.info.speed": "Speed",

    // Add Download Dialog
    "addDownload.title": "Add Download",
    "addDownload.urlLabel": "URLs (one per line)",
    "addDownload.urlPlaceholder":
      "https://example.com/file.zip\nmagnet:?xt=urn:btih:...",
    "addDownload.cancel": "Cancel",
    "addDownload.add": "Add",
    "addDownload.adding": "Adding...",
    "addDownload.error.empty": "Please enter at least one URL",
    "addDownload.error.notConnected": "Aria2 client not connected",
    "addDownload.error.failed": "Failed to add download",

    // Settings
    "header.settings": "Settings",
    "settings.title": "Server Settings",
    "settings.protocol": "Protocol",
    "settings.host": "Host",
    "settings.port": "Port",
    "settings.path": "Path",
    "settings.secret": "Secret Token",
    "settings.cancel": "Cancel",
    "settings.save": "Save & Connect",
    "settings.saving": "Saving...",
    "settings.saveSuccess": "Settings saved and connected!",
    "settings.saveError": "Failed to connect to Aria2",

    // Connection Info
    "header.connectionInfo": "Connection Info",
    "connectionInfo.title": "Connection Information",
    "connectionInfo.loading": "Loading...",
    "connectionInfo.close": "Close",
    "connectionInfo.server": "Server",
    "connectionInfo.protocol": "Protocol",
    "connectionInfo.host": "Host",
    "connectionInfo.port": "Port",
    "connectionInfo.version": "Version",
    "connectionInfo.aria2Version": "Aria2 Version",
    "connectionInfo.features": "Enabled Features",
    "connectionInfo.statistics": "Statistics",
    "connectionInfo.downloadSpeed": "Download Speed",
    "connectionInfo.uploadSpeed": "Upload Speed",
    "connectionInfo.numActive": "Active Downloads",
    "connectionInfo.numWaiting": "Waiting",
    "connectionInfo.numStopped": "Stopped",
    "connectionInfo.session": "Session",
    "connectionInfo.sessionId": "Session ID",

    // Units
    "units.speed.bps": "B/s",
    "units.speed.kbps": "KB/s",
    "units.speed.mbps": "MB/s",
    "units.speed.gbps": "GB/s",
    "units.size.b": "B",
    "units.size.kb": "KB",
    "units.size.mb": "MB",
    "units.size.gb": "GB",
    "units.size.tb": "TB",
  },

  "zh-CN": {
    // App
    "app.name": "ArcUI",
    "app.title": "Aria2 下载",
    "app.description": "轻量级下载管理界面",

    // Header
    "header.connected": "已连接",
    "header.disconnected": "未连接",
    "header.connecting": "连接中...",
    "header.addDownload": "添加下载",

    // Stats
    "stats.download": "下载",
    "stats.upload": "上传",
    "stats.active": "进行中",
    "stats.waiting": "等待中",
    "stats.stopped": "已停止",

    // Download List
    "downloads.tabs.active": "进行中",
    "downloads.tabs.waiting": "等待中",
    "downloads.tabs.stopped": "已停止",
    "downloads.empty": "此分类下暂无下载",

    // Download Item
    "download.status.active": "进行中",
    "download.status.waiting": "等待中",
    "download.status.paused": "已暂停",
    "download.status.complete": "已完成",
    "download.status.error": "错误",
    "download.status.removed": "已移除",
    "download.action.pause": "暂停",
    "download.action.resume": "继续",
    "download.action.remove": "移除",
    "download.info.status": "状态",
    "download.info.progress": "进度",
    "download.info.size": "大小",
    "download.info.speed": "速度",

    // Add Download Dialog
    "addDownload.title": "添加下载",
    "addDownload.urlLabel": "URL（每行一个）",
    "addDownload.urlPlaceholder":
      "https://example.com/file.zip\nmagnet:?xt=urn:btih:...",
    "addDownload.cancel": "取消",
    "addDownload.add": "添加",
    "addDownload.adding": "添加中...",
    "addDownload.error.empty": "请输入至少一个 URL",
    "addDownload.error.notConnected": "Aria2 客户端未连接",
    "addDownload.error.failed": "添加下载失败",

    // Settings
    "header.settings": "设置",
    "settings.title": "服务器设置",
    "settings.protocol": "协议",
    "settings.host": "主机",
    "settings.port": "端口",
    "settings.path": "路径",
    "settings.secret": "密钥令牌",
    "settings.cancel": "取消",
    "settings.save": "保存并连接",
    "settings.saving": "保存中...",
    "settings.saveSuccess": "设置已保存并连接成功！",
    "settings.saveError": "连接 Aria2 失败",

    // Connection Info
    "header.connectionInfo": "连接信息",
    "connectionInfo.title": "连接信息",
    "connectionInfo.loading": "加载中...",
    "connectionInfo.close": "关闭",
    "connectionInfo.server": "服务器",
    "connectionInfo.protocol": "协议",
    "connectionInfo.host": "主机",
    "connectionInfo.port": "端口",
    "connectionInfo.version": "版本",
    "connectionInfo.aria2Version": "Aria2 版本",
    "connectionInfo.features": "已启用功能",
    "connectionInfo.statistics": "统计信息",
    "connectionInfo.downloadSpeed": "下载速度",
    "connectionInfo.uploadSpeed": "上传速度",
    "connectionInfo.numActive": "进行中",
    "connectionInfo.numWaiting": "等待中",
    "connectionInfo.numStopped": "已停止",
    "connectionInfo.session": "会话",
    "connectionInfo.sessionId": "会话 ID",

    // Units
    "units.speed.bps": "B/s",
    "units.speed.kbps": "KB/s",
    "units.speed.mbps": "MB/s",
    "units.speed.gbps": "GB/s",
    "units.size.b": "B",
    "units.size.kb": "KB",
    "units.size.mb": "MB",
    "units.size.gb": "GB",
    "units.size.tb": "TB",
  },

  "zh-TW": {
    // App
    "app.name": "ArcUI",
    "app.title": "Aria2 下載",
    "app.description": "輕量級下載管理介面",

    // Header
    "header.connected": "已連接",
    "header.disconnected": "未連接",
    "header.connecting": "連接中...",
    "header.addDownload": "新增下載",

    // Stats
    "stats.download": "下載",
    "stats.upload": "上傳",
    "stats.active": "進行中",
    "stats.waiting": "等待中",
    "stats.stopped": "已停止",

    // Download List
    "downloads.tabs.active": "進行中",
    "downloads.tabs.waiting": "等待中",
    "downloads.tabs.stopped": "已停止",
    "downloads.empty": "此分類下暫無下載",

    // Download Item
    "download.status.active": "進行中",
    "download.status.waiting": "等待中",
    "download.status.paused": "已暫停",
    "download.status.complete": "已完成",
    "download.status.error": "錯誤",
    "download.status.removed": "已移除",
    "download.action.pause": "暫停",
    "download.action.resume": "繼續",
    "download.action.remove": "移除",
    "download.info.status": "狀態",
    "download.info.progress": "進度",
    "download.info.size": "大小",
    "download.info.speed": "速度",

    // Add Download Dialog
    "addDownload.title": "新增下載",
    "addDownload.urlLabel": "URL（每行一個）",
    "addDownload.urlPlaceholder":
      "https://example.com/file.zip\nmagnet:?xt=urn:btih:...",
    "addDownload.cancel": "取消",
    "addDownload.add": "新增",
    "addDownload.adding": "新增中...",
    "addDownload.error.empty": "請輸入至少一個 URL",
    "addDownload.error.notConnected": "Aria2 客戶端未連接",
    "addDownload.error.failed": "新增下載失敗",

    // Settings
    "header.settings": "設定",
    "settings.title": "伺服器設定",
    "settings.protocol": "協定",
    "settings.host": "主機",
    "settings.port": "連接埠",
    "settings.path": "路徑",
    "settings.secret": "密鑰令牌",
    "settings.cancel": "取消",
    "settings.save": "儲存並連接",
    "settings.saving": "儲存中...",
    "settings.saveSuccess": "設定已儲存並連接成功！",
    "settings.saveError": "連接 Aria2 失敗",

    // Connection Info
    "header.connectionInfo": "連接資訊",
    "connectionInfo.title": "連接資訊",
    "connectionInfo.loading": "載入中...",
    "connectionInfo.close": "關閉",
    "connectionInfo.server": "伺服器",
    "connectionInfo.protocol": "協定",
    "connectionInfo.host": "主機",
    "connectionInfo.port": "連接埠",
    "connectionInfo.version": "版本",
    "connectionInfo.aria2Version": "Aria2 版本",
    "connectionInfo.features": "已啟用功能",
    "connectionInfo.statistics": "統計資訊",
    "connectionInfo.downloadSpeed": "下載速度",
    "connectionInfo.uploadSpeed": "上傳速度",
    "connectionInfo.numActive": "進行中",
    "connectionInfo.numWaiting": "等待中",
    "connectionInfo.numStopped": "已停止",
    "connectionInfo.session": "工作階段",
    "connectionInfo.sessionId": "工作階段 ID",

    // Units
    "units.speed.bps": "B/s",
    "units.speed.kbps": "KB/s",
    "units.speed.mbps": "MB/s",
    "units.speed.gbps": "GB/s",
    "units.size.b": "B",
    "units.size.kb": "KB",
    "units.size.mb": "MB",
    "units.size.gb": "GB",
    "units.size.tb": "TB",
  },

  ja: {
    // App
    "app.name": "ArcUI",
    "app.title": "Aria2 ダウンロード",
    "app.description": "軽量ダウンロードマネージャーインターフェース",

    // Header
    "header.connected": "接続済み",
    "header.disconnected": "切断",
    "header.connecting": "接続中...",
    "header.addDownload": "ダウンロード追加",

    // Stats
    "stats.download": "ダウンロード",
    "stats.upload": "アップロード",
    "stats.active": "アクティブ",
    "stats.waiting": "待機中",
    "stats.stopped": "停止",

    // Download List
    "downloads.tabs.active": "アクティブ",
    "downloads.tabs.waiting": "待機中",
    "downloads.tabs.stopped": "停止",
    "downloads.empty": "このカテゴリにダウンロードはありません",

    // Download Item
    "download.status.active": "アクティブ",
    "download.status.waiting": "待機中",
    "download.status.paused": "一時停止",
    "download.status.complete": "完了",
    "download.status.error": "エラー",
    "download.status.removed": "削除済み",
    "download.action.pause": "一時停止",
    "download.action.resume": "再開",
    "download.action.remove": "削除",
    "download.info.status": "ステータス",
    "download.info.progress": "進捗",
    "download.info.size": "サイズ",
    "download.info.speed": "速度",

    // Add Download Dialog
    "addDownload.title": "ダウンロード追加",
    "addDownload.urlLabel": "URL（1行に1つ）",
    "addDownload.urlPlaceholder":
      "https://example.com/file.zip\nmagnet:?xt=urn:btih:...",
    "addDownload.cancel": "キャンセル",
    "addDownload.add": "追加",
    "addDownload.adding": "追加中...",
    "addDownload.error.empty": "少なくとも1つのURLを入力してください",
    "addDownload.error.notConnected": "Aria2クライアントが接続されていません",
    "addDownload.error.failed": "ダウンロードの追加に失敗しました",

    // Settings
    "header.settings": "設定",
    "settings.title": "サーバー設定",
    "settings.protocol": "プロトコル",
    "settings.host": "ホスト",
    "settings.port": "ポート",
    "settings.path": "パス",
    "settings.secret": "シークレットトークン",
    "settings.cancel": "キャンセル",
    "settings.save": "保存して接続",
    "settings.saving": "保存中...",
    "settings.saveSuccess": "設定が保存され、接続されました！",
    "settings.saveError": "Aria2への接続に失敗しました",

    // Connection Info
    "header.connectionInfo": "接続情報",
    "connectionInfo.title": "接続情報",
    "connectionInfo.loading": "読み込み中...",
    "connectionInfo.close": "閉じる",
    "connectionInfo.server": "サーバー",
    "connectionInfo.protocol": "プロトコル",
    "connectionInfo.host": "ホスト",
    "connectionInfo.port": "ポート",
    "connectionInfo.version": "バージョン",
    "connectionInfo.aria2Version": "Aria2 バージョン",
    "connectionInfo.features": "有効な機能",
    "connectionInfo.statistics": "統計",
    "connectionInfo.downloadSpeed": "ダウンロード速度",
    "connectionInfo.uploadSpeed": "アップロード速度",
    "connectionInfo.numActive": "アクティブ",
    "connectionInfo.numWaiting": "待機中",
    "connectionInfo.numStopped": "停止",
    "connectionInfo.session": "セッション",
    "connectionInfo.sessionId": "セッション ID",

    // Units
    "units.speed.bps": "B/s",
    "units.speed.kbps": "KB/s",
    "units.speed.mbps": "MB/s",
    "units.speed.gbps": "GB/s",
    "units.size.b": "B",
    "units.size.kb": "KB",
    "units.size.mb": "MB",
    "units.size.gb": "GB",
    "units.size.tb": "TB",
  },
};

// Detect browser locale
function detectLocale() {
  const browserLang = navigator.language || navigator.userLanguage;

  // Exact match
  if (LOCALES[browserLang]) {
    return browserLang;
  }

  // Language code match (e.g., 'zh' -> 'zh-CN')
  const langCode = browserLang.split("-")[0];
  const match = Object.keys(LOCALES).find((locale) =>
    locale.startsWith(langCode),
  );
  if (match) {
    return match;
  }

  // Default to English
  return "en";
}

// Current locale store
export const locale = writable(detectLocale());

// Current translations
export const t = derived(locale, ($locale) => {
  return (key, params = {}) => {
    let text = translations[$locale]?.[key] || translations["en"][key] || key;

    // Replace parameters
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  };
});

// Helper to change locale
export function setLocale(newLocale) {
  if (LOCALES[newLocale]) {
    locale.set(newLocale);
    // Store preference
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("arcui-locale", newLocale);
    }
  }
}

// Initialize from localStorage if available
if (typeof localStorage !== "undefined") {
  const stored = localStorage.getItem("arcui-locale");
  if (stored && LOCALES[stored]) {
    locale.set(stored);
  }
}
