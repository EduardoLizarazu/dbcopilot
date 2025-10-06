import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IExtractSchemaDbConnectionUseCase } from "@/core/application/usecases/dbconnection/extract-schema-dbconnection.usecase";
import { TNlqInfoConnDto } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export class ExtractSchemaDbConnectionController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly extractSchemaDbConnectionUseCase: IExtractSchemaDbConnectionUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<TNlqInfoConnDto>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[CreateDbConnectionController] handling request",
        httpRequest
      );

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info(
        "[CreateDbConnectionController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error("[CreateDbConnectionController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.extractSchemaDbConnectionUseCase.execute({
        ...body,
      });

      if (!useCase.success) {
        this.logger.error(
          "[CreateDbConnectionController] Error creating DB Connection",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(
          "Error creating DB Connection: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_201({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("[CreateDbConnectionController] Unexpected error", err);
      const error = this.httpErrors.error_500("Unexpected error");
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
