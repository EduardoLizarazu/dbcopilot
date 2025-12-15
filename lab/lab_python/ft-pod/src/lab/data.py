from datasets import load_dataset
from .prompts import to_text2sql_text


def load_and_format(dataset_id: str, test_size: float, seed: int):
    raw = load_dataset(dataset_id, split="train")
    raw = raw.train_test_split(test_size=test_size, seed=seed)
    train_ds, eval_ds = raw["train"], raw["test"]

    train_formatted = train_ds.map(
        to_text2sql_text, remove_columns=train_ds.column_names
    )
    eval_formatted = eval_ds.map(to_text2sql_text, remove_columns=eval_ds.column_names)
    return train_formatted, eval_formatted
