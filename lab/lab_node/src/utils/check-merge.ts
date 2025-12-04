import { schemaCtx } from "../const/schemaCtx";

type SchemaCtx = typeof schemaCtx;

interface TestResult {
  status: boolean;
  message: string;
}

interface TestResults {
  // 1. Table rename: sc6300 → sc6301
  tableRename: TestResult;

  // 2. Column renames
  columnRename_pb7300: TestResult; // pb7_cliente → pb7_cod_cliente
  columnRename_sd2300: TestResult; // d2_doc → d2_numero_doc

  // 3. Data type changes
  dataTypeChange_pb7300_filial: TestResult; // integer → character varying
  dataTypeChange_sb1300_cod: TestResult; // Rename b1_cod → b1_cod_change + type change
  dataTypeChange_sc6301_id: TestResult; // Rename c6_id → c6_id_change + type change
  dataTypeChange_sc6301_loja: TestResult; // c6_loja type change (integer → character varying)

  // 4. New table creation
  newTable_pb7300_hist: TestResult;

  // 5. Add column
  addColumn_sc6301_obs: TestResult;

  // 6. Drop table
  dropTable_szg300: TestResult;

  // 7. Drop column
  dropColumn_sd3300_estorno: TestResult;
}

export function checkMerge(schemaCtxMerged: SchemaCtx): TestResults {
  const testResults: TestResults = {
    tableRename: { status: false, message: "Not checked" },
    columnRename_pb7300: { status: false, message: "Not checked" },
    columnRename_sd2300: { status: false, message: "Not checked" },
    dataTypeChange_pb7300_filial: { status: false, message: "Not checked" },
    dataTypeChange_sb1300_cod: { status: false, message: "Not checked" },
    dataTypeChange_sc6301_id: { status: false, message: "Not checked" },
    dataTypeChange_sc6301_loja: { status: false, message: "Not checked" },
    newTable_pb7300_hist: { status: false, message: "Not checked" },
    addColumn_sc6301_obs: { status: false, message: "Not checked" },
    dropTable_szg300: { status: false, message: "Not checked" },
    dropColumn_sd3300_estorno: { status: false, message: "Not checked" },
  };

  let pb7300HistProcessed = false;

  for (const schema of schemaCtxMerged) {
    for (const table of schema.tables || []) {
      // Test 1: Check table rename sc6300 → sc6301
      if (table.id === "tmprd.sc6301") {
        testResults.tableRename.status = true;
        testResults.tableRename.message = `✓ Table renamed successfully: ${table.name} (id: ${table.id})`;
      }
      if (table.id === "tmprd.sc6300") {
        testResults.tableRename.status = false;
        testResults.tableRename.message = `✗ Old table name still exists: ${table.name} (id: ${table.id})`;
      }

      // Test 4: Check new table pb7300_hist was created
      if (table.id === "tmprd.pb7300_hist" && !pb7300HistProcessed) {
        pb7300HistProcessed = true;
        testResults.newTable_pb7300_hist.status = true;
        testResults.newTable_pb7300_hist.message = `✓ New table created: ${table.name} (id: ${table.id})`;

        // Verify columns in the new table
        const expectedColumns = [
          "id_hist",
          "pb7_pedido",
          "pb7_sequen",
          "fecha_evento",
          "estado_anterior",
          "estado_nuevo",
          "usuario",
        ];
        const actualColumns = table.columns?.map((c) => c.name) || [];
        const missingColumns = expectedColumns.filter(
          (col) => !actualColumns.includes(col)
        );

        if (missingColumns.length > 0) {
          testResults.newTable_pb7300_hist.status = false;
          testResults.newTable_pb7300_hist.message += ` - Missing columns: ${missingColumns.join(
            ", "
          )}`;
        }
      }

      // Test 6: Check table szg300 was dropped
      if (table.id === "tmprd.szg300") {
        testResults.dropTable_szg300.status = false;
        testResults.dropTable_szg300.message = `✗ Table should be dropped but still exists: ${table.name}`;
      }

      // Check columns
      for (const column of table.columns || []) {
        // Test 2.a: Check column rename in pb7300: pb7_cliente → pb7_cod_cliente
        if (table.id === "tmprd.pb7300") {
          if (column.id === "tmprd.pb7300.pb7_cod_cliente") {
            testResults.columnRename_pb7300.status = true;
            testResults.columnRename_pb7300.message = `✓ Column renamed: ${column.name} (id: ${column.id})`;
          }
          if (column.id === "tmprd.pb7300.pb7_cliente") {
            testResults.columnRename_pb7300.status = false;
            testResults.columnRename_pb7300.message = `✗ Old column name still exists: ${column.name}`;
          }

          // Test 3: Check data type change in pb7_filial
          if (column.name === "pb7_filial") {
            if (column.dataType === "character varying") {
              testResults.dataTypeChange_pb7300_filial.status = true;
              testResults.dataTypeChange_pb7300_filial.message = `✓ Data type changed to character varying for ${column.name}`;
            } else {
              testResults.dataTypeChange_pb7300_filial.status = false;
              testResults.dataTypeChange_pb7300_filial.message = `✗ Data type not changed: ${column.name} is ${column.dataType}`;
            }
          }
        }

        // Test 2.b: Check column rename in sd2300: d2_doc → d2_numero_doc
        if (table.id === "tmprd.sd2300") {
          if (column.id === "tmprd.sd2300.d2_numero_doc") {
            testResults.columnRename_sd2300.status = true;
            testResults.columnRename_sd2300.message = `✓ Column renamed: ${column.name} (id: ${column.id})`;
          }
          if (column.id === "tmprd.sd2300.d2_doc") {
            testResults.columnRename_sd2300.status = false;
            testResults.columnRename_sd2300.message = `✗ Old column name still exists: ${column.name}`;
          }
        }

        // Test 3: Check sb1300 column rename and type change: b1_cod → b1_cod_change
        if (table.id === "tmprd.sb1300") {
          if (column.id === "tmprd.sb1300.b1_cod_change") {
            testResults.dataTypeChange_sb1300_cod.status = true;
            testResults.dataTypeChange_sb1300_cod.message = `✓ Column renamed and type changed: ${column.name} (type: ${column.dataType})`;

            if (column.dataType !== "character varying") {
              testResults.dataTypeChange_sb1300_cod.status = false;
              testResults.dataTypeChange_sb1300_cod.message = `✗ Column renamed but type not changed correctly: ${column.dataType}`;
            }
          }
          if (column.id === "tmprd.sb1300.b1_cod") {
            testResults.dataTypeChange_sb1300_cod.status = false;
            testResults.dataTypeChange_sb1300_cod.message = `✗ Old column name still exists: ${column.name}`;
          }
        }

        // Test 3: Check sc6301 (renamed table) column changes
        if (table.id === "tmprd.sc6301") {
          // Check c6_id → c6_id_change with type change
          if (column.id === "tmprd.sc6301.c6_id_change") {
            testResults.dataTypeChange_sc6301_id.status = true;
            testResults.dataTypeChange_sc6301_id.message = `✓ Column renamed and type changed: ${column.name} (type: ${column.dataType})`;

            if (column.dataType !== "character varying") {
              testResults.dataTypeChange_sc6301_id.status = false;
              testResults.dataTypeChange_sc6301_id.message = `✗ Column renamed but type not changed correctly: ${column.dataType}`;
            }
          }
          if (column.id === "tmprd.sc6301.c6_id") {
            testResults.dataTypeChange_sc6301_id.status = false;
            testResults.dataTypeChange_sc6301_id.message = `✗ Old column name still exists: ${column.name}`;
          }

          // Check c6_loja type change
          if (column.name === "c6_loja") {
            if (column.dataType === "character varying") {
              testResults.dataTypeChange_sc6301_loja.status = true;
              testResults.dataTypeChange_sc6301_loja.message = `✓ Data type changed to character varying for ${column.name}`;
            } else {
              testResults.dataTypeChange_sc6301_loja.status = false;
              testResults.dataTypeChange_sc6301_loja.message = `✗ Data type not changed: ${column.name} is ${column.dataType}`;
            }
          }

          // Test 5: Check column c6_obs was added
          if (column.name === "c6_obs") {
            testResults.addColumn_sc6301_obs.status = true;
            testResults.addColumn_sc6301_obs.message = `✓ Column added: ${column.name} (type: ${column.dataType})`;
          }
        }

        // Test 7: Check sd3300 column d3_estorno was dropped
        if (table.id === "tmprd.sd3300") {
          if (column.name === "d3_estorno") {
            testResults.dropColumn_sd3300_estorno.status = false;
            testResults.dropColumn_sd3300_estorno.message = `✗ Column should be dropped but still exists: ${column.name}`;
          }
        }
      }

      // If sd3300 table exists and we haven't found d3_estorno, it was successfully dropped
      if (
        table.id === "tmprd.sd3300" &&
        !testResults.dropColumn_sd3300_estorno.status
      ) {
        const hasEstorno = table.columns?.some((c) => c.name === "d3_estorno");
        if (
          !hasEstorno &&
          testResults.dropColumn_sd3300_estorno.message === "Not checked"
        ) {
          testResults.dropColumn_sd3300_estorno.status = true;
          testResults.dropColumn_sd3300_estorno.message = `✓ Column d3_estorno successfully dropped`;
        }
      }
    }
  }

  // Final check for dropped table szg300
  const szg300Exists = schemaCtxMerged.some((schema) =>
    schema.tables?.some((table) => table.id === "tmprd.szg300")
  );
  if (!szg300Exists && testResults.dropTable_szg300.message === "Not checked") {
    testResults.dropTable_szg300.status = true;
    testResults.dropTable_szg300.message = `✓ Table szg300 successfully dropped`;
  }

  // Final check for new table pb7300_hist
  const pb7300HistExists = schemaCtxMerged.some((schema) =>
    schema.tables?.some((table) => table.id === "tmprd.pb7300_hist")
  );
  if (
    !pb7300HistExists &&
    testResults.newTable_pb7300_hist.message === "Not checked"
  ) {
    testResults.newTable_pb7300_hist.status = false;
    testResults.newTable_pb7300_hist.message = `✗ New table pb7300_hist not found`;
  }

  // Final check for added column c6_obs
  const sc6301Table = schemaCtxMerged
    .flatMap((s) => s.tables || [])
    .find((t) => t.id === "tmprd.sc6301");
  if (
    sc6301Table &&
    testResults.addColumn_sc6301_obs.message === "Not checked"
  ) {
    const hasC6Obs = sc6301Table.columns?.some((c) => c.name === "c6_obs");
    if (!hasC6Obs) {
      testResults.addColumn_sc6301_obs.status = false;
      testResults.addColumn_sc6301_obs.message = `✗ Column c6_obs not found in sc6301`;
    }
  }

  return testResults;
}

export function printTestResults(results: TestResults): void {
  console.log("\n=== MERGE TEST RESULTS ===\n");

  let passCount = 0;
  let totalCount = 0;

  for (const [testName, result] of Object.entries(results)) {
    totalCount++;
    if (result.status) passCount++;

    const icon = result.status ? "✓" : "✗";
    const status = result.status ? "PASS" : "FAIL";
    console.log(`${icon} [${status}] ${testName}: ${result.message}`);
  }

  console.log(`\n=== SUMMARY: ${passCount}/${totalCount} tests passed ===\n`);
}
