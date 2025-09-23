import { ICreateRoleAppUseCase } from "@/core/application/usecases/role/create-role.app.usecase.inter";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { TCreateRoleDto } from "@/core/application/dtos/role.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IAuthService } from "@/infrastructure/services/auth.infra.service";

export class CreateRoleController implements IController {
  constructor(
    private createRoleUseCase: ICreateRoleAppUseCase,
    private authService: IAuthService,
    private logger: ILogger,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    try {
      this.logger.info("CreateRoleController: Handling request", httpRequest);

      // Authenticate
      const headers = httpRequest.header as Record<string, string>;

      this.logger.info("CreateRoleController: Headers:", headers);

      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "CreateRoleController: No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      const token = authHeader.replace("Bearer ", "");

      this.logger.info("CreateRoleController: Token:", token);

      // Decode token
      const decodedToken = await this.authService.decodeToken(token);
      if (!decodedToken) {
        this.logger.error("CreateRoleController: Unauthorized", httpRequest);
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info("CreateRoleController: Decoded token:", decodedToken);

      // Retrieve roles
      const userRoles = await this.authService.getRolesNamesByUids(
        decodedToken.uid
      );

      this.logger.info("CreateRoleController: User roles:", userRoles);

      decodedToken.roles = userRoles;

      // Check body
      if (!httpRequest.body) {
        this.logger.error(
          "CreateRoleController: No body provided",
          httpRequest
        );
        const error = this.httpErrors.error_400();
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
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      this.logger.info("CreateRoleController: Validated body:", body);

      const response = await this.createRoleUseCase.execute(body, {
        uid: decodedToken.uid,
        roles: decodedToken.roles || [],
      });

      if (!response.success) {
        this.logger.error(
          "CreateRoleController: Failed to create role:",
          response
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, response.data);
      }

      this.logger.info("CreateRoleController: Created role:", response.data);

      const success = this.httpSuccess.success_201(response.data);
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("CreateRoleController: Unexpected error:", err);
      const error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
