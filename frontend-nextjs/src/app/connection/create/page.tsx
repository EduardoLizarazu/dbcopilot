import React from "react";
import { CircularProgress, Container, Typography } from "@mui/material";

export default function CreateConnectionPage() {
  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connName, setConnName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [databaseType, setDatabaseType] = React.useState<string>("");
  const [host, setHost] = React.useState<string>("");
  const [port, setPort] = React.useState<number>(0);
  const [databaseName, setDatabaseName] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  
  // USE EFFECT
  React.useEffect(() => {
    (async () => {
      setLoading(true);

      // Fetch data here

      setLoading(false);
    })();
  }, []);

  // HANDLERS


  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Create Connection</Typography>

    </Container>
  );
}
