import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IController } from "../IController.http.controller";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { IReadAllBadForCorrectionUseCase } from "@/core/application/usecases/nlq/nlq-qa/read-all-bad-for-correction.usecase";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";

export class ReadAllBadNlqQaController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllBadNlqQaUseCase: IReadAllBadForCorrectionUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<{ query: string }>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadAllBadNlqQaController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadAllBadNlqQaController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadAllBadNlqQaController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadAllBadNlqQaController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadAllBadNlqQaController] Invalid token",
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
        "[ReadAllBadNlqQaController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error("[ReadAllBadNlqQaController] User is not authorized");
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }
      //   ==== INPUT BODY ====

      //   1. Check body
      this.logger.info(
        "[CreateNlqQaFeedbackController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error("[CreateNlqQaFeedbackController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====

      const useCase = await this.readAllBadNlqQaUseCase.execute(body.query);

      if (!useCase.success) {
        this.logger.error(
          "[ReadAllBadNlqQaController] Error retrieving bad nlq qa: ",
          { ...useCase }
        );
        const error = this.httpErrors.error_400(
          "Error retrieving bad nlq qa: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      const success = this.httpSuccess.success_200({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error("[ReadAllBadNlqQaController] Unexpected error", error);
      const httpError = this.httpErrors.error_500("Unexpected error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
