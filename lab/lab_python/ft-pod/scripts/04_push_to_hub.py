from transformers import AutoTokenizer
from peft import PeftModel
from lab.model import load_4bit_model, make_bnb_config

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
ADAPTER_DIR = "artifacts/qwen_text2sql_adapter"
HF_REPO = "eduliza/qwen-text2sql-lora"

bnb = make_bnb_config()
base = load_4bit_model(MODEL_ID, bnb)
model = PeftModel.from_pretrained(base, ADAPTER_DIR)
tok = AutoTokenizer.from_pretrained(ADAPTER_DIR)

model.push_to_hub(HF_REPO)
tok.push_to_hub(HF_REPO)
