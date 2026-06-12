from trl import SFTTrainer, SFTConfig


def run_sft(
    model,
    tokenizer,
    train_ds,
    eval_ds,
    peft_config,
    output_dir: str,
    max_seq_length: int,
    train_cfg: dict,
):
    sft_cfg = SFTConfig(
        output_dir=output_dir,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        per_device_train_batch_size=train_cfg["per_device_train_batch_size"],
        gradient_accumulation_steps=train_cfg["gradient_accumulation_steps"],
        num_train_epochs=train_cfg["num_train_epochs"],
        learning_rate=train_cfg["learning_rate"],
        warmup_steps=train_cfg["warmup_steps"],
        logging_steps=train_cfg["logging_steps"],
        save_steps=train_cfg["save_steps"],
        save_total_limit=train_cfg["save_total_limit"],
        fp16=train_cfg["fp16"],
        bf16=train_cfg["bf16"],
        optim=train_cfg["optim"],
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        args=sft_cfg,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        peft_config=peft_config,
        tokenizer=tokenizer,
    )

    trainer.train()
    return trainer
