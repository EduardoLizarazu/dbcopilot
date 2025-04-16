// {
//   "id": 530,
//   "technicalName": "id",
//   "alias": null,
//   "description": null,
//   "dataType": "integer",
//   "schemaTable": {
//     "id": 276,
//     "technicalName": "databasetype",
//     "alias": null,
//     "description": null
//   }
// }
export interface SchemaColumnReadById {
  id: number;
  technicalName: string;
  alias: string | null;
  description: string | null;
  dataType: string;
  schemaTable: {
    id: number;
    technicalName: string;
    alias: string | null;
    description: string | null;
  };
}
