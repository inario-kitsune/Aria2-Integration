# ArcUI 故障排除指南

## 常见问题

### 1. 模块加载失败（已修复）

**问题**: `来源为"moz-extension://xxx/webui.js"的模块加载失败`

**原因**: Vite 默认使用绝对路径 `/webui.js`，在浏览器扩展中无法正确解析。

**解决方案**: ✅ 已在 `vite.config.js` 中添加 `base: './'` 使用相对路径。

```javascript
export default defineConfig({
  base: './', // 使用相对路径
  // ...
});
```

构建后的 HTML 现在使用 `./webui.js` 和 `./webui.css`。

---

### 2. 无法连接到 Aria2

**症状**: 
- 状态显示"Disconnected"
- 控制台显示连接错误

**可能原因**:

#### A. Aria2 未运行
```bash
# 检查 Aria2 是否运行
ps aux | grep aria2

# 启动 Aria2
aria2c --enable-rpc --rpc-listen-all
```

#### B. RPC 配置错误
1. 点击 ⚙️ 按钮打开设置
2. 检查配置：
   - Protocol: `ws` (WebSocket) 或 `http`
   - Host: `127.0.0.1` (本地) 或实际 IP
   - Port: `6800` (默认)
   - Path: `jsonrpc`
   - Secret: 如果 Aria2 配置了密钥，需要填写

#### C. CORS 问题
如果使用 HTTP 协议，可能遇到 CORS 限制。建议使用 WebSocket (`ws://`)。

启动 Aria2 时添加 CORS 支持：
```bash
aria2c --enable-rpc \
       --rpc-listen-all \
       --rpc-allow-origin-all
```

---

### 3. 扩展中无法读取配置

**症状**: ArcUI 总是连接到 localhost，忽略扩展配置

**检查步骤**:

1. 打开扩展选项页面
2. 进入"RPC Servers"标签
3. 确认服务器已配置
4. 检查是否设置了"默认服务器"（有 DEFAULT 标记）

**控制台调试**:
```javascript
// 打开 ArcUI 页面，在控制台输入：
browser.storage.local.get(['rpcServers', 'defaultServerId'])
  .then(console.log);

// 应该看到类似输出：
// {
//   rpcServers: "[{\"id\":\"xxx\",\"protocol\":\"ws\",...}]",
//   defaultServerId: "xxx"
// }
```

---

### 4. 下载列表为空

**症状**: 连接成功但看不到下载

**可能原因**:

#### A. 确实没有下载任务
在 Aria2 中添加一个测试下载：
```bash
aria2c "http://example.com/test.zip"
```

#### B. 轮询未启动
检查控制台是否有错误信息。正常情况下应该看到：
```
Connected to Aria2
```

刷新页面试试。

---

### 5. 语言切换不生效

**症状**: 点击语言菜单后界面没有变化

**解决方案**:

1. 清除浏览器缓存
2. 检查控制台是否有错误
3. 检查 localStorage：
   ```javascript
   localStorage.getItem('arcui-locale')
   ```

4. 手动设置语言：
   ```javascript
   localStorage.setItem('arcui-locale', 'zh-CN');
   location.reload();
   ```

---

### 6. 设置保存失败

**症状**: 点击"保存并连接"后显示错误

**检查清单**:

1. ✅ 所有必填字段已填写（Protocol, Host, Port, Path）
2. ✅ Aria2 正在运行
3. ✅ 网络可达性（ping IP 地址）
4. ✅ 防火墙未阻止端口
5. ✅ 如果使用密钥，确保与 Aria2 配置一致

**测试连接**:
```bash
# WebSocket 测试
wscat -c ws://127.0.0.1:6800/jsonrpc

# HTTP 测试
curl -X POST http://127.0.0.1:6800/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"test","method":"aria2.getVersion"}'
```

---

### 7. 性能问题

**症状**: 界面卡顿或响应慢

**优化建议**:

1. **减少轮询频率**: 
   目前统计和下载列表都是 1 秒刷新，如果下载任务很多可能会卡。
   
2. **使用 WebSocket**: 
   相比 HTTP，WebSocket 性能更好且支持实时通知。

3. **限制显示数量**: 
   当前已停止的下载只显示最近 10 个。

---

### 8. 主题问题

**症状**: 亮色主题下某些元素不可见

**已知修复**:

✅ v0.1.0 已修复按钮在亮色主题下的可见性问题。

如果仍有问题：
1. 强制刷新页面 (Ctrl+Shift+R)
2. 清除浏览器缓存
3. 检查是否使用了最新构建

---

## 开发调试

### 启用详细日志

在 `webui/src/App.svelte` 中添加：
```javascript
onMount(async () => {
  console.log('[ArcUI] Mounting...');
  // ... 现有代码
});
```

### 检查构建产物

```bash
# 查看构建的文件
ls -lh dist/data/webui/

# 应该看到：
# index.html  (~0.34 KB)
# webui.css   (~12.58 KB)
# webui.js    (~45.59 KB)

# 检查 HTML 中的路径
grep "src=" dist/data/webui/index.html
# 应该输出: src="./webui.js"  (相对路径)
```

### 重新构建

```bash
# 完整重新构建
pnpm run clean
pnpm run build

# 只重新构建 Web UI
cd webui
pnpm run build
cd ..
node scripts/build.js
```

---

## 获取帮助

如果以上方法都无法解决问题：

1. **检查浏览器控制台**: 
   - 右键点击 ArcUI 页面
   - 选择"检查元素"
   - 查看"控制台"标签页的错误信息

2. **检查扩展控制台**:
   - 打开 `about:debugging`
   - 找到 Aria2 Integration
   - 点击"检查"查看后台脚本日志

3. **提交 Issue**:
   - 访问 https://github.com/inario-kitsune/Aria2-Integration/issues
   - 提供详细的错误信息和浏览器版本

---

## 版本信息

- **ArcUI 版本**: 0.1.0
- **最小 Firefox 版本**: 57+
- **Aria2 兼容版本**: 1.18.0+

最后更新: 2025-11-25
