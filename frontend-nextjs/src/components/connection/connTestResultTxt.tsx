"use client";
import React, { Suspense } from "react";
import { Container, Typography } from "@mui/material";
import { TestConnectionActionByConnId } from "@/controller/_actions/index.actions";

type ConnTestResultTxtProps = {
  connId: number;
};

export function ConnTestResultTxt({ connId }: ConnTestResultTxtProps) {
  const [connTestResult, setConnTestResult] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const res = await TestConnectionActionByConnId(connId);
      if (res.status === 200 || res.status === 201) {
        setConnTestResult(true);
      } else {
        setConnTestResult(false);
      }
    })();
  }, []);

  return (
    <>
      <Container>
        <Suspense
          fallback={<Typography variant="body1">Loading...</Typography>}
        >
          {connTestResult ? (
            <Typography variant="body1" gutterBottom color="success">
              Connected successfully to the database.
            </Typography>
          ) : (
            <Typography variant="body1" gutterBottom color="error">
              Unable to connected to the database.
            </Typography>
          )}
        </Suspense>
      </Container>
    </>
  );
}
