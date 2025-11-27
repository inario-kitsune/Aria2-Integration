# 过滤功能调试指南

## 问题描述
1. 设置页面的列表没有显示添加的内容
2. popup 刷新后不能正确显示已屏蔽状态

## 调试步骤

### 1. 测试 Popup 添加站点

1. 在 Firefox 中加载扩展（about:debugging）
2. 打开浏览器控制台（F12）
3. 访问任意网站（如 www.example.com）
4. 点击扩展图标打开 popup
5. 点击"屏蔽"按钮 → 选择"屏蔽当前域名"

**期望的控制台输出：**
```
Adding to list (exact): www.example.com
Current filterSites: ["www.example.com"]
Current siteFilterMode: blacklist
Saving to storage:
  filterSites: www.example.com
  siteFilterMode: blacklist
Saved successfully
updateSiteUI called
  currentHostname: www.example.com
  filterSites: ["www.example.com"]
  siteFilterMode: blacklist
  isInList result: true
```

### 2. 测试设置页面加载

1. 打开扩展设置页面（选项 → Filters）
2. 查看控制台输出

**期望的控制台输出：**
```
Restored siteFilterMode: blacklist
Restored filterSites text: www.example.com
Parsed siteList: ["www.example.com"]
```

### 3. 测试 Popup 重新打开

1. 关闭并重新打开 popup
2. 查看控制台输出

**期望的控制台输出：**
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

**期望的 UI 状态：**
- 站点名称：www.example.com
- 状态：已屏蔽 (Blocked)
- 按钮：只显示"移除"按钮

## 常见问题排查

### 问题 1: filterSites 为空数组
**可能原因：** storage 中的数据格式不对

**检查方法：**
```javascript
// 在控制台运行
browser.storage.local.get(['filterSites', 'siteFilterMode']).then(console.log)
```

**期望结果：**
```
{
  filterSites: "www.example.com",
  siteFilterMode: "blacklist"
}
```

### 问题 2: isInList 返回 false
**可能原因：** 通配符匹配逻辑错误

**检查方法：** 查看 `isInList result:` 的输出

### 问题 3: 设置页面列表为空
**可能原因：** `renderSiteList()` 没有被调用或 `siteList` 为空

**检查方法：** 查看 `Parsed siteList:` 的输出

## 手动清理存储（如果需要）

```javascript
// 在控制台运行，清除所有过滤设置
browser.storage.local.remove(['filterSites', 'siteFilterMode', 'filterExts', 'extFilterMode', 'allowedSites', 'blockedSites', 'allowedExts', 'blockedExts'])
```

## 预期工作流程

1. **用户在 popup 中添加站点**
   - `addToListExact()` 被调用
   - `filterSites` 数组被更新
   - `saveSiteLists()` 保存到 storage
   - `updateSiteUI()` 更新 UI

2. **设置页面加载**
   - `restore()` 从 storage 读取 `filterSites`
   - 解析为 `siteList` 数组
   - `renderSiteList()` 渲染列表

3. **Popup 重新打开**
   - `loadSiteInfo()` 从 storage 读取 `filterSites`
   - 解析为 `filterSites` 数组
   - `updateSiteUI()` 检查当前站点是否在列表中
   - 根据结果显示相应的按钮和状态
