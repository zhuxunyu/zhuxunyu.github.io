# 博客脚本目录

**用途**: 存放博客相关的自动化脚本

---

## 📋 脚本列表

### `blog/blog-stats.sh` - 博客访问统计

**功能**: 每日自动获取博客访问统计数据

**用法**:
```bash
./scripts/blog/blog-stats.sh [输出文件]
```

**示例**:
```bash
# 输出到默认位置
./scripts/blog/blog-stats.sh

# 输出到指定文件
./scripts/blog/blog-stats.sh /path/to/output.md
```

**输出内容**:
- 总访问量 (PV)
- 独立访客 (UV)
- GitHub Stars / Forks
- 热门页面 Top 10

---

## ⚙️ Crontab 配置（可选）

```bash
# 博客统计 - 每日 9:00
0 9 * * * cd /home/zhuxunyu/zhuxunyu.github.io && ./scripts/blog/blog-stats.sh >> logs/blog-stats.log 2>&1
```

---

## 📝 注意事项

1. **权限设置**: `chmod +x scripts/blog/blog-stats.sh`
2. **GitHub CLI**: 需要安装并认证 `gh auth login`

---

**最后更新**: 2026-03-13
