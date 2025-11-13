const { MetadataGraph, MetadataGraphTest } = require("./graph/metadata-graph");
const {
  IdMetadataGraph,
  IdMetadataGraphTest,
} = require("./graph/id-metadata-graph");
const {
  mapRawSchemaToOrganizationSchema,
  rowSchemaToOrganizationSchemaTest,
} = require("./mapper/row-schema-to-orginize-schema");

const {
  mapOrganizationSchemaToRawRows,
  organizeSchemaToRawSchemaTest,
} = require("./mapper/organize-schema-to-raw-schema");

const {
  buildGraphFromSchemaV2,
  buildGraphFromSchemaV2Test,
} = require("./schema/schema-graph-builder");

const {
  compareSchemas,
  schemaStatus,
  compareSchemasTest,
} = require("./schema/compare-schema");

const { joinSchemas, joinSchemasTest } = require("./schema/join-schema");

function main() {
  //   MetadataGraphTest();
  //   IdMetadataGraphTest();
  //   rowSchemaToOrganizationSchemaTest();
  //   joinSchemasTest();
  organizeSchemaToRawSchemaTest();
  //   compareSchemasTest();
  //   buildGraphFromSchemaV2Test();
}

main();
