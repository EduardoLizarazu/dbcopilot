import { IIdGenPort } from "@/core/application/ports/id-gen.port";
import { nanoid } from "nanoid";

export class GenIdAdapter implements IIdGenPort {
  async genId(): Promise<string> {
    return await nanoid();
  }
}
