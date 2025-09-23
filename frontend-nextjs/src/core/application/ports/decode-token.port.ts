import { TAuthorizeDto, TLoginDto, TTokenDecodedDto } from "../dtos/auth.dto";

export interface IDecodeTokenPort {
  decodeToken(token: string): Promise<TTokenDecodedDto | null>;
}
