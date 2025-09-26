import { ICreateRoleAppUseCase } from "@/core/application/usecases/role/create-role.usecase";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { TCreateRoleDto } from "@/core/application/dtos/role.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpRequest } from "@/http/helpers/IHttpRequest.http";
import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { ROLE } from "@/http/utils/role.enum";

export class CreateRoleController implements IController {
  constructor(
    private readonly createRoleUseCase: ICreateRoleAppUseCase,
    private readonly accessRepo: IAuthorizationRepository,
    private readonly logger: ILogger,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: IHttpRequest<unknown>): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[CreateNlqQaController] Headers:", headers);
      //   2. Check authorization
      if (!httpRequest.auth) {
        return new HttpResponse(401, {
          success: false,
          message: "Unauthorized",
        });
      }
      //   4. Retrieve roles
      const roleNames = await this.accessRepo.findRolesNamesByUserId(
        httpRequest.auth.uid
      );
      this.logger.info(
        "[CreateNlqQaController] User roles names:",
        roleNames.roleNames
      );
      //   5. Check roles permissions
      const { hasAuth } = await this.accessRepo.hasRoles({
        ctxRoleNames: roleNames.roleNames,
        requiredRoleNames: [ROLE.ANALYST, ROLE.ADMIN],
      });
      if (!hasAuth) {
        this.logger.error("[CreateNlqQaController] User is not authorized");
        const error = this.httpErrors.error_401("User is not authorized");
        return new HttpResponse(error.statusCode, error.body);
      }

      //   ==== INPUT BODY ====
      // 1. Check body
      if (!httpRequest.body) {
        this.logger.error(
          "CreateRoleController: No body provided",
          httpRequest
        );
        const error = this.httpErrors.error_400(`No body provided`);
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info(
        "CreateRoleController: Received body:",
        httpRequest.body
      );

      const body = httpRequest.body as TCreateRoleDto;
      const bodyParams = Object.keys(body);
      const requiredParams = ["name", "description"];

      const missingParams = requiredParams.filter(
        (param) => !bodyParams.includes(param)
      );
      if (missingParams.length > 0) {
        this.logger.error(
          "CreateRoleController: Missing parameters:",
          missingParams
        );
        const error = this.httpErrors.error_400(
          `Missing parameters: ${missingParams.join(", ")}`
        );
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info("CreateRoleController: Validated body:", body);

      const response = await this.createRoleUseCase.execute({
        ...body,
        createdBy: httpRequest.auth.uid,
        updatedBy: httpRequest.auth.uid,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      if (!response.success) {
        this.logger.error(
          "CreateRoleController: Failed to create role:",
          response
        );
        const error = this.httpErrors.error_400(response.message);
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info("CreateRoleController: Created role:", response.data);

      const success = this.httpSuccess.success_201(response.data);
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("CreateRoleController: Unexpected error:", err);
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as Error).message
          : String(err);
      const error = this.httpErrors.error_500(
        `Unexpected error: ${errorMessage}`
      );
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
