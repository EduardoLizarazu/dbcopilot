import { IReadAllUserUseCase } from "@/core/application/usecases/user/read-all-user.usecase";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";

export class ReadAllUserController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllUserUseCase: IReadAllUserUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}
  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info("[ReadAllUserController] Handling request", httpRequest);

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadAllUserController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadAllUserController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadAllUserController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadAllUserController] Invalid authorization token",
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
        "[ReadAllUserController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [ROLE.ADMIN],
      });

      if (!hasAuth) {
        this.logger.error(
          "[ReadAllUserController] User does not have the required roles",
          httpRequest
        );
        const error = this.httpErrors.error_401(
          "User does not have the required roles"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== BUSINESS LOGIC ====

      const users = await this.readAllUserUseCase.execute();
      if (!users.success) {
        this.logger.error("[ReadAllUserController] No users found");
        const error = this.httpErrors.error_404("No users found");
        return new HttpResponse(error.statusCode, error.body);
      }
      //   ==== OUTPUT ====
      this.logger.info(
        "[ReadAllUserController] Users retrieved successfully:",
        users
      );
      const response = this.httpSuccess.success_200({
        message: "Users retrieved successfully",
        data: users.data,
      });
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      this.logger.error("[ReadAllUserController] Internal server error:", err);
      const error = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
