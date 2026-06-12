from lab.data import load_and_format
from lab.model import load_tokenizer, make_bnb_config, load_4bit_model
from lab.lora import find_lora_targets, build_lora_config
from lab.train import run_sft

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"

train_ds, eval_ds = load_and_format("b-mc2/sql-create-context", 0.02, 42)

tok = load_tokenizer(MODEL_ID)
bnb = make_bnb_config()
model = load_4bit_model(MODEL_ID, bnb)

targets = find_lora_targets(model)
print("LoRA targets:", targets)

peft = build_lora_config(targets, r=16, alpha=32, dropout=0.05)

trainer = run_sft(
    model=model,
    tokenizer=tok,
    train_ds=train_ds,
    eval_ds=eval_ds,
    peft_config=peft,
    output_dir="artifacts/qwen_text2sql_lora",
    max_seq_length=2048,
    train_cfg={
        "per_device_train_batch_size": 1,
        "gradient_accumulation_steps": 16,
        "num_train_epochs": 1,
        "learning_rate": 2e-4,
        "warmup_steps": 50,
        "logging_steps": 10,
        "save_steps": 200,
        "save_total_limit": 2,
        "fp16": False,
        "bf16": False,
        "optim": "paged_adamw_8bit",
    },
)

trainer.model.save_pretrained("artifacts/qwen_text2sql_adapter")
tok.save_pretrained("artifacts/qwen_text2sql_adapter")
print("Saved adapter to artifacts/qwen_text2sql_adapter")
