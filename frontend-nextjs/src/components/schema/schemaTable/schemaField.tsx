import { TextField } from "@mui/material";

export function SchemaField({
  actionStatus,
  value,
  setSchemaTable,
}: {
  actionStatus: { isEditable: boolean; isSaved: boolean };
  value: string;
  setSchemaTable: React.Dispatch<React.SetStateAction<any>>;
}) {
  console.log("i am schema field");

  return (
    <>
      {actionStatus.isEditable ? (
        <TextField
          defaultValue={value}
          size="small"
          onChange={(e) => {
            if (actionStatus.isSaved) {
              setSchemaTable((prev: any) => ({
                ...prev,
                table_name: e.target.value,
              }));
            }
          }}
          variant="outlined"
        />
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}
