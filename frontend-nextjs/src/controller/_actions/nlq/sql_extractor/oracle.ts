export const oracleSqlExtractor = `
SELECT
    ac.owner AS table_schema,
    ac.table_name,
    ac.column_name,
    ac.data_type,
    ac.data_length,
    ac.data_precision,
    ac.data_scale,
    ac.nullable,
    CASE WHEN pk_cols.column_name IS NOT NULL THEN 'TRUE' ELSE 'FALSE' END AS is_primary_key,
    CASE WHEN fk_cols.column_name IS NOT NULL THEN 'TRUE' ELSE 'FALSE' END AS is_foreign_key,
    fk_ref_cons.r_owner AS referenced_table_schema,
    fk_ref_cons.r_table_name AS referenced_table_name,
    fk_ref_cols.column_name AS referenced_column_name
FROM
    ALL_TAB_COLUMNS ac -- Base for all columns
LEFT JOIN (
    -- Subquery to identify Primary Key columns
    SELECT
        acc.owner,
        acc.table_name,
        acc.column_name
    FROM
        ALL_CONSTRAINTS cons
    JOIN
        ALL_CONS_COLUMNS acc ON cons.owner = acc.owner AND cons.constraint_name = acc.constraint_name
    WHERE
        cons.constraint_type = 'P' -- 'P' for Primary Key
) pk_cols ON ac.owner = pk_cols.owner
          AND ac.table_name = pk_cols.table_name
          AND ac.column_name = pk_cols.column_name
LEFT JOIN (
    -- Subquery to identify Foreign Key columns
    SELECT
        acc.owner,
        acc.table_name,
        acc.column_name,
        acc.position,
        cons.r_owner,          -- Owner of the referenced table
        cons.r_constraint_name -- Name of the referenced constraint (PK/Unique in parent table)
    FROM
        ALL_CONSTRAINTS cons
    JOIN
        ALL_CONS_COLUMNS acc ON cons.owner = acc.owner AND cons.constraint_name = acc.constraint_name
    WHERE
        cons.constraint_type = 'R' -- 'R' for Foreign Key
) fk_cols ON ac.owner = fk_cols.owner
          AND ac.table_name = fk_cols.table_name
          AND ac.column_name = fk_cols.column_name
LEFT JOIN (
    -- Join to get details of the referenced constraint (PK/Unique)
    SELECT
        owner,
        constraint_name,
        table_name AS r_table_name,
        owner AS r_owner
    FROM
        ALL_CONSTRAINTS
    WHERE
        constraint_type IN ('P', 'U') -- Referenced constraint must be PK or Unique
) fk_ref_cons ON fk_cols.r_owner = fk_ref_cons.owner
             AND fk_cols.r_constraint_name = fk_ref_cons.constraint_name
LEFT JOIN (
    -- Join to get the specific referenced column name
    SELECT
        owner,
        constraint_name,
        column_name,
        position
    FROM
        ALL_CONS_COLUMNS
) fk_ref_cols ON fk_ref_cons.owner = fk_ref_cols.owner
             AND fk_ref_cons.constraint_name = fk_ref_cols.constraint_name
             AND fk_cols.position = fk_ref_cols.position -- Match columns by their position in the constraint
WHERE
    ac.owner NOT IN ('SYS', 'SYSTEM', 'OUTLN', 'DBSNMP', 'CTXSYS', 'XDB', 'APEX_040200') -- Exclude common system/tool schemas
    AND ac.owner NOT LIKE 'APEX_%' -- Exclude other APEX schemas
    AND ac.owner NOT LIKE 'ORDS_%' -- Exclude ORDS schemas
ORDER BY
    ac.owner,
    ac.table_name,
    ac.column_id;
`;
