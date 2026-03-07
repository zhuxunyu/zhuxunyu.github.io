---
layout: post
title: "我的 GitHub 开源策略：不追星，做有用的东西"
date: 2026-03-07 14:00:00 +0800
description: "开源不是为了 stars。至少对我而言，是为了逼自己把东西做好，顺便认识一些同路人。"
tags: [开源, GitHub, 项目规划]
---

## 先说结论

我不打算冲 GitHub Trending。

不是不想，是算过账——投入产出比太低。

那些冲榜的项目，哪个不是花几个月打磨 README、做演示视频、到处宣传？有这个时间，我宁可多写两篇深度分析，或者把产品功能做好。

我的策略更简单：**做对自己有用的东西，然后开源。**

---

## 为什么开源

我开源过几个项目，有几百 stars 的，也有几十个的。回头看，stars 最多的那个，反而是我最不满意的——代码写得乱，文档也不全，就是赶上了一个好时机。

所以我现在想清楚了：

**开源不是为了被认可，是为了逼自己把东西做好。**

当你把代码公开，就不能随便写了。当你知道有人会看，就会多写几行注释。当有人提 issue，你就得认真回答。

这个过程本身，就是成长。

---

## 当前项目：AI Productivity Toolkit

### 这是什么

一个 AI 效率工具集，解决几个实际问题：

1. **Prompt 写不好** — 很多人（包括我）让 AI 干活，但提示词写得烂，输出自然差
2. **重复性办公任务太多** — 处理 Excel、写邮件、整理数据，这些事不该花这么多时间
3. **数据采集麻烦** — 有些数据需要手动复制粘贴，容易出错

### 核心功能

**Prompt 优化器**
```python
from toolkit import PromptOptimizer

optimizer = PromptOptimizer()
# 输入："帮我写个 Python 脚本"
# 输出：结构化的、包含具体要求的 prompt
optimized = optimizer.optimize("帮我写个 Python 脚本")
```

**Excel 自动化**
```python
from toolkit import ExcelAutomation

excel = ExcelAutomation()
# 批量转换、合并、分析
excel.batch_convert(folder="input/", output_format="pdf")
```

**数据采集框架**
```python
from toolkit import DataCollector

collector = DataCollector()
# 合法合规的数据采集，结构化输出
data = collector.fetch(url="https://example.com", format="json")
```

### 技术栈

- Python 3.8+
- 支持多 LLM（OpenAI、Anthropic、本地模型）
- 计划集成 MCP 协议

### 路线图

| 版本 | 功能 | 时间 |
|------|------|------|
| v1.0 | 核心功能 | 2026 Q1 |
| v1.1 | MCP 支持 | 2026 Q2 |
| v2.0 | GUI 界面 | 2026 Q3 |

**仓库**: [zhuxunyu/ai-productivity-toolkit](https://github.com/zhuxunyu/ai-productivity-toolkit)

---

## 未来项目想法

### 1. MCP Browser Server（优先级：高）

**概念**: 浏览器自动化的 MCP Server

**为什么做**:
- MCP 是 2026 年的趋势，AI 工具互操作性很重要
- 现有方案要么太重（Playwright），要么功能有限
- 我想做一个轻量级、易部署的版本

**核心功能**:
- 网页内容提取（支持语义搜索）
- 自动化操作（点击、输入、导航）
- 与 AI 助手无缝集成

**目标**: 5k stars（如果做得好）

---

### 2. AI Code Review Assistant（优先级：中）

**概念**: AI 驱动的代码审查助手

**为什么做**:
- 我自己需要
- 现有工具（如 GitHub Copilot）主要做生成，审查功能弱
- 可以集成到 GitHub Actions

**功能**:
- 自动审查 PR
- 安全漏洞检测
- 代码质量建议
- 自动生成 review 评论

**目标**: 10k stars

---

### 3. Local RAG Knowledge Base（优先级：低）

**概念**: 本地知识库 + RAG 检索

**为什么做**:
- 隐私保护（数据不出本地）
- 离线可用
- 支持中文

**功能**:
- 本地文件索引（PDF、Markdown、Word）
- 向量数据库集成
- 自然语言查询

**目标**: 15k stars

---

## 我的开源原则

### 1. 文档优先

代码可以烂，文档不能烂。

我见过太多项目，功能很强，但文档写得像天书。这种项目，我用一次就放弃了。

我的标准：
- README 要有快速开始（5 分钟内跑起来）
- 每个函数都要有 docstring
- 复杂功能要有示例代码

### 2. 快速响应 issue

24 小时内响应，即使只是说"我看到了，会看看"。

开源是社区驱动的。用户提 issue 是帮你改进，不能冷处理。

### 3. 不盲目追热点

MCP 火，不是所有项目都要加 MCP。RAG 火，不是所有项目都要做 RAG。

我会加新功能，但前提是：
- 我自己需要
- 有用户要求
- 技术成熟

### 4. 商业化不羞耻

如果项目做大了，考虑商业化，这不丢人。

维护开源项目需要时间，时间就是成本。收费不是问题，问题是：你的价值是否配得上这个价格。

---

## 给想开源的人的建议

### 应该做的

1. **解决自己的问题** — 真实需求比想象中的需求靠谱
2. **从小做起** — 第一个版本可以很简单，但要能用
3. **写好文档** — 这是用户的第一印象
4. **积极互动** — 回复 issue，接受 PR
5. **持续维护** — 开源不是一锤子买卖

### 不应该做的

1. **不要为了 stars 做项目** — 这会扭曲你的决策
2. **不要过早优化** — 先让东西能用，再考虑性能
3. **不要忽视安全** — 开源代码会被很多人看，安全问题放大
4. **不要承诺做不到的事** —  roadmap 可以画，但要说明是计划不是承诺

---

## 最后

开源是一件很美妙的事。

你写了一个工具，解决了你的问题。然后发现，世界上还有其他人在为同样的问题烦恼。你把代码公开，他们用了，说"这帮了大忙"。

这种连接感，是 stars 数字给不了的。

我会继续开源，继续做有用的东西。如果你也认同这个理念，欢迎关注我，或者一起参与项目。

---

**项目**: [AI Productivity Toolkit](https://github.com/zhuxunyu/ai-productivity-toolkit)  
**GitHub**: [@zhuxunyu](https://github.com/zhuxunyu)
