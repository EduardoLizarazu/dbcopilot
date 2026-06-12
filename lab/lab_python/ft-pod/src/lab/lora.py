import torch
import bitsandbytes as bnb
from peft import LoraConfig


def find_lora_targets(model):
    targets = set()
    for name, module in model.named_modules():
        if isinstance(
            module, (torch.nn.Linear, bnb.nn.Linear4bit, bnb.nn.Linear8bitLt)
        ):
            leaf = name.split(".")[-1]
            if leaf != "lm_head":
                targets.add(leaf)

    preferred = [
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "c_attn",
        "c_proj",
        "wq",
        "wk",
        "wv",
        "wo",
    ]
    hits = [t for t in preferred if t in targets]
    return hits if hits else sorted(list(targets))


def build_lora_config(target_modules, r=16, alpha=32, dropout=0.05):
    return LoraConfig(
        r=r,
        lora_alpha=alpha,
        lora_dropout=dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=target_modules,
    )
