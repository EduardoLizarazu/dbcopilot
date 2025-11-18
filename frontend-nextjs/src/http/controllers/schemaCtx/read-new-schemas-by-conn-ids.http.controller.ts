import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { IReadNewSchemasByConnIdsUseCase } from "@/core/application/usecases/schemaCtx/read-new-schemas-by-conn-ids.usecase";

export class ReadNewSchemaCtxByConnIdsController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly readNewSchemasByConnIdsUseCase: IReadNewSchemasByConnIdsUseCase,
    private readonly decodeTokenAdapter: IDecodeTokenPort,
    private readonly accessRepo: IAuthorizationRepository,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(
    httpRequest: IHttpRequest<{
      schemaCtxId: string;
      connIds: string[];
    }>
  ): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info(
        "[ReadNewSchemasByConnIdsController] Handling request",
        httpRequest
      );

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[ReadNewSchemasByConnIdsController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[ReadDiffSchemaCtxController] Authorization token is missing",
          httpRequest
        );
        const error = this.httpErrors.error_400(
          "Authorization token is missing"
        );
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[ReadNewSchemasByConnIdsController] Token:", token);

      //   3. Decode token
      const decoded = await this.decodeTokenAdapter.decodeToken(token);
      if (!decoded) {
        this.logger.error(
          "[ReadNewSchemasByConnIdsController] Invalid authorization token",
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
        "[ReadNewSchemasByConnIdsController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [],
      });

      if (!hasAuth) {
        this.logger.error(
          "[ReadNewSchemasByConnIdsController] User does not have the required roles",
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
          "[ReadNewSchemasByConnIdsController] No body provided",
          httpRequest
        );
        const error = this.httpErrors.error_400("No body provided");
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[ReadNewSchemasByConnIdsController] Received body:",
        httpRequest.body
      );

      const body = httpRequest.body;

      const response = await this.readNewSchemasByConnIdsUseCase.execute(body);

      if (!response.success) {
        this.logger.error(
          "[ReadNewSchemasByConnIdsController] Failed to read new schemas by connection ids:",
          response
        );
        const error = this.httpErrors.error_400(response.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "[ReadNewSchemasByConnIdsController] Read new schemas result:",
        response.data
      );

      const success = this.httpSuccess.success_201({
        message: response.message,
        data: response.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error(
        "[ReadNewSchemasByConnIdsController] Unexpected error:",
        err.message
      );
      const error = this.httpErrors.error_500(
        err.message || "Unexpected error"
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
