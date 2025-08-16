export const postgresSqlExtractor = `
SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary_key,
    CASE WHEN fk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_foreign_key,
    fk.foreign_table_schema AS referenced_table_schema,
    fk.foreign_table_name AS referenced_table_name,
    fk.foreign_column_name AS referenced_column_name
FROM
    information_schema.columns AS c
LEFT JOIN ( -- Subquery to identify Primary Key columns
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
    FROM
        information_schema.table_constraints AS tc
    JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
    WHERE
        tc.constraint_type = 'PRIMARY KEY'
) AS pk ON c.table_schema = pk.table_schema
        AND c.table_name = pk.table_name
        AND c.column_name = pk.column_name
LEFT JOIN ( -- Subquery to identify Foreign Key columns and their references
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM
        information_schema.table_constraints AS tc
    JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
    JOIN
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
) AS fk ON c.table_schema = fk.table_schema
        AND c.table_name = fk.table_name
        AND c.column_name = fk.column_name
WHERE
    c.table_schema NOT IN ('pg_catalog', 'information_schema') -- Exclude system schemas
    AND c.table_name NOT LIKE 'pg_%' -- Further filter out some internal PostgreSQL tables
ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position;
`;
