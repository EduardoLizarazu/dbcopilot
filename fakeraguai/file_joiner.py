import os

# 📁 Define las carpetas y archivos que quieres incluir
ARCHIVOS = [
    "README.md",
    "main.py",
    "models/__init__.py",
    "models/base.py",
    "models/maestros.py",
    "models/movimientos.py",
    "models/pedidos.py",
    "schemas/__init__.py",
    "schemas/sc5_schema.py",
    "schemas/sc6_schema.py",
    "schemas/sd3_schema.py",
    "schemas/sd2_schema.py",
    "generators/__init__.py",
    "generators/maestros_gen.py",
    "generators/movimientos_gen.py",
    "generators/pedidos_gen.py",
    "loaders/__init__.py",
    "loaders/maestros_loader.py",
    "loaders/movimientos_loader.py",
    "loaders/pedidos_loader.py",
    "utils/__init__.py",
    "utils/logger.py",
    "utils/config.py",
    "utils/db.py",
]

# 📄 Archivo de salida
SALIDA = "demo_unificado.py"


def fusionar_archivos(lista_archivos, archivo_salida):
    with open(archivo_salida, "w", encoding="utf-8") as salida:
        for ruta in lista_archivos:
            if os.path.exists(ruta):
                salida.write(f"# ==== INICIO: {ruta} ====\n")
                with open(ruta, "r", encoding="utf-8") as f:
                    salida.write(f.read())
                salida.write(f"\n# ==== FIN: {ruta} ====\n\n")
            else:
                print(f"⚠️ Archivo no encontrado: {ruta}")

    print(f"✅ Archivo fusionado creado: {archivo_salida}")


if __name__ == "__main__":
    fusionar_archivos(ARCHIVOS, SALIDA)
