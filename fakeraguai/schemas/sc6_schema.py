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
