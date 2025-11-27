# 已修复的问题

## 问题：设置页面列表不显示，popup 状态不正确

### 根本原因
`config.js` 中的 `config.command.guess` 对象没有包含新的字段：
- `filterSites`
- `siteFilterMode`
- `filterExts`
- `extFilterMode`

当 `exception.js` 调用 `browser.storage.local.get(config.command.guess, ...)` 时，由于 `filterSites` 不在默认值对象中，所以即使 storage 中有数据，`prefs.filterSites` 也会是 `undefined`。

### 修复内容

#### 1. 更新 config.js (src/extension/config.js)
添加新的配置字段到 `config.command.guess`：
```javascript
// 过滤设置
filterSites: "",          // 站点列表
siteFilterMode: "blacklist",  // 站点过滤模式
filterExts: "",           // 扩展名列表
extFilterMode: "blacklist",   // 扩展名过滤模式
```

#### 2. 保留旧字段用于兼容
```javascript
// 旧版兼容（用于迁移）
allowedSites: "",
blockedSites: "",
allowedExts: "",
blockedExts: "",
```

### 测试步骤

1. **清除旧数据（可选）**
   ```javascript
   browser.storage.local.clear()
   ```

2. **添加站点到黑名单**
   - 访问 www.example.com
   - 打开 popup
   - 点击"屏蔽" → "屏蔽当前域名"
   - 查看控制台输出：
     ```
     Adding to list (exact): www.example.com
     Current filterSites: ["www.example.com"]
     Saving to storage:
       filterSites: www.example.com
       siteFilterMode: blacklist
     Saved successfully
     ```

3. **验证设置页面显示**
   - 打开扩展设置 → Filters
   - 应该看到 "www.example.com" 在列表中
   - 控制台输出：
     ```
     Restored siteFilterMode: blacklist
     Restored filterSites text: www.example.com
     Parsed siteList: ["www.example.com"]
     renderSiteList called, siteList: ["www.example.com"]
     Rendering site item 0: www.example.com
     renderSiteList completed
     ```

4. **验证 popup 状态**
   - 关闭并重新打开 popup
   - 应该显示：
     - 站点名称：www.example.com
     - 状态：已屏蔽
     - 按钮：只有"移除"按钮
   - 控制台输出：
     ```
     Popup loaded - filterSites: ["www.example.com"]
     Popup loaded - siteFilterMode: blacklist
     Current hostname: www.example.com
     updateSiteUI called
       currentHostname: www.example.com
       filterSites: ["www.example.com"]
       siteFilterMode: blacklist
       isInList result: true
     ```

5. **验证拦截功能**
   - 在 www.example.com 上尝试下载文件
   - 应该不会被 Aria2 拦截（因为在黑名单中）

### 预期结果

✅ Popup 中添加的站点会保存到 storage
✅ 设置页面能正确显示添加的站点
✅ Popup 重新打开时能正确显示"已屏蔽"状态
✅ 拦截功能按预期工作

### 相关文件

- `src/extension/config.js` - 添加新字段到默认配置
- `src/extension/data/options/exception.js` - 读取和显示配置
- `src/extension/data/action/index.js` - Popup 保存和显示逻辑
- `src/extension/common.js` - 后台拦截逻辑
