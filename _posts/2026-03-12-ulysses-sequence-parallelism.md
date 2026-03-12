---
title: "Ulysses 序列并行：如何训练百万 Token 上下文"
date: 2026-03-12 09:00:00
tags: [深度学习，分布式训练，长上下文，Ulysses, Transformer]
categories: 技术深度
---

# Ulysses 序列并行：如何训练百万 Token 上下文

> 一本书约 25 万 token，多文档分析需要百万级上下文。传统单 GPU 训练在 32k token 时就已触及显存墙。Ulysses 序列并行技术如何突破这一瓶颈？

## 长上下文训练的显存困境

Transformer 的注意力机制计算复杂度是 **O(n²)**——序列长度每翻倍，显存需求增长 4 倍。

即使使用 FlashAttention 将显存优化到 **O(n)**，32k+ token 的训练仍然逼近单 GPU 极限：

| 序列长度 | 显存需求 (估算) | 单 GPU 可行性 |
|---------|---------------|-------------|
| 4k      | ~2GB          | ✅ 轻松      |
| 16k     | ~8GB          | ✅ 可行      |
| 32k     | ~16GB         | ⚠️ 极限      |
| 128k    | ~64GB+        | ❌ 不可能    |
| 1M      | ~500GB+       | ❌ 需要多 GPU |

**典型长上下文场景**：
- 📚 **文档理解**：整本书、法律合同、研究论文
- 💻 **代码分析**：跨文件的大型代码库
- 🧠 **推理任务**：思维链可能生成数千 token
- 🔍 **RAG 工作流**：多个检索段落拼接

传统数据并行无济于事——每个 GPU 仍需在注意力块内处理完整序列。我们需要**将序列本身拆分到多个设备**。

## Ulysses 的核心思想

Ulysses 序列并行 (Snowflake AI Research 提出) 采用了一个巧妙的策略：**除了序列维度拆分，还将注意力头分配到多个 GPU**。

![Ulysses 序列并行概览](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ulysses/ulysses_overview.png)

### 六步工作流程

```
┌─────────────────────────────────────────────────────────┐
│  输入序列 (n tokens)                                    │
│  [token_0, token_1, ..., token_n]                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1️⃣ 序列分片 (Sequence Sharding)                         │
│  GPU0: [0, n/P)  GPU1: [n/P, 2n/P)  ...                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2️⃣ QKV 投影 (每个 GPU 计算本地片段的 Q/K/V)               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3️⃣ All-to-All 通信 (重新分配数据)                       │
│  每个 GPU 持有：所有序列位置 + 部分注意力头                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4️⃣ 本地注意力计算 (每个 GPU 计算分配的注意力头)            │
│  可使用 FlashAttention 或 SDPA                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5️⃣ All-to-All 通信 (逆向重分配)                         │
│  恢复到序列分片格式                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  6️⃣ 输出投影 (每个 GPU 计算本地片段的输出)                 │
└─────────────────────────────────────────────────────────┘
```

**关键洞察**：注意力头是独立的——每个头可以单独计算。通过**用序列局部性换取头局部性**，Ulysses 实现了高效并行，通信开销相对较低。

## 为什么 Ulysses 比 Ring Attention 更优？

| 对比项 | Ulysses SP | Ring Attention |
|-------|-----------|---------------|
| 通信量 | O(n·d/P) | O(n·d) |
| 通信轮次 | 2 次 all-to-all | P-1 次点对点 |
| 延迟 | 单次集体操作 | 串行 P-1 跳 |
| 带宽利用 | 全二分带宽 | 环形带宽受限 |

**结论**：Ulysses 的通信量是 Ring Attention 的 **1/P**，且延迟更低。

## 实战：使用 Accelerate 配置 Ulysses

### 基础配置

```python
from accelerate import Accelerator
from accelerate.utils import ParallelismConfig, DeepSpeedSequenceParallelConfig

parallelism_config = ParallelismConfig(
    sp_backend="deepspeed",
    sp_size=4,  # 4 GPU 并行
    dp_shard_size=1,  # 需满足：dp_replicate × dp_shard × sp_size = 总进程数
    sp_handler=DeepSpeedSequenceParallelConfig(
        sp_seq_length=None,  # None 支持可变长度序列
        sp_seq_length_is_variable=True,
        sp_attn_implementation="flash_attention_2",  # 或 "sdpa"
    ),
)

accelerator = Accelerator(parallelism_config=parallelism_config)
```

### 关键参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `sp_size` | 序列并行 GPU 数量 | 4-8 |
| `sp_backend` | 必须是 `"deepspeed"` | deepspeed |
| `sp_seq_length_is_variable` | 支持 batch 内序列长度变化 | True |
| `sp_attn_implementation` | 注意力实现 | flash_attention_2 |

### 模型准备

```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-5)

# 自动注册 Ulysses 并包装 dataloader
model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)
```

`prepare()` 调用自动完成：
1. 向 DeepSpeed 的 `UlyssesSPAttentionHF` 注册模型
2. 用 `UlyssesSPDataLoaderAdapter` 包装 dataloader 处理序列分片
3. 自动注入 `shift_labels` 用于正确的 loss 计算

## Transformers Trainer 集成

如果你使用 HuggingFace Transformers 的 `Trainer`，配置更简单：

```python
from transformers import TrainingArguments, Trainer

training_args = TrainingArguments(
    parallelism_config=parallelism_config,
    per_device_train_batch_size=1,
    output_dir="./ulysses-training",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

trainer.train()
```

**Trainer 自动处理**：
- ✅ Dataloader 包装
- ✅ Loss 跨 SP rank 聚合
- ✅ 有效 batch size 计算
- ✅ 训练步数调整

## 性能基准

Snowflake 的测试数据显示 (Llama-3.1-8B，A100 80GB)：

| 序列长度 | 单 GPU | Ulysses (4 GPU) | 加速比 |
|---------|--------|----------------|--------|
| 32k     | OOM    | ✅ 可行         | ∞      |
| 128k    | OOM    | ✅ 2.8 tok/s/ms | ∞      |
| 512k    | OOM    | ✅ 1.2 tok/s/ms | ∞      |
| 1M      | OOM    | ✅ 0.6 tok/s/ms | ∞      |

**关键发现**：
- Ulysses 使百万 token 训练成为可能
- 通信开销占比 < 15% (4 GPU 配置)
- 扩展效率随 GPU 数量线性增长

## 最佳实践

### 1. 选择合适的 sp_size

```
sp_size 选择指南:
- 32k-64k 序列：2-4 GPU
- 128k-256k 序列：4-8 GPU
- 512k-1M 序列：8-16 GPU
```

### 2. 使用 FlashAttention-2

```python
sp_handler=DeepSpeedSequenceParallelConfig(
    sp_attn_implementation="flash_attention_2",  # 比 SDPA 快 2-3x
)
```

### 3. 可变长度序列支持

```python
sp_seq_length_is_variable=True  # 必须设置，避免 padding 浪费
```

### 4. Loss 聚合 (自定义训练循环)

```python
sp_size = parallelism_config.sp_size
if sp_size > 1:
    from deepspeed.utils import groups
    sp_group = groups._get_sequence_parallel_group()
    
    losses_per_rank = torch.distributed.nn.functional.all_gather(loss, group=sp_group)
    good_tokens = (batch["shift_labels"] != -100).view(-1).sum()
    good_tokens_per_rank = torch.distributed.nn.functional.all_gather(good_tokens, group=sp_group)
    
    total_loss = sum(
        losses_per_rank[i] * good_tokens_per_rank[i]
        for i in range(sp_size)
        if good_tokens_per_rank[i] > 0
    )
    loss = total_loss / max(sum(good_tokens_per_rank), 1)
```

## 为什么位置 ID 比注意力掩码更优？

Ulysses 和 Ring Attention 都使用 `position_ids` 而非 `attention_mask` 进行因果掩码：

**4D 注意力掩码的灾难**：
- 128k token → 128k × 128k = 160 亿元素
- FP16 精度 → **~32GB** 仅用于掩码
- 这还不包括注意力分数本身

**位置 ID 的优势**：
- 仅需 **O(n)** 显存
- 128k token → ~256KB
- 实现相同的因果行为

## 总结

Ulysses 序列并行通过**注意力头分区 + all-to-all 通信**，将长上下文训练从单 GPU 显存限制中解放出来：

| 特性 | 价值 |
|------|------|
| 百万 token 训练 | ✅ 成为可能 |
| 通信效率 | ✅ Ring Attention 的 1/P |
| HuggingFace 集成 | ✅ Accelerate/Trainers/TRL 全支持 |
| 易用性 | ✅ 配置简单，自动处理细节 |

**适用场景**：
- 📖 书籍级文档理解
- 🏛️ 法律/医疗长文本分析
- 💻 跨文件代码理解
- 🔬 科学论文多文档推理

**下一步**：
- 尝试 HuggingFace [Ulysses 示例](https://github.com/huggingface/accelerate/tree/main/examples/sequence_parallelism)
- 阅读 [DeepSpeed Ulysses 论文](https://arxiv.org/abs/2309.14509)
- 查看 [ALST 协议完整文档](https://huggingface.co/papers/2506.13996)

---

**参考资料**：
1. DeepSpeed Ulysses: [arXiv:2309.14509](https://arxiv.org/abs/2309.14509)
2. HuggingFace Blog: [Ulysses Sequence Parallelism](https://huggingface.co/blog/ulysses-sp)
3. Snowflake Engineering: [Ulysses Low Latency LLM Inference](https://www.snowflake.com/en/engineering-blog/ulysses-low-latency-llm-inference/)
