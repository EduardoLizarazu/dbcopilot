import { ICreateRoleAppUseCase } from "@/core/application/usecases/interfaces/role/create-role.app.usecase.inter";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { TCreateRoleDto } from "@/core/application/dtos/role.domain.dto";

export class CreateRoleController implements IController {
  constructor(
    private createRoleUseCase: ICreateRoleAppUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    try {
      // Check body
      if (!httpRequest.body) {
        console.error("CreateRoleController: Missing body");
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      console.log("CreateRoleController: Received body:", httpRequest.body);

      const body = httpRequest.body as TCreateRoleDto;
      const bodyParams = Object.keys(body);
      const requiredParams = ["name", "description"];

      const missingParams = requiredParams.filter(
        (param) => !bodyParams.includes(param)
      );
      if (missingParams.length > 0) {
        console.error(
          "CreateRoleController: Missing parameters:",
          missingParams
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      console.log("CreateRoleController: Validated body:", body);

      const response = await this.createRoleUseCase.execute(body);

      if (!response.success) {
        console.error("CreateRoleController: Failed to create role:", response);
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, response.data);
      }

      console.log("CreateRoleController: Created role:", response.data);

      const success = this.httpSuccess.success_201(response.data);
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      console.error("CreateRoleController: Unexpected error:", err);
      const error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
