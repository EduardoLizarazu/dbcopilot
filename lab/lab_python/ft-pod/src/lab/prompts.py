SYSTEM_PROMPT = (
    "You are a text-to-SQL assistant. "
    "Given a database schema (context) and a natural language question, "
    "write a correct SQL query. Output ONLY SQL."
)


def to_text2sql_text(example: dict) -> dict:
    text = f"""You are a text-to-SQL assistant.
Given a database schema and a question, write a correct SQL query.

### Schema:
{example['context']}

### Question:
{example['question']}

### SQL:
{example['answer']}
"""
    return {"text": text}


def build_inference_prompt(tok, schema: str, question: str) -> str:
    user_msg = f"### Schema:\n{schema}\n\n### Question:\n{question}\n\n### SQL:"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    return tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
