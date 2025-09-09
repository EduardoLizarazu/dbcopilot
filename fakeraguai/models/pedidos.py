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
    C6_LOCAL: Mapped[str] = mapped_column(String(6), ForeignKey("NNR300.NNR_COD"))
    # Código de almacén de destino (se puede duplicar, no es FK, pero es lo mismo que NNR300.NNR_CODIGO)
    C6_LOCDEST: Mapped[str] = mapped_column(String(6), ForeignKey("NNR300.NNR_COD"))
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
