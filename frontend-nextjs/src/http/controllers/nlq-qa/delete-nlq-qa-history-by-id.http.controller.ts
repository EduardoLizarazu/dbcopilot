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
import { IDeleteNlqQaHistoryByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa/delete-nlq-qa-history-by-id.usecase";

export class DeleteNlqQaHistoryByIdController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteNlqQaHistoryByIdUseCase: IDeleteNlqQaHistoryByIdUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<{ id: string }>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[DeleteNlqQaHistoryByIdController] handling delete request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[DeleteNlqQaHistoryByIdController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[DeleteNlqQaHistoryByIdController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Error deleting NLQ history by id"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[DeleteNlqQaHistoryByIdController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[DeleteNlqQaHistoryByIdController] Invalid token",
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
        "[DeleteNlqQaHistoryByIdController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[DeleteNlqQaHistoryByIdController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT PARAMS ====
      if (!httpRequest.params || !httpRequest.params.id) {
        this.logger.error(
          "[DeleteNlqQaHistoryByIdController] No id parameter provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("No id parameter provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.deleteNlqQaHistoryByIdUseCase.execute(
        httpRequest.params.id
      );

      if (!useCase.success) {
        this.logger.error(
          "[DeleteNlqQaHistoryByIdController] Error deleting NLQ history by id",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(useCase.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: useCase.message || "NLQ QA history item deleted",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error(
        "[DeleteNlqQaHistoryByIdController] Unexpected error",
        err
      );
      const error = this.httpErrors.error_500(
        err?.message || "Unexpected error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
