import { CreateSchemaDto } from '../dto/create-schema.dto';

export const createSchemaDtoToArray = (data: CreateSchemaDto[]) => {
  const transformedData = data.reduce((acc, item) => {
    const {
      table_name,
      column_name,
      data_type,
      primary_key,
      foreign_key,
      unique_key,
      referenced_table,
      referenced_column,
    } = item;

    // Remove '' or "" from tabla_name and column_name
    const synthesized_table_name = table_name.replace(/['"]+/g, '');
    const synthesized_column_name = column_name
      ? column_name.replace(/['"]+/g, '')
      : null;

    if (!acc[synthesized_table_name]) {
      acc[synthesized_table_name] = {
        table_name: synthesized_table_name,
        columns: [],
      };
    }
    acc[synthesized_table_name].columns.push({
      column_name: synthesized_column_name,
      data_type,
      primary_key,
      foreign_key,
      unique_key,
      referenced_table,
      referenced_column,
    });
    return acc;
  }, {});

  // Convert the object back to an array
  const transformedDataArray = Object.values(transformedData).map(
    (item: { table_name: string; columns: any[] }) => {
      return {
        table_name: item.table_name,
        table_id: 0,
        columns: item.columns.map((col) => ({
          column_id: 0,
          column_name: col.column_name,
          data_type: col.data_type,
          primary_key: col.primary_key,
          foreign_key: col.foreign_key,
          unique_key: col.unique_key,
          referenced_table: col.referenced_table,
          referenced_column: col.referenced_column,
        })),
      };
    },
  );
  return transformedDataArray;
};
