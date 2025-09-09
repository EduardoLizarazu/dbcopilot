# Fakeplant (estructura modular)

**Nota:** no uses `faker/` como nombre de paquete; colisiona con `faker` de PyPI. Aquí usamos `fakeplant/`.

## Instalación

```bash
pip install -r fakeplant/requirements.txt
cp fakeplant/.env.example fakeplant/.env
# edita credenciales Oracle en fakeplant/.env
```

## Uso

```bash
# Reset + seed completo con defaults (rango 2025-01-01..2025-01-10)
python -m fakeraguai.main seed --reset

# Seed sin validaciones y con semilla fija
python -m fakeraguai.main seed --start 2025-02-01 --end 2025-02-07 --pedidos 120 \
  --pairs-per-day 10 --deliveries-per-day 30 --seed 42 --no-validate

# Solo reset
python -m fakeraguai.main reset
```
