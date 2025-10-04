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
import { IReadNlqQaGoodByIdUseCase } from "@/core/application/usecases/nlq/nlq-qa-good/read-nlq-qa-good-by-id.usecase";

export class ReadNlqQaGoodByIdController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaGoodByIdUseCase: IReadNlqQaGoodByIdUseCase,
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
        "[ReadNlqQaGoodByIdController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadNlqQaGoodByIdController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadNlqQaGoodByIdController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error creating");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadNlqQaGoodByIdController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadNlqQaGoodByIdController] Invalid token",
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
        "[ReadNlqQaGoodByIdController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[ReadNlqQaGoodByIdController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info("[ReadNlqQaGoodByIdController] Body:", httpRequest.body);
      if (!httpRequest.body) {
        this.logger.error("[ReadNlqQaGoodByIdController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.readNlqQaGoodByIdUseCase.execute(body.id);
      this.logger.info(
        "[ReadNlqQaGoodByIdController] UseCase executed successfully",
        useCase
      );

      if (!useCase.success) {
        this.logger.error("[ReadNlqQaGoodByIdController] Error creating", {
          ...useCase,
        });
        const error = this.httpErrors.error_400(
          "Error creating NLQ QA Good: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT OF RESPONSE ====
      const success = this.httpSuccess.success_201({
        message: "Nlq Qa Good created successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error("[ReadNlqQaGoodByIdController] Error:", error);
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
