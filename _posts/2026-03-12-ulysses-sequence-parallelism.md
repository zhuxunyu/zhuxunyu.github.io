---
title: "Ulysses 序列并行：如何训练百万 Token 上下文"
date: 2026-03-12 08:00:00
tags: [深度学习，分布式训练，长上下文，Ulysses, Transformer]
categories: 技术深度
---

# Ulysses 序列并行：如何训练百万 Token 上下文

> 一本书约 25 万 token，多文档分析需要百万级上下文。传统单 GPU 训练在 32k token 时就已触及显存墙。Ulysses 序列并行技术如何突破这一瓶颈？

## 长上下文训练的显存困境

Transformer 的注意力机制计算复杂度是 **O(n²)**——序列长度每翻倍，显存需求增长 4 倍。

即使使用 FlashAttention 将显存优化到 **O(n)**，32k+ token 的训练仍然逼近单 GPU 极限。

**典型长上下文场景**：
- 📚 **文档理解**：整本书、法律合同、研究论文
- 💻 **代码分析**：跨文件的大型代码库
- 🧠 **推理任务**：思维链可能生成数千 token
- 🔍 **RAG 工作流**：多个检索段落拼接

## Ulysses 的核心思想

Ulysses 序列并行 (Snowflake AI Research 提出) 采用了一个巧妙的策略：**除了序列维度拆分，还将注意力头分配到多个 GPU**。

### 六步工作流程

1. **序列分片**：输入序列拆分到 P 个 GPU
2. **QKV 投影**：每个 GPU 计算本地片段的 Q/K/V
3. **All-to-All 通信**：重新分配数据，每个 GPU 持有所有序列位置 + 部分注意力头
4. **本地注意力计算**：每个 GPU 计算分配的注意力头
5. **All-to-All 通信**：逆向重分配，恢复到序列分片格式
6. **输出投影**：每个 GPU 计算本地片段的输出

**关键洞察**：注意力头是独立的，通过用序列局部性换取头局部性，实现高效并行。

## 为什么 Ulysses 比 Ring Attention 更优？

| 对比项 | Ulysses SP | Ring Attention |
|-------|-----------|---------------|
| 通信量 | O(n·d/P) | O(n·d) |
| 通信轮次 | 2 次 all-to-all | P-1 次点对点 |
| 延迟 | 单次集体操作 | 串行 P-1 跳 |

**结论**：Ulysses 的通信量是 Ring Attention 的 **1/P**，且延迟更低。

## 实战配置

```python
from accelerate import Accelerator
from accelerate.utils import ParallelismConfig, DeepSpeedSequenceParallelConfig

parallelism_config = ParallelismConfig(
    sp_backend="deepspeed",
    sp_size=4,  # 4 GPU 并行
    sp_handler=DeepSpeedSequenceParallelConfig(
        sp_seq_length_is_variable=True,
        sp_attn_implementation="flash_attention_2",
    ),
)

accelerator = Accelerator(parallelism_config=parallelism_config)
```

## 性能基准

Snowflake 测试数据 (Llama-3.1-8B，A100 80GB)：

| 序列长度 | 单 GPU | Ulysses (4 GPU) |
|---------|--------|----------------|
| 32k     | OOM    | ✅ 可行         |
| 128k    | OOM    | ✅ 2.8 tok/s/ms |
| 512k    | OOM    | ✅ 1.2 tok/s/ms |
| 1M      | OOM    | ✅ 0.6 tok/s/ms |

## 总结

Ulysses 序列并行通过**注意力头分区 + all-to-all 通信**，将长上下文训练从单 GPU 显存限制中解放出来，使百万 token 训练成为可能。

**参考资料**：
1. DeepSpeed Ulysses: https://arxiv.org/abs/2309.14509
2. HuggingFace Blog: https://huggingface.co/blog/ulysses-sp
