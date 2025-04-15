export interface InputTestConn {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbTypeId: number;
}

export const convertToConnectionInput = (data: unknown): InputTestConn => {
  if (typeof data === "object" && data !== null) {
    return {
      name: (data as any).name as string,
      description: (data as any).description as string,
      dbName: (data as any).dbName as string,
      dbHost: (data as any).dbHost as string,
      dbPort: Number((data as any).dbPort),
      dbUsername: (data as any).dbUsername as string,
      dbPassword: (data as any).dbPassword as string,
      dbTypeId: Number((data as any).dbTypeId),
    };
  }
  throw new Error("Invalid data format");
};
