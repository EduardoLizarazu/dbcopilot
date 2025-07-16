// components/SchemaDiffViewer.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions,
  Button,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

// Define your types (place these in a types.ts file if preferred)
export type SchemaPhysical = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string;
  referenced_table_name: string;
  referenced_column_name: string;
};

export type SchemaContextualized = {
  id_table_schema: number;
  id_table: number;
  id_column: number;
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string;
  referenced_table_name: string;
  referenced_column_name: string;
  id_referenced_table_schema: number;
  id_referenced_table_name: number;
  id_referenced_column_name: number;
};

export type TSchemaDiff = {
  type: "MISMATCH" | "MISSING_IN_CONTEXT" | "MISSING_IN_PHYSICAL";
  table_schema: string;
  table_name: string;
  column_name: string;
  physical_data?: Partial<SchemaPhysical>;
  contextual_data?: Partial<SchemaContextualized>;
  mismatch_details?: string[];
};

type SchemaDiffViewerProps = {
  diffs: TSchemaDiff[];
};

const SchemaDiffViewer: React.FC<SchemaDiffViewerProps> = ({ diffs }) => {
  const getColor = (type: TSchemaDiff["type"]) => {
    switch (type) {
      case "MISMATCH":
        return "bg-yellow-100 border-yellow-500";
      case "MISSING_IN_CONTEXT":
        return "bg-red-100 border-red-500";
      case "MISSING_IN_PHYSICAL":
        return "bg-blue-100 border-blue-500";
      default:
        return "bg-gray-100 border-gray-500";
    }
  };

  const getTitle = (diff: TSchemaDiff) => {
    const location = `${diff.table_schema}.${diff.table_name}.${diff.column_name}`;
    switch (diff.type) {
      case "MISMATCH":
        return `Schema Mismatch: ${location}`;
      case "MISSING_IN_CONTEXT":
        return `Missing in Context: ${location}`;
      case "MISSING_IN_PHYSICAL":
        return `Missing in Physical: ${location}`;
      default:
        return `Schema Difference: ${location}`;
    }
  };

  const renderDataSection = (title: string, data: any) => (
    <div className="mt-3">
      <Typography variant="subtitle2" className="font-bold text-gray-700">
        {title}
      </Typography>
      <List dense className="bg-gray-50 rounded p-2">
        {Object.entries(data).map(([key, value]) => (
          <ListItem key={key} className="py-1">
            <ListItemText
              primary={<span className="font-mono">{key}</span>}
              secondary={value?.toString() || "null"}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <Typography variant="h5" className="mb-4 font-bold text-gray-800">
        Schema Differences ({diffs.length})
      </Typography>

      {diffs.length === 0 ? (
        <Card className="bg-green-50 border border-green-200">
          <CardContent>
            <Typography className="text-green-800 text-center">
              No schema differences detected
            </Typography>
          </CardContent>
        </Card>
      ) : (
        diffs.map((diff, index) => (
          <Card
            key={index}
            className={`border-l-4 ${getColor(diff.type)} rounded-lg shadow-sm`}
          >
            <CardContent>
              <div className="flex justify-between items-start">
                <Typography variant="h6" className="font-semibold">
                  {getTitle(diff)}
                </Typography>
                <Chip
                  label={diff.type.replace(/_/g, " ")}
                  size="small"
                  className={
                    diff.type === "MISMATCH"
                      ? "bg-yellow-500 text-white"
                      : diff.type === "MISSING_IN_CONTEXT"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                  }
                />
              </div>

              {diff.type === "MISMATCH" && diff.mismatch_details && (
                <div className="mt-3">
                  <Typography
                    variant="subtitle2"
                    className="font-bold text-gray-700"
                  >
                    Mismatch Details:
                  </Typography>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {diff.mismatch_details.map((detail, i) => (
                      <li key={i} className="text-sm text-red-600">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {diff.physical_data &&
                  Object.keys(diff.physical_data).length > 0 &&
                  renderDataSection("Physical Schema Data", diff.physical_data)}

                {diff.contextual_data &&
                  Object.keys(diff.contextual_data).length > 0 &&
                  renderDataSection(
                    "Contextual Schema Data",
                    diff.contextual_data
                  )}
              </div>

              {diff.type === "MISMATCH" &&
                diff.mismatch_details &&
                diff.mismatch_details.length > 0 && (
                  <Accordion className="mt-3 shadow-none border">
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2" className="font-bold">
                        Raw Difference Data
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(diff, null, 2)}
                      </pre>
                    </AccordionDetails>
                  </Accordion>
                )}
              <CardActions className="flex justify-start p-4 bg-gray-50 rounded-b-lg">
                <Button
                  variant="contained"
                  className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300
                   bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                   text-white font-semibold py-2 px-4"
                >
                  Apply
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default SchemaDiffViewer;
