export interface IGenericMutationRepository<C, U, O> {
  create(data: C): Promise<string>;
  update(id: string, data: U): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<O | null>;
  findAll(): Promise<O[]>;
}
