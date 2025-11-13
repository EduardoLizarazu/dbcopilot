/**
 * Join multiple raw information-schema row arrays into one deduplicated array.
 *
 * Input rows must have fields: TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE
 * The result will contain one row per unique tuple (TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE)
 *
 * Usage:
 *   const { joinSchemas } = require('./schema/join-schema');
 *   const merged = joinSchemas(array1, array2, ...);
 */

function _keyForRow(row) {
  if (!row || typeof row !== "object") return null;
  const s = row.TABLE_SCHEMA || "";
  const t = row.TABLE_NAME || "";
  const c = row.COLUMN_NAME || "";
  const d = row.DATA_TYPE || "";
  // Use a delimiter unlikely to appear in names
  return `${s}||${t}||${c}||${d}`;
}

function joinSchemas(schemaArrays) {
  // Accept ONLY a single argument: an array of arrays ([a, b, n]).
  // Example: joinSchemas([array1, array2, array3])
  if (!Array.isArray(schemaArrays)) {
    throw new TypeError(
      "joinSchemas expects a single argument: an array of arrays"
    );
  }

  const seen = new Set();
  const out = [];

  for (const arr of schemaArrays) {
    if (!Array.isArray(arr)) continue; // skip non-arrays inside the top-level array
    for (const row of arr) {
      const key = _keyForRow(row);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      // push a shallow copy to avoid accidental mutations
      out.push(Object.assign({}, row));
    }
  }

  return out;
}

const { schemaV1 } = require("../const/schemav1");

// small test helper (not run automatically)
function joinSchemasTest() {
  try {
    const a = schemaV1.slice(0, 5);
    const b = schemaV1.slice(3, 10);
    const merged = joinSchemas([a, b]);
    console.log(
      "a.length=",
      a.length,
      "b.length=",
      b.length,
      "merged.length=",
      merged.length
    );
    console.log(JSON.stringify(merged, null, 2));
  } catch (err) {
    console.log("joinSchemasTest: cannot run test -", err && err.message);
  }
}

module.exports = { joinSchemas, joinSchemasTest };
