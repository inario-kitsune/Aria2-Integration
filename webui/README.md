# ArcUI - Aria2 Web Interface

ArcUI 是一个轻量级的 Aria2 下载管理器 Web 界面，基于 Svelte 构建。

## 设计理念

ArcUI 是一个**完整独立的 Web 应用**，可以：
- 作为独立 Web 应用运行
- 被浏览器扩展集成
- 部署到任何 Web 服务器

## 功能特性

- ✅ 实时下载状态监控
- ✅ 添加新下载任务
- ✅ 管理活跃/等待/已完成的下载
- ✅ 全局统计信息
- ✅ 服务器设置管理
- ✅ 多语言支持（中文、英文）
- ✅ 配置持久化（localStorage）

## 快速开始

### 开发模式

```bash
cd webui
pnpm install
pnpm dev
```

访问 http://localhost:5173

### 生产构建

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

## 配置管理

### 本地配置存储

ArcUI 使用 `localStorage` 存储配置：
- **键名**: `aria2_config`
- **格式**: JSON 对象

```json
{
  "protocol": "ws",
  "host": "127.0.0.1",
  "port": "6800",
  "path": "jsonrpc",
  "secret": ""
}
```

### 扩展集成 API

扩展可以通过 URL Hash 参数传递配置：

```
index.html#config=<encoded-json>
```

示例：
```javascript
const config = {
  protocol: "ws",
  host: "192.168.1.100",
  port: "6800",
  path: "jsonrpc",
  secret: "mysecret"
};

const url = `index.html#config=${encodeURIComponent(JSON.stringify(config))}`;
window.open(url);
```

### 配置优先级

1. **URL Hash 参数** - 来自扩展的配置（临时使用，不保存）
2. **localStorage** - 用户保存的配置（持久化）
3. **默认配置** - localhost:6800

## 连接状态管理

- **默认**: 未连接
- **连接验证**: 调用 `aria2.getVersion` 验证
- **认证失败**: 自动标记为未连接
- **运行时错误**: 自动断开并停止轮询

## 技术栈

- **框架**: Svelte 4
- **构建工具**: Vite 5
- **协议**: WebSocket / HTTP(S)
- **RPC**: Aria2 JSON-RPC

## 项目结构

```
webui/
├── src/
│   ├── App.svelte           # 主应用组件
│   ├── main.js              # 入口文件
│   ├── components/          # UI 组件
│   │   ├── AddDownload.svelte
│   │   ├── ConnectionInfo.svelte
│   │   ├── DownloadItem.svelte
│   │   ├── DownloadList.svelte
│   │   ├── Settings.svelte
│   │   └── Stats.svelte
│   ├── stores/              # Svelte stores
│   │   ├── client.js        # Aria2 客户端
│   │   ├── downloads.js     # 下载列表
│   │   └── stats.js         # 统计信息
│   ├── lib/                 # 工具库
│   │   ├── aria2-client.js  # Aria2 RPC 客户端
│   │   └── i18n.js          # 国际化
│   └── styles/
│       └── global.css       # 全局样式
├── public/
│   └── index.html
├── dist/                    # 构建产物
├── package.json
└── vite.config.js
```

## API 文档

### Aria2Client 类

```javascript
import { Aria2Client } from './lib/aria2-client.js';

const client = new Aria2Client({
  protocol: 'ws',      // ws | wss | http | https
  host: '127.0.0.1',
  port: '6800',
  path: 'jsonrpc',
  secret: ''           // 可选的 RPC secret
});

// 连接
await client.connect();

// 调用方法
const version = await client.getVersion();
const downloads = await client.tellActive();
const gid = await client.addUri(['http://example.com/file.zip']);
```

### Stores

```javascript
import { aria2Client, connected } from './stores/client.js';
import { startDownloadUpdates, stopDownloadUpdates } from './stores/downloads.js';
import { startStatsUpdates, stopStatsUpdates } from './stores/stats.js';

// 订阅连接状态
connected.subscribe(isConnected => {
  console.log('Connected:', isConnected);
});

// 启动轮询
startDownloadUpdates();
startStatsUpdates();

// 停止轮询
stopDownloadUpdates();
stopStatsUpdates();
```

## 部署

### 静态部署

将 `dist/` 目录部署到任何 Web 服务器。

### Docker

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
```

### GitHub Pages

```bash
pnpm build
# 将 dist/ 目录推送到 gh-pages 分支
```

## 许可证

MIT
