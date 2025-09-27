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
import { IReadByIdRoleUseCase } from "@/core/application/usecases/role/read-role-by-id.app.usecase";

export class ReadRoleByIdController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readByIdRoleUseCase: IReadByIdRoleUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadByIdRoleController] Handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadByIdRoleController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadByIdRoleController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadByIdRoleController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadByIdRoleController] Invalid authorization token",
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
        "[ReadByIdRoleController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[ReadByIdRoleController] User does not have the required roles",
          httpRequest
        );
        const error = this.httpErrors.error_401(
          "User does not have the required roles"
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT PARAMS ====
      if (!httpRequest.params || !httpRequest.params.id) {
        this.logger.error(
          "[ReadByIdRoleController] No id parameter provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("No id parameter provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[ReadByIdRoleController] Received params:",
        httpRequest.params
      );

      const body = httpRequest.body;

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.readByIdRoleUseCase.execute(
        httpRequest.params.id
      );

      if (!useCase.success) {
        this.logger.error("[ReadByIdRoleController] Error retrieving role: ", {
          ...useCase,
        });
        const error = this.httpErrors.error_400(
          "Error retrieving role: " + useCase.message
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: "Role retrieved successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error(
        "[ReadByIdRoleController] Internal server error:",
        error
      );
      const httpError = this.httpErrors.error_500("Internal server error");
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
