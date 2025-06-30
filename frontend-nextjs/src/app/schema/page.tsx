import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import SchemaDiffView from "@/components/SchemaDiff/SchemaDiffView";

export type Column = {
  name: string;
  type: string;
  status: "added" | "removed" | "modified" | "unchanged";
  context?: string;
};

export type Table = {
  name: string;
  status: "added" | "removed" | "modified" | "unchanged";
  description?: string;
  columns: Column[];
};

export type DiffData = {
  tables: Table[];
};

const SchemaDiffPage = () => {
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiffData = async () => {
      try {
        // Simulating API call to get diff data
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData: DiffData = {
          tables: [
            {
              name: "employees",
              status: "modified",
              description: "Employee information",
              columns: [
                { name: "id", type: "int", status: "unchanged" },
                { name: "name", type: "varchar(100)", status: "unchanged" },
                { name: "salary", type: "decimal(10,2)", status: "modified" },
                { name: "department", type: "varchar(50)", status: "added" },
              ],
            },
            {
              name: "projects",
              status: "added",
              description: "Project information",
              columns: [
                { name: "project_id", type: "int", status: "added" },
                { name: "project_name", type: "varchar(100)", status: "added" },
              ],
            },
            {
              name: "old_contracts",
              status: "removed",
              description: "Old contracts (no longer used)",
              columns: [
                { name: "contract_id", type: "int", status: "removed" },
                {
                  name: "client_name",
                  type: "varchar(100)",
                  status: "removed",
                },
              ],
            },
          ],
        };

        setDiffData(mockData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load schema data");
        setLoading(false);
      }
    };

    fetchDiffData();
  }, []);

  const handleApplyChanges = () => {
    console.log("Applying changes to graph database...");
    // In a real app, this would call your API
    alert("Changes applied successfully!");
  };

  return (
    <>
      <Head>
        <title>Schema Comparison | Database Graph Manager</title>
        <meta
          name="description"
          content="Visualize and manage database schema changes"
        />
      </Head>

      <main className="min-h-screen bg-gray-50 py-8">
        <Container maxWidth="xl">
          <Box className="text-center mb-10">
            <Typography
              variant="h3"
              component="h1"
              className="font-bold text-gray-800 mb-2"
            >
              Schema Comparison
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-gray-600 max-w-3xl mx-auto"
            >
              Visualize differences between your database schema and graph
              representation. Add context, manage changes, and synchronize your
              graph database.
            </Typography>
          </Box>

          {loading ? (
            <Box className="text-center py-12">
              <CircularProgress size={60} className="text-blue-600" />
              <Typography variant="h6" className="mt-4 text-gray-600">
                Analyzing schema differences...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" className="max-w-2xl mx-auto">
              {error}
            </Alert>
          ) : (
            diffData && (
              <SchemaDiffView
                diffData={diffData}
                onApplyChanges={handleApplyChanges}
              />
            )
          )}
        </Container>
      </main>
    </>
  );
};

export default SchemaDiffPage;
