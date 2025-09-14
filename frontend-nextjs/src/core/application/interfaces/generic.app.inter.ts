export interface IGenericMutationRepository<C, U, O> {
  create(data: C): Promise<O>;
  update(id: string, data: U): Promise<O>;
  delete(id: string): Promise<void>;
}

export interface IGenericQueryRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}
