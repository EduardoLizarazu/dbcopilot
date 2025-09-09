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
    D3_LOCAL: Mapped[str] = mapped_column(String(6), ForeignKey("NNR300.NNR_COD"))
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
