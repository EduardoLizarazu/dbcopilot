export const knowledge1: { question: string; query: string }[] = [
  {
    question:
      "¿Cuál es el total de ventas facturadas por cada cliente, mostrando su código y su nombre, considerando únicamente las facturas emitidas entre el 01/01/25 y el 16/02/25, y ordenando los resultados de mayor a menor monto total vendido?",
    query: `SELECT
  f2.F2_CLIENTE        AS cliente_id,
  a1.A1_NOME           AS cliente_nombre,
  SUM(d2.D2_TOTAL)     AS total_venta
FROM TMPRD.SF2300 f2
JOIN TMPRD.SD2300 d2 ON d2.D2_DOC = f2.F2_DOC AND d2.D2_SERIE = f2.F2_SERIE AND d2.D2_LOJA = f2.F2_LOJA
LEFT JOIN TMPRD.SA1300 a1 ON a1.A1_COD = f2.F2_CLIENTE AND a1.A1_LOJA = f2.F2_LOJA
WHERE f2.F2_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
GROUP BY f2.F2_CLIENTE, a1.A1_NOME
ORDER BY total_venta DESC`,
  },
  {
    question:
      "¿Cuáles son los 10 productos más vendidos, mostrando su código, descripción y la cantidad total facturada, considerando únicamente las facturas emitidas entre el 01/01/25 y el 16/02/25, y ordenando los resultados de mayor a menor cantidad vendida?",
    query: `SELECT
  d2.D2_COD             AS producto_id,
  b1.B1_DESC            AS producto_desc,
  SUM(d2.D2_QUANT)      AS cantidad_total
FROM TMPRD.SD2300 d2
LEFT JOIN TMPRD.SB1300 b1 ON b1.B1_COD = d2.D2_COD
JOIN TMPRD.SF2300 f2 ON f2.F2_DOC = d2.D2_DOC AND f2.F2_SERIE = d2.D2_SERIE AND f2.F2_LOJA = d2.D2_LOJA
WHERE f2.F2_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
GROUP BY d2.D2_COD, b1.B1_DESC
ORDER BY cantidad_total DESC
FETCH FIRST 10 ROWS ONLY`,
  },
  {
    question:
      "¿Cuál fue el ingreso total facturado por día, mostrando la fecha y la suma del monto de todas las facturas emitidas entre el 01/01/25 y el 16/02/25, ordenando los resultados cronológicamente?",
    query: `SELECT
  f2.F2_EMISSAO                       AS fecha,
  SUM(d2.D2_TOTAL)                    AS ingreso_dia
FROM TMPRD.SF2300 f2
JOIN TMPRD.SD2300 d2 ON d2.D2_DOC = f2.F2_DOC AND d2.D2_SERIE = f2.F2_SERIE AND d2.D2_LOJA = f2.F2_LOJA
WHERE f2.F2_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
GROUP BY f2.F2_EMISSAO
ORDER BY fecha`,
  },
  {
    question:
      "¿Qué pedidos se encuentran en estado pendiente, mostrando el número de pedido, el código del cliente y el nombre del cliente asociado?",
    query: `SELECT
  c9.C9_PEDIDO        AS pedido,
  c9.C9_CLIENTE       AS cliente_id,
  a1.A1_NOME          AS cliente_nombre,
  c9.C9_STATUS        AS estado
FROM TMPRD.SC9300 c9
LEFT JOIN TMPRD.SA1300 a1 ON a1.A1_COD = c9.C9_CLIENTE
WHERE c9.C9_STATUS = 'P'`,
  },
  {
    question:
      "¿Qué pedidos se encuentran en estado aprobado, mostrando el número de pedido, el código del cliente y el nombre del cliente asociado?",
    query: `SELECT
  c9.C9_PEDIDO        AS pedido,
  c9.C9_CLIENTE       AS cliente_id,
  a1.A1_NOME          AS cliente_nombre,
  c9.C9_STATUS        AS estado
FROM TMPRD.SC9300 c9
LEFT JOIN TMPRD.SA1300 a1 ON a1.A1_COD = c9.C9_CLIENTE
WHERE c9.C9_STATUS = 'A'`,
  },
  {
    question:
      "¿Podés mostrarme el detalle de todos los pedidos emitidos entre el 01/01/25 y el 16/02/25, incluyendo el número de pedido, el código y nombre del cliente, el código y la descripción de cada producto solicitado, la cantidad pedida y el estado de aprobación correspondiente a cada ítem?",
    query: `SELECT
  c5.C5_NUM                     AS pedido,
  c5.C5_CLIENTE                 AS cliente_id,
  a1.A1_NOME                    AS cliente_nombre,
  c6.C6_PRODUTO                 AS producto_id,
  b1.B1_DESC                    AS producto_desc,
  c6.C6_QTDVEN                  AS cant_pedida,
  c9.C9_STATUS                  AS estado_aprob
FROM TMPRD.SC5300 c5
JOIN TMPRD.SC6300 c6 ON c6.C6_NUM = c5.C5_NUM AND c6.C6_LOJA = c5.C5_LOJACLI
LEFT JOIN TMPRD.SC9300 c9 ON c9.C9_PEDIDO = c5.C5_NUM AND c9.C9_ITEM = c6.C6_ITEM
LEFT JOIN TMPRD.SA1300 a1 ON a1.A1_COD = c5.C5_CLIENTE
LEFT JOIN TMPRD.SB1300 b1 ON b1.B1_COD = c6.C6_PRODUTO
WHERE c5.C5_EMISSAO BETWEEN '01/01/25' AND '16/02/25'`,
  },
  {
    question:
      "¿Cuáles son los pedidos emitidos entre el 01/01/25 y el 16/02/25 que ya tienen un embarque asociado, mostrando el número de pedido junto con la placa del vehículo, el nombre del chofer y la fecha de salida registrada para cada uno?",
    query: `SELECT
  c5.C5_NUM             AS pedido,
  pb.PB7_PLACA          AS placa,
  pb.PB7_CHOFER         AS chofer,
  pb.PB7_DSAIDA         AS fecha_salida
FROM TMPRD.SC5300 c5
JOIN TMPRD.PB7300 pb ON pb.PB7_PEDIDO = c5.C5_NUM
WHERE c5.C5_EMISSAO BETWEEN '01/01/25' AND '16/02/25'`,
  },
  {
    question:
      "¿Podés mostrarme un resumen de las facturas emitidas entre el 01/01/25 y el 16/02/25 agrupadas por condición de pago, indicando el código y la descripción de la condición, la cantidad total de facturas asociadas y el importe total facturado en cada una, ordenado de mayor a menor importe?",
    query: `SELECT
  e4.E4_CODIGO                   AS cond_pago,
  e4.E4_DESCRI                   AS cond_desc,
  COUNT(*)                       AS facturas,
  SUM(d2.D2_TOTAL)               AS importe_total
FROM TMPRD.SF2300 f2
LEFT JOIN TMPRD.SE4300 e4 ON e4.E4_CODIGO = f2.F2_COND
JOIN TMPRD.SD2300 d2 ON d2.D2_DOC = f2.F2_DOC AND d2.D2_SERIE = f2.F2_SERIE AND d2.D2_LOJA = f2.F2_LOJA
WHERE f2.F2_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
GROUP BY e4.E4_CODIGO, e4.E4_DESCRI
ORDER BY importe_total DESC`,
  },
  {
    question:
      "¿Cuáles son los productos vendidos en los pedidos emitidos entre el 01/01/25 y el 16/02/25 y cuál es su precio promedio de venta, mostrando el código del producto, su descripción y el precio promedio calculado, ordenado de mayor a menor precio?",
    query: `SELECT
  c6.C6_PRODUTO                AS producto_id,
  b1.B1_DESC                   AS producto_desc,
  AVG(c6.C6_PRCVEN)            AS precio_promedio
FROM TMPRD.SC6300 c6
LEFT JOIN TMPRD.SB1300 b1 ON b1.B1_COD = c6.C6_PRODUTO
WHERE c6.C6_NUM IN (
  SELECT c5.C5_NUM FROM TMPRD.SC5300 c5
  WHERE c5.C5_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
)
GROUP BY c6.C6_PRODUTO, b1.B1_DESC
ORDER BY precio_promedio DESC`,
  },
  {
    question:
      "¿Podés mostrar la diferencia entre la cantidad pedida y la cantidad facturada de cada producto en los pedidos emitidos entre el 01/01/25 y el 16/02/25, indicando el código del producto, su descripción, la cantidad total solicitada, la cantidad total facturada y la diferencia resultante, ordenando los resultados de mayor a menor diferencia?",
    query: `SELECT
  COALESCE(ped.prod, fac.prod) AS producto_id,
  b1.B1_DESC                   AS producto_desc,
  NVL(ped.cant_pedida, 0)      AS cant_pedida,
  NVL(fac.cant_facturada, 0)   AS cant_facturada,
  NVL(ped.cant_pedida, 0) - NVL(fac.cant_facturada, 0) AS diferencia
FROM (
  SELECT 
    c6.C6_PRODUTO AS prod,
    SUM(c6.C6_QTDVEN) AS cant_pedida
  FROM TMPRD.SC6300 c6
  JOIN TMPRD.SC5300 c5 
    ON c5.C5_NUM = c6.C6_NUM 
   AND c5.C5_LOJACLI = c6.C6_LOJA
  WHERE c5.C5_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
  GROUP BY c6.C6_PRODUTO
) ped
FULL OUTER JOIN (
  SELECT 
    d2.D2_COD AS prod,
    SUM(d2.D2_QUANT) AS cant_facturada
  FROM TMPRD.SD2300 d2
  JOIN TMPRD.SF2300 f2 
    ON f2.F2_DOC = d2.D2_DOC 
   AND f2.F2_SERIE = d2.D2_SERIE 
   AND f2.F2_LOJA = d2.D2_LOJA
  WHERE f2.F2_EMISSAO BETWEEN '01/01/25' AND '16/02/25'
  GROUP BY d2.D2_COD
) fac
  ON fac.prod = ped.prod
LEFT JOIN TMPRD.SB1300 b1 
  ON b1.B1_COD = COALESCE(ped.prod, fac.prod)
ORDER BY diferencia DESC`,
  },
  {
    question:
      "¿Cuáles son los números de pedido que ya están aprobados pero aún no tienen ninguna factura registrada (es decir, no existen líneas de facturación asociadas)?",
    query: `SELECT DISTINCT
  c9.C9_PEDIDO AS pedido
FROM TMPRD.SC9300 c9
WHERE c9.C9_STATUS = 'A'
AND NOT EXISTS (
  SELECT 1
  FROM TMPRD.SF2300 f2
  JOIN TMPRD.SD2300 d2 ON d2.D2_DOC = f2.F2_DOC AND d2.D2_SERIE = f2.F2_SERIE AND d2.D2_LOJA = f2.F2_LOJA
  WHERE d2.D2_PEDIDO = c9.C9_PEDIDO
)`,
  },
  {
    question:
      "¿Cuántos viajes realizó cada placa y cuáles fueron su primera y última fecha de salida entre el 01/01/25 y el 16/02/25, ordenando de mayor a menor cantidad de viajes?",
    query: `SELECT
  pb.PB7_PLACA       AS placa,
  COUNT(*)           AS viajes,
  MIN(pb.PB7_DSAIDA) AS primera_salida,
  MAX(pb.PB7_DSAIDA) AS ultima_salida
FROM TMPRD.PB7300 pb
WHERE pb.PB7_DSAIDA BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY pb.PB7_PLACA
ORDER BY viajes DESC`,
  },
  {
    question:
      "Para el producto de alcohol, ¿cuánta cantidad total se movió por día entre el 01/01/24 y el 16/02/25, mostrando la fecha y la cantidad, en orden cronológico?",
    query: `SELECT
  d3.D3_EMISSAO    AS fecha,
  SUM(d3.D3_QUANT) AS cantidad_movida
FROM TMPRD.SD3300 d3
WHERE d3.D3_COD LIKE 'PA01%'
 AND d3.D3_EMISSAO BETWEEN TO_DATE('01/01/24','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY d3.D3_EMISSAO
ORDER BY fecha`,
  },
  {
    question:
      "Para el producto de azucar, ¿cuánta cantidad total se movió por día entre el 01/01/24 y el 16/02/25, mostrando la fecha y la cantidad, en orden cronológico?",
    query: `SELECT
  d3.D3_EMISSAO    AS fecha,
  SUM(d3.D3_QUANT) AS cantidad_movida
FROM TMPRD.SD3300 d3
WHERE d3.D3_COD LIKE 'PA02%'
 AND d3.D3_EMISSAO BETWEEN TO_DATE('01/01/24','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY d3.D3_EMISSAO
ORDER BY fecha`,
  },
  {
    question:
      "Para el producto de bagazo, ¿cuánta cantidad total se movió por día entre el 01/01/24 y el 16/02/25, mostrando la fecha y la cantidad, en orden cronológico?",
    query: `SELECT
  d3.D3_EMISSAO    AS fecha,
  SUM(d3.D3_QUANT) AS cantidad_movida
FROM TMPRD.SD3300 d3
WHERE d3.D3_COD LIKE 'PA03%'
 AND d3.D3_EMISSAO BETWEEN TO_DATE('01/01/24','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY d3.D3_EMISSAO
ORDER BY fecha`,
  },
  {
    question:
      "Entre el 01/01/25 y el 16/02/25, ¿cuál es el total vendido por unidad de medida (UM), mostrando cantidad total e importe total, ordenado por mayor importe?",
    query: `SELECT
  d2.D2_UM          AS unidad_medida,
  SUM(d2.D2_QUANT)  AS cantidad_total,
  SUM(d2.D2_TOTAL)  AS importe_total
FROM TMPRD.SD2300 d2
JOIN TMPRD.SF2300 f2
  ON f2.F2_DOC = d2.D2_DOC
 AND f2.F2_SERIE = d2.D2_SERIE
 AND f2.F2_LOJA = d2.D2_LOJA
WHERE f2.F2_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY d2.D2_UM
ORDER BY importe_total DESC`,
  },
  {
    question:
      "Entre el 01/01/25 y el 16/02/25, ¿qué clientes tienen muchos pedidos emitidos pero bajo monto facturado de 10.000 Bs., mostrando cliente, nombre, numero de pedidos y monto facturado, ordenado por más pedidos y menor monto?",
    query: `SELECT
  p.cliente,
  a1.A1_NOME                  AS cliente_nombre,
  p.n_pedidos,
  NVL(f.monto, 0)             AS monto_facturado
FROM (
  SELECT c5.C5_CLIENTE AS cliente, COUNT(DISTINCT c5.C5_NUM) AS n_pedidos
  FROM TMPRD.SC5300 c5
  WHERE c5.C5_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
  GROUP BY c5.C5_CLIENTE
) p
LEFT JOIN (
  SELECT f2.F2_CLIENTE AS cliente, SUM(d2.D2_TOTAL) AS monto
  FROM TMPRD.SF2300 f2
  JOIN TMPRD.SD2300 d2
    ON d2.D2_DOC = f2.F2_DOC
   AND d2.D2_SERIE = f2.F2_SERIE
   AND d2.D2_LOJA = f2.F2_LOJA
  WHERE f2.F2_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
  GROUP BY f2.F2_CLIENTE
) f
  ON f.cliente = p.cliente
LEFT JOIN TMPRD.SA1300 a1
  ON a1.A1_COD = p.cliente
WHERE NVL(f.monto, 0) < 10000
ORDER BY p.n_pedidos DESC, monto_facturado ASC`,
  },
  {
    question:
      "Entre el 01/01/25 y el 16/02/25, por producto, ¿cuánto se pidió vs. cuánto tiene embarque asociado, y cuánta cantidad queda pendiente de embarcar, ordenado por mayor pendiente?",
    query: `SELECT
  c6.C6_PRODUTO                               AS producto_id,
  b1.B1_DESC                                  AS producto_desc,
  SUM(c6.C6_QTDVEN)                           AS cant_pedida,
  SUM(NVL(entregado.cant, 0))                 AS cant_embarcada,
  SUM(c6.C6_QTDVEN) - SUM(NVL(entregado.cant,0)) AS pendiente_embarque
FROM TMPRD.SC6300 c6
JOIN TMPRD.SC5300 c5 ON c5.C5_NUM = c6.C6_NUM
LEFT JOIN (
  SELECT pb.PB7_PEDIDO AS pedido, COUNT(*) AS cant
  FROM TMPRD.PB7300 pb
  GROUP BY pb.PB7_PEDIDO
) entregado ON entregado.pedido = c6.C6_NUM
LEFT JOIN TMPRD.SB1300 b1 ON b1.B1_COD = c6.C6_PRODUTO
WHERE c5.C5_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY c6.C6_PRODUTO, b1.B1_DESC
HAVING SUM(c6.C6_QTDVEN) - SUM(NVL(entregado.cant,0)) > 0
ORDER BY pendiente_embarque DESC`,
  },
  {
    question:
      "¿Cuál es el promedio de días entre la fecha del pedido y la fecha de la factura por cliente, considerando pedidos y facturas dentro del 01/01/25 al 16/02/25, ordenado por ese promedio?",
    query: `SELECT
  ped.C5_CLIENTE                                   AS cliente_id,
  a1.A1_NOME                                       AS cliente_nombre,
  AVG(fac.fecha_factura - ped.fecha_pedido)        AS dias_promedio
FROM (
  SELECT C5_NUM, C5_CLIENTE, MIN(C5_EMISSAO) AS fecha_pedido
  FROM TMPRD.SC5300
  WHERE C5_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
  GROUP BY C5_NUM, C5_CLIENTE
) ped
JOIN (
  SELECT d2.D2_PEDIDO, MIN(f2.F2_EMISSAO) AS fecha_factura
  FROM TMPRD.SD2300 d2
  JOIN TMPRD.SF2300 f2
    ON f2.F2_DOC = d2.D2_DOC
   AND f2.F2_SERIE = d2.D2_SERIE
   AND f2.F2_LOJA = d2.D2_LOJA
  WHERE f2.F2_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
  GROUP BY d2.D2_PEDIDO
) fac
  ON fac.D2_PEDIDO = ped.C5_NUM
LEFT JOIN TMPRD.SA1300 a1
  ON a1.A1_COD = ped.C5_CLIENTE
GROUP BY ped.C5_CLIENTE, a1.A1_NOME
ORDER BY dias_promedio`,
  },
  {
    question:
      "Entre el 01/01/25 y el 16/02/25, ¿cuál es el total vendido por cada LOJA/filial, ordenado de mayor a menor?",
    query: `SELECT
  f2.F2_LOJA       AS loja,
  SUM(d2.D2_TOTAL) AS total_venta
FROM TMPRD.SF2300 f2
JOIN TMPRD.SD2300 d2
  ON d2.D2_DOC = f2.F2_DOC
 AND d2.D2_SERIE = f2.F2_SERIE
 AND d2.D2_LOJA = f2.F2_LOJA
WHERE f2.F2_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
GROUP BY f2.F2_LOJA
ORDER BY total_venta DESC`,
  },
  {
    question:
      "¿Cuántos pedidos hay por cada estado de aprobación (según SC9300), ordenados por la mayor cantidad?",
    query: `SELECT
  c9.C9_STATUS                    AS estado,
  COUNT(DISTINCT c9.C9_PEDIDO)    AS pedidos
FROM TMPRD.SC9300 c9
GROUP BY c9.C9_STATUS
ORDER BY pedidos DESC`,
  },
  {
    question:
      "Entre el 01/01/25 y el 16/02/25, ¿qué clientes realizaron pedidos pero no registraron compras (facturas) en ese mismo período, mostrando el código y nombre del cliente?",
    query: `SELECT
  cp.cliente,
  a1.A1_NOME AS cliente_nombre
FROM (
  SELECT DISTINCT c5.C5_CLIENTE AS cliente
  FROM TMPRD.SC5300 c5
  WHERE c5.C5_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
) cp
LEFT JOIN (
  SELECT DISTINCT f2.F2_CLIENTE AS cliente
  FROM TMPRD.SF2300 f2
  WHERE f2.F2_EMISSAO BETWEEN TO_DATE('01/01/25','DD/MM/RR') AND TO_DATE('16/02/25','DD/MM/RR')
) cf
  ON cf.cliente = cp.cliente
LEFT JOIN TMPRD.SA1300 a1
  ON a1.A1_COD = cp.cliente
WHERE cf.cliente IS NULL`,
  },
];
