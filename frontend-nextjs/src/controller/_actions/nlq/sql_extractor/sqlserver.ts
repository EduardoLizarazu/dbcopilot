export const sqlServerSqlExtractor = `
SELECT
    s.name AS table_schema,
    t.name AS table_name,
    c.name AS column_name,
    ty.name AS data_type,
    CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
    CASE WHEN fk_cols.parent_column_id IS NOT NULL THEN 1 ELSE 0 END AS is_foreign_key,
    OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS referenced_table_schema,
    OBJECT_NAME(fk.referenced_object_id) AS referenced_table_name,
    COL_NAME(fk_cols.referenced_object_id, fk_cols.referenced_column_id) AS referenced_column_name
FROM
    sys.tables AS t
JOIN
    sys.schemas AS s ON t.schema_id = s.schema_id
JOIN
    sys.columns AS c ON t.object_id = c.object_id
JOIN
    sys.types AS ty ON c.user_type_id = ty.user_type_id
LEFT JOIN -- Check for Primary Key
    (
        SELECT
            ic.object_id,
            ic.column_id
        FROM
            sys.indexes AS i
        JOIN
            sys.index_columns AS ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE
            i.is_primary_key = 1
    ) AS pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
LEFT JOIN -- Check for Foreign Key
    sys.foreign_key_columns AS fk_cols
    ON c.object_id = fk_cols.parent_object_id
    AND c.column_id = fk_cols.parent_column_id
LEFT JOIN -- Get Foreign Key Reference details
    sys.foreign_keys AS fk
    ON fk_cols.constraint_object_id = fk.object_id
WHERE
    t.is_ms_shipped = 0 -- Exclude system tables
    AND s.name NOT IN ('INFORMATION_SCHEMA', 'sys', 'guest') -- Exclude system schemas
ORDER BY
    table_schema,
    table_name,
    c.column_id;
`;
