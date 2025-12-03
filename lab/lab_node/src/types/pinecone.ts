export type SpladeVectors = {
  indices: number[];
  values: number[];
};

export type TPineconeQueryResult = {
  id: string;
  score: number;
  question: string;
  query?: string;
};
