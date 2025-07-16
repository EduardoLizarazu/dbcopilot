// pages/schema-diff.tsx
import React from "react";
import SchemaDiffViewer from "@components/schema/schemaDiff";
import { TSchemaDiff } from "@components/schema/schemaDiff";

const SchemaDiffPage: React.FC = () => {
  // This would come from your actual comparison logic
  const diffs: TSchemaDiff[] = [
    {
      type: "MISMATCH",
      table_schema: "public",
      table_name: "users",
      column_name: "email",
      physical_data: {
        data_type: "varchar(255)",
        is_primary_key: false,
      },
      contextual_data: {
        data_type: "text",
        is_primary_key: true,
      },
      mismatch_details: [
        "data_type mismatch (physical: varchar(255), contextual: text)",
        "is_primary_key mismatch (physical: false, contextual: true)",
      ],
    },
    {
      type: "MISSING_IN_CONTEXT",
      table_schema: "public",
      table_name: "users",
      column_name: "age",
      physical_data: {
        data_type: "integer",
        is_primary_key: false,
        is_foreign_key: false,
      },
    },
    {
      type: "MISSING_IN_PHYSICAL",
      table_schema: "public",
      table_name: "users",
      column_name: "last_login",
      contextual_data: {
        data_type: "timestamp",
        is_primary_key: false,
        id_column: 145,
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Schema Comparison Results
      </h1>
      <SchemaDiffViewer diffs={diffs} />
    </div>
  );
};

export default SchemaDiffPage;
