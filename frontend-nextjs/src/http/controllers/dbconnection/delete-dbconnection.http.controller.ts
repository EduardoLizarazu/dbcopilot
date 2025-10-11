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
import { IDeleteDbConnectionUseCase } from "@/core/application/usecases/dbconnection/delete-dbconnection.usecase";

export class DeleteDbConnectionController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteDbConnectionUseCase: IDeleteDbConnectionUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[DeleteDbConnectionController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[DeleteDbConnectionController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[DeleteDbConnectionController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error deleting DB Connection");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[DeleteDbConnectionController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[DeleteDbConnectionController] Invalid token",
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
        "[DeleteDbConnectionController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[DeleteDbConnectionController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== PARAMS ID ====
      const params = httpRequest.params as { id?: string };
      if (!params || !params.id) {
        this.logger.error(
          "[DeleteDbConnectionController] No id parameter provided"
        );
        const error = this.httpErrors.error_400("No id parameter provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.deleteDbConnectionUseCase.execute(params.id);

      if (!useCase.success) {
        this.logger.error(
          "[DeleteDbConnectionController] Error deleting DB Connection",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(
          "Error deleting DB Connection: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("[DeleteDbConnectionController] Unexpected error", err);
      const error = this.httpErrors.error_500(
        err.message || "Internal server error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
