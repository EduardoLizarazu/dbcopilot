import {
  TCreateDbConnInReqDto,
  TDbConnectionOutRequestDto,
} from "../../dtos/dbconnection.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { ICreateDbConnStep } from "../../steps/dbconn/create-dbconn.step";
import { IValidateInputCreateDbConnStep } from "../../steps/dbconn/validate-input-create-dbconn.step";
import { ICreateSchemaStep } from "../../steps/schema/create-schema.step";
import { IReadSchemaByConnectionFieldsStep } from "../../steps/schema/read-by-connecion-fields.step";
import { IUpdateSchemaStep } from "../../steps/schema/update-schema.step";

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
    private readonly createDbConnStep: ICreateDbConnStep,
    private readonly readSchemaByConnectionFieldsStep: IReadSchemaByConnectionFieldsStep,
    private readonly createSchemaStep: ICreateSchemaStep,
    private readonly updateSchemaStep: IUpdateSchemaStep
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

      // STEP 3: Verify if connection fields already exists in SCHEMA CTX KNOWLEDGE GRAPH
      const existingSchema = await this.readSchemaByConnectionFieldsStep.run({
        type: createdDbConn.type,
        host: createdDbConn.host,
        port: createdDbConn.port,
        database: createdDbConn.database,
      });
      const existingSchemaByConnId =
        await this.readSchemaByConnectionFieldsStep.run({
          id: createdDbConn.id,
        });

      if (!existingSchema) {
        // 3.a.1. If no exists.
        // 3.a.2. Create a new SCHEMA CTX KNOWLEDGE GRAPH with the connection fields.
        await this.createSchemaStep.run({
          id: createdDbConn.id,
          type: createdDbConn.type,
          host: createdDbConn.host,
          port: createdDbConn.port,
          database: createdDbConn.database,
          username: createdDbConn.username,
          password: createdDbConn.password,
        });
      }
      if (existingSchema) {
        // 3.b.1. If exists.
        // 3.b.2. Find the id of the existing SCHEMA CTX KNOWLEDGE GRAPH
        const existingSchemaId = existingSchema.id;

        // 3.b.3. Update add the new connection fields to the existing SCHEMA CTX KNOWLEDGE GRAPH
        await this.updateSchemaStep.run(existingSchemaId, {
          schemaId: existingSchemaId,
          id: createdDbConn.id,
          type: createdDbConn.type,
          host: createdDbConn.host,
          port: createdDbConn.port,
          database: createdDbConn.database,
          username: createdDbConn.username,
          password: createdDbConn.password,
        });
      }

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
