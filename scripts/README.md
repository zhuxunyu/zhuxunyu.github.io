# 脚本目录

**用途**: 存放所有自动化脚本

**结构**:
```
scripts/
├── blog/           # 博客相关脚本
├── novel/          # 小说相关脚本
├── xhs/            # 小红书相关脚本
└── README.md       # 本说明文件
```

---

## 📋 目录分类

### `blog/` - 博客脚本

| 脚本 | 用途 | 调用方式 |
|------|------|---------|
| `blog-stats.sh` | 博客统计 | crontab / 手动 |

### `novel/` - 小说脚本

| 脚本 | 用途 | 调用方式 |
|------|------|---------|
| `fanqie_publisher.py` | 番茄小说发布 | 手动（Windows） |
| `fanqie_cookies.json` | 登录凭证 | 自动加载 |
| `fanqie_publisher.bat` | Windows 一键运行 | 双击 |
| `README_WINDOWS.md` | Windows 使用说明 | 参考 |

### `xhs/` - 小红书脚本

| 脚本 | 用途 | 调用方式 |
|------|------|---------|
| `xhs_auto_publish.py` | 自动发布 | crontab (8:00/12:00/20:00) |
| `xhs_cookies.json` | 登录凭证 | 自动加载 |

---

## ⚙️ Crontab 配置

```bash
# 博客统计 - 每日 9:00
0 9 * * * cd /home/zhuxunyu/.openclaw/workspace && /usr/bin/python3 scripts/blog/blog-stats.sh >> logs/blog-stats.log 2>&1

# 小红书早间 - 每日 8:00
0 8 * * * cd /home/zhuxunyu/.openclaw/workspace && /usr/bin/python3 scripts/xhs/xhs_auto_publish.py morning >> logs/xhs_auto.log 2>&1

# 小红书午间 - 每日 12:00
0 12 * * * cd /home/zhuxunyu/.openclaw/workspace && /usr/bin/python3 scripts/xhs/xhs_auto_publish.py afternoon >> logs/xhs_auto.log 2>&1

# 小红书晚间 - 每日 20:00
0 20 * * * cd /home/zhuxunyu/.openclaw/workspace && /usr/bin/python3 scripts/xhs/xhs_auto_publish.py evening >> logs/xhs_auto.log 2>&1
```

---

## ⚠️ 注意事项

1. **敏感文件** - Cookies 文件不要上传到 GitHub
2. **路径更新** - crontab 中的脚本路径需要更新
3. **权限设置** - 确保脚本有执行权限 `chmod +x *.sh`

---

**最后更新**: 2026-03-12  
**维护者**: 运营团队
