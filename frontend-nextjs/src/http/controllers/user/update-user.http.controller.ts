import { IUpdateUserUseCase } from "@/core/application/usecases/user/update-user.app.usecase";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { TUpdateUserDto } from "@/core/application/dtos/user.app.dto";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { ROLE } from "@/http/utils/role.enum";

export class UpdateUserController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}
  async handle(
    httpRequest: IHttpRequest<TUpdateUserDto>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info("[UpdateUserController] Handling request", httpRequest);

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[UpdateUserController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[UpdateUserController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[UpdateUserController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[UpdateUserController] Invalid authorization token",
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
        "[UpdateUserController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[UpdateUserController] User does not have the required roles",
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
          "[UpdateUserController] No body provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[UpdateUserController] Received body:",
        httpRequest.body
      );

      const body = httpRequest.body;

      // ==== BUSINESS LOGIC ==== USE CASES ====
      const user = await this.updateUserUseCase.execute(body.id, {
        id: body.id,
        email: body.email,
        password: body.password,
        lastname: body.lastname,
        name: body.name,
        roles: body.roles,
      });

      if (!user.success) {
        this.logger.error("[UpdateUserController] User update failed:", user);
        const error = this.httpErrors.error_400("User update failed");
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[UpdateUserController] User updated successfully:",
        user
      );

      const response = this.httpSuccess.success_200({
        message: "User updated successfully",
        data: user,
      });
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      this.logger.error("[UpdateUserController] Internal server error:", err);
      const error = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
