"use client";

import {
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Suspense } from "react";

export function SchemaRelationFormUpdate() {
  return (
    <>
      <Container>
        <Stack spacing={2} direction="column" sx={{ padding: 2 }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Typography variant="h6" gutterBottom>
              <strong>Create Relationship</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {/* font style bold */}
              <strong>Foreign technical table:</strong>{" "}
              {/* {schemaForeign.data?.schemaTable.technicalName || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign alias table:</strong>{" "}
              {/* {schemaForeign.data?.schemaTable.alias || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign technical column:</strong>{" "}
              {/* {schemaForeign.data?.technicalName || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign alias column:</strong>{" "}
              {/* {schemaForeign.data?.alias || "-"} */}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Primary technical table:</strong>{" "}
              {/* {schemaPrimary.data?.schemaTable.technicalName || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary alias table:</strong>{" "}
              {/* {schemaPrimary.data?.schemaTable.alias || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary technical column:</strong>{" "}
              {/* {schemaPrimary.data?.technicalName || "-"} */}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary alias column:</strong>{" "}
              {/* {schemaPrimary.data?.alias || "-"} */}
            </Typography>

            <TextField
              label="Relation description..."
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={5}
              value={""}
              onChange={(e) => {}}
            />
          </Suspense>
          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" color="primary" onClick={() => {}}>
              Update
            </Button>
            <Button variant="contained" color="error" onClick={() => {}}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
