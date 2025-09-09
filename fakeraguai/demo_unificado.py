# ==== INICIO: README.md ====
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

# ==== FIN: README.md ====

# ==== INICIO: main.py ====
# main.py
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
from fakeraguai.loaders.pedidos_loader import load_pedidos
from fakeraguai.loaders.movimientos_loader import load_transfers, load_pb7

log = setup_logger()


# -------------------- Helpers --------------------
def _parse_iso_date(s: str) -> date:
    try:
        return datetime.fromisoformat(s).date()
    except Exception as e:
        raise argparse.ArgumentTypeError(f"Fecha inválida '{s}'. Usa YYYY-MM-DD") from e


def _days_between(a: date, b: date) -> int:
    return (b - a).days


def _set_seeds(seed: int | None):
    if seed is None:
        return
    random.seed(seed)
    np.random.seed(seed)
    Faker.seed(seed)
    log.info(f"Semillas RNG seteadas", extra={"seed": seed})


# -------------------- Commands --------------------
def reset_db():
    with engine.begin():
        Base.metadata.drop_all(bind=engine)
        log.info("Tablas eliminadas.")
        Base.metadata.create_all(bind=engine)
        log.info("Tablas creadas.")


def seed_all(
    start: date,
    end: date,
    n_clientes: int,
    n_productos: int,
    n_pedidos: int,
    pairs_per_day: int,
    deliveries_per_day: int,
    allow_client_pickup_ratio: float,
    validate: bool,
    seed: int | None,
    do_reset: bool,
):
    if end < start:
        raise ValueError("end < start: el rango de fechas es inválido.")
    _set_seeds(seed)

    if do_reset:
        reset_db()

    # Orquestación en un único Session; cada loader maneja su transacción interna.
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
            "Cargando PEDIDOS…",
            extra={"start": str(start), "end": str(end), "n_pedidos": n_pedidos},
        )
        p = load_pedidos(
            s,
            start_date=start,
            days=_days_between(start, end),
            n_pedidos=n_pedidos,
            validate=validate,
            autocommit=True,
        )
        log.info("PEDIDOS OK", extra=p)

        log.info(
            "Generando TRANSFERS SD3300 (501/008)…",
            extra={"pairs_per_day": pairs_per_day},
        )
        t = load_transfers(
            s,
            start=start,
            end=end,
            pairs_per_day=pairs_per_day,
            validate=validate,
            autocommit=True,
        )
        log.info("TRANSFERS OK", extra=t)

        log.info(
            "Generando PB7 (+ Remitos SD2 '50')…",
            extra={
                "deliveries_per_day": deliveries_per_day,
                "pickup_ratio": allow_client_pickup_ratio,
            },
        )
        b = load_pb7(
            s,
            start=start,
            end=end,
            deliveries_per_day=deliveries_per_day,
            allow_client_pickup_ratio=allow_client_pickup_ratio,
            validate=validate,
            autocommit=True,
        )
        log.info("PB7 + SD2 OK", extra=b)

    # Resumen final
    summary = {"maestros": m, "pedidos": p, "transfers": t, "pb7+sd2": b}
    log.info("SEED COMPLETO ✅", extra=summary)
    return summary


# -------------------- CLI --------------------
def main():
    parser = argparse.ArgumentParser(description="Fakeplant CLI")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("reset", help="Drop & create all tables")

    seed_p = sub.add_parser(
        "seed", help="Carga demo (maestros, pedidos, traslados, PB7)"
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
        "--clientes", type=int, default=50, help="N° clientes (default: 50)"
    )
    seed_p.add_argument(
        "--productos", type=int, default=60, help="N° productos (default: 60)"
    )
    seed_p.add_argument(
        "--pedidos", type=int, default=80, help="N° pedidos (default: 80)"
    )

    seed_p.add_argument(
        "--pairs-per-day",
        type=int,
        default=8,
        help="Pares de transferencias 501/008 por día (default: 8)",
    )
    seed_p.add_argument(
        "--deliveries-per-day",
        type=int,
        default=20,
        help="Despachos PB7 por día (default: 20)",
    )
    seed_p.add_argument(
        "--pickup-ratio",
        type=float,
        default=0.15,
        help="Proporción de retiro por cliente (0..1). Default 0.15",
    )

    # Python 3.9+: BooleanOptionalAction
    try:
        bool_action = argparse.BooleanOptionalAction  # type: ignore[attr-defined]
    except Exception:
        # py<3.9 fallback
        class bool_action(argparse.Action):
            def __call__(self, parser, namespace, values, option_string=None):
                setattr(namespace, self.dest, option_string.startswith("--validate"))

    seed_p.add_argument(
        "--validate",
        "--no-validate",
        dest="validate",
        action=bool_action,
        default=True,
        help="(Des)activa validaciones pandera",
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
    elif args.cmd == "seed":
        try:
            seed_all(
                start=args.start,
                end=args.end,
                n_clientes=args.clientes,
                n_productos=args.productos,
                n_pedidos=args.pedidos,
                pairs_per_day=args.pairs_per_day,
                deliveries_per_day=args.deliveries_per_day,
                allow_client_pickup_ratio=args.pickup_ratio,
                validate=args.validate,
                seed=args.seed,
                do_reset=args.reset,
            )
        except Exception as e:
            log.exception("Error en seed_all", extra={"error": str(e)})
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

# ==== FIN: main.py ====

# ==== INICIO: models/__init__.py ====
from .base import Base
from .maestros import SZG300, SA1300, SB1300, SZH300
from .pedidos import SC5300, SC6300, SC900
from .movimientos import SD2300, SF2300, SD3300, PB7300

__all__ = [
    "Base",
    "SZG300",
    "SA1300",
    "SB1300",
    "SZH300",
    "SC5300",
    "SC6300",
    "SC900",
    "SD2300",
    "SF2300",
    "SD3300",
    "PB7300",
]

# ==== FIN: models/__init__.py ====

# ==== INICIO: models/base.py ====

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# ==== FIN: models/base.py ====

# ==== INICIO: models/maestros.py ====
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class SZG300(Base):  # Tipo de Cliente
    __tablename__ = "SZG300"
    # Código de tipo de cliente
    ZG_CODIGO: Mapped[str] = mapped_column(String(4), primary_key=True)
    # Descripcion tipo de cliente
    ZG_DESC: Mapped[str] = mapped_column(String(60), nullable=False)
    # Exclusion lógica
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")


class SA1300(Base):  # Maestro de Clientes
    __tablename__ = "SA1300"
    # Código do cliente
    A1_COD: Mapped[str] = mapped_column(String(10), primary_key=True)
    # Nome do cliente
    A1_NOME: Mapped[str] = mapped_column(String(120), nullable=False)
    # CI
    A1_CGC: Mapped[str] = mapped_column(String(20), nullable=True)
    # Tipo de cliente (código; relaciona con SZG300)
    A1_UTPCLI: Mapped[str] = mapped_column(
        String(4), ForeignKey("SZG300.ZG_CODIGO"), nullable=False
    )
    # Tienda/sucursal del cliente
    A1_LOJA: Mapped[str] = mapped_column(String(4), nullable=False)
    # Exclusion lógica
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")


class SB1300(Base):  # Maestro de Produtos
    __tablename__ = "SB1300"
    # Código do produto
    B1_COD: Mapped[str] = mapped_column(String(15), primary_key=True)
    # Descrição do produto
    B1_DESC: Mapped[str] = mapped_column(String(120), nullable=False)
    # Unidade de medida
    B1_UM: Mapped[str] = mapped_column(String(6), nullable=False)
    # Exclusion lógica
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")


class SZH300(Base):  # Movil de almacén (vendor en linea)
    __tablename__ = "SZH300"
    # Código do almacén
    ZH_ALM: Mapped[str] = mapped_column(String(6), primary_key=True)
    # Descripción de del movil (movil1, movil2, etc.)
    ZH_DESC: Mapped[str] = mapped_column(String(80), nullable=False)


class NNR300(Base):  # Mestro de almacenes
    __tablename__ = "NNR300"
    # Código do almacén
    NNR_COD: Mapped[str] = mapped_column(String(6), primary_key=True)
    # Descripción del almacén (ubicacion: central, tienda1, etc.)
    NNR_DESCRI: Mapped[str] = mapped_column(String(80), nullable=False)


# class CTT300(Base):
#     __tablename__ = "CTT300"
#     # Código de costo
#     CTT_CUSTO: Mapped[str] = mapped_column(String(12), primary_key=True)
#     CTT_DESC01: Mapped[str] = mapped_column(String(120), nullable=False)

# ==== FIN: models/maestros.py ====

# ==== INICIO: models/movimientos.py ====
from datetime import datetime
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Date,
    CheckConstraint,
    ForeignKey,
    UniqueConstraint,
    Sequence,
)
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

# d.d2_remito = sd2.d2_doc
# d.d2_serirem = sd2.d2_serie
# d2_sequen = pb7_sequen
# d2_filial = pb7_filial
# d2_pedido = pb7_pedido

sd2300_id_seq = Sequence("SD2300_SEQ", start=100, increment=1)


class SD2300(Base):
    __tablename__ = "SD2300"
    # Id único del detalle (PK)
    D2_ID: Mapped[int] = mapped_column(Integer, sd2300_id_seq, primary_key=True)
    # Tipo de documento (01 - factura, 50 - remito, etc.)
    D2_TIPODOC: Mapped[str] = mapped_column(String(2), nullable=False)
    # Número de documento (remito, factura, etc.) Relacion con SF2300.F2_DOC y SD3300.D3_DOC
    D2_DOC: Mapped[str] = mapped_column(String(12), nullable=False)
    # Serie del documento (remito, factura, etc.) Relacion con SF2300.F2_SERIE y d2_serirem
    D2_SERIE: Mapped[str] = mapped_column(String(6), nullable=False)

    # La misma que SC6300.C6_FILIAL y SC9300.C9_FILIAL y PB7300.PB7_FILIAL
    D2_FILIAL: Mapped[str] = mapped_column(String(4), nullable=True)

    # La misma que SA1300.A1_COD y SC6300.C6_CLI y SC9300.C9_CLIENTE
    D2_CLIENTE: Mapped[str] = mapped_column(String(10), nullable=True)
    D2_LOJA: Mapped[str] = mapped_column(String(4), nullable=True)
    # Codigo de producto (foreign key a SB1300.B1_COD)
    D2_COD: Mapped[str] = mapped_column(
        String(15), ForeignKey("SB1300.B1_COD"), nullable=False
    )
    # Unidad de medida
    D2_UM: Mapped[str] = mapped_column(String(6), nullable=False)
    # Codigo de local (foreign key a SZH300.ZH_ALM) y no es FK pero es lo mismo que NNR300.NNR_CODIGO
    D2_LOCAL: Mapped[str] = mapped_column(String(6), ForeignKey("SZH300.ZH_ALM"))
    # Cantidad de producto
    D2_QUANT: Mapped[float] = mapped_column(Numeric(15, 3), nullable=False)
    # Cantidad de producto en segunda unidad de medida
    D2_QTSEGUM: Mapped[float] = mapped_column(Numeric(15, 3), nullable=True)
    # Precio de venta unitario
    D2_PRCVEN: Mapped[float] = mapped_column(Numeric(15, 4), nullable=True)
    # Total del ítem (D2_QUANT * D2_PRCVEN)
    D2_TOTAL: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    # D2_CUSTO1: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True) # Contable en linea
    # Tipo de Entrada/Salida (TES) identifica el motivo del movimiento.
    D2_TES: Mapped[str] = mapped_column(String(5), nullable=True)
    # D2_CCUSTO: Mapped[str] = mapped_column(
    #     String(12), ForeignKey("CTT300.CTT_CUSTO"), nullable=True
    # )  # Costo del producto CTT300.CTT_CUSTO
    # Fecha de emisión del documento
    D2_EMISSAO: Mapped[datetime] = mapped_column(Date, nullable=False)
    # Fecha de digitación del documento
    D2_DTDIGIT: Mapped[datetime] = mapped_column(Date, nullable=False)

    # La misma que SC6300.C6_NUM y SC9300.C9_PEDIDO y PB7300.PB7_PEDIDO
    D2_PEDIDO: Mapped[str] = mapped_column(String(10), nullable=True)
    # La misma que SC9300.C9_SEQUEN y PB7300.PB7_SEQUEN secuencia de pedido
    D2_SEQUEN: Mapped[int] = mapped_column(Integer, nullable=True)
    # La misma que SC6300.C6_ITEM y SC9300.C9_ITEM y PB7300.PB7_ITEMPV item de pedido
    D2_ITEMPV: Mapped[int] = mapped_column(Integer, nullable=True)

    # Número de remito (se puede duplicar, no es FK, pero es lo mismo que SD2300.D2_DOC)
    D2_REMITO: Mapped[str] = mapped_column(String(12), nullable=True)
    # Serie de remito (se puede duplicar, no es FK, pero es lo mismo que SD2300.D2_SERIE y SD3300.D3_DOC si es factura)
    D2_SERIREM: Mapped[str] = mapped_column(String(6), nullable=True)
    # Secuencia de remito (se puede duplicar, no es FK, pero es lo mismo que PB7300.PB7_SEQUEN)
    D2_ITEMREM: Mapped[int] = mapped_column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("D2_TIPODOC in ('01','50')", name="CK_SD2_TIPODOC"),
    )


# sd21.d2_doc = f2_doc
# sd21.d2_serie = f2_serie
# sd21.d2_dtdigit = f2_dtdigit
# sd21.d2_cliente = f2_cliente
# sd21.d2_loja = f2_loja

sc2300_id_seq = Sequence("SF2300_SEQ", start=100, increment=1)


class SF2300(Base):
    __tablename__ = "SF2300"
    # Id único del registro (PK)
    F2_ID: Mapped[int] = mapped_column(Integer, sc2300_id_seq, primary_key=True)
    # Número de documento no es FK pero es lo mismo que SD2300.D2_DOC
    F2_DOC: Mapped[str] = mapped_column(String(12), nullable=False)
    # Serie del documento no es FK pero es lo mismo que SD2300.D2_SERIE
    F2_SERIE: Mapped[str] = mapped_column(String(6), nullable=False)
    # Fecha de emisión del documento
    F2_DTDIGIT: Mapped[datetime] = mapped_column(Date, nullable=False)
    # Código de cliente no es FK pero es lo mismo que SA1300.A1_COD y SD2300.D2_CLIENTE
    F2_CLIENTE: Mapped[str] = mapped_column(String(10), nullable=False)
    # Código de tienda no es FK pero es lo mismo que SA1300.A1_LOJA y SD2300.D2_LOJA
    F2_LOJA: Mapped[str] = mapped_column(String(4), nullable=False)
    # Tipo de moneda (1 - Bs. 2 - USD)
    F2_MOEDA: Mapped[str] = mapped_column(String(3), nullable=False)
    # Codigo de autorizacion de la factura
    F2_NUMAUT: Mapped[str] = mapped_column(String(30), nullable=True)
    # Código de control (fiscal/tributario, según configuración)
    F2_CODCTR: Mapped[str] = mapped_column(String(30), nullable=True)
    # CI/NIT alterno a facturar (si no se usa el del cliente)
    F2_UNIT: Mapped[str] = mapped_column(String(20), nullable=True)
    # Nombre alterno a facturar (si no se usa el del cliente)
    F2_UNOME: Mapped[str] = mapped_column(String(120), nullable=True)

    __table_args__ = (UniqueConstraint("F2_DOC", "F2_SERIE", name="UQ_SF2_DOC_SERIE"),)


sd3300_id_seq = Sequence("SD3300_SEQ", start=100, increment=1)


class SD3300(Base):
    __tablename__ = "SD3300"
    # Codigo unico del detalle (PK)
    D3_ID: Mapped[int] = mapped_column(Integer, sd3300_id_seq, primary_key=True)
    # Codigo de filial de sistema (se puede duplicar, no es FK, pero es lo mismo que SD2300.D2_FILIAL)
    D3_FILIAL: Mapped[str] = mapped_column(String(4), nullable=True)
    # Codigo remito (se puede duplicar, no es FK, pero es lo mismo que SD2300.D2_DOC)
    D3_DOC: Mapped[str] = mapped_column(String(12), nullable=True)
    # Nº/serie de transferencia (traslado)
    D3_XNROTRA: Mapped[str] = mapped_column(String(14), nullable=True)
    # Código de producto (foreign key a SB1300.B1_COD)
    D3_COD: Mapped[str] = mapped_column(
        String(15), ForeignKey("SB1300.B1_COD"), nullable=False
    )
    # Unidad de medida
    D3_UM: Mapped[str] = mapped_column(String(6), nullable=False)
    # Cantidad de producto
    D3_QUANT: Mapped[float] = mapped_column(Numeric(15, 3), nullable=False)
    # Cantidad de producto en segunda unidad de medida (QQ/L)
    D3_QTSEGUM: Mapped[float] = mapped_column(Numeric(15, 3), nullable=True)
    # D3_CUSTO1: Mapped[float] = mapped_column(Numeric(15, 4), nullable=True)
    D3_LOCAL: Mapped[str] = mapped_column(String(6), ForeignKey("SZH300.ZH_ALM"))
    # Costo en Bs.
    D3_CUSTO1: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    # Fecha de emisión del documento
    D3_EMISSAO: Mapped[datetime] = mapped_column(Date, nullable=False)
    # TM ingreso/salida
    D3_TM: Mapped[str] = mapped_column(String(3), nullable=False)
    # Origen del movimiento (se puede duplicar, no es FK, pero es lo mismo que )
    # D3_XORIGEN: Mapped[str] = mapped_column(String(10), nullable=True)
    # Usuario que digitó el registro
    D3_USUARIO: Mapped[str] = mapped_column(String(30), nullable=True)
    # Indicador de estorno (S/N)
    D3_ESTORNO: Mapped[str] = mapped_column(String(1), nullable=True, default="N")
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")

    __table_args__ = (
        CheckConstraint("D3_TM in ('001','008','501')", name="CK_SD3_TM"),
    )


# PB7_FILIAL = C9_FILIAL
# PB7_PEDIDO = C9_PEDIDO
# PB7_SEQUEN = C9_SEQUEN
# PB7_ITEMPV = C9_ITEM
# PB7_PRODUT = C9_PRODUTO


pb7300_id_seq = Sequence("PB7300_SEQ", start=100, increment=1)


class PB7300(Base):  # (Datos Chofer / Balanza / Despacho (ingreso/salida en bascula))
    __tablename__ = "PB7300"
    # Identificador único del registro
    PB7_ID: Mapped[int] = mapped_column(Integer, pb7300_id_seq, primary_key=True)
    # Codigo de filial (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_FILIAL)
    PB7_FILIAL: Mapped[str] = mapped_column(String(4), nullable=False)
    # Fecha de registro en bascula
    PB7_DATA: Mapped[datetime] = mapped_column(Date, nullable=False)
    # Fecha de salida en bascula
    PB7_DSAIDA: Mapped[datetime] = mapped_column(Date, nullable=True)
    # Código de pedido (se puede duplicar, no es FK, pero es lo mismo que SC9300.C9_PEDIDO)
    PB7_PEDIDO: Mapped[str] = mapped_column(String(10), nullable=True)
    # Secuencia de pedido (se puede duplicar, no es FK, pero es lo mismo que SC9300.C9_SEQUEN)
    PB7_SEQUEN: Mapped[int] = mapped_column(Integer, nullable=True)
    # Item de pedido (se puede duplicar, no es FK, pero es lo mismo que SC9300.C9_ITEM)
    PB7_ITEMPV: Mapped[int] = mapped_column(Integer, nullable=True)
    # Código de producto (se puede duplicar, no es FK, pero es lo mismo que SC9300.C9_PRODUTO)
    PB7_PRODUT: Mapped[str] = mapped_column(
        String(15), ForeignKey("SB1300.B1_COD"), nullable=False
    )
    # Cantidad pesada
    PB7_QTDE: Mapped[float] = mapped_column(Numeric(15, 3), nullable=False)
    # Status del registro en bascula: E - Entrada, S - Salida, A - Anulado
    PB7_STATUS: Mapped[str] = mapped_column(String(1), nullable=False)
    # Peso bruto
    PB7_PBRUTO: Mapped[float] = mapped_column(Numeric(15, 3), nullable=True)
    # Peso tara
    PB7_PTARA: Mapped[float] = mapped_column(Numeric(15, 3), nullable=True)
    # Placa del chofer
    PB7_PLACA: Mapped[str] = mapped_column(String(12), nullable=True)
    # Nombre del chofer
    PB7_CHOFER: Mapped[str] = mapped_column(String(80), nullable=True)
    # Telefono del chofer
    PB7_TELEFO: Mapped[str] = mapped_column(String(20), nullable=True)
    # Documento del chofer (CI)
    PB7_DOCUME: Mapped[str] = mapped_column(String(20), nullable=True)
    # Numero de despacho
    PB7_XDESP: Mapped[str] = mapped_column(String(20), nullable=True)
    # Local de entrada (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_LOCAL)
    PB7_LOCENT: Mapped[str] = mapped_column(String(10), nullable=True)
    # year de zafra
    PB7_XZAFRA: Mapped[str] = mapped_column(String(10), nullable=True)
    # Observaciones
    PB7_XOBS: Mapped[str] = mapped_column(String(100), nullable=True)
    # Observaciones adicionales
    PB7_OBSERV: Mapped[str] = mapped_column(String(100), nullable=True)

    __table_args__ = (
        CheckConstraint("PB7_STATUS in ('E','S','F')", name="CK_PB7_STATUS"),
    )

# ==== FIN: models/movimientos.py ====

# ==== INICIO: models/pedidos.py ====
from datetime import datetime
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Date,
    CheckConstraint,
    ForeignKey,
    UniqueConstraint,
    Sequence,
)
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

# C5_CLIENTE = A1_COD
# C5_LOJACLI = A1_LOJA

sc5300_id_seq = Sequence("SC5300_SEQ", start=100, increment=1)


class SC5300(Base):  # Cabecera de Pedidos
    __tablename__ = "SC5300"
    # Primary Key Codigo de Pedido
    C5_NUM: Mapped[str] = mapped_column(String(10), primary_key=True)
    # Foreign Key Codigo de Cliente
    C5_CLIENTE: Mapped[str] = mapped_column(
        String(10), ForeignKey("SA1300.A1_COD"), nullable=False
    )
    # Fecha de Emision dell pedido
    C5_EMISSAO: Mapped[datetime] = mapped_column(Date, nullable=False)
    # Tipo de pedido (1 - venta local, 2 - venta exp. FCA.)
    C5_XTIPO: Mapped[str] = mapped_column(String(1), nullable=False)
    # Moneda del pedido (1 bs, 2 usd)
    C5_MOEDA: Mapped[str] = mapped_column(String(3), nullable=False)
    # Codigo de tienda del cliente (foreign key a SA1300.A1_LOJA)
    C5_LOJACLI: Mapped[str] = mapped_column(
        String(4), ForeignKey("SA1300.A1_LOJA"), nullable=True
    )
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")

    __table_args__ = (
        CheckConstraint(
            "C5_XTIPO in ('1','2','3','4','5','6','7','8')", name="CK_SC5_XTIPO"
        ),
    )


# C6_CLI = A1_COD
# C6_NUM = C5_NUM
# C6_PRODUTO = B1_COD
# C6_CLI = A1_COD
# C6_LOJA = A1_LOJA
# C6_FILIAL = C5_FILIAL

sc6300_id_seq = Sequence("SC6300_SEQ", start=100, increment=1)


class SC6300(Base):  # Detalle de Pedidos
    __tablename__ = "SC6300"
    # Id único del detalle (PK)
    C6_ID: Mapped[int] = mapped_column(Integer, sc6300_id_seq, primary_key=True)
    # Foreign Key Codigo de Pedido
    C6_NUM: Mapped[str] = mapped_column(
        String(10), ForeignKey("SC5300.C5_NUM"), nullable=False
    )
    # Número de ítem dentro del pedido
    C6_ITEM: Mapped[int] = mapped_column(Integer, nullable=False)
    # Foreign Key Código de Producto
    C6_PRODUTO: Mapped[str] = mapped_column(
        String(15), ForeignKey("SB1300.B1_COD"), nullable=False
    )
    # Descripción del producto (se puede duplicar, no es FK, pero es lo mismo que SB1300.B1_DESC)
    C6_DESCRI: Mapped[str] = mapped_column(String(120), nullable=True)
    # Unidad de medida (GL - LL - PQ)
    C6_UM: Mapped[str] = mapped_column(String(6), nullable=False)
    # Cantidad de producto vendida
    C6_QTDVEN: Mapped[float] = mapped_column(Numeric(15, 3), nullable=False)
    # Cantidad de producto en tránsito
    C6_QTDENT: Mapped[float] = mapped_column(Numeric(15, 3), nullable=True, default=0)
    # Precio de venta unitario
    C6_PRCVEN: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    # Total del ítem (C6_QTDVEN * C6_PRCVEN)
    C6_VALOR: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    # TES (Tipo de Entrada/Salida) identifica el motivo del movimiento.
    C6_TES: Mapped[str] = mapped_column(String(5), nullable=True)
    # Código de almacén de origen (se puede duplicar, no es FK, pero es lo mismo que NNR300.NNR_CODIGO)
    C6_LOCAL: Mapped[str] = mapped_column(String(6), ForeignKey("NNR300.NNR_CODIGO"))
    # Código de almacén de destino (se puede duplicar, no es FK, pero es lo mismo que NNR300.NNR_CODIGO)
    C6_LOCDEST: Mapped[str] = mapped_column(String(6), ForeignKey("NNR300.NNR_CODIGO"))
    # Código de cliente (se puede duplicar, no es FK, pero es lo mismo que SA1300.A1_COD)
    C6_CLI: Mapped[str] = mapped_column(String(10), nullable=False)
    # Código de tienda (se puede duplicar, no es FK, pero es lo mismo que SA1300.A1_LOJA)
    C6_LOJA: Mapped[str] = mapped_column(String(4), nullable=False)
    # Código de filial
    C6_FILIAL: Mapped[str] = mapped_column(String(4), nullable=True)
    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")

    __table_args__ = (UniqueConstraint("C6_NUM", "C6_ITEM", name="UQ_SC6_NUM_ITEM"),)


# C9_PEDIDO = C5_NUM
# C9_PRODUTO = C6_PRODUTO
# C9_ITEM = C6_ITEM
# C9_CLIENTE = C6_CLI
# C9_LOCAL = C6_LOCAL
# C9_FILIAL = C6_FILIAL

sc9300_id_seq = Sequence("SC900_SEQ", start=100, increment=1)


class SC900(Base):  # Aprobacion de pedidos
    __tablename__ = "SC900"
    # Código de pedido
    C9_ID: Mapped[int] = mapped_column(Integer, sc9300_id_seq, primary_key=True)
    # Número de pedido (se puede duplicar, no es FK, pero es lo mismo que SC5300.C5_NUM)
    C9_PEDIDO: Mapped[str] = mapped_column(String(10), nullable=False)
    # Codigo de producto (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_PRODUTO)
    C9_PRODUTO: Mapped[str] = mapped_column(String(15), nullable=False)
    # Item de pedido aprobado (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_ITEM)
    C9_ITEM: Mapped[int] = mapped_column(Integer, nullable=False)
    # Codigo de cliente (se puede duplicar, no es FK, pero es lo mismo que SA1300.A1_COD y SC6300.C6_CLI)
    C9_CLIENTE: Mapped[str] = mapped_column(String(10), nullable=False)
    # Codigo local del deposito (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_LOCAL)
    C9_LOCAL: Mapped[str] = mapped_column(String(6), nullable=False)
    # Secuencia de aprobación (1, 2, 3, etc.)
    C9_SEQUEN: Mapped[int] = mapped_column(Integer, nullable=False)
    # Status de la aprobación (A - Aprobado, B - Bloqueado, P - Pendiente)
    C9_STATUS: Mapped[str] = mapped_column(String(1), nullable=False)
    # Cantidad aprobada
    C9_QTDAPRO: Mapped[float] = mapped_column(Numeric(15, 3), nullable=False)
    # Fecha de aprobación
    C9_DATALIB: Mapped[datetime] = mapped_column(Date, nullable=True)
    # Código de filial (se puede duplicar, no es FK, pero es lo mismo que SC6300.C6_FILIAL)
    C9_FILIAL: Mapped[str] = mapped_column(String(4), nullable=True)

    D_E_L_E_T_: Mapped[str] = mapped_column(String(1), nullable=False, default=" ")

    __table_args__ = (
        CheckConstraint("C9_STATUS in ('A','B','P')", name="CK_SC9_STATUS"),
        UniqueConstraint("C9_PEDIDO", "C9_ITEM", name="UQ_SC9_PEDIDO_ITEM"),
    )

# ==== FIN: models/pedidos.py ====

# ==== INICIO: schemas/__init__.py ====
# package

# ==== FIN: schemas/__init__.py ====

# ==== INICIO: schemas/sc5_schema.py ====
# sc5_schema.py
import pandera as pa
from pandera import Column, Check
from datetime import datetime, date
from typing import Iterable, Optional


def _is_yyyymmdd(s: pa.typing.Series[str]) -> bool:
    try:
        s.astype(str).str.fullmatch(r"\d{8}").all()
    except Exception:
        return False
    # si querés, validá rango con variables externas (min_date/max_date) en el factory
    return True


def make_SC5_schema(
    valid_clientes: Optional[Iterable[str]] = None,
    valid_lojas: Optional[Iterable[str]] = None,
    min_date: Optional[date] = None,
    max_date: Optional[date] = None,
) -> pa.DataFrameSchema:

    checks_df = []

    # Fecha en rango (si se proveen límites) parseando YYYYMMDD
    if min_date and max_date:

        def _fecha_en_rango(df):
            def ok(v: str) -> bool:
                d = datetime.strptime(str(v), "%Y%m%d").date()
                return min_date <= d <= max_date

            return df["C5_EMISSAO"].astype(str).map(ok).all()

        checks_df.append(Check(_fecha_en_rango, error="C5_EMISSAO fuera de rango."))

    cols = {
        "C5_NUM": Column(str, Check.str_length(1, 12)),  # un poco más holgado
        "C5_CLIENTE": Column(
            str, Check.isin(list(valid_clientes)) if valid_clientes else None
        ),
        "C5_LOJACLI": Column(
            str, Check.isin(list(valid_lojas)) if valid_lojas else None
        ),
        "C5_EMISSAO": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "C5_XTIPO": Column(str, Check.isin(list("158"))),  # ajustá catálogo real
        "C5_MOEDA": Column(str, Check.isin(["1", "2", "USD", "BOB"])),
        "D_E_L_E_T_": Column(str, Check.isin([" ", "*"]), nullable=True),
    }

    return pa.DataFrameSchema(cols, checks=checks_df, strict=True, coerce=True)

# ==== FIN: schemas/sc5_schema.py ====

# ==== INICIO: schemas/sc6_schema.py ====
# sc6_schema.py
import math
import pandera as pa
from pandera import Column, Check
from typing import Iterable, Optional

EXCLUDED_DEST = {"14", "19", "20"}


def make_SC6_schema(
    valid_pedidos: Optional[Iterable[str]] = None,
    valid_clientes: Optional[Iterable[str]] = None,
    valid_lojas: Optional[Iterable[str]] = None,
    valid_productos: Optional[Iterable[str]] = None,
    valid_ums: Optional[Iterable[str]] = None,
    valid_almacenes: Optional[Iterable[str]] = None,
    enforce_dest_rules: bool = True,  # si querés aplicar reglas de destino
) -> pa.DataFrameSchema:

    def _unicidad_items(df):
        return ~df.duplicated(subset=["C6_NUM", "C6_ITEM"]).any()

    def _valor_coherente(df):
        # tolerancia: 1% del valor o 0.5 absoluto (lo que sea mayor)
        tol = (df["C6_QTDVEN"] * df["C6_PRCVEN"]).abs() * 0.01
        tol = tol.clip(lower=0.5)
        return (
            (df["C6_VALOR"] - (df["C6_QTDVEN"] * df["C6_PRCVEN"])).abs().le(tol).all()
        )

    def _qtdent_no_excede(df):
        if "C6_QTDENT" not in df.columns:
            return True
        return (df["C6_QTDENT"].fillna(0) <= df["C6_QTDVEN"]).all()

    def _locales_validos(df):
        # LOCAL y LOCDEST existen y son distintos (si ambos no nulos)
        if "C6_LOCAL" not in df.columns or "C6_LOCDEST" not in df.columns:
            return True
        ok_distintos = (df["C6_LOCAL"].isna() | df["C6_LOCDEST"].isna()) | (
            df["C6_LOCAL"] != df["C6_LOCDEST"]
        )
        if valid_almacenes:
            ok_catalogo = df["C6_LOCAL"].isin(valid_almacenes) & df["C6_LOCDEST"].isin(
                valid_almacenes
            )
        else:
            ok_catalogo = True
        ok_excl = True
        if enforce_dest_rules:
            ok_excl = ~df["C6_LOCDEST"].isin(EXCLUDED_DEST) | df["C6_LOCDEST"].isna()
        return (ok_distintos & ok_catalogo & ok_excl).all()

    checks_df = [
        Check(_unicidad_items, error="(C6_NUM, C6_ITEM) repetido."),
        Check(
            _valor_coherente,
            error="C6_VALOR no coincide con cantidad*precio (tolerancia 1%).",
        ),
        Check(_qtdent_no_excede, error="C6_QTDENT excede C6_QTDVEN."),
        Check(
            _locales_validos,
            error="Locales inválidos (igual origen/destino, fuera de catálogo o excluido).",
        ),
    ]

    cols = {
        "C6_NUM": Column(
            str, Check.isin(list(valid_pedidos)) if valid_pedidos else None
        ),
        "C6_ITEM": Column(int, Check.ge(1)),
        "C6_PRODUTO": Column(
            str, Check.isin(list(valid_productos)) if valid_productos else None
        ),
        "C6_UM": Column(str, Check.isin(list(valid_ums)) if valid_ums else None),
        "C6_QTDVEN": Column(float, Check.gt(0)),
        "C6_PRCVEN": Column(float, Check.ge(0)),
        "C6_VALOR": Column(float, Check.ge(0)),
        "C6_LOCAL": Column(str, nullable=True),
        "C6_LOCDEST": Column(str, nullable=True),
        "C6_CLI": Column(
            str, Check.isin(list(valid_clientes)) if valid_clientes else None
        ),
        "C6_LOJA": Column(str, Check.isin(list(valid_lojas)) if valid_lojas else None),
        # "C6_QTDENT": Column(float, Check.ge(0), nullable=True),  # si existe, podés declararla
        # "C6_FILIAL": Column(str),                                 # si querés validar patrón/longitud
        # "D_E_L_E_T_": Column(str, Check.isin([" ", "*"]), nullable=True),
    }

    return pa.DataFrameSchema(cols, checks=checks_df, strict=True, coerce=True)

# ==== FIN: schemas/sc6_schema.py ====

# ==== INICIO: schemas/sd3_schema.py ====
# sd3_schema.py
import pandera as pa
from pandera import Column, Check
from typing import Iterable, Optional

EXCLUDED_DEST = {"14", "19", "20"}


def make_SD3_schema(
    valid_almacenes: Optional[Iterable[str]] = None,
    only_transfer_tms: bool = True,  # limitar a 501 y 008 si querés
):
    tms = ["501", "008"] if only_transfer_tms else ["001", "501", "008"]

    def _yyyymmdd_col_ok(s):  # si usás string
        return s.astype(str).str.fullmatch(r"\d{8}").all()

    def _parejas_transfer(df):
        # Por XNROTRA: debe haber exactamente un 501 y un 008
        g = df.groupby("D3_XNROTRA")["D3_TM"].value_counts().unstack(fill_value=0)
        if not set(["501", "008"]).issubset(g.columns):
            return False
        cond = (g["501"] == 1) & (g["008"] == 1)
        if not cond.all():
            return False

        # Consistencia de COD/UM/QUANT y XORIGEN en 008 = DOC del 501
        ok_all = True
        for key, grp in df.groupby("D3_XNROTRA"):
            try:
                row501 = grp.loc[grp["D3_TM"] == "501"].iloc[0]
                row008 = grp.loc[grp["D3_TM"] == "008"].iloc[0]
            except Exception:
                return False
            same_cod = row501["D3_COD"] == row008["D3_COD"]
            same_um = row501["D3_UM"] == row008["D3_UM"]
            same_qty = float(row501["D3_QUANT"]) == float(row008["D3_QUANT"])
            xorigen_ok = str(row008.get("D3_XORIGEN", "")) == str(
                row501.get("D3_DOC", "")
            )
            ok_all = ok_all and same_cod and same_um and same_qty and xorigen_ok
        return bool(ok_all)

    def _destino_no_excluido(df):
        # Filtrar 008 y validar destino
        mask_008 = df["D3_TM"] == "008"
        if valid_almacenes:
            in_catalog = df.loc[mask_008, "D3_LOCAL"].isin(valid_almacenes)
        else:
            in_catalog = True
        not_excl = ~df.loc[mask_008, "D3_LOCAL"].isin(EXCLUDED_DEST)
        return (in_catalog & not_excl).all()

    checks_df = [
        Check(
            _parejas_transfer,
            error="Cada D3_XNROTRA debe tener pareja 501/008 consistente y XORIGEN correcto.",
        ),
        Check(
            _destino_no_excluido,
            error="008 con local destino excluido o fuera de catálogo.",
        ),
    ]

    cols = {
        "D3_DOC": Column(str),  # generamos explícitamente DOCs
        "D3_XNROTRA": Column(str, Check.str_length(3, 32)),
        "D3_XORIGEN": Column(str, nullable=True),  # 008 apunta al DOC 501
        "D3_COD": Column(str),
        "D3_UM": Column(str),
        "D3_QUANT": Column(float, Check.gt(0)),
        "D3_QTSEGUM": Column(float, nullable=True),
        "D3_EMISSAO": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "D3_TM": Column(str, Check.isin(tms)),
        "D3_LOCAL": Column(str),
        "D3_FILIAL": Column(str, nullable=True),
        # "D3_ESTORNO": Column(str, Check.isin(["N","S"]), nullable=True),
        # "D_E_L_E_T_": Column(str, Check.isin([" ", "*"]), nullable=True),
    }

    # opcional: validar que locales existan en catálogo para todas las filas
    if valid_almacenes:
        cols["D3_LOCAL"] = Column(str, Check.isin(list(valid_almacenes)))

    return pa.DataFrameSchema(cols, checks=checks_df, strict=True, coerce=True)

# ==== FIN: schemas/sd3_schema.py ====

# ==== INICIO: schemas/sd2_schema.py ====
# sd2_schema.py
import pandera as pa
from pandera import Column, Check
from datetime import datetime, date
from typing import Iterable, Mapping, Optional, Tuple, Set


def _is_yyyymmdd(s) -> bool:
    try:
        ok = s.astype(str).str.fullmatch(r"\d{8}$").all()
        return bool(ok)
    except Exception:
        return False


def make_SD2_schema(
    # Catálogos (opcionalmente pásalos; si son None, no se valida ese catálogo)
    valid_productos: Optional[Iterable[str]] = None,
    product_um_map: Optional[Mapping[str, str]] = None,  # B1_COD -> B1_UM
    valid_ums: Optional[Iterable[str]] = None,
    valid_clientes: Optional[Iterable[str]] = None,
    valid_lojas: Optional[Iterable[str]] = None,
    valid_filiais: Optional[Iterable[str]] = None,
    valid_almacenes: Optional[Iterable[str]] = None,
    valid_tes: Optional[Iterable[str]] = None,  # ej. {"501","510","540"}
    # FKs
    sc6_keys: Optional[
        Set[Tuple[str, str, int]]
    ] = None,  # (C6_NUM, C6_FILIAL, C6_ITEM)
    sc6_prod_map: Optional[
        Mapping[Tuple[str, str, int], str]
    ] = None,  # (num, filial, item) -> C6_PRODUTO
    sc6_um_map: Optional[
        Mapping[Tuple[str, str, int], str]
    ] = None,  # (num, filial, item) -> C6_UM
    pb7_keys: Optional[
        Set[Tuple[str, str, int, int]]
    ] = None,  # (PEDIDO, FILIAL, SEQUEN, ITEMPV)
    # Reglas adicionales
    min_date: Optional[date] = None,
    max_date: Optional[date] = None,
    enforce_not_deleted: bool = False,  # exigir D_E_L_E_T_ = ' '
) -> pa.DataFrameSchema:

    # ---- Checks a nivel DataFrame ----
    def _unique_pk(df):
        # PK lógica: (D2_DOC, D2_SERIE, D2_FILIAL, D2_SEQUEN)
        return ~df.duplicated(
            subset=["D2_DOC", "D2_SERIE", "D2_FILIAL", "D2_SEQUEN"]
        ).any()

    def _total_consistente(df):
        # tolerancia = max(0.5, 1% del esperado)
        esperado = (df["D2_QUANT"].fillna(0) * df["D2_PRCVEN"].fillna(0)).abs()
        tol = esperado * 0.01
        tol = tol.where(tol > 0.5, 0.5)
        dif = (df["D2_TOTAL"].fillna(0) - esperado).abs()
        return dif.le(tol).all()

    def _fechas_validas(df):
        # formato
        if not _is_yyyymmdd(df["D2_EMISSAO"]) or not _is_yyyymmdd(df["D2_DTDIGIT"]):
            return False
        # rango si se provee
        if min_date and max_date:

            def in_range(s):
                d = datetime.strptime(str(s), "%Y%m%d").date()
                return min_date <= d <= max_date

            ok_emis = df["D2_EMISSAO"].astype(str).map(in_range).all()
            ok_dig = df["D2_DTDIGIT"].astype(str).map(in_range).all()
            if not (ok_emis and ok_dig):
                return False
        # digitación >= emisión (común en ERPs)
        emis = (
            df["D2_EMISSAO"].astype(str).map(lambda x: datetime.strptime(x, "%Y%m%d"))
        )
        digi = (
            df["D2_DTDIGIT"].astype(str).map(lambda x: datetime.strptime(x, "%Y%m%d"))
        )
        return (digi >= emis).all()

    def _fk_sc6(df):
        if sc6_keys is None:
            return True
        # (PEDIDO, FILIAL, ITEMPV) debe existir en SC6
        keys = list(
            zip(
                df["D2_PEDIDO"].astype(str),
                df["D2_FILIAL"].astype(str),
                df["D2_ITEMPV"].astype(int),
            )
        )
        base_ok = all(tuple(k) in sc6_keys for k in keys)
        if not base_ok:
            return False
        # producto/UM coherentes con SC6 si nos pasaron mapas
        if sc6_prod_map is not None:
            for _, r in df.iterrows():
                key = (str(r["D2_PEDIDO"]), str(r["D2_FILIAL"]), int(r["D2_ITEMPV"]))
                prod_sc6 = sc6_prod_map.get(key)
                if prod_sc6 and str(prod_sc6) != str(r["D2_COD"]):
                    return False
        if sc6_um_map is not None:
            for _, r in df.iterrows():
                key = (str(r["D2_PEDIDO"]), str(r["D2_FILIAL"]), int(r["D2_ITEMPV"]))
                um_sc6 = sc6_um_map.get(key)
                if um_sc6 and str(um_sc6) != str(r["D2_UM"]):
                    return False
        return True

    def _fk_pb7(df):
        if pb7_keys is None:
            return True
        # (PEDIDO, FILIAL, SEQUEN, ITEMPV) debe existir en PB7
        keys = list(
            zip(
                df["D2_PEDIDO"].astype(str),
                df["D2_FILIAL"].astype(str),
                df["D2_SEQUEN"].astype(int),
                df["D2_ITEMPV"].astype(int),
            )
        )
        return all(tuple(k) in pb7_keys for k in keys)

    def _um_vs_producto(df):
        if product_um_map is None:
            return True
        for _, r in df.iterrows():
            um_ref = product_um_map.get(str(r["D2_COD"]))
            if um_ref and str(um_ref) != str(r["D2_UM"]):
                return False
        return True

    def _remito_ok(df):
        # remito/serie obligatorios y no vacíos
        return (
            df["D2_REMITO"].astype(str).str.len().gt(0).all()
            and df["D2_SERIREM"].astype(str).str.len().gt(0).all()
        )

    def _no_deleted(df):
        if "D_E_L_E_T_" not in df.columns or not enforce_not_deleted:
            return True
        return (df["D_E_L_E_T_"].fillna(" ") == " ").all()

    checks_df = [
        Check(
            _unique_pk,
            error="PK lógica duplicada: (D2_DOC, D2_SERIE, D2_FILIAL, D2_SEQUEN).",
        ),
        Check(
            _total_consistente,
            error="D2_TOTAL no coincide con D2_QUANT*D2_PRCVEN (±1% o 0.5).",
        ),
        Check(
            _fechas_validas,
            error="Fechas inválidas (formato YYYYMMDD, rango o D2_DTDIGIT < D2_EMISSAO).",
        ),
        Check(
            _fk_sc6,
            error="No existe correspondencia con SC6 (o producto/UM no coinciden).",
        ),
        Check(
            _fk_pb7,
            error="No existe correspondencia con PB7 (PEDIDO,FILIAL,SEQUEN,ITEMPV).",
        ),
        Check(_um_vs_producto, error="UM no coincide con la UM del producto (SB1)."),
        Check(_remito_ok, error="D2_REMITO / D2_SERIREM vacíos."),
        Check(_no_deleted, error="Registros marcados como eliminados."),
    ]

    cols = {
        "D2_DOC": Column(str),
        "D2_SERIE": Column(str),
        "D2_FILIAL": Column(
            str, Check.isin(list(valid_filiais)) if valid_filiais else None
        ),
        "D2_PEDIDO": Column(str),
        "D2_SEQUEN": Column(int, Check.ge(1)),
        "D2_ITEMPV": Column(int, Check.ge(1)),
        "D2_COD": Column(
            str, Check.isin(list(valid_productos)) if valid_productos else None
        ),
        "D2_QUANT": Column(float, Check.gt(0)),
        "D2_QTSEGUM": Column(float, Check.ge(0), nullable=True),
        "D2_UM": Column(str, Check.isin(list(valid_ums)) if valid_ums else None),
        "D2_EMISSAO": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "D2_LOCAL": Column(
            str, Check.isin(list(valid_almacenes)) if valid_almacenes else None
        ),
        "D2_TIPODOC": Column(str, Check.eq("50")),  # Remito
        "D2_TES": Column(str, Check.isin(list(valid_tes)) if valid_tes else None),
        "D2_PRCVEN": Column(float, Check.ge(0)),
        "D2_TOTAL": Column(float, Check.ge(0)),
        "D2_CLIENTE": Column(
            str, Check.isin(list(valid_clientes)) if valid_clientes else None
        ),
        "D2_LOJA": Column(str, Check.isin(list(valid_lojas)) if valid_lojas else None),
        "D2_CCUSTO": Column(str, nullable=True),
        "D2_CONTA": Column(str, nullable=True),
        "D2_GRUPO": Column(str, nullable=True),
        "D2_REMITO": Column(str),
        "D2_SERIREM": Column(str),
        "D2_DTDIGIT": Column(str, Check.str_matches(r"^\d{8}$")),  # YYYYMMDD
        "D_E_L_E_T_": Column(str, Check.isin([" ", "*"]), nullable=True),
    }

    return pa.DataFrameSchema(cols, checks=checks_df, strict=True, coerce=True)


# from sd2_schema import make_SD2_schema

# Construí catálogos y claves desde tus DataFrames / ORM
# valid_productos = {p.B1_COD for p in productos}
# product_um_map = {p.B1_COD: p.B1_UM for p in productos}
# valid_ums = {p.B1_UM for p in productos}
# valid_clientes = {c.A1_COD for c in clientes}
# valid_lojas = {c.A1_LOJA for c in clientes}
# valid_filiais = {"0001", "0002"}
# valid_almacenes = {a.ZH_ALM for a in almacenes}
# valid_tes = {"501", "510", "540"}

# # SC6/PB7 claves y mapas
# sc6_keys = {(r.C6_NUM, r.C6_FILIAL, r.C6_ITEM) for r in sc6_df.itertuples()}
# sc6_prod_map = {
#     (r.C6_NUM, r.C6_FILIAL, r.C6_ITEM): r.C6_PRODUTO for r in sc6_df.itertuples()
# }
# sc6_um_map = {(r.C6_NUM, r.C6_FILIAL, r.C6_ITEM): r.C6_UM for r in sc6_df.itertuples()}
# pb7_keys = {
#     (r.PB7_PEDIDO, r.PB7_FILIAL, r.PB7_SEQUEN, r.PB7_ITEMPV)
#     for r in pb7_df.itertuples()
# }

# schema = make_SD2_schema(
#     valid_productos=valid_productos,
#     product_um_map=product_um_map,
#     valid_ums=valid_ums,
#     valid_clientes=valid_clientes,
#     valid_lojas=valid_lojas,
#     valid_filiais=valid_filiais,
#     valid_almacenes=valid_almacenes,
#     valid_tes=valid_tes,
#     sc6_keys=sc6_keys,
#     sc6_prod_map=sc6_prod_map,
#     sc6_um_map=sc6_um_map,
#     pb7_keys=pb7_keys,
#     min_date=date(2025, 1, 1),
#     max_date=date(2025, 12, 31),
#     enforce_not_deleted=True,  # si tu dataset usa soft-delete
# )

# schema.validate(df_sd2, lazy=True)

# ==== FIN: schemas/sd2_schema.py ====

# ==== INICIO: generators/__init__.py ====
# package

# ==== FIN: generators/__init__.py ====

# ==== INICIO: generators/maestros_gen.py ====
import random
from faker import Faker
from sqlalchemy.orm import Session

from fakeraguai.models.maestros import NNR300
from ..models import SZG300, SZH300, SB1300, SA1300

fake = Faker("es_ES")


def seed_maestros(session: Session, n_clientes: int = 20):
    tipos = [
        ("01", "MERCADO"),
        ("02", "MAYORISTA"),
        ("03", "PROVINCIA"),
        ("04", "INDUSTRIA"),
        ("06", "INTERIOR"),
        ("08", "EXPORTACION"),
        ("20", "INSTITUCIONES"),
        ("26", "INTERESES"),
    ]
    for c, d in tipos:
        session.merge(SZG300(ZG_CODIGO=c, ZG_DESC=d, D_E_L_E_T_=" "))

    # segs = [
    #     ("100", "Mercado"),
    #     ("200", "Mayorista"),
    #     ("300", "Exportación"),
    #     ("400", "Industrial"),
    # ]
    # for c, d in segs:
    #     session.merge(CTT300(CTT_CUSTO=c, CTT_DESC01=d))

    alms = [
        ("20", "Santa Cruz - Av. Cristo Redentor"),
        ("29", "Santa Cruz - Parque Industrial"),
        ("55", "Cochabamba - Av. Blanco Galindo"),
        ("63", "Cochabamba - La Cancha"),
        ("74", "La Paz - El Alto"),
        ("90", "La Paz - Zona Sur"),
        ("91", "Santa Cruz - Barrio Equipetrol"),
    ]
    for c, d in alms:
        session.merge(NNR300(NNR_COD=c, NNR_DESCRI=d))

    moviles = [
        ("20", "Movil1"),
        ("29", "Movil2"),
        ("55", "Movil3"),
        ("63", "Movil4"),
        ("74", "Movil5"),
        ("90", "Movil6"),
        ("91", "Movil7"),
    ]
    for c, d in moviles:
        session.merge(SZH300(ZH_ALM=c, ZH_DESC=d))

    prods = [
        ("PA010001", "ALCOHOL HIDRATADO", "LT"),
        ("PA020121", "AZUCAR 1KG", "BL"),
        ("PA020211", "AZUCAR 50KG", "BL"),
        ("PA030001", "BAGAZO", "KG"),
    ]
    for cod, desc, um in prods:
        session.merge(SB1300(B1_COD=cod, B1_DESC=desc, B1_UM=um, D_E_L_E_T_=" "))

    for _ in range(n_clientes):
        cod = f"{random.randint(1,999999):06d}"
        loja = f"{random.randint(1,2):02d}"
        tipo = random.choice(tipos)[0]
        session.merge(
            SA1300(
                A1_COD=cod,
                A1_LOJA=loja,
                A1_NOME=fake.company(),
                A1_CGC=str(random.randint(1_000_000, 99_999_999)),
                A1_UTPCLI=tipo,
                D_E_L_E_T_=" ",
            )
        )

# ==== FIN: generators/maestros_gen.py ====

# ==== INICIO: generators/movimientos_gen.py ====
import numpy as np
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from ..models import SB1300, SZH300, SD3300, SD2300, PB7300

fake = Faker("es_ES")
DEFAULT_FILIAL = "0001"
EXCLUDED_DEST = {"14", "19", "20"}


# --- Helpers ---
def _yyyymmdd(d: date) -> str:
    return d.strftime("%Y%m%d")


def _safe_choice(seq, err_msg: str):
    if not seq:
        raise ValueError(err_msg)
    return np.random.choice(seq)


# ---------------------------------------------
# 1) TRANSFERENCIAS SD3300 (par 501/008)
# ---------------------------------------------
def generate_transfer_out_data(
    session: Session,
    start_date: date,
    end_date: date,
    pairs_per_day: int = 5,
    productos_whitelist=("PA020211", "PA010001", "PA020121"),
    origenes=("20", "90", "29", "63"),
    destinos=("29", "55", "63", "74", "90", "91"),
    usuario="ztransfer",
):
    """Genera pares SD3300 {origen:501, destino:008} con el mismo XNROTRA y XORIGEN = doc origen."""
    # mapa producto -> UM
    prods = {p.B1_COD: p.B1_UM for p in session.query(SB1300).all()}

    # whitelist efectiva (si está vacía, usamos todo el catálogo)
    productos = [p for p in productos_whitelist if p in prods]
    if not productos:
        productos = sorted(prods.keys())

    # almacenes existentes
    alm_set = {a.ZH_ALM for a in session.query(SZH300).all()} or set()

    curr = start_date
    while curr <= end_date:
        for _ in range(pairs_per_day):
            # producto + UM
            cod = _safe_choice(
                productos, "No hay productos disponibles para transferir."
            )
            um = prods.get(cod, "UN")

            # origen válido (si existe en catálogo de almacenes, preferirlo)
            origen_candidatos = [o for o in origenes if (not alm_set or o in alm_set)]
            origen = _safe_choice(
                origen_candidatos or origenes, "No hay almacenes de origen válidos."
            )

            # destino válido ≠ origen, no excluido, y existente
            destino_candidatos = [
                d
                for d in destinos
                if d != origen
                and d not in EXCLUDED_DEST
                and (not alm_set or d in alm_set)
            ]
            destino = _safe_choice(
                destino_candidatos
                or [d for d in destinos if d != origen and d not in EXCLUDED_DEST],
                "No hay almacenes de destino válidos.",
            )

            # cantidad por UM (rangos razonables por unidad)
            if um == "LT":
                qty = float(np.random.uniform(5_000, 150_000))
            elif um in ("BL", "QQ"):
                qty = float(np.random.uniform(50, 1_200))
            else:
                qty = float(np.random.uniform(50, 5_000))

            # nota/transfer id y documentos
            nota = f"TR{_yyyymmdd(curr)}{np.random.randint(100,999)}"
            d3doc_or = f"T{_yyyymmdd(curr)}{np.random.randint(1000,9999)}O"
            d3doc_de = f"T{_yyyymmdd(curr)}{np.random.randint(1000,9999)}D"
            emissa = _yyyymmdd(curr)

            # ORIGEN 501
            session.add(
                SD3300(
                    D3_FILIAL=DEFAULT_FILIAL,
                    D3_DOC=d3doc_or,
                    D3_XNROTRA=nota,
                    D3_COD=cod,
                    D3_UM=um,
                    D3_QUANT=qty,
                    D3_QTSEGUM=qty,  # si usás segunda UM, ajustá aquí
                    D3_CUSTO1=None,
                    D3_LOCAL=origen,
                    D3_EMISSAO=emissa,
                    D3_TM="501",
                    D3_XORIGEN=d3doc_or,
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )
            # DESTINO 008 (apunta al doc de origen)
            session.add(
                SD3300(
                    D3_FILIAL=DEFAULT_FILIAL,
                    D3_DOC=d3doc_de,
                    D3_XNROTRA=nota,
                    D3_COD=cod,
                    D3_UM=um,
                    D3_QUANT=qty,
                    D3_QTSEGUM=qty,
                    D3_CUSTO1=None,
                    D3_LOCAL=destino,
                    D3_EMISSAO=emissa,
                    D3_TM="008",
                    D3_XORIGEN=d3doc_or,  # <- vínculo con origen
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )
        curr += timedelta(days=1)


# ---------------------------------------------
# 2) REMITO SD2300 (TIPODOC = '50') GARANTIZADO
# ---------------------------------------------
def ensure_remito_50(
    session: Session,
    pedido: str,
    item: int,
    filial: str,
    produto: str,
    cliente: str,
    loja: str,
    local: str,
    qty: float,
    precio: float,
    emision: date,
    tes: str,
) -> str:
    """Si ya existe un SD2300 con TIPODOC=50 para (pedido,item,filial), lo reutiliza; si no, lo crea."""
    r = (
        session.query(SD2300)
        .filter(
            SD2300.D2_TIPODOC == "50",
            SD2300.D2_PEDIDO == pedido,
            SD2300.D2_ITEMPV == item,
            SD2300.D2_FILIAL == filial,
        )
        .first()
    )
    if r:
        return r.D2_DOC

    prod = session.query(SB1300).filter(SB1300.B1_COD == produto).first()
    um = prod.B1_UM if prod else "UN"

    d2_doc = f"R{np.random.randint(10000,99999)}"
    d2_remito = f"REM{np.random.randint(100000,999999)}"
    emissa = _yyyymmdd(emision)

    session.add(
        SD2300(
            D2_TIPODOC="50",  # Remito
            D2_DOC=d2_doc,
            D2_SERIE="001",
            D2_FILIAL=filial,
            D2_CLIENTE=cliente,
            D2_LOJA=loja,
            D2_COD=produto,
            D2_UM=um,
            D2_LOCAL=local,
            D2_QUANT=qty,
            D2_QTSEGUM=qty,  # si manejás 2da UM, ajustalo
            D2_PRCVEN=precio,
            D2_TOTAL=round(float(qty) * float(precio or 0), 2),
            D2_TES=tes,  # ej. "501"
            D2_CCUSTO=None,
            D2_EMISSAO=emissa,
            D2_DTDIGIT=emissa,
            D2_PEDIDO=pedido,
            D2_SEQUEN=item,
            D2_ITEMPV=item,
            D2_REMITO=d2_remito,  # <- útil para joins del PDF
            D2_SERIREM="A",
        )
    )
    session.flush()
    return d2_doc


# ---------------------------------------------
# 3) PB7300 (Despacho / Balanza) + Remito 50
# ---------------------------------------------
def generate_driver_data(
    session: Session,
    start_date: date,
    end_date: date,
    deliveries_per_day: int = 12,
    allow_client_pickup_ratio: float = 0.15,
):
    """
    Crea PB7300 correlacionado con SC6300 y garantiza remito '50' en SD2300.
    Nota: Si tu SC6300 no tiene C6_CLI/C6_LOJA, cambiá el SELECT por un JOIN a SC5300.
    """
    # Intentar traer cliente/loja desde SC6300 (ajusta columnas a tu modelo real)
    try:
        sc6 = session.execute(
            """
            SELECT C6_NUM, C6_ITEM, C6_FILIAL, C6_PRODUTO, C6_CLI, C6_LOJA,
                   C6_LOCAL, C6_QTDVEN, C6_PRCVEN, C6_LOCDEST
            FROM SC6300
            """
        ).fetchall()
    except Exception:
        # Fallback sin cliente/loja (poné defaults o hace JOIN a SC5300 aquí)
        sc6 = session.execute(
            """
            SELECT C6_NUM, C6_ITEM, C6_FILIAL, C6_PRODUTO, NULL as C6_CLI, NULL as C6_LOJA,
                   C6_LOCAL, C6_QTDVEN, C6_PRCVEN, C6_LOCDEST
            FROM SC6300
            """
        ).fetchall()

    # mapa producto -> UM (para estimar pesos)
    prod_map = {p.B1_COD: p.B1_UM for p in session.query(SB1300).all()}

    curr = start_date
    while curr <= end_date:
        todays = sc6[:deliveries_per_day] if len(sc6) >= deliveries_per_day else sc6
        for it in todays:
            um = prod_map.get(it.C6_PRODUTO, "UN")
            # cantidad a despachar (<= QTDVEN)
            qty = float(
                min(
                    it.C6_QTDVEN or 0.0,
                    np.random.uniform(
                        max((it.C6_QTDVEN or 0.0) * 0.2, 0.01), it.C6_QTDVEN or 1.0
                    ),
                )
            )

            # Garantizar Remito 50
            _ = ensure_remito_50(
                session,
                pedido=it.C6_NUM,
                item=it.C6_ITEM,
                filial=it.C6_FILIAL or DEFAULT_FILIAL,
                produto=it.C6_PRODUTO,
                cliente=it.C6_CLI or "C00001",
                loja=it.C6_LOJA or "01",
                local=it.C6_LOCAL or "20",
                qty=qty,
                precio=float(it.C6_PRCVEN or 0),
                emision=curr,
                tes="501",
            )

            client_pickup = np.random.rand() < allow_client_pickup_ratio

            # Estimar bruto/tara según UM
            if um in ("LT", "KG"):
                pbruto = qty + np.random.uniform(50, 500)
            else:
                pbruto = qty + np.random.uniform(0, 10)
            ptara = np.random.uniform(0, 5)

            session.add(
                PB7300(
                    PB7_FILIAL=it.C6_FILIAL or DEFAULT_FILIAL,
                    PB7_DATA=_yyyymmdd(curr),
                    PB7_DSAIDA=_yyyymmdd(curr),
                    PB7_PEDIDO=it.C6_NUM,
                    PB7_SEQUEN=it.C6_ITEM,
                    PB7_ITEMPV=it.C6_ITEM,
                    PB7_PRODUT=it.C6_PRODUTO,
                    PB7_QTDE=qty,
                    PB7_STATUS="A",  # abierto; cambialo a "F" si querés cerrar
                    PB7_PBRUTO=float(pbruto),
                    PB7_PTARA=float(ptara),
                    PB7_PLACA=(
                        None if client_pickup else f"ABC-{np.random.randint(100,999)}"
                    ),
                    PB7_CHOFER=(None if client_pickup else fake.name()),
                    PB7_TELEFO=(None if client_pickup else fake.phone_number()),
                    PB7_DOCUME=(
                        None
                        if client_pickup
                        else str(np.random.randint(1_000_000, 9_999_999))
                    ),
                    PB7_OBSERV=fake.sentence(nb_words=4),
                    PB7_XOBS=None,
                    PB7_XZAFRA=str(curr.year),
                    PB7_XDESP=str(np.random.randint(10000, 99999)),
                    PB7_LOCENT=it.C6_LOCDEST or it.C6_LOCAL or "20",
                )
            )
        curr += timedelta(days=1)

# ==== FIN: generators/movimientos_gen.py ====

# ==== INICIO: generators/pedidos_gen.py ====
import random
from datetime import datetime, timedelta, date
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models import SA1300, SB1300, SC5300, SC6300, SC900, SZH300  # ← añadí SZH300
from ..schemas.sc5_schema import SC5_schema
from ..schemas.sc6_schema import SC6_schema

EXCLUDED_DEST = {
    "14",
    "19",
    "20",
}  # para favorecer que luego el SD3300(008) no caiga en excluidos


def _yyyymmdd(d: date | datetime) -> str:
    if isinstance(d, datetime):
        d = d.date()
    return d.strftime("%Y%m%d")


def generate_pedidos(
    session: Session,
    start_date: datetime | date,
    days: int = 5,
    n_pedidos: int = 20,
    prefer_pa0_ratio: float = 0.7,  # ↑ prob de productos PA0%
):
    # Catálogos
    clientes = session.query(SA1300).all()
    productos = session.query(SB1300).all()
    prod_pa0 = [p for p in productos if (p.B1_COD or "").startswith("PA0")]
    prod_otros = [
        p for p in productos if (p.B1_COD or "") and not p.B1_COD.startswith("PA0")
    ]

    # Almacenes válidos desde SZH300 (si hay); si no, fallback razonable
    zh = session.query(SZH300).all()
    almacenes = (
        sorted({z.ZH_ALM for z in zh})
        if zh
        else ["20", "29", "55", "63", "74", "90", "91"]
    )
    if not almacenes:
        almacenes = ["20", "29", "55", "63", "74", "90", "91"]

    pedidos, detalles, aprob = [], [], []

    # Asegurar que start sea date
    if isinstance(start_date, datetime):
        base_day = start_date.date()
    else:
        base_day = start_date

    for n in range(n_pedidos):
        cte = random.choice(clientes)

        # Número único de pedido
        num = f"{10500 + n:06d}"

        # Emisión dentro de la ventana
        emis = base_day + timedelta(days=random.randint(0, max(days, 0)))
        c5 = dict(
            C5_NUM=num,
            C5_CLIENTE=cte.A1_COD,
            C5_LOJACLI=cte.A1_LOJA,
            C5_EMISSAO=_yyyymmdd(emis),  # ← YYYYMMDD
            C5_XTIPO=random.choice(list("158")),  # según tu dominio
            C5_MOEDA=random.choice(["BOB", "USD"]),
            # "D_E_L_E_T_": " ",                  # ← descomenta si tu modelo lo tiene
        )
        pedidos.append(c5)

        # Número de ítems: inclusivo (1..N)
        n_items = random.randint(1, 4)
        for item in range(1, n_items + 1):
            # Elegir producto, favoreciendo PA0%
            if prod_pa0 and (random.random() < prefer_pa0_ratio):
                prod = random.choice(prod_pa0)
            else:
                prod = random.choice(prod_pa0 or prod_otros or productos)

            # Cantidades por UM
            if prod.B1_UM == "LT":
                qty = float(random.uniform(1_000.0, 80_000.0))
            else:
                qty = float(random.uniform(1.0, 50.0))

            prc = round(random.uniform(0.5, 250.0), 2)
            val = round(qty * prc, 2)

            # Almacenes: origen y destino válidos y distintos
            local = random.choice(almacenes)
            # candidatos destino: distinto de origen y no excluido
            candidatos_dest = [
                a for a in almacenes if a != local and a not in EXCLUDED_DEST
            ] or almacenes
            locdest = random.choice(candidatos_dest)

            # Filial razonable
            filial = "0001"

            detalles.append(
                dict(
                    C6_NUM=num,
                    C6_ITEM=item,
                    C6_PRODUTO=prod.B1_COD,
                    C6_UM=prod.B1_UM,
                    C6_QTDVEN=qty,
                    C6_QTDENT=0.0,  # ← útil para PB7/SD2 luego
                    C6_PRCVEN=prc,
                    C6_VALOR=val,
                    C6_LOCAL=local,
                    C6_LOCDEST=locdest,
                    C6_CLI=cte.A1_COD,
                    C6_LOJA=cte.A1_LOJA,
                    C6_FILIAL=filial,
                    # "D_E_L_E_T_": " ",      # ← descomenta si tu modelo lo tiene
                )
            )

            # Aprobaciones SC900
            aprob.append(
                dict(
                    C9_NUM=num,
                    C9_ITEM=item,
                    C9_STATUS=random.choice(["A", "A", "P"]),
                    C9_QUANT=qty,
                    C9_PRECO=prc,
                    C9_USR="aprobador",
                    C9_DATA=_yyyymmdd(emis),  # mantener formato con resto del sistema
                    # "D_E_L_E_T_": " ",      # opcional
                )
            )

    # DataFrames para validación
    df_sc5 = pd.DataFrame(pedidos)
    df_sc6 = pd.DataFrame(detalles)
    df_sc9 = pd.DataFrame(aprob)

    # Validación con tus esquemas
    SC5_schema.validate(df_sc5)
    SC6_schema.validate(df_sc6)
    # (si tenés schema para SC9, validalo también)

    # Bulk insert
    for r in df_sc5.to_dict(orient="records"):
        session.add(SC5300(**r))
    for r in df_sc6.to_dict(orient="records"):
        session.add(SC6300(**r))
    for r in df_sc9.to_dict(orient="records"):
        session.add(SC900(**r))

# ==== FIN: generators/pedidos_gen.py ====

# ==== INICIO: loaders/__init__.py ====
# package

# ==== FIN: loaders/__init__.py ====

# ==== INICIO: loaders/maestros_loader.py ====
# loaders/maestros_loader.py
from sqlalchemy.orm import Session
from ..generators.maestros_gen import seed_maestros
from ..utils._utils import transactional, count_rows
from ..models import SA1300, SB1300, SZG300  # ajusta a tus modelos reales


def load_maestros(session: Session, n_clientes: int = 20, autocommit: bool = True):
    with transactional(session, autocommit=autocommit):
        seed_maestros(session, n_clientes=n_clientes)
    return {
        "SA1300": count_rows(session, SA1300),
        "SB1300": count_rows(session, SB1300),
        "SZG300": count_rows(session, SZG300),
    }

# ==== FIN: loaders/maestros_loader.py ====

# ==== INICIO: loaders/movimientos_loader.py ====
# loaders/movimientos_loader.py
from datetime import date
from sqlalchemy.orm import Session
import pandas as pd

from ..generators.movimientos_gen import (
    generate_transfer_out_data,
    generate_driver_data,
)
from ..utils._utils import transactional
from ..models import SD3300, SD2300, PB7300
from ..schemas.sd3_schema import make_SD3_schema
from ..schemas.sd2_schema import make_SD2_schema


def load_transfers(
    session: Session,
    start: date,
    end: date,
    pairs_per_day: int = 10,
    *,
    validate: bool = True,
    autocommit: bool = True,
):
    with transactional(session, autocommit=False):
        generate_transfer_out_data(session, start, end, pairs_per_day=pairs_per_day)
        session.flush()

        if validate:
            sd3 = session.query(SD3300).all()
            df_sd3 = pd.DataFrame(
                [
                    {
                        "D3_DOC": r.D3_DOC,
                        "D3_XNROTRA": r.D3_XNROTRA,
                        "D3_XORIGEN": r.D3_XORIGEN,
                        "D3_COD": r.D3_COD,
                        "D3_UM": r.D3_UM,
                        "D3_QUANT": r.D3_QUANT,
                        "D3_QTSEGUM": r.D3_QTSEGUM,
                        "D3_EMISSAO": r.D3_EMISSAO,
                        "D3_TM": r.D3_TM,
                        "D3_LOCAL": r.D3_LOCAL,
                        "D3_FILIAL": r.D3_FILIAL,
                    }
                    for r in sd3
                ]
            )
            valid_alm = set(df_sd3["D3_LOCAL"].dropna().unique())
            sd3_schema = make_SD3_schema(
                valid_almacenes=valid_alm, only_transfer_tms=True
            )
            sd3_schema.validate(df_sd3, lazy=True)

        if autocommit:
            session.commit()

    return {"SD3_movs": session.query(SD3300).count()}


def load_pb7(
    session: Session,
    start: date,
    end: date,
    deliveries_per_day: int = 12,
    allow_client_pickup_ratio: float = 0.15,
    *,
    validate: bool = True,
    autocommit: bool = True,
):
    with transactional(session, autocommit=False):
        generate_driver_data(
            session,
            start,
            end,
            deliveries_per_day=deliveries_per_day,
            allow_client_pickup_ratio=allow_client_pickup_ratio,
        )
        session.flush()

        if validate:
            # SD2 y PB7 (y opcionalmente su cruce)
            sd2 = session.query(SD2300).all()
            pb7 = session.query(PB7300).all()

            import pandas as pd

            df_sd2 = pd.DataFrame(
                [
                    {
                        "D2_DOC": r.D2_DOC,
                        "D2_SERIE": r.D2_SERIE,
                        "D2_FILIAL": r.D2_FILIAL,
                        "D2_PEDIDO": r.D2_PEDIDO,
                        "D2_SEQUEN": r.D2_SEQUEN,
                        "D2_ITEMPV": r.D2_ITEMPV,
                        "D2_COD": r.D2_COD,
                        "D2_QUANT": r.D2_QUANT,
                        "D2_QTSEGUM": r.D2_QTSEGUM,
                        "D2_UM": r.D2_UM,
                        "D2_EMISSAO": r.D2_EMISSAO,
                        "D2_LOCAL": r.D2_LOCAL,
                        "D2_TIPODOC": r.D2_TIPODOC,
                        "D2_TES": r.D2_TES,
                        "D2_PRCVEN": r.D2_PRCVEN,
                        "D2_TOTAL": r.D2_TOTAL,
                        "D2_CLIENTE": r.D2_CLIENTE,
                        "D2_LOJA": r.D2_LOJA,
                        "D2_CCUSTO": r.D2_CCUSTO,
                        "D2_CONTA": r.D2_CONTA,
                        "D2_GRUPO": r.D2_GRUPO,
                        "D2_REMITO": r.D2_REMITO,
                        "D2_SERIREM": r.D2_SERIREM,
                        "D2_DTDIGIT": r.D2_DTDIGIT,
                        # "D_E_L_E_T_": r.D_E_L_E_T_,
                    }
                    for r in sd2
                ]
            )

            df_pb7 = pd.DataFrame(
                [
                    {
                        "PB7_PEDIDO": r.PB7_PEDIDO,
                        "PB7_FILIAL": r.PB7_FILIAL,
                        "PB7_SEQUEN": r.PB7_SEQUEN,
                        "PB7_ITEMPV": r.PB7_ITEMPV,
                        "PB7_PRODUT": r.PB7_PRODUT,
                        "PB7_QTDE": r.PB7_QTDE,
                    }
                    for r in pb7
                ]
            )

            # Catálogos dinámicos para SD2
            valid_prod = set(df_sd2["D2_COD"].unique())
            product_um_map = {
                r.D2_COD: r.D2_UM for r in sd2
            }  # si tenés SB1, mejor desde allí
            valid_ums = set(df_sd2["D2_UM"].unique())
            valid_clientes = set(df_sd2["D2_CLIENTE"].dropna().unique())
            valid_lojas = set(df_sd2["D2_LOJA"].dropna().unique())
            valid_filiais = set(df_sd2["D2_FILIAL"].dropna().unique())
            valid_almacenes = set(df_sd2["D2_LOCAL"].dropna().unique())
            valid_tes = {"501", "510", "540"}  # ajustá a tu dominio

            # Claves SC6 y PB7 para checks cruzados
            # Si tenés los DF de SC6, construí maps reales; aquí hago fallback mínimo:
            sc6_keys = {(r.D2_PEDIDO, r.D2_FILIAL, r.D2_ITEMPV) for r in sd2}
            pb7_keys = set(
                df_pb7.apply(
                    lambda x: (
                        x.PB7_PEDIDO,
                        x.PB7_FILIAL,
                        int(x.PB7_SEQUEN),
                        int(x.PB7_ITEMPV),
                    ),
                    axis=1,
                )
            )

            from ..schemas.sd2_schema import make_SD2_schema

            sd2_schema = make_SD2_schema(
                valid_productos=valid_prod,
                product_um_map=product_um_map,
                valid_ums=valid_ums,
                valid_clientes=valid_clientes,
                valid_lojas=valid_lojas,
                valid_filiais=valid_filiais,
                valid_almacenes=valid_almacenes,
                valid_tes=valid_tes,
                sc6_keys=sc6_keys,
                pb7_keys=pb7_keys,
            )
            sd2_schema.validate(df_sd2, lazy=True)

        if autocommit:
            session.commit()

    return {
        "PB7_rows": session.query(PB7300).count(),
        "SD2_rows": session.query(SD2300).count(),
    }

# ==== FIN: loaders/movimientos_loader.py ====

# ==== INICIO: loaders/pedidos_loader.py ====
# loaders/pedido_loader.py
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import pandas as pd

from ..generators.pedidos_gen import generate_pedidos
from ..utils._utils import transactional
from ..models import SC5300, SC6300, SC900
from ..schemas.sc5_schema import make_SC5_schema
from ..schemas.sc6_schema import make_SC6_schema


def load_pedidos(
    session: Session,
    start_date: date | datetime,
    days: int = 5,
    n_pedidos: int = 20,
    *,
    validate: bool = True,
    autocommit: bool = True,
):
    with transactional(session, autocommit=False):  # commit manual tras validar
        generate_pedidos(session, start_date=start_date, days=days, n_pedidos=n_pedidos)
        session.flush()  # asegurar que ORM materialice filas para contarlas/leerlas

        if validate:
            # Construir DataFrames desde la sesión (rápido y simple)
            sc5 = session.query(SC5300).order_by(SC5300.C5_NUM).all()
            sc6 = session.query(SC6300).order_by(SC6300.C6_NUM, SC6300.C6_ITEM).all()

            df_sc5 = pd.DataFrame(
                [
                    {
                        "C5_NUM": r.C5_NUM,
                        "C5_CLIENTE": r.C5_CLIENTE,
                        "C5_LOJACLI": r.C5_LOJACLI,
                        "C5_EMISSAO": r.C5_EMISSAO,
                        "C5_XTIPO": r.C5_XTIPO,
                        "C5_MOEDA": r.C5_MOEDA,
                    }
                    for r in sc5
                ]
            )

            df_sc6 = pd.DataFrame(
                [
                    {
                        "C6_NUM": r.C6_NUM,
                        "C6_ITEM": r.C6_ITEM,
                        "C6_PRODUTO": r.C6_PRODUTO,
                        "C6_UM": r.C6_UM,
                        "C6_QTDVEN": r.C6_QTDVEN,
                        "C6_PRCVEN": r.C6_PRCVEN,
                        "C6_VALOR": getattr(
                            r, "C6_VALOR", (r.C6_QTDVEN or 0) * (r.C6_PRCVEN or 0)
                        ),
                        "C6_LOCAL": r.C6_LOCAL,
                        "C6_LOCDEST": r.C6_LOCDEST,
                        "C6_CLI": r.C6_CLI,
                        "C6_LOJA": r.C6_LOJA,
                    }
                    for r in sc6
                ]
            )

            # Catálogos dinámicos
            valid_clientes = {r.C5_CLIENTE for r in sc5}
            valid_lojas = {r.C5_LOJACLI for r in sc5}
            valid_pedidos = {r.C5_NUM for r in sc5}
            valid_prod = {r.C6_PRODUTO for r in sc6}
            valid_ums = {r.C6_UM for r in sc6}
            valid_alms = {
                *(x for x in df_sc6["C6_LOCAL"].dropna().unique()),
                *(x for x in df_sc6["C6_LOCDEST"].dropna().unique()),
            }

            c5_schema = make_SC5_schema(
                valid_clientes=valid_clientes, valid_lojas=valid_lojas
            )
            c6_schema = make_SC6_schema(
                valid_pedidos=valid_pedidos,
                valid_clientes=valid_clientes,
                valid_lojas=valid_lojas,
                valid_productos=valid_prod,
                valid_ums=valid_ums,
                valid_almacenes=valid_alms,
                enforce_dest_rules=True,
            )
            c5_schema.validate(df_sc5, lazy=True)
            c6_schema.validate(df_sc6, lazy=True)

        if autocommit:
            session.commit()

    return {
        "SC5_pedidos": session.query(SC5300).count(),
        "SC6_items": session.query(SC6300).count(),
        "SC9_aprob": session.query(SC900).count(),
    }

# ==== FIN: loaders/pedidos_loader.py ====

# ==== INICIO: utils/__init__.py ====
# package

# ==== FIN: utils/__init__.py ====

# ==== INICIO: utils/logger.py ====

import logging

def setup_logger(name: str = "fakeplant", level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        fmt = logging.Formatter("[%(levelname)s] %(asctime)s - %(name)s - %(message)s")
        handler.setFormatter(fmt)
        logger.addHandler(handler)
    logger.setLevel(level)
    return logger

# ==== FIN: utils/logger.py ====

# ==== INICIO: utils/config.py ====

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class OracleSettings:
    user: str = os.getenv("ORACLE_USER", "TMPRD")
    password: str = os.getenv("ORACLE_PASSWORD", "TMPRD")
    host: str = os.getenv("ORACLE_HOST", "localhost")
    port: int = int(os.getenv("ORACLE_PORT", "1521"))
    service: str = os.getenv("ORACLE_SERVICE", "orclaguai")

    def sqlalchemy_url(self) -> str:
        return f"oracle+oracledb://{self.user}:{self.password}@{self.host}:{self.port}/?service_name={self.service}"

ORACLE = OracleSettings()

# ==== FIN: utils/config.py ====

# ==== INICIO: utils/db.py ====

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import ORACLE

engine = create_engine(
    ORACLE.sqlalchemy_url(),
    max_identifier_length=128,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_session():
    return SessionLocal()

# ==== FIN: utils/db.py ====

