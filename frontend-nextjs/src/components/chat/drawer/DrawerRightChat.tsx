import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { ChatStoryList } from "./history/chatStoryList2";
import { IconButton, Tab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { SchemaDrawer } from "./schema/SchemaDrawer";

type TDrawerRightChatProps = {
  setSelectConversation: React.Dispatch<React.SetStateAction<string>>;
  setIsResetHf: React.Dispatch<React.SetStateAction<boolean>>;
  handleResetBySelectedHistoryPrompt: () => void;
};

export function DrawerRightChat({
  setSelectConversation,
  setIsResetHf,
  handleResetBySelectedHistoryPrompt,
}: TDrawerRightChatProps) {
  const [open, setOpen] = React.useState(false);

  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const tables = [
    {
      table_description:
        "Stores employee details for Northwind Traders, including personal information, work roles, and hierarchical reporting.",
      table_name: "employees",
      columns: [
        {
          column_type: "TEXT",
          column_alias: "location",
          column_key_type: "None",
          column_name: "address",
          column_description:
            "Physical address of the customer’s business or location.",
          column_neo4j_id: 0,
        },
        {
          column_type: "DATE",
          column_alias: "dob",
          column_key_type: "None",
          column_name: "birth_date",
          column_description: "Employee’s date of birth.",
          column_neo4j_id: 14,
        },
        {
          column_type: "TEXT",
          column_alias: "city_name",
          column_key_type: "None",
          column_name: "city",
          column_description: "City where the customer is based.",
          column_neo4j_id: 1,
        },
        {
          column_type: "TEXT",
          column_alias: "nation",
          column_key_type: "None",
          column_name: "country",
          column_description: "Country where the customer is located.",
          column_neo4j_id: 4,
        },
        {
          column_type: "INTEGER",
          column_alias: "employeeId",
          column_key_type: "Foreign Key",
          column_name: "employee_id",
          column_description:
            "The unique identifier of the employee who took or processed this order. Links to the `employees` table.",
          column_neo4j_id: 9,
        },
        {
          column_type: "TEXT",
          column_alias: "ext",
          column_key_type: "None",
          column_name: "extension",
          column_description: "Phone extension number.",
          column_neo4j_id: 17,
        },
        {
          column_type: "TEXT",
          column_alias: "given_name",
          column_key_type: "None",
          column_name: "first_name",
          column_description: "Employee’s first name.",
          column_neo4j_id: 11,
        },
        {
          column_type: "DATE",
          column_alias: "start_date",
          column_key_type: "None",
          column_name: "hire_date",
          column_description: "Date the employee was hired.",
          column_neo4j_id: 15,
        },
        {
          column_type: "TEXT",
          column_alias: "phone_number",
          column_key_type: "None",
          column_name: "home_phone",
          column_description: "Employee’s home phone number.",
          column_neo4j_id: 16,
        },
        {
          column_type: "TEXT",
          column_alias: "surname",
          column_key_type: "None",
          column_name: "last_name",
          column_description: "Employee’s last name.",
          column_neo4j_id: 10,
        },
        {
          column_type: "TEXT",
          column_alias: "remarks",
          column_key_type: "None",
          column_name: "notes",
          column_description:
            "Additional remarks or notes related to the employee.",
          column_neo4j_id: 19,
        },
        {
          column_type: "BLOB",
          column_alias: "profile_image",
          column_key_type: "None",
          column_name: "photo",
          column_description:
            "Binary image data of the employee’s profile photo.",
          column_neo4j_id: 18,
        },
        {
          column_type: "TEXT",
          column_alias: "image_url",
          column_key_type: "None",
          column_name: "photo_path",
          column_description:
            "File path or URL linking to the employee’s photo.",
          column_neo4j_id: 21,
        },
        {
          column_type: "TEXT",
          column_alias: "zip_code",
          column_key_type: "None",
          column_name: "postal_code",
          column_description: "Postal code of the customer’s location.",
          column_neo4j_id: 3,
        },
        {
          column_type: "TEXT",
          column_alias: "state_province",
          column_key_type: "None",
          column_name: "region",
          column_description:
            "Region or state where the customer operates (if applicable).",
          column_neo4j_id: 2,
        },
        {
          column_type: "INTEGER",
          column_alias: "manager_id",
          column_key_type: "Foreign Key",
          column_name: "reports_to",
          column_description: "The employee’s direct manager or supervisor.",
          column_neo4j_id: 20,
        },
        {
          column_type: "TEXT",
          column_alias: "job_role",
          column_key_type: "None",
          column_name: "title",
          column_description: "Job title or position held by the employee.",
          column_neo4j_id: 12,
        },
        {
          column_type: "TEXT",
          column_alias: "courtesy_title",
          column_key_type: "None",
          column_name: "title_of_courtesy",
          column_description: 'Courtesy title such as "Mr.", "Ms.", or "Dr.".',
          column_neo4j_id: 13,
        },
      ],
      table_alias: "employee",
      table_neo4j_id: 8,
    },
    {
      table_description:
        "Stores detailed information on individual sales transactions between customers and the company, tracking purchased products, prices, quantities, and discounts.",
      table_name: "order_details",
      columns: [
        {
          column_type: "REAL",
          column_alias: "price_reduction",
          column_key_type: "None",
          column_name: "discount",
          column_description:
            "Discount applied to the product in the transaction.",
          column_neo4j_id: 32,
        },
        {
          column_type: "INTEGER",
          column_alias: "orderId",
          column_key_type: "Primary Key",
          column_name: "order_id",
          column_description:
            "A unique identifier for each sales order. This is the primary key for the Orders table and is referenced by the Order Details table.",
          column_neo4j_id: 30,
        },
        {
          column_type: "INTEGER",
          column_alias: "product",
          column_key_type: "Primary Key, Foreign Key",
          column_name: "product_id",
          column_description: "Unique identifier for the product in the order.",
          column_neo4j_id: 64,
        },
        {
          column_type: "INTEGER",
          column_alias: "amount",
          column_key_type: "None",
          column_name: "quantity",
          column_description: "Quantity of the product ordered.",
          column_neo4j_id: 31,
        },
        {
          column_type: "NUMERIC",
          column_alias: "price_per_unit",
          column_key_type: "None",
          column_name: "unit_price",
          column_description:
            "Price per unit of the product at the time of purchase.",
          column_neo4j_id: 68,
        },
      ],
      table_alias: "order_detail",
      table_neo4j_id: 29,
    },
    {
      table_description:
        "Defines geographical areas, each belonging to a specific region. Used to associate employees with locations.",
      table_name: "territories",
      columns: [
        {
          column_type: "INTEGER",
          column_alias: "id",
          column_key_type: "Primary Key",
          column_name: "region_id",
          column_description: "Unique identifier for each region.",
          column_neo4j_id: 26,
        },
        {
          column_type: "TEXT",
          column_alias: "description",
          column_key_type: "None",
          column_name: "territory_description",
          column_description: "Name or description of the territory.",
          column_neo4j_id: 25,
        },
      ],
      table_alias: "territory",
      table_neo4j_id: 24,
    },
    {
      table_description:
        "Maps employees to their assigned territories, defining their area of responsibility for business operations.",
      table_name: "employee_territories",
      columns: [
        {
          column_type: "TEXT",
          column_alias: "id",
          column_key_type: "Primary Key",
          column_name: "territory_id",
          column_description: "Unique identifier for each territory.",
          column_neo4j_id: 23,
        },
      ],
      table_alias: "employee_territory",
      table_neo4j_id: 22,
    },
  ];

  const DrawerList = (
    <Box sx={{ width: 400, marginTop: 10 }} role="presentation">
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            centered
            variant="fullWidth"
          >
            <Tab label="Schema" value="1" />
            <Tab label="Chat" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <SchemaDrawer tables={tables} />
        </TabPanel>
        <TabPanel value="2">
          {/* Chat history */}
          <ChatStoryList
            setSelectConversation={setSelectConversation}
            setIsResetHf={setIsResetHf}
            handleResetBySelectedHistoryPrompt={
              handleResetBySelectedHistoryPrompt
            }
          />
        </TabPanel>
      </TabContext>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer
        open={open}
        anchor="right"
        variant="temporary"
        onClose={toggleDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
