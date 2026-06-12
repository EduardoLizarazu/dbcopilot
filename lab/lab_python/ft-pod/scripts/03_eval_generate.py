from lab.model import load_tokenizer
from lab.eval import load_base_plus_adapter, generate_sql

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
ADAPTER_DIR = "artifacts/qwen_text2sql_adapter"

tok = load_tokenizer(ADAPTER_DIR)  # adapter folder includes tokenizer
model = load_base_plus_adapter(MODEL_ID, ADAPTER_DIR)

examples = [
    {
        "schema": "CREATE TABLE head (age INTEGER);",
        "question": "How many heads are older than 56?",
    },
    {
        "schema": "CREATE TABLE department (creation VARCHAR, name VARCHAR, budget_in_billions VARCHAR);",
        "question": "List the creation year, name and budget of each department.",
    },
]

for ex in examples:
    out = generate_sql(model, tok, ex["schema"], ex["question"])
    print("\n---")
    print(out[-600:])
