import { IUpdateNlqQaGoodUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/update-nlq-qa-good.usecase";
import { IController } from "../IController.http.controller";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { TUpdateNlqQaGoodInRqDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { ROLE } from "@/http/utils/role.enum";

export class UpdateNlqQaGoodController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly updateNlqQaGoodUseCase: IUpdateNlqQaGoodUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<TUpdateNlqQaGoodInRqDto>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[UpdateNlqQaGoodController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[UpdateNlqQaGoodController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[UpdateNlqQaGoodController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating NLQ QA");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[UpdateNlqQaGoodController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[UpdateNlqQaGoodController] Invalid token",
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
        "[UpdateNlqQaGoodController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error("[UpdateNlqQaGoodController] User is not authorized");
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info("[UpdateNlqQaGoodController] Body:", httpRequest.body);
      if (!httpRequest.body) {
        this.logger.error("[UpdateNlqQaGoodController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      body.actorId = decoded.uid;
      const useCase = await this.updateNlqQaGoodUseCase.execute(body.id, {
        ...body,
      });

      if (!useCase.success) {
        this.logger.error(
          "[UpdateNlqQaGoodController] Use case returned null",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          useCase.message || "Error updating NLQ QA good"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info("[UpdateNlqQaGoodController] Use case result:", useCase);

      // ==== OUTPUT OF RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error(
        "[UpdateNlqQaGoodController] Error handling request",
        error
      );
      const errorResponse = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(errorResponse.statusCode, errorResponse.body);
    }
  }
}
