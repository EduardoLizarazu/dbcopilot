const testQuestions = [
  // --- GROUP A: CONCEPTUAL & SYNONYMS (Dense should win) ---
  // 1. Docs use "Productos más vendidos". Dense understands "Best sellers". Sparse might fail.
  "Show me the best sellers list.",

  // 2. Docs use "Ingreso total". Dense understands "Cash flow" or "Money made".
  "How much money came in day by day?",

  // 3. Docs use "Placa" and "Chofer". Dense understands "Trucks and drivers".
  "Information about trucks and drivers.",

  // 4. Docs use "Fecha del pedido" and "Fecha de la factura". Dense understands "Lag time".
  "What is the time delay between ordering and billing?",

  // 5. Docs talk about "Diferencia entre cantidad pedida y facturada". Dense understands "Discrepancies".
  "Are there any discrepancies or mistakes in the quantities?",

  // 6. Docs use "Azucar". Dense connects "Sweetener" to Sugar. Sparse will likely fail.
  "Statistics about the sweetener product.",

  // --- GROUP B: EXACT CODES & ACRONYMS (Sparse should win) ---
  // 7. "SC9300" is a specific code in Doc 21. Dense ignores codes often.
  "Summarize orders based on SC9300 status.",

  // 8. "UM" (Unidad de Medida) is in Doc 16. Dense might think "Um..." is a hesitation or ignore it.
  "Sales breakdown by UM.",

  // 9. "LOJA" is in Doc 20. Dense might confuse it with a generic store concept or a typo.
  "Total sales per LOJA.",

  // 10. Specific amount "10.000 Bs" in Doc 17. Sparse is good at numbers.
  "Clients with low invoice amounts under 10.000.",

  // --- GROUP C: SPECIFIC ENTITIES (Sparse is precise, Dense gets confused) ---
  // 11. "Bagazo". Dense might return "Azucar" or "Alcohol" too because they are similar textually.
  "Show me the movements for Bagazo only.",

  // 12. "Alcohol". Dense often conflates this with other liquids or commodities in the dataset.
  "Show me the movements for Alcohol only.",

  // 13. "Azucar".
  "Show me the movements for Azucar only.",

  // --- GROUP D: NEGATION & LOGIC (Dense struggles here) ---
  // 14. Doc 22 mentions "realizaron pedidos pero no registraron compras".
  "Clients who ordered but did NOT buy anything.",

  // 15. Doc 11 mentions "aprobados pero aún no tienen ninguna factura".
  "Orders that are approved but missing the invoice.",

  // --- GROUP E: DATE & FORMATTING (Testing Precision) ---
  // 16. Docs 13, 14, 15 use "01/01/24". Other docs use "25". Sparse prioritizes the '24'.
  "Data starting from year 2024.",

  // 17. Specific phrase match "Condición de pago" (Doc 8).
  "Details about Condición de pago.",

  // 18. "Estado pendiente" (Doc 4).
  "List orders in Estado pendiente.",

  // --- GROUP F: COMPLEX QUERIES (Hybrid test) ---
  // 19. A mix of concept ("summary") and exact terms ("placa").
  "Summary of trips per placa.",

  // 20. Long tail query.
  "Clients with many orders but very small monetary value.",
];
