from lab.data import load_and_format

train_ds, eval_ds = load_and_format("b-mc2/sql-create-context", 0.02, 42)
print(train_ds[0]["text"][:400])
print("train:", len(train_ds), "eval:", len(eval_ds))
