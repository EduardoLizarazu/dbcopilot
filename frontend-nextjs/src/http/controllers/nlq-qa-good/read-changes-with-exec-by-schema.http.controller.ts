import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { ROLE } from "@/http/utils/role.enum";
import { IReadChangesWithExecBySchemaUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/read-changes-with-exec-by-schema.usecase";

export class ReadChangesWithExecBySchemaController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly useCase: IReadChangesWithExecBySchemaUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<{
      dbConnectionIds: string[];
    }>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadChangesWithExecBySchemaController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info(
        "[ReadChangesWithExecBySchemaController] Headers:",
        headers
      );
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadChangesWithExecBySchemaController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Error reading changes request"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadChangesWithExecBySchemaController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadChangesWithExecBySchemaController] Invalid token",
          httpRequest
        );
        const error = this.httpErrors.error_401("Invalid token");
        return new HttpResponse(error.statusCode, error.body);
      }
      //   4. Retrieve roles
      const roleNames = await this.accessRepo.findRolesNamesByUserId(
        decoded.uid
      );
      this.logger.info(
        "[ReadChangesWithExecBySchemaController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[ReadChangesWithExecBySchemaController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info(
        "[ReadChangesWithExecBySchemaController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error(
          "[ReadChangesWithExecBySchemaController] No body provided"
        );
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.useCase.execute({
        ...body,
      });
      this.logger.info(
        "[ReadChangesWithExecBySchemaController] UseCase executed successfully",
        useCase
      );

      if (!useCase.success) {
        this.logger.error(
          "[ReadChangesWithExecBySchemaController] UseCase error",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(
          useCase.message || "Error reading changes with exec by schema"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT OF RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: useCase.message || "Changes read successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error(
        "[ReadChangesWithExecBySchemaController] Error:",
        error.message
      );
      const httpError = this.httpErrors.error_500(
        error.message || "Internal server error"
      );
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
