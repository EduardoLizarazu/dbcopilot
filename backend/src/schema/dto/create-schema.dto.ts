export class CreateSchemaDto {
    table_name: string;
    column_name: string;
    data_type: string;
    key_type: string;
    reference_table: string;
    reference_column: string;
}
