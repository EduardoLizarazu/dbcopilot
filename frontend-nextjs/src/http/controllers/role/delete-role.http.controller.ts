import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IController } from "../IController.http.controller";
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
import { IDeleteRoleUseCase } from "@/core/application/usecases/role/delete-role.usecase";

export class DeleteRoleController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteRoleUseCase: IDeleteRoleUseCase,
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
      this.logger.info("[DeleteRoleController] Handling request", httpRequest);

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[DeleteRoleController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[DeleteRoleController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[DeleteRoleController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[DeleteRoleController] Invalid authorization token",
          httpRequest
        );
        const error = this.httpErrors.error_401("Invalid authorization token");
        return new HttpResponse(error.statusCode, error.body);
      }
      //   4. Retrieve roles
      const roleNames = await this.accessRepo.findRolesNamesByUserId(
        decoded.uid
      );
      this.logger.info(
        "[DeleteRoleController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[DeleteRoleController] User does not have the required roles",
          httpRequest
        );
        const error = this.httpErrors.error_401(
          "User does not have the required roles"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      if (!httpRequest.body) {
        this.logger.error(
          "[DeleteRoleController] No body provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[DeleteRoleController] Received body:",
        httpRequest.body
      );

      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.deleteRoleUseCase.execute(body.id);

      if (!useCase.success) {
        this.logger.error("[DeleteRoleController] Error deleting role: ", {
          ...useCase,
        });
        const error = this.httpErrors.error_400(
          "Error deleting role: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: "Role deleted successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error("[DeleteRoleController] Internal server error:", error);
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
