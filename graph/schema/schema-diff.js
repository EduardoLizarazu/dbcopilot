const schemaStatus = {
  UNCHANGED: 0,
  NEW: 1,
  NOT_FOUND: 2,
};

const schemaDiff = [
  {
    schema: {
      name: "analytics",
      status: schemaStatus.NEW,
    },
    tables: [
      {
        name: "events",
        status: schemaStatus.NOT_FOUND,
        columns: [
          {
            name: "event_id",
            status: schemaStatus.UNCHANGED,
            dataType: {
              name: "uuid",
            },
          },
          {
            name: "user_id",
            status: schemaStatus.UNCHANGED,
            dataType: {
              name: "uuid",
              status: schemaStatus.UNCHANGED,
            },
          },
          {
            name: "event_type",
            status: schemaStatus.UNCHANGED,
            dataType: {
              name: "varchar",
              status: schemaStatus.UNCHANGED,
            },
          },
          {
            name: "occurred_at",
            status: schemaStatus.UNCHANGED,
            dataType: {
              name: "timestamp",
              status: schemaStatus.UNCHANGED,
            },
          },
        ],
      },
    ],
  },
];
