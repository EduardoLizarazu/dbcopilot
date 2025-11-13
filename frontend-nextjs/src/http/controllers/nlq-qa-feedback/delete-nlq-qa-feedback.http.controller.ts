import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IDeleteNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/delete-nlq-qa-feedback.usecase";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { ROLE } from "@/http/utils/role.enum";

export class DeleteNlqQaFeedbackController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteNlqQaFeedbackUseCase: IDeleteNlqQaFeedbackUseCase,
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
        "[DeleteNlqQaFeedbackController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[DeleteNlqQaFeedbackController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[DeleteNlqQaFeedbackController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[DeleteNlqQaFeedbackController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[DeleteNlqQaFeedbackController] Invalid token",
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
        "[DeleteNlqQaFeedbackController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[DeleteNlqQaFeedbackController] User not authorized",
          httpRequest
        );
        const error = this.httpErrors.error_401("User not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info(
        "[DeleteNlqQaFeedbackHttpController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error(
          "[DeleteNlqQaFeedbackHttpController] No body provided"
        );
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.deleteNlqQaFeedbackUseCase.execute(
        httpRequest.body.id || ""
      );

      if (!useCase.success) {
        this.logger.error(
          "[DeleteNlqQaFeedbackHttpController] Error deleting: ",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400("Error deleting feedback");
        return new HttpResponse(error.statusCode, error.body);
      }
      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        id: httpRequest.body.id || "",
      });

      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error("[DeleteNlqQaFeedbackHttpController] Error:", error);
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
