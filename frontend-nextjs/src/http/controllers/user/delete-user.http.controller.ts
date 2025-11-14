import { IController } from "../IController.http.controller";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";
import { IDeleteUserUseCase } from "@/core/application/usecases/user/delete-user.usecase";
import { http } from "winston";

export class DeleteUserController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly deleteUserUseCase: IDeleteUserUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}
  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info("[DeleteUserController] Handling request", httpRequest);

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[DeleteUserController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[DeleteUserController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[DeleteUserController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[DeleteUserController] Invalid authorization token",
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
        "[DeleteUserController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[DeleteUserController] User does not have the required roles",
          httpRequest
        );
        const error = this.httpErrors.error_401(
          "User does not have the required roles"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== PARAMS  ====
      if (!httpRequest.params) {
        this.logger.error(
          "[DeleteUserController] Missing request params",
          httpRequest
        );
        const error = this.httpErrors.error_400("Missing request params");
        return new HttpResponse(error.statusCode, error.body);
      }

      const useCase = await this.deleteUserUseCase.execute(
        httpRequest.params.id
      );

      if (!useCase.success) {
        this.logger.error(
          "[DeleteUserController] User deletion failed:",
          useCase
        );
        const error = this.httpErrors.error_404(
          useCase.message || "User deletion failed"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[DeleteUserController] User deleted successfully:",
        useCase
      );

      const response = this.httpSuccess.success_200({
        message: useCase.message || "User deleted successfully",
        data: useCase.data,
      });
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      this.logger.error(
        "[DeleteUserController] Internal server error:",
        err.message
      );
      const error = this.httpErrors.error_500(
        err.message || "Internal server error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
