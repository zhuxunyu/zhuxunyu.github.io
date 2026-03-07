---
layout: post
title: "10 个让我效率翻倍的 VS Code 插件（2026 年版）"
date: 2026-03-07 16:00:00 +0800
description: "不是随便找的插件列表。这 10 个是我每天都在用的，每个都经过至少 3 个月的实际测试。"
tags: [开发者工具, VS Code, 效率]
---

## 先说前提

插件不是越多越好。

我见过太多人的 VS Code，装了几十个插件，启动要 10 秒，写代码卡成 PPT。这不是效率工具，这是效率杀手。

我的原则：**少而精**。每个插件都必须有明确的用途，而且确实提升了效率。

下面是我过去 3 个月每天都在用的 10 个插件。

---

## 必装核心（5 个）

### 1. GitLens — Git supercharged

**安装量**: 27M+  
**我用了多久**: 2 年

**核心价值**: 每一行代码都知道是谁写的、为什么写。

**具体场景**:
- 看到一段奇怪的代码，想知道谁写的、什么时候改的
- 需要回溯某个功能的实现历史
- Code Review 时快速了解改动上下文

**最喜欢的功能**:
- 行内 Git blame（鼠标悬停显示）
- 文件历史记录
- 分支可视化

**配置建议**:
```json
{
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line"
}
```

**值不值**: 必装。没有 GitLens 的 VS Code 就像没有搜索的浏览器。

---

### 2. Prettier - Code formatter

**安装量**: 35M+  
**我用了多久**: 3 年

**核心价值**: 别再手动格式化代码了，保存时自动完成。

**具体场景**:
- 写完代码保存时自动格式化
- 团队代码风格统一
- 接手别人的代码一键格式化

**配置示例** (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**配合 settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**值不值**: 必装。这是 2026 年开发者的基本配置。

---

### 3. ESLint

**安装量**: 25M+  
**我用了多久**: 3 年

**核心价值**: 实时发现代码问题，比运行时错误早发现。

**具体场景**:
- 写代码时实时提示错误
- 自动修复部分问题
- 团队代码规范检查

**配置建议**:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**与 Prettier 配合**:
```bash
npm install --save-dev eslint-config-prettier
```

然后在 `.eslintrc` 中：
```json
{
  "extends": ["eslint:recommended", "prettier"]
}
```

**值不值**: 必装。JavaScript/TypeScript 项目必备。

---

### 4. Error Lens

**安装量**: 5M+  
**我用了多久**: 1 年

**核心价值**: 错误直接显示在代码行尾，不用鼠标悬停。

**为什么重要**:
- 传统方式：看到红色波浪线 → 鼠标悬停 → 看错误信息
- Error Lens：错误直接显示在旁边

**具体场景**:
- 写代码时实时看到错误
- 快速定位问题
- 减少上下文切换

**配置建议**:
```json
{
  "errorLens.enabled": true,
  "errorLens.exclude": ["info"]
}
```

**值不值**: 强烈推荐。用过就回不去了。

---

### 5. Auto Rename Tag

**安装量**: 6M+  
**我用了多久**: 2 年

**核心价值**: 改 HTML/XML 开始标签，结束标签自动更新。

**具体场景**:
- 改 `<div>` 为 `<section>`，结束标签自动变
- 改 class 名，配对的标签自动更新
- 写 JSX 时特别有用

**值不值**: 必装。看起来是小功能，但每天都在用。

---

## 场景化插件（5 个）

### 6. Thunder Client

**安装量**: 3M+  
**我用了多久**: 1 年

**核心价值**: 轻量级 Postman 替代品，直接在 VS Code 里测试 API。

**为什么不用 Postman**:
- Postman 越来越重，启动慢
- 需要切换应用
- Thunder Client 够用，而且快

**具体场景**:
- 快速测试后端接口
- 保存常用请求
- 环境变量管理

**值不值**: 推荐。如果你经常测试 API，这个比 Postman 方便。

---

### 7. Path Intellisense

**安装量**: 10M+  
**我用了多久**: 2 年

**核心价值**: 文件路径自动补全，不再拼错路径。

**具体场景**:
- `import` 文件时自动提示
- 支持别名配置
- 减少路径拼写错误

**配置示例** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**值不值**: 推荐。路径补全看似小事，但一天能省好几次调试时间。

---

### 8. TODO Highlight

**安装量**: 2M+  
**我用了多久**: 1 年

**核心价值**: 高亮显示 TODO/FIXME 注释，侧边栏汇总所有待办。

**具体场景**:
- 写代码时标记待办事项
- 侧边栏查看所有 TODO
- 防止忘记处理

**配置示例**:
```json
{
  "todohighlight.keywords": [
    "TODO",
    "FIXME",
    "HACK",
    "XXX",
    "OPTIMIZE"
  ]
}
```

**值不值**: 推荐。适合喜欢写 TODO 的人。

---

### 9. Live Server

**安装量**: 25M+  
**我用了多久**: 3 年

**核心价值**: 本地开发服务器，保存自动刷新浏览器。

**具体场景**:
- 前端开发实时预览
- 保存自动刷新
- 支持热重载

**使用方式**:
- 右键 HTML 文件 → "Open with Live Server"
- 或者点击底部状态栏的 "Go Live"

**值不值**: 必装。前端开发必备。

---

### 10. CodeSnap

**安装量**: 1M+  
**我用了多久**: 6 个月

**核心价值**: 代码截图美化，写教程/发推必备。

**具体场景**:
- 写技术博客需要代码截图
- 分享代码到社交媒体
- 做演示文档

**使用方式**:
1. 选中代码
2. 右键 → CodeSnap
3. 调整样式 → 保存

**值不值**: 可选。如果你经常分享代码，这个很值。

---

## 我的完整配置

### settings.json 核心配置

```json
{
  // 格式化
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  // ESLint 自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  
  // 自动保存
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  
  // 缩进
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  
  // 字体
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  
  // 最小化地图
  "editor.minimap.enabled": true,
  
  // 图标主题
  "workbench.iconTheme": "material-icon-theme",
  
  // GitLens
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line",
  
  // Error Lens
  "errorLens.enabled": true,
  "errorLens.exclude": ["info"]
}
```

### 扩展列表备份

可以用这个命令导出已安装扩展：
```bash
code --list-extensions > extensions.txt
```

在新机器上恢复：
```bash
cat extensions.txt | xargs -n 1 code --install-extension
```

---

## 主题推荐

好主题让写代码更舒服。我用过很多，现在固定在几个：

| 主题 | 风格 | 推荐指数 |
|------|------|---------|
| **One Dark Pro** | 深色经典 | ⭐⭐⭐⭐⭐ |
| **GitHub Theme** | 官方风格 | ⭐⭐⭐⭐⭐ |
| **Dracula Official** | 高对比度 | ⭐⭐⭐⭐ |
| **Catppuccin** | 柔和配色 | ⭐⭐⭐⭐ |
| **Tokyo Night** | 紫色调 | ⭐⭐⭐⭐ |

我的选择：**One Dark Pro** —— 用了 3 年，没换过。

---

## 插件管理建议

### 定期清理

每 3 个月检查一次已安装插件：
```bash
code --list-extensions
```

问自己：
- 这个插件我最近用过吗？
- 如果禁用会影响工作吗？
- 有没有更好的替代品？

### 发现新插件

- [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
- [Awesome VS Code Extensions](https://github.com/viatsko/awesome-vscode)
- Twitter/X 关注开发者

### 性能优化

如果 VS Code 变慢：
1. 禁用不用的插件
2. 检查插件启动时间（Help → Open Process Explorer）
3. 减少工作区文件数（用 `.gitignore` 排除）

---

## 最后

插件只是工具，不是魔法。

装再多插件，也代替不了写代码的硬功夫。但好的工具确实能让工作更舒服，就像好键盘好鼠标一样。

我的建议：先从这 10 个里选 5 个最需要的装上，用一段时间，再决定要不要加更多。

少而精，永远是对的。

---

**VS Code 配置分享**: [GitHub Gist](https://gist.github.com/zhuxunyu)  
**有问题？**: zhuxunyu98@gmail.com
