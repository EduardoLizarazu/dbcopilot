import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadAllNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/read-all-nlq-qa-feedback.usecase";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IController } from "../IController.http.controller";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";

export class ReadAllNlqQaFeedbackController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllNlqQaFeedbackUseCase: IReadAllNlqQaFeedbackUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadAllNlqQaFeedbackController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadAllNlqQaFeedbackController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadAllNlqQaFeedbackController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadAllNlqQaFeedbackController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadAllNlqQaFeedbackController] Invalid token",
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
        "[ReadAllNlqQaFeedbackController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [ROLE.ANALYST, ROLE.ADMIN],
      });

      if (!hasAuth) {
        this.logger.error(
          "[ReadAllNlqQaFeedbackController] User not authorized",
          httpRequest
        );
        const error = this.httpErrors.error_401("User not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC ====
      const useCase = await this.readAllNlqQaFeedbackUseCase.execute();
      this.logger.info(
        "[ReadAllNlqQaFeedbackController] Use case executed successfully",
        useCase
      );
      if (!useCase.success) {
        const error = this.httpErrors.error_400(useCase.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== OUTPUT OF RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: "NLQ QA Good retrieved successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error(
        "[ReadAllNlqQaFeedbackController] Error handling request",
        error
      );
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
