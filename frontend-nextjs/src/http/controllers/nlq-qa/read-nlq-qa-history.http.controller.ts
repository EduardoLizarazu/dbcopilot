import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IController } from "../IController.http.controller";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";
import { IReadNlqQaHistoryUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-nlq-qa-history.usecase";

export class ReadNlqQaHistoryController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaHistoryUseCase: IReadNlqQaHistoryUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadNlqQaHistoryController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadNlqQaHistoryController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadNlqQaHistoryController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error reading NLQ history");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadNlqQaHistoryController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadNlqQaHistoryController] Invalid token",
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
        "[ReadNlqQaHistoryController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[ReadNlqQaHistoryController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.readNlqQaHistoryUseCase.execute({
        userId: decoded.uid,
      });

      if (!useCase.success) {
        this.logger.error(
          "[ReadNlqQaHistoryController] Error reading NLQ history",
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
        "[ReadNlqQaHistoryController] Unexpected error",
        err.message
      );
      const error = this.httpErrors.error_500(
        err.message || "Unexpected error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
