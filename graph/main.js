const MetadataGraphTest = require("./graph/metadata-graph");
const IdMetadataGraphTest = require("./graph/id-metadata-graph");
const {
  rowSchemaToOrganizationSchemaTest,
} = require("./mapper/row-schema-to-orginize-schema");

function main() {
  //   MetadataGraphTest();
  //   IdMetadataGraphTest();
  rowSchemaToOrganizationSchemaTest();
}

main();
