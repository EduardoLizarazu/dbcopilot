import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IReadSchemaCtxByConnIdUseCase } from "@/core/application/usecases/schemaCtx/read-schema-ctx-by-conn-id.usecase";

export class ReadSchemaCtxByConnIdController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly process: IReadSchemaCtxByConnIdUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<{ connId: string }>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadSchemaCtxByConnIdController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadSchemaCtxByConnIdController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadSchemaCtxByConnIdController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Error reading schema contexts"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadSchemaCtxByConnIdController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadSchemaCtxByConnIdController] Invalid token",
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
        "[ReadSchemaCtxByConnIdController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[ReadSchemaCtxByConnIdController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.process.execute({
        connId: httpRequest.body.connId,
      });

      if (!useCase.success) {
        this.logger.error(
          "[ReadSchemaCtxByConnIdController] Error reading schema contexts",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(useCase.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error(
        "[ReadSchemaCtxByConnIdController] Unexpected error",
        err.message
      );
      const error = this.httpErrors.error_500(
        err.message || "Unexpected error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
