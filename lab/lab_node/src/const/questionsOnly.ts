export const testQuestions = [
  // ---------------------------------------------------------
  // GROUP A: DENSE SHOULD WIN (Synonyms & Concepts)
  // The query uses different words than the document.
  // Sparse (Keyword search) will likely FAIL here.
  // ---------------------------------------------------------

  // 1. Doc says "Productos más vendidos".
  // Query uses "Artículos con mayor éxito". Sparse won't find "éxito".
  "¿Cuáles son los artículos con mayor éxito comercial?",

  // 2. Doc says "Placa" and "Chofer".
  // Query uses "Camiones y conductores". Sparse won't match.
  "Información sobre los camiones y sus conductores.",

  // 3. Doc says "Ingreso total facturado".
  // Query uses "Dinero recaudado". Sparse won't match "Dinero" or "Recaudado".
  "¿Cuánto dinero se ha recaudado día tras día?",

  // 4. Doc says "Fecha del pedido" and "Fecha de la factura".
  // Query uses "Demora" (Delay/Lag). Dense understands the concept of time difference.
  "¿Cuál es la demora administrativa entre solicitar y cobrar?",

  // 5. Doc says "Diferencia entre cantidad pedida y facturada".
  // Query uses "Discrepancias" (Discrepancies).
  "¿Existen discrepancias o faltantes en las cantidades?",

  // ---------------------------------------------------------
  // GROUP B: SPARSE SHOULD WIN (Exact Codes & IDs)
  // These contain specific codes or acronyms.
  // Dense models often treat these as "noise" or generic text.
  // ---------------------------------------------------------

  // 6. Doc 21 explicitly mentions "SC9300".
  // Dense might ignore this code or hallucinate. Sparse will lock onto it.
  "Resumen de pedidos según el estado SC9300.",

  // 7. Doc 16 mentions "UM" (Unidad de Medida).
  // "UM" is a very short token. Dense might ignore it.
  "Total vendido desglosado por UM.",

  // 8. Doc 20 mentions "LOJA".
  // This is a specific entity/branch name.
  "Ventas totales por cada LOJA.",

  // 9. Doc 17 mentions specific number "10.000 Bs".
  // Sparse is very good at matching exact numbers.
  "Clientes con montos bajos menores a 10.000.",

  // ---------------------------------------------------------
  // GROUP C: PRECISION TRAPS (Bagazo vs Azucar vs Alcohol)
  // Dense models get confused here because these products appear in similar contexts.
  // Sparse distinguishes them perfectly because the words are different.
  // ---------------------------------------------------------

  // 10. "Bagazo".
  // Dense might show you "Azucar" results because they are semantically related.
  "Mostrar movimientos exclusivamente de Bagazo.",

  // 11. "Alcohol".
  "Mostrar movimientos exclusivamente de Alcohol.",

  // 12. "Azucar".
  "Mostrar movimientos exclusivamente de Azucar.",

  // ---------------------------------------------------------
  // GROUP D: SPECIFIC PHRASING (Hybrid Tests)
  // ---------------------------------------------------------

  // 13. Doc 22: "realizaron pedidos pero no registraron compras".
  // Testing negation and exact phrasing.
  "Clientes que pidieron pero no registraron compras.",

  // 14. Doc 11: "aprobados pero aún no tienen ninguna factura".
  "Números de pedido aprobados sin factura asociada.",

  // 15. Doc 7: "Embarque asociado", "Placa", "Chofer".
  "Pedidos con embarque, placa y chofer asignado.",
  // ---------------------------------------------------------
  // GRUPO E: ESTADOS CONTRADICTORIOS (La trampa semántica clásica)
  // Dense suele confundir estos estados porque aparecen en contextos idénticos.
  // ---------------------------------------------------------

  // 1. Doc: "Pedidos en estado pendiente".
  // Dense puede traer "Aprobados" porque semánticamente son "Estados de pedidos".
  "Listado exclusivo de pedidos en estado pendiente.",

  // 2. Doc: "Pedidos en estado aprobado".
  // Queremos ver si excluye los pendientes.
  "Listado exclusivo de pedidos en estado aprobado.",

  // 3. Doc: "Pendiente de embarcar".
  // Trampa: Dense puede confundir "Pendiente de embarcar" con "Pendiente de aprobación".
  "Productos que están aprobados pero pendiente de embarcar.",

  // 4. Estados SC9300.
  // Sparse buscará el token exacto del estado si existe en tu DB.
  "Pedidos con estado crítico o cancelado.",
  // (Nota: Si "cancelado" no está en tus docs, Sparse dará 0 resultados, lo cual es CORRECTO.
  // Dense podría alucinar y traerte pedidos "rechazados" o "pendientes").

  // ---------------------------------------------------------
  // GRUPO F: BINARIOS Y VARIABLES BOOLEANAS (Activo/Inactivo)
  // "No" y "Sin" son difíciles para Dense embeddings.
  // ---------------------------------------------------------

  // 5. Negación explícita.
  // Dense a veces ignora el "no" y busca "facturas registradas".
  "Pedidos que NO tienen ninguna factura registrada.",

  // 6. Afirmación específica.
  "Pedidos que SÍ tienen embarque asociado.",

  // 7. Diferencias sutiles: "Solicitado" vs "Facturado".
  // Dense ve ambos como "Cantidades del pedido". Sparse distingue las columnas.
  "Diferencia exacta entre cantidad solicitada y facturada.",

  // 8. Búsqueda de errores o faltantes.
  // "Incompleto" o "Faltante" a veces se mezcla con "Pendiente".
  "Registros incompletos o sin chofer asignado.",

  // ---------------------------------------------------------
  // GRUPO G: DETALLES NUMÉRICOS Y FECHAS (Precisión)
  // Dense es terrible con matemáticas y rangos.
  // ---------------------------------------------------------

  // 9. Rango de fechas específico (El modelo denso no 'lee' el calendario).
  "Facturas emitidas únicamente el día 16/02/25.",

  // 10. Cantidades específicas.
  // Dense agrupa "10.000" con cualquier monto de dinero.
  "Clientes con facturación menor a 10.000 Bs.",

  // 11. Otro monto para confundir.
  "Clientes con facturación superior a 100.000 Bs.",

  // 12. "Primer" vs "Último".
  // Conceptos temporales opuestos que Dense agrupa como "Fechas de viaje".
  "¿Cuál fue la última fecha de salida registrada?",

  // 13. "Primera" fecha.
  "¿Cuál fue la primera fecha de salida registrada?",

  // ---------------------------------------------------------
  // GRUPO H: ENTIDADES SIMILARES (La prueba de fuego)
  // Nombres que comparten contexto pero son distintos.
  // ---------------------------------------------------------

  // 14. "Chofer" vs "Cliente".
  // Ambos son personas en el pedido. Dense puede mezclarlos.
  "Listado de nombres de choferes (no clientes).",

  // 15. "Código del cliente" vs "Código del producto".
  "Solo mostrar código del cliente.",

  // 16. "Descripción" vs "Observación".
  // Campos de texto libre.
  "Buscar en la descripción del producto.",

  // ---------------------------------------------------------
  // GRUPO I: JERGA TÉCNICA Y ESTADOS OPERATIVOS
  // ---------------------------------------------------------

  // 17. "Líneas de facturación".
  // Dense puede traer "Líneas de pedido". Son cosas distintas en ERPs.
  "Ver líneas de facturación vacías o inexistentes.",

  // 18. "Condición de pago".
  // Dense puede confundirlo con "Monto de pago".
  "Agrupar por condición de pago.",

  // 19. "Unidad de Medida (UM)".
  // Sparse debe anclarse al token "UM".
  "Totales por Unidad de Medida.",

  // 20. La pregunta "Trampa Final".
  // Mezcla de estado, negación y entidad específica.
  // Dense probablemente colapse aquí. Sparse debería encontrar los tokens clave.
  "Pedidos de Azucar en estado pendiente sin chofer.",
];
