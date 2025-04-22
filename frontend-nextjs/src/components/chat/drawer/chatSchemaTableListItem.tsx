import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import {
  Container,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
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
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}
              >
                {schemaTableData.table_alias}
              </Typography>
              {/* If to more than 50 characters cut and add ... to the final */}
              {"  -  "}
              {schemaTableData?.table_description?.length > 40
                ? schemaTableData.table_description.substring(0, 40) + "..."
                : schemaTableData.table_description}
            </>
          }
        />
      </ListItem>
      <Divider component="li" />
    </div>
  );
}
