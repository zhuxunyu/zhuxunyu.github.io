---
layout: post
title: "Git 工作流实战：从入门到精通的 10 个技巧"
date: 2026-03-09 09:00:00 +0800
categories: [开发者工具，Git]
tags: [Git, 版本控制，工作流，效率工具]
description: "Git 是开发者每天都在用的工具，但很多人只用了 10% 的功能。本文分享 10 个实用技巧，帮你提升版本控制效率。"
---

## 为什么写这篇文章

上周在整理 `ai-productivity-toolkit` 项目的提交历史时，我发现自己的 Git 使用习惯有很多可以改进的地方。混乱的提交信息、频繁的 merge conflict、不知道如何优雅地回滚代码……这些问题你可能也遇到过。

今天分享 10 个我亲测有效的 Git 技巧，从基础到进阶，希望能帮你建立更清晰的工作流。

---

## 技巧 1：写好提交信息（Commit Message）

### 错误示范
```bash
git commit -m "fix"
git commit -m "update"
git commit -m "bug fix"
```

### 正确做法
使用约定式提交（Conventional Commits）：
```bash
git commit -m "feat: add user authentication with JWT"
git commit -m "fix: resolve memory leak in data processor"
git commit -m "docs: update API documentation for v2.0"
```

**格式**：`<type>: <subject>`

常用 type：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（既不是新功能也不是 bug 修复）
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

**好处**：清晰的提交历史，方便生成 changelog，便于回滚和排查问题。

---

## 技巧 2：使用 Git Alias 提升效率

在 `~/.gitconfig` 中添加常用别名：

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    last = log -1 HEAD
    unstage = reset HEAD --
    amend = commit --amend
    lg = log --oneline --graph --all
    today = log --since="24 hours ago"
```

使用后：
```bash
git st      # 代替 git status
git lg      # 查看漂亮的提交历史图
git today   # 查看今天的提交
```

---

## 技巧 3：交互式暂存（git add -p）

不要一次性 `git add .`，学会分块提交：

```bash
git add -p
```

Git 会逐块显示你的修改，你可以选择：
- `y`: 暂存这块
- `n`: 不暂存
- `s`: 拆分这块（更细粒度）
- `e`: 手动编辑这块
- `q`: 退出

**适用场景**：一个文件里既有功能代码又有调试代码，只想提交功能部分。

---

## 技巧 4：优雅地撤销修改

### 撤销工作区修改
```bash
git checkout -- filename      # Git 2.23 之前
git restore filename          # Git 2.23+
```

### 撤销暂存
```bash
git reset HEAD filename       # 旧版本
git restore --staged filename # Git 2.23+
```

### 撤销提交（本地）
```bash
git reset --soft HEAD~1   # 撤销提交，保留更改在暂存区
git reset --mixed HEAD~1  # 撤销提交，保留更改在工作区（默认）
git reset --hard HEAD~1   # 撤销提交，丢弃更改（危险！）
```

### 撤销已推送的提交
```bash
git revert <commit-hash>  # 创建新提交来撤销，安全
```

**注意**：`reset` 会改写历史，`revert` 会创建新提交。已推送的分支用 `revert`。

---

## 技巧 5：使用 Stash 临时保存工作

写到一半需要切换分支？用 stash：

```bash
git stash              # 保存当前工作
git stash list         # 查看保存的列表
git stash pop          # 恢复并删除 stash
git stash apply        # 恢复但不删除
git stash drop         # 删除 stash
```

带消息的 stash：
```bash
git stash save "WIP: implementing user login"
```

---

## 技巧 6：清理分支历史（git rebase -i）

合并多个提交，让历史更清晰：

```bash
git rebase -i HEAD~3
```

编辑器会显示最近 3 次提交：
```
pick abc123 feat: add login
pick def456 fix: typo
pick ghi789 refactor: cleanup
```

可以改为：
```
pick abc123 feat: add login
fixup def456 fix: typo
fixup ghi789 refactor: cleanup
```

**结果**：三个提交合并成一个，历史更干净。

**警告**：不要对已推送的分支使用 rebase（会改写历史）。

---

## 技巧 7：使用 Cherry-pick 选择提交

想把某个提交从其他分支拿过来？

```bash
git cherry-pick <commit-hash>
```

**适用场景**：
- bugfix 分支的修复需要应用到主分支
- 某个功能提交需要单独提取

多个提交：
```bash
git cherry-pick <hash1> <hash2> <hash3>
git cherry-pick <hash1>^..<hash3>  # 范围
```

---

## 技巧 8：查看代码是谁写的（git blame）

想知道某行代码是谁写的？

```bash
git blame filename
git blame -L 10,20 filename  # 查看特定行范围
git blame -L 10,20 -C filename  # 追踪代码移动
```

在线工具：GitHub/GitLab 的 blame 视图更直观。

---

## 技巧 9：使用 Hook 自动化工作流

在项目 `.git/hooks/` 目录下添加脚本：

### 提交前检查（pre-commit）
```bash
#!/bin/bash
# .git/hooks/pre-commit

# 运行测试
npm test

# 检查代码格式
npm run lint

# 如果有错误，退出码非 0，提交会被阻止
```

### 提交后通知（post-commit）
```bash
#!/bin/bash
# .git/hooks/post-commit

# 发送通知
curl -X POST https://your-webhook.com/notify \
  -d "commit=$(git rev-parse HEAD)"
```

让 hook 可执行：
```bash
chmod +x .git/hooks/pre-commit
```

---

## 技巧 10：配置多账户 SSH

需要在同一台电脑上用不同 GitHub 账号？

### 1. 生成多个 SSH key
```bash
ssh-keygen -t ed25519 -C "personal@email.com" -f ~/.ssh/id_ed25519_personal
ssh-keygen -t ed25519 -C "work@company.com" -f ~/.ssh/id_ed25519_work
```

### 2. 配置 SSH config
```bash
# ~/.ssh/config

# 个人账号
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

# 工作账号
Host github.com-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

### 3. 克隆时使用不同 host
```bash
git clone git@github.com-personal:username/personal-project.git
git clone git@github.com-work:username/work-project.git
```

---

## 我的工作流示例

日常开发中，我这样使用 Git：

```bash
# 1. 开始新功能
git checkout -b feat/new-feature

# 2. 开发过程中频繁小提交
git add -p
git commit -m "feat: implement part 1"
git commit -m "feat: implement part 2"

# 3. 完成功能后整理提交
git rebase -i HEAD~3  # 合并相关提交

# 4. 推送到远程
git push -u origin feat/new-feature

# 5. 创建 Pull Request
gh pr create --title "feat: add new feature" --body "Description..."

# 6. 合并后清理
git checkout main
git pull
git branch -d feat/new-feature
```

---

## 总结

Git 是开发者最重要的工具之一，值得花时间深入学习。这 10 个技巧覆盖了：

- ✅ 清晰的提交信息
- ✅ 效率提升（alias）
- ✅ 精细控制（add -p, stash）
- ✅ 历史管理（reset, revert, rebase）
- ✅ 协作技巧（cherry-pick, blame）
- ✅ 自动化（hooks）
- ✅ 多账户配置

**建议**：不要一次性全部掌握，每周练习 1-2 个技巧，逐步建立适合自己的工作流。

---

## 延伸阅读

- [Pro Git 免费电子书](https://git-scm.com/book/zh/v2)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [GitHub CLI 文档](https://cli.github.com/)

---

**你的 Git 工作流是什么样的？有什么独门技巧？欢迎在评论区分享！**
