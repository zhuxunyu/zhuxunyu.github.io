#!/bin/bash
# 博客访问统计脚本 - 每日自动执行
# 用法：./blog-stats.sh [output_file]

set -e

REPO="zhuxunyu/zhuxunyu.github.io"
OUTPUT_FILE="${1:-/tmp/blog-stats-$(date +%Y-%m-%d).md}"
DATE=$(date +%Y-%m-%d)

echo "📊 获取博客访问统计 - $DATE"

# 获取 Traffic 数据
echo "正在获取页面浏览量 (PV)..."
VIEWS=$(gh api /repos/$REPO/traffic/views 2>/dev/null || echo '{}')

echo "正在获取热门页面..."
PATHS=$(gh api /repos/$REPO/traffic/popular/paths 2>/dev/null || echo '[]')

echo "正在获取仓库信息..."
REPO_INFO=$(gh api /repos/$REPO 2>/dev/null || echo '{}')

# 解析数据
TOTAL_VIEWS=$(echo "$VIEWS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null || echo "0")
TOTAL_UNIQUE=$(echo "$VIEWS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('uniques', 0))" 2>/dev/null || echo "0")

STARS=$(echo "$REPO_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stargazers_count', 0))" 2>/dev/null || echo "0")
FORKS=$(echo "$REPO_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('forks_count', 0))" 2>/dev/null || echo "0")

# 生成报告
cat > "$OUTPUT_FILE" << EOF
# 博客访问统计 - $DATE

**生成时间**: $(date +%Y-%m-%d\ %H:%M:%S)

---

## 📊 整体数据

| 指标 | 数值 |
|------|------|
| 总访问量 (PV) | $TOTAL_VIEWS |
| 独立访客 (UV) | $TOTAL_UNIQUE |
| GitHub Stars | $STARS |
| Forks | $FORKS |

---

## 📈 热门页面 (Top 10)

EOF

# 添加热门页面
echo "$PATHS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, p in enumerate(data[:10], 1):
    path = p.get('path', 'Unknown')
    views = p.get('count', 0)
    uniques = p.get('uniques', 0)
    print(f'{i}. **{path}** - {views} 次浏览 ({uniques} 独立访客)')
" >> "$OUTPUT_FILE" 2>/dev/null || echo "暂无数据" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << EOF

---

## 📝 备注

- 数据来源：GitHub Traffic API
- 统计周期：过去 14 天
- 更新时间：每日自动执行

---

**下次更新**: $(date -d "+1 day" +%Y-%m-%d)
EOF

echo "✅ 统计完成：$OUTPUT_FILE"
cat "$OUTPUT_FILE"
