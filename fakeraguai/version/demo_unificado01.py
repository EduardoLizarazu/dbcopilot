# ==== INICIO: main.py ====
import argparse
from datetime import datetime, date
from fakeraguai.utils.db import engine, get_session
from fakeraguai.utils.logger import setup_logger
from fakeraguai.models import Base
from fakeraguai.loaders.maestros_loader import load_maestros
from fakeraguai.loaders.pedidos_loader import load_pedidos
from fakeraguai.loaders.movimientos_loader import load_transfers, load_pb7

log = setup_logger()


def reset_db():
    with engine.begin():
        Base.metadata.drop_all(bind=engine)
        log.info("Tablas eliminadas.")
        Base.metadata.create_all(bind=engine)
        log.info("Tablas creadas.")


def seed_all():
    with get_session() as s:
        with s.begin():
            load_maestros(s, n_clientes=50)
            load_pedidos(s, start_date=datetime(2020, 3, 1), days=5, n_pedidos=30)
            log.info("Maestros y pedidos cargados.")
    with get_session() as s2:
        with s2.begin():
            load_transfers(
                s2, start=date(2020, 6, 1), end=date(2020, 6, 5), pairs_per_day=12
            )
            load_pb7(
                s2, start=date(2020, 6, 1), end=date(2020, 6, 5), deliveries_per_day=18
            )
            log.info("Traslados y PB7 generados.")


def main():
    parser = argparse.ArgumentParser(description="Fakeplant CLI")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("reset", help="Drop & create all tables")
    sub.add_parser("seed", help="Carga demo (maestros, pedidos, traslados, PB7)")
    args = parser.parse_args()
    if args.cmd == "reset":
        reset_db()
    elif args.cmd == "seed":
        seed_all()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

# ==== FIN: main.py ====

# ==== INICIO: models/__init__.py ====

from .base import Base
from .maestros import SZG300, SA1300, SB1300, SZH300, CTT300
from .pedidos import SC5300, SC6300, SC900
from .movimientos import SD2300, SF2300, SD3300, PB7300
__all__ = ["Base","SZG300","SA1300","SB1300","SZH300","CTT300","SC5300","SC6300","SC900","SD2300","SF2300","SD3300","PB7300"]

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

import pandera as pa
from pandera import Column, Check

SC5_schema = pa.DataFrameSchema(
    {
        "C5_NUM": Column(str, Check.str_length(1, 10)),
        "C5_CLIENTE": Column(str),
        "C5_LOJACLI": Column(str),
        "C5_EMISSAO": Column("datetime64[ns]", coerce=True),
        "C5_XTIPO": Column(str, Check.isin(list("12345678"))),
        "C5_MOEDA": Column(str, Check.isin(["1", "2", "USD", "BOB"])),
    }
)

# ==== FIN: schemas/sc5_schema.py ====

# ==== INICIO: schemas/sc6_schema.py ====

import pandera as pa
from pandera import Column, Check

SC6_schema = pa.DataFrameSchema(
    {
        "C6_NUM": Column(str),
        "C6_ITEM": Column(int, Check.ge(1)),
        "C6_PRODUTO": Column(str),
        "C6_UM": Column(str),
        "C6_QTDVEN": Column(float, Check.gt(0)),
        "C6_PRCVEN": Column(float, Check.ge(0)),
        "C6_VALOR": Column(float, Check.ge(0)),
        "C6_LOCAL": Column(str, nullable=True),
        "C6_LOCDEST": Column(str, nullable=True),
        "C6_CLI": Column(str),
        "C6_LOJA": Column(str),
    }
)

# ==== FIN: schemas/sc6_schema.py ====

# ==== INICIO: schemas/sd3_schema.py ====

import pandera as pa
from pandera import Column, Check

SD3_schema = pa.DataFrameSchema(
    {
        "D3_COD": Column(str),
        "D3_UM": Column(str),
        "D3_QUANT": Column(float, Check.gt(0)),
        "D3_EMISSAO": Column("datetime64[ns]", coerce=True),
        "D3_TM": Column(str, Check.isin(["001", "501", "008"])),
        "D3_LOCAL": Column(str),
    }
)

# ==== FIN: schemas/sd3_schema.py ====

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
    prods = {p.B1_COD: p.B1_UM for p in session.query(SB1300).all()}
    alm_set = {a.ZH_ALM for a in session.query(SZH300).all()}
    productos = [p for p in productos_whitelist if p in prods]
    curr = start_date
    while curr <= end_date:
        for _ in range(pairs_per_day):
            cod = np.random.choice(productos)
            um = prods[cod]
            origen = np.random.choice(origenes)
            destino = np.random.choice(
                [
                    d
                    for d in destinos
                    if d in alm_set and d not in EXCLUDED_DEST and d != origen
                ]
            )
            qty = (
                float(np.random.uniform(5_000, 150_000))
                if um == "LT"
                else (
                    float(np.random.uniform(50, 1_200))
                    if um in ("BL", "QQ")
                    else float(np.random.uniform(50, 5_000))
                )
            )
            nota = f"TR{curr.strftime('%Y%m%d')}{np.random.randint(100,999)}"
            session.add(
                SD3300(
                    D3_FILIAL=DEFAULT_FILIAL,
                    D3_DOC=None,
                    D3_XNROTRA=nota,
                    D3_COD=cod,
                    D3_UM=um,
                    D3_QUANT=qty,
                    D3_QTSEGUM=None,
                    D3_CUSTO1=None,
                    D3_LOCAL=origen,
                    D3_EMISSAO=curr,
                    D3_TM="501",
                    D3_XORIGEN="TR",
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )
            session.add(
                SD3300(
                    D3_FILIAL=DEFAULT_FILIAL,
                    D3_DOC=None,
                    D3_XNROTRA=nota,
                    D3_COD=cod,
                    D3_UM=um,
                    D3_QUANT=qty,
                    D3_QTSEGUM=None,
                    D3_CUSTO1=None,
                    D3_LOCAL=destino,
                    D3_EMISSAO=curr,
                    D3_TM="008",
                    D3_XORIGEN="TR",
                    D3_USUARIO=usuario,
                    D3_ESTORNO="N",
                )
            )
        curr += timedelta(days=1)


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
    um = session.query(SB1300).filter(SB1300.B1_COD == produto).first().B1_UM
    d2_doc = f"R{np.random.randint(10000,99999)}"
    session.add(
        SD2300(
            D2_TIPODOC="50",
            D2_DOC=d2_doc,
            D2_SERIE="001",
            D2_FILIAL=filial,
            D2_CLIENTE=cliente,
            D2_LOJA=loja,
            D2_COD=produto,
            D2_UM=um,
            D2_LOCAL=local,
            D2_QUANT=qty,
            D2_QTSEGUM=None,
            D2_PRCVEN=precio,
            D2_TOTAL=round(float(qty) * float(precio), 2),
            D2_TES=tes,
            D2_CCUSTO=None,
            D2_CUSTO1=None,
            D2_EMISSAO=emision,
            D2_DTDIGIT=emision,
            D2_PEDIDO=pedido,
            D2_SEQUEN=item,
            D2_ITEMPV=item,
        )
    )
    session.flush()
    return d2_doc


def generate_driver_data(
    session: Session,
    start_date: date,
    end_date: date,
    deliveries_per_day: int = 12,
    allow_client_pickup_ratio: float = 0.15,
):
    sc6 = session.execute(
        "SELECT C6_NUM, C6_ITEM, C6_FILIAL, C6_PRODUTO, C6_CLI, C6_LOJA, C6_LOCAL, C6_QTDVEN, C6_PRCVEN, C6_LOCDEST FROM SC6300"
    ).fetchall()
    prod_map = {p.B1_COD: p for p in session.query(SB1300).all()}
    curr = start_date
    while curr <= end_date:
        todays = sc6[:deliveries_per_day] if len(sc6) >= deliveries_per_day else sc6
        for it in todays:
            qty = float(
                min(
                    it.C6_QTDVEN,
                    np.random.uniform(max(it.C6_QTDVEN * 0.2, 0.01), it.C6_QTDVEN),
                )
            )
            _ = ensure_remito_50(
                session,
                it.C6_NUM,
                it.C6_ITEM,
                it.C6_FILIAL or DEFAULT_FILIAL,
                it.C6_PRODUTO,
                it.C6_CLI,
                it.C6_LOJA,
                it.C6_LOCAL or "20",
                qty,
                float(it.C6_PRCVEN or 0),
                curr,
                "501",
            )
            client_pickup = np.random.rand() < allow_client_pickup_ratio
            um = prod_map[it.C6_PRODUTO].B1_UM if it.C6_PRODUTO in prod_map else "UN"
            session.add(
                PB7300(
                    PB7_FILIAL=it.C6_FILIAL or DEFAULT_FILIAL,
                    PB7_DATA=curr,
                    PB7_DSAIDA=curr,
                    PB7_PEDIDO=it.C6_NUM,
                    PB7_SEQUEN=it.C6_ITEM,
                    PB7_ITEMPV=it.C6_ITEM,
                    PB7_PRODUT=it.C6_PRODUTO,
                    PB7_QTDE=qty,
                    PB7_STATUS="S",
                    PB7_PBRUTO=(
                        (qty + np.random.uniform(0, 10))
                        if um not in ("LT", "KG")
                        else qty + np.random.uniform(50, 500)
                    ),
                    PB7_PTARA=np.random.uniform(0, 5),
                    PB7_PLACA=(
                        None if client_pickup else f"ABC-{np.random.randint(100,999)}"
                    ),
                    PB7_CHOFER=None if client_pickup else fake.name(),
                    PB7_TELEFO=None if client_pickup else fake.phone_number(),
                    PB7_DOCUME=(
                        None
                        if client_pickup
                        else str(np.random.randint(1_000_000, 9_999_999))
                    ),
                    PB7_OBSERV=fake.sentence(nb_words=4),
                    PB7_XOBS=None,
                    PB7_XZAFRA="2020",
                    PB7_XDESP=str(np.random.randint(10000, 99999)),
                    PB7_LOCENT=it.C6_LOCDEST or it.C6_LOCAL or "20",
                )
            )
        curr += timedelta(days=1)

# ==== FIN: generators/movimientos_gen.py ====

# ==== INICIO: generators/pedidos_gen.py ====

import random
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from ..models import SA1300, SB1300, SC5300, SC6300, SC900
from ..schemas.sc5_schema import SC5_schema
from ..schemas.sc6_schema import SC6_schema

def generate_pedidos(session: Session, start_date: datetime, days: int = 5, n_pedidos: int = 20):
    clientes = session.query(SA1300).all()
    productos = session.query(SB1300).all()
    pedidos, detalles, aprob = [], [], []
    start = start_date

    for n in range(n_pedidos):
        cte = random.choice(clientes)
        num = f"{10500+n:06d}"
        c5 = dict(C5_NUM=num, C5_CLIENTE=cte.A1_COD, C5_LOJACLI=cte.A1_LOJA, C5_EMISSAO=start + timedelta(days=random.randint(0, days)), C5_XTIPO=random.choice(list("158")), C5_MOEDA=random.choice(["1","USD"]))
        pedidos.append(c5)
        for item in range(1, random.randint(2, 4)):
            prod = random.choice(productos)
            qty = (random.uniform(1.0, 50.0) if prod.B1_UM != "LT" else random.uniform(1000.0, 80000.0))
            prc = round(random.uniform(0.5, 250.0), 2)
            val = round(qty * prc, 2)
            detalles.append(dict(C6_NUM=num, C6_ITEM=item, C6_PRODUTO=prod.B1_COD, C6_UM=prod.B1_UM, C6_QTDVEN=qty, C6_PRCVEN=prc, C6_VALOR=val, C6_LOCAL=random.choice(["20","29","55","63","74","90","91"]), C6_LOCDEST=random.choice(["20","29","55","63","74","90","91"]), C6_CLI=cte.A1_COD, C6_LOJA=cte.A1_LOJA, C6_FILIAL="0001"))
            aprob.append(dict(C9_NUM=num, C9_ITEM=item, C9_STATUS=random.choice(["A","A","P"]), C9_QUANT=qty, C9_PRECO=prc, C9_USR="aprobador", C9_DATA=start.date()))

    df_sc5 = pd.DataFrame(pedidos)
    df_sc6 = pd.DataFrame(detalles)
    df_sc9 = pd.DataFrame(aprob)
    SC5_schema.validate(df_sc5); SC6_schema.validate(df_sc6)

    for r in df_sc5.to_dict(orient="records"): session.add(SC5300(**r))
    for r in df_sc6.to_dict(orient="records"): session.add(SC6300(**r))
    for r in df_sc9.to_dict(orient="records"): session.add(SC900(**r))

# ==== FIN: generators/pedidos_gen.py ====

# ==== INICIO: loaders/__init__.py ====
# package

# ==== FIN: loaders/__init__.py ====

# ==== INICIO: loaders/maestros_loader.py ====

from sqlalchemy.orm import Session
from ..generators.maestros_gen import seed_maestros

def load_maestros(session: Session, n_clientes: int = 20):
    seed_maestros(session, n_clientes=n_clientes)

# ==== FIN: loaders/maestros_loader.py ====

# ==== INICIO: loaders/movimientos_loader.py ====
from datetime import date
from sqlalchemy.orm import Session
from ..generators.movimientos_gen import (
    generate_transfer_out_data,
    generate_driver_data,
)


def load_transfers(session: Session, start: date, end: date, pairs_per_day: int = 10):
    generate_transfer_out_data(session, start, end, pairs_per_day=pairs_per_day)


def load_pb7(session: Session, start: date, end: date, deliveries_per_day: int = 12):
    generate_driver_data(session, start, end, deliveries_per_day=deliveries_per_day)

# ==== FIN: loaders/movimientos_loader.py ====

# ==== INICIO: loaders/pedidos_loader.py ====

from datetime import datetime
from sqlalchemy.orm import Session
from ..generators.pedidos_gen import generate_pedidos

def load_pedidos(session: Session, start_date: datetime, days: int = 5, n_pedidos: int = 20):
    generate_pedidos(session, start_date=start_date, days=days, n_pedidos=n_pedidos)

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

