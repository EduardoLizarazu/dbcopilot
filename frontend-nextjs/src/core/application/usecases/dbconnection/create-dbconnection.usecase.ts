import {
  TCreateDbConnInReqDto,
  TDbConnectionOutRequestDto,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ICreateDbConnStep } from "../../steps/dbconn/create-dbconn.step";
import { IValidateInputCreateDbConnStep } from "../../steps/dbconn/validate-input-create-dbconn.step";

/**
 * Create db connection use case:
 * 1. Validate input data
 * 2. Create the db connection
 * 3. Verify if connection fields already exists in SCHEMA CTX KNOWLEDGE GRAPH
 * 3.a.1. If no exists.
 * 3.a.2. Create a new SCHEMA CTX KNOWLEDGE GRAPH with the connection fields.
 * 3.b.1. If exists.
 * 3.b.2. Find the id of the existing SCHEMA CTX KNOWLEDGE GRAPH
 * 3.b.3. Update add the new connection fields to the existing SCHEMA CTX KNOWLEDGE GRAPH
 * 3.b.4. Compare the physical schema with the existing ctx schema.
 * 3.b.5. If there are new tables/columns, add them to the SCHEMA CTX KNOWLEDGE GRAPH
 * 3.b.6. If there are same columns, update the profile information.
 * 3.b.7. Return the id of the existing SCHEMA CTX KNOWLEDGE GRAPH
 * 3. Return response
 */

export interface ICreateDbConnectionUseCase {
  execute(
    data: TCreateDbConnInReqDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>>;
}

export class CreateDbConnectionUseCase implements ICreateDbConnectionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validateInputDbConnStep: IValidateInputCreateDbConnStep,
    private readonly createDbConnStep: ICreateDbConnStep
  ) {}

  async execute(
    data: TCreateDbConnInReqDto
  ): Promise<TResponseDto<TDbConnectionOutRequestDto>> {
    try {
      const validatedData = await this.validateInputDbConnStep.run(data);
      const createDto = {
        ...validatedData,
        createdBy: validatedData.actorId,
        updatedBy: validatedData.actorId,
      };
      delete createDto.actorId;
      const createdDbConn = await this.createDbConnStep.run(createDto);
      return {
        success: true,
        message: "DB connection created successfully",
        data: createdDbConn,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`[CreateDbConnectionUseCase] Error: ${errorMessage}`);
      return {
        success: false,
        message: errorMessage || "Error creating DB connection",
        data: null,
      };
    }
  }
}
