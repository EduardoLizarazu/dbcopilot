import { TextField } from "@mui/material";

export function SchemaField({
  txtName,
  actionStatus,
  value,
  setSchemaTableTemp,
}: {
  txtName: string;
  actionStatus: { isEditable: boolean; isSaved: boolean };
  value: string;
  setSchemaTableTemp: React.Dispatch<React.SetStateAction<any>>;
}) {
  console.log("i am schema field");
  console.log("txt_name", txtName);

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
      {actionStatus.isEditable ? (
        <TextField
          name={txtName}
          defaultValue={value}
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
