import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "@/core/application/interfaces/vbd-splitter.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import {
  TCreateVbdDto,
  TUpdateVbdDto,
  TVbdOutRequestDto,
} from "@/core/application/dtos/vbd.dto";

export class VbdSplitterRepository implements IVbdSplitterRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider
  ) {}
  async create(data: TCreateVbdDto): Promise<string> {
    throw new Error("Method not implemented.");
  }
  async update(id: string, data: TUpdateVbdDto): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async findById(id: string): Promise<TVbdOutRequestDto | null> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<TVbdOutRequestDto[]> {
    throw new Error("Method not implemented.");
  }
  async findByName(name: string): Promise<TVbdOutRequestDto | null> {
    throw new Error("Method not implemented.");
  }
}
