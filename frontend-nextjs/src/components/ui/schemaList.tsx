import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem, TreeViewItemId } from "@mui/x-tree-view/models";

const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
  {
    id: "grid",
    label: "Data Grid",
    children: [
      { id: "grid-community", label: "@mui/x-data-grid" },
      { id: "grid-pro", label: "@mui/x-data-grid-pro" },
      { id: "grid-premium", label: "@mui/x-data-grid-premium" },
    ],
  },
  {
    id: "pickers",
    label: "Date and Time Pickers",
    children: [
      { id: "pickers-community", label: "@mui/x-date-pickers" },
      { id: "pickers-pro", label: "@mui/x-date-pickers-pro" },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    children: [{ id: "charts-community", label: "@mui/x-charts" }],
  },
  {
    id: "tree-view",
    label: "Tree View",
    children: [{ id: "tree-view-community", label: "@mui/x-tree-view" }],
  },
];

const getAllItemsWithChildrenItemIds = () => {
  const itemIds: TreeViewItemId[] = [];
  const registerItemId = (item: TreeViewBaseItem) => {
    if (item.children?.length) {
      itemIds.push(item.id);
      item.children.forEach(registerItemId);
    }
  };

  MUI_X_PRODUCTS.forEach(registerItemId);

  return itemIds;
};

const filterTreeItems = (
  items: TreeViewBaseItem[],
  query: string
): TreeViewBaseItem[] => {
  if (!query) return items;

  return items
    .map((item) => {
      if (item.label.toLowerCase().includes(query.toLowerCase())) {
        return item;
      }
      if (item.children) {
        const filteredChildren = filterTreeItems(item.children, query);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
      }
      return null;
    })
    .filter(Boolean) as TreeViewBaseItem[];
};

export function SchemaList() {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? getAllItemsWithChildrenItemIds() : []
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredItems = filterTreeItems(MUI_X_PRODUCTS, searchQuery);

  return (
    <Stack spacing={2}>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: "8px", padding: "4px", width: "100%" }}
        />
        <Button onClick={handleExpandClick}>
          {expandedItems.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <RichTreeView
          items={filteredItems}
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
        />
      </Box>
    </Stack>
  );
}
