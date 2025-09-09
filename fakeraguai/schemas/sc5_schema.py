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
