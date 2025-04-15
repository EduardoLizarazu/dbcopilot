import { IconButton, Stack, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/VpnKey"; // Assuming KeyIcon corresponds to VpnKey

export function SchemaColumnKeyType({
  pk,
  fk,
}: {
  pk: { is_primary_key: boolean; is_static: boolean };
  fk: { is_foreign_key: boolean; is_static: boolean };
}) {
  return (
    <Stack direction="column" alignItems="center">
      {pk.is_primary_key && (
        <Tooltip title="primary key" placement="left">
          <IconButton
            aria-label="primary key"
            size="small"
            onClick={() => console.log("primary key")}
            loading={false}
          >
            <KeyIcon
              fontSize="inherit"
              style={{
                color: "gold",
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {fk.is_foreign_key && (
        <Tooltip title="foreign key" placement="left">
          <IconButton
            aria-label="foreign key"
            size="small"
            onClick={() => console.log("foreign key")}
            loading={false}
          >
            <KeyIcon
              fontSize="inherit"
              style={{
                color: "purple",
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
