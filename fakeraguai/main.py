# main.py  — CLI SOLO TRASLADO INTERNO
import argparse
import sys
from datetime import datetime, date
import random
import numpy as np
from faker import Faker

from fakeraguai.utils.db import engine, get_session
from fakeraguai.utils.logger import setup_logger
from fakeraguai.models import Base
from fakeraguai.loaders.maestros_loader import load_maestros

# from fakeraguai.loaders.pedidos_loader import load_pedidos  # ← solo referencia, pero NO se usa
from fakeraguai.loaders.movimientos_loader import (
    load_internal_transfers,  # ← ESTE es el loader de traslado interno
)

log = setup_logger()


# -------------------- Helpers --------------------
def _parse_iso_date(s: str) -> date:
    try:
        return datetime.fromisoformat(s).date()
    except Exception as e:
        raise argparse.ArgumentTypeError(f"Fecha inválida '{s}'. Usa YYYY-MM-DD") from e


def _set_seeds(seed: int | None):
    if seed is None:
        return
    random.seed(seed)
    np.random.seed(seed)
    Faker.seed(seed)
    log.info("Semillas RNG seteadas", extra={"seed": seed})


# -------------------- Commands --------------------
def reset_db():
    with engine.begin():
        Base.metadata.drop_all(bind=engine)
        log.info("Tablas eliminadas.")
        Base.metadata.create_all(bind=engine)
        log.info("Tablas creadas.")


def seed_internal_transfers(
    start: date,
    end: date,
    n_clientes: int,
    n_productos: int,
    pairs_per_day: int,
    validate: bool,
    seed: int | None,
    do_reset: bool,
):
    if end < start:
        raise ValueError("end < start: el rango de fechas es inválido.")
    _set_seeds(seed)

    if do_reset:
        reset_db()

    with get_session() as s:
        log.info(
            "Cargando MAESTROS…",
            extra={"clientes": n_clientes, "productos": n_productos},
        )
        m = load_maestros(
            s, n_clientes=n_clientes, n_productos=n_productos, autocommit=True
        )
        log.info("MAESTROS OK", extra=m)

        log.info(
            "Generando TRASLADO INTERNO SD3300 (salida/entrada 008) + PB7300…",
            extra={
                "start": str(start),
                "end": str(end),
                "pairs_per_day": pairs_per_day,
            },
        )
        t = load_internal_transfers(
            s,
            start=start,
            end=end,
            transfers_per_day=pairs_per_day,  # ← mapeo de tu CLI (--pairs-per-day)
            validate=validate,  # valida SD3 (parejas) + cruce SD3↔PB7
            autocommit=True,
            # link_xdesp_to_xnrotra=True,     # opcional: exige PB7_XDESP == D3_XNROTRA si lo activas en la validación
        )
        log.info("Traslado interno OK", extra=t)

    summary = {"maestros": m, "transfers": t}
    log.info("SEED TRASLADO INTERNO ✅", extra=summary)
    return summary


# -------------------- CLI --------------------
def main():
    parser = argparse.ArgumentParser(
        description="Fakeplant CLI - Solo Traslado Interno"
    )
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("reset", help="Drop & create all tables")

    seed_p = sub.add_parser(
        "internal", help="Genera únicamente traslado interno (SD3 008 + PB7)"
    )
    seed_p.add_argument(
        "--start",
        type=_parse_iso_date,
        default=date(2025, 1, 1),
        help="Fecha inicio (YYYY-MM-DD). Default 2025-01-01",
    )
    seed_p.add_argument(
        "--end",
        type=_parse_iso_date,
        default=date(2025, 1, 10),
        help="Fecha fin (YYYY-MM-DD). Default 2025-01-10",
    )
    seed_p.add_argument(
        "--clientes", type=int, default=30, help="N° clientes (default: 30)"
    )
    seed_p.add_argument(
        "--productos", type=int, default=40, help="N° productos (default: 40)"
    )
    seed_p.add_argument(
        "--pairs-per-day",
        type=int,
        default=8,
        help="Traslados por día (cada uno genera 2 líneas 008 y 1 PB7). Default: 8",
    )

    try:
        bool_action = argparse.BooleanOptionalAction  # py>=3.9
    except Exception:

        class bool_action(argparse.Action):
            def __call__(self, parser, namespace, values, option_string=None):
                setattr(namespace, self.dest, option_string.startswith("--validate"))

    seed_p.add_argument(
        "--validate",
        "--no-validate",
        dest="validate",
        action=bool_action,
        default=True,
        help="(Des)activa validaciones pandera para SD3 y cruce SD3↔PB7",
    )
    seed_p.add_argument(
        "--seed", type=int, default=None, help="Semilla RNG (reproducibilidad)"
    )
    seed_p.add_argument(
        "--reset", action="store_true", help="Resetear tablas antes de sembrar"
    )

    args = parser.parse_args()

    if args.cmd == "reset":
        reset_db()
    elif args.cmd == "internal":
        try:
            seed_internal_transfers(
                start=args.start,
                end=args.end,
                n_clientes=args.clientes,
                n_productos=args.productos,
                pairs_per_day=args.pairs_per_day,
                validate=args.validate,
                seed=args.seed,
                do_reset=args.reset,
            )
        except Exception as e:
            log.exception("Error en traslado interno", extra={"error": str(e)})
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
