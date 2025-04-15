import React, { Suspense } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Link,
  Typography,
} from "@mui/material";
import { ConnTableHead } from "@/components/connection/connTableHead";
import {
  ReadConnectionAction,
  ReadConnectionOutput,
} from "@/controller/_actions/index.actions";

export default async function ConnectionPage() {
  const connList: ReadConnectionOutput[] = await ReadConnectionAction();
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Connections</Typography>
        <ConnTableHead connData={connList} />
      </Container>
    </Suspense>
  );
}
