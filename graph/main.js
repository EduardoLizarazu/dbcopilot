const { MetadataGraph, MetadataGraphTest } = require("./graph/metadata-graph");
const {
  IdMetadataGraph,
  IdMetadataGraphTest,
} = require("./graph/id-metadata-graph");
const {
  rowSchemaToOrganizationSchemaTest,
} = require("./mapper/row-schema-to-orginize-schema");

function main() {
  //   MetadataGraphTest();
  IdMetadataGraphTest();
  //   rowSchemaToOrganizationSchemaTest();
}

main();
