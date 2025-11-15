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
import { TUpdateDbConnInReqDto } from "@/core/application/dtos/dbconnection.dto";
import { IUpdateDbConnectionUseCase } from "@/core/application/usecases/dbconnection/update-dbconnection.usecase";

export class UpdateDbConnectionController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly updateDbConnectionUseCase: IUpdateDbConnectionUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<TUpdateDbConnInReqDto>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[UpdateDbConnectionController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[UpdateDbConnectionController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[UpdateDbConnectionController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error updating DB Connection");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[UpdateDbConnectionController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[UpdateDbConnectionController] Invalid token",
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
        "[UpdateDbConnectionController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[UpdateDbConnectionController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== PARAMS ID ====
      const params = httpRequest.params as { id?: string };
      if (!params || !params.id) {
        this.logger.error(
          "[UpdateDbConnectionController] No id parameter provided"
        );
        const error = this.httpErrors.error_400("No id parameter provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info(
        "[UpdateDbConnectionController] Body:",
        httpRequest.body
      );
      if (!httpRequest.body) {
        this.logger.error("[UpdateDbConnectionController] No body provided");
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.updateDbConnectionUseCase.execute(params.id, {
        ...body,
        actorId: decoded.uid,
      });

      if (!useCase.success) {
        this.logger.error(
          "[UpdateDbConnectionController] Error updating DB Connection",
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
        "[UpdateDbConnectionController] Unexpected error",
        err.message
      );
      const error = this.httpErrors.error_500(
        err.message || "Unexpected error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
