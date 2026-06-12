import torch
from peft import PeftModel
from .model import make_bnb_config, load_4bit_model
from .prompts import build_inference_prompt


def load_base_plus_adapter(model_id: str, adapter_dir: str):
    bnb = make_bnb_config()
    base = load_4bit_model(model_id, bnb)
    model = PeftModel.from_pretrained(base, adapter_dir)
    model.eval()
    return model


@torch.no_grad()
def generate_sql(model, tok, schema: str, question: str, max_new_tokens=120):
    prompt = build_inference_prompt(tok, schema, question)
    inputs = tok(prompt, return_tensors="pt").to(model.device)
    out = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        do_sample=False,
        temperature=0.0,
        eos_token_id=tok.eos_token_id,
    )
    return tok.decode(out[0], skip_special_tokens=True)
