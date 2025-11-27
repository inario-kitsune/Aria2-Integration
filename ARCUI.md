# ArcUI - 轻量级 Aria2 Web 界面

## 概述

**ArcUI** 是一个基于 Svelte 构建的轻量级、现代化的 Aria2 下载管理 Web 界面。作为 Arc 生态系统的一部分：

- **arc-core**: Aria2 通信核心库
- **arc-cli**: Aria2 命令行交互工具
- **ArcUI**: Web 用户界面（本项目）

## 主要特性

### 核心功能
- 📊 **实时统计**: 下载/上传速度、活动/等待/已停止任务数量
- 📝 **任务列表**: 支持按状态筛选（进行中/等待中/已停止）
- ▶️ **任务操作**: 暂停、继续、删除下载任务
- ➕ **添加下载**: 支持 HTTP、HTTPS、FTP、Magnet 链接

### 技术优势
- 🌐 **多语言支持**: 英语、简体中文、繁体中文、日语
- 🎨 **主题适配**: 自动跟随系统明暗主题
- ⚡ **轻量高效**: ~37KB JS + ~10KB CSS（构建后），gzip 压缩后仅 ~13KB
- 🚫 **无 CSP 问题**: 不需要 `unsafe-eval`（不同于基于 Angular 的 AriaNg）
- 🔄 **实时更新**: WebSocket 支持，1秒刷新统计和任务状态

## 多语言支持 (i18n)

### 支持的语言

| 语言 | 代码 | 名称 |
|------|------|------|
| English | `en` | English |
| 简体中文 | `zh-CN` | 简体中文 |
| 繁體中文 | `zh-TW` | 繁體中文 |
| 日本語 | `ja` | 日本語 |

### 特性

- ✅ **自动检测**: 根据浏览器语言自动选择界面语言
- ✅ **手动切换**: 通过页面右上角的 🌐 按钮切换语言
- ✅ **持久化**: 用户选择的语言保存在 localStorage 中
- ✅ **完整翻译**: 所有 UI 文本均已翻译

### 使用方法

```javascript
// 导入 i18n 系统
import { t, locale, setLocale } from './lib/i18n.js';

// 在组件中使用翻译
{$t('header.addDownload')}  // 输出: "Add Download" / "添加下载" / "新增下載" / "ダウンロード追加"

// 手动切换语言
setLocale('zh-CN');  // 切换到简体中文

// 获取当前语言
console.log($locale);  // 'en', 'zh-CN', 'zh-TW', 或 'ja'
```

### 添加新语言

1. 编辑 `webui/src/lib/i18n.js`
2. 在 `LOCALES` 对象中添加新语言：
   ```javascript
   export const LOCALES = {
     'en': 'English',
     'ko': '한국어',  // 新增韩语
     // ...
   };
   ```
3. 在 `translations` 对象中添加翻译：
   ```javascript
   const translations = {
     'ko': {
       'app.name': 'ArcUI',
       'header.connected': '연결됨',
       // ... 完整的翻译键值
     }
   };
   ```

## 项目结构

```
webui/
├── src/
│   ├── components/           # Svelte 组件
│   │   ├── AddDownload.svelte    # 添加下载对话框
│   │   ├── DownloadItem.svelte   # 下载任务卡片
│   │   ├── DownloadList.svelte   # 下载列表（带标签页）
│   │   └── Stats.svelte          # 全局统计信息
│   ├── stores/              # 状态管理
│   │   ├── client.js        # Aria2 客户端实例
│   │   ├── downloads.js     # 下载列表状态
│   │   └── stats.js         # 全局统计状态
│   ├── lib/                 # 工具库和 API 客户端
│   │   ├── aria2-client.js  # Aria2 JSON-RPC 客户端
│   │   └── i18n.js          # 国际化系统
│   ├── styles/              # 全局样式
│   │   └── global.css       # CSS 变量和工具类
│   ├── App.svelte           # 根组件
│   └── main.js              # 入口文件
├── public/                  # 静态资源
├── index.html              # HTML 模板
├── package.json            # 依赖和脚本
├── vite.config.js          # Vite 构建配置
└── README.md              # 文档
```

## 开发指南

### 安装依赖

```bash
cd webui
pnpm install
```

### 开发服务器

```bash
pnpm run dev
```

访问 `http://localhost:5173` 查看开发版本

### 构建

```bash
pnpm run build
```

输出到 `dist/` 目录：
- `index.html` - 入口 HTML 文件
- `webui.js` - 打包的 JavaScript
- `webui.css` - 打包的 CSS

### 在扩展中构建

从项目根目录运行：

```bash
pnpm run build
```

这会：
1. 构建 Svelte Web UI (`webui/dist/`)
2. 复制构建产物到 `dist/data/webui/`
3. 在扩展中通过 `/data/webui/index.html` 访问

## API 客户端

ArcUI 使用完整的 Aria2 JSON-RPC 客户端实现 (`src/lib/aria2-client.js`)

### 支持的协议
- WebSocket (`ws://`, `wss://`)
- HTTP (`http://`, `https://`)

### 主要 API 方法

```javascript
import { Aria2Client } from './lib/aria2-client.js';

const client = new Aria2Client({
  protocol: 'ws',
  host: '127.0.0.1',
  port: '6800',
  secret: 'mysecret'
});

await client.connect();

// 添加下载
await client.addUri(['http://example.com/file.zip']);

// 获取活动下载
const active = await client.tellActive();

// 暂停/继续
await client.pause(gid);
await client.unpause(gid);

// 删除
await client.remove(gid);

// 获取全局统计
const stats = await client.getGlobalStat();
```

### WebSocket 事件

```javascript
client.on('open', () => console.log('Connected'));
client.on('close', () => console.log('Disconnected'));
client.on('downloadStart', (event) => console.log('Download started:', event.gid));
client.on('downloadComplete', (event) => console.log('Download completed:', event.gid));
```

## 设计系统

### CSS 变量

ArcUI 使用与扩展相同的设计系统，支持明暗主题自动切换：

```css
/* 亮色模式 */
--background: #ffffff
--surface: #f5f5f7
--text: #1d1d1f
--primary: #0071e3
--success: #34c759
--warning: #ff9500
--danger: #ff3b30

/* 暗色模式 (自动应用) */
@media (prefers-color-scheme: dark) {
  --background: #1c1c1e
  --surface: #2c2c2e
  --text: #f5f5f7
  --primary: #0a84ff
  /* ... */
}
```

### 工具类

```css
.flex, .flex-col, .flex-center
.gap-{size}
.p-{size}, .m-{size}
.text-{size}
```

## 未来增强

- [ ] 下载详情视图
- [ ] 全局选项配置
- [ ] 批量操作（全部暂停、全部继续）
- [ ] 下载搜索/过滤
- [ ] 已完成下载的文件浏览器
- [ ] 带宽限制控制
- [ ] 通知系统
- [ ] 键盘快捷键
- [ ] BT/种子特定功能（节点信息、tracker 管理）

## 独立发布

ArcUI 设计为可独立提取的 npm 包：

1. ✅ 独立的 `package.json`，包名为 `arcui`
2. ✅ 自包含的依赖
3. ✅ 可发布到 npm
4. ✅ 可嵌入任何 web 应用
5. ✅ 浏览器扩展无关（使用可 polyfill 的标准 `browser` API）

### 作为独立应用使用

```bash
# 克隆项目
git clone https://github.com/inario-kitsune/Aria2-Integration.git
cd Aria2-Integration/webui

# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 生产构建
pnpm run build

# 部署 dist/ 目录到你的 web 服务器
```

## 性能指标

| 指标 | 数值 |
|------|------|
| 未压缩 JS | ~37KB |
| 未压缩 CSS | ~10KB |
| Gzip 压缩后总计 | ~13KB |
| 初始加载时间 | <100ms |
| 运行时内存 | ~5MB |
| 支持的并发下载 | 无限制 |

## 与 AriaNg 对比

| 特性 | ArcUI | AriaNg |
|------|-------|--------|
| 框架 | Svelte 4 | Angular 1.x |
| 打包大小 | ~13KB (gzipped) | ~500KB+ |
| CSP 要求 | 无 `unsafe-eval` | 需要 `unsafe-eval` |
| 启动时间 | <100ms | ~500ms |
| 运行时开销 | 极低 | 中等 |
| i18n | 4 种语言 | 8+ 种语言 |
| 功能完整度 | 基础 MVP | 完整功能 |

ArcUI 专注于**核心下载管理功能**，提供**极致的轻量和性能**。如果需要高级功能（如详细的 BT 管理、全局配置等），建议继续使用 AriaNg。

## 许可证

MIT License

---

**Arc 生态系统** - 为 Aria2 打造的现代化工具链
