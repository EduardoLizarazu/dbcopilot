import { TextField } from "@mui/material";

export function SchemaField({
  isEditable,
  value,
}: {
  isEditable: boolean;
  value: string;
}) {
  return (
    <>
      {isEditable ? (
        <TextField
          defaultValue={value}
          size="small"
          onBlur={(e) => {}}
          variant="outlined"
        />
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}
