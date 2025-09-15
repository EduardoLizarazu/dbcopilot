import { IUpdateUserAppUseCase } from "@/core/application/usecases/interfaces/user/update-user.app.usecase.inter";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";
import { TUpdateUserDto } from "@/core/application/dtos/user.domain.dto";

export class UpdateUserController implements IController {
  constructor(
    private updateUserUseCase: IUpdateUserAppUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}
  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error: IHttpResponse | null = null;
    let response: IHttpResponse | null = null;
    try {
      if (!httpRequest.body) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const { body, path, query } = httpRequest;
      const bodyParams = Object.keys(body);
      const requiredParams = ["id", "email", "name", "roles"];
      for (const param of requiredParams) {
        if (!bodyParams.includes(param)) {
          error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }
      }

      if (!path || !(path as { id?: string }).id) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }

      const id = (path as { id: string }).id;
      const updateUserDto = body as TUpdateUserDto;
      const user = await this.updateUserUseCase.execute(id!, updateUserDto);
      if (!user.success) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      response = this.httpSuccess.success_200(user);
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      console.error(err);
      error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
