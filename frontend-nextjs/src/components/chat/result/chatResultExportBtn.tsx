"use client";
import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type TChatResultExportBtnProps = {
  data: Record<string, unknown>[];
};

export function ChatResultExportBtn({ data }: TChatResultExportBtnProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const exportToExcel = () => {
    handleClose();
    if (!data || data.length === 0) {
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(file, "data.xlsx");
  };

  const exportToCSV = () => {
    handleClose();
    if (!data || data.length === 0) {
      return;
    }
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(file, "data.csv");
  };

  const exportToPDF = () => {
    handleClose();
    if (!data || data.length === 0) {
      return;
    }

    const doc = new jsPDF();
    const columns = Object.keys(data[0] || {});
    const rows = data.map((item) => columns.map((col) => String(item[col])));

    autoTable(doc, { head: [columns], body: rows });
    doc.save("data.pdf");
  };

  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        variant="text"
      >
        Export
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={exportToExcel}>Excel</MenuItem>
        <MenuItem onClick={exportToCSV}>CSV</MenuItem>
        <MenuItem onClick={exportToPDF}>PDF</MenuItem>
      </Menu>
    </>
  );
}
