import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
import { IUpdateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/update-nlq-qa-feedback.usecase";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { ROLE } from "@/http/utils/role.enum";
import { TUpdateNlqQaFeedbackDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";

export class UpdateNlqQaFeedbackController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly updateNlqQaFeedbackUseCase: IUpdateNlqQaFeedbackUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<TUpdateNlqQaFeedbackDto>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[UpdateNlqQaFeedbackController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[UpdateNlqQaFeedbackController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[UpdateNlqQaFeedbackController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating NLQ QA");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[UpdateNlqQaFeedbackController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[UpdateNlqQaFeedbackController] Invalid token",
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
        "[UpdateNlqQaFeedbackController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [ROLE.ANALYST, ROLE.ADMIN],
      });
      if (!hasAuth) {
        this.logger.error(
          "[UpdateNlqQaFeedbackController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info(
        "[UpdateNlqQaFeedbackController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error("[UpdateNlqQaFeedbackController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.updateNlqQaFeedbackUseCase.execute(body.id, {
        isGood: body.isGood,
        comment: body.comment,
        updatedBy: decoded.uid,
        updatedAt: new Date(),
      });

      if (!useCase.success) {
        this.logger.error(
          "[UpdateNlqQaFeedbackController] Use case error",
          useCase.message
        );
        const error = this.httpErrors.error_400(useCase.message);
        return new HttpResponse(error.statusCode, error.body);
      }
      this.logger.info(
        "[UpdateNlqQaFeedbackController] NLQ QA Feedback updated successfully",
        useCase.data
      );

      const success = this.httpSuccess.success_200({
        message: "NLQ QA Feedback updated successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error("[UpdateNlqQaFeedbackController] Error:", error);
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
