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
