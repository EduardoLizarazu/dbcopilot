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
import { IReadAllVbdSplitterWithUserUseCase } from "@/core/application/usecases/vbd-splitter/read-all-vbd-splitter-with-user.usecase";

export class ReadAllVbdSplitterWithUserController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readAllVbdSplitterWithUserUseCase: IReadAllVbdSplitterWithUserUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<null>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST =====
      this.logger.info(
        "[ReadAllVbdSplitterWithUserController] handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info(
        "[ReadAllVbdSplitterWithUserController] Headers:",
        headers
      );
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadAllVbdSplitterWithUserController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("Error reading VBD splitters");
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadAllVbdSplitterWithUserController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadAllVbdSplitterWithUserController] Invalid token",
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
        "[ReadAllVbdSplitterWithUserController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });
      if (!hasAuth) {
        this.logger.error(
          "[ReadAllVbdSplitterWithUserController] User is not authorized"
        );
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.readAllVbdSplitterWithUserUseCase.execute();
      this.logger.info(
        "[ReadAllVbdSplitterWithUserController] UseCase executed successfully",
        useCase
      );

      if (!useCase.success) {
        this.logger.error(
          "[ReadAllVbdSplitterWithUserController] Error reading VBD splitters",
          {
            ...useCase,
          }
        );
        const error = this.httpErrors.error_400(useCase.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      // ==== OUTPUT OF RESPONSE ====
      const success = this.httpSuccess.success_201({
        message: useCase.message,
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (error) {
      this.logger.error(
        "[ReadAllVbdSplitterWithUserController] Unexpected error",
        error.message
      );
      const httpError = this.httpErrors.error_500(
        error.message || "Internal server error"
      );
      return new HttpResponse(httpError.statusCode, httpError.body);
    }
  }
}
