import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import {
  Container,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

type TChatSchemaTableListItemProps = {
  schemaTableData: ISchemaTable;
};

export function ChatSchemaTableListItem({
  schemaTableData,
}: TChatSchemaTableListItemProps) {
  return (
    <div>
      <ListItem
        alignItems="flex-start"
        disableGutters
        secondaryAction={
          <IconButton aria-label="comment" onClick={() => {}}>
            <ArrowRightAltIcon />
          </IconButton>
        }
      >
        <ListItemText
          sx={{ marginLeft: "10px" }}
          primary={schemaTableData.table_name}
          secondary={
            <>
              <span style={{ fontWeight: "bold" }}>
                {schemaTableData.table_description}
              </span>
            </>
          }
        />
      </ListItem>
      <Divider component="li" />
    </div>
  );
}
