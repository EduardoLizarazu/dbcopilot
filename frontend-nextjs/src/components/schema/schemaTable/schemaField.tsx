import { TextField } from "@mui/material";

export function SchemaField({
  txtName,
  isEditable,
  value,
  setSchemaTableTemp,
}: {
  txtName: string;
  isEditable: boolean;
  value: string;
  setSchemaTableTemp: React.Dispatch<React.SetStateAction<any>>;
}) {
  function handleTextField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setSchemaTableTemp((prev: any) => ({
      ...prev,
      [txtName]: e.target.value,
    }));
  }

  return (
    <>
      {isEditable ? (
        <TextField
          name={txtName}
          value={value}
          size="small"
          onChange={(e) => handleTextField(e)}
          variant="outlined"
        />
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}
