export interface IDecodeTokenAppUseCase {
  execute(token: string): Promise<{ uid: string } | null>;
}
