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
    let error: IHttpResponse | null = null;
    let response: IHttpResponse | null = null;
    try {
      // Check body
      if (!httpRequest.body) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      const body = httpRequest.body as TCreateRoleDto;
      const bodyParams = Object.keys(body);
      const requiredParams = ["name", "description"];

      const missingParams = requiredParams.filter(
        (param) => !bodyParams.includes(param)
      );
      if (missingParams.length > 0) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      const role = await this.createRoleUseCase.execute(body);

      if (!role.success) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      response = this.httpSuccess.success_201();
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      console.error(err);
      error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
