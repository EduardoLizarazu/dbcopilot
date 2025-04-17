"use client";
import React from "react";

type TSchemaContext = {
  foreignKey: {
    isEditing: boolean;
    relation_parent_id: number;
    relation_child_id: number;
  };
  setForeignKey: React.Dispatch<
    React.SetStateAction<{
      isEditing: boolean;
      relation_parent_id: number;
      relation_child_id: number;
    }>
  >;
};

const SchemaContext = React.createContext<TSchemaContext | null>(null);

export function useSchemaContext() {
  const context = React.useContext(SchemaContext);
  if (!context) {
    throw new Error("useSchemaContext must be used within a SchemaProvider");
  }
  return context;
}

export function SchemaContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [foreignKey, setForeignKey] = React.useState({
    isEditing: false,
    relation_parent_id: 0,
    relation_child_id: 0,
  });

  return (
    <SchemaContext.Provider value={{ foreignKey, setForeignKey }}>
      {children}
    </SchemaContext.Provider>
  );
}
